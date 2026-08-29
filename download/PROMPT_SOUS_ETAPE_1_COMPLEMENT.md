# PROMPT — Sous-Étape 1 COMPLÉMENT : 48 Champs Manquants

> **Contexte** : La sous-étape 1 a été partiellement exécutée. 21/54 champs sont présents.
> **Objectif** : Ajouter les **48 champs manquants** pour atteindre 100% de la sous-étape 1.
> **Fichiers autorisés EN MODIFICATION** : `src/pages/Demandes.jsx` et `src/pages/Candidats.jsx` **UNIQUEMENT**.

---

## RÈGLES SUPRÊMES

### R1 — FICHIERS GELÉS (INTERDIT DE MODIFIER)

```
[FROZEN] — NE PAS TOUCHER
├── src/App.jsx
├── src/components/Sidebar.jsx
├── src/components/Header.jsx
├── src/components/KPICard.jsx
├── src/data/nomenclatures.js
├── src/pages/*.jsx (SAUF Demandes.jsx et Candidats.jsx)
└── Tous les fichiers dans /public/
```

### R2 — AJOUTER LES COLONNES À DROITE DES EXISTANTES

**Ne PAS** déplacer, renommer ou supprimer les colonnes/tableaux/KPIs/boutons/filtres/données mock qui existent déjà. **AJOUTER UNIQUEMENT** les éléments manquants listés ci-dessous.

### R3 — NOMENCLATURES

Importer depuis `../data/nomenclatures` :
```javascript
import { nomenclatures } from '../data/nomenclatures';
```

---

## PARTIE A — Demandes.jsx : 8 colonnes manquantes

### Ce qui EXISTE déjà (NE PAS TOUCHER) :
11 colonnes : N° Demande, Date Demande, Département, Poste Recherché, Type Poste, Type Contrat, Effectif, Motif, Date Besoin, Priorité, Statut
4 KPI cards, 3 filtres (Département, Statut, Priorité), 2 boutons, 10 données mock, pagination, compteur

### Ce qu'il faut AJOUTER (8 colonnes à DROITE des existantes) :

| # | Colonne à ajouter | Type | Largeur | Détail |
|---|---|---|---|---|
| 12 | Date Pourvue | Date | 120px | Format `JJ/MM/AAAA`. Vide si non pourvue. Afficher « — » si null/undefined |
| 13 | Responsable Demande | Texte | 160px | Nom complet. Ex: « Mme. Fotso Marie ». Texte brut dans la cellule |
| 14 | Rôle du Responsable | Texte | 170px | Valeur de la nomenclature `role_responsable`. Texte brut (pas de chip) |
| 15 | Cabinet / Agence | Texte | 180px | Valeur de la nomenclature `cabinet_recrutement`. Afficher « — » si vide |
| 16 | Budget Salaire | Monétaire | 150px | Nombre formaté avec `toLocaleString('fr-FR')` + « FCFA ». Aligné à droite |
| 17 | Coût Recrutement | Monétaire | 150px | Même formatage que Budget Salaire. Aligné à droite |
| 18 | Délai (jours) | Nombre | 100px | Entier. Texte centré |
| 19 | Notes | Texte | 150px | Tronquer à 40 caractères. Si plus long, afficher le texte tronqué + tooltip au hover |

### Données mock à AJOUTER dans chaque ligne existante :

Pour chaque entrée existante dans `initialData`, ajouter ces 8 champs :

