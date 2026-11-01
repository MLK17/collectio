CREATE TABLE "pays" (
	"code" text PRIMARY KEY NOT NULL,
	"nom_fr" text NOT NULL,
	"relu" boolean DEFAULT false NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "pays_code" text;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "image_ref" text;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "archive_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "utilisateurs" ADD COLUMN "suppression_demandee_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_pays_code_pays_code_fk" FOREIGN KEY ("pays_code") REFERENCES "public"."pays"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sections_pays_idx" ON "sections" USING btree ("pays_code");