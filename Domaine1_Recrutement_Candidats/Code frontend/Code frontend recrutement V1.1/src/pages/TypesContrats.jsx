// TypesContrats page v2
import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  { id:1, type:'CDI', description:'Contrat à Durée Indéterminée', dureeMax:'Indéterminée', rupturePossible:'Oui', avantages:'Préavis 3 mois, congés payés, CNPS', nbContrats:12 },
  { id:2, type:'CDD', description:'Contrat à Durée Déterminée', dureeMax:'24 mois', rupturePossible:'Non', avantages:'Préavis 1 mois, CNPS, prime de précarité 10%', nbContrats:8 },
  { id:3, type:'Stage', description:'Convention de stage', dureeMax:'6 mois', rupturePossible:'Oui', avantages:'Indemnité de stage, pas de CNPS', nbContrats:5 },
  { id:4, type:'Interim', description:'Contrat de travail temporaire', dureeMax:'18 mois', rupturePossible:'Oui', avantages:'Majoration de 10%, prime de reprise', nbContrats:3 },
  { id:5, type:'Alternance', description:'Contrat d\'alternance ou apprentissage', dureeMax:'36 mois', rupturePossible:'Non', avantages:'Exonération charges partielles, tutorat', nbContrats:2 },
  { id:6, type:'Freelance', description:'Prestation de services', dureeMax:'Selon mission', rupturePossible:'Oui', avantages:'Facturation libre, pas de charges patronales', nbContrats:1 },
];

export default function TypesContrats() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalContrats = useMemo(() => data.reduce((s, d) => s + (d.nbContrats || 0), 0), [data]);

  const cols = ['Type de Contrat', 'Description', 'Durée Max', 'Rupture Possible', 'Avantages Légaux', 'Nb Contrats'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Types de Contrats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{data.length} type(s) de contrat défini(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau type</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TYPES" valeur={data.length} sousTexte="type(s) enregistré(s)" />
        <KPICard titre="CONTRATS ACTIFS" valeur={totalContrats} sousTexte="contrats en cours" />
        <KPICard titre="TYPES UTILISÉS" valeur={data.filter(d => d.nbContrats > 0).length} sousTexte={`${Math.round(data.filter(d => d.nbContrats > 0).length / Math.max(data.length, 1) * 100)}% des types`} />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}><Chip label={row.type} size="small" color="primary" /></TableCell>
          <TableCell>{row.description}</TableCell>
          <TableCell>{row.dureeMax}</TableCell>
          <TableCell><Chip label={row.rupturePossible} size="small" color={row.rupturePossible === 'Oui' ? 'success' : 'error'} /></TableCell>
          <TableCell sx={{ maxWidth: 300 }}>{row.avantages}</TableCell>
          <TableCell align="center">{row.nbContrats}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Type de Contrat"
        fields={[
          {key: 'type', label: 'Type de Contrat', required: true},
          {key: 'description', label: 'Description', required: true, multiline: true},
          {key: 'dureeMax', label: 'Durée Max'},
          {key: 'rupturePossible', label: 'Rupture Possible', type: 'select', options: ['Oui', 'Non']},
          {key: 'avantages', label: 'Avantages Légaux', multiline: true},
          {key: 'nbContrats', label: 'Nb Contrats Actifs', type: 'number'},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, nbContrats: 0, ...vals }]); }}
      />
    </Box>
  );
}
