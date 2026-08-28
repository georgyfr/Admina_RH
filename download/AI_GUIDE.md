# AI_GUIDE.md — Admina-RH

> **VERSION DE GEL : v1.0 — 29 août 2026**
> **Taux de couverture au gel : 57% (144/279 champs Excel)**
> **URL de référence : https://admina-rh-bd0.pages.dev/**

---

## RèGLE SUPRÊME

> **Ne JAMAIS modifier, supprimer ou altérer les pages, composants et données listés dans la section**
> **[FROZEN — CODE GELÉ] ci-dessous. Toute modification d'un élément gelé est INTERDITE.**
> **En cas de doute, vérifiez les screenshots dans `/frozen-snapshots/`.**

---

## TABLE DES MATIÈRES

1. [Architecture du projet](#architecture-du-projet)
2. [FROZEN — Pages gelées (16 pages)](#frozen--pages-gelées-16-pages)
3. [FROZEN — Composants partagés gelés](#frozen--composants-partagés-gelés)
4. [FROZEN — Données de référence (nomenclatures)](#frozen--données-de-référence-nomenclatures)
5. [DEV — Pages à construire (2 pages)](#dev--pages-à-construire-2-pages)
6. [DEV — Champs manquants à ajouter](#dev--champs-manquants-à-ajouter)
7. [Workflow obligatoire](#workflow-obligatoire)
8. [Vérification avant chaque modification](#vérification-avant-chaque-modification)

---

## Architecture du projet

```
Admina-RH/
├── src/
│   ├── App.jsx              # [FROZEN] Routeur principal, sidebar, layout
│   ├── components/
│   │   ├── Sidebar.jsx       # [FROZEN] Menu latéral complet avec 26 liens
│   │   ├── Header.jsx        # [FROZEN] Barre supérieure (recherche, notifs, user)
│   │   └── KPICard.jsx       # [FROZEN] Composant carte KPI réutilisable
│   ├── pages/
│   │   ├── TableauDeBord.jsx   # [FROZEN] /
│   │   ├── Entretiens.jsx      # [FROZEN] /entretiens
│   │   ├── Evaluations.jsx     # [FROZEN] /evaluations
│   │   ├── Verifications.jsx   # [FROZEN] /verifications
│   │   ├── Selections.jsx      # [FROZEN] /selections
│   │   ├── Cabinets.jsx        # [FROZEN] /cabinets
│   │   ├── Contrats.jsx        # [FROZEN] /contrats
│   │   ├── Integration.jsx     # [FROZEN] /integration
│   │   ├── Checklist.jsx       # [FROZEN] /checklist
│   │   ├── PeriodeEssai.jsx    # [FROZEN] /periode-essai
│   │   ├── Formation.jsx       # [FROZEN] /formation
│   │   ├── PostEmbauche.jsx    # [FROZEN] /post-embauche
│   │   ├── Stagiaires.jsx      # [FROZEN] /stagiaires
│   │   ├── Saisonniers.jsx     # [FROZEN] /saisonniers
│   │   ├── Previsions.jsx      # [FROZEN] /previsions
│   │   ├── Sources.jsx         # [FROZEN] /sources
│   │   ├── Couts.jsx           # [FROZEN] /couts
│   │   ├── Pipeline.jsx        # [FROZEN] /pipeline
│   │   ├── Documents.jsx       # [FROZEN] /documents
│   │   ├── Conformite.jsx      # [FROZEN] /conformite
│   │   ├── Parametres.jsx      # [FROZEN] /parametres
│   │   ├── Audit.jsx           # [FROZEN] /audit
│   │   ├── TypesContrats.jsx   # [FROZEN] /types-contrats
│   │   ├── Departements.jsx    # [FROZEN] /departements
│   │   ├── SourcesROI.jsx      # [FROZEN] /sources-roi
│   │   ├── Experiences.jsx     # [FROZEN] /experiences
│   │   ├── FormationsCandidats.jsx # [FROZEN] /formations
│   │   ├── Competences.jsx     # [FROZEN] /competences
│   │   ├── Statuts.jsx         # [FROZEN] /statuts
│   │   ├── Demandes.jsx        # [DEV] /offres — PAGE EN CONSTRUCTION
│   │   └── Candidats.jsx       # [DEV] /candidats — PAGE EN CONSTRUCTION
│   └── data/
│       └── nomenclatures.js    # [FROZEN] 38 listes de référence
├── AI_GUIDE.md                # CE FICHIER
├── FROZEN_STATE.md           # État détaillé du gel
└── frozen-snapshots/          # 28 screenshots de référence
```

---

## FROZEN — Pages gelées (16 pages)

### Les règles absolues pour chaque page gelée :
- ❌ **NE PAS** modifier les colonnes existantes d'un tableau
- ❌ **NE PAS** supprimer ou renommer un champ affiché
- ❌ **NE PAS** changer le titre, le sous-titre ou la description
- ❌ **NE PAS** modifier les KPI cards (texte, valeur, calcul)
- ❌ **NE PAS** changer le style MUI/Material UI des composants existants
- ❌ **NE PAS** modifier les données d'exemple (mock data) visibles
- ❌ **NE PAS** altérer les filtres, boutons et actions existants
- ✅ **AUTORISÉ** : AJOUTER de nouvelles colonnes à DROITE des existantes
- ✅ **AUTORISÉ** : AJOUTER de nouveaux KPI cards à CÔTÉ des existants
- ✅ **AUTORISÉ** : AJOUTER de nouveaux filtres
- ✅ **AUTORISÉ** : AJOUTER de nouveaux boutons d'action
- **Vérification** : Comparer avec le screenshot correspondant dans `/frozen-snapshots/`

---

### PAGE 01 — Tableau de Bord (`/`)
- **Screenshot** : `frozen-snapshots/01_tableau-de-bord.png`
- **Titre** : "Tableau de Bord"
- **Sous-titre** : "Vue d'ensemble de votre activité de recrutement"
- **4 KPI Cards existants (GELÉS)** :
  - "Total Demandes" : 8, "5 demandes ouvertes"
  - "Total Candidats" : 10, "9 candidats actifs"
  - "Taux de Conversion" : 20.0%, "2 retenus / 10 candidats"
  - "Délai Moyen" : 27 j, "jours ouvrés"
- **4 Graphiques existants (GELÉS)** :
  - "Évolution du Recrutement" (linéaire, Oct 2024–Fév 2025, 2 séries: Demandes créées, Demandes pourvues)
  - "Sources de Recrutement" (barres horizontales, 6 sources)
  - "Répartition par Département" (donut, 8 départements)
  - "Statuts des Demandes" (barres, 6 statuts: Brouillon, En attente validation, Validée, Publiée, Pourvue, Clôturée)
- **2 Listes existantes (GELÉES)** :
  - "Demandes Récentes" (5 items: DR-2025-008, 006, 003, 004, 002)
  - "Candidats Récents" (5 items: Eyenga, Bikay, Nkoulou, Kamga, Mebara)
- **Champs gelés par item Demande** : N°, Poste, Département (chip), Statut (chip), Date
- **Champs gelés par item Candidat** : Nom complet, N° CAN, Source (chip), Étape (chip), Score (/20 si applicable)

---

### PAGE 02 — Pipeline Candidatures (`/pipeline`)
- **Screenshot** : `frozen-snapshots/19_pipeline-candidatures.png`
- **Titre** : "Pipeline de Recrutement"
- **Sous-titre** : "Glissez-déposez les candidats entre les colonnes"
- **8 Colonnes Kanban (GELÉES)** :
  1. Nouvelle candidature (1 carte)
  2. CV reçus (1 carte)
  3. Pré-sélection (1 carte)
  4. Entretien téléphonique (1 carte)
  5. Entretien physique (2 cartes)
  6. Test technique (1 carte)
  7. Vérification références (1 carte)
  8. Proposition envoyée (0 carte, texte "Aucun candidat")
  9. Embauché (2 cartes)
- **Champs gelés par carte** : Nom candidat, Poste, Source, Priorité (chip), Date, Score (/20 si applicable)
- **Footer (GELÉ)** : "10 candidats dans le pipeline" + résumé par stade + "Stades actifs : 89% du pipeline"
- **Bouton (GELÉ)** : "Nouvelle candidature"

---

### PAGE 03 — Planning Entretiens (`/entretiens`)
- **Screenshot** : `frozen-snapshots/03_planning-entretiens.png`
- **Titre** : "Planification des Entretiens"
- **Compteur** : "7 entretien(s)"
- **Bouton** : "Ajouter Entretien"
- **4 Filtres onglets (GELÉS)** : Tous, Planifiés, Réalisés, Annulés
- **8 Colonnes tableau (GELÉES)** :
  - Candidat, Type, Date & Heure, Durée, Lieu/Lien, Évaluateur(s), Statut, Résultat, Actions
- **Données gelées** : 7 lignes (Ndiaye, Tchouankou, Nganou×2, Mebara, Kamga, Nkoulou Brandon)
- **Pagination** : "1–7 of 7", Rows per page: 10

---

### PAGE 04 — Grille Évaluation (`/evaluations`)
- **Screenshot** : `frozen-snapshots/04_grille-evaluation.png`
- **Titre** : "Évaluations des Candidats"
- **Compteur** : "3 évaluation(s) enregistrée(s)"
- **Bouton** : "Nouvelle Évaluation"
- **3 KPI Cards (GELÉS)** : TOTAL ÉVALUATIONS: 3, SCORE MOYEN: 15.1/20, RECOMMANDATION EMBAUCHE: 2, RECOMMANDATION REFUS: 1
- **Format cartes d'évaluation (GELÉ)** — Chaque carte contient :
  - Nom candidat + "Évaluateur : {nom} — {date}"
  - Bouton de recommandation : "Embaucher" ou "Ne pas embaucher"
  - 5 critères notés /5 avec commentaire : Compétences techniques, Expérience professionnelle, Qualités humaines, Motivation, Adéquation au poste
  - Total /25 + Score /20 + "soit {x}/25"
  - Zone "Commentaire global"
- **3 Évaluations gelées** : Ndiaye Moussa (23.8/25), Tchouankou Claire (19.7/25), Nkoulou Brandon (13.0/25)

---

### PAGE 05 — Vérification Références (`/verifications`)
- **Screenshot** : `frozen-snapshots/05_verification-references.png`
- **Titre** : "Vérification des Références"
- **Compteur** : "2 vérifications enregistrées"
- **Bouton** : "Ajouter Vérification"
- **3 KPI Cards (GELÉS)** : TOTAL: 2, VÉRIFIÉS: 2, EN ATTENTE: 0, NON VÉRIFIÉS: 0
- **8 Colonnes tableau (GELÉES)** : Candidat, Entreprise, Contact, Téléphone, Date Vérification, Vérificateur, Statut, Résultat, Actions
- **Résultat affiché comme 3 chips** : Fiabilité, Performance, Comportement
- **2 Données gelées** : Ndiaye Moussa (Hôtel Sawa), Tabe Arnaud (Hôtel Sélect)

---

### PAGE 06 — Sélections (`/selections`)
- **Screenshot** : `frozen-snapshots/06_selections.png`
- **Titre** : "Sélections"
- **Sous-titre** : "Gestion des shortlists et décisions de recrutement"
- **4 KPI chips (GELÉS)** : 10 Total, 2 Retenus, 2 Rejetés, 1 En attente
- **8 Colonnes tableau (GELÉES)** : Candidat, Poste, Département, Date Sélection, Décideur, Statut, Note, Actions
- **10 Données gelées** : Nkoulou CAN-012, Mbarga CAN-018, Tabi CAN-025, Eyenga CAN-031, Ateba CAN-037, Fomumbod CAN-042, Kamga CAN-048, Ngo Ndobo CAN-055, Tchouante CAN-060, Moukouri CAN-066
- **Bouton** : "Nouvelle Sélection"

---

### PAGE 07 — Gestion Cabinets (`/cabinets`)
- **Screenshot** : `frozen-snapshots/07_gestion-cabinets.png`
- **Titre** : "Gestion des Cabinets"
- **Compteur** : "12 cabinets partenaires"
- **Bouton** : "Nouveau Cabinet"
- **3 KPI Cards (GELÉS)** : TOTAL CABINETS: 12, TAUX RÉUSSITE MOYEN: 27.7%, CANDIDATS FOURNIS TOTAL: 117
- **10 Colonnes tableau (GELÉES)** : N° Cabinet, Cabinet/Agence, Spécialité, Contact, Téléphone, Email, Ville, Candidats Fournis, Recrutements, Taux Réussite (%)
- **3 Filtres pie (GELÉS)** : Spécialité (2), Évaluation (2)
- **10 Données gelées** : CA-001 (HRC Cameroon) à CA-010 (Interne)

---

### PAGE 08 — Suivi Contrats (`/contrats`)
- **Screenshot** : `frozen-snapshots/08_suivi-contrats.png`
- **Titre** : "Suivi des Contrats"
- **Compteur** : "12 contrats au total"
- **Boutons** : "Exporter CSV", "Nouveau Contrat"
- **4 KPI Cards (GELÉS)** : TOTAL: 12, EN COURS: 10, ÉCHUS: 1, À RENOUVELER: 1
- **10 Colonnes tableau (GELÉES)** : N° Contrat, Employé, Poste, Département, Type Contrat, Date Début, Date Fin, Durée (mois), Salaire Brut (FCFA), Statut
- **3 Filtres pie (GELÉS)** : Département, Type Contrat, Statut
- **Données gelées** : CT-001 (Nkoulou Amina) à CT-010 (Ouedraogo Ibrahim)

---

### PAGE 09 — Intégration Employé (`/integration`)
- **Screenshot** : `frozen-snapshots/09_integration-employe.png`
- **Titre** : "Intégration Employé"
- **Compteur** : "9 intégrations"
- **Bouton** : "Nouvelle Intégration"
- **3 KPI Cards (GELÉS)** : EN COURS: 2, TERMINÉES: 7, EN RETARD: 0
- **10 Colonnes tableau (GELÉES)** : N°, Employé, Poste, Département, Date Arrivée, Manager Accueillant, Documents Admin, Formation Sécurité, Équipement Badge, Compte Informatique
- **2 Filtres pie (GELÉS)** : Département, Statut Intégration
- **9 Données gelées** : INT-001 à INT-009

---

### PAGE 10 — Checklist Intégration (`/checklist`)
- **Screenshot** : `frozen-snapshots/10_checklist-integration.png`
- **Titre** : "Checklist d'Intégration"
- **Compteur** : "11 tâches au total"
- **Boutons** : "Exporter CSV", "Nouvelle Tâche"
- **4 KPI Cards (GELÉS)** : TOTAL TÂCHES: 11, FAITES: 9, EN COURS: 1, À FAIRE: 1
- **9 Colonnes tableau (GELÉES)** : N°, Employé, Poste, Catégorie, Étape/Tâche, Responsable, Date Prévue, Date Réalisée, Statut
- **2 Filtres pie (GELÉS)** : Catégorie, Statut
- **10 Données gelées visibles** : CHK-001 à CHK-010
- **Catégories présentes** : Documents administratifs, Formation securite, Equipement & Badge, Compte informatique, Formation metier

---

### PAGE 11 — Période d'Essai (`/periode-essai`)
- **Screenshot** : `frozen-snapshots/11_periode-essai.png`
- **Titre** : "Périodes d'Essai"
- **Boutons** : "Exporter CSV", "Ajouter"
- **3 KPI Cards (GELÉS)** : Total Périodes: 10, Taux de Réussite: 71%, Note Moyenne: 14.6/20
- **11 Colonnes tableau (GELÉES)** : N°, Employé, Poste, Département, Type Contrat, Date Début Essai, Date Fin Essai, Durée (jours), Évaluateur, Note Globale (/20), Décision
- **3 Filtres pie (GELÉS)** : Décision, Département, Statut
- **10 Données gelées** : ESS-001 à ESS-010
- **Décisions présentes** : En cours, Embauche confirmee, Prolongation essai, Rupture essai

---

### PAGE 12 — Plan Accueil Formation (`/formation`)
- **Screenshot** : `frozen-snapshots/12_plan-accueil-formation.png`
- **Titre** : "Plan d'Accueil & Formations"
- **Compteur** : "12 formations au total"
- **Boutons** : "Exporter CSV", "Nouvelle Formation"
- **3 KPI Cards (GELÉS)** : TOTAL FORMATIONS: 12, HEURES TOTALES: 114h, NOTE MOYENNE: 16.5/20
- **10 Colonnes tableau (GELÉES)** : N°, Employé, Poste, Module Formation, Formateur, Date Début, Date Fin, Durée (h), Statut, Éval. /20
- **1 Filtre pie (GELÉ)** : Statut
- **10 Données gelées visibles** : FMT-001 à FMT-010
- **Statuts présents** : Terminée, En cours

---

### PAGE 13 — Suivi Post-Embauche (`/post-embauche`)
- **Screenshot** : `frozen-snapshots/13_suivi-post-embauche.png`
- **Titre** : "Suivi Post-Embauche"
- **Boutons** : "Exporter CSV", "Ajouter"
- **3 KPI Cards (GELÉS)** : Total Suivis: 9, Satisfaction Moyenne: 4.4/5, Risque Moyen: 1.1/4
- **Colonnes tableau (GELÉES)** : N°, Employé, Poste, Département, Date Embauche, Ancienneté (mois), Éval 1 mois (/20), Éval 3 mois (/20), Éval 6 mois (/20), Satisfaction
- **3 Filtres pie (GELÉS)** : Satisfaction, Risque Départ, Département
- **9 Données gelées** : SPE-001 à SPE-009
- **Satisfaction** : Satisfait, Tres satisfait

---

### PAGE 14 — Stagiaires (`/stagiaires`)
- **Screenshot** : `frozen-snapshots/14_stagiaires.png`
- **Titre** : "Stagiaires"
- **Boutons** : "Exporter CSV", "Ajouter"
- **3 KPI Cards (GELÉS)** : Total Stagiaires: 10, En Cours: 7, Indemnité Totale: 490 000 FCFA
- **Colonnes tableau (GELÉES)** : N°, Nom, Prénom, Établissement, Formation, Département Accueil, Tuteur, Date Début, Date Fin, Durée (jours)
- **3 Filtres pie (GELÉS)** : Statut, Département, Établissement
- **10 Données gelées** : STG-001 (Tchoumi Sandra) à STG-010 (Bikay Patricia)

---

### PAGE 15 — Saisonniers & Temporaires (`/saisonniers`)
- **Screenshot** : `frozen-snapshots/15_saisonniers-temporaires.png`
- **Titre** : "Saisonniers"
- **Boutons** : "Exporter CSV", "Ajouter"
- **3 KPI Cards (GELÉS)** : Total Saisonniers: 10, Coût Total: 3 956 300 FCFA, Durée Moyenne: 87 jours
- **Colonnes tableau (GELÉES)** : N°, Nom, Prénom, Poste, Département, Date Début, Date Fin, Durée (jours), Statut, Taux Horaire (FCFA), Coût Total (FCFA)
- **3 Filtres pie (GELÉS)** : Département, Statut, Motif
- **10 Données gelées** : SAI-001 (Nkoum Patrick) à SAI-010 (Tchouankou Gloire)

---

### PAGE 16 — Prévisions Postes & Offres (`/previsions`)
- **Screenshot** : `frozen-snapshots/16_previsions-postes-offres.png`
- **Titre** : "Prévisions — Postes & Offres"
- **Compteur** : "11 offres prévisionnelles"
- **Boutons** : "Exporter CSV", "Nouvelle Prévision"
- **3 KPI Cards (GELÉS)** : TOTAL POSTES PRÉVUS: 11, ÉCART TOTAL: +14, BUDGET TOTAL: 2 760 000 FCFA
- **11 Colonnes tableau (GELÉES)** : N° Offre, Département, Poste, Effectif Actuel, Effectif Prévu, Écart, Motif, Date Besoin, Priorité, Statut, Canal Diffusion
- **3 Filtres pie (GELÉS)** : Département, Priorité, Statut
- **10 Données gelées visibles** : PO-001 à PO-010

---

### PAGE 17 — Sources de Recrutement (`/sources`)
- **Screenshot** : `frozen-snapshots/17_sources-recrutement.png`
- **Titre** : "Sources de Recrutement"
- **Bouton** : "Ajouter"
- **3 KPI (GELÉS)** : Sources actives: 9/11, Total candidats: 148, Coût total: 1 510 000 FCFA
- **Layout cartes (GELÉ)** — 11 cartes, chacune contient :
  - Nom de la source, Description textuelle, Nb candidats, Coût
- **11 Sources gelées** : Site web, Référence interne, LinkedIn, Indeed, Cabinet de recrutement, École/Université, Salon professionnel, Candidature spontanée, Réseaux sociaux, Presse, Autre

---

### PAGE 18 — Analyse des Coûts (`/couts`)
- **Screenshot** : `frozen-snapshots/18_analyse-couts.png`
- **Titre** : "Analyse des Coûts de Recrutement"
- **4 KPI Cards (GELÉS)** : COÛT TOTAL: 1 295 000 FCFA, COÛT MOYEN/DEMANDE: 185 000 FCFA, COÛT MOYEN/POSTE POURVU: 647 500 FCFA, DEMANDE LA PLUS CHÈRE: Chef Cuisinier
- **Colonnes tableau (GELÉES)** : Poste, Publicité, Cabinet, Déplacement, Tests, Hébergement, Formation, Autres, Coût Total, Coût/Poste
- **7 Données gelées** : Chef Cuisinier (520K), Réceptionniste Nuit (95K), Technicien Audiovisuel (105K), Agent de Sécurité (55K), Comptable Senior (255K), Agent de Blanchisserie (80K), Développeur Full Stack (185K)
- **2 Graphiques (GELÉS)** : "Coûts par Demande (Empilés)" + "Répartition par Catégorie"

---

### PAGE 19 — Documents (`/documents`)
- **Screenshot** : `frozen-snapshots/20_documents.png`
- **Titre** : "Gestion des Documents"
- **Bouton** : "Téléverser"
- **Filtres (GELÉS)** : Tous, CV, Lettre de motivation, Contrat, Fiche de poste, Grille évaluation, Attestation, Autre
- **6 Colonnes tableau (GELÉES)** : Nom, Type, Candidat, Taille (KO), Date Upload, Uploadé par, Actions
- **5 Données gelées** : CV_Ndiaye_Moussa.pdf, LM_Ndiaye_Moussa.pdf, CV_Tchouankou_Claire.pdf, Grille_Ndiaye_Moussa.pdf, FP_Chef_Cuisinier.pdf

---

### PAGE 20 — Conformité (`/conformite`)
- **Screenshot** : `frozen-snapshots/21_conformite.png`
- **Titre** : "Conformité"
- **Sous-titre** : "Suivi de conformité des modules de l'application Admina-RH"
- **KPI principal (GELÉ)** : CONFORMITÉ GLOBALE: 77.3%, Au-dessus du seuil, Seuil de base: 45%
- **3 KPI secondaires (GELÉS)** : PAGES FONCTIONNELLES: 100% (31/31), RÉFÉRENCE DE BASE: v1.0.0, Seuil: 45%, Date: 2026-08-27
- **Tableau 31 modules (GELÉ)** : Colonnes PAGE, CHEMIN, FONCTIONNEL, CONFORMITÉ — chaque module avec son %

---

### PAGE 21 — Paramètres (`/parametres`)
- **Screenshot** : `frozen-snapshots/22_parametres.png`
- **Titre** : "Paramètres du Système"
- **Section Général (GELÉE)** : Nom entreprise: HRC Cameroon, Logo: hrc-logo.png, Devise: FCFA, Langue: Français
- **Section Recrutement (GELÉE)** : Délai par défaut: 30, Score minimum: 12, Notification email: Activé
- **Section Évaluation (GELÉE)** : Barème: /25, Nombre critères: 5, Seuil recommandation: 15

---

### PAGE 22 — Audit (`/audit`)
- **Screenshot** : `frozen-snapshots/23_audit.png`
- **Titre** : "Journal d'Audit"
- **Filtres (GELÉS)** : Action, Module, Utilisateur, Date début, Date fin
- **Colonnes tableau (GELÉES)** : Date & Heure, Utilisateur, Action, Module, Détails
- **Données gelées** : Entrées avec Mme. Fotso Marie, M. Nkoulou Paul, etc.

---

### PAGE 23 — Types de Contrats (`/types-contrats`)
- **Screenshot** : `frozen-snapshots/24_types-contrats.png`
- **Titre** : "Types de Contrats"
- **Bouton** : "Ajouter"
- **5 Colonnes tableau (GELÉES)** : Type, Description, Durée max, Rupture possible, Avantages légaux
- **7 Types gelés** : CDI, CDD, Stage, Saisonnier, Intérim, Freelance, Alternance

---

### PAGE 24 — Départements (`/departements`)
- **Screenshot** : `frozen-snapshots/25_departements.png`
- **Titre** : "Départements"
- **Bouton** : "Ajouter"
- **7 Colonnes tableau (GELÉES)** : Nom, Description, Responsable, Nb employés, Effectif cible, Progression, Localisation
- **17 Départements gelés** : Direction Générale à Achats (avec % progression)

---

### PAGE 25 — Sources & ROI (`/sources-roi`)
- **Screenshot** : `frozen-snapshots/26_sources-roi.png`
- **Titre** : "Sources de Recrutement & ROI"
- **4 KPI Cards (GELÉS)** : TOTAL CANDIDATS: 118, MEILLEURE SOURCE: Référence interne (ROI 2900.0%), TAUX CONVERSION MOYEN: 7.6%, COÛT MOYEN/EMBAUCHE: 130 000 FCFA
- **9 Colonnes tableau (GELÉES)** : Source, Nb Candidats, Nb Entretiens, Nb Embauches, Taux Conversion, Coût Total (FCFA), Coût/Candidat (FCFA), Coût/Embauche (FCFA), ROI (%)
- **6 Données gelées** : LinkedIn, Cabinet de recrutement, Site web, Référence interne, Réseaux sociaux, Candidature spontanée
- **2 Graphiques (GELÉS)** : "Candidats vs Embauches par Source" (barres groupées) + "Distribution des Sources" (donut)
- **Tableau récapitulatif (GELÉ)** : 8 indicateurs clés

---

### PAGE 26 — Expériences Candidats (`/experiences`)
- **Screenshot** : `frozen-snapshots/27_experiences.png`
- **Titre** : "Expériences des Candidats"
- **Bouton** : "Ajouter"
- **8 Colonnes tableau (GELÉES)** : Candidat, Entreprise, Poste, Date début, Date fin, Durée, Description, Vérifiée
- **Données gelées** : Ndiaye Moussa (Hôtel Sawa, Restaurant Le Nautic), Tchouankou Claire, etc.

---

### PAGE 27 — Formations Candidats (`/formations`)
- **Screenshot** : `frozen-snapshots/28_formations-candidats.png`
- **Titre** : "Formations des Candidats"
- **Bouton** : "Ajouter"
- **8 Colonnes tableau (GELÉES)** : Candidat, Établissement, Diplôme, Spécialité, Date début, Date fin, Durée
- **Données gelées** : Ndiaye Moussa (BTS Hotellerie-Restauration), Tchouankou Claire (Licence Comptabilité), etc.

---

### PAGE 28 — Compétences (`/competences`)
- **Screenshot** : `frozen-snapshots/29_competences.png`
- **Titre** : "Compétences des Candidats"
- **Bouton** : "Ajouter"
- **4 Colonnes tableau (GELÉES)** : Candidat, Compétence, Niveau, Années d'expérience
- **Données gelées** : Ndiaye Moussa (Gastronomie/Expert/8ans, Management/Avancé/5ans, HACCP/Expert/7ans), etc.

---

### PAGE 29 — Statuts (`/statuts`)
- **Screenshot** : `frozen-snapshots/30_statuts.png`
- **Titre** : "Gestion des Statuts"
- **Sous-titre** : "Référence des statuts utilisés dans le système. Cette page est en lecture seule."
- **Statuts Candidats (GELÉS)** : Nouveau (Ordre 1), En cours (Ordre 2), Retenu (Ordre 3), Non retenu (Ordre 4), En attente (Ordre 5), Recontact (Ordre 6)
- **Statuts Offres (GELÉS)** : affichés côté droit

---

## FROZEN — Composants partagés gelés

### Sidebar (`Sidebar.jsx`)
- **Logo** : "AR" + "Admina-RH"
- **Sous-titre** : "Domaine 1 — Recrutement"
- **6 Sections de menu (GELÉES)** :
  1. VUE D'ENSEMBLE : Tableau de Bord
  2. GESTION DES OFFRES : Demandes, Prévisions Postes, Sources Recrutement, Analyse des Coûts
  3. GESTION DES CANDIDATS : Base Candidats, Pipeline Candidatures, Types de Contrats, Départements
  4. PROCESSUS DE RECRUTEMENT : Planning Entretiens, Grille Évaluation, Vérification Références, Sélections, Gestion Cabinets, Suivi Contrats
  5. INTÉGRATION & SUIVI : Intégration Employé, Checklist Intégration, Période d'Essai, Plan Accueil Formation, Suivi Post-Embauche
  6. STAGIAIRES & SAISONNIERS : Stagiaires, Saisonniers & Temporaires
  7. ANALYTICS & DOCUMENTS : Documents, Conformité
  8. CONFIGURATION : Paramètres, Audit
- **Bouton** : "Réduire le menu"

### Header (`Header.jsx`)
- **Éléments (GELÉS)** : Titre de page dynamique, barre de recherche ("Rechercher..."), date du jour, bouton notifications ("3 notifications"), menu utilisateur ("RH")

### KPICard (`KPICard.jsx`)
- **Props (GELÉES)** : titre, valeur, sous-texte
- **Style (GELÉ)** : carte Material UI avec padding

---

## FROZEN — Données de référence (nomenclatures)

Les 38 listes de référence du fichier Excel sont GELÉES. Elles définissent les valeurs autorisées.

| Nomenclature | Valeurs gelées |
|---|---|
| statut_demande | En attente, Validée, En cours, Pourvue, Annulee |
| priorite | Urgente, Haute, Moyenne, Basse |
| type_contrat | CDI, CDD, Stage, Interim, Alternance, Freelance |
| type_poste | Cadre, Agent de maitrise, Operationnel, Stagiaire, Temporaire |
| motif | Remplacement, Creation de poste, Saisonnalite, Surcharge, Reorganisation |
| source | Site web entreprise, Presse, Cooptation, Reseaux sociaux, Candidature spontanee, Ecole/Universite, Cabinet de recrutement, Salon emploi, Autre |
| statut_candidat | Nouveau, En cours d'etude, Entretien planifie, Entretien realise, Retenu, Refuse, En reserve, Desiste |
| statut_entretien | Planifie, Realise, Annule, Reporte |
| type_entretien | Telephonique, Visioconference, Presentiel, Technique, 2eme tour, Final |
| resultat_entretien | Favorable, Defavorable, A revoir, En attente |
| elements_verif | Diplome, Experience, Comportement, Salaire declare, Causes de depart |
| resultat_verif | Favorable, Defavorable, Partiel, N'a pas repondu, Non verifiable |
| decision_finale | Embauche recommandee, Embauche avec reserve, Refus, En attente decision |
| oui_non | Oui, Non |
| civilite | M., Mme, Mlle |
| niveau_etude | Sans diplome, CAP/BEP, BTS/DUT, Licence, Master, Doctorat, Autre |
| niveau_langue | Aucun, Debutant, Intermediaire, Avance, Bilingue, Natif |
| genre | Masculin, Feminin |
| situation_fam | Celibataire, Marie(e), Divorce(e), Veuf(ve) |
| departement | Direction Generale, Ressources Humaines, Finance & Comptabilite, Marketing & Communication, Informatique, Commercial, Logistique & Approvisionnement, Production, Service Client, Juridique, Administration, Securite, Restauration, Herbergement, Maintenance, Lingerie, Audiovisuel |
| role_responsable | Directeur General, Directeur Adjoint, DRH, DRH Adjoint, Chef de Departement, Chef de Service, Responsable de Pole, Superviseur, Manager Operationnel |
| cabinet_recrutement | HRC Cameroon, Activa RH, Skillmatch Africa, Michael Page Cameroon, Pedarec, AfricSearch, Manpower Cameroon, Interne (sans cabinet), Autre |
| statut_contrat | En cours, Renouvele, Echu, Resilie, En negociation |
| motif_fin_contrat | Fin de contrat, Demission, Licenciement, Depart retraite, Mutation, Force majeure |
| specialite_cabinet | Generaliste, Cadres dirigeants, Informatique, Finance, Hotellerie & Tourisme, Commerce, BTP, Logistique |
| evaluation_cabinet | Excellent, Bon, Moyen, Insuffisant, A evaluer |
| canal_diffusion | Site web, LinkedIn, Facebook, Presse ecrite, Radio, Salon emploi, Cabinet, Cooptation, Universites, Affichage |
| statut_offre | A creer, Publiee, Candidatures en cours, Cloturee, Annulee |
| categorie_checklist | Documents administratifs, Formation securite, Formation metier, Equipement & Badge, Presentation equipes, Visite locaux, Compte informatique, Repas & avantages |
| statut_checklist | A faire, En cours, Fait, Non applicable |
| decision_essai | Embauche confirmee, Prolongation essai, Rupture essai, En cours |
| statut_integration | En cours, Terminee, Echec, Prolongee |
| statut_formation | Planifiee, En cours, Terminee, Annulee |
| statut_stagiaire | En cours, Termine, Abandonne, Embauche |
| satisfaction | Tres satisfait, Satisfait, Neutre, Insatisfait, Tres insatisfait |
| risque_depart | Faible, Moyen, Eleve, Critique |
| stade_pipeline | CV recu, Pre-selection, Entretien HR, Test technique, Entretien final, Offre envoyee, Accepte, Refuse, Retraite |
| priorite_pipeline | Haute, Moyenne, Basse |

---

## DEV — Pages à construire (2 pages)

### PAGE A — Demandes de Recrutement (`/offres`) — ❌ ACTUELLEMENT 🚧
**Feuille Excel référence** : `1-Demandes Recrutement` (19 champs)
**Champs OBLIGATOIRES à implémenter** :
1. N° Demande (auto-généré : DR-YYYY-NNN)
2. Date Demande
3. Departement / Service (dropdown → nomenclature `departement`)
4. Poste Recherche
5. Type de Poste (dropdown → `type_poste`)
6. Type de Contrat (dropdown → `type_contrat`)
7. Effectif Demande
8. Motif du Recrutement (dropdown → `motif`)
9. Date Besoin
10. Priorite (dropdown → `priorite`)
11. Statut (dropdown → `statut_demande`)
12. Date Pourvue
13. Responsable Demande
14. Role du Responsable (dropdown → `role_responsable`)
15. Cabinet / Agence Externe (dropdown → `cabinet_recrutement`)
16. Budget Salaire (FCFA)
17. Cout Recrutement (FCFA)
18. Delai (jours)
19. Notes

**UI attendue** : Tableau avec filtres (comme les autres pages) + Bouton "Nouvelle Demande" + KPI cards

### PAGE B — Base Candidats (`/candidats`) — ❌ ACTUELLEMENT 🚧
**Feuille Excel référence** : `2-Base Candidats` (35 champs)
**Champs OBLIGATOIRES à implémenter** :
1. N° Candidat (auto : CAN-NNN)
2. Civilite (dropdown → `civilite`)
3. Nom
4. Prenom
5. Genre (dropdown → `genre`)
6. Date de Naissance
7. Nationalite
8. Situation Familiale (dropdown → `situation_fam`)
9. Telephone
10. Email
11. Adresse
12. Ville
13. Niveau Etude (dropdown → `niveau_etude`)
14. Diplome
15. Etablissement
16. Annees Exp.
17. Dernier Employeur
18. Competences Cles
19. Langues
20. Niveau Langue (dropdown → `niveau_langue`)
21. Outils/Logiciels
22. Poste Vise
23. Source Candidature (dropdown → `source`)
24. Date Candidature
25. Statut (dropdown → `statut_candidat`)
26. Score (/20)
27. Type Contrat (dropdown → `type_contrat`)
28. Contrat Telechargeable
29. Date Debut Essai
30. Date Fin Essai
31. Date Embauche Definitive
32. Certificat Travail
33. Attestation CNPS
34. Extrait Casier Judiciaire
35. Notes

**UI attendue** : Vue tableau + Vue fiche détaillée (onglets) + Lien vers sous-pages Expériences/Formations/Compétences

---

## DEV — Champs manquants à ajouter sur les pages gelées

> **RÈGLE** : Ajouter les colonnes manquantes **À DROITE** des colonnes existantes.
> Ne PAS déplacer ou renommer les colonnes gelées.

| Page | Champs manquants à AJOUTER (à droite) |
|---|---|
| Entretiens | N° Entretien, Poste Visé, Score (/20), Prochaine Étape, Date Prochaine Étape, Notes |
| Évaluations | N° Évaluation, Poste Visé, Salaire Souhaité (FCFA), Salaire Proposé (FCFA), Source Candidature, Statut Candidat |
| Vérifications | N° Verif., Poste Visé, Éléments Vérifiés (sélection multiple), Résultat Global (dropdown), Détails/Retour, Suites Données, Décision Finale, Date Décision |
| Sélections | N° Sélection (ajouter), Notes |
| Cabinets | Cout Total (FCFA), Évaluation (dropdown → `evaluation_cabinet`), Contrat en Cours (oui/non), Date Début Contrat, Date Fin Contrat, Notes |
| Prévisions | Budget (FCFA), Profil Recherche, Date Publication, Candidatures Recues, Notes |
| Sources | Ajouter vue tableau avec : N°, Nb Entretiens, Nb Recrutements, Taux Transformation, Cout/Recrutement, Delai Moyen, Qualite Moyenne (/20), Notes |
| Coûts | N°, Demande Liée, Date, Département, Notes |
| Intégration | Formation Metier, Visite Locaux, Statut Integration (dropdown → `statut_integration`), Date Fin Integration, Notes |
| Checklist | Commentaires, Département, Date Arrivée |
| Période Essai | Objectifs Fixes, Score Mi-parcours (/20), Score Final (/20) [séparer la note unique], Date Décision, Notes |
| Formation | Notes, Département, Date Arrivée |
| Stagiaires | Indemnite (FCFA/mois), Statut (colonne), Évaluation (/20), Notes |
| Saisonniers | Motif (colonne), Source (colonne), Notes |
| Post-Embauche | Risque Départ (par ligne), Commentaires |
| Pipeline | N° Pipeline, Département, Date Mouvement, Délai (jours), Évaluateur, Prochaine Action, Notes |

---

## Workflow obligatoire

### Avant toute modification de code :
1. **Lire ce fichier** (`AI_GUIDE.md`) en entier
2. **Vérifier le screenshot** concerné dans `frozen-snapshots/`
3. **Confirmer** que la modification cible est dans la section `[DEV]` et NON dans `[FROZEN]`

### Pendant le développement :
4. **NE JAMAIS** ouvrir ou modifier un fichier listé comme `[FROZEN]` dans l'arborescence
5. **SEULEMENT** créer de nouveaux fichiers ou modifier des fichiers listés `[DEV]`
6. **AJOUTER** les nouvelles colonnes/champs à DROITE des existantes
7. **CONSERVER** exactement le même nommage, style et structure pour les éléments gelés

### Après le développement :
8. **COMPARER** visuellement le résultat avec le screenshot de référence
9. **VÉRIFIER** qu'aucun élément gelé n'a changé
10. **Tester** que les nouvelles fonctionnalités ne cassent pas les existantes

---

## Vérification avant chaque modification

```
Checklist de sécurité :

□ AI_GUIDE.md a été lu en entier ?
□ Screenshot de référence consulté ?
□ La cible est dans [DEV] (pas dans [FROZEN]) ?
□ Aucun fichier [FROZEN] ne sera modifié ?
□ Les colonnes existantes ne seront pas déplacées/renommées ?
□ Les données d'exemple ne seront pas modifiées ?
□ Le style MUI existant est conservé ?
□ La sidebar et le header restent identiques ?
□ Les nomenclatures (38 listes) ne sont pas modifiées ?
□ Le routage existant (/entretiens, /contrats, etc.) fonctionne toujours ?
```

---

## Historique du gel

| Date | Action | Auteur |
|---|---|---|
| 29/08/2026 | GEL v1.0 — 28 pages capturées, 144/279 champs gelés | Super Z |

---

> **PROCHAINE ÉTAPE** : Une fois les 2 pages manquantes (Demandes + Base Candidats) construites et les champs manquants ajoutés, ce fichier sera mis à jour pour passer les nouveaux éléments de [DEV] à [FROZEN]. Le dégel complet interviendra à 100% de couverture front-end.