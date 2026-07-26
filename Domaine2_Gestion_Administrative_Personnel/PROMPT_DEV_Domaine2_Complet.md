# ============================================================================
# PROMPT DE DEVELOPPEMENT — Admina_RH Domaine 2
# Gestion Administrative du Personnel — Interface Complete
# ============================================================================

## CONTEXTE

Tu developpes le **Domaine 2 — Gestion Administrative du Personnel** d'un SaaS/ERP RH appele **Admina_RH**.

- **Stack technique** : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase (PostgreSQL)
- **Deploiement cible** : Cloudflare Workers
- **Schema BDD** : `admina_rh` sur Supabase (projet `aywwakllgvfoqlpowzqf`)
- **Architecture** : Multi-tenant (tenant_id UUID sur chaque table)
- **Etat actuel** : L'application deployee est un scaffold Next.js VIDE (0% implemente). Tu dois construire TOUT le Domaine 2 depuis zero.

## ARCHITECTURE DE NAVIGATION

### Layout principal
```
+------------------------------------------+
| HEADER: Logo Admina_RH | Search | Notif | Avatar |
+--------+---------------------------------+
| SIDEBAR|  MAIN CONTENT AREA               |
|        |                                  |
| D1 Recr|  [Contenu dynamique]             |
| > D2 Ad|                                  |
| D3 For|                                  |
| D4 Paie|                                  |
| D5 Per|                                  |
| D6 Car|                                  |
| ...   |                                  |
+--------+---------------------------------+
```

### Arborescence des routes (Domaine 2)
```
/app
  /domaine-2                                    → Tableau de Bord D2
  /domaine-2/employes                           → Fiche Employe (liste)
  /domaine-2/employes/[id]                      → Fiche Employe (detail)
  /domaine-2/contrats                            → Contrats Travail
  /domaine-2/contrats/[id]                       → Detail contrat
  /domaine-2/avenants                            → Avenants Contrat
  /domaine-2/documents                           → Suivi Documents
  /domaine-2/bancaires                           → Donnees Bancaires
  /domaine-2/mutuelle                            → Mutuelle & Prevoyance
  /domaine-2/conges                              → Conges Annuels (liste demandes)
  /domaine-2/conges/nouveau                      → Nouvelle demande
  /domaine-2/conges/soldes                       → Solde Conges
  /domaine-2/absences                            → Absences Maladie
  /domaine-2/heures-supp                         → Heures Supplementaires
  /domaine-2/pointage                            → Pointage Presence
  /domaine-2/planning                            → Planning Mensuel
  /domaine-2/paie                                → Fiches de Paie
  /domaine-2/declarations                        → Declarations Sociales
  /domaine-2/permis                              → Autorisations Permis
  /domaine-2/departs                             → Dossiers Departs
  /domaine-2/archivage                           → Archivage Documents
  /domaine-2/rappels                             → Rappels Admin
  /domaine-2/prets                               → Prets & Avances
  /domaine-2/sanctions                           → Sanctions Disciplinaires
  /domaine-2/visites-medicales                   → Visites Medicales
```

## TABLES SUPABASE EXISTANTES (15 tables)

Toutes dans le schema `admina_rh` avec `tenant_id` + `employee_id` FK + `created_at`/`updated_at` :

