import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  { id:1, nom:'Direction Générale', responsable:'M. Ngo Ndobo Alain', localisation:'Siège - Étage 3', nbEmployes:5, effectifCible:5, progression:'100%' },
  { id:2, nom:'Ressources Humaines', responsable:'M. Nkoulou Paul', localisation:'Siège - Étage 2', nbEmployes:8, effectifCible:10, progression:'80%' },
  { id:3, nom:'Finance & Comptabilité', responsable:'M. Tchouankou Jean', localisation:'Siège - Étage 1', nbEmployes:6, effectifCible:7, progression:'86%' },
  { id:4, nom:'Marketing & Communication', responsable:'Mme. Mebara Nadège', localisation:'Siège - Étage 2', nbEmployes:4, effectifCible:6, progression:'67%' },
  { id:5, nom:'Informatique', responsable:'M. Kamga Blaise', localisation:'Siège - Étage 3', nbEmployes:3, effectifCible:5, progression:'60%' },
  { id:6, nom:'Commercial', responsable:'M. Tabi Arnaud', localisation:'Siège - Étage 1', nbEmployes:10, effectifCible:15, progression:'67%' },
  { id:7, nom:'Logistique & Approvisionnement', responsable:'M. Ngo Ndobo Alain', localisation:'Entrepôt', nbEmployes:7, effectifCible:8, progression:'88%' },
  { id:8, nom:'Production', responsable:'Mme. Fotso Marie', localisation:'Site Production', nbEmployes:25, effectifCible:30, progression:'83%' },
  { id:9, nom:'Service Client', responsable:'Mme. Eyenga Clarisse', localisation:'Siège - RDC', nbEmployes:12, effectifCible:15, progression:'80%' },
  { id:10, nom:'Sécurité', responsable:'M. Nganou André', localisation:'Tous sites', nbEmployes:9, effectifCible:12, progression:'75%' },
  { id:11, nom:'Restauration', responsable:'M. Ndiaye Moussa', localisation:'Site Restauration', nbEmployes:18, effectifCible:22, progression:'82%' },
  { id:12, nom:'Hébergement', responsable:'Mme. Fotso Marie', localisation:'Site Hôtel', nbEmployes:20, effectifCible:25, progression:'80%' },
  { id:13, nom:'Maintenance', responsable:'M. Kamga Blaise', localisation:'Tous sites', nbEmployes:5, effectifCible:6, progression:'83%' },
  { id:14, nom:'Lingerie', responsable:'Mme. Ateba Chantal', localisation:'Site Blanchisserie', nbEmployes:8, effectifCible:10, progression:'80%' },
  { id:15, nom:'Audiovisuel', responsable:'M. Tabe Arnaud', localisation:'Site Technique', nbEmployes:4, effectifCible:5, progression:'80%' },
  { id:16, nom:'Juridique', responsable:'M. Tchouankou Jean', localisation:'Siège - Étage 2', nbEmployes:3, effectifCible:3, progression:'100%' },
  { id:17, nom:'Administration', responsable:'Mme. Ateba Chantal', localisation:'Siège - RDC', nbEmployes:4, effectifCible:4, progression:'100%' },
];

export default function Departements() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalEmployes = useMemo(() => data.reduce((s, d) => s + d.nbEmployes, 0), [data]);
  const totalCible = useMemo(() => data.reduce((s, d) => s + d.effectifCible, 0), [data]);
  const tauxRemplissage = Math.round(totalEmployes / Math.max(totalCible, 1) * 100);

  const cols = ['Département', 'Responsable', 'Localisation', 'Effectif', 'Cible', 'Taux de Remplissage', 'Progression'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Départements</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{data.length} département(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau département</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="DÉPARTEMENTS" valeur={data.length} sousTexte="département(s) actif(s)" />
        <KPICard titre="EFFECTIF TOTAL" valeur={totalEmployes} sousTexte="employés en poste" />
        <KPICard titre="EFFECTIF CIBLE" valeur={totalCible} sousTexte="postes à pourvoir" />
        <KPICard titre="TAUX REMPLISSAGE" valeur={`${tauxRemplissage}%`} sousTexte={tauxRemplissage >= 80 ? 'Objectif bientôt atteint' : 'Recrutement en cours'} />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => {
        const pct = Math.round(row.nbEmployes / Math.max(row.effectifCible, 1) * 100);
        return (
          <TableRow key={row.id} hover>
            <TableCell sx={{ fontWeight: 500 }}>{row.nom}</TableCell>
            <TableCell>{row.responsable}</TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{row.localisation}</Typography></TableCell>
            <TableCell align="center">{row.nbEmployes}</TableCell>
            <TableCell align="center">{row.effectifCible}</TableCell>
            <TableCell align="center"><Chip label={`${pct}%`} size="small" color={pct >= 90 ? 'success' : pct >= 70 ? 'warning' : 'error'} /></TableCell>
            <TableCell align="center"><Typography variant="body2" color="text.secondary">{row.progression}</Typography></TableCell>
          </TableRow>
        );
      })}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Département"
        fields={[
          {key: 'nom', label: 'Nom du Département', required: true},
          {key: 'responsable', label: 'Responsable', required: true},
          {key: 'localisation', label: 'Localisation'},
          {key: 'nbEmployes', label: 'Effectif Actuel', type: 'number'},
          {key: 'effectifCible', label: 'Effectif Cible', type: 'number'},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; const nb = vals.nbEmployes || 0; const cib = vals.effectifCible || 0; const pct = Math.round(nb / Math.max(cib, 1) * 100); setData(prev => [...prev, { id: nid, progression: pct + '%', ...vals }]); }}
      />
    </Box>
  );
}