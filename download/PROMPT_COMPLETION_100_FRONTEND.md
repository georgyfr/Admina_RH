# PROMPT — Complétion Frontend Admina-RH à 100%

> **Objectif** : Atteindre 100% de couverture front-end du fichier Excel `Domaine1_Recrutement_Candidats.xlsx`
> **Contexte** : 57% déjà gelé (144/279 champs). Ce prompt cible les 43% restants.
> **Contrainte absolue** : Respecter strictement le fichier `AI_GUIDE.md` présent dans ce répertoire.

---

## INSTRUCTIONS PRÉALABLES

1. **Lis intégralement** le fichier `AI_GUIDE.md` situé dans ce même répertoire (`Domaine1_Recrutement_Candidats/AI_GUIDE.md`). Il contient la cartographie complète de ce qui est gelé (FROZEN) et ce qui est à construire (DEV).
2. **Consulte les screenshots** dans `frozen-snapshots/` pour voir l'état visuel exact de chaque page gelée.
3. **N'ouvre et ne modifie JAMAIS** un fichier ou composant marqué [FROZEN] dans AI_GUIDE.md.
4. **Seuls les fichiers suivants** peuvent être créés ou modifiés :
   - `src/pages/Demandes.jsx` (nouveau — page à construire)
   - `src/pages/Candidats.jsx` (nouveau — page à construire)
   - Les fichiers de données/nomenclatures si nécessaire pour les nouvelles pages
   - `src/App.jsx` **UNIQUEMENT** pour ajouter les routes `/offres` et `/candidats` (ne pas modifier les routes existantes)

---

## MISSION

Tu dois accomplir **3 tâches** dans l'ordre :

### TÂCHE 1 — Construire la page Demandes (`/offres`)
### TÂCHE 2 — Construire la page Base Candidats (`/candidats`)
### TÂCHE 3 — Ajouter les champs manquants sur les 16 pages existantes

---

## TÂCHE 1 — Page Demandes de Recrutement (`/offres`)

**Feuille Excel référence** : `1-Demandes Recrutement`
**Route** : `/offres`
**Fichier** : `src/pages/Demandes.jsx` (à créer)

### Spécification des 19 champs OBLIGATOIRES

| # | Champ | Type | Nomenclature/Format | Obligatoire |
|---|---|---|---|---|
| 1 | N° Demande | Auto-généré | Format : `DR-YYYY-NNN` (ex: DR-2025-001) | Auto |
| 2 | Date Demande | Date picker | `JJ/MM/AAAA` | Oui |
| 3 | Département / Service | Dropdown | Voir nomenclature `departement` | Oui |
| 4 | Poste Recherché | Texte libre | — | Oui |
| 5 | Type de Poste | Dropdown | Voir nomenclature `type_poste` | Oui |
| 6 | Type de Contrat | Dropdown | Voir nomenclature `type_contrat` | Oui |
| 7 | Effectif Demandé | Nombre entier | — | Oui |
| 8 | Motif du Recrutement | Dropdown | Voir nomenclature `motif` | Oui |
| 9 | Date Besoin | Date picker | `JJ/MM/AAAA` | Oui |
| 10 | Priorité | Dropdown | Voir nomenclature `priorite` | Oui |
| 11 | Statut | Dropdown | Voir nomenclature `statut_demande` | Oui |
| 12 | Date Pourvue | Date picker | `JJ/MM/AAAA` | Non |
| 13 | Responsable Demande | Texte libre | — | Oui |
| 14 | Rôle du Responsable | Dropdown | Voir nomenclature `role_responsable` | Oui |
| 15 | Cabinet / Agence Externe | Dropdown | Voir nomenclature `cabinet_recrutement` | Non |
| 16 | Budget Salaire (FCFA) | Nombre | Format : `000 000 FCFA` | Oui |
| 17 | Coût Recrutement (FCFA) | Nombre | Format : `000 000 FCFA` | Non |
| 18 | Délai (jours) | Nombre entier | — | Non |
| 19 | Notes | Texte longue | Multiligne | Non |

### UI attendue (respecter le pattern des pages gelées)