1. **employees** (23 cols) → matricule, civilite, nom, prenom, date_naissance, lieu_naissance, genre, nationalite, situation_familiale, telephone, email, adresse, department_id, position_id, type_contrat, categorie, regime_travail, date_embauche, salaire_brut, lieu_travail, statut, photo_url, notes
2. **d02_contracts** (10 cols) → contract_number, type_contrat, date_debut, date_fin, salaire_brut, regime_travail, lieu_travail, observations, statut
3. **d02_contract_amendments** (10 cols) → contract_id, amendment_number, date_avenant, type_modification, ancienne_valeur, nouvelle_valeur, motif, date_effet, statut
4. **d02_employee_documents** (9 cols) → document_number, type_document, numero_document, date_emission, date_expiration, statut, lieu_depot, notes
5. **d02_bank_details** (6 cols) → banque, agence, rib, is_principal, statut
6. **d02_insurance_enrollments** (9 cols) → organisme, numero_adherent, date_adhesion, couverture, personnes_a_charge, cotisation_mensuelle, cotisation_annuelle, statut
7. **d02_pay_slips** (9 cols) → mois, salaire_brut, cotisations, taux_charges, net_a_payer, mode_paie, date_paiement, statut
8. **d02_social_declarations** (9 cols) → organisme, type_declaration, periode, montant, date_soumission, date_echeance, nombre_salaries, observations, statut
9. **d02_work_permits** (8 cols) → permit_number, type_permit, numero_permit, date_delivrance, date_expiration, autorite, statut
10. **d02_departures** (9 cols) → date_depart, motif_depart, date_notification, solde_conges_jours, dernier_salaire, indemnite, documents_remis, statut_dossier
11. **d02_document_archives** (7 cols) → type_document, date_archive, lieu_stockage, duree_conservation, responsable, observations
12. **d02_reminders** (7 cols) → type_rappel, description, date_echeance, statut, responsable_suivi, action_requise
13. **d02_loans** (12 cols) → type_pret, montant_demande, montant_accorde, taux_interet, mensualite, duree_mois, date_demande, date_debut_remboursement, solde_restant, statut, observations
14. **d02_sanctions** (10 cols) → type_sanction, faute_commise, date_faute, date_notification, date_execution, duree_suspension_jours, observations, statut, valide_par
15. **d02_medical_visits** (11 cols) → type_visite, medecin_structure, date_visite, date_prochaine_visite, resultat, aptitude, restrictions, cout, prise_en_charge, observations

**Tables manquantes a creer (SQL dans le repo)** : d02_leave_requests, d02_leave_balances, d02_absences, d02_overtime_hours, d02_attendance_records, d02_monthly_planning.

**Tables reference** : `ref_departments` (code, name, description, manager_id, is_active), `ref_positions` (code, title, family, department_id, classification, is_active)

## 22 ECRANS A DEVELOPPER (dans l'ordre de priorite)

### === PHASE 1 : Tableau de Bord + Fiche Employe ===

#### ECRAN 1: Tableau de Bord D2 (`/domaine-2`)
**Type**: Dashboard avec KPI cards + mini-tableaux
**Composants**:
- 4 KPI cards en haut: Effectif Total, Contrats en vigueur, Masse salariale brute, Taux presence moyen
- Repartition par departement (bar chart horizontal)
- Repartition par type de contrat (donut chart)
- Liste des derniers rappels admin (5 derniers)
- Liste des conges en attente (5 derniers)
- Badge "Documents a renouveler" avec compteur
**Donnees**: Aggregation depuis employees, d02_contracts, d02_reminders, d02_leave_balances
**Design**: Grid responsive, cards avec icone + valeur + tendance

#### ECRAN 2: Liste Employes (`/domaine-2/employes`)
**Type**: DataTable avec filtres + recherche
**Composants**:
- Barre de recherche (nom, matricule, email)
- Filtres: Departement (dropdown), Statut (dropdown), Type Contrat (dropdown)
- DataTable colonnes: Matricule, Nom complet, Poste, Departement, Type Contrat, Date Embauche, Statut (badge couleur)
- Actions: Voir detail, Modifier, Supprimer (soft)
- Bouton "+ Nouvel Employe"
- Pagination (20 par page)
- Export CSV/Excel
**Composants shadcn**: Table, Input, Select, Button, Badge, DropdownMenu, Pagination

