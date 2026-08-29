# PROMPT — Sous-Étape 1 : Construction des 2 Pages Manquantes

> **Objectif** : Construire les 2 pages entièrement manquantes pour passer de 52% à 72% de couverture frontend.
> **Champs concernés** : 54 champs (19 + 35)
> **Pages cibles** : `Demandes.jsx` (`/offres`) + `Candidats.jsx` (`/candidats`)
> **Référence visuelle** : Screenshots dans `/frozen-snapshots/` — reproduire EXACTEMENT le même style MUI

---

## RÈGLES SUPRÊMES — À LIRE EN PREMIER

### R1 — CE QUI EST GELÉ (INTERDIT DE MODIFIER)

Les éléments suivants existent déjà et NE DOIVENT JAMAIS être modifiés, déplacés ou renommés :

```
[FROZEN] — NE PAS TOUCHER
├── src/App.jsx              → Routeur, sidebar, layout
├── src/components/Sidebar.jsx → Menu latéral (lien « Demandes » pointe déjà vers /offres)
├── src/components/Header.jsx  → Barre supérieure
├── src/components/KPICard.jsx → Composant carte KPI
├── src/data/nomenclatures.js  → 38 listes de référence
├── src/pages/*.jsx            → Toutes les 24 pages existantes
└── Tous les fichiers dans /public/
```

**Conséquences concrètes :**
- Tu ne dois NI lire NI modifier aucun fichier `[FROZEN]`
- Tu ne dois PAS modifier `App.jsx` pour ajouter des routes — les routes `/offres` et `/candidats` existent déjà dans le routeur gelé
- Tu ne dois PAS modifier `Sidebar.jsx` — le menu contient déjà « Demandes » (vers `/offres`) et « Base Candidats » (vers `/candidats`)
- Tu ne dois PAS modifier `nomenclatures.js` — les 38 listes sont gelées

### R2 — CE QUI EST AUTORISÉ (UNIQUEMENT)

```
[DEV] — SEULS FICHIERS AUTORISÉS EN ÉCRITURE
├── src/pages/Demandes.jsx     → CRÉER ou RÉÉCRIRE (page /offres)
└── src/pages/Candidats.jsx    → CRÉER ou RÉÉCRIRE (page /candidats)
```

**Tu ne dois créer AUCUN autre fichier.** Pas de nouveau composant, pas de nouveau hook, pas de nouveau dossier.

### R3 — STYLE OBLIGATOIRE

Tu dois reproduire fidèlement le style des pages existantes. Pour cela :

1. **Utilise EXCLUSIVEMENT** les composants MUI (`@mui/material`) déjà importés dans les autres pages
2. **Réutilise le composant `KPICard`** importé depuis `../components/KPICard` — mêmes props : `titre`, `valeur`, `sousTexte`
3. **Filtres** : Utilise le même pattern de filtres « pie » (Menu/Select MUI) présent sur les pages Cabinets, Contrats, etc.
4. **Tableau** : Utilise `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell` de MUI avec le même style (bordures légères, hover, padding standard)
5. **Pagination** : Utilise `TablePagination` de MUI avec les mêmes paramètres (rowsPerPageOptions `[5, 10, 25]`, rowsPerPage par défaut `10`)
6. **Boutons** : Utilise `Button` de MUI avec la variante « contained » et la couleur primaire (bleu #1976d2 ou thème existant)
7. **Chips de statut** : Utilise `Chip` de MUI avec les couleurs déjà utilisées sur les pages gelées
8. **Données mock** : Insère 8-10 lignes de données d'exemple réalistes (noms camerounais, départements de l'entreprise HRC Cameroon, postes hôteliers)
9. **Formatage nombres** : Les montants FCFA doivent utiliser `toLocaleString('fr-FR')` pour l'affichage (ex: `300 000 FCFA`)
10. **Compteur** : En haut de page, affiche le nombre total d'éléments (ex: « X demande(s) de recrutement »)

### R4 — NOMENCLATURES À UTILISER

