# Décisions de projet : Collectio

Nom de travail : Collectio (provisoire).

## Périmètre

- Un seul album au lancement : Panini Coupe du monde 2026 (979 cartes :
  FWC 19 + 48 équipes x 20). Modèle extensible à plusieurs albums.
- Images de stickers hors périmètre. Champ image_ref réservé, vide.
- Pas d'échanges ni de messagerie sans validation.

## Technique

- Next.js + TypeScript, un seul dépôt, zone /admin responsive.
- PostgreSQL sur Neon, migrations versionnées. Aucun secret dans le code.
- Authentification : Better Auth, e-mail + mot de passe.
- Hébergement : Vercel (site + backend) et Neon (base), régions UE.
- Gestionnaire de paquets : npm. Code sur GitHub.

## Données

- Noms de pays : table code -> nom français, relue puis corrigeable par l'admin.
- Stickers archivés plutôt que supprimés.
- Suppression de compte : délai de grâce de 30 jours, annulable.
- Import du catalogue : CSV/Excel avec aperçu et approbation par un admin.
