"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/auth/client";

export default function PageInscription() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [emailEnvoye, setEmailEnvoye] = useState<string | null>(null);

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
    const { data, error } = await authClient.signUp.email({
      name: pseudo,
      email,
      password: motDePasse,
      callbackURL: "/connexion?verifie=1",
    });
    setEnCours(false);

    if (error) {
      setErreur("Inscription impossible. Vérifie les informations saisies.");
      return;
    }
    if (data?.token) {
      router.push("/");
      router.refresh();
      return;
    }
    setEmailEnvoye(email);
  }

  if (emailEnvoye) {
    return (
      <main style={{ maxWidth: 380, margin: "4rem auto", padding: "0 1rem" }}>
        <h1>Vérifie ta boîte mail</h1>
        <p>
          Un lien de confirmation a été envoyé à <strong>{emailEnvoye}</strong>.
          Il est valable 1 heure.
        </p>
        <p>
          <Link href="/connexion">Aller à la connexion</Link>
        </p>
      </main>
    );
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
