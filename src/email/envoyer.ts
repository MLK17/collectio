type Email = { a: string; sujet: string; html: string; texte: string };

/** Vrai si l'envoi d'e-mails est configuré : active la vérification de l'e-mail. */
export function envoiEmailConfigure(
  env: Record<string, string | undefined> = process.env,
) {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_EXPEDITEUR);
}

/** Envoie un e-mail via l'API REST de Resend. Variables lues à l'envoi uniquement. */
export async function envoyerEmail(
  { a, sujet, html, texte }: Email,
  envoi: typeof fetch = fetch,
) {
  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR;
  if (!cle || !expediteur) {
    throw new Error(
      "RESEND_API_KEY ou EMAIL_EXPEDITEUR absente des variables d'environnement",
    );
  }

  const reponse = await envoi("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: expediteur,
      to: [a],
      subject: sujet,
      html,
      text: texte,
    }),
  });
  if (!reponse.ok) {
    throw new Error(
      `Resend a refusé l'envoi (${reponse.status}) : ${await reponse.text()}`,
    );
  }
}

const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function emailVerification(url: string) {
  return {
    sujet: "Collectio : confirme ton adresse e-mail",
    texte: `Bienvenue sur Collectio !\n\nConfirme ton adresse e-mail en ouvrant ce lien (valable 1 heure) :\n${url}\n\nSi tu n'es pas à l'origine de cette inscription, ignore cet e-mail.`,
    html: `<p>Bienvenue sur Collectio !</p><p><a href="${echapper(url)}">Confirmer mon adresse e-mail</a> (lien valable 1 heure).</p><p>Si tu n'es pas à l'origine de cette inscription, ignore cet e-mail.</p>`,
  };
}