```
┌─────────────────────────────────────────────────────┐
│ Header : "Demandes"                                 │
│ Sous-titre : "Gestion des demandes de recrutement"   │
│ Compteur : "X demande(s)"                          │
│ [Nouvelle Demande]                                   │
├─────────────────────────────────────────────────────┤
│ KPI Cards (ligne de 4) :                             │
│ [TOTAL] [EN ATTENTE] [VALIDÉES] [POURVUES]          │
├─────────────────────────────────────────────────────┤
│ Filtres :                                            │
│ [Département ▼] [Priorité ▼] [Statut ▼]             │
├─────────────────────────────────────────────────────┤
│ Tableau avec colonnes :                              │
│ N° | Date | Département | Poste | Type Poste |       │
│ Type Contrat | Effectif | Motif | Date Besoin |      │
│ Priorité | Statut | Date Pourvue | Responsable |      │
│ Rôle | Cabinet | Budget (FCFA) | Coût (FCFA) |      │
│ Délai (j) | Notes | [Actions]                       │
├─────────────────────────────────────────────────────┤
│ Pagination : Rows per page: 10                      │
└─────────────────────────────────────────────────────┘
```

### Données d'exemple à injecter (mock data)

| N° | Date | Département | Poste | Type Poste | Type Contrat | Effectif | Motif | Date Besoin | Priorité | Statut | Responsable | Rôle | Cabinet | Budget | Coût | Délai | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DR-2025-001 | 15/01/2025 | Hôtellerie | Réceptionniste Nuit | Operationnel | CDI | 1 | Remplacement | 01/02/2025 | Haute | Pourvue | Mme. Ngassa Aline | Chef de Service | — | 200 000 | 95 000 | 17 | Remplacement urgent suite départ | 
| DR-2025-002 | 20/01/2025 | Sécurité | Agent de Sécurité | Operationnel | CDI | 3 | Création de poste | 15/02/2025 | Haute | Validée | M. Tabe Arnaud | Chef de Service | — | 450 000 | 55 000 | 26 | Renforcement sécurité nuit | 
| DR-2025-003 | 01/02/2025 | Audiovisuel | Technicien Audiovisuel | Agent de maitrise | CDD | 1 | Remplacement | 01/03/2025 | Moyenne | En attente | M. Mbarga Jean | Responsable de Pole | — | 220 000 | 105 000 | 28 | — | 
| DR-2025-004 | 01/02/2025 | Restauration | Chef Cuisinier | Cadre | CDI | 1 | Surcharge | 01/03/2025 | Urgente | Publiée | M. Nkoulou Paul | Chef de Departement | HRC Cameroon | 450 000 | 520 000 | 10 | Candidat identifié via cabinet | 
| DR-2025-005 | 10/02/2025 | Finance & Comptabilité | Comptable Senior | Cadre | CDI | 1 | Création de poste | 01/04/2025 | Haute | Pourvue | Mme. Ngassa Aline | Chef de Departement | — | 550 000 | 255 000 | 45 | — | 
| DR-2025-006 | 01/03/2025 | Commercial & Marketing | Stagiaire Marketing | Stagiaire | Stage | 1 | Saisonnalite | 01/04/2025 | Basse | En cours | M. Kamga Serge | Chef de Service | — | 0 | 15 000 | 30 | — | 
| DR-2025-007 | 15/02/2025 | IT & Systèmes | Développeur Full Stack | Cadre | CDI | 1 | Création de poste | 01/04/2025 | Haute | Publiée | M. Fotu Kevin | Chef de Departement | Skillmatch Africa | 380 000 | 185 000 | 35 | Stack React/Node.js requis | 
| DR-2025-008 | 15/03/2025 | IT & Systèmes | Développeur Full Stack | Cadre | CDI | 1 | Surcharge | 15/04/2025 | Haute | Publiée | M. Fotu Kevin | Chef de Departement | — | 380 000 | 0 | 30 | Deuxième poste identique | 

---

## TÂCHE 2 — Page Base Candidats (`/candidats`)

**Feuille Excel référence** : `2-Base Candidats`
**Route** : `/candidats`
**Fichier** : `src/pages/Candidats.jsx` (à créer)

