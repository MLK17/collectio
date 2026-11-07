import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { paysCdm2026Panini as pays } from "../src/db/schema";

dotenv.config({ path: ".env.local" });

// 48 équipes de la Coupe du monde 2026 (codes FIFA).
const PAYS_CDM_2026: { code: string; nomFr: string }[] = [
  { code: "CAN", nomFr: "Canada" },
  { code: "MEX", nomFr: "Mexique" },
  { code: "USA", nomFr: "États-Unis" },
  { code: "AUS", nomFr: "Australie" },
  { code: "IRQ", nomFr: "Irak" },
  { code: "IRN", nomFr: "Iran" },
  { code: "JPN", nomFr: "Japon" },
  { code: "JOR", nomFr: "Jordanie" },
  { code: "KOR", nomFr: "Corée du Sud" },
  { code: "QAT", nomFr: "Qatar" },
  { code: "KSA", nomFr: "Arabie saoudite" },
  { code: "UZB", nomFr: "Ouzbékistan" },
  { code: "ALG", nomFr: "Algérie" },
  { code: "CPV", nomFr: "Cap-Vert" },
  { code: "COD", nomFr: "RD Congo" },
  { code: "CIV", nomFr: "Côte d'Ivoire" },
  { code: "EGY", nomFr: "Égypte" },
  { code: "GHA", nomFr: "Ghana" },
  { code: "MAR", nomFr: "Maroc" },
  { code: "SEN", nomFr: "Sénégal" },
  { code: "RSA", nomFr: "Afrique du Sud" },
  { code: "TUN", nomFr: "Tunisie" },
  { code: "CUW", nomFr: "Curaçao" },
  { code: "HAI", nomFr: "Haïti" },
  { code: "PAN", nomFr: "Panama" },
  { code: "ARG", nomFr: "Argentine" },
  { code: "BRA", nomFr: "Brésil" },
  { code: "COL", nomFr: "Colombie" },
  { code: "ECU", nomFr: "Équateur" },
  { code: "PAR", nomFr: "Paraguay" },
  { code: "URU", nomFr: "Uruguay" },
  { code: "NZL", nomFr: "Nouvelle-Zélande" },
  { code: "AUT", nomFr: "Autriche" },
  { code: "BEL", nomFr: "Belgique" },
  { code: "BIH", nomFr: "Bosnie-Herzégovine" },
  { code: "CRO", nomFr: "Croatie" },
  { code: "CZE", nomFr: "Tchéquie" },
  { code: "ENG", nomFr: "Angleterre" },
  { code: "FRA", nomFr: "France" },
  { code: "GER", nomFr: "Allemagne" },
  { code: "NED", nomFr: "Pays-Bas" },
  { code: "NOR", nomFr: "Norvège" },
  { code: "POR", nomFr: "Portugal" },
  { code: "SCO", nomFr: "Écosse" },
  { code: "ESP", nomFr: "Espagne" },
  { code: "SWE", nomFr: "Suède" },
  { code: "SUI", nomFr: "Suisse" },
  { code: "TUR", nomFr: "Turquie" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Échec : DATABASE_URL est absente de .env.local");
    process.exit(1);
  }

  const db = drizzle(neon(url));
  // Ne remplace jamais un pays existant : les corrections de l'admin sont conservées.
  const inseres = await db
    .insert(pays)
    .values(PAYS_CDM_2026)
    .onConflictDoNothing({ target: pays.code })
    .returning({ code: pays.code });

  console.log(
    `${inseres.length} pays ajoutés, ${PAYS_CDM_2026.length - inseres.length} déjà présents.`,
  );
}

main().catch((erreur) => {
  console.error("Échec :", erreur.message);
  process.exit(1);
});