Pour chaque champ dropdown, tu dois importer la nomenclature correspondante depuis `../data/nomenclatures` :

```javascript
import { nomenclatures } from '../data/nomenclatures';
// Accès : nomenclatures.statut_demande, nomenclatures.departement, etc.
```

Voici le mapping exact champ → nomenclature :

| Champ | Clé nomenclature | Valeurs autorisées |
|---|---|---|
| Département / Service | `departement` | Direction Generale, Ressources Humaines, Finance & Comptabilite, Marketing & Communication, Informatique, Commercial, Logistique & Approvisionnement, Production, Service Client, Juridique, Administration, Securite, Restauration, Herbergement, Maintenance, Lingerie, Audiovisuel (17 valeurs) |
| Type de Poste | `type_poste` | Cadre, Agent de maitrise, Operationnel, Stagiaire, Temporaire (5 valeurs) |
| Type de Contrat | `type_contrat` | CDI, CDD, Stage, Interim, Alternance, Freelance (6 valeurs) |
| Motif du Recrutement | `motif` | Remplacement, Creation de poste, Saisonnalite, Surcharge, Reorganisation (5 valeurs) |
| Priorité | `priorite` | Urgente, Haute, Moyenne, Basse (4 valeurs) |
| Statut Demande | `statut_demande` | En attente, Validée, En cours, Pourvue, Annulee (5 valeurs) |
| Rôle du Responsable | `role_responsable` | Directeur General, Directeur Adjoint, DRH, DRH Adjoint, Chef de Departement, Chef de Service, Responsable de Pole, Superviseur, Manager Operationnel (9 valeurs) |
| Cabinet / Agence | `cabinet_recrutement` | HRC Cameroon, Activa RH, Skillmatch Africa, Michael Page Cameroon, Pedarec, AfricSearch, Manpower Cameroon, Interne (sans cabinet), Autre (9 valeurs) |
| Civilité | `civilite` | M., Mme, Mlle (3 valeurs) |
| Genre | `genre` | Masculin, Feminin (2 valeurs) |
| Situation Familiale | `situation_fam` | Celibataire, Marie(e), Divorce(e), Veuf(ve) (4 valeurs) |
| Niveau Étude | `niveau_etude` | Sans diplome, CAP/BEP, BTS/DUT, Licence, Master, Doctorat, Autre (7 valeurs) |
| Niveau Langue | `niveau_langue` | Aucun, Debutant, Intermediaire, Avance, Bilingue, Natif (6 valeurs) |
| Source Candidature | `source` | Site web entreprise, Presse, Cooptation, Reseaux sociaux, Candidature spontanee, Ecole/Universite, Cabinet de recrutement, Salon emploi, Autre (9 valeurs) |
| Statut Candidat | `statut_candidat` | Nouveau, En cours d'etude, Entretien planifie, Entretien realise, Retenu, Refuse, En reserve, Desiste (8 valeurs) |
| Statut Offre (Prévisions) | `statut_offre` | A creer, Publiee, Candidatures en cours, Cloturee, Annulee (5 valeurs) |
| Canal Diffusion | `canal_diffusion` | Site web, LinkedIn, Facebook, Presse ecrite, Radio, Salon emploi, Cabinet, Cooptation, Universites, Affichage (10 valeurs) |

### R5 — PATTERNS DE CODE À SUIVRE

**Import standard** (adapte les noms) :
```javascript
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, Menu, MenuItem, FormControl, Select, InputLabel,
  Paper, IconButton, Tooltip
} from '@mui/material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';
```

**Pattern filtre pie** :
```javascript
const [filterStatut, setFilterStatut] = useState('Tous');
const [anchorEl, setAnchorEl] = useState(null);

// Dans le JSX :
<FormControl size="small" sx={{ minWidth: 150 }}>
  <InputLabel>Statut</InputLabel>
  <Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
    <MenuItem value="Tous">Tous</MenuItem>
    {nomenclatures.statut_demande.map((s) => (
      <MenuItem key={s} value={s}>{s}</MenuItem>
    ))}
  </Select>
</FormControl>
```

