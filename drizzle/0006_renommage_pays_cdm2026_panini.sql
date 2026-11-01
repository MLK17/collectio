ALTER TABLE "pays" RENAME TO "pays_cdm2026_panini";--> statement-breakpoint
ALTER TABLE "sections" DROP CONSTRAINT "sections_pays_code_pays_code_fk";
--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_pays_code_pays_cdm2026_panini_code_fk" FOREIGN KEY ("pays_code") REFERENCES "public"."pays_cdm2026_panini"("code") ON DELETE restrict ON UPDATE no action;