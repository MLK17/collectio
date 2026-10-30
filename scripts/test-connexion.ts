import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Échec : DATABASE_URL est absente de .env.local");
    process.exit(1);
  }

  const sql = neon(url);
  const resultat = await sql`select 1 as ok`;
  console.log("Connexion OK", resultat);
}

main().catch((erreur) => {
  console.error("Échec :", erreur.message);
  process.exit(1);
});