```javascript
// DR-2025-001 (Restauration, Chef Cuisinier, Pourvue)
datePourvue: '15/03/2025',
responsableDemande: 'M. Nkoulou Paul',
roleResponsable: 'DRH',
cabinetAgence: 'HRC Cameroon',
budgetSalaire: 350000,
coutRecrutement: 150000,
delai: 30,
notes: 'Candidat interne recommandé',

// DR-2025-002 (Hérbergement, Réceptionniste Nuit, En cours)
datePourvue: '',
responsableDemande: 'Mme. Fotso Marie',
roleResponsable: 'Chef de Departement',
cabinetAgence: '',
budgetSalaire: 180000,
coutRecrutement: 80000,
delai: 45,
notes: '',

// DR-2025-003 (Finance, Comptable Senior, Validée)
datePourvue: '',
responsableDemande: 'M. Tchouankou Jean',
roleResponsable: 'DRH Adjoint',
cabinetAgence: 'Activa RH',
budgetSalaire: 400000,
coutRecrutement: 250000,
delai: 60,
notes: 'Recherche spécialisée',

// DR-2025-004 (Service Client, Agent Accueil, Pourvue)
datePourvue: '10/03/2025',
responsableDemande: 'Mme. Eyenga Clarisse',
roleResponsable: 'Chef de Service',
cabinetAgence: 'Interne (sans cabinet)',
budgetSalaire: 150000,
coutRecrutement: 25000,
delai: 15,
notes: 'Recrutement rapide réussi',

// DR-2025-005 (Sécurité, Agent Sécurité, En attente)
datePourvue: '',
responsableDemande: 'M. Nganou André',
roleResponsable: 'Responsable de Pole',
cabinetAgence: '',
budgetSalaire: 120000,
coutRecrutement: 45000,
delai: 30,
notes: '',

// DR-2025-006 (Informatique, Dev Full Stack, En attente)
datePourvue: '',
responsableDemande: 'M. Kamga Blaise',
roleResponsable: 'Directeur Adjoint',
cabinetAgence: 'Skillmatch Africa',
budgetSalaire: 500000,
coutRecrutement: 300000,
delai: 90,
notes: 'Profil rare, cabinet mandaté',

// DR-2025-007 (Marketing, Community Manager, En cours)
datePourvue: '',
responsableDemande: 'Mme. Mebara Nadège',
roleResponsable: 'Chef de Departement',
cabinetAgence: '',
budgetSalaire: 250000,
coutRecrutement: 60000,
delai: 20,
notes: '',

// DR-2025-008 (Logistique, Chef Approvisionnement, Validée)
datePourvue: '',
responsableDemande: 'M. Ngo Ndobo Alain',
roleResponsable: 'DRH',
cabinetAgence: 'Michael Page Cameroon',
budgetSalaire: 450000,
coutRecrutement: 200000,
delai: 75,
notes: 'Processus en cours avec cabinet',

// DR-2025-009 (Audiovisuel, Technicien, Annulée)
datePourvue: '',
responsableDemande: 'M. Tabe Arnaud',
roleResponsable: 'Superviseur',
cabinetAgence: '',
budgetSalaire: 200000,
coutRecrutement: 0,
delai: 30,
notes: 'Poste annulé faute de budget',

// DR-2025-010 (Lingerie, Agent Blanchisserie, En attente)
datePourvue: '',
responsableDemande: 'Mme. Ateba Chantal',
roleResponsable: 'Chef de Service',
cabinetAgence: '',
budgetSalaire: 100000,
coutRecrutement: 30000,
delai: 30,
notes: '',
```

### Pour le formatage monétaire :
```javascript
// Utiliser cette fonction helper (à ajouter dans le composant)
const formatFCFA = (amount) => {
  if (!amount && amount !== 0) return '—';
  return amount.toLocaleString('fr-FR') + ' FCFA';
};
```

### Pour le tooltip Notes :
```javascript
import { Tooltip } from '@mui/material';

// Dans la cellule Notes :
<TableCell>
  {row.notes && row.notes.length > 40 ? (
    <Tooltip title={row.notes} arrow>
      <span>{row.notes.substring(0, 40)}...</span>
    </Tooltip>
  ) : (
    row.notes || '—'
  )}
</TableCell>
```

---

## PARTIE B — Candidats.jsx : 5 colonnes tableau + 35 champs fiche (Dialog)

### B1 — 5 colonnes manquantes dans le TABLEAU (à DROITE de « Score (/20) »)