#### ECRAN 3: Detail Employe (`/domaine-2/employes/[id]`)
**Type**: Page detail avec tabs
**Composants**:
- Header: Avatar + Nom + Poste + Badge statut + Boutons Editer/Archiver
- Tabs: Informations | Contrat | Documents | Bancaire | Mutuelle | Conges | Paie | Sanctions | Visites
- Tab Informations: Grille 2 colonnes (readonly) avec tous les champs de `employees`
- Tab Contrat: Historique des contrats + avenants (sous-table)
- Tab Documents: Liste des documents avec statut expiration (badge vert/rouge)
- Tab Bancaire: Coordonnees bancaires
- Tab Mutuelle: Details assurance
- Tab Conges: Solde + historique demandes
- Tab Paie: Historique fiches de paie (3 derniers mois)
- Tab Sanctions: Historique
- Tab Visites: Historique visites medicales
**Composants shadcn**: Tabs, Card, Avatar, Badge, Button, Dialog

### === PHASE 2 : Gestion Contractuelle & Documentaire ===

#### ECRAN 4: Contrats Travail (`/domaine-2/contrats`)
**Type**: DataTable
**Colonnes**: N Contrat, Employe (nom), Type Contrat (badge), Date Debut, Date Fin, Salaire Brut (FCFA), Regime, Statut
**Filtres**: Statut, Type Contrat, Departement
**Actions**: Voir, Modifier, Creer avenant, Dupliquer
**Alerte**: Badge rouge si contrat expire dans < 30 jours

#### ECRAN 5: Avenants Contrat (`/domaine-2/avenants`)
**Type**: DataTable
**Colonnes**: N Avenant, N Contrat, Employe, Date, Type Modification, Ancienne/Nouvelle Valeur, Statut
**Filtres**: Type Modification, Statut

#### ECRAN 6: Suivi Documents (`/domaine-2/documents`)
**Type**: DataTable avec alertes expiration
**Colonnes**: Employe, Type Document, N Document, Date Emission, Date Expiration, Jours Restants (badge couleur), Statut, Lieu Depot
**Alerte**: Ligne en rouge si expires dans < 15 jours

#### ECRAN 7: Donnees Bancaires (`/domaine-2/bancaires`)
**Type**: DataTable
**Colonnes**: Employe, Banque, Agence, RIB (masque partiel), Compte Principal (oui/non), Statut

#### ECRAN 8: Mutuelle Prevoyance (`/domaine-2/mutuelle`)
**Type**: DataTable
**Colonnes**: Employe, Organisme, N Adherent, Date Adhesion, Couverture, Personnes a Charge, Cotisation Mensuelle, Statut

#### ECRAN 9: Autorisations Permis (`/domaine-2/permis`)
**Type**: DataTable
**Colonnes**: Employe, Type Permis, N Permis, Date Delivrance, Date Expiration, Jours Restants (badge), Autorite, Statut

### === PHASE 3 : Conges, Absences & Pointage ===

#### ECRAN 10: Conges Annuels (`/domaine-2/conges`)
**Type**: DataTable + formulaire de demande
**Colonnes**: Employe, Type Conge (badge couleur), Date Debut, Date Fin, Nombre Jours, Motif, Statut (badge: en_attente=jaune, approuvee=vert, rejetee=rouge), Approbateur
**Boutons**: "+ Nouvelle Demande" (Dialog/Sheet)
**Formulaire demande**: Employee (select), Type conge, Date debut, Date fin (auto-calc nombre jours), Motif (textarea)
**Workflow**: Employe soumet → Manager valide/refuse

#### ECRAN 11: Solde Conges (`/domaine-2/conges/soldes`)
**Type**: DataTable avec barres de progression
**Colonnes**: Employe, Droit Annuel (jrs), Conges Pris (jrs), Solde Disponible (jrs) [barre verte/rouge], Conges en Cours, Report N-1, Taux Utilisation (%)
**Annee**: Selecteur d'annee en haut

#### ECRAN 12: Absences Maladie (`/domaine-2/absences`)
**Type**: DataTable
**Colonnes**: Employe, Type Absence, Date Debut, Date Fin, Duree (jours), Justificatif (icone upload), Statut, Motif, Observations

