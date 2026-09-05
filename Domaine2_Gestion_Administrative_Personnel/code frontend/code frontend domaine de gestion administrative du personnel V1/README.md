# Code Frontend — Domaine 2 : Gestion Administrative du Personnel (V1)

## Description
Ce dossier contient tout le code frontend de l'application **Admina-RH** déployée sur Cloudflare Pages, incluant :

- **Domaine 1 — Recrutement** (app existante, conservée intacte)
- **Domaine 2 — Gestion Administrative du Personnel** (développé selon les spécifications du manuel de procédure et du prompt V2)

## URL de production
https://admina-rh-bd0.pages.dev

## Stack technique
- **React 19** + **Vite 8** + **MUI 9** + **Recharts 3**
- **React Router 7** (BrowserRouter + lazy loading)
- **JavaScript (JSX)** — pas de TypeScript (cohérent avec l'app existante)
- Déploiement : **Cloudflare Pages** (via wrangler)

## Structure

```
src/
├── App.jsx                    # Router principal (D1 + D2 conditionnel)
├── main.jsx                   # Entry point
├── theme.js                   # Thème MUI (light/dark)
├── components/                # Composants Domaine 1 (Sidebar, Header, etc.)
├── context/                   # Contextes React (App, Role, DashboardFilter)
├── data/                      # Données Domaine 1 (nomenclatures, etc.)
├── assets/                    # Images, CSS
└── pages/
    ├── TableauDeBord.jsx      # Dashboard Domaine 1
    ├── Offres.jsx             # Gestion des offres (D1)
    ├── Candidats.jsx          # Base candidats (D1)
    ├── ...                    # 34 autres pages Domaine 1
    └── domaine2/              # === DOMAINe 2 ===
        ├── D2Layout.jsx              # Layout (sidebar violet + header + outlet)
        ├── TableauDeBordD2.jsx       # Dashboard 6 sections + simulated login
        ├── DashboardSections.jsx      # 6 sections (Vue ensemble, Contrats, Congés, Finances, Qualité, Rapports)
        ├── FilterBar.jsx              # Slicers (Département, Type Contrat, Statut, Timeline)
        ├── AlertesCritiques.jsx      # Zone alertes intelligentes (feux tricolores)
        ├── DrillDownDetail.jsx       # Drill-down KPI (FILTER + export CSV)
        ├── AnalysePrevisionnelle.jsx # Prévision ETS + résumé narratif + alertes essai
        ├── TCDCharts.jsx             # TCD dynamiques (Effectifs empilés + Présence)
        ├── Sparkline.jsx             # Mini-graphiques tendance dans KPIs
        ├── EmployesD2.jsx            # DataTable employés + filtres
        ├── ContratsD2.jsx            # DataTable contrats + calculs auto
        ├── CongesD2.jsx              # DataTable congés + dialog + workflow
        ├── GenericD2Page.jsx         # 18 écrans génériques (Documents, Paie, etc.)
        ├── Phase0Docs.jsx           # Page documentation Phase 0
        ├── ErrorBoundary.jsx         # Capturer erreurs runtime
        ├── data.js                   # Données mock (20 employés, contrats, congés, etc.)
        ├── seuils.js                 # Configuration seuils d'alertes (_Config_Seuils)
        ├── prevision.js              # Prévision ETS (Holt-Winters)
        └── components.jsx            # Composants partagés (StatusBadge, KPICard, etc.)
```

## Fonctionnalités Domaine 2

### Tableau de bord (6 sections)
1. **Vue d'Ensemble Stratégique** — 13 KPIs + 4 charts + TCD + Sparklines + drill-down + analyse prévisionnelle
2. **Données & Contrats** — Recherche employé + contrats + avenants
3. **Présence & Congés** — Statut congés + soldes + HS + demandes en attente
4. **Finances & Conformité** — Paie + prêts + déclarations + sanctions
5. **Pilotage & Qualité** — Alertes priorisées + documents + départs + indicateurs qualité
6. **Rapports** — Générateur avec période + département + export

### Filttres interactifs (Slicers)
- Département (multi-sélection)
- Type Contrat (CDI/CDD/Stage/Interim)
- Statut (Actif/Inactif/Essai/Suspendu)
- Timeline Date Embauche (du/au)

### Alertes intelligentes
- **Feux tricolores** (🟢/🟡/🔴) sur les 13 KPIs selon seuils paramétrables
- **Détection proactive** des échéances (contrats <30j, documents <15j, permis, visites médicales, CNPS)
- **Texte synthétique** dynamique (⚠️/✅)

### Drill-down KPI
- Cliquer sur un KPI → affiche la liste détaillée des employés concernés
- Menu déroulant pour sélection manuelle
- Export CSV (compatible Excel)

### Analyse prédictive
- **Prévision ETS** (Holt-Winters) sur 3 mois
- **Intervalle de confiance** à 95%
- **Résumé exécutif** narratif dynamique
- **Alerte périodes d'essai** (fins <15j)

### TCD dynamiques
- **TCD_Effectifs** : barres empilées (Département × Type_Contrat)
- **TCD_Présence** : courbe par mois
- Se recalculent automatiquement selon les Slicers

## Simulated login
3 rôles qui filtrent les données :
- **DRH** — Vue globale (tous les employés)
- **Manager** — Vue équipe (7 premiers)
- **Employé** — Vue personnelle (emp-001)

## Installation

```bash
bun install
bun run dev      # Mode développement (localhost:5173)
bun run build    # Build production (dist/)
```

## Déploiement Cloudflare

```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> \
  bunx wrangler pages deploy dist --project-name=admina-rh --branch=main
```

## Conformité
- **ISO 30401:2018** (SMRH)
- **ISO 9001:2015** (SMQ)
- **ISO 10667:2011** (recrutement)
- **ISO 22400-3:2022** (KPIs RH)

## Version
V1 — Septembre 2026
