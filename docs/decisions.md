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
| Premier album      | Un seul album au lancement : Panini Coupe du monde 2026 (979 cartes : FWC 19 + 48 équipes × 20). Modèle extensible à plusieurs albums                                         | ✅     |
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

| Fonctionnalité                                                          | Statut | État dans le code (au `b7a56b6`)                                                |
| ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Albums gérés par les administrateurs                                    | ✅     | Table `albums` (brouillon / publié) ; aucune interface d'administration         |
| Équipes / sections d'un album                                           | ✅     | Table `sections` (code unique par album) ; aucune interface                     |
| Pays : table code → nom français, relue puis corrigeable par l'admin    | ✅     | Non implémenté                                                                  |
| Stickers, archivés plutôt que supprimés                                 | ✅     | Table `stickers` ; archivage non implémenté                                     |
| Collection personnelle : possédés, manquants, doubles (quantités)       | ✅     | Tables `collections` et `collection_stickers` (quantité ≥ 1) ; aucune interface |
| Comptes utilisateurs                                                    | ✅     | Inscription, connexion, déconnexion (Better Auth)                               |
| Rôles (utilisateur / administrateur)                                    | ✅     | Enum `role_utilisateur`, garde serveur sur `/admin`                             |
| Statistiques de progression                                             | ✅     | Non implémenté                                                                  |
| Import du catalogue : CSV/Excel avec aperçu et approbation par un admin | ✅     | Non implémenté (`src/import/` vide)                                             |
| Suppression de compte : délai de grâce de 30 jours, annulable           | ✅     | Non implémenté                                                                  |
| Échanges et messagerie entre utilisateurs                               | ❌     | Hors MVP ; aucun ajout sans validation                                          |

## 4. Sécurité et données

| Sujet                | Décision                                                                                                      | Statut |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| Secrets              | Jamais dans le code. Tous les fichiers `.env*` sont ignorés par git, y compris `.env.example` (non versionné) | ✅     |
| Environnements Neon  | Branche de développement séparée de la production, à mettre en place avant la reprise de la Phase 2           | 🟡     |
| Migrations           | Versionnées uniquement ; jamais lancées manuellement sur la production                                        | ✅     |
| Données personnelles | Collecte minimale, conformité RGPD                                                                            | ✅     |
| Secret exposé        | Régénérer côté Neon (le supprimer du code ne suffit pas)                                                      | ✅     |

## 5. Méthode de travail

- Avancer par phases ; proposer avant d'implémenter ; aucun ajout hors périmètre sans accord.
- Une branche par phase (à partir de maintenant), fusion vers `main` après CI verte et relecture du diff. Les phases 0 à 2 ont été commitées directement sur `main`.
- Terminer la Phase 1 avant de reprendre la Phase 2.
- Avant tout commit : `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.
- Pas de `git push` par l'assistant sans accord.
- À chaque étape : fichiers modifiés, commandes, tests, décisions restantes.

## 6. Phases

| Phase | Contenu                                                         | Statut                                                                                                                                                          |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Initialisation du projet, outillage, CI                         | ✅ (`cb5ccc9`, `265442c`, `b7a56b6`)                                                                                                                            |
| 1     | Schéma de base de données et migrations                         | 🟡 en cours, prioritaire. Fait : migrations `0000` à `0002`. Reste : archivage des stickers, table des pays, `image_ref`, suppression de compte différée        |
| 2     | Authentification                                                | 🟡 en cours (`be049e7`, `79be5fb`). Fait : inscription, connexion, sessions, garde `/admin`. Reste : vérification de l'e-mail, script du premier administrateur |
| 3     | Administration du catalogue (albums, sections, stickers, pays)  | ⬜                                                                                                                                                              |
| 4     | Import du catalogue (CSV/Excel, aperçu, approbation)            | ⬜                                                                                                                                                              |
| 5     | Collection personnelle et statistiques de progression           | ⬜                                                                                                                                                              |
| 6     | Gestion du compte : suppression avec délai de grâce de 30 jours | ⬜                                                                                                                                                              |

## 7. Décisions de la Phase 2

| Question                                 | Décision                                         | Statut |
| ---------------------------------------- | ------------------------------------------------ | ------ |
| Vérification de l'e-mail à l'inscription | Oui                                              | ✅     |
| Service d'envoi d'e-mails                | Resend                                           | ✅     |
| Création du premier administrateur       | Script en ligne de commande (pas d'interface)    | ✅     |
| Séparation des branches Neon dev / prod  | À mettre en place avant la reprise de la Phase 2 | 🟡     |

## 8. Points de vigilance

- La migration `0002` ajoute des colonnes `code` `NOT NULL` sans valeur par défaut (`sections`, `stickers`) et rend `stickers.section_id` obligatoire : elle échoue si ces tables contiennent déjà des lignes.
- Les migrations réellement appliquées sur Neon (dev et prod) n'ont pas été vérifiées.
- Le `README.md` utilise une ancienne numérotation des phases (import = 2, auth = 3) : la numérotation de référence est celle de la section 6.
