import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / 1048576).toFixed(1) + ' Mo';
};

const initialData = [
  { id:1, nom:'CV_Ndiaye_Moussa.pdf', type:'CV', candidat:'Ndiaye Moussa', taille:245760, dateUpload:'10/01/2025', statut:'Validé' },
  { id:2, nom:'LM_Ndiaye_Moussa.pdf', type:'Lettre de motivation', candidat:'Ndiaye Moussa', taille:98304, dateUpload:'10/01/2025', statut:'Validé' },
  { id:3, nom:'CV_Tchouankou_Claire.pdf', type:'CV', candidat:'Tchouankou Claire', taille:312320, dateUpload:'12/01/2025', statut:'Validé' },
  { id:4, nom:'Diplome_Tchouankou.pdf', type:'Attestation', candidat:'Tchouankou Claire', taille:524288, dateUpload:'15/01/2025', statut:'Validé' },
  { id:5, nom:'Contrat_CDI_Ndiaye.pdf', type:'Contrat', candidat:'Ndiaye Moussa', taille:1048576, dateUpload:'01/03/2025', statut:'En cours' },
  { id:6, nom:'Grille_Eval_Ndiaye.pdf', type:'Grille évaluation', candidat:'Ndiaye Moussa', taille:180224, dateUpload:'25/02/2025', statut:'Validé' },
  { id:7, nom:'CV_Mebara_Nadege.pdf', type:'CV', candidat:'Mebara Nadège', taille:210944, dateUpload:'20/01/2025', statut:'Validé' },
  { id:8, nom:'Fiche_Poste_Accueil.pdf', type:'Fiche de poste', candidat:'Mebara Nadège', taille:156672, dateUpload:'22/01/2025', statut:'Validé' },
  { id:9, nom:'Certificat_Travail_Nganou.pdf', type:'Attestation', candidat:'Nganou André', taille:81920, dateUpload:'18/02/2025', statut:'Rejeté' },
  { id:10, nom:'CV_Kamga_Blaise.pdf', type:'CV', candidat:'Kamga Blaise', taille:278528, dateUpload:'25/01/2025', statut:'En attente' },
];

const statutColor = { 'Validé': 'success', 'En attente': 'warning', 'Rejeté': 'error', 'En cours': 'info' };

export default function Documents() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterType, setFilterType] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const types = useMemo(() => ['Tous', ...new Set(data.map(d => d.type))], [data]);
  const filtered = useMemo(() => data.filter(d => filterType === 'Tous' || d.type === filterType), [data, filterType]);
  const totalSize = useMemo(() => data.reduce((s, d) => s + (d.taille || 0), 0), [data]);

  const cols = ['N°', 'Nom du Document', 'Type', 'Candidat', 'Taille', 'Date Upload', 'Statut'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Gestion des Documents</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} document(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="DOCUMENTS" valeur={data.length} sousTexte="stocké(s)" />
        <KPICard titre="VALIDÉS" valeur={data.filter(d => d.statut === 'Validé').length} sousTexte={`${Math.round(data.filter(d => d.statut === 'Validé').length / Math.max(data.length, 1) * 100)}%`}/>
        <KPICard titre="TAILLE TOTALE" valeur={formatSize(totalSize)} sousTexte="espace utilisé" />
      </Box>
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }}>
            {types.map(t => <MenuItem key={t} value={t}>{t === 'Tous' ? 'Tous les types' : t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map((row, idx) => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{'DOC-' + String(idx + 1).padStart(3, '0')}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.nom}</TableCell>
          <TableCell><Chip label={row.type} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.candidat}</TableCell>
          <TableCell>{formatSize(row.taille)}</TableCell>
          <TableCell>{row.dateUpload}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Document"
        fields={[
          {key: 'nom', label: 'Nom du Document', required: true},
          {key: 'type', label: 'Type', type: 'select', options: ['CV', 'Lettre de motivation', 'Contrat', 'Fiche de poste', 'Grille évaluation', 'Attestation', 'Certificat', 'Autre'], required: true},
          {key: 'candidat', label: 'Candidat', required: true},
          {key: 'statut', label: 'Statut', type: 'select', options: ['En attente', 'Validé', 'Rejeté', 'En cours']},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; const today = new Date().toLocaleDateString('fr-FR'); setData(prev => [...prev, { id: nid, taille: 0, dateUpload: today, ...vals }]); }}
      />
    </Box>
  );
}
