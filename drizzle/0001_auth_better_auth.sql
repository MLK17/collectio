CREATE TABLE "comptes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"utilisateur_id" uuid NOT NULL,
	"compte_id" text NOT NULL,
	"fournisseur_id" text NOT NULL,
	"mot_de_passe" text,
	"jeton_acces" text,
	"jeton_rafraichissement" text,
	"jeton_id" text,
	"acces_expire_le" timestamp with time zone,
	"rafraichissement_expire_le" timestamp with time zone,
	"portee" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"utilisateur_id" uuid NOT NULL,
	"jeton" text NOT NULL,
	"expire_le" timestamp with time zone NOT NULL,
	"adresse_ip" text,
	"agent_utilisateur" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_jeton_unique" UNIQUE("jeton")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifiant" text NOT NULL,
	"valeur" text NOT NULL,
	"expire_le" timestamp with time zone NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "utilisateurs" ADD COLUMN "email_verifie" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "utilisateurs" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "utilisateurs" ADD COLUMN "modifie_le" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "comptes" ADD CONSTRAINT "comptes_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comptes_utilisateur_idx" ON "comptes" USING btree ("utilisateur_id");--> statement-breakpoint
CREATE INDEX "sessions_utilisateur_idx" ON "sessions" USING btree ("utilisateur_id");--> statement-breakpoint
ALTER TABLE "utilisateurs" DROP COLUMN "mot_de_passe_hash";