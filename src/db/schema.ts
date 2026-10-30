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
  motDePasseHash: text("mot_de_passe_hash").notNull(),
  pseudo: text("pseudo").notNull(),
  role: roleUtilisateur("role").notNull().default("utilisateur"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
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