### Spécification des 35 champs OBLIGATOIRES

| # | Champ | Type | Nomenclature/Format | Obligatoire |
|---|---|---|---|---|
| 1 | N° Candidat | Auto-généré | Format : `CAN-NNN` (ex: CAN-001) | Auto |
| 2 | Civilité | Dropdown | `civilite` : M., Mme, Mlle | Oui |
| 3 | Nom | Texte | — | Oui |
| 4 | Prénom | Texte | — | Oui |
| 5 | Genre | Dropdown | `genre` : Masculin, Féminin | Oui |
| 6 | Date de Naissance | Date picker | `JJ/MM/AAAA` | Oui |
| 7 | Nationalité | Texte | — | Oui |
| 8 | Situation Familiale | Dropdown | `situation_fam` | Oui |
| 9 | Téléphone | Texte | Format téléphone | Oui |
| 10 | Email | Texte | Format email | Oui |
| 11 | Adresse | Texte longue | — | Non |
| 12 | Ville | Texte | — | Oui |
| 13 | Niveau Étude | Dropdown | `niveau_etude` | Oui |
| 14 | Diplôme | Texte | — | Oui |
| 15 | Établissement | Texte | — | Oui |
| 16 | Années Exp. | Nombre | Entier | Oui |
| 17 | Dernier Employeur | Texte | — | Non |
| 18 | Compétences Clés | Texte | Tags séparés par virgule | Oui |
| 19 | Langues | Texte | — | Non |
| 20 | Niveau Langue | Dropdown | `niveau_langue` | Non |
| 21 | Outils/Logiciels | Texte | Tags séparés par virgule | Non |
| 22 | Poste Visé | Texte | — | Oui |
| 23 | Source Candidature | Dropdown | `source` | Oui |
| 24 | Date Candidature | Date picker | `JJ/MM/AAAA` | Oui |
| 25 | Statut | Dropdown | `statut_candidat` | Oui |
| 26 | Score (/20) | Nombre | 0–20 | Non |
| 27 | Type Contrat | Dropdown | `type_contrat` | Non |
| 28 | Contrat Téléchargeable | Fichier upload | PDF uniquement | Non |
| 29 | Date Début Essai | Date picker | `JJ/MM/AAAA` | Non |
| 30 | Date Fin Essai | Date picker | `JJ/MM/AAAA` | Non |
| 31 | Date Embauche Définitive | Date picker | `JJ/MM/AAAA` | Non |
| 32 | Certificat Travail | Fichier upload | — | Non |
| 33 | Attestation CNPS | Fichier upload | — | Non |
| 34 | Extrait Casier Judiciaire | Fichier upload | — | Non |
| 35 | Notes | Texte longue | Multiligne | Non |

### UI attendue — Vue tableau (vue par défaut)

```
┌─────────────────────────────────────────────────────┐
│ Header : "Base Candidats"                           │
│ Sous-titre : "Base de données complète des candidats" │
│ Compteur : "X candidat(s)"                         │
│ [Nouveau Candidat]                                   │
├─────────────────────────────────────────────────────┤
│ KPI Cards (ligne de 4) :                             │
│ [TOTAL] [ACTIFS] [RETENUS] [EN ÉTUDE]               │
├─────────────────────────────────────────────────────┤
│ Filtres :                                            │
│ [Statut ▼] [Source ▼] [Département ▼] [Rechercher]  │
├─────────────────────────────────────────────────────┤
│ Tableau (colonnes principales) :                     │
│ N° | Civ. | Nom | Prénom | Téléphone | Email |     │
│ Poste Visé | Source | Date | Statut | Score |         │
│ [Actions : Voir détails]                              │
├─────────────────────────────────────────────────────┤
│ Pagination : Rows per page: 10                      │
└─────────────────────────────────────────────────────┘
```

### UI attendue — Vue fiche détaillée (mode dialog/drawer)

Quand on clique sur "Voir détails" d'un candidat, ouvrir un **dialog plein écran** avec **4 onglets** :