**Pattern KPI Cards** :
```javascript
<Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
  <KPICard titre="TOTAL DEMANDES" valeur={filteredData.length} sousTexte={`${filteredData.filter(d => d.statut === 'En cours').length} en cours`} />
  <KPICard titre="POURVUES" valeur={filteredData.filter(d => d.statut === 'Pourvue').length} sousTexte={`${Math.round(filteredData.filter(d => d.statut === 'Pourvue').length / Math.max(filteredData.length, 1) * 100)}% du total`} />
  {/* ... autres KPI */}
</Box>
```

**Pattern données mock** :
```javascript
const initialData = [
  {
    id: 1,
    numero: 'DR-2025-001',
    dateDemande: '2025-01-15',
    // ... tous les champs
  },
  // 8-10 entrées minimum
];
```

**Pattern pagination** :
```javascript
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

// Dans le JSX :
<TablePagination
  component="div"
  count={filteredData.length}
  page={page}
  onPageChange={(e, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
  rowsPerPageOptions={[5, 10, 25]}
  labelRowsPerPage="Lignes par page"
  labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
/>
```

---

## PAGE 1A — Demandes de Recrutement (`/offres`)

### Fichier à créer : `src/pages/Demandes.jsx`

### Référence Excel : Feuille `1-Demandes Recrutement` (19 champs)

### Spécification complète des 19 colonnes du tableau :

| # | Colonne | Type | Largeur | Détail |
|---|---|---|---|---|
| 1 | N° Demande | Texte (auto) | 130px | Format `DR-YYYY-NNN` — ex: DR-2025-001. Non éditable, auto-incrémenté |
| 2 | Date Demande | Date | 120px | Format `JJ/MM/AAAA`. Trier par défaut du plus récent au plus ancien |
| 3 | Département / Service | Dropdown | 200px | → nomenclature `departement`. Afficher comme Chip avec couleur par département |
| 4 | Poste Recherche | Texte | 180px | Texte libre. Ex: « Chef Cuisinier », « Réceptionniste Nuit » |
| 5 | Type de Poste | Dropdown | 140px | → nomenclature `type_poste`. Afficher comme Chip |
| 6 | Type de Contrat | Dropdown | 130px | → nomenclature `type_contrat`. Afficher comme Chip |
| 7 | Effectif Demande | Nombre | 100px | Entier. Ex: 1, 2, 3 |
| 8 | Motif du Recrutement | Dropdown | 170px | → nomenclature `motif`. Afficher comme Chip |
| 9 | Date Besoin | Date | 120px | Format `JJ/MM/AAAA`. Date à laquelle le poste est nécessaire |
| 10 | Priorité | Dropdown | 110px | → nomenclature `priorite`. **Couleurs chips obligatoires** : Urgente=red, Haute=orange, Moyenne=blue, Basse=grey |
| 11 | Statut | Dropdown | 150px | → nomenclature `statut_demande`. **Couleurs chips obligatoires** : En attente=default, Validée=blue, En cours=warning/orange, Pourvue=success/green, Annulee=error/red |
| 12 | Date Pourvue | Date | 120px | Format `JJ/MM/AAAA`. Peut être vide si non encore pourvue |
| 13 | Responsable Demande | Texte | 160px | Nom complet. Ex: « Mme. Fotso Marie », « M. Nkoulou Paul » |
| 14 | Rôle du Responsable | Dropdown | 170px | → nomenclature `role_responsable`. Texte dans la cellule |
| 15 | Cabinet / Agence Externe | Dropdown | 180px | → nomenclature `cabinet_recrutement`. Texte dans la cellule. Peut être vide |
| 16 | Budget Salaire (FCFA) | Monétaire | 150px | Nombre formaté : `300 000 FCFA`. Aligné à droite |
| 17 | Coût Recrutement (FCFA) | Monétaire | 150px | Nombre formaté : `150 000 FCFA`. Aligné à droite |
| 18 | Délai (jours) | Nombre | 100px | Entier. Ex: 30, 45, 60 |
| 19 | Notes | Texte | 150px | Texte court ou vide. Tronquer à 50 caractères avec tooltip si plus long |

