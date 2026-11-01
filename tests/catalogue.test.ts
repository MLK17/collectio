import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decoderCsv, lireCatalogue } from "@/import/catalogue";

const ENTETE = "section_code;numero;code_sticker;nom;type";

describe("lireCatalogue", () => {
  it("lit des lignes valides et normalise le type", () => {
    const lignes = lireCatalogue(
      `${ENTETE}\r\nFRA;1;FRA1;FRA;équipe\r\nFWC;19;FWC19;;FWC\r\nPANINI;00;PANINI00;;PANINI\r\n`,
    );
    expect(lignes).toEqual([
      { sectionCode: "FRA", numero: "1", code: "FRA1", type: "equipe" },
      { sectionCode: "FWC", numero: "19", code: "FWC19", type: "fwc" },
      { sectionCode: "PANINI", numero: "00", code: "PANINI00", type: "panini" },
    ]);
  });

  it("rejette un code transformé en date par Excel", () => {
    expect(() => lireCatalogue(`${ENTETE}\nMAR;1;mars-01;MAR;équipe`)).toThrow(
      /code "mars-01"/,
    );
  });

  it("rejette les doublons, types inconnus et en-têtes inattendus", () => {
    expect(() =>
      lireCatalogue(`${ENTETE}\nFRA;1;FRA1;;équipe\nFRA;1;FRA1;;équipe`),
    ).toThrow(/en double/);
    expect(() => lireCatalogue(`${ENTETE}\nFRA;1;FRA1;;joker`)).toThrow(
      /type inconnu/,
    );
    expect(() => lireCatalogue("a;b;c\nFRA;1;FRA1")).toThrow(/En-tête/);
  });

  it("décode l'UTF-8 et le Windows-1252", () => {
    expect(decoderCsv(new TextEncoder().encode("\uFEFFéquipe"))).toBe("équipe");
    expect(decoderCsv(Uint8Array.from([0xe9, 0x71]))).toBe("éq");
  });
});

describe("ressource/stickers.csv", () => {
  const lignes = lireCatalogue(
    decoderCsv(readFileSync("ressource/stickers.csv")),
  );

  it("contient 980 stickers : 48 équipes × 20, FWC1 à FWC19, PANINI00", () => {
    expect(lignes).toHaveLength(980);
    const parSection = new Map<string, number>();
    for (const l of lignes) {
      parSection.set(l.sectionCode, (parSection.get(l.sectionCode) ?? 0) + 1);
    }
    expect(parSection.size).toBe(50);
    expect(parSection.get("FWC")).toBe(19);
    expect(lignes.filter((l) => l.type === "panini")).toEqual([
      { sectionCode: "PANINI", numero: "00", code: "PANINI00", type: "panini" },
    ]);
    const equipes = [...parSection].filter(
      ([s]) => s !== "FWC" && s !== "PANINI",
    );
    expect(equipes).toHaveLength(48);
    expect(equipes.every(([, n]) => n === 20)).toBe(true);
  });
});