**Onglet 1 : Identité & Coordonnées**
- Civilité, Nom, Prénom, Genre, Date de Naissance, Nationalité, Situation Familiale
- Téléphone, Email, Adresse, Ville

**Onglet 2 : Formation & Expérience**
- Niveau Étude, Diplôme, Établissement, Années Exp., Dernier Employeur
- Compétences Clés (tags), Langues, Niveau Langue, Outils/Logiciels

**Onglet 3 : Candidature**
- Poste Visé, Source Candidature, Date Candidature, Statut, Score (/20)
- Type Contrat

**Onglet 4 : Documents & Suivi**
- Contrat Téléchargeable (upload zone)
- Certificat Travail, Attestation CNPS, Extrait Casier Judiciaire
- Date Début Essai, Date Fin Essai, Date Embauche Définitive
- Notes

### Données d'exemple à injecter (mock data)

| N° | Civ. | Nom | Prénom | Genre | Naissance | Nat. | Sit. Fam. | Tél. | Email | Ville | Niv. Étude | Diplôme | Étab. | Ans Exp. | Dernier Emp. | Compétences | Langues | Niv. Lang. | Outils | Poste Visé | Source | Date Cand. | Statut | Score | Type Contrat |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CAN-001 | M. | Ndiaye | Moussa | Masculin | 15/03/1988 | Sénégalaise | Marie(e) | +221 77 123 45 67 | moussa.ndiaye@email.com | Douala | BTS | BTS Hotellerie-Restauration | Lycée Technique Douala | 8 | Hôtel Sawa | Gastronomie, Management, HACCP | Français, Wolof | Bilingue | Sage, Office | Chef Cuisinier | Cabinet de recrutement | 05/01/2025 | Retenu | 19 | CDI |
| CAN-002 | Mme | Tchouankou | Claire | Féminin | 22/06/1992 | Camerounaise | Celibataire | +237 6 99 876 54 32 | claire.tchouankou@email.com | Yaoundé | Master | Licence Comptabilité | Univ. Yaoundé II | 4 | Cabinet Fiducial | Sage Saari, Fiscalité | Français, Anglais | Avance | Excel, Sage | Comptable Senior | Site web entreprise | 20/11/2024 | Retenu | 18 | CDI |
| CAN-003 | M. | Kamga | Hervé | Masculin | 10/09/1995 | Camerounaise | Celibataire | +237 6 77 555 44 33 | herve.kamga@email.com | Douala | Licence | BTS Informatique | ISTIC | 4 | MTN Cameroun | React, Node.js, TypeScript | Français, Anglais | Avance | VS Code, Git, Docker | Développeur Full Stack | LinkedIn | 12/02/2025 | En cours d'étude | — | — |
| CAN-004 | M. | Mebara | Patrick | Masculin | 05/01/1994 | Camerounaise | Marie(e) | +237 6 96 444 33 22 | patrick.mebara@email.com | Douala | BTS | BTS Audiovisuel | Lycée Technique Douala | 6 | CRTV | Éclairage, Son, Montage | Français | Bilingue | Adobe Premiere, Final Cut | Technicien Audiovisuel | Réseaux sociaux | 08/02/2025 | Entretien planifie | — | — |
| CAN-005 | M. | Nganou | Serge | Masculin | 18/04/1997 | Camerounaise | Celibataire | +237 6 55 333 22 11 | serge.nganou@email.com | Douala | Licence | Licence Hotellerie | Univ. Douala | 2 | — | Service client, Anglais | Français, Anglais | Intermediaire | Opera, Word | Réceptionniste Nuit | LinkedIn | 05/02/2025 | Entretien realise | 14 | — |
| CAN-006 | M. | Nkoulou | Brandon | Masculin | 12/12/1996 | Camerounaise | Celibataire | +237 6 77 222 11 00 | brandon.nkoulou@email.com | Yaoundé | Master | Master Informatique | ENSP Yaoundé | 3 | MTN Cameroun | Java, Spring, Angular | Français, Anglais | Avance | IntelliJ, Git, Jenkins | Développeur Full Stack | LinkedIn | 18/02/2025 | Entretien realise | 12 | — |
| CAN-007 | Mme | Eyenga | Sophie | Féminin | 25/08/1993 | Camerounaise | Marie(e) | +237 6 98 111 22 33 | sophie.eyenga@email.com | Douala | Licence | Licence Droit | Univ. Douala | 5 | Hotel Le Phare | Droit travail, RH | Français | Natif | Word, Excel | Agent de Sécurité | Candidature spontanée | 10/02/2025 | Nouveau | — | — |
| CAN-008 | Mme | Bikay | Joséphine | Féminin | 03/05/1998 | Camerounaise | Celibataire | +237 6 77 999 88 77 | josephine.bikay@email.com | Douala | BTS | BTS Hotellerie | ISTAG | 0 | — | Service client | Français | Natif | — | Stagiaire Marketing | École/Université | 08/02/2025 | Nouveau | — | — |
| CAN-009 | M. | Tabe | Arnaud | Masculin | 20/11/1990 | Camerounaise | Marie(e) | +237 6 99 444 55 66 | arnaud.tabe@email.com | Douala | Licence | Licence Securité | Univ. Douala | 7 | Hôtel Sélect | Securité incendie, surveillance | Français | Natif | — | Agent de Sécurité | Référence interne | 15/02/2025 | Retenu | 15 | CDI |
| CAN-010 | M. | Fotso | René | Masculin | 08/06/1991 | Camerounaise | Marie(e) | +237 6 77 666 55 44 | rene.fotso@email.com | Douala | CAP/BEP | CAP Agent securite | Lycée de Douala | 5 | Hotel Le Phare | Surveillance, contrôle accès | Français | Natif | — | Agent de Sécurité | Référence interne | 20/02/2025 | Retenu | 16 | CDI |

