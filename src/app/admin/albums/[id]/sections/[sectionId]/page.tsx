import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { albums, sections, stickers } from "@/db/schema";
import { codeAffiche, comparerNumeros, estUuid } from "@/domain/catalogue";
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

  const liste = (
    await db
      .select()
      .from(stickers)
      .where(
        and(
          eq(stickers.sectionId, sectionId),
          avecArchives ? undefined : isNull(stickers.archiveLe),
        ),
      )
  ).sort((a, b) => comparerNumeros(a.numero, b.numero));
  const elements = album.typeElement === "carte" ? "cartes" : "stickers";

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
            Masquer les {elements} archivés
          </Link>
        ) : (
          <Link href={`/admin/albums/${id}/sections/${sectionId}?archives=1`}>
            Afficher aussi les {elements} archivés
          </Link>
        )}
      </p>

      <h2>
        {elements === "cartes" ? "Cartes" : "Stickers"} ({liste.length})
      </h2>
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
            <code style={{ width: "6rem" }}>
              {codeAffiche(section.code, s.numero)}
            </code>
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

      <h3>Ajouter {elements === "cartes" ? "une carte" : "un sticker"}</h3>
      <p>
        Code affiché : {section.code} + numéro (ex. {section.code}1).
      </p>
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
            confirmation={`Supprimer définitivement la section ${section.code} et ses ${elements} ?`}
          />
        </>
      )}
    </main>
  );
}
