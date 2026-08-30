import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialData = [
  { id:1, numero:'ROI-001', source:'Site web entreprise', nbCandidats:32, nbEmbauches:3, coutTotal:50000, coutParCandidat:1563, coutParEmbauche:16667, delaiMoyen:25, tauxRetention:85, satisfaction:'Satisfait', annee:'2025' },
  { id:2, numero:'ROI-002', source:'Référence interne', nbCandidats:28, nbEmbauches:4, coutTotal:0, coutParCandidat:0, coutParEmbauche:0, delaiMoyen:18, tauxRetention:100, satisfaction:'Tres satisfait', annee:'2025' },
  { id:3, numero:'ROI-003', source:'LinkedIn', nbCandidats:25, nbEmbauches:2, coutTotal:180000, coutParCandidat:7200, coutParEmbauche:90000, delaiMoyen:35, tauxRetention:90, satisfaction:'Satisfait', annee:'2025' },
  { id:4, numero:'ROI-004', source:'Indeed', nbCandidats:18, nbEmbauches:1, coutTotal:120000, coutParCandidat:6667, coutParEmbauche:120000, delaiMoyen:30, tauxRetention:75, satisfaction:'Neutre', annee:'2025' },
  { id:5, numero:'ROI-005', source:'Cabinet de recrutement', nbCandidats:22, nbEmbauches:3, coutTotal:450000, coutParCandidat:20455, coutParEmbauche:150000, delaiMoyen:40, tauxRetention:95, satisfaction:'Satisfait', annee:'2025' },
  { id:6, numero:'ROI-006', source:'Candidature spontanée', nbCandidats:15, nbEmbauches:1, coutTotal:0, coutParCandidat:0, coutParEmbauche:0, delaiMoyen:22, tauxRetention:80, satisfaction:'Neutre', annee:'2025' },
];

const satisfactionColor = { 'Tres satisfait': 'success', 'Satisfait': 'info', 'Neutre': 'default', 'Insatisfait': 'warning', 'Tres insatisfait': 'error' };

export default function SourcesROI() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterAnnee, setFilterAnnee] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const filtered = useMemo(() => data.filter(d => filterAnnee === 'Tous' || d.annee === filterAnnee), [data, filterAnnee]);
  const totalCout = useMemo(() => filtered.reduce((s, d) => s + (d.coutTotal || 0), 0), [filtered]);
  const totalEmbauches = useMemo(() => filtered.reduce((s, d) => s + (d.nbEmbauches || 0), 0), [filtered]);

  const cols = ['N°', 'Source', 'Nb Candidats', 'Nb Embauches', 'Coût Total (FCFA)', 'Coût/Candidat (FCFA)', 'Coût/Embauche (FCFA)', 'Délai Moyen (j)', 'Taux Rétention (%)', 'Satisfaction', 'Année'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Sources & ROI</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Analyse du retour sur investissement par source</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="COÛT TOTAL" valeur={formatFCFA(totalCout)} sousTexte="toutes sources" />
        <KPICard titre="EMBAUCHES" valeur={totalEmbauches} sousTexte="recrutements réalisés" />
        <KPICard titre="COÛT/EMBAUCHE" valeur={formatFCFA(totalEmbauches > 0 ? Math.round(totalCout / totalEmbauches) : 0)} sousTexte="coût moyen par embauche" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={filterAnnee} onChange={e => { setFilterAnnee(e.target.value); setPage(0); }}>
            <MenuItem value="Tous">Toutes les années</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.source}</TableCell>
          <TableCell align="center">{row.nbCandidats}</TableCell>
          <TableCell align="center">{row.nbEmbauches}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutTotal)}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutParCandidat)}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutParEmbauche)}</TableCell>
          <TableCell align="center">{row.delaiMoyen}</TableCell>
          <TableCell align="center"><Chip label={`${row.tauxRetention}%`} size="small" color={row.tauxRetention >= 90 ? 'success' : row.tauxRetention >= 75 ? 'warning' : 'error'} /></TableCell>
          <TableCell><Chip label={row.satisfaction} size="small" color={satisfactionColor[row.satisfaction]} /></TableCell>
          <TableCell>{row.annee}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Source ROI"
        fields={[
          {key: "source", label: "Source", required: true},
          {key: "nbCandidats", label: "Nb Candidats", type: "number"},
          {key: "nbEmbauches", label: "Nb Embauches", type: "number"},
          {key: "coutTotal", label: "Coût Total (FCFA)", type: "number"},
          {key: "delaiMoyen", label: "Délai Moyen (jours)", type: "number"},
          {key: "tauxRetention", label: "Taux Rétention (%)", type: "number"},
          {key: "satisfaction", label: "Satisfaction", type: "select", options: nomenclatures.satisfaction},
          {key: "annee", label: "Année"},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; const nbC = vals.nbCandidats || 0; const nbE = vals.nbEmbauches || 0; const ct = vals.coutTotal || 0; setData(prev => [...prev, { id: nid, numero: 'ROI-' + String(nid).padStart(3, '0'), coutParCandidat: nbC > 0 ? Math.round(ct / nbC) : 0, coutParEmbauche: nbE > 0 ? Math.round(ct / nbE) : 0, ...vals }]); }}
      />
    </Box>
  );
}