---

## TÂCHE 3 — Ajouter les champs manquants sur les 16 pages existantes

> **RÈGLE ABSOLUE** : Les nouveaux champs doivent être ajoutés **À DROITE** des colonnes existantes.
> **NE PAS** déplacer, renommer ou supprimer aucune colonne existante.
> **NE PAS** modifier les données mock existantes.
> Chaque page doit rester visuellement identique à son screenshot dans `frozen-snapshots/`,
> avec les nouvelles colonnes ajoutées à droite.

### 3.1 — Planning Entretiens (`/entretiens`) — Ajouter 6 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| N° Entretien | Texte auto | Format : `ENT-NNN` | 1ère colonne (avant Candidat) |
| Poste Visé | Texte | — | Après Candidat |
| Score (/20) | Nombre | 0–20 | Après Résultat |
| Prochaine Étape | Dropdown | Texte libre ou : "2ème tour", "Test technique", "Vérification références", "Proposition", "Refus" | Après Score |
| Date Prochaine Étape | Date picker | — | Après Prochaine Étape |
| Notes | Texte | Multiligne | Dernière colonne avant Actions |

### 3.2 — Grille Évaluation (`/evaluations`) — Ajouter 6 champs

| Champ à ajouter | Type | Emplacement |
|---|---|---|
| N° Évaluation | Texte auto | Format : `EVAL-NNN`, en haut de chaque carte |
| Poste Visé | Texte | Sous le nom du candidat dans chaque carte |
| Salaire Souhaité (FCFA) | Nombre | Nouvelle section dans la carte, avant Commentaire |
| Salaire Proposé (FCFA) | Nombre | À côté du salaire souhaité |
| Source Candidature | Texte | Dans l'en-tête de la carte |
| Statut Candidat | Chip/Badge | Dans l'en-tête de la carte |

### 3.3 — Vérification Références (`/verifications`) — Ajouter 8 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| N° Vérification | Texte auto | `VERIF-NNN` | 1ère colonne |
| Poste Visé | Texte | — | Après Candidat |
| Éléments Vérifiés | Multi-select/chips | `elements_verif` | Nouveau groupe après Contact |
| Résultat Global | Dropdown | `resultat_verif` | Après Éléments Vérifiés |
| Détails / Retour | Texte longue | — | Après Résultat Global |
| Suites Données | Texte | — | Après Détails |
| Décision Finale | Dropdown | `decision_finale` | Après Suites Données |
| Date Décision | Date picker | — | Dernière colonne avant Actions |

