import { Suspense } from "react";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { albums } from "@/db/schema";

export default function PageAdmin() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuAdmin />
    </Suspense>
  );
}

async function ContenuAdmin() {
  const [{ nbAlbums }] = await db
    .select({ nbAlbums: sql<number>`count(*)::int` })
    .from(albums);

  return (
    <main>
      <h1>Tableau de bord administrateur</h1>
      <ul>
        <li>
          <Link href="/admin/albums">Albums</Link> ({nbAlbums})
        </li>
      </ul>
    </main>
  );
}
