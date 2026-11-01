import { Suspense } from "react";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { albums, stickers } from "@/db/schema";
import FormulaireAdmin from "@/components/FormulaireAdmin";
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
      annee: albums.annee,
      statut: albums.statut,
      nbStickers: count(stickers.id),
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
      {liste.length === 0 && <p>Aucun album.</p>}
      <ul>
        {liste.map((a) => (
          <li key={a.id}>
            <Link href={`/admin/albums/${a.id}`}>{a.nom}</Link>
            {a.annee && ` (${a.annee})`} : {a.nbStickers} stickers,{" "}
            {a.statut === "publie" ? "publié" : "brouillon"}
          </li>
        ))}
      </ul>

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
      </FormulaireAdmin>
    </main>
  );
}
