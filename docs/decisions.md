# Décisions du projet Collectio

> Journal des décisions validées. Toute nouvelle décision ou modification
> doit être ajoutée ici avec sa date et son statut.
> Statuts : ✅ Validée · 🟡 Proposée / en cours · ⬜ À faire · ❌ Écartée

Dernière mise à jour : 2026-11-01 (état des lieux du dépôt au commit `b7a56b6`)

## 1. Identité et cadre

| Sujet              | Décision                                                                                                                                                                      | Statut |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Nom de travail     | Collectio (provisoire)                                                                                                                                                        | ✅     |
| Positionnement     | Application indépendante de gestion de collections de stickers, inspirée des usages courants (dont Figuritas), sans reprise de marque, logo, image ou contenu d'album protégé | ✅     |
| Contenus d'albums  | Aucune image ni aucun contenu officiel sans autorisation ; données saisies par les administrateurs                                                                            | ✅     |
| Premier album      | Un seul album au lancement : Panini Coupe du monde 2026 (980 stickers : `PANINI00` + `FWC1` à `FWC19` + 48 équipes × 20). Modèle extensible à plusieurs albums                | ✅     |
| Images de stickers | Hors périmètre. Champ `image_ref` réservé, laissé vide                                                                                                                        | ✅     |

## 2. Stack technique

| Sujet                        | Décision                                                                                | Statut |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------ |
| Langage                      | TypeScript                                                                              | ✅     |
| Framework web                | Next.js (16.x), un seul dépôt                                                           | ✅     |
| Authentification             | Better Auth, e-mail + mot de passe (10 caractères minimum)                              | ✅     |
| Base de données              | PostgreSQL hébergé sur Neon.tech (Neon héberge uniquement la base), région UE           | ✅     |
| Hébergement de l'application | Vercel (site + backend), région UE                                                      | ✅     |
| Gestionnaire de paquets      | npm                                                                                     | ✅     |
| Node.js                      | Version 22.12 ou supérieure (`engines` de `package.json`, CI sur Node 22)               | ✅     |
| Intégration continue         | GitHub Actions : lint, format:check, test, build (variables d'environnement factices)   | ✅     |
| Dépôt                        | GitHub, `collectio`, branche principale `main`                                          | ✅     |
| ORM / migrations             | Drizzle ORM + drizzle-kit, migrations SQL versionnées dans `drizzle/`                   | ✅     |
| Application d'administration | Zone web `/admin` responsive, dans le même dépôt (pas d'application séparée ni desktop) | ✅     |
| Éditeur / assistant          | Devin Desktop                                                                           | ✅     |

## 3. Périmètre MVP

| Fonctionnalité                                                          | Statut | État dans le code                                                                                                                   |
| ----------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Albums gérés par les administrateurs                                    | ✅     | Table `albums` (brouillon / publié) ; aucune interface d'administration                                                             |
| Équipes / sections d'un album                                           | ✅     | Table `sections` (code unique par album) ; aucune interface                                                                         |
| Pays : référentiel code → nom français                                  | ✅     | Table `pays` (codes FIFA), `sections.pays_code` ; script `npm run db:pays` (migration `0003`) ; pas de page d'administration dédiée |
| Stickers, archivés plutôt que supprimés                                 | ✅     | Colonne `stickers.archive_le` (migration `0003`) ; aucune interface                                                                 |
| Collection personnelle : possédés, manquants, doubles (quantités)       | ✅     | Tables `collections` et `collection_stickers` (quantité ≥ 1) ; aucune interface                                                     |
| Comptes utilisateurs                                                    | ✅     | Inscription, connexion, déconnexion (Better Auth)                                                                                   |
| Rôles (utilisateur / administrateur)                                    | ✅     | Enum `role_utilisateur`, garde serveur sur `/admin`                                                                                 |
| Statistiques de progression                                             | ✅     | Non implémenté                                                                                                                      |
| Import du catalogue : CSV/Excel avec aperçu et approbation par un admin | ✅     | Lecture et validation du CSV (`src/import/catalogue.ts`) ; chargement initial par script ; aucune interface                         |
| Suppression de compte : délai de grâce de 30 jours, annulable           | ✅     | Colonne `utilisateurs.suppression_demandee_le` (migration `0003`) ; logique en Phase 6                                              |
| Échanges et messagerie entre utilisateurs                               | ❌     | Hors MVP ; aucun ajout sans validation                                                                                              |

## 4. Sécurité et données

