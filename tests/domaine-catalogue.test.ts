import { describe, expect, it } from "vitest";
import {
  champsDe,
  codeAffiche,
  comparerNumeros,
  estUuid,
  validerAlbum,
  validerSection,
  validerSticker,
} from "@/domain/catalogue";

describe("validerAlbum", () => {
  it("accepte un album minimal", () => {
    expect(validerAlbum({ nom: "Pokémon 151" })).toEqual({
      ok: true,
      valeur: {
        nom: "Pokémon 151",
        editeur: null,
        description: null,
        annee: null,
        typeElement: "sticker",
      },
    });
  });

  it("accepte « carte » et refuse un type d'élément inconnu", () => {
    expect(validerAlbum({ nom: "A", typeElement: "carte" })).toMatchObject({
      valeur: { typeElement: "carte" },
    });
    expect(validerAlbum({ nom: "A", typeElement: "jeton" }).ok).toBe(false);
  });

  it("refuse un nom vide ou une année invalide", () => {
    expect(validerAlbum({ nom: "" }).ok).toBe(false);
    expect(validerAlbum({ nom: "A", annee: "1850" }).ok).toBe(false);
    expect(validerAlbum({ nom: "A", annee: "deux" }).ok).toBe(false);
    expect(validerAlbum({ nom: "A", annee: "2026" })).toMatchObject({
      valeur: { annee: 2026 },
    });
  });
});

describe("validerSection", () => {
  it("met le code en majuscules et rend le pays facultatif", () => {
    expect(
      validerSection({ code: "fra", nom: "France", paysCode: "fra" }),
    ).toEqual({
      ok: true,
      valeur: { code: "FRA", nom: "France", ordre: 0, paysCode: "FRA" },
    });
    expect(validerSection({ code: "FWC", nom: "FWC" })).toMatchObject({
      valeur: { paysCode: null },
    });
  });

  it("refuse un code avec espace, un ordre négatif ou un pays invalide", () => {
    expect(validerSection({ code: "FR A", nom: "x" }).ok).toBe(false);
    expect(validerSection({ code: "FRA", nom: "x", ordre: "-1" }).ok).toBe(
      false,
    );
    expect(validerSection({ code: "FRA", nom: "x", paysCode: "FR" }).ok).toBe(
      false,
    );
    expect(validerSection({ code: "FRA", nom: "" }).ok).toBe(false);
  });
});

describe("validerSticker", () => {
  it("accepte des numéros génériques (00, 4/102, LOB-001)", () => {
    for (const numero of ["00", "4/102", "LOB-001"]) {
      expect(validerSticker({ numero }).ok).toBe(true);
    }
    expect(validerSticker({ numero: "1", type: "Holo" })).toEqual({
      ok: true,
      valeur: { numero: "1", type: "holo", libelle: null },
    });
  });

  it("refuse un numéro vide ou avec espace et un type invalide", () => {
    expect(validerSticker({ numero: "" }).ok).toBe(false);
    expect(validerSticker({ numero: "1 2" }).ok).toBe(false);
    expect(validerSticker({ numero: "1", type: "très rare" }).ok).toBe(false);
  });
});

describe("utilitaires", () => {
  it("calcule le code affiché d'un sticker", () => {
    expect(codeAffiche("FRA", "1")).toBe("FRA1");
    expect(codeAffiche("PANINI", "00")).toBe("PANINI00");
  });

  it("trie les numéros dans l'ordre naturel", () => {
    expect(["10", "2", "1", "00"].sort(comparerNumeros)).toEqual([
      "00",
      "1",
      "2",
      "10",
    ]);
  });

  it("reconnaît un UUID", () => {
    expect(estUuid("3f2b8c1e-9a4d-4e2f-8b1a-0c9d8e7f6a5b")).toBe(true);
    expect(estUuid("abc")).toBe(false);
  });

  it("convertit un FormData en champs texte", () => {
    const fd = new FormData();
    fd.set("nom", "x");
    expect(champsDe(fd)).toEqual({ nom: "x" });
  });
});
