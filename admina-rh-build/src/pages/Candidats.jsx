import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { Add, Download, Visibility, Edit } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = (statut) => {
  switch (statut) {
    case 'Retenu':
      return 'success';
    case 'Refuse':
      return 'error';
    case 'Entretien planifie':
      return 'warning';
    case 'En cours d\'etude':
      return 'info';
    case 'Entretien realise':
      return 'secondary';
    case 'Nouveau':
      return 'default';
    case 'En reserve':
      return 'default';
    default:
      return 'default';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatDateReverse = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const initialCandidates = [
  {
    id: 'CAN-001',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Ndiaye',
    prenom: 'Moussa',
    dateNaissance: '1988-03-15',
    nationalite: 'Camerounaise',
    situationFam: 'Marie(e)',
    telephone: '+237 699 123 456',
    email: 'ndiaye.m@email.com',
    adresse: 'Quartier Nlongkak Yaoundé',
    ville: 'Yaoundé',
    niveauEtude: 'Master',
    diplome: 'Master Hotellerie-Restauration',
    etablissement: 'Univ Douala',
    anneesExp: 8,
    dernierEmployeur: 'Hôtel Sawa',
    competencesCles: 'Gastronomie/Management/HACCP',
    langues: 'Français Anglais',
    niveauLangue: 'Bilingue',
    outilsLogiciels: 'Excel Word Sage',
    posteVise: 'Chef Cuisinier',
    sourceCandidature: 'Cabinet de recrutement',
    dateCandidature: '2025-01-10',
    statut: 'Retenu',
    score: 17.5,
    typeContrat: 'CDI',
    notes: 'candidat très motivé',
    contratTelechargeable: 'Contrat_CAN-001.pdf',
    dateDebutEssai: '2025-04-01',
    dateFinEssai: '2025-06-30',
    dateEmbaucheDefinitive: '2025-07-01',
    certificatTravail: true,
    attestationCNPS: true,
    extraitCasierJudiciaire: true,
  },
  {
    id: 'CAN-002',
    civilite: 'Mme',
    genre: 'Feminin',
    nom: 'Tchouankou',
    prenom: 'Claire',
    dateNaissance: '1992-07-22',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 677 234 567',
    email: 'tchouankou.c@email.com',
    adresse: 'Bastos Yaoundé',
    ville: 'Yaoundé',
    niveauEtude: 'Licence',
    diplome: 'Licence Comptabilité',
    etablissement: 'Univ Yaoundé II',
    anneesExp: 3,
    dernierEmployeur: '',
    competencesCles: 'Comptabilité/Paie/Sage',
    langues: 'Français Anglais',
    niveauLangue: 'Avance',
    outilsLogiciels: 'Sage 100 Excel',
    posteVise: 'Comptable Senior',
    sourceCandidature: 'Ecole/Universite',
    dateCandidature: '2025-01-15',
    statut: 'Entretien realise',
    score: 14.0,
    typeContrat: 'CDI',
    notes: 'profil solide',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-003',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Nganou',
    prenom: 'André',
    dateNaissance: '1998-11-05',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 690 345 678',
    email: 'nganou.a@email.com',
    adresse: '',
    ville: 'Kribi',
    niveauEtude: 'BTS/DUT',
    diplome: 'BTS Securité',
    etablissement: 'ENST Douala',
    anneesExp: 2,
    dernierEmployeur: '',
    competencesCles: 'Surveillance/Premiers secours',
    langues: 'Français',
    niveauLangue: 'Intermediaire',
    outilsLogiciels: '',
    posteVise: 'Agent de Securite',
    sourceCandidature: 'Candidature spontanee',
    dateCandidature: '2025-01-20',
    statut: "En cours d'etude",
    score: 0,
    typeContrat: 'CDD',
    notes: '',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-004',
    civilite: 'Mme',
    genre: 'Feminin',
    nom: 'Eyenga',
    prenom: 'Clarisse',
    dateNaissance: '1995-04-18',
    nationalite: 'Camerounaise',
    situationFam: 'Marie(e)',
    telephone: '+237 695 456 789',
    email: 'eyenga.c@email.com',
    adresse: 'Mvog-Ada Yaoundé',
    ville: 'Yaoundé',
    niveauEtude: 'BTS/DUT',
    diplome: 'BTS Hotellerie',
    etablissement: 'IST Yaoundé',
    anneesExp: 4,
    dernierEmployeur: 'Hôtel Mont Fébé',
    competencesCles: 'Accueil/Reservation/Anglais',
    langues: 'Français Anglais Espagnol',
    niveauLangue: 'Avance',
    outilsLogiciels: 'Opera PMS Excel',
    posteVise: 'Agent Accueil',
    sourceCandidature: 'Site web entreprise',
    dateCandidature: '2025-02-05',
    statut: 'Retenu',
    score: 16.0,
    typeContrat: 'CDD',
    notes: 'bonne présentation',
    contratTelechargeable: 'Contrat_CAN-004.pdf',
    dateDebutEssai: '2025-03-15',
    dateFinEssai: '2025-05-15',
    dateEmbaucheDefinitive: '',
    certificatTravail: true,
    attestationCNPS: true,
    extraitCasierJudiciaire: true,
  },
  {
    id: 'CAN-005',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Kamga',
    prenom: 'Blaise',
    dateNaissance: '1994-09-10',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 677 567 890',
    email: 'kamga.b@email.com',
    adresse: 'Makepe Douala',
    ville: 'Douala',
    niveauEtude: 'Master',
    diplome: 'Master Info',
    etablissement: 'Univ Yaoundé I',
    anneesExp: 5,
    dernierEmployeur: '',
    competencesCles: 'React Node PostgreSQL Docker Git AWS',
    langues: 'Français Anglais',
    niveauLangue: 'Bilingue',
    outilsLogiciels: 'VS Code GitHub Jira',
    posteVise: 'Développeur Full Stack',
    sourceCandidature: 'LinkedIn',
    dateCandidature: '2025-02-10',
    statut: "En cours d'etude",
    score: 0,
    typeContrat: 'CDI',
    notes: 'full stack 5 ans',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-006',
    civilite: 'Mme',
    genre: 'Feminin',
    nom: 'Mebara',
    prenom: 'Nadege',
    dateNaissance: '1997-01-25',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 699 678 901',
    email: 'mebara.n@email.com',
    adresse: 'Briqueterie Douala',
    ville: 'Douala',
    niveauEtude: 'Licence',
    diplome: 'Licence Marketing',
    etablissement: 'Univ Douala',
    anneesExp: 2,
    dernierEmployeur: '',
    competencesCles: 'Community management/Canva/SEO',
    langues: 'Français Anglais',
    niveauLangue: 'Avance',
    outilsLogiciels: 'Hootsuite Canva Analytics',
    posteVise: 'Community Manager',
    sourceCandidature: 'Reseaux sociaux',
    dateCandidature: '2025-02-15',
    statut: 'Entretien planifie',
    score: 0,
    typeContrat: 'CDI',
    notes: '',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-007',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Nkoulou',
    prenom: 'Brandon',
    dateNaissance: '2001-06-30',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 690 789 012',
    email: 'nkoulou.b@email.com',
    adresse: 'Mbankomo',
    ville: 'Mbankomo',
    niveauEtude: 'CAP/BEP',
    diplome: 'CAP Reception',
    etablissement: 'CETIC Yaoundé',
    anneesExp: 1,
    dernierEmployeur: '',
    competencesCles: '',
    langues: 'Français',
    niveauLangue: 'Debutant',
    outilsLogiciels: '',
    posteVise: 'Receptionniste Nuit',
    sourceCandidature: 'Cooptation',
    dateCandidature: '2025-02-20',
    statut: 'Refuse',
    score: 8.5,
    typeContrat: 'CDD',
    notes: "manque d'expérience",
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-008',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Fomumbod',
    prenom: 'Yvan',
    dateNaissance: '1989-12-12',
    nationalite: 'Camerounaise',
    situationFam: 'Marie(e)',
    telephone: '+237 677 890 123',
    email: 'fomumbod.y@email.com',
    adresse: 'Bonapriso Douala',
    ville: 'Douala',
    niveauEtude: 'Master',
    diplome: 'Master Logistique',
    etablissement: 'Univ Douala',
    anneesExp: 7,
    dernierEmployeur: 'SCB',
    competencesCles: "Stocks/Approvisionnement/Négociation/SAP",
    langues: 'Français Anglais Allemand',
    niveauLangue: 'Avance',
    outilsLogiciels: 'SAP MM Excel Power BI',
    posteVise: 'Chef Approvisionnement',
    sourceCandidature: 'Cabinet de recrutement',
    dateCandidature: '2025-03-01',
    statut: "En cours d'etude",
    score: 0,
    typeContrat: 'CDI',
    notes: '7 ans brasserie',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-009',
    civilite: 'Mme',
    genre: 'Feminin',
    nom: 'Ateba',
    prenom: 'Chantal',
    dateNaissance: '2000-08-14',
    nationalite: 'Camerounaise',
    situationFam: 'Celibataire',
    telephone: '+237 695 901 234',
    email: 'ateba.c@email.com',
    adresse: 'Tsinga Yaoundé',
    ville: 'Yaoundé',
    niveauEtude: 'Sans diplome',
    diplome: '',
    etablissement: '',
    anneesExp: 0,
    dernierEmployeur: '',
    competencesCles: '',
    langues: 'Français',
    niveauLangue: 'Intermediaire',
    outilsLogiciels: '',
    posteVise: 'Agent de Blanchisserie',
    sourceCandidature: 'Candidature spontanee',
    dateCandidature: '2025-03-05',
    statut: 'Nouveau',
    score: 0,
    typeContrat: 'CDD',
    notes: 'première candidature',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
  {
    id: 'CAN-010',
    civilite: 'M.',
    genre: 'Masculin',
    nom: 'Tchouante',
    prenom: 'Rodrigue',
    dateNaissance: '1996-02-28',
    nationalite: 'Camerounaise',
    situationFam: 'Marie(e)',
    telephone: '+237 690 012 345',
    email: 'tchouante.r@email.com',
    adresse: 'Nkoldongo Yaoundé',
    ville: 'Yaoundé',
    niveauEtude: 'BTS/DUT',
    diplome: 'BTS Audiovisuel',
    etablissement: 'ENST Douala',
    anneesExp: 3,
    dernierEmployeur: 'Hôtel Sawa',
    competencesCles: 'Sonorisation/Eclairage/Montage',
    langues: 'Français',
    niveauLangue: 'Intermediaire',
    outilsLogiciels: 'Premiere Final Cut',
    posteVise: 'Technicien Audiovisuel',
    sourceCandidature: 'Salon emploi',
    dateCandidature: '2025-03-10',
    statut: 'En reserve',
    score: 11.0,
    typeContrat: 'CDD',
    notes: 'en réserve',
    contratTelechargeable: '',
    dateDebutEssai: '',
    dateFinEssai: '',
    dateEmbaucheDefinitive: '',
    certificatTravail: false,
    attestationCNPS: false,
    extraitCasierJudiciaire: false,
  },
];

export default function Candidats() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const filteredData = useMemo(() => {
    return candidates.filter((c) => {
      const matchStatut = filterStatut ? c.statut === filterStatut : true;
      const matchSource = filterSource ? c.sourceCandidature === filterSource : true;
      const matchNiveau = filterNiveau ? c.niveauEtude === filterNiveau : true;
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        c.id.toLowerCase().includes(query) ||
        c.nom.toLowerCase().includes(query) ||
        c.prenom.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.posteVise.toLowerCase().includes(query) ||
        c.telephone.includes(query);
      return matchStatut && matchSource && matchNiveau && matchSearch;
    });
  }, [candidates, filterStatut, filterSource, filterNiveau, searchQuery]);

  const totalCandidates = candidates.length;
  const retenusCount = candidates.filter((c) => c.statut === 'Retenu').length;
  const enCoursCount = candidates.filter(
    (c) =>
      c.statut === "En cours d'etude" || c.statut === 'Entretien planifie'
  ).length;
  const scoredCandidates = candidates.filter((c) => c.score > 0);
  const scoreMoyen =
    scoredCandidates.length > 0
      ? (
          scoredCandidates.reduce((sum, c) => sum + c.score, 0) /
          scoredCandidates.length
        ).toFixed(1)
      : '0.0';

  const handleExportCSV = () => {
    const headers = [
      'N° Candidat',
      'Civilité',
      'Nom',
      'Prénom',
      'Téléphone',
      'Email',
      'Poste Visé',
      'Source Candidature',
      'Statut',
      'Score /20',
      'Niveau Étude',
      'Années Exp.',
      'Dernier Employeur',
      'Date Candidature',
    ];
    const rows = filteredData.map((c) => [
      c.id,
      c.civilite,
      c.nom,
      c.prenom,
      c.telephone,
      c.email,
      c.posteVise,
      c.sourceCandidature,
      c.statut,
      c.score || '',
      c.niveauEtude,
      c.anneesExp,
      c.dernierEmployeur,
      formatDate(c.dateCandidature),
    ]);
    const csvContent =
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'candidats_export.csv';
    link.click();
  };

  const handleOpenFiche = (candidate) => {
    setSelectedCandidate(candidate);
    setActiveTab(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Base de Données Candidats
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <KPICard titre="Total Candidats" valeur={totalCandidates} sousTexte="candidats inscrits" />
        <KPICard titre="Retenus" valeur={retenusCount} sousTexte="candidats retenus" />
        <KPICard titre="En Cours" valeur={enCoursCount} sousTexte="en étude / planifiés" />
        <KPICard titre="Score Moyen" valeur={`${scoreMoyen} /20`} sousTexte="sur candidats évalués" />
      </Box>

      {/* Filters & Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email, poste..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 260, flex: '1 1 260px' }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              displayEmpty
              value={filterStatut}
              onChange={(e) => {
                setFilterStatut(e.target.value);
                setPage(0);
              }}
              renderValue={(val) => (val ? val : 'Tous les statuts')}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              {nomenclatures.statut_candidat.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              displayEmpty
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setPage(0);
              }}
              renderValue={(val) => (val ? val : 'Toutes les sources')}
            >
              <MenuItem value="">Toutes les sources</MenuItem>
              {nomenclatures.source.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              displayEmpty
              value={filterNiveau}
              onChange={(e) => {
                setFilterNiveau(e.target.value);
                setPage(0);
              }}
              renderValue={(val) => (val ? val : 'Tous les niveaux')}
            >
              <MenuItem value="">Tous les niveaux</MenuItem>
              {nomenclatures.niveau_etude.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
            size="small"
          >
            Exporter CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
          >
            Nouveau Candidat
          </Button>
        </Box>
      </Paper>

      {/* Counter */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {filteredData.length} candidat(s) inscrit(s)
      </Typography>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 110 }}>N° Candidat</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 70 }}>Civilité</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Téléphone</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 190 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 170 }}>Poste Visé</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 170 }}>Source Candidature</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 90 }} align="center">
                Score /20
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Niveau Étude</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }} align="center">
                Années Exp.
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Dernier Employeur</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Date Candidature</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Aucun candidat trouvé.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.civilite}</TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.posteVise}</TableCell>
                  <TableCell>
                    <Chip label={c.sourceCandidature} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.statut}
                      color={statutColor(c.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {c.score === 0 ? (
                      <Typography color="text.disabled">—</Typography>
                    ) : (
                      <Typography
                        fontWeight={c.score >= 12 ? 'bold' : 'normal'}
                        color={c.score < 10 ? 'error' : 'text.primary'}
                      >
                        {c.score}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{c.niveauEtude}</TableCell>
                  <TableCell align="center">{c.anneesExp}</TableCell>
                  <TableCell>{c.dernierEmployeur || '—'}</TableCell>
                  <TableCell>{formatDate(c.dateCandidature)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir la fiche">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenFiche(c)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" color="secondary">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      </TableContainer>

      {/* Fiche Candidat Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Fiche Candidat — {selectedCandidate.id}
            </DialogTitle>
            <DialogContent dividers>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                <Tab label="Informations Personnelles" />
                <Tab label="Formation & Compétences" />
                <Tab label="Candidature" />
                <Tab label="Documents & Contrat" />
              </Tabs>

              {/* Tab 1 - Informations Personnelles */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="N° Candidat"
                      size="small"
                      fullWidth
                      value={selectedCandidate.id}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Civilité
                      </Typography>
                      <Select value={selectedCandidate.civilite}>
                        {nomenclatures.civilite.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Genre
                      </Typography>
                      <Select value={selectedCandidate.genre}>
                        {nomenclatures.genre.map((g) => (
                          <MenuItem key={g} value={g}>
                            {g}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Nom"
                      size="small"
                      fullWidth
                      value={selectedCandidate.nom}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Prénom"
                      size="small"
                      fullWidth
                      value={selectedCandidate.prenom}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date de Naissance"
                      size="small"
                      fullWidth
                      type="date"
                      value={selectedCandidate.dateNaissance}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Nationalité"
                      size="small"
                      fullWidth
                      value={selectedCandidate.nationalite}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Situation Familiale
                      </Typography>
                      <Select value={selectedCandidate.situationFam}>
                        {nomenclatures.situation_fam.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Téléphone"
                      size="small"
                      fullWidth
                      value={selectedCandidate.telephone}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Email"
                      size="small"
                      fullWidth
                      value={selectedCandidate.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Adresse"
                      size="small"
                      fullWidth
                      value={selectedCandidate.adresse}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Ville"
                      size="small"
                      fullWidth
                      value={selectedCandidate.ville}
                      disabled
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 2 - Formation & Compétences */}
              {activeTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Niveau Étude
                      </Typography>
                      <Select value={selectedCandidate.niveauEtude}>
                        {nomenclatures.niveau_etude.map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Diplôme"
                      size="small"
                      fullWidth
                      value={selectedCandidate.diplome}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Établissement"
                      size="small"
                      fullWidth
                      value={selectedCandidate.etablissement}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Années Exp."
                      size="small"
                      fullWidth
                      type="number"
                      value={selectedCandidate.anneesExp}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Dernier Employeur"
                      size="small"
                      fullWidth
                      value={selectedCandidate.dernierEmployeur}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Langues
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={selectedCandidate.langues}
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Compétences Clés"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      value={selectedCandidate.competencesCles}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Niveau Langue
                      </Typography>
                      <Select value={selectedCandidate.niveauLangue}>
                        {nomenclatures.niveau_langue.map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Outils / Logiciels"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      value={selectedCandidate.outilsLogiciels}
                      disabled
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 3 - Candidature */}
              {activeTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Poste Visé"
                      size="small"
                      fullWidth
                      value={selectedCandidate.posteVise}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Source Candidature
                      </Typography>
                      <Select value={selectedCandidate.sourceCandidature}>
                        {nomenclatures.source.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date Candidature"
                      size="small"
                      fullWidth
                      type="date"
                      value={selectedCandidate.dateCandidature}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Statut
                      </Typography>
                      <Select value={selectedCandidate.statut}>
                        {nomenclatures.statut_candidat.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Score /20"
                      size="small"
                      fullWidth
                      type="number"
                      value={selectedCandidate.score}
                      disabled
                      inputProps={{ step: 0.5, min: 0, max: 20 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl size="small" fullWidth disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Type Contrat
                      </Typography>
                      <Select value={selectedCandidate.typeContrat}>
                        {nomenclatures.type_contrat.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Notes"
                      size="small"
                      fullWidth
                      multiline
                      minRows={3}
                      value={selectedCandidate.notes}
                      disabled
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 4 - Documents & Contrat */}
              {activeTab === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Contrat Téléchargeable"
                      size="small"
                      fullWidth
                      value={selectedCandidate.contratTelechargeable || 'Non fourni'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date Début Essai"
                      size="small"
                      fullWidth
                      type="date"
                      value={selectedCandidate.dateDebutEssai}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date Fin Essai"
                      size="small"
                      fullWidth
                      type="date"
                      value={selectedCandidate.dateFinEssai}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date Embauche Définitive"
                      size="small"
                      fullWidth
                      type="date"
                      value={selectedCandidate.dateEmbaucheDefinitive}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} />
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCandidate.certificatTravail}
                          disabled
                        />
                      }
                      label="Certificat de Travail"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCandidate.attestationCNPS}
                          disabled
                        />
                      }
                      label="Attestation CNPS"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCandidate.extraitCasierJudiciaire}
                          disabled
                        />
                      }
                      label="Extrait de Casier Judiciaire"
                    />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleCloseDialog} variant="outlined" size="small">
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}