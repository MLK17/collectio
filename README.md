# Collectio

Application de gestion de collections de stickers (nom de travail).
Premier album : Panini Coupe du monde 2026.

## Démarrage

    npm install
    npm run dev

## Commandes

| Commande       | Rôle                     |
| -------------- | ------------------------ |
| npm run dev    | serveur de développement |
| npm run lint   | analyse du code          |
| npm run format | formatage                |
| npm test       | tests                    |
| npm run build  | build de production      |

## Structure

- src/app : pages utilisateur
- src/app/admin : administration du catalogue (Phase 3)
- src/domain : règles métier (collection et statistiques : Phase 5)
- src/db : schéma et migrations (Phase 1)
- src/auth : authentification (Phase 2)
- src/import : import du catalogue (Phase 4)
- tests : tests
- docs : décisions et documentation

Les décisions de projet sont dans docs/decisions.md.