### 3.4 — Gestion Cabinets (`/cabinets`) — Ajouter 6 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| Coût Total (FCFA) | Nombre | — | Après Taux Réussite |
| Évaluation | Dropdown | `evaluation_cabinet` | Après Coût Total |
| Contrat en Cours | Dropdown | `oui_non` | Après Évaluation |
| Date Début Contrat | Date picker | — | Après Contrat en Cours |
| Date Fin Contrat | Date picker | — | Après Date Début Contrat |
| Notes | Texte | Multiligne | Dernière colonne avant Actions |

### 3.5 — Prévisions Postes (`/previsions`) — Ajouter 5 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| Budget (FCFA) | Nombre | Après Canal Diffusion |
| Profil Recherche | Texte longue | Après Budget |
| Date Publication | Date picker | Après Profil Recherche |
| Candidatures Reçues | Nombre entier | Après Date Publication |
| Notes | Texte | Dernière colonne avant Actions |

### 3.6 — Sources de Recrutement (`/sources`) — Ajouter vue tableau

Ajouter un **bouton toggle** "Vue tableau" / "Vue cartes" (les cartes existantes restent gelées).

En vue tableau, afficher ces colonnes :

| Champ | Type | Nomenclature |
|---|---|---|
| N° | Auto | — |
| Source | Texte | — |
| Nb Candidats | Nombre | — |
| Nb Entretiens | Nombre | — |
| Nb Recrutements | Nombre | — |
| Taux Transformation (%) | Calculé | — |
| Coût (FCFA) | Nombre | — |
| Coût/Recrutement (FCFA) | Calculé | — |
| Délai Moyen (jours) | Nombre | — |
| Qualité Moyenne (/20) | Nombre | — |
| Notes | Texte | — |

### 3.7 — Analyse des Coûts (`/couts`) — Ajouter 5 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| N° | Texte auto | 1ère colonne, format `COUT-NNN` |
| Demande Liée | Texte | Après Poste (ex: "DR-2025-004") |
| Date | Date picker | Après Demande Liée |
| Département | Texte | Après Date |
| Notes | Texte | Dernière colonne |

### 3.8 — Intégration Employé (`/integration`) — Ajouter 5 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| Formation Métier | Chip (oui/non) | — | Après Formation Sécurité |
| Visite Locaux | Chip (oui/non) | — | Après Formation Métier |
| Statut Intégration | Dropdown | `statut_integration` | Après Visite Locaux |
| Date Fin Intégration | Date picker | — | Après Statut |
| Notes | Texte | Dernière colonne |

### 3.9 — Checklist Intégration (`/checklist`) — Ajouter 3 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| Commentaires | Texte | Avant dernière colonne |
| Département | Texte | Avant-dernière colonne |
| Date Arrivée | Date picker | Avant-dernière colonne |

### 3.10 — Période d'Essai (`/periode-essai`) — Ajouter 5 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| Objectifs Fixés | Texte longue | Après Évaluateur |
| Score Mi-parcours (/20) | Nombre | Après Objectifs |
| Score Final (/20) | Nombre | Après Score Mi-parcours |
| Date Décision | Date picker | Après Décision |
| Notes | Texte | Dernière colonne |

**Note** : La colonne "Note Globale (/20)" existante doit être renommée en "Score Mi-parcours (/20)" et une nouvelle colonne "Score Final (/20)" ajoutée à côté. Le score existant devient le score mi-parcours. Si la valeur est « — » ou « En cours », laisser tel quel.

### 3.11 — Plan Accueil Formation (`/formation`) — Ajouter 3 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| Notes | Texte | Dernière colonne |
| Département | Texte | Après Poste |
| Date Arrivée | Date picker | Après Département |

### 3.12 — Stagiaires (`/stagiaires`) — Ajouter 4 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| Indemnité (FCFA/mois) | Nombre | — | Après Durée |
| Statut | Chip | `statut_stagiaire` | Après Indemnité |
| Évaluation (/20) | Nombre | — | Après Statut |
| Notes | Texte | Dernière colonne |

