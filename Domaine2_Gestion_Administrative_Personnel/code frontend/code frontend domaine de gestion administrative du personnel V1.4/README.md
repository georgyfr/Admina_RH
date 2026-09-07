# Admina-RH — Domaine 2 : Gestion Administrative du Personnel (V1.4)

## Vue d'ensemble

Application web React 19 + Vite 8 + MUI 9 déployée sur Cloudflare Pages.
URL production : https://admina-rh-bd0.pages.dev/domaine2_Gestion_Administrative_Personnel

## Modules implémentés (V1.4)

### Domaine 2 — Gestion Administrative du Personnel

| Module | Prompts | Statut |
|--------|---------|--------|
| **Avenants** | Étapes 1-7 + Master Prompt | ✅ Complet |
| **Suivi Documents** (T_Documents) | Prompts 1-6 + enrichissement | ✅ Complet |
| **Données Bancaires** (T_Bancaire) | Prompts 1-6 | ✅ Complet |
| **Mutuelle Prévoyance** (T_Mutuelle) | Prompts 1-6 + KPI interactifs + interactivité lignes | ✅ Complet |
| **Autorisations & Permis** (T_Permis) | Prompts 1-6 + KPI interactifs + design turquoise distinctif | ✅ Complet |

## Fonctionnalités V1.4

### KPI Interactifs (centre de commande opérationnel)
- Chaque KPI est cliquable et ouvre un pop-up contextuel
- Actions groupées : Renouveler sélection / Renouveler tout
- Renouvellement intelligent selon le type (CNI +10 ans, Passeport +5 ans, Permis travail +2 ans, etc.)
- KPI auto-refresh après chaque action

### Interactivité lignes (7 actions par ligne)
- 👤 Voir fiche employé · ✏️ Modifier · 🔄 Renouveler
- ➕ Personnes à charge · 📊 Fiche complète · 📋 Exporter ligne · 🗑️ Supprimer

### Design distinctif par module
- **Mutuelle** : Thème VIOLET (#7e3ff2)
- **Permis** : Thème TURQUOISE (#0ea5e9) + jauge circulaire SVG + widget "Prochaines échéances"

### Exports sécurisés (ISO 9001)
- Export PDF (vue filtrée, N° Adhérent/Permis masqué RGPD)
- Export Paie (N° complet, protégé par mot de passe)
- Rapport Audit (tous les enregistrements, triés Employé + Date)

### Système d'alertes (ISO 30401)
- Bandeau d'alertes avec compteur d'anomalies
- Configuration destinataires + fréquence + activation
- Email récapitulatif + audit trail

### Conformité ISO
- ISO 30401:2018 — Traçabilité des actions (audit trail)
- ISO 30408:2016 — Accès à l'information (Fiche Employé enrichie)
- ISO 30414:2018 — Reporting (KPI + graphiques + exports)
- ISO 9001:2015 — Maîtrise des documents (journalisation exports)

## Stack technique

- **React** 19.2 + **Vite** 8.2 + **TypeScript** 5
- **MUI** 9.4 (Material UI) + **Lucide** icons
- **Recharts** 3.10 (graphiques dynamiques)
- **React Router** 7.18
- **Cloudflare Pages** (wrangler deployment)

## Installation

```bash
cd "code frontend domaine de gestion administrative du personnel V1.4"
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
