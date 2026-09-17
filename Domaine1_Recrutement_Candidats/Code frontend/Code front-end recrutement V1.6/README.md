# Code front-end recrutement V1.6 — Domaine 1 (Recrutement & Candidats)

Export autonome du frontend du Domaine 1, à l'identique de la production :
https://admina-rh-bd0.pages.dev/Domaine1_Recrutement_Candidats/

- **Version** : V40 — déploiement Cloudflare `613fd28c`, état GitHub `c9420ca1`
- **Date d'export** : 2026-09-17

## Contenu

| Élément | Détail |
|---|---|
| `Domaine1_Recrutement_Candidats/` | 32 pages HTML : accueil + 31 écrans (application React MUI : barre latérale groupée pleine hauteur, bandeau de navigation, fil d'Ariane) |
| `assets/` | 75 fichiers : feuilles de style et scripts propres à chaque écran (`admina-*.css/js`), runtime React MUI (`rolldown-runtime`, `react-dom`, `index`, `isMuiElement`, icônes `Box`/`Grow`/`Menu`), dont `admina-sidebars.css/js` (v40) |
| `favicon.svg`, `favicon.ico` | Favicons (éclair violet global) |

## Utilisation

Servir ce dossier comme racine statique, par exemple :

```bash
python3 -m http.server 8080
```

puis ouvrir `http://localhost:8080/Domaine1_Recrutement_Candidats/`.
Toutes les routes (`/Domaine1_Recrutement_Candidats/<écran>`) sont servies par le
mécanisme de fallback SPA de l'hébergeur ; en local, ajouter `?` à la fin de l'URL
ou servir chaque dossier `écran/index.html` directement.

## Historique des travaux inclus (V35 → V40)

- **V35** : modules base-candidats et pipeline (admina-basecand, admina-pipeline)
- **V37** : audit complet des 31 routes, corrections
- **V38** : barre latérale ergonomique React MUI (chevrons, bandeau, fil d'Ariane)
- **V39** : sidebar pleine hauteur garantie (100vh/100dvh) + cache-bust
- **V40** : colonne latérale sur toute la hauteur du document (canvas dégradé)

La version complète (31 domaines) se trouve dans `ADMINA TOUS DOMAINES V1.2`.