#### ECRAN 13: Heures Supplementaires (`/domaine-2/heures-supp`)
**Type**: DataTable
**Colonnes**: Employe, Semaine, Heures Normales, Heures Supp (badge), Taux Majoration (%), Montant (FCFA), Montant Calcule (FCFA), Statut, Valide Par

#### ECRAN 14: Pointage Presence (`/domaine-2/pointage`)
**Type**: DataTable + synthese
**Colonnes**: Employe, Semaine, Jours Presents, Jours Absents, Retards (min), Heures Supp, Taux Presence (% barre), Observations

#### ECRAN 15: Planning Mensuel (`/domaine-2/planning`)
**Type**: Calendar view + DataTable toggle
**Vue Calendar**: Grille mensuelle par employe (vert=present, rouge=absent, orange=retard)
**Vue Table**: Employe, Departement, Poste, Mois, Jours Ouvrables, Jours Presents, Jours Absents, Retards, Heures Supp, Taux Presence

### === PHASE 4 : Paie, Conformite & Suivi ===

#### ECRAN 16: Fiches de Paie (`/domaine-2/paie`)
**Type**: DataTable + preview
**Colonnes**: Employe, Mois, Salaire Brut, Cotisations, Net a Payer, Mode Paiement, Date Paiement, Statut
**Action**: "+ Generer Fiche" (Dialog), Telecharger PDF, Envoyer par email

#### ECRAN 17: Declarations Sociales (`/domaine-2/declarations`)
**Type**: DataTable
**Colonnes**: Organisme, Type Declaration, Periode, Montant (FCFA), Date Soumission, Date Echeance (badge si en retard), Nombre Salaries, Statut, Observations

#### ECRAN 18: Prets & Avances (`/domaine-2/prets`)
**Type**: DataTable + calculateur
**Colonnes**: Employe, Type Pret, Montant Demande, Montant Accorde, Taux Interet, Mensualite, Duree, Solde Restant (barre), Statut, Observations
**Dialog calcul**: Saisir montant + taux + duree → auto-calc mensualite

#### ECRAN 19: Sanctions Disciplinaires (`/domaine-2/sanctions`)
**Type**: DataTable
**Colonnes**: Employe, Type Sanction (badge: oral=jaune, ecrit=orange, blame=rouge, suspension=violet), Faute Commise, Date Faute, Date Notification, Duree Suspension, Statut, Valide Par

#### ECRAN 20: Visites Medicales (`/domaine-2/visites-medicales`)
**Type**: DataTable + rappels
**Colonnes**: Employe, Type Visite, Medecin/Structure, Date Visite, Prochaine Visite (badge si < 15 jours), Resultat, Aptitude (badge vert/rouge), Restrictions, Cout, Pris en Charge, Observations

### === PHASE 5 : Sortie & Pilotage ===

#### ECRAN 21: Dossiers Departs (`/domaine-2/departs`)
**Type**: DataTable + checklist
**Colonnes**: Employe, Date Depart, Motif Depart, Date Notification, Solde Conges, Dernier Salaire, Indemnite, Documents Remis (checklist), Statut Dossier
**Checklist documents**: Contrat, Attestation, Solde tout compte, Certificat travail

#### ECRAN 22: Archivage (`/domaine-2/archivage`)
**Type**: DataTable
**Colonnes**: Employe, Type Document, Date Archive, Lieu Stockage, Duree Conservation, Responsable, Observations

#### ECRAN 22b: Rappels Admin (`/domaine-2/rappels`)
**Type**: DataTable avec timeline
**Colonnes**: Employe, Type Rappel (icone), Description, Date Echeance (badge si en retard), Jours Restants, Statut, Responsable Suivi, Action Requise
**Tri par defaut**: Date echeance croissante

## DESIGN SYSTEM