### 3.13 — Saisonniers & Temporaires (`/saisonniers`) — Ajouter 3 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| Motif | Texte | Avant-dernière colonne |
| Source | Texte | Avant-dernière colonne |
| Notes | Texte | Dernière colonne |

### 3.14 — Suivi Post-Embauche (`/post-embauche`) — Ajouter 2 champs

| Champ à ajouter | Type | Nomenclature | Position |
|---|---|---|---|
| Risque Départ | Chip | `risque_depart` | Après Satisfaction |
| Commentaires | Texte | Dernière colonne |

### 3.15 — Pipeline Candidatures (`/pipeline`) — Ajouter 7 champs

Ajouter les champs suivants à **chaque carte** du kanban :

| Champ à ajouter | Type | Emplacement dans la carte |
|---|---|---|
| N° Pipeline | Texte auto | `PIPE-NNN`, en haut de la carte |
| Département | Chip | Sous le Poste |
| Date Mouvement | Date | Sous la date de candidature |
| Délai (jours) | Nombre calculé | Sous Date Mouvement |
| Évaluateur | Texte | Nouvelle ligne dans la carte |
| Prochaine Action | Texte | Nouvelle ligne dans la carte |
| Notes | Texte | Nouvelle ligne dans la carte |

### 3.16 — Sélections (`/selections`) — Ajouter 2 champs

| Champ à ajouter | Type | Position |
|---|---|---|
| N° Sélection | Texte auto | 1ère colonne, format `SEL-NNN` |
| Notes | Texte | Dernière colonne |

---

## NOMENCLATURES COMPLÈTES (38 listes)

Copier-coller ces valeurs exactes dans les dropdowns correspondants :

```
statut_demande: En attente, Validée, En cours, Pourvue, Annulee
priorite: Urgente, Haute, Moyenne, Basse
type_contrat: CDI, CDD, Stage, Interim, Alternance, Freelance
type_poste: Cadre, Agent de maitrise, Operationnel, Stagiaire, Temporaire
motif: Remplacement, Creation de poste, Saisonnalite, Surcharge, Reorganisation
source: Site web entreprise, Presse, Cooptation, Reseaux sociaux, Candidature spontanee, Ecole/Universite, Cabinet de recrutement, Salon emploi, Autre
statut_candidat: Nouveau, En cours d'etude, Entretien planifie, Entretien realise, Retenu, Refuse, En reserve, Desiste
statut_entretien: Planifie, Realise, Annule, Reporte
type_entretien: Telephonique, Visioconference, Presentiel, Technique, 2eme tour, Final
resultat_entretien: Favorable, Defavorable, A revoir, En attente
elements_verif: Diplome, Experience, Comportement, Salaire declare, Causes de depart
resultat_verif: Favorable, Defavorable, Partiel, N'a pas repondu, Non verifiable
decision_finale: Embauche recommandee, Embauche avec reserve, Refus, En attente decision
oui_non: Oui, Non
civilite: M., Mme, Mlle
niveau_etude: Sans diplome, CAP/BEP, BTS/DUT, Licence, Master, Doctorat, Autre
niveau_langue: Aucun, Debutant, Intermediaire, Avance, Bilingue, Natif
genre: Masculin, Feminin
situation_fam: Celibataire, Marie(e), Divorce(e), Veuf(ve)
departement: Direction Generale, Ressources Humaines, Finance & Comptabilite, Marketing & Communication, Informatique, Commercial, Logistique & Approvisionnement, Production, Service Client, Juridique, Administration, Securite, Restauration, Herbergement, Maintenance, Lingerie, Audiovisuel
role_responsable: Directeur General, Directeur Adjoint, DRH, DRH Adjoint, Chef de Departement, Chef de Service, Responsable de Pole, Superviseur, Manager Operationnel
cabinet_recrutement: HRC Cameroon, Activa RH, Skillmatch Africa, Michael Page Cameroon, Pedarec, AfricSearch, Manpower Cameroon, Interne (sans cabinet), Autre
statut_contrat: En cours, Renouvele, Echu, Resilie, En negociation
motif_fin_contrat: Fin de contrat, Demission, Licenciement, Depart retraite, Mutation, Force majeure
specialite_cabinet: Generaliste, Cadres dirigeants, Informatique, Finance, Hotellerie & Tourisme, Commerce, BTP, Logistique
evaluation_cabinet: Excellent, Bon, Moyen, Insuffisant, A evaluer
canal_diffusion: Site web, LinkedIn, Facebook, Presse ecrite, Radio, Salon emploi, Cabinet, Cooptation, Universites, Affichage
statut_offre: A creer, Publiee, Candidatures en cours, Cloturee, Annulee
categorie_checklist: Documents administratifs, Formation securite, Formation metier, Equipement & Badge, Presentation equipes, Visite locaux, Compte informatique, Repas & avantages
statut_checklist: A faire, En cours, Fait, Non applicable
decision_essai: Embauche confirmee, Prolongation essai, Rupture essai, En cours
statut_integration: En cours, Terminee, Echec, Prolongee
statut_formation: Planifiee, En cours, Terminee, Annulee
statut_stagiaire: En cours, Termine, Abandonne, Embauche
satisfaction: Tres satisfait, Satisfait, Neutre, Insatisfait, Tres insatisfait
risque_depart: Faible, Moyen, Eleve, Critique
stade_pipeline: CV recu, Pre-selection, Entretien HR, Test technique, Entretien final, Offre envoyee, Accepte, Refuse, Retraite
priorite_pipeline: Haute, Moyenne, Basse
```

