import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';

const initialData = [
  { id:1, statut:'En attente', description:'Demande soumise, en attente de validation', couleur:'#9E9E9E', ordre:1 },
  { id:2, statut:'Validée', description:'Demande validée par le responsable hiérarchique', couleur:'#2196F3', ordre:2 },
  { id:3, statut:'En cours', description:'Processus de recrutement en cours', couleur:'#FF9800', ordre:3 },
  { id:4, statut:'Pourvue', description:'Poste pourvu, candidat retenu', couleur:'#4CAF50', ordre:4 },
  { id:5, statut:'Annulee', description:'Demande annulée', couleur:'#F44336', ordre:5 },
  { id:6, statut:'Brouillon', description:'Demande en cours de rédaction', couleur:'#607D8B', ordre:0 },
  { id:7, statut:'Publiée', description:'Offre publiée sur les canaux de diffusion', couleur:'#00BCD4', ordre:3 },
  { id:8, statut:'Clôturée', description:'Processus terminé, dossier clôturé', couleur:'#795548', ordre:6 },
];

export default function Statuts() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const cols = ['Statut', 'Description', 'Couleur', 'Ordre'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Gestion des Statuts</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{data.length} statut(s) défini(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau statut</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="STATUTS ACTIFS" valeur={data.length} sousTexte="statut(s) configuré(s)" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}><Chip label={row.statut} size="small" sx={{ bgcolor: row.couleur, color: '#fff' }} /></TableCell>
          <TableCell>{row.description}</TableCell>
          <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 16, height: 16, bgcolor: row.couleur, borderRadius: '4px', border: '1px solid #e0e0e0' }} /><Typography variant="body2" color="text.secondary">{row.couleur}</Typography></Box></TableCell>
          <TableCell align="center">{row.ordre}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Nouveau Statut"
        fields={[
          {key: "statut", label: "Nom du statut", required: true},
          {key: "description", label: "Description", required: true, multiline: true},
          {key: "couleur", label: "Couleur (hex)"},
          {key: "ordre", label: "Ordre d'affichage", type: "number"},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, couleur: vals.couleur || '#9E9E9E', ordre: vals.ordre || 0, ...vals }]); }}
      />
    </Box>
  );
}