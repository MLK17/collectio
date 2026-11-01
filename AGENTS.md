# Règles pour l'assistant IA – Collectio

## Méthode

- Avancer par étapes. Proposer un plan avant toute modification importante.
- Ne rien créer ni modifier sans accord explicite.
- À chaque étape : fichiers modifiés, commandes lancées, tests, décisions restantes.
- Ne pas ajouter de fonctionnalité hors périmètre validé (voir docs/decisions.md).
- Distinguer ce qui est vérifié dans le code de ce qui est supposé.

## Sécurité

- Ne jamais lire, afficher ni modifier .env.local.
- Aucun secret dans le code.
- Ne jamais lancer de migration sur la base de production.
- Ne pas faire git push sans accord.

## Technique

- Next.js + TypeScript, Better Auth, PostgreSQL sur Neon, Vercel (UE), npm, GitHub Actions.
- Migrations versionnées uniquement.
- Avant de proposer un commit : npm run format:check, lint, test et build.
