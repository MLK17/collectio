import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
database: drizzleAdapter(db, {
  provider: "pg",
  schema: {
    utilisateurs: schema.utilisateurs,
    sessions: schema.sessions,
    comptes: schema.comptes,
    verifications: schema.verifications,
  },
}),
  user: {
    modelName: "utilisateurs",
    fields: {
      name: "pseudo",
      emailVerified: "emailVerifie",
      createdAt: "creeLe",
      updatedAt: "modifieLe",
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "utilisateur",
        input: false, // un client ne peut jamais fixer son rôle
      },
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "utilisateurId",
      token: "jeton",
      expiresAt: "expireLe",
      ipAddress: "adresseIp",
      userAgent: "agentUtilisateur",
      createdAt: "creeLe",
      updatedAt: "modifieLe",
    },
  },
  account: {
    modelName: "comptes",
    fields: {
      userId: "utilisateurId",
      accountId: "compteId",
      providerId: "fournisseurId",
      password: "motDePasse",
      accessToken: "jetonAcces",
      refreshToken: "jetonRafraichissement",
      idToken: "jetonId",
      accessTokenExpiresAt: "accesExpireLe",
      refreshTokenExpiresAt: "rafraichissementExpireLe",
      scope: "portee",
      createdAt: "creeLe",
      updatedAt: "modifieLe",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      identifier: "identifiant",
      value: "valeur",
      expiresAt: "expireLe",
      createdAt: "creeLe",
      updatedAt: "modifieLe",
    },
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  plugins: [nextCookies()], // doit rester en dernier
});