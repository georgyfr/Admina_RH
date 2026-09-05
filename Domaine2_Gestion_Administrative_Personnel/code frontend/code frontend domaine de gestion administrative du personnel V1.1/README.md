# Admina-RH — Code Frontend V1.1

**Version :** V1.1 (release Cloudflare Pages du 05/09/2026)
**URL production :** https://admina-rh-bd0.pages.dev
**Stack :** React 19 + Vite 8 + MUI 9 + Recharts 3 + React Router 7

---

## 📋 Description

Cette version V1.1 contient l'**intégralité du code déployé sur Cloudflare Pages**, incluant :

- **Domaine 1 — Recrutement & Candidats** (35 écrans)
- **Domaine 2 — Gestion Administrative du Personnel** (22+ écrans, 32 fichiers)

Elle incorpore toutes les évolutions récentes du module Avenants :
- ÉTAPE 5 : Modèle d'Avenant PDF (export 1 clic)
- ÉTAPE 6 : Historique des Avenants dans la Fiche Employé
- ÉTAPE 7 : Bouclage automatique Contrat ↔ Avenants
- **Master Prompt** : Refonte complète des formulaires + workflow + audit trail

---

## 📁 Structure

```
V1.1/
├── src/
│   ├── App.jsx                    # Routing principal (D1 + D2)
│   ├── main.jsx                   # Entry point
│   ├── theme.js                   # Thème MUI
│   ├── assets/                    # Images statiques
│   ├── components/                # Composants partagés (Sidebar, Header, etc.)
│   ├── context/                   # React Context (AppContext, DashboardFilterContext, RoleContext)
│   ├── data/                      # Données statiques
│   └── pages/
│       ├── *.jsx                  # 35 écrans Domaine 1 (Offres, Candidats, Pipeline, Entretiens, etc.)
│       └── domaine2/              # 32 fichiers Domaine 2
│           ├── data.js            # Base de données simulée (20 employés, contrats, avenants, etc.)
│           ├── D2Layout.jsx       # Layout sidebar 5 phases
│           ├── TableauDeBordD2.jsx # Dashboard avec KPIs, filtres, prévisions
│           ├── ContratsD2.jsx     # Contrats + bouclage RECHERCHEX (ÉTAPE 7)
│           ├── AvenantsModule.jsx # Avenants + workflow + audit (Master Prompt)
│           ├── ModeleAvenantPDF.jsx # Modèle PDF (ÉTAPE 5)
│           ├── FicheEmploye.jsx   # Fiche employé 11 tabs
│           ├── HistoriqueAvenants.jsx # Historique avenants + chart (ÉTAPE 6)
│           ├── VisualiseurContrat.jsx # Visualiseur + export PDF contrat
│           ├── ParcoursProfessionnel.jsx
│           ├── PerformanceIntegration.jsx
│           ├── ChecklistDocuments.jsx
│           ├── SimulateurConges.jsx
│           ├── NavigationIntelligente.jsx
│           ├── FilterBar.jsx
│           ├── AlertesCritiques.jsx
│           ├── DrillDownDetail.jsx
│           ├── AnalysePrevisionnelle.jsx
│           ├── TCDCharts.jsx
│           ├── Sparkline.jsx
│           ├── QualiteRecrutement.jsx
│           ├── GenerationContrats.jsx
│           ├── seuils.js          # Seuils KPI (feux tricolores)
│           ├── prevision.js       # Holt-Winters ETS forecasting
│           ├── dataD1.js          # Données D1 pour interconnexion
│           ├── components.jsx      # Composants partagés D2
│           ├── ErrorBoundary.jsx
│           ├── Phase0Docs.jsx
│           └── GenericD2Page.jsx
├── public/                        # Favicon, manifest
├── index.html
├── package.json                   # Dépendances (React 19, MUI 9, Recharts 3, etc.)
├── vite.config.js                 # Config Vite
├── .oxlintrc.json                 # Config ESLint
└── .gitignore
```

---

## 🚀 Installation & Lancement

```bash
# Installation des dépendances
bun install
# ou: npm install

# Lancement en dev (port 5173)
bun run dev
# ou: npm run dev

# Build production
bun run build
# génère le dossier dist/

# Preview du build
bun run preview

# Lint
bun run lint
```

---

## 🌐 Déploiement Cloudflare Pages

```bash
# Build
bun run build

# Déploiement via wrangler
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=3550353ef78072b2af2f047006eef5c5 \
  npx wrangler pages deploy dist --project-name admina-rh --branch main
```

**URL production :** https://admina-rh-bd0.pages.dev
**Routes principales :**
- `/` — Tableau de bord Domaine 1 (Recrutement)
- `/domaine2_Gestion_Administrative_Personnel` — Tableau de bord Domaine 2
- `/domaine2_Gestion_Administrative_Personnel/avenants` — Module Avenants
- `/domaine2_Gestion_Administrative_Personnel/avenants/modele-pdf` — Modèle PDF
- `/domaine2_Gestion_Administrative_Personnel/contrats` — Contrats + bouclage
- `/domaine2_Gestion_Administrative_Personnel/employes/fiche` — Fiche Employé