| # | Colonne à ajouter | Type | Largeur | Détail |
|---|---|---|---|---|
| 11 | Niveau Étude | Texte | 130px | Valeur de `niveau_etude`. Texte brut dans la cellule |
| 12 | Années Exp. | Nombre | 90px | Entier. Centré |
| 13 | Dernier Employeur | Texte | 160px | Peut être vide → afficher « — » |
| 14 | Date Candidature | Date | 120px | Format `JJ/MM/AAAA` |
| 15 | Actions | Icônes | 100px | 2 IconButton : `Visibility` (œil, bleu) et `Edit` (crayon, gris) |

### Données mock à AJOUTER dans chaque ligne existante :

```javascript
// Pour chaque candidat existant dans initialData, ajouter :

// CAN-001 (Ndiaye Moussa, Retenu, 17.5/20)
niveauEtude: 'Master',
anneesExp: 8,
dernierEmployeur: 'Hôtel Sawa',
dateCandidature: '10/01/2025',

// CAN-002 (Tchouankou Claire, Entretien réalisé, 14/20)
niveauEtude: 'Licence',
anneesExp: 3,
dernierEmployeur: '',
dateCandidature: '15/01/2025',

// CAN-003 (Nganou André, En cours, —)
niveauEtude: 'BTS/DUT',
anneesExp: 2,
dernierEmployeur: '',
dateCandidature: '20/01/2025',

// CAN-004 (Eyenga Clarisse, Retenu, 16/20)
niveauEtude: 'BTS/DUT',
anneesExp: 4,
dernierEmployeur: 'Hôtel Mont Fébé',
dateCandidature: '05/02/2025',

// CAN-005 (Kamga Blaise, En cours, —)
niveauEtude: 'Master',
anneesExp: 5,
dernierEmployeur: '',
dateCandidature: '10/02/2025',

// CAN-006 (Mebara Nadège, Entretien planifié, —)
niveauEtude: 'Licence',
anneesExp: 2,
dernierEmployeur: '',
dateCandidature: '15/02/2025',

// CAN-007 (Nkoulou Brandon, Refusé, 8.5/20)
niveauEtude: 'CAP/BEP',
anneesExp: 1,
dernierEmployeur: '',
dateCandidature: '20/02/2025',

// CAN-008 (Fomumbod Yvan, En cours, —)
niveauEtude: 'Master',
anneesExp: 7,
dernierEmployeur: 'Société Camerounaise de Brasserie',
dateCandidature: '01/03/2025',

// CAN-009 (Ateba Chantal, Nouveau, —)
niveauEtude: 'Sans diplome',
anneesExp: 0,
dernierEmployeur: '',
dateCandidature: '05/03/2025',

// CAN-010 (Tchouante Rodrigue, En réserve, 11/20)
niveauEtude: 'BTS/DUT',
anneesExp: 3,
dernierEmployeur: 'Hôtel Sawa',
dateCandidature: '10/03/2025',
```

### Import des icônes Actions :
```javascript
import { Visibility, Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

// Dans la colonne Actions :
<TableCell>
  <Tooltip title="Voir la fiche"><IconButton onClick={() => handleOpenFiche(row)}><Visibility fontSize="small" color="primary" /></IconButton></Tooltip>
  <Tooltip title="Modifier"><IconButton><Edit fontSize="small" /></IconButton></Tooltip>
</TableCell>
```

---

### B2 — FICHE DÉTAILLÉE (Dialog) avec 4 onglets — 35 champs COMPLETS

**C'est la plus grosse partie manquante.** Au clic sur l'icône œil (Visibility) d'une ligne du tableau, un `Dialog` MUI doit s'ouvrir avec **4 onglets** contenant les **35 champs** du candidat.

#### Structure du Dialog :

```javascript
import {
  Dialog, DialogTitle, DialogContent, Tabs, Tab, Box,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Checkbox, FormControlLabel, Typography, Divider, Button
} from '@mui/material';

// State pour le dialog
const [openFiche, setOpenFiche] = useState(false);
const [selectedCandidat, setSelectedCandidat] = useState(null);
const [activeTab, setActiveTab] = useState(0);

const handleOpenFiche = (candidat) => {
  setSelectedCandidat(candidat);
  setActiveTab(0);
  setOpenFiche(true);
};

const handleCloseFiche = () => setOpenFiche(false);
```

