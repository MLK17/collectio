"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/auth/client";

const RETOUR_VERIFICATION = "/connexion?verifie=1";

function BandeauVerification() {
  const params = useSearchParams();
  if (params.get("verifie") !== "1") return null;
  const erreur = params.get("error");
  if (!erreur) {
    return (
      <p role="status" style={{ color: "green" }}>
        Adresse e-mail vérifiée : tu peux te connecter.
      </p>
    );
  }
  return (
    <p role="alert" style={{ color: "crimson" }}>
      {erreur === "TOKEN_EXPIRED"
        ? "Ce lien a expiré. Connecte-toi pour en recevoir un nouveau."
        : "Ce lien de vérification est invalide."}
    </p>
  );
}

export default function PageConnexion() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [emailNonVerifie, setEmailNonVerifie] = useState<string | null>(null);
  const [renvoi, setRenvoi] = useState<"envoye" | "echec" | null>(null);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEmailNonVerifie(null);
    setRenvoi(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const motDePasse = String(form.get("motDePasse") ?? "");

    setEnCours(true);
    const { error } = await authClient.signIn.email({
      email,
      password: motDePasse,
    });
    setEnCours(false);

    if (error?.code === "EMAIL_NOT_VERIFIED") {
      setEmailNonVerifie(email);
      return;
    }
    if (error) {
      // message volontairement générique : ne pas révéler si l'e-mail existe
      setErreur("Adresse e-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function renvoyer() {
    if (!emailNonVerifie) return;
    const { error } = await authClient.sendVerificationEmail({
      email: emailNonVerifie,
      callbackURL: RETOUR_VERIFICATION,
    });
    setRenvoi(error ? "echec" : "envoye");
  }

  return (
    <main style={{ maxWidth: 380, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Connexion</h1>
      <Suspense fallback={null}>
        <BandeauVerification />
      </Suspense>
      <form onSubmit={soumettre} style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Adresse e-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Mot de passe
          <input
            name="motDePasse"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {erreur && (
          <p role="alert" style={{ color: "crimson" }}>
            {erreur}
          </p>
        )}
        {emailNonVerifie && (
          <div role="alert">
            <p>
              Ton adresse e-mail n&apos;est pas encore vérifiée. Ouvre le lien
              reçu par e-mail.
            </p>
            {renvoi === "envoye" ? (
              <p>Un nouveau lien vient d&apos;être envoyé.</p>
            ) : (
              <button type="button" onClick={renvoyer}>
                Renvoyer l&apos;e-mail de vérification
              </button>
            )}
            {renvoi === "echec" && (
              <p style={{ color: "crimson" }}>
                Envoi impossible pour le moment, réessaie plus tard.
              </p>
            )}
          </div>
        )}
        <button type="submit" disabled={enCours}>
          {enCours ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p>
        Pas encore de compte ?{" "}
        <Link href="/inscription">{"S\u0027inscrire"}</Link>{" "}
      </p>
    </main>
  );
}
