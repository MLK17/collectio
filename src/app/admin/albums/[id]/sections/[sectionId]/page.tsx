import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { albums, sections, stickers } from "@/db/schema";
import { estUuid } from "@/domain/catalogue";
import FormulaireAdmin from "@/components/FormulaireAdmin";
import {
  archiverSticker,
  creerSticker,
  modifierSticker,
  supprimerSection,
} from "../../../../actions";

function ChampsSticker({
  sticker,
}: {
  sticker?: {
    numero: string;
    libelle: string | null;
    type: string;
    ordre: number;
  };
}) {
  return (
    <>
      <input
        name="numero"
        defaultValue={sticker?.numero}
        placeholder="Numéro"
        required
        maxLength={20}
        style={{ width: "5rem" }}
      />
      <input
        name="libelle"
        defaultValue={sticker?.libelle ?? ""}
        placeholder="Libellé"
      />
      <input
        name="type"
        defaultValue={sticker?.type ?? "normal"}
        placeholder="Type"
        maxLength={30}
        style={{ width: "6rem" }}
      />
      <input
        name="ordre"
        type="number"
        min={0}
        defaultValue={sticker?.ordre ?? 0}
        aria-label="Ordre"
        style={{ width: "4.5rem" }}
      />
    </>
  );
}

type Props = {
  params: Promise<{ id: string; sectionId: string }>;
  searchParams: Promise<{ archives?: string }>;
};

export default function PageSection(props: Props) {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuSection {...props} />
    </Suspense>
  );
}

async function ContenuSection({ params, searchParams }: Props) {
  const { id, sectionId } = await params;
  if (!estUuid(id) || !estUuid(sectionId)) notFound();
  const avecArchives = (await searchParams).archives === "1";

  const [resultat] = await db
    .select({ section: sections, album: albums })
    .from(sections)
    .innerJoin(albums, eq(albums.id, sections.albumId))
    .where(and(eq(sections.id, sectionId), eq(sections.albumId, id)));
  if (!resultat) notFound();
  const { section, album } = resultat;

  const liste = await db
    .select()
    .from(stickers)
    .where(
      and(
        eq(stickers.sectionId, sectionId),
        avecArchives ? undefined : isNull(stickers.archiveLe),
      ),
    )
    .orderBy(asc(stickers.ordre), asc(stickers.numero));

  return (
    <main>
      <p>
        <Link href={`/admin/albums/${id}`}>← {album.nom}</Link>
      </p>
      <h1>
        Section {section.code} : {section.nom}
      </h1>
      <p>
        {avecArchives ? (
          <Link href={`/admin/albums/${id}/sections/${sectionId}`}>
            Masquer les stickers archivés
          </Link>
        ) : (
          <Link href={`/admin/albums/${id}/sections/${sectionId}?archives=1`}>
            Afficher aussi les stickers archivés
          </Link>
        )}
      </p>

      <h2>Stickers ({liste.length})</h2>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {liste.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              opacity: s.archiveLe ? 0.5 : 1,
            }}
          >
            <code style={{ width: "6rem" }}>{s.code}</code>
            <FormulaireAdmin
              action={modifierSticker.bind(null, id, sectionId, s.id)}
              libelle="Enregistrer"
            >
              <ChampsSticker sticker={s} />
            </FormulaireAdmin>
            <FormulaireAdmin
              action={archiverSticker.bind(null, sectionId, s.id, !s.archiveLe)}
              libelle={s.archiveLe ? "Désarchiver" : "Archiver"}
            />
          </div>
        ))}
      </div>

      <h3>Nouveau sticker</h3>
      <p>Le code est calculé automatiquement : {section.code} + numéro.</p>
      <FormulaireAdmin
        action={creerSticker.bind(null, id, sectionId)}
        libelle="Ajouter"
      >
        <ChampsSticker />
      </FormulaireAdmin>

      {album.statut === "brouillon" && (
        <>
          <h3>Supprimer la section</h3>
          <FormulaireAdmin
            action={supprimerSection.bind(null, id, sectionId)}
            libelle="Supprimer la section"
            confirmation={`Supprimer définitivement la section ${section.code} et ses stickers ?`}
          />
        </>
      )}
    </main>
  );
}
