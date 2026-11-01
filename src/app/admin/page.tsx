import { Suspense } from "react";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { albums, pays } from "@/db/schema";

export default function PageAdmin() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuAdmin />
    </Suspense>
  );
}

async function ContenuAdmin() {
  const [[{ nonRelus }], [{ nbAlbums }]] = await Promise.all([
    db
      .select({ nonRelus: sql<number>`count(*)::int` })
      .from(pays)
      .where(eq(pays.relu, false)),
    db.select({ nbAlbums: sql<number>`count(*)::int` }).from(albums),
  ]);

  return (
    <main>
      <h1>Tableau de bord administrateur</h1>
      <ul>
        <li>
          <Link href="/admin/albums">Albums</Link> ({nbAlbums})
        </li>
        <li>
          <Link href="/admin/pays">Pays</Link>
          {nonRelus > 0 && (
            <>
              {" "}
              :{" "}
              <Link href="/admin/pays?filtre=non-relus">
                {nonRelus} à relire
              </Link>
            </>
          )}
        </li>
      </ul>
    </main>
  );
}
