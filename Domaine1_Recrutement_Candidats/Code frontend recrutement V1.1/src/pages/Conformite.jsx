import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  { id:1, numero:'CONF-001', typeDocument:'Contrat de travail', employe:'Ndiaye Moussa', poste:'Chef Cuisinier', departement:'Restauration', statutDocument:'Conforme', dateVerification:'20/02/2025', verificateur:'M. Nkoulou Paul', dateEcheance:'15/03/2026', commentaires:'Tous les documents en règle' },
  { id:2, numero:'CONF-002', typeDocument:'Diplôme', employe:'Tchouankou Claire', poste:'Comptable Senior', departement:'Finance & Comptabilite', statutDocument:'Conforme', dateVerification:'22/02/2025', verificateur:'Mme. Fotso Marie', dateEcheance:'', commentaires:'Diplôme vérifié auprès de l\'université' },
  { id:3, numero:'CONF-003', typeDocument:'Certificat de travail', employe:'Nganou André', poste:'Agent de Sécurité', departement:'Securite', statutDocument:'Non conforme', dateVerification:'25/02/2025', verificateur:'M. Kamga Blaise', dateEcheance:'', commentaires:'Certificat manquant, demandé à l\'employé' },
  { id:4, numero:'CONF-004', typeDocument:'Carte d\'identité', employe:'Mebara Nadège', poste:'Agent Accueil', departement:'Service Client', statutDocument:'Conforme', dateVerification:'26/02/2025', verificateur:'M. Ngo Ndobo Alain', dateEcheance:'10/08/2029', commentaires:'CNI valide' },
  { id:5, numero:'CONF-005', typeDocument:'Attestation CNPS', employe:'Kamga Blaise', poste:'Développeur Full Stack', departement:'Informatique', statutDocument:'En attente', dateVerification:'', verificateur:'', dateEcheance:'', commentaires:'En cours de vérification CNPS' },
  { id:6, numero:'CONF-006', typeDocument:'Extrait casier judiciaire', employe:'Eyenga Clarisse', poste:'Community Manager', departement:'Marketing & Communication', statutDocument:'Conforme', dateVerification:'27/02/2025', verificateur:'M. Nkoulou Paul', dateEcheance:'', commentaires:'Casier vierge confirmé' },
];

const statutDocColor = { 'Conforme': 'success', 'Non conforme': 'error', 'En attente': 'warning', 'Expiré': 'default' };

export default function Conformite() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const filtered = useMemo(() => data.filter(d => filterStatut === 'Tous' || d.statutDocument === filterStatut), [data, filterStatut]);

  const cols = ['N°', 'Type Document', 'Employé', 'Poste', 'Département', 'Statut', 'Date Vérification', 'Vérificateur', 'Date Échéance', 'Commentaires'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Conformité</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} vérification(s) de conformité</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouvelle vérification</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL" valeur={filtered.length} sousTexte="vérifications" />
        <KPICard titre="CONFORMES" valeur={filtered.filter(d => d.statutDocument === 'Conforme').length} sousTexte={`${Math.round(filtered.filter(d => d.statutDocument === 'Conforme').length / Math.max(filtered.length, 1) * 100)}%`}/>
        <KPICard titre="NON CONFORMES" valeur={filtered.filter(d => d.statutDocument === 'Non conforme').length} sousTexte="à régulariser" />
        <KPICard titre="EN ATTENTE" valeur={filtered.filter(d => d.statutDocument === 'En attente').length} sousTexte="vérifications en cours" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }}>
            <MenuItem value="Tous">Tous les statuts</MenuItem>
            <MenuItem value="Conforme">Conforme</MenuItem>
            <MenuItem value="Non conforme">Non conforme</MenuItem>
            <MenuItem value="En attente">En attente</MenuItem>
            <MenuItem value="Expiré">Expiré</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.typeDocument}</TableCell>
          <TableCell>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell><Chip label={row.statutDocument} size="small" color={statutDocColor[row.statutDocument]} /></TableCell>
          <TableCell>{row.dateVerification || '—'}</TableCell>
          <TableCell>{row.verificateur || '—'}</TableCell>
          <TableCell>{row.dateEcheance || '—'}</TableCell>
          <TableCell>{row.commentaires || '—'}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Nouvelle Vérification de Conformité"
        fields={[
          {key: "typeDocument", label: "Type de Document", required: true},
          {key: "employe", label: "Employé", required: true},
          {key: "poste", label: "Poste", required: true},
          {key: "departement", label: "Département", type: "select", options: nomenclatures.departement, required: true},
          {key: "statutDocument", label: "Statut", type: "select", options: ["Conforme", "Non conforme", "En attente", "Expiré"], required: true},
          {key: "verificateur", label: "Vérificateur"},
          {key: "dateEcheance", label: "Date d'Échéance"},
          {key: "commentaires", label: "Commentaires", multiline: true},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; const today = new Date().toLocaleDateString('fr-FR'); setData(prev => [...prev, { id: nid, numero: 'CONF-' + String(nid).padStart(3, '0'), dateVerification: today, ...vals }]); }}
      />
    </Box>
  );
}