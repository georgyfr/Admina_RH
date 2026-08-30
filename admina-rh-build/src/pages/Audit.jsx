import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';

const initialData = [
  { id: 1, numero: 'AUD-001', date: '28/02/2025 14:30', utilisateur: 'M. Nkoulou Paul', action: 'Création', module: 'Demandes', details: 'Création demande DR-2025-008' },
  { id: 2, numero: 'AUD-002', date: '27/02/2025 10:15', utilisateur: 'Mme. Fotso Marie', action: 'Modification', module: 'Entretiens', details: 'Modification entretien ENT-2025-004' },
  { id: 3, numero: 'AUD-003', date: '26/02/2025 16:45', utilisateur: 'M. Kamga Blaise', action: 'Connexion', module: 'Système', details: 'Connexion depuis 192.168.1.45' },
  { id: 4, numero: 'AUD-004', date: '25/02/2025 09:00', utilisateur: 'Mme. Mebara Nadège', action: 'Export', module: 'Candidats', details: 'Export CSV base candidats' },
  { id: 5, numero: 'AUD-005', date: '24/02/2025 11:30', utilisateur: 'M. Ngo Ndobo Alain', action: 'Création', module: 'Contrats', details: 'Création contrat CTR-2025-003' },
];

const actionColor = { 'Création': 'success', 'Modification': 'info', 'Suppression': 'error', 'Connexion': 'default', 'Export': 'warning' };

export default function Audit() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const cols = ['N°', 'Date & Heure', 'Utilisateur', 'Action', 'Module', 'Détails'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Journal d'Audit</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{data.length} entrée(s) d'audit</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouvelle entrée</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL ENTRÉES" valeur={data.length} sousTexte="entrées enregistrées" />
        <KPICard titre="CREATIONS" valeur={data.filter(d => d.action === 'Création').length} sousTexte="actions de création" />
        <KPICard titre="MODIFICATIONS" valeur={data.filter(d => d.action === 'Modification').length} sousTexte="actions de modification" />
        <KPICard titre="EXPORTS" valeur={data.filter(d => d.action === 'Export').length} sousTexte="actions d'export" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell>{row.date}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.utilisateur}</TableCell>
          <TableCell><Chip label={row.action} size="small" color={actionColor[row.action]} /></TableCell>
          <TableCell>{row.module}</TableCell>
          <TableCell>{row.details}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une entrée d'audit"
        fields={[
          {key: "utilisateur", label: "Utilisateur", required: true},
          {key: "action", label: "Action", type: "select", options: ["Création", "Modification", "Suppression", "Connexion", "Export"], required: true},
          {key: "module", label: "Module", required: true},
          {key: "details", label: "Détails", multiline: true},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; const now = new Date(); const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}); setData(prev => [...prev, { id: nid, numero: 'AUD-' + String(nid).padStart(3, '0'), date: dateStr, ...vals }]); }}
      />
    </Box>
  );
}