---

## ✨ Nouveautés V1.1 (vs V1)

### ÉTAPE 5 — Modèle d'Avenant PDF
- Nouvel onglet `Modele_Avenant_PDF` (route `/avenants/modele-pdf`)
- Cellule B1 : liste déroulante N° Avenant
- 9 cellules nommées RECHERCHEX (B5-B13)
- Zone d'impression (lignes 5-30) : modèle d'avenant professionnel
- Bouton "📄 Exporter en PDF" : `Avenant_[N°Avenant]_[Employé]_[Date].pdf`
- 5 articles de loi + signatures + footer ISO 30401:2018

### ÉTAPE 6 — Historique Avenants (Fiche Employé)
- Nouvel onglet "Avenants" dans Fiche Employé (tab 2)
- Formule Excel : `=TRIER(FILTRE(CHOISIRCOLS('Avenants'!A:O; 13; 6; 7; 4; 5; 11; 10; 9); 'Avenants'!C:C=$B$2); 6; -1)`
- 8 colonnes sélectionnées via CHOISIRCOLS
- Tri décroissant sur Date effet (arg -1)
- Graphique en courbes (Recharts) : évolution des rémunérations
- ReferenceLine "Salaire initial"
- KPIs intégrés (Total, Archivés, Variation FCFA + %)

### ÉTAPE 7 — Bouclage Contrat ↔ Avenants
- 4 nouvelles fonctions RECHERCHEX dans ContratsD2.jsx :
  - `getSalaireActuel` (col G)
  - `getPosteActuel` (col E)
  - `getTempsTravailActuel` (col I)
  - `getDateDernierAvenant` (col L)
- Filtre `STATUTS_VALIDES_BOUCLAGE = ['Archivé', 'Signé']`
- Tri descendant (arg -1 de RECHERCHEX)
- SIERREUR : fallback sur valeur initiale si aucun avenant valide
- 3 nouvelles colonnes dans tableau Contrats (Poste actuel, Temps travail, Dernier avenant)
- Bannière explicative avec formule Excel

### Master Prompt — Refonte formulaires Avenants

#### Formulaire "Nouvel avenant" enrichi
- Section "Valeurs actuelles" (lecture seule RECHERCHEX) : Poste actuel + Temps actuel
- Zone récapitulative "Validation avant création" avec message auto
- 4 validations : noChange, SMIC (36 000 FCFA), dateCoherence, dateMin

#### Formulaire "Modifier avenant" enrichi
- Tableau comparatif "Valeurs enregistrées" (5 lignes × 3 colonnes)
- Section "Champs modifiables" complète
- Historique des modifications masquable (Avenants_Audit, ISO 30401:2018)

#### Workflow statut interactif
- 4 boutons d'action avec horodatage :
  - 📨 Envoyer (Projet → Envoyé au salarié)
  - ✍️ Signer (Envoyé → Signé)
  - 📁 Archiver (Signé → Archivé → déclenche bouclage)
  - ❌ Refuser (dialog avec motif obligatoire)
- Disabled state machine selon statut actuel

#### Bouclage contrat
- Nouvelle colonne U "Contrat MAJ" (chips ✅ Oui / ⏳ Non)
- À l'archivage : `contrat_maj = 'Oui'`

#### Synchronisation Fiche Employé
- Carte "🔗 Lien dynamique vers le dernier avenant"
- Bouton "📄 Voir le dernier avenant" → navigation

---

## 🛠️ Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.2 | Framework UI |
| Vite | 8.2 | Build tool |
| MUI | 9.4 | Composants UI |
| Recharts | 3.10 | Graphiques |
| React Router | 7.18 | Routing |
| Emotion | 11.x | Styling MUI |
| Cloudflare Pages | - | Hébergement |
| wrangler | 4.128 | CLI déploiement |

---

## 📊 Données

Les données sont simulées (pas de backend) dans `src/pages/domaine2/data.js` :
- 20 employés
- 20 contrats
- 4 avenants (AVN-2025-001 à 004)
- 8 congés, 8 documents, données bancaires, mutuelles, etc.

---

## 🔗 Liens utiles

- **Production :** https://admina-rh-bd0.pages.dev
- **Repo GitHub :** https://github.com/georgyfr/Admina_RH
- **Cloudflare Dashboard :** https://dash.cloudflare.com/3550353ef78072b2af2f047006eef5c5

---

## 📝 Notes

- Le dossier `Domaine1_Recrutement_Candidats/Code frontend/` contient une version historique de Domaine 1 (V1) conservée pour référence.
- Le code actif (V1.1) est dans `src/` et contient les deux domaines.
- Le build génère un dossier `dist/` déployé sur Cloudflare Pages via `_redirects` (SPA fallback).

---

**Généré le 05/09/2026 — Admina-RH V1.1**
