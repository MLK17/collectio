"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/auth/client";

export default function PageInscription() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const form = new FormData(e.currentTarget);
    const pseudo = String(form.get("pseudo") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const motDePasse = String(form.get("motDePasse") ?? "");

    if (pseudo.length < 2) {
      setErreur("Le pseudo doit contenir au moins 2 caractères.");
      return;
    }
    if (motDePasse.length < 10) {
      setErreur("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }

    setEnCours(true);
    const { error } = await authClient.signUp.email({
      name: pseudo,
      email,
      password: motDePasse,
    });
    setEnCours(false);

    if (error) {
      setErreur(
        error.code === "USER_ALREADY_EXISTS" ||
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ? "Cette adresse e-mail est déjà utilisée."
          : "Inscription impossible. Vérifie les informations saisies.",
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 380, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Inscription</h1>
      <form onSubmit={soumettre} style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Pseudo
          <input name="pseudo" type="text" required autoComplete="username" />
        </label>
        <label>
          Adresse e-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Mot de passe (10 caractères minimum)
          <input
            name="motDePasse"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
          />
        </label>
        {erreur && (
          <p role="alert" style={{ color: "crimson" }}>
            {erreur}
          </p>
        )}
        <button type="submit" disabled={enCours}>
          {enCours ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p>
        Déjà inscrit ? <Link href="/connexion">Se connecter</Link>
      </p>
    </main>
  );
}
