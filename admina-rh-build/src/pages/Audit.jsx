import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
export default function Audit() {
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Audit</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Page fonctionnelle</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau</Button>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Col 1</TableCell><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Col 2</TableCell></TableRow></TableHead><TableBody><TableRow hover><TableCell>--</TableCell><TableCell>--</TableCell></TableRow></TableBody></Table></TableContainer><TablePagination component="div" count={0} page={0} onPageChange={() => {}} rowsPerPage={10} rowsPerPageOptions={[5, 10, 25]} /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Audit"
        fields={[{key: "utilisateur", label: "Utilisateur", required: true},{key: "action", label: "Action", type: "select", options: ["Cr\u00e9ation", "Modification", "Suppression", "Connexion", "Export"], required: true},{key: "module", label: "Module", required: true},{key: "details", label: "Détails", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "AUD-" + String(nid).padStart(3, '0'), ...{}, ...vals }]); }}
      />
    </Box>
  );
}
