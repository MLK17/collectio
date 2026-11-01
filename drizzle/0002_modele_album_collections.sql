CREATE TYPE "public"."statut_album" AS ENUM('brouillon', 'publie');--> statement-breakpoint
ALTER TABLE "stickers" RENAME COLUMN "nom" TO "libelle";--> statement-breakpoint
ALTER TABLE "collection_stickers" DROP CONSTRAINT "collection_stickers_sticker_id_stickers_id_fk";
--> statement-breakpoint
ALTER TABLE "collections" DROP CONSTRAINT "collections_album_id_albums_id_fk";
--> statement-breakpoint
ALTER TABLE "stickers" DROP CONSTRAINT "stickers_section_id_sections_id_fk";
--> statement-breakpoint
DROP INDEX "collection_stickers_uniq";--> statement-breakpoint
DROP INDEX "sections_album_idx";--> statement-breakpoint
DROP INDEX "stickers_album_numero_uniq";--> statement-breakpoint
ALTER TABLE "collection_stickers" ALTER COLUMN "quantite" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "section_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_stickers" ADD CONSTRAINT "collection_stickers_collection_id_sticker_id_pk" PRIMARY KEY("collection_id","sticker_id");--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "editeur" text;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "annee" integer;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "statut" "statut_album" DEFAULT 'brouillon' NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "modifie_le" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "type" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_stickers" ADD CONSTRAINT "collection_stickers_sticker_id_stickers_id_fk" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stickers" ADD CONSTRAINT "stickers_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_stickers_sticker_idx" ON "collection_stickers" USING btree ("sticker_id");--> statement-breakpoint
CREATE INDEX "collections_album_idx" ON "collections" USING btree ("album_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sections_album_code_uniq" ON "sections" USING btree ("album_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "stickers_album_code_uniq" ON "stickers" USING btree ("album_id","code");--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "publie";--> statement-breakpoint
ALTER TABLE "stickers" DROP COLUMN "numero";--> statement-breakpoint
ALTER TABLE "collection_stickers" ADD CONSTRAINT "collection_stickers_quantite_check" CHECK ("collection_stickers"."quantite" >= 1);