#### JSX du Dialog :

```jsx
<Dialog open={openFiche} onClose={handleCloseFiche} maxWidth="md" fullWidth>
  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h6" fontWeight="bold">
      Fiche Candidat — {selectedCandidat?.nom} {selectedCandidat?.prenom}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {selectedCandidat?.numero}
    </Typography>
  </DialogTitle>
  <DialogContent>
    {/* Onglets en haut du Dialog */}
    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
      <Tab label="Informations Personnelles" />
      <Tab label="Formation & Compétences" />
      <Tab label="Candidature" />
      <Tab label="Documents & Contrat" />
    </Tabs>

    {/* Contenu des onglets */}
    {activeTab === 0 && <OngletInfos candidat={selectedCandidat} />}
    {activeTab === 1 && <OngletFormation candidat={selectedCandidat} />}
    {activeTab === 2 && <OngletCandidature candidat={selectedCandidat} />}
    {activeTab === 3 && <OngletDocuments candidat={selectedCandidat} />}
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button variant="outlined" onClick={handleCloseFiche}>Fermer</Button>
    <Button variant="contained">Modifier</Button>
  </DialogActions>
</Dialog>
```

#### ONGLET 1 : Informations Personnelles (12 champs)

Layout : **Grid 2 colonnes** (`Grid container spacing={2}`)

| Champ | Composant | Grid | Nomenclature |
|---|---|---|---|
| N° Candidat | TextField disabled | xs=12 | — (auto) |
| Civilité | Select | xs=6 | `civilite` |
| Genre | Select | xs=6 | `genre` |
| Nom | TextField | xs=6 | — |
| Prénom | TextField | xs=6 | — |
| Date de Naissance | TextField type="date" | xs=6 | — |
| Nationalité | TextField | xs=6 | — (défaut: Camerounaise) |
| Situation Familiale | Select | xs=6 | `situation_fam` |
| Téléphone | TextField | xs=6 | — |
| Email | TextField | xs=6 | — |
| Adresse | TextField | xs=8 | — |
| Ville | TextField | xs=4 | — |

#### ONGLET 2 : Formation & Compétences (9 champs)

| Champ | Composant | Grid | Nomenclature |
|---|---|---|---|
| Niveau Étude | Select | xs=6 | `niveau_etude` |
| Diplôme | TextField | xs=6 | — |
| Établissement | TextField | xs=6 | — |
| Années Exp. | TextField type="number" | xs=6 | — |
| Dernier Employeur | TextField | xs=12 | — |
| Compétences Clés | TextField multiline rows={3} | xs=12 | — |
| Langues | TextField | xs=6 | — |
| Niveau Langue | Select | xs=6 | `niveau_langue` |
| Outils/Logiciels | TextField multiline rows={2} | xs=12 | — |

#### ONGLET 3 : Candidature (7 champs)

| Champ | Composant | Grid | Nomenclature |
|---|---|---|---|
| Poste Visé | TextField | xs=6 | — |
| Source Candidature | Select | xs=6 | `source` |
| Date Candidature | TextField type="date" | xs=6 | — |
| Statut | Select | xs=6 | `statut_candidat` |
| Score (/20) | TextField type="number" | xs=6 | — |
| Type Contrat | Select | xs=6 | `type_contrat` |
| Notes | TextField multiline rows={3} | xs=12 | — |

#### ONGLET 4 : Documents & Contrat (7 champs)

| Champ | Composant | Grid | Détail |
|---|---|---|---|
| Contrat Téléchargeable | TextField disabled | xs=12 | Afficher le nom du fichier ou « Non fourni » |
| Date Début Essai | TextField type="date" | xs=6 | — |
| Date Fin Essai | TextField type="date" | xs=6 | — |
| Date Embauche Définitive | TextField type="date" | xs=12 | — |
| Certificat Travail | Checkbox + label | xs=12 | « Certificat de travail fourni » |
| Attestation CNPS | Checkbox + label | xs=12 | « Attestation CNPS fournie » |
| Extrait Casier Judiciaire | Checkbox + label | xs=12 | « Extrait de casier judiciaire fourni » |

