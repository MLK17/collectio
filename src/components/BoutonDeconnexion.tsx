"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";

export default function BoutonDeconnexion() {
  const router = useRouter();

  async function deconnecter() {
    await authClient.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button type="button" onClick={deconnecter}>
      Se déconnecter
    </button>
  );
}