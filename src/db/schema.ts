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
} from "drizzle-orm/pg-core";

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

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  description: text("description"),
  publie: boolean("publie").notNull().default(false),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    nom: text("nom").notNull(),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [index("sections_album_idx").on(t.albumId)],
);

export const stickers = pgTable(
  "stickers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id").references(() => sections.id, {
      onDelete: "set null",
    }),
    numero: text("numero").notNull(),
    nom: text("nom"),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [
    uniqueIndex("stickers_album_numero_uniq").on(t.albumId, t.numero),
    index("stickers_section_idx").on(t.sectionId),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    utilisateurId: uuid("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("collections_utilisateur_album_uniq").on(
      t.utilisateurId,
      t.albumId,
    ),
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
      .references(() => stickers.id, { onDelete: "cascade" }),
    quantite: integer("quantite").notNull().default(0),
    modifieLe: timestamp("modifie_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("collection_stickers_uniq").on(t.collectionId, t.stickerId),
  ],
);
