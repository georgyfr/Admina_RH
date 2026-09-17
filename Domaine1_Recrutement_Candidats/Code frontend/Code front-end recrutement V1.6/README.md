# Code front-end recrutement V1.6 — Domaine 1 (Recrutement & Candidats)

Export autonome du frontend du Domaine 1, à l'identique de la production :
https://admina-rh-bd0.pages.dev/Domaine1_Recrutement_Candidats/

- **État production** : déploiement Cloudflare `bc7f7d5f` (17/09/2026)
- **Date de mise à jour** : 2026-09-17

## Contenu

| Élément | Détail |
|---|---|
| `Domaine1_Recrutement_Candidats/` | 32 pages HTML : accueil (application Next.js) + 31 écrans ; barre latérale pleine hauteur, bandeau de navigation, fil d'Ariane |
| `_next/` | 23 chunks du build Next.js (JS, CSS, polices) référencés par l'accueil D1 |
| `assets/` | 7 fichiers annexes référencés par les écrans D1 |
| `favicon.svg`, `favicon.ico` | Favicons (éclair violet global) |

## Utilisation

Servir ce dossier comme racine statique (ex. `python3 -m http.server 8080`),
puis ouvrir `http://localhost:8080/Domaine1_Recrutement_Candidats/`.

## Historique inclus

- **V35** : modules base-candidats et pipeline
- **V37** : audit complet des 31 routes
- **V38** : barre latérale ergonomique (chevrons, bandeau, fil d'Ariane)
- **V39 / V40** : sidebar pleine hauteur (100vh/100dvh) puis colonne sur toute la hauteur du document
- **17/09/2026** : migration de l'accueil D1 vers une application Next.js (build `_next/`)

La version complète (31 domaines) se trouve dans `ADMINA TOUS DOMAINES V1.2`.