| Sujet                | Décision                                                                                                      | Statut |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| Secrets              | Jamais dans le code. Tous les fichiers `.env*` sont ignorés par git, y compris `.env.example` (non versionné) | ✅     |
| Environnements Neon  | Branche de développement séparée de la production ; `.env.local` pointe sur la branche de développement       | ✅     |
| Migrations           | Versionnées uniquement ; jamais lancées manuellement sur la production                                        | ✅     |
| Données personnelles | Collecte minimale, conformité RGPD                                                                            | ✅     |
| Secret exposé        | Régénérer côté Neon (le supprimer du code ne suffit pas)                                                      | ✅     |

## 5. Méthode de travail

- Avancer par phases ; proposer avant d'implémenter ; aucun ajout hors périmètre sans accord.
- Une branche par phase à partir de la Phase 3, fusion vers `main` après CI verte et relecture du diff. Les phases 0, 1 et 2 sont réalisées directement sur `main`.
- Avant tout commit : `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.
- Pas de `git push` par l'assistant sans accord.
- À chaque étape : fichiers modifiés, commandes, tests, décisions restantes.

## 6. Phases

| Phase | Contenu                                                                                                                                              | Statut                                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Initialisation du projet, outillage, CI                                                                                                              | ✅ (`cb5ccc9`, `265442c`, `b7a56b6`)                                                                                                                                                                                                        |
| 1     | Schéma de base de données et migrations                                                                                                              | ✅ (`802bd7a`, `373d806`, `7066cb4`). Migrations `0000` à `0004` appliquées, 48 pays et album CdM 2026 (50 sections, 980 stickers) chargés sur la base de développement                                                                     |
| 2     | Authentification                                                                                                                                     | ✅ (`be049e7`, `79be5fb`, `ac248ca`). Inscription, connexion, sessions, garde `/admin`, vérification de l'e-mail (Resend) activée seulement si l'envoi est configuré. En attente : domaine d'envoi puis variables Vercel pour la production |
| 3     | Administration du catalogue (albums, sections, stickers)                                                                                             | 🟡 en cours sur la branche `phase-3-administration`                                                                                                                                                                                         |
| 4     | Import du catalogue depuis `/admin` : fichier CSV ou JSON, puis connecteurs API (Pokémon, Yu-Gi-Oh…), avec aperçu, approbation et revue après import | ⬜                                                                                                                                                                                                                                          |
| 5     | Collection personnelle et statistiques de progression                                                                                                | ⬜                                                                                                                                                                                                                                          |
| 6     | Gestion du compte : suppression avec délai de grâce de 30 jours                                                                                      | ⬜                                                                                                                                                                                                                                          |

## 7. Décisions de la Phase 1

| Question                       | Décision                                                                                                                                                                                                    | Statut |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Format du code pays            | Code FIFA à 3 lettres (`GER`, `NED`…)                                                                                                                                                                       | ✅     |
| Lien sections / pays           | `sections.pays_code` facultatif (la section FWC n'a pas de pays)                                                                                                                                            | ✅     |
| Liste initiale des pays        | 48 équipes de la Coupe du monde 2026, chargées par `npm run db:pays` ; n'écrase jamais l'existant                                                                                                           | ✅     |
| Archivage des stickers         | Date `archive_le` : vide = actif, renseignée = archivé                                                                                                                                                      | ✅     |
| Image des stickers             | `stickers.image_ref` réservé, laissé vide                                                                                                                                                                   | ✅     |
| Suppression de compte différée | Date `utilisateurs.suppression_demandee_le` ; suppression effective après 30 jours en Phase 6                                                                                                               | ✅     |
| Code des stickers              | Code de section + numéro, sans espace (`FRA1`, `FWC19`). `stickers.numero` (texte) stocké à part, `stickers.code` = affichage, unique dans l'album                                                          | ✅     |
| Sticker d'introduction         | Section `PANINI`, numéro `00`, code `PANINI00`, à confirmer avec le code imprimé sur le sticker                                                                                                             | 🟡     |
| Source du catalogue            | `ressource/stickers.csv` (versionné, codes uniquement, sans libellé ni image), validé strictement à la lecture (980 lignes, code = section + numéro)                                                        | ✅     |
| Chargement de l'album          | `npm run db:album-cdm2026` : album en brouillon, sections `PANINI`, `FWC` puis équipes dans l'ordre du fichier (nom = nom français du pays), types `panini` / `fwc` / `equipe` ; n'écrase jamais l'existant | ✅     |

## 8. Décisions de la Phase 2

| Question                                 | Décision                                                                                                                                                                                                                       | Statut |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Vérification de l'e-mail à l'inscription | Oui : connexion refusée tant que l'adresse n'est pas vérifiée, lien valable 1 heure, bouton « Renvoyer » sur `/connexion`                                                                                                      | ✅     |
| Après le clic sur le lien                | Retour vers `/connexion` (pas de connexion automatique)                                                                                                                                                                        | ✅     |
| Service d'envoi d'e-mails                | Resend, via son API REST (`src/email/envoyer.ts`, sans dépendance) ; variables `RESEND_API_KEY` et `EMAIL_EXPEDITEUR`                                                                                                          | ✅     |
| Expéditeur                               | Développement : `onboarding@resend.dev`, envois limités à l'adresse du titulaire du compte Resend. Production : pas de domaine pour l'instant, donc vérification désactivée ; domaine vérifié sur Resend requis pour l'activer | 🟡     |
| Création du premier administrateur       | Sans objet : un compte administrateur existe déjà                                                                                                                                                                              | ✅     |
| Comptes créés avant la vérification      | Marqués comme vérifiés (`email_verifie = true`)                                                                                                                                                                                | ✅     |
| Séparation des branches Neon dev / prod  | En place (confirmé le 2026-11-01)                                                                                                                                                                                              | ✅     |

## 9. Décisions de la Phase 3

| Question               | Décision                                                                                                                                                                                                                        | Statut |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Périmètre              | Albums, sections et stickers dans `/admin`. Pas de page pays : le référentiel sert seulement à rattacher une section à un pays                                                                                                  | ✅     |
| Saisie manuelle        | Création, modification d'albums, sections et stickers depuis `/admin` : correction des erreurs et collections sans API                                                                                                          | ✅     |
| Relecture des pays     | Pas de relecture pays par pays : la revue se fait après l'import du fichier (Phase 4). La colonne `pays.relu` n'est plus utilisée                                                                                               | ✅     |
| Modèle générique       | Le CdM 2026 est le pilote : « section » plutôt qu'« équipe », pays facultatif, type de sticker en texte libre, numéro en texte (`4/102`, `LOB-001` acceptés)                                                                    | ✅     |
| Publication d'un album | Brouillon ↔ publié librement, sans condition sur la relecture des pays                                                                                                                                                          | ✅     |
| Suppression            | Album ou section supprimable uniquement si l'album est en brouillon et sans collectionneur (correction d'erreur de saisie). Stickers : jamais supprimés un à un, archivés ; supprimés seulement avec leur section ou leur album | ✅     |
| Modification du code   | Changer le code d'une section ou le numéro d'un sticker recalcule le code des stickers concernés                                                                                                                                | ✅     |
| Sécurité               | Server Actions ; chaque action vérifie le rôle administrateur côté serveur et valide les données (`src/domain/catalogue.ts`)                                                                                                    | ✅     |

## 10. Vision de la Phase 4 : import multi-sources

| Question               | Décision                                                                                                                                                                          | Statut |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Sources                | Fichier CSV ou JSON envoyé depuis `/admin`, connecteurs API par fournisseur (Pokémon, Yu-Gi-Oh…), saisie manuelle (Phase 3)                                                       | ✅     |
| Déroulé                | Envoi du fichier → aperçu et validation → approbation par l'admin → import → revue et corrections manuelles dans `/admin`                                                         | ✅     |
| Scripts                | `db:pays` et `db:album-cdm2026` restent des outils de développement ; l'import courant passe par `/admin`                                                                         | ✅     |
| Traçabilité            | Ajouter l'origine des données (CSV, API, manuel) et l'identifiant chez le fournisseur pour permettre la resynchronisation                                                         | 🟡     |
| Droits sur les données | Les API fournissent noms et images protégés (The Pokémon Company, Konami…) : à trancher avant tout connecteur, au regard de la règle « aucun contenu officiel sans autorisation » | 🟡     |

## 11. Points de vigilance

- Base de développement : migrations `0000` à `0002` appliquées, empreintes identiques aux fichiers du dépôt (vérifié le 2026-11-01 via `drizzle.__drizzle_migrations`). `0003` et `0004` appliquées, 48 pays et album chargés (sorties de `npm run db:pays` et `npm run db:album-cdm2026`).
- Le CSV ne doit plus être rouvert dans Excel : il a transformé `MAR1` en `mars-01` (corrigé le 2026-11-01). Le script refuse désormais ce type d'erreur.
- Base de production : migrations appliquées non vérifiées.
- Vérification de l'e-mail active uniquement si `RESEND_API_KEY` et `EMAIL_EXPEDITEUR` sont définies (`envoiEmailConfigure`). Sans elles (production actuelle, faute de domaine), l'inscription connecte directement l'utilisateur sans vérification. Ne définir ces variables sur Vercel qu'avec un domaine d'envoi vérifié sur Resend.
- Les phases 0 à 2 étant poussées sur `main`, ne pas appliquer de migration tant que la base visée par `DATABASE_URL` n'est pas vérifiée.
