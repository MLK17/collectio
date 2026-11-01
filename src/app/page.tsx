import { Suspense } from "react";
import Link from "next/link";
import { obtenirSession } from "@/auth/session";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";

async function ZoneUtilisateur() {
  const session = await obtenirSession();

  if (!session) {
    return (
      <p>
        <Link href="/connexion">Se connecter</Link> ou{" "}
        <Link href="/inscription">créer un compte</Link>.
      </p>
    );
  }

  return (
    <>
      <p>
        Connecté en tant que <strong>{session.user.name}</strong> (
        {session.user.role}).
      </p>
      {session.user.role === "administrateur" && (
        <p>
          <Link href="/admin">{"Aller à l\u0027administration"}</Link>
        </p>
      )}
      <BoutonDeconnexion />
    </>
  );
}

export default function Accueil() {
  return (
    <main style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Collectio</h1>
      <Suspense fallback={<p>Chargement...</p>}>
        <ZoneUtilisateur />
      </Suspense>
    </main>
  );
}