#### Pattern pour chaque champ dans un onglet :

```jsx
{/* Exemple : Champ dans un onglet */}
<Grid item xs={6}>
  <FormControl fullWidth size="small">
    <InputLabel>Civilité</InputLabel>
    <Select
      value={candidat?.civilite || ''}
      label="Civilité"
      disabled // En lecture seule pour le moment
    >
      {nomenclatures.civilite.map((c) => (
        <MenuItem key={c} value={c}>{c}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

<Grid item xs={6}>
  <TextField
    fullWidth
    size="small"
    label="Nom"
    value={candidat?.nom || ''}
    disabled
  />
</Grid>
```

#### Pattern Grid pour chaque onglet :

```jsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <Grid container spacing={2}>
    {/* Champ 1 */}
    <Grid item xs={6}>...</Grid>
    {/* Champ 2 */}
    <Grid item xs={6}>...</Grid>
    {/* ... */}
  </Grid>
</Box>
```

### Données mock complètes pour la fiche (35 champs par candidat) :

Ajouter ces champs à CHAQUE entrée de `initialData` pour que la fiche fonctionne :

```javascript
// CAN-001 — Ndiaye Moussa
{
  // ... champs existants du tableau ...
  // Champs fiche — Informations Personnelles
  civilite: 'M.', genre: 'Masculin', dateNaissance: '1988-03-15',
  nationalite: 'Camerounaise', situationFam: 'Marie(e)',
  adresse: 'Quartier Nlongkak, Yaoundé', ville: 'Yaoundé',
  // Champs fiche — Formation & Compétences
  diplome: 'Master en Hôtellerie-Restauration',
  etablissement: 'Université de Douala',
  competencesCles: 'Gastronomie, Management, HACCP, Budget, Animation d\'équipe',
  langues: 'Français, Anglais', niveauLangue: 'Bilingue',
  outilsLogiciels: 'Excel, Word, Sage Gestion Restaurant',
  // Champs fiche — Candidature
  typeContrat: 'CDI', notes: 'Candidat très motivé, forte expérience hôtelière',
  // Champs fiche — Documents & Contrat
  contratTelechargeable: '',
  dateDebutEssai: '2025-04-01', dateFinEssai: '2025-06-30',
  dateEmbaucheDefinitive: '2025-07-01',
  certificatTravail: true, attestationCNPS: true, extraitCasier: true,
},

// CAN-002 — Tchouankou Claire
{
  civilite: 'Mme.', genre: 'Feminin', dateNaissance: '1992-07-22',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Bastos, Yaoundé', ville: 'Yaoundé',
  diplome: 'Licence en Comptabilité',
  etablissement: 'Université de Yaoundé II',
  competencesCles: 'Comptabilité générale, Paie, Déclarations fiscales, Sage',
  langues: 'Français, Anglais', niveauLangue: 'Avance',
  outilsLogiciels: 'Sage 100, Excel, Word',
  typeContrat: 'CDI', notes: 'Profil solide en comptabilité',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-003 — Nganou André
{
  civilite: 'M.', genre: 'Masculin', dateNaissance: '1998-11-05',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Kribi', ville: 'Kribi',
  diplome: 'BTS Sécurité', etablissement: 'ENST de Douala',
  competencesCles: 'Surveillance, Gestes de premiers secours',
  langues: 'Français', niveauLangue: 'Intermediaire',
  outilsLogiciels: '',
  typeContrat: 'CDD', notes: '',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-004 — Eyenga Clarisse
{
  civilite: 'Mme.', genre: 'Feminin', dateNaissance: '1995-04-18',
  nationalite: 'Camerounaise', situationFam: 'Marie(e)',
  adresse: 'Mvog-Ada, Yaoundé', ville: 'Yaoundé',
  diplome: 'BTS Hôtellerie', etablissement: 'IST de Yaoundé',
  competencesCles: 'Accueil client, Réservation, Anglais conversationnel',
  langues: 'Français, Anglais, Espagnol', niveauLangue: 'Avance',
  outilsLogiciels: 'Opera PMS, Excel, Word',
  typeContrat: 'CDD', notes: 'Bonne présentation, expérience accueil hôtelier',
  contratTelechargeable: 'Contrat_CAN-004_CDD.pdf',
  dateDebutEssai: '2025-03-15', dateFinEssai: '2025-05-15',
  dateEmbaucheDefinitive: '',
  certificatTravail: true, attestationCNPS: true, extraitCasier: true,
},

// CAN-005 — Kamga Blaise
{
  civilite: 'M.', genre: 'Masculin', dateNaissance: '1994-09-10',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Makepe, Douala', ville: 'Douala',
  diplome: 'Master Informatique',
  etablissement: 'Université de Yaoundé I',
  competencesCles: 'React, Node.js, PostgreSQL, Docker, Git, AWS',
  langues: 'Français, Anglais', niveauLangue: 'Bilingue',
  outilsLogiciels: 'VS Code, GitHub, Jira, Figma',
  typeContrat: 'CDI', notes: 'Développeur full stack avec 5 ans d\'expérience',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-006 — Mebara Nadège
{
  civilite: 'Mme.', genre: 'Feminin', dateNaissance: '1997-01-25',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Briqueterie, Douala', ville: 'Douala',
  diplome: 'Licence Marketing',
  etablissement: 'Université de Douala',
  competencesCles: 'Community management, Canva, Rédaction web, SEO',
  langues: 'Français, Anglais', niveauLangue: 'Avance',
  outilsLogiciels: 'Hootsuite, Canva, Google Analytics, Meta Business Suite',
  typeContrat: 'CDI', notes: '',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-007 — Nkoulou Brandon
{
  civilite: 'M.', genre: 'Masculin', dateNaissance: '2001-06-30',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Mbankomo', ville: 'Mbankomo',
  diplome: 'CAP Réception', etablissement: 'CETIC de Yaoundé',
  competencesCles: '',
  langues: 'Français', niveauLangue: 'Debutant',
  outilsLogiciels: '',
  typeContrat: 'CDD', notes: 'Manque d\'expérience pour le poste',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-008 — Fomumbod Yvan
{
  civilite: 'M.', genre: 'Masculin', dateNaissance: '1989-12-12',
  nationalite: 'Camerounaise', situationFam: 'Marie(e)',
  adresse: 'Bonapriso, Douala', ville: 'Douala',
  diplome: 'Master Logistique',
  etablissement: 'Université de Douala',
  competencesCles: 'Gestion des stocks, Approvisionnement, Négociation, SAP',
  langues: 'Français, Anglais, Allemand', niveauLangue: 'Avance',
  outilsLogiciels: 'SAP MM, Excel, Power BI',
  typeContrat: 'CDI', notes: 'Fort profil logistique, 7 ans dans la brasserie',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-009 — Ateba Chantal
{
  civilite: 'Mme.', genre: 'Feminin', dateNaissance: '2000-08-14',
  nationalite: 'Camerounaise', situationFam: 'Celibataire',
  adresse: 'Tsinga, Yaoundé', ville: 'Yaoundé',
  diplome: '', etablissement: '',
  competencesCles: '',
  langues: 'Français', niveauLangue: 'Intermediaire',
  outilsLogiciels: '',
  typeContrat: 'CDD', notes: 'Première candidature',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},

// CAN-010 — Tchouante Rodrigue
{
  civilite: 'M.', genre: 'Masculin', dateNaissance: '1996-02-28',
  nationalite: 'Camerounaise', situationFam: 'Marie(e)',
  adresse: 'Nkoldongo, Yaoundé', ville: 'Yaoundé',
  diplome: 'BTS Audiovisuel',
  etablissement: 'ENST de Douala',
  competencesCles: 'Sonorisation, Éclairage, Montage vidéo, Projection',
  langues: 'Français', niveauLangue: 'Intermediaire',
  outilsLogiciels: 'Adobe Premiere, Final Cut Pro',
  typeContrat: 'CDD', notes: 'En réserve pour un futur besoin audiovisuel',
  contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '',
  dateEmbaucheDefinitive: '',
  certificatTravail: false, attestationCNPS: false, extraitCasier: false,
},
```

