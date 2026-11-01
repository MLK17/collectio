export type TypeSticker = "equipe" | "fwc" | "panini";

export type LigneCatalogue = {
  sectionCode: string;
  numero: string;
  code: string;
  type: TypeSticker;
};

const ENTETE = ["section_code", "numero", "code_sticker", "nom", "type"];

const TYPES: Record<string, TypeSticker> = {
  équipe: "equipe",
  fwc: "fwc",
  panini: "panini",
};

/** Décode un CSV en UTF-8, ou en Windows-1252 (export Excel) à défaut. */
export function decoderCsv(octets: Uint8Array): string {
  let texte: string;
  try {
    texte = new TextDecoder("utf-8", { fatal: true }).decode(octets);
  } catch {
    texte = new TextDecoder("windows-1252").decode(octets);
  }
  return texte.replace(/^\uFEFF/, "");
}

/** Lit et valide le catalogue. Lève une erreur listant toutes les anomalies. */
export function lireCatalogue(texte: string): LigneCatalogue[] {
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim() !== "");
  const entete = (lignes.shift() ?? "").split(";").map((c) => c.trim());
  if (entete.join(";") !== ENTETE.join(";")) {
    throw new Error(`En-tête inattendu : ${entete.join(";")}`);
  }

  const erreurs: string[] = [];
  const codes = new Set<string>();
  const resultat: LigneCatalogue[] = [];

  lignes.forEach((brute, i) => {
    const n = i + 2;
    const cols = brute.split(";").map((c) => c.trim());
    if (cols.length !== ENTETE.length) {
      erreurs.push(`ligne ${n} : ${cols.length} colonnes au lieu de 5`);
      return;
    }
    const [sectionCode, numero, code, , typeBrut] = cols;
    const type = TYPES[typeBrut.toLowerCase()];
    if (!sectionCode || !numero)
      erreurs.push(`ligne ${n} : section ou numéro vide`);
    if (code !== sectionCode + numero) {
      erreurs.push(`ligne ${n} : code "${code}" ≠ "${sectionCode}${numero}"`);
    }
    if (!type) erreurs.push(`ligne ${n} : type inconnu "${typeBrut}"`);
    if (codes.has(code)) erreurs.push(`ligne ${n} : code "${code}" en double`);
    codes.add(code);
    resultat.push({ sectionCode, numero, code, type });
  });

  if (erreurs.length > 0) {
    throw new Error(`Catalogue invalide :\n- ${erreurs.join("\n- ")}`);
  }
  return resultat;
}
