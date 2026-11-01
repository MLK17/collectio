import { readFileSync } from "node:fs";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { albums, pays, sections, stickers } from "../src/db/schema";
import { decoderCsv, lireCatalogue } from "../src/import/catalogue";

dotenv.config({ path: ".env.local" });

const FICHIER = "ressource/stickers.csv";
const ALBUM = { nom: "Coupe du monde 2026", editeur: "Panini", annee: 2026 };
const SECTIONS_SPECIALES = ["PANINI", "FWC"];
const TOTAL_ATTENDU = 980;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Échec : DATABASE_URL est absente de .env.local");
    process.exit(1);
  }

  const lignes = lireCatalogue(decoderCsv(readFileSync(FICHIER)));
  if (lignes.length !== TOTAL_ATTENDU) {
    throw new Error(`${lignes.length} stickers au lieu de ${TOTAL_ATTENDU}`);
  }

  const db = drizzle(neon(url));

  // Ordre : sections spéciales d'abord, puis les équipes dans l'ordre du fichier.
  const codesSections = [
    ...SECTIONS_SPECIALES,
    ...new Set(
      lignes
        .map((l) => l.sectionCode)
        .filter((c) => !SECTIONS_SPECIALES.includes(c)),
    ),
  ];

  const nomsPays = new Map(
    (await db.select().from(pays)).map((p) => [p.code, p.nomFr]),
  );
  const inconnus = codesSections.filter(
    (c) => !SECTIONS_SPECIALES.includes(c) && !nomsPays.has(c),
  );
  if (inconnus.length > 0) {
    throw new Error(
      `Pays absents de la table pays (lancer npm run db:pays) : ${inconnus.join(", ")}`,
    );
  }

  // Ne remplace jamais l'existant : album, sections et stickers déjà présents sont conservés.
  let [album] = await db
    .select({ id: albums.id })
    .from(albums)
    .where(and(eq(albums.nom, ALBUM.nom), eq(albums.annee, ALBUM.annee)));
  if (!album) {
    [album] = await db
      .insert(albums)
      .values({ ...ALBUM, statut: "brouillon" })
      .returning({ id: albums.id });
  }

  const sectionsAjoutees = await db
    .insert(sections)
    .values(
      codesSections.map((code, ordre) => {
        const estEquipe = !SECTIONS_SPECIALES.includes(code);
        return {
          albumId: album.id,
          code,
          nom: estEquipe ? nomsPays.get(code)! : code,
          paysCode: estEquipe ? code : null,
          ordre,
        };
      }),
    )
    .onConflictDoNothing({ target: [sections.albumId, sections.code] })
    .returning({ id: sections.id });

  const idsSections = new Map(
    (
      await db
        .select({ id: sections.id, code: sections.code })
        .from(sections)
        .where(eq(sections.albumId, album.id))
    ).map((s) => [s.code, s.id]),
  );

  const positions = new Map<string, number>();
  const stickersAjoutes = await db
    .insert(stickers)
    .values(
      lignes.map((l) => {
        const ordre = (positions.get(l.sectionCode) ?? 0) + 1;
        positions.set(l.sectionCode, ordre);
        return {
          albumId: album.id,
          sectionId: idsSections.get(l.sectionCode)!,
          numero: l.numero,
          code: l.code,
          type: l.type,
          ordre,
        };
      }),
    )
    .onConflictDoNothing({ target: [stickers.albumId, stickers.code] })
    .returning({ id: stickers.id });

  console.log(
    `Album « ${ALBUM.nom} » : ${sectionsAjoutees.length}/${codesSections.length} sections et ` +
      `${stickersAjoutes.length}/${lignes.length} stickers ajoutés (le reste existait déjà).`,
  );
}

main().catch((erreur) => {
  console.error("Échec :", erreur.message);
  process.exit(1);
});
