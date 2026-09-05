# Admina-RH — Code Frontend V1.2

**Version :** V1.2 (release Cloudflare Pages du 05/09/2026)
**URL production :** https://admina-rh-bd0.pages.dev
**Stack :** React 19 + Vite 8 + MUI 9 + Recharts 3 + React Router 7

---

## 📋 Description

Cette version V1.2 contient l'**intégralité du code déployé sur Cloudflare Pages**, incluant :

- **Domaine 1 — Recrutement & Candidats** (35 écrans)
- **Domaine 2 — Gestion Administrative du Personnel** (33 fichiers, 22+ écrans)

### Nouveautés V1.2 (vs V1.1)

#### Module Suivi Documents complet (6 étapes) :
- **ÉTAPE 1** : Structuration base T_Documents (13 colonnes A-M, formules RECHERCHEX, SI imbriquée)
- **ÉTAPE 2** : Filtres dynamiques (B1-F1) + recherche avancée + tri multi-colonnes + FILTRE Excel
- **ÉTAPE 3** : Système d'alertes (CONFIG_ALERTES_DOCS, envoi email récapitulatif, audit trail)
- **ÉTAPE 4** : Actions individuelles (Télécharger, Modifier, Renouveler, Fiche) + actions groupées (Renouveler sélection, Export PDF)
- **ÉTAPE 5** : Tableau de bord documentaire (6 KPI + 3 graphiques Recharts : BarChart, PieChart, LineChart)
- **ÉTAPE 6** : Interconnexion complète (Fiche Employé, Dashboard, Export/Audit)
- **Enrichissement** : Colonne Alerte (M) + indicateurs NB.SI + NB.SI.ENS dans Fiche Employé

#### Module Avenants enrichi (Master Prompt) :
- Formulaire création avec validations (SMIC, cohérence dates, changement effectif)
- Formulaire modification avec tableau comparatif Ancien/Nouveau + audit trail
- Workflow 4 boutons (Envoyer, Signer, Archiver, Refuser) avec motif obligatoire
- Bouclage auto Contrat ↔ Avenants (RECHERCHEX, 4 colonnes)
- Modèle PDF d'avenant (13 cellules nommées B5-B26, export 1 clic)
- Historique avenants dans Fiche Employé (FILTRE+CHOISIRCOLS+TRIER, chart LineChart)

---

## 📁 Structure

```
V1.2/
├── src/
│   ├── App.jsx                    # Routing principal (D1 + D2)
│   ├── main.jsx                   # Entry point
│   ├── theme.js                   # Thème MUI
│   ├── components/                # Composants partagés (Sidebar, Header, etc.)
│   ├── context/                   # React Context (App, DashboardFilter, Role)
│   ├── data/                      # Données statiques
│   └── pages/
│       ├── *.jsx                  # 35 écrans Domaine 1
│       └── domaine2/              # 33 fichiers Domaine 2
│           ├── data.js            # Base + helpers (calculerStatutDoc, genererCorpsEmailAlertes, etc.)
│           ├── SuiviDocumentsD2.jsx    # Suivi Documents (6 étapes + enrichissement)
│           ├── AvenantsModule.jsx     # Avenants (Master Prompt complet)
│           ├── ModeleAvenantPDF.jsx   # Modèle PDF avenant (export 1 clic)
│           ├── ContratsD2.jsx          # Contrats + bouclage RECHERCHEX
│           ├── FicheEmploye.jsx        # Fiche Employé (11 tabs + NB.SI.ENS)
│           ├── HistoriqueAvenants.jsx  # Historique avenants + chart
│           ├── VisualiseurContrat.jsx  # Visualiseur contrat + export PDF
│           └── ... (25 autres fichiers)
├── public/                        # Favicon, manifest, _redirects
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Installation

```bash
bun install
bun run dev        # Dev server (port 5173)
bun run build      # Build production
bun run lint       # ESLint
```

---

## 🌐 Déploiement Cloudflare Pages

```bash
bun run build
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> \
  npx wrangler pages deploy dist --project-name admina-rh --branch main
```

**URL production :** https://admina-rh-bd0.pages.dev

---

## 📊 Modules clés V1.2

### Suivi Documents (T_Documents)
- 20 documents, 16 colonnes (A-P)
- Formules : RECHERCHEX (C), Jours_Restants (H), Statut (I), Alerte (M)
- Filtres dynamiques : Type, Statut, Employé, Texte, Date (FILTRE multi-critères)
- Système d'alertes : CONFIG_ALERTES_DOCS, envoi email, audit trail
- Actions : Télécharger, Modifier, Renouveler (Select Case), Fiche employé
- Tableau de bord : 6 KPI + BarChart + PieChart + LineChart (6 mois projection)
- Export : CSV, PDF (zone filtrée), Rapport Audit (trié Employé + Date)

### Avenants
- Formulaire création enrichi (validations SMIC, dates, changement effectif)
- Formulaire modification (tableau comparatif + audit trail Avenants_Audit)
- Workflow 4 boutons (Envoyer, Signer, Archiver, Refuser avec motif)
- Bouclage auto : Contrat ↔ Avenants (RECHERCHEX colonnes G/E/I/L)
- Colonne "Contrat MAJ" (U) avec chips Oui/Non
- Modèle PDF : 22 cellules nommées (B5-B26), 7 articles de loi, signatures

### Fiche Employé (11 tabs)
- Informations, Contrat, Avenants, Documents, Bancaire, Mutuelle, Congés, Paie, Sanctions, Visites, Départs
- Indicateur NB.SI.ENS docs expirés dans l'en-tête
- Hyperlien "Voir tous les documents" → /documents
- Hyperlien "Voir le dernier avenant" → /avenants

---

**Généré le 05/09/2026 — Admina-RH V1.2**
