"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdministrateur } from "@/auth/session";
import { db } from "@/db";
import {
  albums,
  collectionStickers,
  collections,
  pays,
  sections,
  stickers,
} from "@/db/schema";
import {
  champsDe,
  codeSticker,
  estUuid,
  validerAlbum,
  validerPays,
  validerSection,
  validerSticker,
} from "@/domain/catalogue";
import type { EtatFormulaire } from "@/components/FormulaireAdmin";

const DOUBLON_SECTION = "Ce code de section existe déjà dans l'album.";
const DOUBLON_STICKER =
  "Ce numéro existe déjà dans la section, ou ce code dans l'album.";

function estDoublon(erreur: unknown) {
  const e = erreur as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

function rafraichir() {
  revalidatePath("/admin", "layout");
}

function verifierIds(...ids: string[]) {
  if (!ids.every(estUuid)) throw new Error("Identifiant invalide");
}

async function albumBrouillonSansCollection(albumId: string) {
  const [album] = await db
    .select({ statut: albums.statut })
    .from(albums)
    .where(eq(albums.id, albumId));
  if (!album) return "Album introuvable.";
  if (album.statut !== "brouillon") {
    return "Suppression impossible : l'album est publié.";
  }
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(collections)
    .where(eq(collections.albumId, albumId));
  return n > 0
    ? "Suppression impossible : l'album a des collectionneurs."
    : null;
}

/* Pays */

export async function modifierPays(
  code: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  const r = validerPays(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  await db
    .update(pays)
    .set({ ...r.valeur, modifieLe: new Date() })
    .where(eq(pays.code, code));
  rafraichir();
  return { ok: true };
}

/* Albums */

export async function creerAlbum(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  const r = validerAlbum(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  const [album] = await db
    .insert(albums)
    .values({ ...r.valeur, statut: "brouillon" })
    .returning({ id: albums.id });
  rafraichir();
  redirect(`/admin/albums/${album.id}`);
}

export async function modifierAlbum(
  albumId: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId);
  const r = validerAlbum(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  await db
    .update(albums)
    .set({ ...r.valeur, modifieLe: new Date() })
    .where(eq(albums.id, albumId));
  rafraichir();
  return { ok: true };
}

export async function changerStatutAlbum(
  albumId: string,
  statut: "brouillon" | "publie",
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId);
  await db
    .update(albums)
    .set({ statut, modifieLe: new Date() })
    .where(eq(albums.id, albumId));
  rafraichir();
  return null;
}

export async function supprimerAlbum(albumId: string): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId);
  const refus = await albumBrouillonSansCollection(albumId);
  if (refus) return { erreur: refus };
  await db.batch([
    db.delete(stickers).where(eq(stickers.albumId, albumId)),
    db.delete(sections).where(eq(sections.albumId, albumId)),
    db.delete(albums).where(eq(albums.id, albumId)),
  ]);
  rafraichir();
  redirect("/admin/albums");
}

/* Sections */

export async function creerSection(
  albumId: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId);
  const r = validerSection(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  try {
    await db.insert(sections).values({ ...r.valeur, albumId });
  } catch (e) {
    if (estDoublon(e)) return { erreur: DOUBLON_SECTION };
    throw e;
  }
  rafraichir();
  return { ok: true };
}

export async function modifierSection(
  albumId: string,
  sectionId: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId, sectionId);
  const r = validerSection(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  try {
    await db.batch([
      db
        .update(sections)
        .set(r.valeur)
        .where(and(eq(sections.id, sectionId), eq(sections.albumId, albumId))),
      db
        .update(stickers)
        .set({ code: sql`${r.valeur.code}::text || ${stickers.numero}` })
        .where(eq(stickers.sectionId, sectionId)),
    ]);
  } catch (e) {
    if (estDoublon(e)) return { erreur: DOUBLON_SECTION };
    throw e;
  }
  rafraichir();
  return { ok: true };
}

export async function supprimerSection(
  albumId: string,
  sectionId: string,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId, sectionId);
  const refus = await albumBrouillonSansCollection(albumId);
  if (refus) return { erreur: refus };
  const idsStickers = db
    .select({ id: stickers.id })
    .from(stickers)
    .where(eq(stickers.sectionId, sectionId));
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(collectionStickers)
    .where(inArray(collectionStickers.stickerId, idsStickers));
  if (n > 0)
    return { erreur: "Suppression impossible : stickers déjà collectionnés." };
  await db.batch([
    db.delete(stickers).where(eq(stickers.sectionId, sectionId)),
    db
      .delete(sections)
      .where(and(eq(sections.id, sectionId), eq(sections.albumId, albumId))),
  ]);
  rafraichir();
  redirect(`/admin/albums/${albumId}`);
}

/* Stickers */

async function codeDeSection(albumId: string, sectionId: string) {
  const [section] = await db
    .select({ code: sections.code })
    .from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.albumId, albumId)));
  return section?.code;
}

export async function creerSticker(
  albumId: string,
  sectionId: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId, sectionId);
  const r = validerSticker(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  const codeSection = await codeDeSection(albumId, sectionId);
  if (!codeSection) return { erreur: "Section introuvable." };
  try {
    await db.insert(stickers).values({
      ...r.valeur,
      albumId,
      sectionId,
      code: codeSticker(codeSection, r.valeur.numero),
    });
  } catch (e) {
    if (estDoublon(e)) return { erreur: DOUBLON_STICKER };
    throw e;
  }
  rafraichir();
  return { ok: true };
}

export async function modifierSticker(
  albumId: string,
  sectionId: string,
  stickerId: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(albumId, sectionId, stickerId);
  const r = validerSticker(champsDe(formData));
  if (!r.ok) return { erreur: r.erreur };
  const codeSection = await codeDeSection(albumId, sectionId);
  if (!codeSection) return { erreur: "Section introuvable." };
  try {
    await db
      .update(stickers)
      .set({ ...r.valeur, code: codeSticker(codeSection, r.valeur.numero) })
      .where(
        and(eq(stickers.id, stickerId), eq(stickers.sectionId, sectionId)),
      );
  } catch (e) {
    if (estDoublon(e)) return { erreur: DOUBLON_STICKER };
    throw e;
  }
  rafraichir();
  return { ok: true };
}

export async function archiverSticker(
  sectionId: string,
  stickerId: string,
  archiver: boolean,
): Promise<EtatFormulaire> {
  await exigerAdministrateur();
  verifierIds(sectionId, stickerId);
  await db
    .update(stickers)
    .set({ archiveLe: archiver ? new Date() : null })
    .where(and(eq(stickers.id, stickerId), eq(stickers.sectionId, sectionId)));
  rafraichir();
  return null;
}