### KPI Cards obligatoires (4 cartes) :

| KPI | Calcul | Sous-texte |
|---|---|---|
| TOTAL DEMANDES | `data.length` | « X demande(s) enregistrée(s) » |
| POURVUES | `data.filter(d => d.statut === 'Pourvue').length` | « X% du total » |
| EN COURS | `data.filter(d => ['En cours', 'Validée', 'En attente'].includes(d.statut)).length` | « demandes actives » |
| BUDGET TOTAL | `somme des budgetSalaire` formaté FCFA | « budget cumulé » |

### Filtres obligatoires (3 filtres pie) :

| Filtre | Nomenclature | Options |
|---|---|---|
| Département | `departement` | Tous + 17 valeurs |
| Statut | `statut_demande` | Tous + 5 valeurs |
| Priorité | `priorite` | Tous + 4 valeurs |

### Données mock obligatoires (10 entrées) :

```
DR-2025-001 | 15/01/2025 | Restauration | Chef Cuisinier | Cadre | CDI | 1 | Remplacement | 01/02/2025 | Urgente | Pourvue | 15/03/2025 | M. Nkoulou Paul | DRH | HRC Cameroon | 350 000 | 150 000 | 30
DR-2025-002 | 20/01/2025 | Herbergement | Réceptionniste Nuit | Operationnel | CDD | 2 | Saisonnalite | 01/03/2025 | Haute | En cours | — | Mme. Fotso Marie | Chef de Departement | — | 180 000 | 80 000 | 45
DR-2025-003 | 25/01/2025 | Finance & Comptabilite | Comptable Senior | Cadre | CDI | 1 | Creation de poste | 01/04/2025 | Moyenne | Validée | — | M. Tchouankou Jean | DRH Adjoint | Activa RH | 400 000 | 250 000 | 60
DR-2025-004 | 01/02/2025 | Service Client | Agent Accueil | Operationnel | CDD | 1 | Surcharge | 15/02/2025 | Haute | Pourvue | 10/03/2025 | Mme. Eyenga Clarisse | Chef de Service | Interne (sans cabinet) | 150 000 | 25 000 | 15
DR-2025-005 | 05/02/2025 | Sécurité | Agent de Sécurité | Operationnel | CDD | 3 | Remplacement | 01/03/2025 | Moyenne | En attente | — | M. Nganou André | Responsable de Pole | — | 120 000 | 45 000 | 30
DR-2025-006 | 10/02/2025 | Informatique | Développeur Full Stack | Cadre | CDI | 1 | Creation de poste | 01/05/2025 | Basse | En attente | — | M. Kamga Blaise | Directeur Adjoint | Skillmatch Africa | 500 000 | 300 000 | 90
DR-2025-007 | 15/02/2025 | Marketing & Communication | Community Manager | Agent de maitrise | CDI | 1 | Surcharge | 01/03/2025 | Haute | En cours | — | Mme. Mebara Nadège | Chef de Departement | — | 250 000 | 60 000 | 20
DR-2025-008 | 20/02/2025 | Logistique & Approvisionnement | Chef Approvisionnement | Cadre | CDI | 1 | Creation de poste | 01/06/2025 | Moyenne | Validée | — | M. Ngo Ndobo Alain | DRH | Michael Page Cameroon | 450 000 | 200 000 | 75
DR-2025-009 | 01/03/2025 | Audiovisuel | Technicien Audiovisuel | Agent de maitrise | CDD | 1 | Remplacement | 15/03/2025 | Urgente | Annulee | — | M. Tabe Arnaud | Superviseur | — | 200 000 | 0 | 30
DR-2025-010 | 05/03/2025 | Lingerie | Agent de Blanchisserie | Operationnel | CDD | 2 | Saisonnalite | 01/04/2025 | Basse | En attente | — | Mme. Ateba Chantal | Chef de Service | — | 100 000 | 30 000 | 30
```

