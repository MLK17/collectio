import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Authentification (Better Auth)                                      */
/* ------------------------------------------------------------------ */

export const roleUtilisateur = pgEnum("role_utilisateur", [
  "utilisateur",
  "administrateur",
]);

export const utilisateurs = pgTable("utilisateurs", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerifie: boolean("email_verifie").notNull().default(false),
  pseudo: text("pseudo").notNull(),
  image: text("image"),
  role: roleUtilisateur("role").notNull().default("utilisateur"),
  suppressionDemandeeLe: timestamp("suppression_demandee_le", {
    withTimezone: true,
  }),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  modifieLe: timestamp("modifie_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    utilisateurId: uuid("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    jeton: text("jeton").notNull().unique(),
    expireLe: timestamp("expire_le", { withTimezone: true }).notNull(),
    adresseIp: text("adresse_ip"),
    agentUtilisateur: text("agent_utilisateur"),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp("modifie_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_utilisateur_idx").on(t.utilisateurId)],
);

export const comptes = pgTable(
  "comptes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    utilisateurId: uuid("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    compteId: text("compte_id").notNull(),
    fournisseurId: text("fournisseur_id").notNull(),
    motDePasse: text("mot_de_passe"),
    jetonAcces: text("jeton_acces"),
    jetonRafraichissement: text("jeton_rafraichissement"),
    jetonId: text("jeton_id"),
    accesExpireLe: timestamp("acces_expire_le", { withTimezone: true }),
    rafraichissementExpireLe: timestamp("rafraichissement_expire_le", {
      withTimezone: true,
    }),
    portee: text("portee"),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp("modifie_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("comptes_utilisateur_idx").on(t.utilisateurId)],
);

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifiant: text("identifiant").notNull(),
  valeur: text("valeur").notNull(),
  expireLe: timestamp("expire_le", { withTimezone: true }).notNull(),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  modifieLe: timestamp("modifie_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Albums et stickers                                                  */
/* ------------------------------------------------------------------ */

export const statutAlbum = pgEnum("statut_album", ["brouillon", "publie"]);

export const pays = pgTable("pays", {
  code: text("code").primaryKey(),
  nomFr: text("nom_fr").notNull(),
  modifieLe: timestamp("modifie_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  description: text("description"),
  editeur: text("editeur"),
  annee: integer("annee"),
  statut: statutAlbum("statut").notNull().default("brouillon"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  modifieLe: timestamp("modifie_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    nom: text("nom").notNull(),
    paysCode: text("pays_code").references(() => pays.code, {
      onDelete: "restrict",
    }),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [
    uniqueIndex("sections_album_code_uniq").on(t.albumId, t.code),
    index("sections_pays_idx").on(t.paysCode),
  ],
);

export const stickers = pgTable(
  "stickers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "restrict" }),
    numero: text("numero").notNull(),
    code: text("code").notNull(),
    libelle: text("libelle"),
    type: text("type").notNull().default("normal"),
    ordre: integer("ordre").notNull().default(0),
    imageRef: text("image_ref"),
    archiveLe: timestamp("archive_le", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("stickers_album_code_uniq").on(t.albumId, t.code),
    uniqueIndex("stickers_section_numero_uniq").on(t.sectionId, t.numero),
    index("stickers_section_idx").on(t.sectionId),
  ],
);

/* ------------------------------------------------------------------ */
/* Collections personnelles                                            */
/* ------------------------------------------------------------------ */

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    utilisateurId: uuid("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "restrict" }),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("collections_utilisateur_album_uniq").on(
      t.utilisateurId,
      t.albumId,
    ),
    index("collections_album_idx").on(t.albumId),
  ],
);

export const collectionStickers = pgTable(
  "collection_stickers",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    stickerId: uuid("sticker_id")
      .notNull()
      .references(() => stickers.id, { onDelete: "restrict" }),
    quantite: integer("quantite").notNull().default(1),
    modifieLe: timestamp("modifie_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.collectionId, t.stickerId] }),
    check("collection_stickers_quantite_check", sql`${t.quantite} >= 1`),
    index("collection_stickers_sticker_idx").on(t.stickerId),
  ],
);
