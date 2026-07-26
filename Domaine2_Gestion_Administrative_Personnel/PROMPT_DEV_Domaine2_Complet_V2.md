# ============================================================================
# PROMPT DE DEVELOPPEMENT V2 — Admina_RH Domaine 2
# Gestion Administrative du Personnel — Specification Complete de Production
# ============================================================================
# Version : 2.0
# Reference documentaire : Manuel de Procedures RH Domaine 2 (ISO 30401:2018 + ISO 9001:2015)
# Source d'analyse : 27 analyses VLM (Manuel 17 pages + Interconnexion D1-D2 6 pages + 4 schemas techniques)
# Cible : Specification production-ready executable par un AI developer
# ============================================================================

## 0. RESUME EXECUTIF

Tu developpes le **Domaine 2 - Gestion Administrative du Personnel** d'un SaaS/ERP RH appele **Admina_RH**.
Ce domaine couvre l'ensemble du cycle de vie administratif d'un employe (de la fiche employe au depart),
structure en **22 feuilles de gestion interconnectees** selon un flux processuel en **5 phases**.

Le present prompt COMPLETE la version 1 en ajoutant :
- Le referentiel normatif ISO 30401:2018 + ISO 9001:2015
- Les 7 objectifs strategiques et leurs KPIs cibles
- Le cycle PDCA d'amelioration continue
- Les 6 acteurs et la matrice RACI detaillee
- Les 22 procedures operationnelles pas-a-pas
- Les workflows d'approbation (conges, HS, sanctions, departs)
- Les regles metier et formules de calcul (conges, HS, paie, indemnite, pret)
- La matrice des formules VLOOKUP a implementer (18 feuilles satellites)
- Les KPIs detailles du Tableau de Bord (12+ indicateurs)
- L'interconnexion bilaterale D1-D2 (5 points d'interconnexion IC-D1-D2-01 a 05)
- Le process ISO complet (6 processus : Entree -> Quotidien -> Conges -> Paie -> Documents -> Sortie)

---

## 1. CONTEXTE

- **Stack technique** : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase (PostgreSQL)
- **Deploiement cible** : Cloudflare Workers
- **Schema BDD** : `admina_rh` sur Supabase (projet `aywwakllgvfoqlpowzqf`)
- **Architecture** : Multi-tenant (tenant_id UUID sur chaque table, RLS active)
- **Etat actuel** : L'application deployee est un scaffold Next.js VIDE (0% implemente). Tu dois construire TOUT le Domaine 2 depuis zero.

---

## 2. REFERENTIEL NORMATIF

Le Domaine 2 est conforme aux normes suivantes. Toutes les procedures, ecrans et logs doivent respecter ces exigences :

