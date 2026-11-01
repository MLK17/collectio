import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function obtenirSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function exigerConnexion() {
  const session = await obtenirSession();
  if (!session) redirect("/connexion");
  return session;
}

export async function exigerAdministrateur() {
  const session = await exigerConnexion();
  if (session.user.role !== "administrateur") redirect("/");
  return session;
}