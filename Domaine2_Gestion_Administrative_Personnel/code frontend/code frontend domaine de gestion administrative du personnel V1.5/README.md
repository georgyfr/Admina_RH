# Admina-RH — Domaine 2 : Gestion Administrative du Personnel (V1.5)

## Vue d'ensemble

Application web React 19 + Vite 8 + MUI 9 déployée sur Cloudflare Pages.
URL production : https://admina-rh-bd0.pages.dev/domaine2_Gestion_Administrative_Personnel

## Modules implémentés (V1.5)

### Domaine 2 — Gestion Administrative du Personnel

| Module | Prompts | Statut |
|--------|---------|--------|
| **Avenants** | Étapes 1-7 + Master Prompt | ✅ Complet |
| **Suivi Documents** (T_Documents) | Prompts 1-6 + enrichissement | ✅ Complet |
| **Données Bancaires** (T_Bancaire) | Prompts 1-6 | ✅ Complet |
| **Mutuelle Prévoyance** (T_Mutuelle) | Prompts 1-6 + KPI interactifs + interactivité lignes | ✅ Complet |
| **Autorisations & Permis** (T_Permis) | Prompts 1-6 + KPI interactifs + design turquoise distinctif | ✅ Complet |
| **Congés Annuels** (T_Conges) | Prompts 1-5 + KPI interactifs + interconnexions + RACI + audit | ✅ Complet |

## Nouveautés V1.5

### Module Congés Annuels (T_Conges) — Prompts 1-5 complets

**Prompt 1 — Tableau de Bord de Synthèse (KPI & Graphiques)**
- 4 KPI cards cliquables (Demandes en attente, Approuvés, Taux d'utilisation, Alertes solde critique)
- 3 graphiques Recharts (PieChart donut type, BarChart évolution mensuelle, PieChart donut statut)
- 5 filtres globaux (Mois, Année, Département, Type, Statut)
- Alertes (demandes en attente > 5 jours, prochains retours de congé)

**Prompt 2 — Liste de Gestion des Demandes (Tableau Interactif)**
- Tableau avec 12 colonnes (N°, Employé, Dépt, Type, Du, Au, Jours, Motif, Statut, Approb, Actions)
- Tri par colonne (8 colonnes triables avec flèches ↑/↓)
- Checkboxes + actions en masse (Approuver/Refuser sélection)
- Surbrillance pour demandes en attente > 7 jours
- Popover solde employé
- Actions contextuelles par statut (👁️ Détail, 📊 Solde, 📜 Historique, ✏️ Modifier, ✅ Approuver, ❌ Refuser, 🗑️ Supprimer)
- 4 dialogs (Détail, Modification, Suppression, Solde critique)

**Prompt 3 — Formulaire Nouvelle Demande (Modale Contextuelle)**
- Autocomplete employé (recherche par nom/matricule)
- Pré-remplissage automatique (nom, matricule, département, poste, solde coloré)
- Calcul dynamique du nombre de jours en temps réel
- Solde après demande (temps réel, rouge si insuffisant)
- Détection de chevauchement + checkbox "Forcer" (admin)
- Validation cohérence dates (fin >= début)
- Checkboxes (Notifier manager, Envoyer copie)
- Spinner de soumission

**Prompt 4 — Interconnexions Stratégiques**
- triggerInterconnexions() appelé après chaque action
- refreshSoldesConges() → recalcul temps réel des soldes
- genererRappelsRetourConge() → création automatique de rappels (date_fin ≤ 3 jours)
- getCongesKPIs() → KPI temps réel pour Tableau de Bord
- Panneau "Interconnexions actives" avec 4 chips (Solde Congés, Rappels Admin, Tableau de Bord, Fiche Employé)

**Prompt 5 — Conformité ISO & Design**
- Sélecteur de rôle RACI (Responsable Admin RH, Manager, Assistant RH, Employé)
- Permissions appliquées (canApprove, canDelete, canEdit, canViewHistory)
- Chips de conformité (ISO 9001:2015, ISO 30401:2018, Audit count, WCAG 2.1 AA, RGPD ✓)
- Audit trail (logAction pour chaque action avec timestamp, user, old/new value)
- Dialog Historique (DRH uniquement) avec table 5 colonnes
- Widget Feedback (évaluation 1-5 étoiles + commentaire)

### KPI Interactifs (Congés)
- Chaque KPI ouvre un popup contextuel avec liste + actions groupées
- Approuver sélection / Tout approuver / Refuser sélection
- Table avec checkboxes pour sélection multiple

## Stack technique

- **React** 19.2 + **Vite** 8.2 + **TypeScript** 5
- **MUI** 9.4 (Material UI) + Lucide icons
- **Recharts** 3.10 (graphiques dynamiques)
- **React Router** 7.18
- **Cloudflare Pages** (wrangler deployment)

## Installation

```bash
cd "code frontend domaine de gestion administrative du personnel V1.5"
bun install
bun run dev    # développement
bun run build  # production
```

## Déploiement

```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=3550353ef78072b2af2f047006eef5c5 \
  npx wrangler pages deploy dist --project-name admina-rh --branch main --skip-caching
```

URL : https://admina-rh-bd0.pages.dev/domaine2_Gestion_Administrative_Personnel
