import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'Retenu': 'success', 'Rejete': 'error', 'En attente': 'warning' };

const initialData = [
  { id:1, numero:'SEL-2025-001', candidat:'Nkoulou Brandon', poste:'Chef Cuisinier', departement:'Restauration', dateSelection:'25/02/2025', decideur:'Mme. Fotso Marie', statut:'Retenu', note:18, notes:'Profil exceptionnel, embauche recommandée' },
  { id:2, numero:'SEL-2025-002', candidat:'Mbarga Paul', poste:'Réceptionniste Nuit', departement:'Hébergement', dateSelection:'26/02/2025', decideur:'M. Nkoulou Paul', statut:'Retenu', note:16, notes:'Bonne présentation, expérience pertinente' },
  { id:3, numero:'SEL-2025-003', candidat:'Tabi Sandrine', poste:'Comptable Senior', departement:'Finance & Comptabilité', dateSelection:'27/02/2025', decideur:'M. Tchouankou Jean', statut:'Rejete', note:11, notes:'Profil insuffisant par rapport aux exigences' },
  { id:4, numero:'SEL-2025-004', candidat:'Eyenga Clarisse', poste:'Agent Accueil', departement:'Service Client', dateSelection:'01/03/2025', decideur:'Mme. Eyenga Clarisse', statut:'Retenu', note:17, notes:'Excellente communication' },
  { id:5, numero:'SEL-2025-005', candidat:'Ateba Chantal', poste:'Agent de Sécurité', departement:'Sécurité', dateSelection:'02/03/2025', decideur:'M. Nganou André', statut:'En attente', note:14, notes:'En attente vérification références' },
  { id:6, numero:'SEL-2025-006', candidat:'Fomumbod David', poste:'Développeur Full Stack', departement:'Informatique', dateSelection:'03/03/2025', decideur:'M. Kamga Blaise', statut:'En attente', note:15, notes:'Test technique en cours' },
  { id:7, numero:'SEL-2025-007', candidat:'Kamga Blaise', poste:'Community Manager', departement:'Marketing & Communication', dateSelection:'04/03/2025', decideur:'Mme. Mebara Nadège', statut:'Rejete', note:10, notes:'Manque de créativité' },
  { id:8, numero:'SEL-2025-008', candidat:'Ngo Ndobo Alain', poste:'Chef Approvisionnement', departement:'Logistique & Approvisionnement', dateSelection:'05/03/2025', decideur:'M. Nkoulou Paul', statut:'En attente', note:13, notes:'Entretien final prévu' },
  { id:9, numero:'SEL-2025-009', candidat:'Tchouante Ghislain', poste:'Technicien Audiovisuel', departement:'Audiovisuel', dateSelection:'06/03/2025', decideur:'M. Tabe Arnaud', statut:'En attente', note:12, notes:'Vérification diplôme en cours' },
  { id:10, numero:'SEL-2025-010', candidat:'Moukouri Patrice', poste:'Agent de Blanchisserie', departement:'Lingerie', dateSelection:'07/03/2025', decideur:'Mme. Ateba Chantal', statut:'Rejete', note:9, notes:'Expérience non conforme' },
];

export default function Selections() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalSel = data.length;
  const retenus = data.filter(d => d.statut === 'Retenu').length;
  const rejetes = data.filter(d => d.statut === 'Rejete').length;
  const enAttente = data.filter(d => d.statut === 'En attente').length;

  const cols = ['Candidat','Poste','Département','Date Sélection','Décideur','Statut','Note','Actions','N° Sélection','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Sélections</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Gestion des shortlists et décisions de recrutement</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle Sélection</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`${totalSel} Total`} sx={{ fontWeight: 'bold', px: 2, py: 1.5, fontSize: '0.9rem' }} />
        <Chip label={`${retenus} Retenus`} color="success" sx={{ fontWeight: 'bold', px: 2, py: 1.5, fontSize: '0.9rem' }} />
        <Chip label={`${rejetes} Rejetés`} color="error" sx={{ fontWeight: 'bold', px: 2, py: 1.5, fontSize: '0.9rem' }} />
        <Chip label={`${enAttente} En attente`} color="warning" sx={{ fontWeight: 'bold', px: 2, py: 1.5, fontSize: '0.9rem' }} />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateSelection}</TableCell>
          <TableCell>{row.decideur}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell align="center">{row.note}/20</TableCell>
          <TableCell><Button size="small" variant="outlined">Voir</Button></TableCell>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
