import { Suspense } from "react";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { albums, stickers } from "@/db/schema";
import FormulaireAdmin from "@/components/FormulaireAdmin";
import ChoixTypeElement, {
  LIBELLES_TYPE_ELEMENT,
} from "@/components/ChoixTypeElement";
import { creerAlbum } from "../actions";

export default function PageAlbums() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuAlbums />
    </Suspense>
  );
}

async function ContenuAlbums() {
  const liste = await db
    .select({
      id: albums.id,
      nom: albums.nom,
      editeur: albums.editeur,
      annee: albums.annee,
      statut: albums.statut,
      typeElement: albums.typeElement,
      nbElements: count(stickers.id),
    })
    .from(albums)
    .leftJoin(stickers, eq(stickers.albumId, albums.id))
    .groupBy(albums.id)
    .orderBy(asc(albums.nom));

  return (
    <main>
      <p>
        <Link href="/admin">← Tableau de bord</Link>
      </p>
      <h1>Albums</h1>
      {liste.length === 0 ? (
        <p>Aucun album.</p>
      ) : (
        <table cellPadding={6}>
          <thead>
            <tr>
              <th align="left">Nom</th>
              <th align="left">Éditeur</th>
              <th align="left">Année</th>
              <th align="left">Type</th>
              <th align="right">Nombre</th>
              <th align="left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/albums/${a.id}`}>{a.nom}</Link>
                </td>
                <td>{a.editeur}</td>
                <td>{a.annee}</td>
                <td>{LIBELLES_TYPE_ELEMENT[a.typeElement]}</td>
                <td align="right">{a.nbElements}</td>
                <td>{a.statut === "publie" ? "publié" : "brouillon"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Nouvel album</h2>
      <FormulaireAdmin action={creerAlbum} libelle="Créer l'album">
        <input name="nom" placeholder="Nom" required maxLength={200} />
        <input name="editeur" placeholder="Éditeur" />
        <input
          name="annee"
          type="number"
          min={1900}
          max={2100}
          placeholder="Année"
        />
        <input name="description" placeholder="Description" />
        <ChoixTypeElement />
      </FormulaireAdmin>
    </main>
  );
}
