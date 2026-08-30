import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem, Tooltip } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialData = [
  { id:1, numero:'CTR-2025-001', employe:'Ndiaye Moussa', poste:'Chef Cuisinier', departement:'Restauration', typeContrat:'CDI', dateDebut:'01/04/2025', dateFin:'31/03/2030', salaireBrut:350000, statut:'En cours', demandeLiee:'DR-2025-001', notes:'Embauche confirmée' },
  { id:2, numero:'CTR-2025-002', employe:'Tchouankou Claire', poste:'Comptable Senior', departement:'Finance & Comptabilite', typeContrat:'CDI', dateDebut:'15/04/2025', dateFin:'14/04/2030', salaireBrut:400000, statut:'En négociation', demandeLiee:'DR-2025-003', notes:'En attente de signature' },
  { id:3, numero:'CTR-2025-003', employe:'Mebara Nadège', poste:'Agent Accueil', departement:'Service Client', typeContrat:'CDD', dateDebut:'01/03/2025', dateFin:'31/08/2025', salaireBrut:150000, statut:'En cours', demandeLiee:'DR-2025-004', notes:'' },
  { id:4, numero:'CTR-2024-015', employe:'Mme. Fotso Marie', poste:'Chef de Département', departement:'Hébergement', typeContrat:'CDI', dateDebut:'01/01/2020', dateFin:'31/12/2025', salaireBrut:500000, statut:'Renouvelé', demandeLiee:'', notes:'Contrat renouvelé pour 5 ans' },
  { id:5, numero:'CTR-2024-018', employe:'M. Nkoulou Paul', poste:'DRH', departement:'Ressources Humaines', typeContrat:'CDI', dateDebut:'01/09/2019', dateFin:'31/08/2029', salaireBrut:550000, statut:'En cours', demandeLiee:'', notes:'' },
  { id:6, numero:'CTR-2025-004', employe:'Nganou André', poste:'Agent de Sécurité', departement:'Sécurité', typeContrat:'CDD', dateDebut:'01/04/2025', dateFin:'30/06/2025', salaireBrut:120000, statut:'En négociation', demandeLiee:'DR-2025-005', notes:'' },
];

const statutColor = { 'En cours': 'success', 'Renouvele': 'info', 'Echu': 'error', 'Resilie': 'error', 'En negociation': 'warning' };

export default function Contrats() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterType, setFilterType] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const filtered = useMemo(() => data.filter(d =>
    (filterStatut === 'Tous' || d.statut === filterStatut) &&
    (filterType === 'Tous' || d.typeContrat === filterType)
  ), [data, filterStatut, filterType]);

  const masseSalariale = useMemo(() => data.filter(d => d.statut === 'En cours' || d.statut === 'Renouvele').reduce((s, d) => s + (d.salaireBrut || 0), 0), [data]);

  const cols = ['N° Contrat', 'Employé', 'Poste', 'Département', 'Type', 'Date Début', 'Date Fin', 'Salaire Brut', 'Statut', 'Demande Liée', 'Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Suivi des Contrats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} contrat(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau contrat</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="CONTRATS" valeur={data.length} sousTexte="enregistré(s)" />
        <KPICard titre="EN COURS" valeur={data.filter(d => d.statut === 'En cours').length} sousTexte="actif(s)" />
        <KPICard titre="MASSE SALARIALE" valeur={formatFCFA(masseSalariale)} sousTexte="contrats actifs/mois" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}><Select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }}><MenuItem value="Tous">Tous les statuts</MenuItem>{nomenclatures.statut_contrat.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}><Select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }}><MenuItem value="Tous">Tous les types</MenuItem>{nomenclatures.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell><Chip label={row.typeContrat} size="small" /></TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.salaireBrut)}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell>{row.demandeLiee || '—'}</TableCell>
          <TableCell>{row.notes && row.notes.length > 30 ? <Tooltip title={row.notes} arrow><span>{row.notes.substring(0, 30)}...</span></Tooltip> : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Contrat"
        fields={[
          {key: 'employe', label: 'Employé', required: true},
          {key: 'poste', label: 'Poste', required: true},
          {key: 'departement', label: 'Département', type: 'select', options: nomenclatures.departement, required: true},
          {key: 'typeContrat', label: 'Type Contrat', type: 'select', options: nomenclatures.type_contrat, required: true},
          {key: 'dateDebut', label: 'Date Début', required: true},
          {key: 'dateFin', label: 'Date Fin', required: true},
          {key: 'salaireBrut', label: 'Salaire Brut (FCFA)', type: 'number', required: true},
          {key: 'demandeLiee', label: 'Demande Liée'},
          {key: 'notes', label: 'Notes', multiline: true},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: 'CTR-2025-' + String(nid).padStart(3, '0'), statut: 'En negociation', ...vals }]); }}
      />
    </Box>
  );
}
