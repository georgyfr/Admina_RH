// FormationsCandidats page v2
import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem, Tooltip } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  { id:1, candidat:'Ndiaye Moussa', etablissement:'École Hôtelière de Douala', diplome:'Master Hôtellerie-Restauration', specialite:'Gastronomie & Management', dateDebut:'09/2012', dateFin:'06/2014', statut:'Obtenu' },
  { id:2, candidat:'Tchouankou Claire', etablissement:'Université de Douala', diplome:'Licence en Comptabilité', specialite:'Comptabilité & Finance', dateDebut:'09/2016', dateFin:'06/2019', statut:'Obtenu' },
  { id:3, candidat:'Nganou André', etablissement:'Lycée de Bafoussam', diplome:'BAC', specialite:'Sciences', dateDebut:'09/2010', dateFin:'06/2013', statut:'Obtenu' },
  { id:4, candidat:'Mebara Nadège', etablissement:'Université de Yaoundé II', diplome:'BTS Hôtellerie', specialite:'Accueil & Réception', dateDebut:'09/2018', dateFin:'06/2020', statut:'Obtenu' },
  { id:5, candidat:'Kamga Blaise', etablissement:'Université de Douala', diplome:'Licence Informatique', specialite:'Développement', dateDebut:'09/2015', dateFin:'06/2018', statut:'Obtenu' },
  { id:6, candidat:'Kamga Blaise', etablissement:'IFRI Yaoundé', diplome:'Master Informatique', specialite:'Ingénierie Logicielle', dateDebut:'09/2020', dateFin:'En cours', statut:'En cours' },
  { id:7, candidat:'Eyenga Clarisse', etablissement:'Université de Dschang', diplome:'Licence Communication', specialite:'Marketing Digital', dateDebut:'09/2019', dateFin:'06/2022', statut:'Obtenu' },
  { id:8, candidat:'Nkoulou Brandon', etablissement:'Lycée de Douala', diplome:'BAC', specialite:'Lettres', dateDebut:'09/2022', dateFin:'06/2025', statut:'En cours' },
];

const statutColor = { 'Obtenu': 'success', 'En cours': 'warning', 'Abandonné': 'error' };

export default function FormationsCandidats() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterCandidat, setFilterCandidat] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const candidats = useMemo(() => ['Tous', ...new Set(data.map(d => d.candidat))], [data]);
  const filtered = useMemo(() => data.filter(d => filterCandidat === 'Tous' || d.candidat === filterCandidat), [data, filterCandidat]);
  const obtenus = data.filter(d => d.statut === 'Obtenu').length;
  const enCours = data.filter(d => d.statut === 'En cours').length;

  const cols = ['N°', 'Candidat', 'Établissement', 'Diplôme', 'Spécialité', 'Date Début', 'Date Fin', 'Statut'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Formations des Candidats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} formation(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="FORMATIONS" valeur={data.length} sousTexte="enregistrée(s)" />
        <KPICard titre="OBTENUES" valeur={obtenus} sousTexte={`${Math.round(obtenus / Math.max(data.length, 1) * 100)}%`}/>
        <KPICard titre="EN COURS" valeur={enCours} sousTexte="en cours de suivi" />
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
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{'FC-' + String(idx + 1).padStart(3, '0')}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell>{row.etablissement}</TableCell>
          <TableCell>{row.diplome}</TableCell>
          <TableCell><Typography variant="body2" color="text.secondary">{row.specialite}</Typography></TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin || 'En cours'}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Formation"
        fields={[
          {key: 'candidat', label: 'Candidat', required: true},
          {key: 'etablissement', label: 'Établissement', required: true},
          {key: 'diplome', label: 'Diplôme', required: true},
          {key: 'specialite', label: 'Spécialité'},
          {key: 'dateDebut', label: 'Date Début', required: true},
          {key: 'dateFin', label: 'Date Fin'},
          {key: 'statut', label: 'Statut', type: 'select', options: ['Obtenu', 'En cours', 'Abandonné']},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, ...vals }]); }}
      />
    </Box>
  );
}
