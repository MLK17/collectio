export type Champs = Record<string, string | undefined>;
export type Resultat<T> =
  { ok: true; valeur: T } | { ok: false; erreur: string };

const ok = <T>(valeur: T): Resultat<T> => ({ ok: true, valeur });
const echec = (erreur: string): Resultat<never> => ({ ok: false, erreur });
const lire = (champs: Champs, cle: string) => (champs[cle] ?? "").trim();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const estUuid = (v: string) => UUID.test(v);

/** Convertit un FormData en champs texte (les fichiers sont ignorés). */
export function champsDe(formData: FormData): Champs {
  const champs: Champs = {};
  formData.forEach((v, k) => {
    if (typeof v === "string") champs[k] = v;
  });
  return champs;
}

function entierPositif(valeur: string, defaut: number): number | null {
  if (valeur === "") return defaut;
  return /^\d+$/.test(valeur) ? Number(valeur) : null;
}

export function validerAlbum(champs: Champs) {
  const nom = lire(champs, "nom");
  if (!nom) return echec("Le nom de l'album est obligatoire.");
  if (nom.length > 200) return echec("Le nom de l'album est trop long.");
  const anneeBrute = lire(champs, "annee");
  const annee = anneeBrute === "" ? null : Number(anneeBrute);
  if (
    annee !== null &&
    !(Number.isInteger(annee) && annee >= 1900 && annee <= 2100)
  ) {
    return echec("L'année doit être comprise entre 1900 et 2100.");
  }
  return ok({
    nom,
    editeur: lire(champs, "editeur") || null,
    description: lire(champs, "description") || null,
    annee,
  });
}

export function validerSection(champs: Champs) {
  const code = lire(champs, "code").toUpperCase();
  if (!/^[A-Z0-9]{1,20}$/.test(code)) {
    return echec(
      "Le code de section doit contenir 1 à 20 lettres ou chiffres, sans espace.",
    );
  }
  const nom = lire(champs, "nom");
  if (!nom) return echec("Le nom de la section est obligatoire.");
  const ordre = entierPositif(lire(champs, "ordre"), 0);
  if (ordre === null) return echec("L'ordre doit être un entier positif.");
  const paysCode = lire(champs, "paysCode").toUpperCase() || null;
  if (paysCode !== null && !/^[A-Z]{3}$/.test(paysCode)) {
    return echec("Le code pays doit contenir 3 lettres.");
  }
  return ok({ code, nom, ordre, paysCode });
}

export function validerSticker(champs: Champs) {
  const numero = lire(champs, "numero");
  if (!/^\S{1,20}$/.test(numero)) {
    return echec(
      "Le numéro est obligatoire, sans espace, 20 caractères maximum.",
    );
  }
  const type = lire(champs, "type").toLowerCase() || "normal";
  if (!/^[a-z0-9_-]{1,30}$/.test(type)) {
    return echec("Le type ne doit contenir que des lettres, chiffres, - ou _.");
  }
  const ordre = entierPositif(lire(champs, "ordre"), 0);
  if (ordre === null) return echec("L'ordre doit être un entier positif.");
  return ok({ numero, type, ordre, libelle: lire(champs, "libelle") || null });
}

export const codeSticker = (codeSection: string, numero: string) =>
  `${codeSection}${numero}`;
