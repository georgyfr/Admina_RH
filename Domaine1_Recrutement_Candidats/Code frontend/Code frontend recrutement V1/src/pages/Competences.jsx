import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';

const initialData = [
  { id:1, candidat:'Ndiaye Moussa', competence:'Gastronomie française', niveau:'Expert', anneesExperience:10, categorie:'Métier' },
  { id:2, candidat:'Ndiaye Moussa', competence:'Management d\'équipe', niveau:'Avance', anneesExperience:8, categorie:'Management' },
  { id:3, candidat:'Ndiaye Moussa', competence:'HACCP / Hygiène', niveau:'Expert', anneesExperience:9, categorie:'Certification' },
  { id:4, candidat:'Tchouankou Claire', competence:'Comptabilité générale', niveau:'Avance', anneesExperience:5, categorie:'Métier' },
  { id:5, candidat:'Tchouankou Claire', competence:'Sage Comptabilité', niveau:'Avance', anneesExperience:4, categorie:'Logiciel' },
  { id:6, candidat:'Tchouankou Claire', competence:'Fiscalité camerounaise', niveau:'Intermediaire', anneesExperience:3, categorie:'Métier' },
  { id:7, candidat:'Kamga Blaise', competence:'React / JavaScript', niveau:'Avance', anneesExperience:4, categorie:'Technique' },
  { id:8, candidat:'Kamga Blaise', competence:'Node.js / Express', niveau:'Avance', anneesExperience:3, categorie:'Technique' },
  { id:9, candidat:'Kamga Blaise', competence:'DevOps / CI-CD', niveau:'Intermediaire', anneesExperience:2, categorie:'Technique' },
  { id:10, candidat:'Mebara Nadège', competence:'Accueil client', niveau:'Avance', anneesExperience:4, categorie:'Métier' },
  { id:11, candidat:'Mebara Nadège', competence:'Réservation (PMS)', niveau:'Intermediaire', anneesExperience:2, categorie:'Logiciel' },
  { id:12, candidat:'Eyenga Clarisse', competence:'Community Management', niveau:'Avance', anneesExperience:2, categorie:'Métier' },
  { id:13, candidat:'Eyenga Clarisse', competence:'Photoshop / Canva', niveau:'Intermediaire', anneesExperience:3, categorie:'Créatif' },
  { id:14, candidat:'Eyenga Clarisse', competence:'Publicité digitale', niveau:'Debutant', anneesExperience:1, categorie:'Marketing' },
];

const niveauColor = { 'Debutant': 'default', 'Intermediaire': 'info', 'Avance': 'warning', 'Expert': 'success' };

export default function Competences() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterCandidat, setFilterCandidat] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const candidats = useMemo(() => ['Tous', ...new Set(data.map(d => d.candidat))], [data]);
  const filtered = useMemo(() => data.filter(d => filterCandidat === 'Tous' || d.candidat === filterCandidat), [data, filterCandidat]);
  const experts = data.filter(d => d.niveau === 'Expert').length;
  const categories = [...new Set(data.map(d => d.categorie))];

  const cols = ['N°', 'Candidat', 'Compétence', 'Niveau', 'Catégorie', 'Années Exp.', 'Évaluation'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Compétences des Candidats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} compétence(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="COMPÉTENCES" valeur={data.length} sousTexte="enregistrée(s)" />
        <KPICard titre="EXPERTS" valeur={experts} sousTexte="niveau expert" />
        <KPICard titre="CANDIDATS" valeur={new Set(data.map(d => d.candidat)).size} sousTexte="candidat(s) évalué(s)" />
        <KPICard titre="CATÉGORIES" valeur={categories.length} sousTexte="catégorie(s) distincte(s)" />
      </Box>
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={filterCandidat} onChange={e => { setFilterCandidat(e.target.value); setPage(0); }}>
            {candidats.map(c => <MenuItem key={c} value={c}>{c === 'Tous' ? 'Tous les candidats' : c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map((row, idx) => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{'COMP-' + String(idx + 1).padStart(3, '0')}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell>{row.competence}</TableCell>
          <TableCell><Chip label={row.niveau} size="small" color={niveauColor[row.niveau]} /></TableCell>
          <TableCell><Chip label={row.categorie} size="small" variant="outlined" /></TableCell>
          <TableCell align="center">{row.anneesExperience}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 6, bgcolor: '#e0e0e0', borderRadius: 3, maxWidth: 80 }}>
                <Box sx={{ height: '100%', bgcolor: row.niveau === 'Expert' ? '#4caf50' : row.niveau === 'Avance' ? '#ff9800' : row.niveau === 'Intermediaire' ? '#2196f3' : '#9e9e9e', borderRadius: 3, width: `${Math.min(row.anneesExperience * 10, 100)}%` }} />
              </Box>
              <Typography variant="caption" color="text.secondary">{row.anneesExperience}a</Typography>
            </Box>
          </TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Compétence"
        fields={[
          {key: 'candidat', label: 'Candidat', required: true},
          {key: 'competence', label: 'Compétence', required: true},
          {key: 'niveau', label: 'Niveau', type: 'select', options: ['Debutant', 'Intermediaire', 'Avance', 'Expert'], required: true},
          {key: 'anneesExperience', label: "Années d'expérience", type: 'number'},
          {key: 'categorie', label: 'Catégorie', type: 'select', options: ['Métier', 'Technique', 'Management', 'Logiciel', 'Certification', 'Créatif', 'Marketing', 'Langue']},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, ...vals }]); }}
      />
    </Box>
  );
}
