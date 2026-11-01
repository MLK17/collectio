ALTER TABLE "stickers" ADD COLUMN "numero" text;--> statement-breakpoint
UPDATE "stickers" SET "numero" = substring("stickers"."code" from length("sections"."code") + 1) FROM "sections" WHERE "sections"."id" = "stickers"."section_id";--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "numero" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "stickers_section_numero_uniq" ON "stickers" USING btree ("section_id","numero");
