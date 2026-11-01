import { Suspense } from "react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pays } from "@/db/schema";
import FormulaireAdmin from "@/components/FormulaireAdmin";
import { modifierPays } from "../actions";

type Props = { searchParams: Promise<{ filtre?: string }> };

export default function PagePays(props: Props) {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ContenuPays {...props} />
    </Suspense>
  );
}

async function ContenuPays({ searchParams }: Props) {
  const nonRelusSeulement = (await searchParams).filtre === "non-relus";
  const liste = await db
    .select()
    .from(pays)
    .where(nonRelusSeulement ? eq(pays.relu, false) : undefined)
    .orderBy(asc(pays.nomFr));

  return (
    <main>
      <p>
        <Link href="/admin">← Tableau de bord</Link>
      </p>
      <h1>Pays</h1>
      <p>
        {nonRelusSeulement ? (
          <Link href="/admin/pays">Afficher tous les pays</Link>
        ) : (
          <Link href="/admin/pays?filtre=non-relus">
            Afficher uniquement les pays non relus
          </Link>
        )}
      </p>
      {liste.length === 0 && <p>Aucun pays à afficher.</p>}
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {liste.map((p) => (
          <FormulaireAdmin
            key={p.code}
            action={modifierPays.bind(null, p.code)}
            libelle="Enregistrer"
          >
            <code style={{ width: "3.5rem" }}>{p.code}</code>
            <input
              name="nomFr"
              defaultValue={p.nomFr}
              required
              maxLength={100}
              aria-label={`Nom français de ${p.code}`}
            />
            <label>
              <input type="checkbox" name="relu" defaultChecked={p.relu} /> relu
            </label>
          </FormulaireAdmin>
        ))}
      </div>
    </main>
  );
}
