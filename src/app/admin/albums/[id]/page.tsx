import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  albums,
  paysCdm2026Panini as pays,
  sections,
  stickers,
} from "@/db/schema";
import { estUuid } from "@/domain/catalogue";
import FormulaireAdmin from "@/components/FormulaireAdmin";
import ChoixTypeElement, {
  LIBELLES_TYPE_ELEMENT,
} from "@/components/ChoixTypeElement";
import {
  changerStatutAlbum,
  creerSection,
  modifierAlbum,
  modifierSection,
  supprimerAlbum,
} from "../../actions";

function ChampsSection({
  section,
  listePays,
}: {
  section?: {
    code: string;
    nom: string;
    ordre: number;
    paysCode: string | null;
  };
  listePays: { code: string; nomFr: string }[];
}) {
  return (
    <>
      <input
        name="code"
        defaultValue={section?.code}
        placeholder="Code"
        required
        maxLength={20}
        style={{ width: "6rem" }}
      />
      <input
        name="nom"
        defaultValue={section?.nom}
        placeholder="Nom"
        required
      />
      <input
        name="ordre"
        type="number"
        min={0}
        defaultValue={section?.ordre ?? 0}
        aria-label="Ordre"
        style={{ width: "4.5rem" }}
      />
      <select
        name="paysCode"
        defaultValue={section?.paysCode ?? ""}
        aria-label="Pays"
      >
        <option value="">Sans pays</option>
        {listePays.map((p) => (
          <option key={p.code} value={p.code}>
            {p.nomFr} ({p.code})
          </option>
        ))}
      </select>
    </>
  );
}

type Props = { params: Promise<{ id: string }> };

export default function PageAlbum(props: Props) {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuAlbum {...props} />
    </Suspense>
  );
}

async function ContenuAlbum({ params }: Props) {
  const { id } = await params;
  if (!estUuid(id)) notFound();
  const [album] = await db.select().from(albums).where(eq(albums.id, id));
  if (!album) notFound();

  const [listeSections, listePays] = await Promise.all([
    db
      .select({
        id: sections.id,
        code: sections.code,
        nom: sections.nom,
        ordre: sections.ordre,
        paysCode: sections.paysCode,
        nbStickers: count(stickers.id),
      })
      .from(sections)
      .leftJoin(stickers, eq(stickers.sectionId, sections.id))
      .where(eq(sections.albumId, id))
      .groupBy(sections.id)
      .orderBy(asc(sections.ordre), asc(sections.code)),
    db
      .select({ code: pays.code, nomFr: pays.nomFr })
      .from(pays)
      .orderBy(asc(pays.nomFr)),
  ]);
  const brouillon = album.statut === "brouillon";
  const elements = LIBELLES_TYPE_ELEMENT[album.typeElement].toLowerCase();

  return (
    <main>
      <p>
        <Link href="/admin/albums">← Albums</Link>
      </p>
      <h1>{album.nom}</h1>

      <h2>Informations</h2>
      <FormulaireAdmin
        action={modifierAlbum.bind(null, id)}
        libelle="Enregistrer"
      >
        <input name="nom" defaultValue={album.nom} required maxLength={200} />
        <input
          name="editeur"
          defaultValue={album.editeur ?? ""}
          placeholder="Éditeur"
        />
        <input
          name="annee"
          type="number"
          min={1900}
          max={2100}
          defaultValue={album.annee ?? ""}
          placeholder="Année"
        />
        <input
          name="description"
          defaultValue={album.description ?? ""}
          placeholder="Description"
        />
        <ChoixTypeElement valeur={album.typeElement} />
      </FormulaireAdmin>

      <p>
        Statut : <strong>{brouillon ? "brouillon" : "publié"}</strong>
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <FormulaireAdmin
          action={changerStatutAlbum.bind(
            null,
            id,
            brouillon ? "publie" : "brouillon",
          )}
          libelle={brouillon ? "Publier" : "Repasser en brouillon"}
        />
        {brouillon && (
          <FormulaireAdmin
            action={supprimerAlbum.bind(null, id)}
            libelle="Supprimer l'album"
            confirmation={`Supprimer définitivement « ${album.nom} », ses sections et ses ${elements} ?`}
          />
        )}
      </div>

      <h2>Sections ({listeSections.length})</h2>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {listeSections.map((s) => (
          <div
            key={s.id}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <FormulaireAdmin
              action={modifierSection.bind(null, id, s.id)}
              libelle="Enregistrer"
            >
              <ChampsSection section={s} listePays={listePays} />
            </FormulaireAdmin>
            <Link href={`/admin/albums/${id}/sections/${s.id}`}>
              {s.nbStickers} {elements} →
            </Link>
          </div>
        ))}
      </div>

      <h3>Nouvelle section</h3>
      <FormulaireAdmin action={creerSection.bind(null, id)} libelle="Ajouter">
        <ChampsSection listePays={listePays} />
      </FormulaireAdmin>
    </main>
  );
}