| Norme | Article | Exigence applicable au Domaine 2 |
|:------|:--------|:--------------------------------|
| **ISO 30401:2018** | Art. 5.3 | Roles, responsabilites et autorites defines (matrice RACI) |
| **ISO 30401:2018** | Art. 9 | Evaluation des performances (KPIs) |
| **ISO 30401:2018** | Art. 10 | Amelioration continue (cycle PDCA) |
| **ISO 9001:2015** | 7.1.2 | Ressources humaines (competences, sensibilisation) |
| **ISO 9001:2015** | 7.5 | Information documentee (maitrise des documents et enregistrements) |
| **ISO 9001:2015** | 9.1 | Surveillance, mesure, analyse et evaluation |
| **ISO 9001:2015** | 9.2 | Audit interne (verification de l'application des processus) |
| **ISO 9001:2015** | 9.3 | Revue de direction (trimestrielle) |
| **ISO 9001:2015** | 10.3 | Amelioration continue (boucle PDCA) |
| **ISO 10667:2011** | - | Services de conseil en recrutement (lien D1-D2) |
| **ISO 22400-3:2022** | - | Indicateurs de performance RH (KPIs standardises) |

### Metadata documentaire (a afficher en pied de page des ecrans)
- **REFERENTIEL** : ISO 30401:2018 + ISO 9001:2015
- **DOMAINE** : D2 - Gestion Administrative du Personnel
- **CLASSIFICATION** : Document Interne - Processus GRH
- **VERSION** : 1.0

---

## 3. OBJECTIFS STRATEGIQUES & KPIs CIBLES

Le Domaine 2 poursuit **7 objectifs strategiques** mesurables. Chaque ecran doit permettre le pilotage de ces objectifs.

| Code | Objectif | Cible / Indicateur | Ecran de pilotage |
|:-----|:---------|:-------------------|:------------------|
| **Obj. 1** | Completude des dossiers | **100%** des fiches employes completes et a jour | Tableau de Bord + Liste Employes |
| **Obj. 2** | Conformite contractuelle | **0%** de contrats echus sans renouvellement | Contrats + Rappels |
| **Obj. 3** | Ponctualite de la paie | **100%** des fiches de paie generees avant le 5 du mois | Paie + Declarations |
| **Obj. 4** | Taux de presence cible | Taux de presence mensuel **> 95%** | Pointage + Planning |
| **Obj. 5** | Conformite declarations | **0** declaration sociale en retard | Declarations Sociales |
| **Obj. 6** | Archivage a jour | **100%** des documents archives dans les delais | Archivage + Rappels |
| **Obj. 7** | Satisfaction administrative | Score de satisfaction **> 80%** | Tableau de Bord |

---

## 4. CYCLE PDCA D'AMELIORATION CONTINUE

Le Domaine 2 applique le cycle **PDCA** (Plan-Do-Check-Act) de Deming, revu **trimestriellement** lors des revues de direction RH. Implementer une page `/domaine-2/pdca` permettant de visualiser le cycle et les actions en cours.

| Phase | Action Domaine 2 | Frequence |
|:------|:-----------------|:----------|
| **PLAN** | Definir objectifs, KPIs cibles, identifier risques, planifier actions d'amelioration | Annuel + Trimestriel |
| **DO** | Mettre en oeuvre les procedures, saisir les 22 feuilles, appliquer les formules d'interconnexion, alimenter le Tableau de Bord | Quotidien |
| **CHECK** | Analyser les KPIs, comparer aux objectifs, identifier ecarts et non-conformites, realiser audits internes | Trimestriel + Semestriel |
| **ACT** | Corriger les non-conformites, actions preventives, mettre a jour les procedures et formules, capitaliser | Continu |

### 4.1 Revues de Direction (exigence ISO 9001 §9.3)
- **Frequence** : Trimestrielle
- **Contenu** : Analyse des KPIs du Tableau de Bord, examen des non-conformites, evaluation des actions correctives precedentes, identification des risques emergents, actualisation des objectifs
- **Livrable** : Compte-rendu documente, actions suivies jusqu'a realisation complete

### 4.2 Audits Internes (exigence ISO 9001 §9.2)
- **Frequence** : Semestrielle
- **Conformites verifiees** : Completude des fiches employes, coherence des donnees entre feuilles interconnectees, respect des delais de declaration sociale, qualite de l'archivage, efficacite du systeme de rappels
- **Classification des constats** :
  1. Observations
  2. Non-conformites mineures
  3. Non-conformites majeures

### 4.3 Traitement des Non-Conformites
Toute non-conformite detectee (donnee incoherente, delai depasse, document manquant, formule erronnee) suit le processus suivant :

1. **Detection** de la non-conformite
2. **Enregistrement** par le responsable admin RH dans un registre dedie
3. **Identification de la cause racine** (methode des **5 Pourquoi** ou **diagramme d'Ishikawa**)
4. **Proposition d'une action corrective**
5. **Mise en oeuvre de la correction**
6. **Verification de l'efficacite**
7. **Tracabilite** dans un registre des non-conformites
8. **Alimentation des revues de direction**

> Implementer une table `d02_non_conformities` et un ecran `/domaine-2/non-conformites` pour tracer ce processus.

---

## 5. ACTEURS & MATRICE RACI

Le Domaine 2 implique **6 acteurs principaux**. Leurs responsabilites sont formalisees dans une matrice RACI (Responsible, Approbateur, Consulte, Informe) qui elimine les ambiguïtes decisionnelles.

### 5.1 Acteurs

| Acteur | Responsabilites principales |
|:-------|:---------------------------|
| **Directeur RH** | Pilotage strategique du domaine, approbation des procedures, validation des indicateurs de performance, interface avec la direction generale |
| **Responsable Admin RH** | Supervision quotidienne des 22 feuilles, coordination des saisies, controle de qualite des donnees, generation des rapports |
| **Assistant RH** | Saisie des donnees dans les feuilles operationnelles, suivi des echeances, gestion des rappels administratifs, archivage des documents |
| **Manager Hierarchique** | Validation des demandes de conges, approbation des heures supplementaires, signalement des absences, controle de la presence de son equipe |
| **Comptable Paie** | Preparation des fiches de paie, calcul des cotisations, soumission des declarations sociales, suivi des prets et avances |
| **Employe** | Fourniture des informations personnelles, verification de ses donnees, demande de conges et autorisations, consultation de ses documents |

### 5.2 Matrice RACI detaillee par processus

**Legende** : R = Responsible (execute) | A = Approbateur (valide) | C = Consulte | I = Informe

| Processus | Dir. RH | Resp. Admin | Assist. RH | Manager | Comptable | Employe |
|:----------|:-------:|:-----------:|:----------:|:-------:|:---------:|:-------:|
| **Fiche Employe** | A | R | R | C | I | I |
| **Contrats Travail** | A | R | R | I | I | C |
| **Conges et Absences** | I | A | R | R | I | R |
| **Pointage et Presence** | I | A | R | R | I | I |
| **Paie et Declarations** | A | C | I | I | R | I |
| **Dossiers Departs** | A | R | R | C | C | I |
| **Tableau de Bord** | A | R | R | I | C | I |

### 5.3 Matrice RACI etendue (processus ISO)

| Processus ISO | R | A | C | I |
|:--------------|:--|:--|:--|:--|
| 1. Entree (Onboarding) | Assistant RH | DRH/Direction | Manager/Juridique | IT/Finance |
| 2. Quotidien (Life Cycle) | Employe/Assistant | Manager | Medecin du travail | Paie |
| 3. Conges & Absences | Employe | Manager puis DRH | Equipe | Paie |
| 4. Paie & Prevoyance | Gestionnaire Paie | DRH/DFO | Comptabilite | Direction |
| 5. Suivi Documentaire | Admin RH | DRH | Managers/Tous | Audit Interne |
| 6. Sortie (Offboarding) | DRH/Assistant | Direction | Manager/Paie | IT/Securite |

### 5.4 Implementation technique
- Ajouter un champ `owner_role` (enum: `drh`, `resp_admin`, `assist_rh`, `manager`, `comptable`, `employe`) sur chaque table d02_*
- Ajouter un champ `validator_id` (FK employees) et `validation_date` pour les entites a workflow
- Les permissions sont derivees du role (le manager ne voit que les conges/HS de son equipe, etc.)

---

## 6. ARCHITECTURE DE NAVIGATION

### 6.1 Layout principal
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

### 6.2 Arborescence des routes (Domaine 2 - completee V2)
```
/app
  /domaine-2                                    -> Tableau de Bord D2
  /domaine-2/employes                           -> Fiche Employe (liste)
  /domaine-2/employes/[id]                      -> Fiche Employe (detail)
  /domaine-2/contrats                           -> Contrats Travail
  /domaine-2/contrats/[id]                      -> Detail contrat
  /domaine-2/avenants                           -> Avenants Contrat
  /domaine-2/documents                          -> Suivi Documents
  /domaine-2/bancaires                          -> Donnees Bancaires
  /domaine-2/mutuelle                           -> Mutuelle & Prevoyance
  /domaine-2/conges                             -> Conges Annuels (liste demandes)
  /domaine-2/conges/nouveau                     -> Nouvelle demande
  /domaine-2/conges/soldes                      -> Solde Conges
  /domaine-2/absences                           -> Absences Maladie
  /domaine-2/heures-supp                        -> Heures Supplementaires
  /domaine-2/pointage                           -> Pointage Presence
  /domaine-2/planning                           -> Planning Mensuel
  /domaine-2/paie                               -> Fiches de Paie
  /domaine-2/declarations                       -> Declarations Sociales
  /domaine-2/permis                             -> Autorisations Permis
  /domaine-2/departs                            -> Dossiers Departs
  /domaine-2/archivage                          -> Archivage Documents
  /domaine-2/rappels                            -> Rappels Admin
  /domaine-2/prets                              -> Prets & Avances
  /domaine-2/sanctions                          -> Sanctions Disciplinaires
  /domaine-2/visites-medicales                  -> Visites Medicales
  /domaine-2/pdca                               -> Cycle PDCA & Non-Conformites (NEW)
  /domaine-2/non-conformites                    -> Registre des Non-Conformites (NEW)
  /domaine-2/interco-d1                         -> Vue Interconnexion D1-D2 (NEW)
```

---

## 7. 5 PHASES DU CYCLE DE VIE ADMINISTRATIF

Le processus de gestion administrative du personnel est structure en **5 phases sequentielles**, codees par couleur. Chaque phase regroupe plusieurs feuilles de gestion.

### Phase 1 - IDENTIFICATION & STRUCTURATION (couleur bleu fonce)
- **Activite centrale** : FICHE EMPLOYE (FEUILLE MAITRESSE)
- **Sortie** : Identite unique de l'employe, source unique de verite pour le systeme

### Phase 2 - CONTRACTUALISATION & DOCUMENTATION DE TRAVAIL (couleur bleu clair)
- Contrats Travail
- Avenants Contrat
- Suivi Documents
- Donnees Bancaires
- Mutuelle Prevoyance
- Autorisations Permis

### Phase 3 - PRESENCE & GESTION (couleur vert)
- Planning Mensuel
- Pointage Presence
- Heures Supplementaires
- Conges Annuels
- Solde Conges
- Absences Maladie

### Phase 4 - PAIE & CONFORMITE SOCIALE / FISCALE (couleur orange)
- Fiches de Paie
- Declarations Sociales
- Prets & Avances Salaire
- Sanctions Disciplinaires
- Visites Medicales

### Phase 5 - ARCHIVAGE & SUIVI (couleur violet)
- Dossiers Departs
- Archivage Documents
- Rappels Admin
- Tableau de Bord (KPIs)

### Regles de basculement (Gates)
- **Phase 1 -> Phase 2** : Uniquement si la fiche employe est complete (tous les champs obligatoires renseignes)
- **Phase 3 -> Phase 4** : Apres validation du solde de presence du mois par le manager
- **Phase 5 (verrouillage)** : Dossier archive = lecture seule, plus aucune modification possible

---

## 8. TABLES SUPABASE - SCHEMA COMPLET (15 existantes + 6 manquantes)

Toutes dans le schema `admina_rh` avec `tenant_id` (UUID, FK admina.tenants) + `employee_id` (UUID, FK employees) + `created_at`/`updated_at` + RLS active.

### 8.1 Tables existantes (15)

1. **employees** (23 cols) - matricule, civilite, nom, prenom, date_naissance, lieu_naissance, genre, nationalite, situation_familiale, telephone, email, adresse, department_id, position_id, type_contrat, categorie, regime_travail, date_embauche, salaire_brut, lieu_travail, statut, photo_url, notes
2. **d02_contracts** (10 cols) - contract_number, type_contrat, date_debut, date_fin, salaire_brut, regime_travail, lieu_travail, observations, statut
3. **d02_contract_amendments** (10 cols) - contract_id, amendment_number, date_avenant, type_modification, ancienne_valeur, nouvelle_valeur, motif, date_effet, statut
4. **d02_employee_documents** (9 cols) - document_number, type_document, numero_document, date_emission, date_expiration, statut, lieu_depot, notes
5. **d02_bank_details** (6 cols) - banque, agence, rib, is_principal, statut
6. **d02_insurance_enrollments** (9 cols) - organisme, numero_adherent, date_adhesion, couverture, personnes_a_charge, cotisation_mensuelle, cotisation_annuelle, statut
7. **d02_pay_slips** (9 cols) - mois, salaire_brut, cotisations, taux_charges, net_a_payer, mode_paie, date_paiement, statut
8. **d02_social_declarations** (9 cols) - organisme, type_declaration, periode, montant, date_soumission, date_echeance, nombre_salaries, observations, statut
9. **d02_work_permits** (8 cols) - permit_number, type_permit, numero_permit, date_delivrance, date_expiration, autorite, statut
10. **d02_departures** (9 cols) - date_depart, motif_depart, date_notification, solde_conges_jours, dernier_salaire, indemnite, documents_remis, statut_dossier
11. **d02_document_archives** (7 cols) - type_document, date_archive, lieu_stockage, duree_conservation, responsable, observations
12. **d02_reminders** (7 cols) - type_rappel, description, date_echeance, statut, responsable_suivi, action_requise
13. **d02_loans** (12 cols) - type_pret, montant_demande, montant_accorde, taux_interet, mensualite, duree_mois, date_demande, date_debut_remboursement, solde_restant, statut, observations
14. **d02_sanctions** (10 cols) - type_sanction, faute_commise, date_faute, date_notification, date_execution, duree_suspension_jours, observations, statut, valide_par
15. **d02_medical_visits** (11 cols) - type_visite, medecin_structure, date_visite, date_prochaine_visite, resultat, aptitude, restrictions, cout, prise_en_charge, observations

### 8.2 Tables manquantes (6) - SQL dans `migration_6_tables_manquantes_D02.sql`

16. **d02_leave_requests** (conges annuels) - leave_number, type_conge (enum), date_debut, date_fin, nombre_jours, motif, statut (enum), date_approbation, approbateur_id
17. **d02_leave_balances** (solde conges) - annee, droit_annuel_jours, conges_pris_jours, solde_disponible, conges_en_cours, report_n1_jours, taux_utilisation, statut
18. **d02_absences** (absences maladie) - absence_number, type_absence (enum), date_debut, date_fin, duree_jours, justificatif_url, statut (enum), motif, observations
19. **d02_overtime_hours** (heures supp) - overtime_number, semaine, heures_normales, heures_supp, taux_majoration, montant_brut, montant_calcule, statut (enum), valide_par
20. **d02_attendance_records** (pointage) - record_number, semaine, jours_presents, jours_absents, retards_minutes, heures_supp, taux_presence, observations, statut (enum)
21. **d02_monthly_planning** (planning mensuel) - plan_number, department_id, position_id, mois, jours_ouvrables, jours_presents, jours_absents, retards_minutes, heures_supp, taux_presence, commentaire, statut (enum)

### 8.3 Tables a CREER (V2 - nouvelles pour V2)

22. **d02_non_conformities** (registre NC) - nc_number, type_nc, description, date_detection, detected_by (UUID), cause_racine, methode_analyse (enum: 5pourquoi, ishikawa), action_corrective, statut (enum: ouverte, en_cours, resolue, clotee), date_resolution, efficacite_verifiee (bool)
23. **d02_pdca_actions** (actions PDCA) - phase (enum: plan, do, check, act), titre, description, responsable_id, date_debut, date_fin_prevue, date_fin_reelle, statut (enum: planifiee, en_cours, terminee, annulee), kpi_associe
24. **d02_audit_reports** (rapports d'audit) - audit_number, type_audit (enum: interne, direction), periode, auditeur_id, date_audit, constat (enum: observation, nc_mineure, nc_majeure), description, action_requise, statut

### 8.4 Tables reference
- `ref_departments` (code, name, description, manager_id, is_active)
- `ref_positions` (code, title, family, department_id, classification, is_active)
- `ref_lists` (NEW V2) - Referentiel central des nomenclatures (civilités, genres, types de contrats, statuts, regimes de travail) - equivalent de la feuille `_Lists` du fichier Excel

### 8.5 Enums SQL a creer
```sql
d02_leave_type            : conge_annuel, conge_maladie, conge_maternite, conge_paternite, conge_marriage, conge_deuil, conge_sans_solde, conge_exceptionnel
d02_leave_request_status  : en_attente, approuvee, rejetee, annulee
d02_absence_type          : maladie, accident_travail, hospitalisation, quarantaine, conge_maternite, conge_paternite, absence_autorisee, absence_non_justifiee
d02_absence_status        : en_attente, justifiee, non_justifiee, rejetee
d02_overtime_status       : en_attente, validee, rejetee, payee
d02_attendance_status     : brouillon, valide, rejete
d02_planning_status       : brouillon, valide, cloture
d02_contract_status       : en_vigueur, echu, resilie, suspendu
d02_document_status       : valide, a_renouveler, expire
d02_permit_status         : valide, a_renouveler, en_renouvellement, expire
d02_medical_aptitude      : apte, apte_avec_restrictions, inapte_temporaire, inapte_definitif
d02_sanction_type         : avertissement_oral, avertissement_ecrit, blame, suspension
d02_departure_motif       : demission, licenciement, fin_cdd, retraite, deces
d02_departure_status      : en_cours, en_attente_piece, clos
d02_loan_type             : avance_salaire, pret_social, pret_logement
d02_loan_status           : demande, accorde, en_remboursement, solde, refuse
d02_declaration_type      : mensuelle, trimestrielle, annuelle
d02_declaration_status    : soumise, en_retard, validee
d02_reminder_type         : expiration_document, renouvellement_contrat, echeance_periode_essai, visite_medicale, declaration_sociale
d02_reminder_status       : en_attente, en_retard, traite
d02_pay_status            : generee, validee, payee
d02_archive_duree         : 1_an, 3_ans, 5_ans
d02_audit_type            : interne, direction
d02_audit_constat         : observation, nc_mineure, nc_majeure
```

---

## 9. MATRICE DES FORMULES VLOOKUP A IMPLEMENTER (LOGIQUE JOIN SQL)

### 9.1 Principe general

L'architecture Excel repose sur une logique **maitre-satellite** :
- **Onglet maitre** : `Fiche Employe` (Source Unique de Verite - Single Source of Truth)
- **Onglets satellites** : 18 feuilles thematiques
- **Cle de jointure** : Matricule employe (colonne B de la Fiche Employe)
- **Donnee cible** : Nom de l'employe (colonne D de la Fiche Employe)
- **Volume cible** : 100 lignes par feuille

> En SQL, ceci se traduit par une contrainte d'integrite referentielle `employee_id` (FK) et des **JOIN** pour recuperer automatiquement les donnees liees.

### 9.2 Formule type Excel (a transposer en JOIN SQL)

```excel
=IFERROR(VLOOKUP(C5, '2-Fiche Employé'!$B$5:$D$104, 3, FALSE), "")
```

**Decomposition technique** :
- `IFERROR` : gestion d'erreur (evite #N/A)
- `C5` : matricule dans la feuille satellite
- `'2-Fiche Employé'!$B$5:$D$104` : plage source (matricule + nom + champ auxiliaire)
- `3` : index colonne cible (D = Nom)
- `FALSE` : recherche exacte obligatoire

**Equivalent SQL** :
```sql
SELECT s.*, e.nom, e.prenom, e.departement_id
FROM d02_xxx s
LEFT JOIN employees e ON s.employee_id = e.id AND s.tenant_id = e.tenant_id
WHERE s.tenant_id = $tenant_id;
```

> Le `LEFT JOIN` + `IFNULL`/`COALESCE` remplace le `IFERROR(VLOOKUP())`.

### 9.3 Matrice complete des 18 feuilles satellites a interconnecter

| # | Feuille Satellite | Col Source (Matricule) | Col Cible (Nom) | Cardinalite SQL | Recuperation supplementaire |
|:--|:------------------|:----------------------|:-----------------|:----------------|:---------------------------|
| 1 | Contrats Travail | B | D | 1:N (un employe = N contrats) | + colonne E (Prenom/Service/DateEmbauche) |
| 2 | Avenants Contrat | B | E | 1:N | - |
| 3 | Suivi Documents | B | D | 1:N | - |
| 4 | Donnees Bancaires | B | D | 1:1 ou 1:N | - |
| 5 | Mutuelle Prevoyance | B | D | 1:1 | - |
| 6 | Conges Annuels | B | D | 1:N | - |
| 7 | Absences Maladie | B | D | 1:N | - |
| 8 | Heures Supplementaires | B | D | 1:N | - |
| 9 | Pointage Presence | B | D | 1:N (quotidien/hebdo) | - |
| 10 | Fiches de Paie | B | D | 1:N (mensuel) | - |
| 11 | Autorisations Permis | B | D | 1:N | - |
| 12 | Dossiers Departs | B | D | 1:1 (final) | - |
| 13 | Archivage Documents | B | D | 1:N | - |
| 14 | Rappels Admin | B | D | 1:N | - |
| 15 | Prets Avances | B | D | 1:N | - |
| 16 | Sanctions Disciplinaires | B | D | 1:N | - |
| 17 | Visites Medicales | B | D | 1:N | - |
| 18 | Planning Mensuel | B | D | 1:N (mensuel) | - |

### 9.4 Etat actuel de l'interconnexion

| Feuille | Type de Connexion | Formules | Statut |
|:--------|:------------------|:---------|:-------|
| **Tableau de Bord** | COUNTIF vers 17 feuilles | 40-57 COUNTIF | INTERCONNECTE |
| **Solde Conges** | VLOOKUP vers Fiche Employe + COUNTIF vers Conges | 218 VLOOKUP + 648 COUNTIF | INTERCONNECTE |
| **Fiche Employe** | Source unique de verite (master data) | IF auto + 4 COUNTIF | SOURCE |
| **20 autres feuilles** | Aucune formule inter-feuilles | IF auto-numerotation uniquement | SILO |

> **Objectif V2** : Implementer l'interconnexion complete (toutes les feuilles satellites recupèrent automatiquement les donnees employe via JOIN SQL + FK employee_id).

### 9.5 Processus systematique de mise en oeuvre (4 etapes)

1. **Etape 1** : Identifier la colonne Matricule dans la feuille cible (mappée sur `employee_id` FK)
2. **Etape 2** : Dans la colonne Nom Employe, executer un JOIN sur la table `employees`
3. **Etape 3** : Etendre la requete a toutes les lignes (pagination)
4. **Etape 4** : Verifier que les noms s'affichent correctement pour les matricules existants et que les cellules restent vides pour les lignes non renseignees (COALESCE/IFNULL)

### 9.6 Regles de gestion (integrite referentielle)

| Regle | Implementation |
|:------|:--------------|
| **Integrite referentielle** | Le matricule doit exister dans `employees` avant insertion dans une feuille satellite (FK constraint) |
| **Non-redondance** | Le nom n'est jamais saisi manuellement dans les satellites (recupere via JOIN) |
| **Tracabilite** | Toute modification d'identite dans `employees` se reflete immediatement partout (pas de cache) |
| **Performance** | Index sur `employee_id` et `tenant_id` sur toutes les tables satellites |
| **Exactitude stricte** | Pas de recherche approximative (matricule exact uniquement) |

---

## 10. 22 ECRANS A DEVELOPPER (avec workflows complets)

### === PHASE 1 : Tableau de Bord + Fiche Employe ===

#### ECRAN 1 : Tableau de Bord D2 (`/domaine-2`)
**Type** : Dashboard avec KPI cards + mini-tableaux
**Donnees** : Aggregation depuis employees, d02_contracts, d02_reminders, d02_leave_balances, d02_attendance_records, d02_pay_slips

**Composants** :
- 4 KPI cards principales en haut :
  - **Effectif Total** (`COUNTIF(Fiche, "<>")`)
  - **Contrats en vigueur** (`COUNTIF(Statut, "En vigueur")`)
  - **Masse salariale brute** (`SUM(Salaire Brut)`)
  - **Taux presence moyen** (`AVG(Taux Presence)`)
- Repartition par departement (bar chart horizontal)
- Repartition par type de contrat (donut chart)
- Liste des derniers rappels admin (5 derniers)
- Liste des conges en attente (5 derniers)
- Badge "Documents a renouveler" avec compteur
- Badge "Declarations en retard" avec compteur
- Mini-tableau "Prêts en cours" (somme soldes restants)
- Mini-tableau "Dossiers de départ clos" du mois

**Implementation COUNTIF -> SQL** :
```sql
-- Effectif total
SELECT COUNT(*) FROM employees WHERE tenant_id = $tenant_id;
-- Taux d'actifs
SELECT COUNT(*) FILTER (WHERE statut = 'Actif') * 100.0 / COUNT(*) FROM employees WHERE tenant_id = $tenant_id;
-- Contrats en vigueur
SELECT COUNT(*) FROM d02_contracts WHERE tenant_id = $tenant_id AND statut = 'en_vigueur';
-- Documents conformes
SELECT COUNT(*) FILTER (WHERE statut = 'valide') * 100.0 / COUNT(*) FROM d02_employee_documents WHERE tenant_id = $tenant_id;
```

**Design** : Grid responsive, cards avec icone + valeur + tendance (vs mois precedent)

#### ECRAN 2 : Liste Employes (`/domaine-2/employes`)
**Type** : DataTable avec filtres + recherche
**Composants** :
- Barre de recherche (nom, matricule, email)
- Filtres : Departement, Statut, Type Contrat, Categorie
- Colonnes : Matricule, Nom complet, Poste, Departement, Type Contrat, Date Embauche, Anciennete (calculee), Statut
- Actions : Voir detail, Modifier, Supprimer (soft)
- Bouton "+ Nouvel Employe"
- Pagination (20 par page)
- Export CSV/Excel
**Composants shadcn** : Table, Input, Select, Button, Badge, DropdownMenu, Pagination

**Regles** :
- Le matricule est la **cle primaire** (saisi manuellement, unique)
- L'anciennete est **calculee automatiquement** par `DATEDIF(date_embauche, NOW())` -> en SQL : `EXTRACT(YEAR FROM age(current_date, date_embauche))`
- Les listes deroulantes proviennent de `ref_lists` (equivalent feuille `_Lists`)

#### ECRAN 3 : Detail Employe (`/domaine-2/employes/[id]`)
**Type** : Page detail avec tabs
**Tabs** : Informations | Contrat | Documents | Bancaire | Mutuelle | Conges | Paie | Sanctions | Visites | Departs

**Tab Informations** : Grille 2 colonnes (readonly) avec tous les champs `employees`
**Tab Contrat** : Historique des contrats + avenants (sous-table). Statut auto-calcule : En vigueur / Echu / Resilie
**Tab Documents** : Liste avec statut expiration (badge vert < 30j, orange < 15j, rouge expire). Declenche alerte Rappels Admin si < 15j
**Tab Bancaire** : Coordonnees bancaires + flag Compte Principal
**Tab Mutuelle** : Adhesion, couverture, personnes a charge, cotisations
**Tab Conges** : Solde + historique demandes + chart d'evolution
**Tab Paie** : Historique fiches de paie (12 derniers mois)
**Tab Sanctions** : Historique (4 niveaux)
**Tab Visites** : Historique + prochaine visite
**Tab Departs** : Si employe parti, detail du dossier de depart

### === PHASE 2 : Gestion Contractuelle & Documentaire ===

#### ECRAN 4 : Contrats Travail (`/domaine-2/contrats`)
**Type** : DataTable
**Colonnes** : N Contrat, Employe (recupere via JOIN), Type Contrat (CDI/CDD/Stage/Interim - badge), Date Debut, Date Fin, Duree mois (calculee), Jours restants (calcule), Salaire Brut (FCFA), Regime, Lieu, Statut (badge)
**Filtres** : Statut, Type Contrat, Departement
**Actions** : Voir, Modifier, Creer avenant, Dupliquer
**Alerte** : Badge rouge si contrat expire dans < 30 jours
**Calculs auto** :
- `duree_mois = (date_fin - date_debut) / 30`
- `jours_restants = date_fin - current_date`
- Statut auto-bascule a `echu` quand `jours_restants < 0`

#### ECRAN 5 : Avenants Contrat (`/domaine-2/avenants`)
**Type** : DataTable
**Colonnes** : N Avenant, N Contrat, Employe, Date, Type Modification (salaire/poste/temps partiel), Ancienne Valeur, Nouvelle Valeur, Motif, Date Effet, Statut
**Filtres** : Type Modification, Statut
**Traçabilité** : Historique complet pour audit et conformite regulatoire

#### ECRAN 6 : Suivi Documents (`/domaine-2/documents`)
**Type** : DataTable avec alertes expiration
**Colonnes** : Employe, Type Document (CNI/passeport/attestation/certificat), N Document, Date Emission, Date Expiration, Jours Restants (badge couleur), Statut (Valide/A renouveler/Expire), Lieu Depot, Notes
**Alerte** : Ligne en rouge si expire dans < 15 jours
**Workflow alertes** : Declenche automatiquement un rappel dans `d02_reminders` quand `jours_restants <= 15`
**Conformite** : Sanctions possibles si document expire non renouvele (controle Inspection du Travail)

#### ECRAN 7 : Donnees Bancaires (`/domaine-2/bancaires`)
**Type** : DataTable
**Colonnes** : Employe, Banque, Agence, RIB (masque partiel `****1234`), Compte Principal (oui/non), Statut (Actif/Inactif/A verifier)
**Securite** : RIB jamais affiche en clair dans le DOM

#### ECRAN 8 : Mutuelle Prevoyance (`/domaine-2/mutuelle`)
**Type** : DataTable
**Colonnes** : Employe, Organisme, N Adherent, Date Adhesion, Couverture, Personnes a Charge, Cotisation Mensuelle, Cotisation Annuelle, Statut

#### ECRAN 9 : Autorisations Permis (`/domaine-2/permis`)
**Type** : DataTable
**Colonnes** : Employe, Type Permis (Permis travail/Carte sejour/Visa), N Permis, Date Delivrance, Date Expiration, Jours Restants (badge), Autorite (MINTSS/DGSN/Ministere Interieur), Statut (Valide/A renouveler/En renouvellement/Expire)
**Alerte** : Declenche rappel auto dans `d02_reminders`

### === PHASE 3 : Conges, Absences & Pointage ===

#### ECRAN 10 : Conges Annuels (`/domaine-2/conges`)
**Type** : DataTable + formulaire de demande
**Colonnes** : Employe, Type Conge (badge couleur), Date Debut, Date Fin, Nombre Jours (calcule), Motif, Statut (badge: en_attente=jaune, approuvee=vert, rejetee=rouge, annulee=gris), Date Approbation, Approbateur
**Boutons** : "+ Nouvelle Demande" (Dialog/Sheet)
**Formulaire demande** :
- Employe (select avec recherche)
- Type conge (Annuel, Maternite, Paternite, Sans solde, Marriage, Deuil, Exceptionnel)
- Date debut (DatePicker)
- Date fin (DatePicker)
- Nombre jours : **auto-calcule** `(date_fin - date_debut) + 1`, en excluant les weekends et jours feries
- Motif (textarea)

**Workflow d'approbation** (2 niveaux) :
1. **Employe soumet** -> statut `en_attente`
2. **Manager hierarchique valide/refuse** (niveau 1) -> statut `approuvee` ou `rejetee`
3. **DRH/Gestionnaire Paie validation finale** (niveau 2, pour conges > 5 jours ou sans solde) -> `approuvee_definitive`
4. A l'approbation -> mise a jour automatique de `d02_leave_balances.conges_pris_jours` et `solde_disponible`

**Statuts** : en_attente -> approuvee / rejetee / annulee

#### ECRAN 11 : Solde Conges (`/domaine-2/conges/soldes`)
**Type** : DataTable avec barres de progression
**Colonnes** : Employe, Annee, Droit Annuel (jrs), Conges Pris (jrs), Solde Disponible (jrs) [barre verte si > 25%, rouge si < 5j], Conges en Cours, Report N-1, Taux Utilisation (%)
**Annee** : Selecteur d'annee en haut

**Logique de calcul** (transposition des 218 VLOOKUP + 648 COUNTIF Excel) :
```sql
-- Solde disponible
solde_disponible = droit_annuel_jours + report_n1_jours - conges_pris_jours - conges_en_cours
-- Taux utilisation
taux_utilisation = (conges_pris_jours / droit_annuel_jours) * 100
-- Conges pris (auto-calcule depuis les demandes approuvees)
conges_pris_jours = SUM(nombre_jours) FROM d02_leave_requests
                   WHERE employee_id = e.id
                   AND type_conge = 'conge_annuel'
                   AND statut = 'approuvee'
                   AND date_debut >= annee-01-01 AND date_fin <= annee-12-31
```

#### ECRAN 12 : Absences Maladie (`/domaine-2/absences`)
**Type** : DataTable
**Colonnes** : Employe, Type Absence (Maladie/Accident travail/Conge maternite/Hospitalisation/Quarantaine), Date Debut, Date Fin, Duree (jours calcule), Justificatif (upload PDF), Statut (Justifiee/Non justifiee/En attente), Motif, Observations
**Workflow** :
1. Declaration absence (par employe, manager ou assistant RH)
2. Upload justificatif (certificat medical)
3. Validation par manager -> `justifiee` ou `non_justifiee`
4. Si duree > 3 jours -> declenche visite medicale de reprise (auto-create dans `d02_medical_visits`)

#### ECRAN 13 : Heures Supplementaires (`/domaine-2/heures-supp`)
**Type** : DataTable
**Colonnes** : Employe, Semaine, Heures Normales, Heures Supp (badge), Taux Majoration (%), Montant Brut (FCFA), Montant Calcule (FCFA), Statut (en_attente/validee/rejetee/payee), Valide Par

**Taux de majoration applicables** :
- 100% (heures supp simples)
- 125% (heures supp nuit/weekend)
- 150% (heures supp jour ferie)

**Formule de calcul** :
```
montant_brut = heures_supp * (salaire_horaire_base)
montant_calcule = montant_brut * (1 + taux_majoration/100)
salaire_horaire_base = salaire_brut_mensuel / 173.33  (base 40h/sem)
```

**Workflow validation OBLIGATOIRE avant integration paie** :
1. **Declaration** par employe/manager -> statut `en_attente`
2. **Validation** par responsable hierarchique -> `validee` ou `rejetee`
3. **Integration paie** : seules les HS `validees` sont integrees dans la fiche de paie -> `payee`
4. **Regle impérative** : Les HS non validees ne peuvent PAS etre integrees en paie

#### ECRAN 14 : Pointage Presence (`/domaine-2/pointage`)
**Type** : DataTable + synthese
**Colonnes** : Employe, Semaine, Jours Presents, Jours Absents, Retards (min), Heures Supp, Taux Presence (% barre), Observations, Statut (brouillon/valide/rejete)
**Synthese** : Taux presence moyen de l'ensemble du personnel (KPI Obj. 4 > 95%)
**Workflow** :
1. Saisie quotidienne pointage (badgeage auto ou manuel)
2. Validation hebdomadaire par manager -> `valide`
3. Export vers planning mensuel et paie

**Formule** :
```
taux_presence = (jours_presents / jours_ouvrables) * 100
```

#### ECRAN 15 : Planning Mensuel (`/domaine-2/planning`)
**Type** : Calendar view + DataTable toggle
**Vue Calendar** : Grille mensuelle par employe (vert=present, rouge=absent, orange=retard, bleu=conge, violet=mission)
**Vue Table** : Employe, Departement, Poste, Mois, Jours Ouvrables, Jours Presents, Jours Absents, Retards (min), Heures Supp, Taux Presence, Statut (brouillon/valide/cloture)
**Workflow** :
1. Generation auto depuis Pointage Presence (agregation mensuelle)
2. Validation manager -> `valide`
3. Cloture mensuelle -> `cloture` (plus de modif possible, alimente la paie)

### === PHASE 4 : Paie, Conformite & Suivi ===

#### ECRAN 16 : Fiches de Paie (`/domaine-2/paie`)
**Type** : DataTable + preview
**Colonnes** : Employe, Mois, Salaire Brut, Cotisations, Taux Charges (%), Net a Payer, Mode Paiement (virement/cheque/especes), Date Paiement, Statut (generee/validee/payee)
**Action** : "+ Generer Fiche" (Dialog), Telecharger PDF, Envoyer par email

**Processus de generation** (le comptable prepare les fiches) :
1. Recuperation automatique des donnees : presence (pointage), conges, HS validees, prets/avances (deductions)
2. Calcul cotisations selon taux en vigueur
3. Calcul net a payer
4. Validation DRH -> `validee`
5. Paiement (virement bancaire) -> `payee` + `date_paiement`

**KPI Obj. 3** : 100% des fiches generees avant le 5 du mois suivant

**Formule** :
```
salaire_brut = salaire_base + heures_supp_montant_calcule + primes - retenues_absences
cotisations = salaire_brut * taux_charges
net_a_payer = salaire_brut - cotisations - deductions_prets
```

#### ECRAN 17 : Declarations Sociales (`/domaine-2/declarations`)
**Type** : DataTable
**Colonnes** : Organisme (CNPS/CNP/Direction Impots), Type Declaration (Mensuelle/Trimestrielle/Annuelle), Periode, Montant (FCFA), Date Soumission, Date Echeance (badge si en retard), Nombre Salaries, Statut (Soumise/En retard/Validee), Observations
**Alertes** : Si `date_echeance < NOW()` et `statut != soumise` -> badge rouge + declenche rappel

**KPI Obj. 5** : 0 declaration en retard

#### ECRAN 18 : Prets & Avances (`/domaine-2/prets`)
**Type** : DataTable + calculateur
**Colonnes** : Employe, Departement, Type Pret (Avance salaire/Pret social/Pret logement), Montant Demande, Montant Accorde, Taux Interet (%), Mensualite, Duree (mois), Date Demande, Date Debut Remboursement, Mois Restants, Solde Restant (barre), Statut (demande/accorde/en_remboursement/solde/refuse), Observations

**Dialog calcul** : Saisir montant + taux + duree -> auto-calc mensualite
**Formule mensualite** (amortissement constant) :
```
mensualite = (montant_accorde * taux_interet/12) / (1 - (1 + taux_interet/12)^(-duree_mois))
solde_restant = montant_accorde - (mensualite * mois_payes)
```

**Integration comptable** : Les deductions automatiques sont integrees dans le calcul de la paie (tab Paie de l'employe)

#### ECRAN 19 : Sanctions Disciplinaires (`/domaine-2/sanctions`)
**Type** : DataTable
**Colonnes** : Employe, Type Sanction (badge), Faute Commise, Date Faute, Date Notification, Date Execution, Duree Suspension (jrs), Observations, Statut, Valide Par

**4 niveaux de sanctions** (gradient de severite) :
- **Niveau 1 - Avertissement oral** (badge jaune)
- **Niveau 2 - Avertissement ecrit** (badge orange)
- **Niveau 3 - Blame** (badge rouge)
- **Niveau 4 - Suspension** (badge violet) - avec duree en jours

**Procedure disciplinaire** (conforme droit du travail) :
1. **Constat** de la faute (par manager ou RH)
2. **Verification** des faits (audit, temoignages)
3. **Convocation** de l'employe a entretien (delai legal min 5 jours ouvrables)
4. **Entretien** + defense de l'employe
5. **Notification** de la sanction (avec mention voies de recours)
6. **Execution** (date_debut) + suivi
7. **Validation** par DRH -> `valide_par`

**Pilotage** : Suivi statistique des sanctions par type affiche sur le Tableau de Bord (climat social)

#### ECRAN 20 : Visites Medicales (`/domaine-2/visites-medicales`)
**Type** : DataTable + rappels
**Colonnes** : Employe, Type Visite, Medecin/Structure, Date Visite, Prochaine Visite (badge si < 15 jours), Jours Restants, Resultat, Aptitude (badge vert/rouge/orange), Restrictions, Cout (FCFA), Prise en Charge, Observations

**4 types de visites** :
- **Visite d'embauche** (obligatoire avant prise de poste)
- **Visite periodique** (suivi annuel)
- **Visite de reprise** (apres arret maladie prolonge > 3 semaines, ou accident travail)
- **Visite a la demande** (employe ou medecin)

**4 niveaux d'aptitude** :
- Apte (badge vert)
- Apte avec restrictions (badge orange)
- Inapte temporaire (badge rouge clair)
- Inapte definitif (badge rouge fonce)

**Alertes** : Si `date_prochaine_visite - NOW() < 15 jours` -> declenche rappel auto

### === PHASE 5 : Sortie & Pilotage ===

#### ECRAN 21 : Dossiers Departs (`/domaine-2/departs`)
**Type** : DataTable + checklist
**Colonnes** : Employe, Date Depart, Motif Depart, Date Notification, Solde Conges (jrs), Dernier Salaire, Indemnite, Documents Remis (checklist), Statut Dossier (en_cours/en_attente_piece/clos)

**5 motifs de depart** : demission, licenciement, fin_cdd, retraite, deces

**Procedure de depart** :
1. **Notification** du depart (lettre de demission ou notification rupture)
2. **Ouverture du dossier** dans `d02_departures`
3. **Calcul du solde de conges** restant (indemnisation ou deduction)
4. **Calcul du dernier salaire** + solde de tout compte
5. **Calcul de l'indemnite de depart** :
   - Demission : aucune
   - Licenciement : indemnite legale (formule specifique au droit local)
   - Fin CDD : prime de precariouste (10% du brut total)
   - Retraite : indemnite de depart a la retraite
6. **Checklist documents a remettre** :
   - [ ] Attestation de travail
   - [ ] Certificat de travail
   - [ ] Reçu pour solde de tout compte
   - [ ] Attestation France Travail (Pole Emploi)
   - [ ] Releve d'heures
7. **Restitution materiel** (badge, ordinateur, vehicule) -> 100% obligatoire
8. **Desactivation acces IT** (offboarding informatique)
9. **Cloture du dossier** -> `clos`

**Statut** :
- `en_cours` : dossier ouvert, pieces en cours de constitution
- `en_attente_piece` : manque un document ou restitution materiel
- `clos` : toutes pieces recues, solde verse, dossier archive

#### ECRAN 22 : Archivage (`/domaine-2/archivage`)
**Type** : DataTable
**Colonnes** : Employe, Type Document, Date Archive, Lieu Stockage (Archive numerique RH / Archive physique Salle B), Duree Conservation (1 an / 3 ans / 5 ans), Responsable, Observations

**Regles de conservation** :
- 1 an : documents temporaires (notes de service, convocations)
- 3 ans : documents operationnels (pointages, plannings)
- 5 ans : documents long terme (contrats, fiches de paie, declarations sociales)

**Conformite** : Auditable, respect des durees legales de conservation documentaire

#### ECRAN 22b : Rappels Admin (`/domaine-2/rappels`)
**Type** : DataTable avec timeline
**Colonnes** : Employe, Type Rappel (icone), Description, Date Echeance (badge si en retard), Jours Restants, Statut (en_attente/en_retard/traite), Responsable Suivi, Action Requise
**Tri par defaut** : Date echeance croissante

**5 types de rappels** :
- **Expiration document** (depuis d02_employee_documents, d02_work_permits)
- **Renouvellement contrat** (depuis d02_contracts)
- **Echeance periode essai** (depuis d02_contracts, type CDD/essai)
- **Visite medicale** (depuis d02_medical_visits)
- **Declaration sociale** (depuis d02_social_declarations)

**Generation automatique** : Les rappels sont generes automatiquement par des triggers/cron quand une echeance approche (< 15 jours) ou est depassee.

**Workflow** :
1. Generation auto (trigger ou cron)
2. `statut = en_attente`
3. Si `date_echeance < NOW()` -> `statut = en_retard`
4. Traitement (marquer comme traite + action requise realisee) -> `statut = traite`

### === ECRANS NEW V2 ===

#### ECRAN 23 : Cycle PDCA & Actions (`/domaine-2/pdca`)
**Type** : Vue kanban + timeline
**4 colonnes Kanban** : PLAN | DO | CHECK | ACT
**Colonnes table** : Titre, Description, Phase, Responsable, Date Debut, Date Fin Prevue, Date Fin Reelle, Statut, KPI Associe
**Permet** : suivi des actions d'amelioration continue, Revue de Direction trimestrielle

#### ECRAN 24 : Registre Non-Conformites (`/domaine-2/non-conformites`)
**Type** : DataTable + formulaire d'analyse
**Colonnes** : N NC, Type NC, Description, Date Detection, Detecte Par, Cause Racine, Methode Analyse (5 Pourquoi / Ishikawa), Action Corrective, Statut, Date Resolution, Efficacite Verifiee
**Formulaire** : Wizard 4 etapes (Detection -> Analyse -> Action -> Verification)

#### ECRAN 25 : Interconnexion D1-D2 (`/domaine-2/interco-d1`)
**Type** : Dashboard vue graphique des 5 points d'interconnexion
**Vue** : Schema visuel D1 -> D2 avec les 5 flux IC-D1-D2-01 a 05
**Detail par point** : Donnees echangees, sens, frequence, dernier transfert, erreurs detectees

---

## 11. PROCEDURES DETAILLEES PAR SOUS-PROCESSUS

### 11.1 Procedure : Creation d'une Fiche Employe (Feuille Maitresse)

**Objectif** : Assurer la saisie coherente et structuree des informations d'un nouvel employe
**Acteur principal** : Assistant RH
**Declencheur** : Embauche d'un nouveau collaborateur (signal D1 - feuille 11-Integration Employe)

**Etapes** :
1. **Identification de la ligne de saisie** - L'assistant RH repere la premiere ligne vide dans la feuille (indicateur visuel : fond jaune)
2. **Attribution du matricule** - Selon nomenclature entreprise, cle primaire unique
3. **Saisie des informations personnelles** - Via listes deroulantes liees a `ref_lists` (civilité, genre, nationalite, etc.)
4. **Saisie des informations professionnelles** - Departement, poste, type contrat, categorie, regime travail
5. **Saisie des informations administratives** - Date embauche, salaire brut, lieu travail, statut
6. **Verification automatique** - L'anciennete est calculee automatiquement (DATEDIF / EXTRACT YEAR)
7. **Propagation automatique** - L'employe est desormais visible dans toutes les feuilles satellites via JOIN

**Regles** :
- **Unicite du matricule** : identifiant unique, saisi manuellement une seule fois
- **Cohérence** : Obligation d'utiliser les listes deroulantes de `ref_lists`
- **Automatisation** : Anciennete calculee, pas de saisie manuelle
- **Tracabilite visuelle** : Lignes disponibles identifiees par code couleur

**Controle qualite** :
- Chaque colonne a une validation (enum/regex/date)
- Compteurs en bas de la feuille : total employes, nombre actifs, etc.
- Verification hebdomadaire de la completude par le Responsable Admin RH

### 11.2 Procedure : Gestion des Contrats et Avenants

**Acteur principal** : Responsable Admin RH

**Etapes** :
1. A chaque nouvelle embauche, le responsable admin RH cree un contrat dans `d02_contracts`
2. Les dates (debut/fin) sont saisies, la duree et les jours restants se calculent automatiquement
3. Le statut bascule automatiquement a `echu` lorsque les jours restants deviennent negatifs
4. Pour tout changement de salaire ou de poste, un avenant est enregistre dans `d02_contract_amendments`
5. Le Tableau de Bord recapitule en temps reel le nombre de contrats en vigueur et a renouveler

**Champs Contrat** : N contrat, matricule employe, type contrat (CDI/CDD/Stage/Interim), date debut, date fin, duree mois (calcule), jours restants (calcule), statut (En vigueur/Echu/Resilie), salaire brut FCFA, regime travail, lieu travail, observations

**Champs Avenant** : N avenant, N contrat, matricule, date avenant, type modification (salaire/poste/temps partiel), ancienne valeur, nouvelle valeur, motif, date effet

### 11.3 Procedure : Gestion des Conges et Absences

**Architecture** : 3 feuilles interconnectees (Conges Annuels + Solde Conges + Absences Maladie)

**Workflow Conges** :
1. Employe soumet une demande (type conge, dates, motif)
2. Manager valide/refuse (statut -> approuvee/rejetee)
3. Si conge long ou sans solde -> validation DRH niveau 2
4. Mise a jour automatique du solde de conges
5. Integration dans la paie (si conge sans solde -> retenue)

**Workflow Absences** :
1. Declaration (par employe, manager ou RH)
2. Upload justificatif medical
3. Validation manager (justifiee / non justifiee)
4. Si duree > 3 semaines -> visite medicale de reprise auto-creee
5. Integration en paie (maintien de salaire ou retenue)

**Types de conges** : Annuel, Maternite, Paternite, Sans solde, Marriage, Deuil, Exceptionnel
**Types d'absences** : Maladie, Accident travail, Conge maternite, Hospitalisation, Quarantaine

### 11.4 Procedure : Pointage, Presence et Heures Supplementaires

**Architecture** : 3 feuilles complementaires (Planning Mensuel + Pointage Presence + Heures Supp)

**Workflow Pointage** :
1. Saisie quotidienne (badgeage auto ou manuel)
2. Validation hebdomadaire manager
3. Generation automatique du planning mensuel
4. Alimentation de la paie

**Workflow Heures Supp** :
1. Declaration par semaine (heures normales + heures supp)
2. Application du taux de majoration (100% / 125% / 150%)
3. Calcul automatique du montant brut + montant calcule
4. **Validation OBLIGATOIRE par responsable hierarchique** (statut -> validee/rejetee)
5. **Regle imperative** : Les HS validees uniquement sont integrees dans la fiche de paie
6. Statut final -> `payee` apres integration paie

### 11.5 Procedure : Paie et Declarations Sociales

**Acteur principal** : Comptable Paie

**Processus Paie mensuel** :
1. Recuperation automatique des donnees : presence (pointage), conges, HS validees, prets/avances
2. Calcul du salaire brut = base + HS + primes - retenues
3. Calcul des cotisations (taux en vigueur)
4. Calcul du net a payer = brut - cotisations - deductions
5. Validation DRH (statut -> validee)
6. Paiement (virement/cheque/especes) -> statut payee + date paiement

**Statuts** : generee -> validee -> payee

**Processus Declarations Sociales** :
- Organismes : **CNPS** (Caisse Nationale de Prevoyance Sociale), **CNP** (Caisse Nationale de Prevoyance), **Direction des Impots**
- Types : Mensuelle, Trimestrielle, Annuelle
- Suivi : date soumission, date echeance, montant, nombre salaries
- Alertes : si echeance depassee -> badge rouge + rappel auto
- Statuts : soumise, en_retard, validee

### 11.6 Procedure : Autorisations, Permis et Visites Medicales

**Autorisations/Permis** :
- Documents : Permis travail, Carte sejour, Visa travail
- Autorites emettrices : **MINTSS** (Ministere Travail), **DGSN** (Direction Generale Securite Nationale), **Ministere Interieur**
- Suivi : dates delivrance/expiration, jours restants
- Alertes automatiques via Rappels Admin

**Visites Medicales** :
- 4 types : Embauche (avant prise de poste), Periodique (annuel), Reprise (apres arret prolonge), Demande
- Donnees : medecin/structure, date, prochaine visite, resultat, aptitude, restrictions, cout, prise en charge
- 4 niveaux aptitude : Apte, Apte avec restrictions, Inapte temporaire, Inapte definitif

### 11.7 Procedure : Prets, Avances et Sanctions Disciplinaires

**Prets/Avances** :
- 3 types : Avance salaire, Pret social, Pret logement
- Donnees : montant demande/accorde, taux interet, mensualite, duree, dates, solde restant
- **Integration comptable** : deductions automatiques dans la paie
- Statuts : demande -> accorde -> en_remboursement -> solde

**Sanctions** :
- 4 niveaux : Avertissement oral -> Avertissement ecrit -> Blame -> Suspension
- Procedure : Constat -> Verification -> Convocation entretien (5j min) -> Entretien -> Notification -> Execution
- Donnees : faute commise, date faute, date notification, date execution, duree suspension, valideur
- Pilotage : statistiques par type sur Tableau de Bord (climat social)

### 11.8 Procedure : Gestion des Departs et Archivage

**Dossier de Depart** :
- Ouverture : a la notification du depart (quel que soit le motif)
- 5 motifs : demission, licenciement, fin CDD, retraite, deces
- Calcul : solde conges restant, dernier salaire, indemnite de depart
- Documents a remettre : attestation travail, certificat travail, recu solde tout compte
- Restitution materiel : badge, ordinateur, vehicule
- Statuts : en_cours -> en_attente_piece -> clos

**Archivage** :
- Conservation : 1 an / 3 ans / 5 ans (selon type document)
- Lieux : Archive numerique RH, Archive physique Salle B
- Referencement : matricule, type document, date archive, duree, responsable
- Conformite : auditable, durées legales respectees

### 11.9 Procedure : Rappels Administratifs et Tableau de Bord

**Rappels Admin** :
- Centralise toutes les alertes et echeances
- Alimentation auto : depuis les autres feuilles (expirations, renouvellements, visites, declarations)
- 5 types : Expiration document, Renouvellement contrat, Echeance periode essai, Visite medicale, Declaration sociale
- Donnees : matricule, type, description, date echeance, jours restants, statut, responsable suivi, action requise
- Statuts : en_attente -> en_retard -> traite

**Tableau de Bord** :
- Outil de pilotage central
- Synthese temps reel via 57 formules COUNTIF (en SQL : requetes agregees)
- 12+ KPIs (voir section 13)

---

## 12. WORKFLOWS & CHAINES D'APPROBATION

### 12.1 Workflow Conges (2 niveaux)
```
[Employe soumet] -> en_attente
        |
        v
[Manager valide] -> approuvee (niveau 1)
   |     \
   v      v
[DRH valide si >5j ou sans solde] -> approuvee_definitive (niveau 2)
   |
   v
[Maj auto solde conges] -> d02_leave_balances updated
   |
   v
[Integration paie si sans solde] -> deduction
```

### 12.2 Workflow Heures Supplementaires (1 niveau + integration paie)
```
[Declaration] -> en_attente
        |
        v
[Manager valide] -> validee / rejetee
        |
        v (uniquement validee)
[Integration paie] -> payee
```

### 12.3 Workflow Sanctions (procedure disciplinaire)
```
[Constat faute] -> brouillon
        |
        v
[Verification faits] -> en_verification
        |
        v
[Convocation entretien (5j min)] -> convoque
        |
        v
[Entretien + defense] -> en_entretien
        |
        v
[Notification sanction] -> notifiee (avec voies de recours)
        |
        v
[Validation DRH] -> validee
        |
        v
[Execution] -> en_execution
```

### 12.4 Workflow Depart (checklist multi-etapes)
```
[Notification depart] -> dossier_ouvert
        |
        v
[Calcul solde conges + dernier salaire + indemnite] -> en_calcul
        |
        v
[Checklist documents a remettre] -> en_preparation
        |
        v
[Restitution materiel] -> en_attente_restitution
        |
        v
[Desactivation acces IT] -> it_offboarding
        |
        v
[Remise documents + versement solde] -> remis
        |
        v
[Archivage dossier] -> clos
```

### 12.5 Workflow Prets/Avances
```
[Demande employe] -> demande
        |
        v
[Validation DRH] -> accorde / refuse
        |
        v
[Debut remboursement] -> en_remboursement
        |
        v (deduction mensuelle auto dans paie)
        |
        v
[Solde atteint 0] -> solde
```

### 12.6 Workflow Contrats
```
[Creation contrat] -> en_vigueur
        |
        v (jours_restants < 0 ou date_fin atteinte)
        |
[Auto-bascule] -> echu
        |
        v (rupture anticipee)
        |
[Resiliation] -> resilie
```

### 12.7 Workflow Documents
```
[Creation document] -> valide
        |
        v (jours_restants <= 30)
        |
[Auto-alerte] -> a_renouveler (+ rappel auto cree)
        |
        v (date_expiration < NOW())
        |
[Auto-bascule] -> expire
```

### 12.8 Workflow Visites Medicales
```
[Planification visite] -> planifiee
        |
        v
[Realisation visite] -> realisee
        |
        v
[Saisie resultat + aptitude] -> completee
        |
        v (si inapte_temporaire)
        |
[Planification visite de reprise auto] -> nouvelle visite creee
```

---

## 13. REGLES METIER & FORMULES DE CALCUL

### 13.1 Formules de conges
```
nombre_jours_demande = (date_fin - date_debut) + 1 - jours_weekend - jours_feries
solde_disponible = droit_annuel_jours + report_n1_jours - conges_pris_jours - conges_en_cours
taux_utilisation = (conges_pris_jours / droit_annuel_jours) * 100
```

### 13.2 Formules de presence
```
taux_presence = (jours_presents / jours_ouvrables) * 100
jours_ouvrables = jours_dans_mois - jours_weekend - jours_feries
retard_total_minutes = somme(retards_journaliers)
```

### 13.3 Formules d'heures supplementaires
```
salaire_horaire_base = salaire_brut_mensuel / 173.33  (base 40h/sem, 4.33 semaines)
montant_brut_hs = heures_supp * salaire_horaire_base
montant_calcule = montant_brut_hs * (1 + taux_majoration/100)
# taux_majoration : 100% (simple) | 125% (nuit/weekend) | 150% (jour ferie)
```

### 13.4 Formules de paie
```
salaire_brut = salaire_base + heures_supp_montant_calcule + primes - retenues_absences
cotisations = salaire_brut * taux_charges
net_a_payer = salaire_brut - cotisations - deductions_prets - autres_retenues
taux_charges = (cotisations / salaire_brut) * 100
```

### 13.5 Formules de prets
```
mensualite = (montant_accorde * (taux_interet/12)) / (1 - (1 + taux_interet/12)^(-duree_mois))
mois_restants = duree_mois - mois_payes
solde_restant = montant_accorde - (mensualite * mois_payes)
# Cas taux 0% : mensualite = montant_accorde / duree_mois
```

### 13.6 Formules d'indemnite de depart
```
# Demission : aucune indemnite
# Fin CDD : prime_precarite = 10% * somme_salaires_bruts_periode
# Licenciement : indemnite_legale = (1/5 * salaire_moyen * annees_anciennete) + (2/15 * salaire_moyen * annees > 10)
# Retraite : indemnite_depart_retraite (formule conventionnelle)
# Solde tout compte = dernier salaire + indemnite_conges_payes + indemnite + primes
```

### 13.7 Formules d'anciennete
```sql
-- SQL pour calculer l'anciennete en annees
anciennete_annees = EXTRACT(YEAR FROM age(current_date, date_embauche))
anciennete_mois = EXTRACT(MONTH FROM age(current_date, date_embauche))
```

### 13.8 Formules de jours restants
```sql
jours_restants_contrat = date_fin - current_date  -- dans d02_contracts
jours_restants_document = date_expiration - current_date  -- dans d02_employee_documents
jours_restants_visite = date_prochaine_visite - current_date  -- dans d02_medical_visits
jours_restants_permis = date_expiration - current_date  -- dans d02_work_permits
```

### 13.9 Regles de bascule de statut auto

| Table | Champ | Condition | Nouveau statut |
|:------|:------|:----------|:--------------|
| d02_contracts | statut | `date_fin < NOW()` | `echu` |
| d02_employee_documents | statut | `date_expiration < NOW()` | `expire` |
| d02_employee_documents | statut | `jours_restants <= 30` | `a_renouveler` |
| d02_work_permits | statut | `date_expiration < NOW()` | `expire` |
| d02_medical_visits | (alerte) | `date_prochaine_visite - NOW() <= 15` | trigger rappel |
| d02_social_declarations | statut | `date_echeance < NOW() AND statut != 'soumise'` | `en_retard` |
| d02_reminders | statut | `date_echeance < NOW()` | `en_retard` |

### 13.10 Regles de generation automatique de rappels

| Source | Condition | Type de rappel cree |
|:-------|:----------|:---------------------|
| d02_employee_documents | jours_restants <= 30 | expiration_document |
| d02_work_permits | jours_restants <= 30 | expiration_document |
| d02_contracts | jours_restants <= 30 (renouvellement) | renouvellement_contrat |
| d02_contracts (essai) | echeance periode essai <= 7j | echeance_periode_essai |
| d02_medical_visits | date_prochaine_visite <= NOW()+15j | visite_medicale |
| d02_social_declarations | date_echeance <= NOW()+7j | declaration_sociale |

---

## 14. KPIs & TABLEAU DE BORD

### 14.1 12 KPIs principaux (5 categories)

| KPI | Description | Formule SQL | Frequence | Cible |
|:----|:-----------|:------------|:----------|:------|
| **Effectif total** | Nombre d'employes inscrits | `COUNT(*) FROM employees` | Mensuel | - |
| **Taux d'actifs** | Employes actifs / Total | `COUNT(*) FILTER (statut='Actif') / COUNT(*) * 100` | Mensuel | > 90% |
| **Contrats en vigueur** | Contrats actifs non echus | `COUNT(*) FROM d02_contracts WHERE statut='en_vigueur'` | Mensuel | - |
| **Documents conformes** | Documents valides / Total | `COUNT(*) FILTER (statut='valide') / COUNT(*) * 100` | Mensuel | 100% (Obj.1) |
| **Taux de presence** | Jours presents / Jours ouvrables | `AVG(taux_presence) FROM d02_monthly_planning` | Mensuel | > 95% (Obj.4) |
| **Total absences** | Somme jours d'absence | `SUM(duree_jours) FROM d02_absences WHERE mois=current` | Mensuel | - |
| **Heures supp validees** | Heures supp approuvees | `SUM(heures_supp) FROM d02_overtime_hours WHERE statut='validee'` | Mensuel | - |
| **Masse salariale brute** | Total salaires bruts mensuels | `SUM(salaire_brut) FROM d02_pay_slips WHERE mois=current` | Mensuel | - |
| **Total cotisations** | Somme cotisations sociales | `SUM(cotisations) FROM d02_pay_slips WHERE mois=current` | Mensuel | - |
| **Declarations en retard** | Declarations hors delai | `COUNT(*) FROM d02_social_declarations WHERE statut='en_retard'` | Mensuel | 0 (Obj.5) |
| **Dossiers depart clos** | Dossiers finalises | `COUNT(*) FROM d02_departures WHERE statut='clos' AND mois=current` | Mensuel | - |
| **Rappels en retard** | Echeances depassees non traitees | `COUNT(*) FROM d02_reminders WHERE statut='en_retard'` | Hebdomadaire | 0 |

### 14.2 KPIs etendus (processus ISO - 4 dimensions)

| Dimension | KPI | Cible |
|:----------|:----|:------|
| **Efficacite** | Taux de conformite des dossiers | > 95% |
| **Efficience** | Cout par dossier traite | A definir |
| **Delai** | Temps de cycle moyen par processus | - |
| **Qualite** | Taux de reclamation/correction | < 5% |

### 14.3 KPIs par processus ISO

#### Processus 1 - Entree (Onboarding)
- Delai moyen entre acceptation offre et signature : **< 5 jours ouvres**
- Taux de completude du dossier a J+1
- Taux de retention a 6 mois (qualite onboarding)
- Conformite juridique des contrats : **0 contentieux**

#### Processus 2 - Quotidien
- Taux de fiabilite du pointage : **> 98%**
- Respect des plafonds legaux d'heures supp
- Couverture medicale a 100% (visites obligatoires dans les delais)
- Delai de validation des plannings : **< 48h avant periode**

#### Processus 3 - Conges & Absences
- Delai de traitement des demandes : **< 3 jours ouvres**
- Precision des soldes de conges : **ecart = 0** entre compteur et reel
- Taux de respect des droits acquis
- Conformite des delais de declaration maladie

#### Processus 4 - Paie & Prevoyance
- Exactitude des bulletins : **taux d'erreur < 0.5%**
- Ponctualite du paiement : **100% a la date legale**
- Conformite des declarations sociales : **0 penalite**
- Tracabilite des calculs : **piste d'audit complete**
- Confidentialite des donnees salariales : **RGPD respecte**

#### Processus 5 - Suivi Documentaire
- Disponibilite immediate des documents requis : **< 24h**
- Integrite des dossiers : **aucune piece manquante lors d'audits**
- Durees de conservation respectees (5 ans, 50 ans selon nature)
- Securite des donnees sensibles : **acces restreints, chiffrement**
- Taux de restitution des prets : **100%**

#### Processus 6 - Sortie
- Delai de remise du solde de tout compte (respect delais legaux)
- Taux de restitution du materiel : **100%**
- Qualite de l'archivage : **dossier complet avant transfert**
- Satisfaction du depart (NPS - Net Promoter Score)
- Absence de litiges post-depart : **contentieux = 0**

### 14.4 Indicateurs de resultat (KPIs strategiques)
- **Taux de rotation du personnel** (turnover) : nombre departs / effectif moyen
- **Indice de satisfaction interne** (enquetes collaborateurs)
- **Conformite sociale** : 0 redressement URSSAF/CNPS
- **Couverture des risques** : habilitations a jour, visites medicales a jour

### 14.5 Outils de surveillance
- **Audits internes** : verification trimestrielle de la conformite des processus
- **Revue de direction** : analyse trimestrielle des KPIs et decisions d'amelioration (ACT du PDCA)
- **Logiciels** : SIRH pour la tracabilite automatisee

---

## 15. INTERCONNEXION BILATERALE D1-D2

L'interconnexion D1 (Recrutement) - D2 (Administration RH) est la **pierre angulaire** du systeme RH. Elle marque la transition officielle du statut candidat a celui d'employe.

### 15.1 Domaines concernes
- **D1 - Recrutement** : 19 feuilles (1 Demandes Recrutement + 18 Tableaux de Bord)
- **D2 - Administration** : 22 feuilles operationnelles
- **Normes** : ISO 10667:2011 (D1) + ISO 30401:2018 (D2) + ISO 22400-3:2022 (KPIs)

### 15.2 Les 5 points d'interconnexion (IC-D1-D2)

| Code | Source D1 | Cible D2 | Type transfert | Donnees echangees |
|:-----|:---------|:---------|:--------------|:------------------|
| **IC-D1-D2-01** | 11-Integration Employe | 2-Fiche Employe | D1 -> D2 (+ remontees) | Identite, coordonnees, poste, date entree, statut |
| **IC-D1-D2-02** | 6-Suivi Contrats | 3-Contrats Travail | D1 -> D2 (+ remontees) | Type contrat (CDI/CDD), duree, periode essai, classification, salaire base, avantages, clauses particulieres |
| **IC-D1-D2-03** | 13-Periode Essai | 4-Avenants Contrat | D1 -> D2 (+ remontees) | Validation fin essai, prolongation, modification conditions initiales (poste, reclassification, salaire) |
| **IC-D1-D2-04** | 12-Checklist Integration | 5-Suivi Documents | D1 <-> D2 (bidirectionnel) | Pieces justificatives (CNI, attestations, diplomes, RIB, etc.) + statut validation |
| **IC-D1-D2-05** | 17-Suivi Post-Embauche | 1-Tableau de Bord | D1 -> D2 (+ remontees) | Indicateurs qualite (taux retention 3/6 mois, turnover precoce), delais completude, satisfaction, alertes operationnelles |

### 15.3 Flux D1 -> D2 (declencheur : chaque embauche)

| Categorie | Donnees echangees |
|:----------|:------------------|
| **Identite** | Donnees d'identite du candidat devenu collaborateur (nom, prenom, date naissance, etc.) |
| **Contractuel** | Elements contractuels (type contrat, duree, classification, salaire) |
| **Justificatifs** | Documents justificatifs collectes en recrutement |
| **Suivi** | Indicateurs de suivi du processus d'integration |

### 15.4 Flux D2 -> D1 (boucle de retroaction)

| Type donnees | Usage |
|:-------------|:------|
| **Remontees qualite** | Feedback sur la qualite des recrutements realises |
| **Donnees de pilotage** | Metriques permettant d'optimiser le processus de recrutement |
| **Anomalies** | Anomalies detectees dans les dossiers, documents manquants, erreurs de saisie |
| **Incoherences** | Incoherences contractuelles, retards de completude, non-conformites |

### 15.5 Documents justificatifs a collecter (D1 -> D2)
- Copie de la CNI ou passeport
- Certificat de travail precedent
- Attestation de la CNPS
- Extrait de casier judiciaire
- Certificat medical d'aptitude
- Diplomes
- RIB bancaire
- Photos d'identite
- Certificat de domicile

### 15.6 KPIs de suivi post-embauche (D1 -> D2)
| Indicateur | Formule |
|:-----------|:--------|
| **Taux de retention** | (Nombre collaborateurs restants / Total embauches) * 100 (a 3 mois et 6 mois) |
| **Turnover precoce** | Nombre departs durant periode essai |
| **Efficacite administrative** | Delai moyen de completude du dossier administratif |
| **Qualite percue** | Taux de satisfaction des nouveaux employes |
| **Fiabilite recrutement** | Ecarts entre engagements recrutement et realite constatee |

### 15.7 Regles d'interconnexion (Implementation technique)

| Regle | Implementation |
|:------|:--------------|
| **Validation croisee D1-D2** | Verification conjointe de chaque fiche employe creee par D1 et D2 avant validation definitive |
| **Convention de donnees D1-D2** | Regles d'echange, delais transmission, responsabilites, mecanismes correction |
| **Automatisation des transferts** | Source : Feuille Integration Employe D1 -> Destination : Fiche Employe D2 (webhook/event) |
| **Audit trimestriel qualite** | Metriques : coherence donnees inter-domaines, taux erreurs transmission, delai moyen completude |
| **Integration Retex** | Retours d'experience D2 + suivi post-embauche D1 + checklist integration D1-12 + indicateurs D2-1 |

### 15.8 Risques d'interconnexion
- **Propagation des erreurs** de D1 vers D2 (paie, declarations sociales, conges)
- **Non-conformites reglementaires** et litiges en cas de donnees incorrectes
- **Sanctions** lors des audits du systeme de management RH

### 15.9 Recommandations operationnelles
1. **Revue mensuelle obligatoire** entre responsable recrutement (D1) et responsable administration (D2)
2. **Evaluation qualitative** des donnees transmises lors de chaque embauche
3. **Mesure des delais** de completude des dossiers pour identifier les points de friction recurrents
4. **Conservation des donnees historiques** : La connexion vers Departs & Archives doit conserver les donnees meme si la Fiche Employe maitre est archivee

---

## 16. DESIGN SYSTEM

### 16.1 Palette de couleurs
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

# Couleurs speciales workflows
Phase 1 - Identification:     #1B4F72
Phase 2 - Contractualisation: #2E86C1
Phase 3 - Presence:           #27AE60
Phase 4 - Paie:               #F39C12
Phase 5 - Archivage:          #8E44AD

# Couleurs statuts
En attente:    jaune (#F39C12)
Valide/Approuve: vert (#27AE60)
Rejete/Expire: rouge (#E74C3C)
Brouillon:     gris (#7F8C8D)
Annule:        gris fonce (#566573)
```

### 16.2 Composants shadcn/ui a utiliser
- Layout: Sidebar (collapsible), Header, Main
- Data: DataTable (avec sorting, filtering, pagination)
- Forms: Input, Select, Textarea, DatePicker, Switch, Checkbox
- Feedback: Dialog, Sheet (slide-over), AlertDialog, Toast, Badge, Alert
- Navigation: Tabs, Breadcrumbs, Command (search)
- Display: Card, Avatar, Tooltip, Separator, Skeleton, Progress
- Charts: Recharts (bar, donut, line) pour le dashboard

### 16.3 Typographie
- Titres: font-semibold, text-slate-900
- Labels: text-sm font-medium text-slate-700
- Data: text-sm text-slate-600
- Montants: font-mono text-right (format `1 234 567 FCFA`)
- Dates: format `DD/MM/YYYY`

### 16.4 Patterns UX
- **List pages** : Filtres en haut (sticky) -> Table -> Pagination en bas
- **Detail pages** : Header avec retour -> Tabs -> Contenu
- **Forms** : Dialog (creation rapide) ou Page dediee (formulaire complexe)
- **Statuts** : Badge avec couleur (vert=actif, rouge=inactif, jaune=en_attente, gris=brouillon)
- **Montants** : Format `1 234 567 FCFA` avec separateur milliers
- **Dates** : Format `DD/MM/YYYY`
- **Empty states** : Illustration + texte + bouton d'action
- **Loading** : Skeleton cards/table rows
- **Confirmation** : AlertDialog avant suppression/action irreversible
- **Alertes echeance** : Badge couleur selon jours restants (>30 vert, 15-30 orange, <15 rouge)

### 16.5 Composants reutilisables a developper
- `<StatusBadge status="..." />` - Badge unifie pour tous les statuts
- `<MontantCell value={1234567} currency="FCFA" />` - Cellule montant formate
- `<DateCell value={date} format="DD/MM/YYYY" />` - Cellule date formatee
- `<JoursRestantsCell date={expiration} />` - Cellule jours restants avec badge couleur
- `<EmployeePicker />` - Selecteur d'employe avec recherche (remplace VLOOKUP)
- `<DataTable />` - Table generique avec sorting/filtering/pagination server-side
- `<EmptyState icon="..." title="..." action="..." />` - Etat vide
- `<WorkflowTimeline steps={...} />` - Timeline de workflow
- `<KPICard label="..." value={...} target={...} trend={...} />` - Card KPI avec tendance
- `<PhaseBadge phase={1-5} />` - Badge de phase du cycle de vie

---

## 17. REGLES TECHNIQUES

### 17.1 App Router (Next.js 15)
- Chaque ecran = 1 dossier dans `/app/(dashboard)/domaine-2/`
- Server Components par defaut, Client Components seulement si interactif
- Donnees via Supabase Server (cote server) ou Supabase Client (cote client pour temps reel)

### 17.2 Supabase Integration
- `@supabase/supabase-js` avec `createServerClient()` (Server Components) et `createBrowserClient()` (Client Components)
- RLS: `app.tenant_id` doit etre set dans les headers ou via `set_config('app.tenant_id', $tenantId)`
- Queries avec filtre `tenant_id` obligatoire
- Realtime subscription pour les notifications conges/approbations/HS

### 17.3 Multi-tenant
- Chaque requete doit filtrer par `tenant_id`
- Le tenant_id est stocke dans un context React (TenantProvider)
- RLS policies activees sur toutes les tables d02_*

### 17.4 Performance
- Server-side rendering pour les DataTables (pas de fetch client cote)
- Suspense boundaries avec Skeleton loaders
- Pagination cote serveur (cursor-based ou offset)
- Index sur `tenant_id`, `employee_id`, `statut`, dates sur toutes les tables
- Materialized views pour les KPIs du Tableau de Bord (refresh nocturne)

### 17.5 Securite
- Toutes les mutations (create/update/delete) via Server Actions
- Validation des donnees avec Zod (schemas par table)
- Pas de donnees sensibles en clair dans le DOM (RIB masque: `****1234`)
- RGPD : donnees personnelles chiffrees au repos (supabase)
- Audit trail : table `d02_audit_log` pour tracer toutes les modifications

### 17.6 Triggers SQL (a implementer)

```sql
-- 1. Auto-calcul jours_restants et bascule statut sur d02_contracts
CREATE TRIGGER trg_contracts_status
  BEFORE INSERT OR UPDATE ON admina_rh.d02_contracts
  FOR EACH ROW EXECUTE FUNCTION update_contract_status();

-- 2. Auto-calcul solde_disponible et taux_utilisation sur d02_leave_balances
CREATE TRIGGER trg_leave_balances_calc
  BEFORE INSERT OR UPDATE ON admina_rh.d02_leave_balances
  FOR EACH ROW EXECUTE FUNCTION calc_leave_balances();

-- 3. Auto-generation rappels quand document expire dans < 30 jours
CREATE TRIGGER trg_documents_reminder
  AFTER INSERT OR UPDATE ON admina_rh.d02_employee_documents
  FOR EACH ROW EXECUTE FUNCTION generate_document_reminder();

-- 4. Auto-bascule statut document a 'a_renouveler' puis 'expire'
CREATE TRIGGER trg_document_status
  BEFORE UPDATE ON admina_rh.d02_employee_documents
  FOR EACH ROW EXECUTE FUNCTION update_document_status();

-- 5. Auto-update solde conges quand demande approuvee
CREATE TRIGGER trg_leave_request_approved
  AFTER UPDATE OF statut ON admina_rh.d02_leave_requests
  FOR EACH ROW WHEN (NEW.statut = 'approuvee')
  EXECUTE FUNCTION update_leave_balance();

-- 6. Auto-marquage rappel en retard si echeance depassee
-- (cron quotidien : UPDATE d02_reminders SET statut='en_retard' WHERE date_echeance < NOW() AND statut='en_attente')
```

### 17.7 Realtime subscriptions (Supabase)
- Channel `d02_notifications` : notifications conges, HS, rappels
- Channel `d02_employees` : maj temps reel des listes
- Channel `d02_pay_slips` : notification generation paie

---

## 18. LIVRABLES ATTENDUS

### 18.1 Layout & Navigation
1. **Layout** : Sidebar + Header + Main responsive (mobile-first)
2. **Navigation** : Sidebar avec liens D1-D31, D2 expande avec sous-menus (22 entrees)
3. **Breadcrumbs** sur chaque page detail

### 18.2 Ecrans fonctionnels (25 ecrans V2)
1. **22 ecrans listes** dans la section 10
2. **3 ecrans NEW V2** : PDCA, Non-Conformites, Interconnexion D1-D2

### 18.3 Dashboard
- 12 KPI cards principales avec tendance
- Charts Recharts (bar, donut, line, area)
- Mini-tableaux (rappels, conges en attente, etc.)
- Filtres periode (mois, trimestre, annee)

### 18.4 Server Actions (CRUD complet)
- Toutes les operations CRUD sur les 24 tables (15 + 6 + 3 new V2)
- Actions de workflow specifiques (approve, reject, validate, close, etc.)
- Generation automatique de rappels, calculs auto

### 18.5 Schemas Zod
- Un schema par entite BDD (validation cote formulaire + cote server)
- Schemas de workflow (statut transitions autorisees)

### 18.6 Types TypeScript
- Types pour toutes les entites BDD (auto-generes depuis Supabase ou manuels)
- Enums pour tous les statuts/types
- Types de workflow (etapes, transitions)

### 18.7 Composants reutilisables
- StatusBadge, MontantCell, DateCell, JoursRestantsCell, EmployeePicker
- DataTable, EmptyState, WorkflowTimeline, KPICard, PhaseBadge
- FormField (wrapper Input/Select/Textarea avec label+error)

### 18.8 SQL Migrations
- `migration_6_tables_manquantes_D02.sql` (deja existant)
- `migration_3_tables_v2.sql` (NEW : non_conformities, pdca_actions, audit_reports)
- `migration_triggers_d02.sql` (NEW : tous les triggers)
- `migration_views_d02.sql` (NEW : vues materialisees pour KPIs)

### 18.9 Donnees de reference
- Seed `ref_lists` avec toutes les nomenclatures (civilités, genres, types contrats, statuts, regimes)
- Seed `ref_departments` et `ref_positions`

---

## 19. CONTRAINTES

- **NE PAS modifier** les tables existantes dans Supabase (utiliser migrations additifs)
- **NE PAS implementer** l'authentification (elle sera geree separement)
- **Utiliser les noms de colonnes EXACTS** de la BDD (snake_case)
- **Toutes les interfaces en FRANCAIS**
- **Mobile-first responsive** (breakpoints Tailwind: sm, md, lg, xl, 2xl)
- **Accessibilite** : labels ARIA, navigation clavier, contrastes WCAG AA
- **Pas d'emojis** dans le code (sauf si demande explicite)
- **Nomenclature commits** : `feat(d02): ...`, `fix(d02): ...`, `refactor(d02): ...`
- **Tests** : un test E2E minimum par ecran (Playwright)
- **Documentation** : chaque Server Action documentee avec JSDoc

---

## 20. ORDRE DE REALISATION (PHASES)

### Phase A - Fondation (1 semaine)
1. Migration SQL (3 tables V2 + triggers + vues materialisees)
2. Types TypeScript (auto-gen + manuels)
3. Schemas Zod par entite
4. Composants reutilisables (StatusBadge, DataTable, etc.)
5. Layout + Sidebar + Header

### Phase B - Tableau de Bord + Fiche Employe (1 semaine)
1. Ecran 1 : Tableau de Bord (KPIs + charts)
2. Ecran 2 : Liste Employes
3. Ecran 3 : Detail Employe (10 tabs)
4. EmployeePicker + ref_lists seed

### Phase C - Contractuel & Documentaire (1 semaine)
5. Ecran 4 : Contrats (avec auto-calc duree/jours restants)
6. Ecran 5 : Avenants
7. Ecran 6 : Documents (avec alertes)
8. Ecran 7 : Bancaires
9. Ecran 8 : Mutuelle
10. Ecran 9 : Permis

### Phase D - Conges, Absences, Pointage (1.5 semaines)
11. Ecran 10 : Conges (avec workflow 2 niveaux)
12. Ecran 11 : Soldes (auto-calc)
13. Ecran 12 : Absences (avec upload justificatif)
14. Ecran 13 : Heures Supp (avec validation manager obligatoire)
15. Ecran 14 : Pointage
16. Ecran 15 : Planning Mensuel

### Phase E - Paie & Conformite (1 semaine)
17. Ecran 16 : Paie (generation + PDF)
18. Ecran 17 : Declarations (avec alertes retard)
19. Ecran 18 : Prets (avec calculateur mensualite)
20. Ecran 19 : Sanctions (4 niveaux + procedure)
21. Ecran 20 : Visites Medicales (4 types + 4 aptitudes)

### Phase F - Sortie & Pilotage (1 semaine)
22. Ecran 21 : Departs (checklist complete)
23. Ecran 22 : Archivage (durees conservation)
24. Ecran 22b : Rappels (auto-generation + timeline)

### Phase G - V2 New (0.5 semaine)
25. Ecran 23 : PDCA (kanban + timeline)
26. Ecran 24 : Non-Conformites (registre + wizard)
27. Ecran 25 : Interconnexion D1-D2 (vue graphique)

### Phase H - Tests & Polish (0.5 semaine)
- Tests E2E Playwright (1 par ecran)
- Optimisation performance (lazy load, prefetch)
- Accessibilite (audit axe-core)
- Documentation finale

**Total estime** : 7.5 semaines de developpement

---

## 21. ACCEPTATION & VALIDATION

Le Domaine 2 sera considere comme complet lorsque :

- [ ] Les 25 ecrans sont fonctionnels et responsive
- [ ] Tous les workflows d'approbation fonctionnent (conges 2 niveaux, HS validation, sanctions procedure, depart checklist)
- [ ] Les 12 KPIs du Tableau de Bord s'affichent en temps reel
- [ ] Les formules de calcul sont correctes (conges, HS, paie, indemnite, pret)
- [ ] Les triggers SQL generent automatiquement les rappels et bascules de statut
- [ ] L'interconnexion D1-D2 est visible (ecran 25) avec les 5 points IC-D1-D2
- [ ] Le cycle PDCA et le registre NC sont operationnels
- [ ] Les 7 objectifs strategiques sont mesurables sur le Tableau de Bord
- [ ] La conformite ISO 30401:2018 + ISO 9001:2015 est respectee (RACI, audits, NC)
- [ ] Tests E2E passent
- [ ] Accessibilite WCAG AA verifiee

---

## 22. ANNEXE - GLOSSAIRE

| Terme | Definition |
|:------|:----------|
| **PDCA** | Plan-Do-Check-Act, cycle de Deming pour l'amelioration continue |
| **RACI** | Responsible, Approbateur, Consulte, Informe (matrice de responsabilites) |
| **KPI** | Key Performance Indicator (indicateur cles de performance) |
| **VLOOKUP** | Fonction Excel de recherche verticale, equivalent SQL = JOIN |
| **COUNTIF** | Fonction Excel de comptage conditionnel, equivalent SQL = COUNT FILTER |
| **IFERROR** | Fonction Excel de gestion d'erreur, equivalent SQL = COALESCE/IFNULL |
| **CNPS** | Caisse Nationale de Prevoyance Sociale (Cameroun) |
| **CNP** | Caisse Nationale de Prevoyance |
| **MINTSS** | Ministere du Travail et de la Securite Sociale |
| **DGSN** | Direction Generale de la Securite Nationale |
| **DSN** | Declaration Sociale Nominative |
| **ISO 30401** | Norme Systeme de Management RH |
| **ISO 9001** | Norme Systeme de Management de la Qualite |
| **ISO 10667** | Norme Services de conseil en recrutement |
| **ISO 22400-3** | Norme KPIs RH |
| **NPS** | Net Promoter Score (satisfaction) |
| **Retex** | Retour d'Experience |
| **Ishikawa** | Diagramme cause-effet (5M) pour analyse cause racine |
| **5 Pourquoi** | Methode d'analyse cause racine iterative |
| **Fiche Employe** | Feuille maitresse du Domaine 2, source unique de verite |
| **_Lists** | Feuille de reference centralisant les nomenclatures |
| **Onboarding** | Processus d'integration d'un nouvel employe (Entree) |
| **Offboarding** | Processus de sortie d'un employe (Sortie) |
| **Solde de tout compte** | Document recapitulatif des sommes verses au depart |
| **Période d'essai** | Periode initiale du contrat ou rupture est possible sans indemnite |
| **Avenant** | Modification d'un contrat de travail (salaire, poste, temps partiel) |

---

**Fin du prompt V2 - Domaine 2 Admina_RH**
**Version** : 2.0
**Date** : 2026
**Reference** : Manuel de Procedures RH Domaine 2 (ISO 30401:2018 + ISO 9001:2015)
**Sources** : 27 analyses VLM consolidees (17 pages Manuel + 6 pages Interconnexion D1-D2 + 4 schemas techniques)