### Boutons obligatoires :
- « Nouvelle Demande » (Button contained, startIcon: AddIcon from `@mui/icons-material/Add`)
- « Exporter CSV » (Button outlined, startIcon: DownloadIcon from `@mui/icons-material/Download`) — à côté du bouton Nouvelle Demande

### Titre de page :
- Titre : « Demandes de Recrutement » (Typography variant="h5" fontWeight="bold")
- Compteur : « X demande(s) de recrutement » (Typography variant="body2" color="text.secondary")

---

## PAGE 1B — Base Candidats (`/candidats`)

### Fichier à créer : `src/pages/Candidats.jsx`

### Référence Excel : Feuille `2-Base Candidats` (35 champs)

### Architecture de la page :

Puisque 35 champs dans un seul tableau serait illisible, la page doit avoir **2 vues** :

1. **Vue Tableau** (vue par défaut) : Les 15 colonnes les plus importantes
2. **Vue Fiche** (modal/dialog) : Les 35 champs complets quand on clique sur un candidat

### Vue Tableau — 15 colonnes principales :

| # | Colonne | Type | Largeur | Détail |
|---|---|---|---|---|
| 1 | N° Candidat | Texte (auto) | 110px | Format `CAN-NNN` — ex: CAN-001 |
| 2 | Civilité | Dropdown | 70px | → nomenclature `civilite`. Texte court dans la cellule |
| 3 | Nom | Texte | 130px | Nom de famille |
| 4 | Prénom | Texte | 130px | Prénom |
| 5 | Téléphone | Texte | 120px | Format camerounais : +237 6XX XXX XXX |
| 6 | Email | Texte | 180px | Texte |
| 7 | Poste Visé | Texte | 160px | Poste auquel le candidat postule |
| 8 | Source Candidature | Dropdown | 150px | → nomenclature `source`. Afficher comme Chip |
| 9 | Statut | Dropdown | 150px | → nomenclature `statut_candidat`. **Couleurs chips** : Nouveau=default, En cours d'etude=info/blue, Entretien planifie=warning, Retenu=success/green, Refuse=error/red, En reserve=default, Desiste=grey |
| 10 | Score (/20) | Nombre | 80px | Nombre décimal. Afficher en gras si >= 12, en rouge si < 10 |
| 11 | Niveau Étude | Dropdown | 130px | → nomenclature `niveau_etude`. Texte dans la cellule |
| 12 | Années Exp. | Nombre | 80px | Entier |
| 13 | Dernier Employeur | Texte | 160px | Peut être vide |
| 14 | Date Candidature | Date | 120px | Format `JJ/MM/AAAA` |
| 15 | Actions | Boutons | 100px | Icône « eye » (ouvrir fiche) + icône « edit » |

### Vue Fiche (Dialog/Modal) — 35 champs complets :

Onglets séparés dans le Dialog :

**Onglet 1 : Informations Personnelles** (12 champs)

| Champ | Type | Nomenclature |
|---|---|---|
| N° Candidat | Texte auto | — |
| Civilité | Select | `civilite` |
| Nom | TextField | — |
| Prénom | TextField | — |
| Genre | Select | `genre` |
| Date de Naissance | DatePicker | — |
| Nationalité | TextField | — (défaut: Camerounaise) |
| Situation Familiale | Select | `situation_fam` |
| Téléphone | TextField | — |
| Email | TextField | — |
| Adresse | TextField | — |
| Ville | TextField | — |

**Onglet 2 : Formation & Compétences** (9 champs)

| Champ | Type | Nomenclature |
|---|---|---|
| Niveau Étude | Select | `niveau_etude` |
| Diplôme | TextField | — |
| Établissement | TextField | — |
| Années Exp. | TextField number | — |
| Dernier Employeur | TextField | — |
| Compétences Clés | TextField multiline | — |
| Langues | TextField | — |
| Niveau Langue | Select | `niveau_langue` |
| Outils/Logiciels | TextField multiline | — |