### Palette de couleurs
```
Primary:      #1B4F72 (bleu marine fonce)
Secondary:    #2E86C1 (bleu moyen)
Accent:       #27AE60 (vert succes)
Warning:      #F39C12 (orange)
Danger:       #E74C3C (rouge)
Background:   #F8F9FA (gris tres clair)
Card:         #FFFFFF
Text:         #2C3E50 (gris fonce)
Text muted:   #7F8C8D (gris moyen)
Border:       #E5E7EB
```

### Composants shadcn/ui a utiliser
- Layout: Sidebar (collapsible), Header, Main
- Data: DataTable (avec sorting, filtering, pagination)
- Forms: Input, Select, Textarea, DatePicker, Switch, Checkbox
- Feedback: Dialog, Sheet (slide-over), AlertDialog, Toast, Badge, Alert
- Navigation: Tabs, Breadcrumbs, Command (search)
- Display: Card, Avatar, Tooltip, Separator, Skeleton
- Charts: Recharts (bar, donut, line) pour le dashboard

### Typographie
- Titres: font-semibold, text-slate-900
- Labels: text-sm font-medium text-slate-700
- Data: text-sm text-slate-600
- Montants: font-mono text-right

### Patterns UX
- **List pages**: Filtres en haut (sticky) → Table → Pagination en bas
- **Detail pages**: Header avec retour → Tabs → Contenu
- **Forms**: Dialog (creation rapide) ou Page dedicate (formulaire complexe)
- **Statuts**: Badge avec couleur (vert=actif, rouge=inactif, jaune=en_attente, gris=brouillon)
- **Montants**: Format `1 234 567 FCFA` avec separateur milliers
- **Dates**: Format `DD/MM/YYYY`
- **Empty states**: Illustration + texte + bouton d'action
- **Loading**: Skeleton cards/table rows
- **Confirmation**: AlertDialog avant suppression/action irreversible

## REGLES TECHNIQUES

### App Router (Next.js 15)
- Chaque ecran = 1 dossier dans `/app/(dashboard)/domaine-2/`
- Server Components par defaut, Client Components seulement si interactif
- Donnees via Supabase client (cote client) ou direct DB (cote server)

### Supabase Integration
- `@supabase/supabase-js` avec `createClient()`
- RLS: `app.tenant_id` doit etre set dans les headers
- Queries avec filtre `tenant_id` obligatoire
- Realtime subscription pour les notifications conges/approbations

### Multi-tenant
- Chaque requete doit filtrer par `tenant_id`
- Le tenant_id est stocke dans un context React (TenantProvider)

### Performance
- Server-side rendering pour les DataTables (pas de fetch client cote)
- Suspense boundaries avec Skeleton loaders
- Pagination coté serveur (cursor-based ou offset)

### Securite
- Toutes les mutations (create/update/delete) via Server Actions
- Validation des donnees avec Zod
- Pas de donnees sensibles en clair dans le DOM (RIB masque: `****1234`)

## LIVRABLES ATTENDUS

1. **Layout** : Sidebar + Header + Main responsive
2. **22 ecrans** fonctionnels (listes, details, formulaires)
3. **Dashboard** avec KPI cards et charts Recharts
4. **Server Actions** pour toutes les operations CRUD
5. **Zod schemas** pour la validation des formulaires
6. **Types TypeScript** pour toutes les entites BDD
7. **Composants reutilisables** : StatusBadge, MontantCell, DateCell, EmptyState
8. **Navigation** : Sidebar avec liens D1-D31, D2 expande avec sous-menus

## CONTRAINTES
- NE PAS modifier les tables existantes dans Supabase
- NE PAS implementer l'authentification (elle sera geree separement)
- Utiliser les noms de colonnes EXACTS de la BDD (snake_case)
- Toutes les interfaces en FRANCAIS
- Mobile-first responsive
- Accessibilite: labels ARIA, navigation clavier, contrastes WCAG AA