---

## CHECKLIST DE VALIDATION — COMPLÉMENT

### Partie A — Demandes.jsx
- [ ] 8 nouvelles colonnes ajoutées à DROITE des 11 existantes (total = 19)
- [ ] Les 11 colonnes existantes sont INTACTES (même ordre, même style)
- [ ] `Date Pourvue` affiche « — » si vide, date formatée sinon
- [ ] `Budget Salaire` et `Coût Recrutement` sont formatés en FCFA avec `toLocaleString('fr-FR')`
- [ ] `Rôle du Responsable` utilise les valeurs de `nomenclatures.role_responsable`
- [ ] `Cabinet / Agence` utilise les valeurs de `nomenclatures.cabinet_recrutement`
- [ ] `Notes` est tronqué à 40 caractères avec tooltip si plus long
- [ ] Les 10 données mock contiennent les 8 nouveaux champs chacune
- [ ] Les KPI cards, filtres, boutons, pagination n'ont PAS changé

### Partie B — Candidats.jsx
- [ ] 5 nouvelles colonnes ajoutées à DROITE du Score (total = 15)
- [ ] Les 10 colonnes existantes sont INTACTES
- [ ] La colonne `Actions` contient 2 IconButton (Visibility + Edit)
- [ ] **Le clic sur Visibility ouvre un Dialog** ← CRITIQUE
- [ ] Le Dialog contient **4 onglets** : Infos personnelles, Formation, Candidature, Documents
- [ ] **Onglet 1** : 12 champs (N°, Civilité, Genre, Nom, Prénom, Date naissance, Nationalité, Sit. familiale, Tél, Email, Adresse, Ville)
- [ ] **Onglet 2** : 9 champs (Niveau étude, Diplôme, Établissement, Années exp., Dernier employeur, Compétences, Langues, Niveau langue, Outils)
- [ ] **Onglet 3** : 7 champs (Poste visé, Source, Date candidature, Statut, Score, Type contrat, Notes)
- [ ] **Onglet 4** : 7 champs (Contrat, Date début essai, Date fin essai, Date embauche, 3 checkboxes)
- [ ] **Total fiche = 35 champs** (12+9+7+7)
- [ ] Les Select utilisent les nomenclatures correspondantes
- [ ] Les données mock contiennent tous les champs fiche pour les 10 candidats
- [ ] Boutons « Fermer » et « Modifier » en bas du Dialog
- [ ] Les KPI cards, filtres, boutons, pagination du tableau n'ont PAS changé

### Vérification croisée (identique au prompt initial)
- [ ] `App.jsx` NON modifié
- [ ] `Sidebar.jsx` NON modifié
- [ ] `Header.jsx` NON modifié
- [ ] `KPICard.jsx` NON modifié
- [ ] `nomenclatures.js` NON modifié
- [ ] Aucune des 24 autres pages JSX n'est modifiée

---

## RÉSUMÉ

| Composant | État actuel | À faire | Champs |
|---|---|---|---|
| Demandes.jsx | 11/19 colonnes | +8 colonnes à droite | +8 |
| Candidats.jsx tableau | 10/15 colonnes | +5 colonnes à droite | +5 |
| Candidats.jsx fiche Dialog | 0/35 champs | Créer Dialog 4 onglets | +35 |
| **TOTAL** | **21/54** | **48 champs à ajouter** | **48** |

**Résultat attendu après exécution** : 54/54 champs (100% sous-étape 1) → couverture globale passe à 200/279 (72%)
