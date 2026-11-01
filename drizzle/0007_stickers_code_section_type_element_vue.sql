CREATE TYPE "public"."type_element" AS ENUM('sticker', 'carte');--> statement-breakpoint
DROP INDEX "stickers_album_code_uniq";--> statement-breakpoint
UPDATE "stickers" SET "code" = "sections"."code" FROM "sections" WHERE "sections"."id" = "stickers"."section_id";--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "type_element" "type_element" DEFAULT 'sticker' NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" DROP COLUMN "ordre";--> statement-breakpoint
CREATE VIEW "public"."vue_stickers" AS (
  select
    s.id as sticker_id,
    a.id as album_id,
    a.nom as album,
    a.editeur,
    a.type_element,
    sec.code as section,
    p.nom_fr as pays,
    s.numero,
    sec.code || s.numero as code_affiche,
    s.type,
    s.libelle,
    s.archive_le is not null as archive
  from stickers s
  join albums a on a.id = s.album_id
  join sections sec on sec.id = s.section_id
  left join pays_cdm2026_panini p on p.code = sec.pays_code
);