**Onglet 3 : Candidature** (8 champs)

| Champ | Type | Nomenclature |
|---|---|---|
| Poste Visé | TextField | — |
| Source Candidature | Select | `source` |
| Date Candidature | DatePicker | — |
| Statut | Select | `statut_candidat` |
| Score (/20) | TextField number | — |
| Type Contrat | Select | `type_contrat` |
| Notes | TextField multiline | — |

**Onglet 4 : Documents & Contrat** (6 champs)

| Champ | Type | Détail |
|---|---|---|
| Contrat Téléchargeable | Texte + lien | Nom du fichier ou « Non fourni » |
| Date Début Essai | DatePicker | — |
| Date Fin Essai | DatePicker | — |
| Date Embauche Définitive | DatePicker | — |
| Certificat Travail | Checkbox + texte | Coché si fourni |
| Attestation CNPS | Checkbox + texte | Coché si fourni |
| Extrait Casier Judiciaire | Checkbox + texte | Coché si fourni |

### KPI Cards obligatoires (4 cartes) :

| KPI | Calcul | Sous-texte |
|---|---|---|
| TOTAL CANDIDATS | `data.length` | « X candidat(s) inscrit(s) » |
| RETENUS | `data.filter(d => d.statut === 'Retenu').length` | « X% du total » |
| EN COURS | `data.filter(d => ['En cours d\'etude', 'Entretien planifie', 'Entretien realise'].includes(d.statut)).length` | « en processus » |
| SCORE MOYEN | `moyenne des scores` | « /20 » |

### Filtres obligatoires (4 filtres pie) :

| Filtre | Nomenclature |
|---|---|
| Statut | `statut_candidat` |
| Source | `source` |
| Niveau Étude | `niveau_etude` |
| Poste Visé | Texte libre (recherche) |

### Données mock obligatoires (10 entrées) :

```
CAN-001 | M. | Ndiaye | Moussa | Masculin | +237 699 123 456 | ndiaye.m@email.com | Chef Cuisinier | Cabinet de recrutement | Retenu | 17.5 | Master | 8 | Hôtel Sawa | 10/01/2025
CAN-002 | Mme. | Tchouankou | Claire | Feminin | +237 677 234 567 | tchouankou.c@email.com | Comptable Senior | Ecole/Universite | Entretien realise | 14.0 | Licence | 3 | — | 15/01/2025
CAN-003 | M. | Nganou | André | Masculin | +237 690 345 678 | nganou.a@email.com | Agent de Sécurité | Candidature spontanee | En cours d'etude | 0 | BTS/DUT | 2 | — | 20/01/2025
CAN-004 | Mme. | Eyenga | Clarisse | Feminin | +237 695 456 789 | eyenga.c@email.com | Agent Accueil | Site web entreprise | Retenu | 16.0 | BTS/DUT | 4 | Hôtel Mont Fébé | 05/02/2025
CAN-005 | M. | Kamga | Blaise | Masculin | +237 677 567 890 | kamga.b@email.com | Développeur Full Stack | LinkedIn | En cours d'etude | 0 | Master | 5 | — | 10/02/2025
CAN-006 | Mme. | Mebara | Nadège | Feminin | +237 699 678 901 | mebara.n@email.com | Community Manager | Reseaux sociaux | Entretien planifie | 0 | Licence | 2 | — | 15/02/2025
CAN-007 | M. | Nkoulou | Brandon | Masculin | +237 690 789 012 | nkoulou.b@email.com | Réceptionniste Nuit | Cooptation | Refuse | 8.5 | CAP/BEP | 1 | — | 20/02/2025
CAN-008 | M. | Fomumbod | Yvan | Masculin | +237 677 890 123 | fomumbod.y@email.com | Chef Approvisionnement | Cabinet de recrutement | En cours d'etude | 0 | Master | 7 | Société Camerounaise de Brasserie | 01/03/2025
CAN-009 | Mme. | Ateba | Chantal | Feminin | +237 695 901 234 | ateba.c@email.com | Agent de Blanchisserie | Candidature spontanee | Nouveau | 0 | Sans diplome | 0 | — | 05/03/2025
CAN-010 | M. | Tchouante | Rodrigue | Masculin | +237 690 012 345 | tchouante.r@email.com | Technicien Audiovisuel | Salon emploi | En reserve | 11.0 | BTS/DUT | 3 | Hôtel Sawa | 10/03/2025
```

