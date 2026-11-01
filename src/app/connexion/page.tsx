"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/auth/client";

export default function PageConnexion() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const motDePasse = String(form.get("motDePasse") ?? "");

    setEnCours(true);
    const { error } = await authClient.signIn.email({
      email,
      password: motDePasse,
    });
    setEnCours(false);

    if (error) {
      // message volontairement générique : ne pas révéler si l'e-mail existe
      setErreur("Adresse e-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 380, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Connexion</h1>
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
