# Admina-RH — Code Frontend V1.3

**Version :** V1.3 (release Cloudflare Pages du 05/09/2026)
**URL production :** https://admina-rh-bd0.pages.dev
**Stack :** React 19 + Vite 8 + MUI 9 + Recharts 3 + React Router 7

---

## 📋 Description

Cette version V1.3 contient l'**intégralité du code déployé sur Cloudflare Pages**, incluant :

- **Domaine 1 — Recrutement & Candidats** (35 écrans)
- **Domaine 2 — Gestion Administrative du Personnel** (34 fichiers, 22+ écrans)

### Nouveautés V1.3 (vs V1.2)

#### Module Données Bancaires complet (6 prompts) :
- **PROMPT 1** : Structuration T_Bancaire (12 colonnes A-L, RECHERCHEX, Statut + Alerte auto)
- **PROMPT 2** : Filtres dynamiques (Banque, Statut, Compte Principal, Alerte, Recherche) + FILTRE Excel
- **PROMPT 3** : Alertes conformité (7 priorités : RIB manquant, RIB dupliqué, Principal manquant, Expiré, >1 an, À vérifier, OK) + 3 graphiques (PieChart, BarChart, Histogramme) + Taux conformité + Système d'alertes email
- **PROMPT 4** : Actions individuelles (👤 Fiche, ✏️ Modifier, 📌 Basculer Principal) + Checkbox + actions groupées + Audit trail
- **PROMPT 5** : Intégration Fiche Employé (alertes + FILTRE + hyperlien + indicateur en-tête)
- **PROMPT 6** : Export sécurisé (PDF RGPD + Export Paie RIB complet protégé + Rapport Audit)

#### Module Suivi Documents complet (6 étapes + enrichissement) :
- T_Documents (16 colonnes A-P), filtres dynamiques, alertes email, actions, tableau de bord (6 KPI + 3 graphiques), interconnexion, colonne Alerte

#### Module Avenants enrichi (Master Prompt) :
- Formulaires avec validations, workflow 4 boutons, bouclage auto, modèle PDF, historique

---

## 📁 Structure

```
V1.3/
├── src/
│   ├── App.jsx                    # Routing principal (D1 + D2)
│   ├── pages/
│   │   ├── *.jsx                  # 35 écrans Domaine 1
│   │   └── domaine2/              # 34 fichiers Domaine 2
│   │       ├── data.js            # Base + helpers (calculerStatutDoc, calculerAlerteBancaireEnrichie, etc.)
│   │       ├── SuiviDocumentsD2.jsx    # Suivi Documents (6 étapes)
│   │       ├── SuiviBancairesD2.jsx    # Données Bancaires (6 prompts)
│   │       ├── AvenantsModule.jsx      # Avenants (Master Prompt)
│   │       ├── ModeleAvenantPDF.jsx   # Modèle PDF avenant
│   │       ├── ContratsD2.jsx          # Contrats + bouclage RECHERCHEX
│   │       ├── FicheEmploye.jsx        # Fiche Employé (11 tabs)
│   │       └── ... (27 autres fichiers)
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

**Généré le 05/09/2026 — Admina-RH V1.3**