---

## RÈGLES DE STYLE À RESPECTER

- **Framework** : React + Material UI (MUI) + Emotion CSS-in-JS
- **Composants MUI** : Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, TextField, Select, MenuItem, Dialog, Tabs, Tab, Box, Typography, Paper, Card, CardContent, Grid, IconButton
- **Palette** : Même palette que les pages existantes (thème MUI par défaut, chips colorés par statut)
- **Pattern KPI** : Card avec `Typography` pour le label et une valeur grande en `variant="h4"`
- **Pattern filtres** : Chips/Pills horizontaux ou Select dropdowns au-dessus du tableau
- **Pattern pagination** : `TablePagination` MUI en bas de tableau avec `rowsPerPageOptions={[5, 10, 25, 100]}`
- **Format monétaire** : `XXX XXX FCFA` avec `toLocaleString('fr-FR')`
- **Format date** : `JJ/MM/AAAA`

---

## VÉRIFICATION FINALE

Après chaque tâche, vérifie :

1. ✅ Toutes les colonnes existantes (gelées) sont intactes — comparer avec `frozen-snapshots/`
2. ✅ Les nouvelles colonnes sont à DROITE des existantes
3. ✅ Les données mock existantes n'ont pas changé
4. ✅ Les nomenclatures utilisent les valeurs exactes listées ci-dessus
5. ✅ Le style est cohérent avec les pages existantes
6. ✅ Le routing dans `App.jsx` pointe vers les bons composants
7. ✅ Aucune console error dans le navigateur
8. ✅ La sidebar affiche bien les liens vers les nouvelles pages

---

## RÉSUMÉ DES LIVRABLES

| Livrable | Fichier | Champs |
|---|---|---|
| Page Demandes | `src/pages/Demandes.jsx` | 19 champs (nouveau) |
| Page Base Candidats | `src/pages/Candidats.jsx` | 35 champs (nouveau) |
| Entretiens | modification | +6 champs |
| Évaluations | modification | +6 champs |
| Vérifications | modification | +8 champs |
| Sélections | modification | +2 champs |
| Cabinets | modification | +6 champs |
| Prévisions | modification | +5 champs |
| Sources | modification | +vue tableau (11 colonnes) |
| Coûts | modification | +5 champs |
| Intégration | modification | +5 champs |
| Checklist | modification | +3 champs |
| Période Essai | modification | +5 champs |
| Formation | modification | +3 champs |
| Stagiaires | modification | +4 champs |
| Saisonniers | modification | +3 champs |
| Post-Embauche | modification | +2 champs |
| Pipeline | modification | +7 champs par carte |
| **TOTAL** | | **+135 champs = 100%** |