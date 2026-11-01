import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emailVerification,
  envoiEmailConfigure,
  envoyerEmail,
} from "@/email/envoyer";

describe("envoiEmailConfigure", () => {
  it("n'active la vérification que si la clé et l'expéditeur sont définis", () => {
    expect(envoiEmailConfigure({})).toBe(false);
    expect(envoiEmailConfigure({ RESEND_API_KEY: "cle" })).toBe(false);
    expect(envoiEmailConfigure({ EMAIL_EXPEDITEUR: "exp@exemple.fr" })).toBe(
      false,
    );
    expect(
      envoiEmailConfigure({
        RESEND_API_KEY: "cle",
        EMAIL_EXPEDITEUR: "exp@exemple.fr",
      }),
    ).toBe(true);
  });
});

const EMAIL = {
  a: "test@exemple.fr",
  sujet: "Sujet",
  html: "<p>h</p>",
  texte: "t",
};

describe("envoyerEmail", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("appelle l'API Resend avec la clé et l'expéditeur", async () => {
    vi.stubEnv("RESEND_API_KEY", "cle-test");
    vi.stubEnv("EMAIL_EXPEDITEUR", "Collectio <exp@exemple.fr>");
    const envoi = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await envoyerEmail(EMAIL, envoi);

    const [url, init] = envoi.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer cle-test");
    expect(JSON.parse(init.body)).toEqual({
      from: "Collectio <exp@exemple.fr>",
      to: ["test@exemple.fr"],
      subject: "Sujet",
      html: "<p>h</p>",
      text: "t",
    });
  });

  it("échoue si la configuration manque", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const envoi = vi.fn();
    await expect(envoyerEmail(EMAIL, envoi)).rejects.toThrow(/RESEND_API_KEY/);
    expect(envoi).not.toHaveBeenCalled();
  });

  it("échoue si Resend refuse l'envoi", async () => {
    vi.stubEnv("RESEND_API_KEY", "cle-test");
    vi.stubEnv("EMAIL_EXPEDITEUR", "exp@exemple.fr");
    const envoi = vi
      .fn()
      .mockResolvedValue(new Response("domaine non vérifié", { status: 403 }));
    await expect(envoyerEmail(EMAIL, envoi)).rejects.toThrow(/403/);
  });
});

describe("emailVerification", () => {
  it("contient le lien, échappé dans le HTML", () => {
    const { texte, html } = emailVerification("https://x.fr/v?a=1&b=2");
    expect(texte).toContain("https://x.fr/v?a=1&b=2");
    expect(html).toContain('href="https://x.fr/v?a=1&amp;b=2"');
  });
});