### Boutons obligatoires :
- « Nouveau Candidat » (Button contained, startIcon: AddIcon)
- « Exporter CSV » (Button outlined, startIcon: DownloadIcon)
- Dans la vue fiche : « Fermer » et « Modifier » (boutons en bas du Dialog)

### Titre de page :
- Titre : « Base Candidats » (Typography variant="h5" fontWeight="bold")
- Compteur : « X candidat(s) inscrit(s) » (Typography variant="body2" color="text.secondary")

---

## CHECKLIST DE VALIDATION — SOUS-ÉTAPE 1

Après avoir terminé les 2 pages, vérifie IMPÉRATIVEMENT :

### Pour chaque page :
- [ ] Le nombre de colonnes correspond EXACTEMENT au cahier des charges (19 pour Demandes, 15 pour Candidats tableau + 35 dans la fiche)
- [ ] Les nomenclatures sont importées depuis `../data/nomenclatures` et PAS hardcodées
- [ ] Les KPI Cards utilisent le composant `KPICard` importé depuis `../components/KPICard`
- [ ] Les filtres pie utilisent le pattern `FormControl` + `Select` + `MenuItem` de MUI
- [ ] La pagination utilise `TablePagination` de MUI avec `rowsPerPageOptions={[5, 10, 25]}`
- [ ] Les montants FCFA sont formatés avec `toLocaleString('fr-FR')`
- [ ] Les données mock contiennent au moins 10 entrées réalistes
- [ ] Le compteur en haut de page affiche le bon nombre
- [ ] Les chips de statut ont les bonnes couleurs (voir spécification ci-dessus)
- [ ] Aucun fichier FROZEN n'a été modifié

### Vérification croisée :
- [ ] `src/App.jsx` n'a pas été modifié (les routes existent déjà)
- [ ] `src/components/Sidebar.jsx` n'a pas été modifié
- [ ] `src/components/Header.jsx` n'a pas été modifié
- [ ] `src/components/KPICard.jsx` n'a pas été modifié
- [ ] `src/data/nomenclatures.js` n'a pas été modifié
- [ ] Aucun des 24 fichiers `.jsx` existants dans `src/pages/` n'a été modifié
- [ ] Les 2 seuls nouveaux fichiers sont `Demandes.jsx` et `Candidats.jsx`

### Test fonctionnel :
- [ ] Navigation : cliquer sur « Demandes » dans la sidebar → la page `/offres` s'affiche
- [ ] Navigation : cliquer sur « Base Candidats » dans la sidebar → la page `/candidats` s'affiche
- [ ] Les filtres fonctionnent et filtrent correctement les données
- [ ] La pagination fonctionne
- [ ] Sur Candidats : cliquer sur l'icône « eye » d'un candidat → la fiche complète s'ouvre dans un Dialog
- [ ] Les 4 onglets de la fiche candidat sont tous accessibles et contiennent les bons champs
- [ ] Les dropdowns affichent les bonnes valeurs de nomenclature
- [ ] Retour au Tableau de Bord fonctionne
- [ ] Toutes les autres pages (16 existantes) fonctionnent toujours identiquement

---

## RÉSUMÉ DES LIVRABLES

| Livrable | Fichier | Champs |
|---|---|---|
| Page Demandes | `src/pages/Demandes.jsx` | 19 champs |
| Page Candidats | `src/pages/Candidats.jsx` | 35 champs (15 tableau + 35 fiche) |
| **Total** | **2 fichiers** | **54 champs** |

**Résultat attendu** : Passage de 146/279 (52%) → 200/279 (72%) de couverture frontend.
