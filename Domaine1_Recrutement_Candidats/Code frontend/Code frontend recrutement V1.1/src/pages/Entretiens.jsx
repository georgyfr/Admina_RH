import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper, Tabs, Tab } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'Planifie': 'info', 'Realise': 'success', 'Annule': 'error', 'Reporte': 'warning' };
const resultatColor = { 'Favorable': 'success', 'Defavorable': 'error', 'A revoir': 'warning', 'En attente': 'default' };

const initialData = [
  { id:1, numero:'ENT-2025-001', candidat:'Ndiaye Moussa', type:'Presentiel', dateHeure:'10/02/2025 09:00', duree:'1h', lieu:'Salle A - Siège', evaluateurs:'Mme. Fotso Marie', statut:'Realise', resultat:'Favorable', posteVise:'Chef Cuisinier', score:18, prochaineEtape:'Test technique', dateProchaineEtape:'15/02/2025', notes:'Candidat très motivé, expérience pertinente' },
  { id:2, numero:'ENT-2025-002', candidat:'Tchouankou Claire', type:'Visioconference', dateHeure:'12/02/2025 14:00', duree:'45min', lieu:'Zoom', evaluateurs:'M. Nkoulou Paul', statut:'Realise', resultat:'Favorable', posteVise:'Comptable Senior', score:16, prochaineEtape:'Entretien final', dateProchaineEtape:'20/02/2025', notes:'Bon profil, à vérifier niveau anglais' },
  { id:3, numero:'ENT-2025-003', candidat:'Nganou André', type:'Telephonique', dateHeure:'14/02/2025 11:00', duree:'30min', lieu:'Téléphone', evaluateurs:'M. Kamga Blaise', statut:'Realise', resultat:'A revoir', posteVise:'Agent de Sécurité', score:12, prochaineEtape:'2ème tour', dateProchaineEtape:'18/02/2025', notes:'Expérience insuffisante pour le poste' },
  { id:4, numero:'ENT-2025-004', candidat:'Nganou André', type:'Presentiel', dateHeure:'18/02/2025 10:00', duree:'1h', lieu:'Salle B - Siège', evaluateurs:'Mme. Fotso Marie, M. Kamga Blaise', statut:'Realise', resultat:'Favorable', posteVise:'Agent de Sécurité', score:15, prochaineEtape:'Vérification références', dateProchaineEtape:'22/02/2025', notes:'Meilleure performance au 2ème tour' },
  { id:5, numero:'ENT-2025-005', candidat:'Mebara Nadège', type:'Presentiel', dateHeure:'20/02/2025 15:00', duree:'1h', lieu:'Salle A - Siège', evaluateurs:'M. Nkoulou Paul', statut:'Realise', resultat:'Favorable', posteVise:'Agent Accueil', score:17, prochaineEtape:'Sélection finale', dateProchaineEtape:'25/02/2025', notes:'Excellente communication, profil recommandé' },
  { id:6, numero:'ENT-2025-006', candidat:'Kamga Blaise', type:'Technique', dateHeure:'22/02/2025 09:00', duree:'2h', lieu:'Salle C - Siège', evaluateurs:'M. Ngo Ndobo Alain', statut:'Planifie', resultat:'En attente', posteVise:'Développeur Full Stack', score:null, prochaineEtape:'', dateProchaineEtape:'', notes:'Test technique prévu' },
  { id:7, numero:'ENT-2025-007', candidat:'Nkoulou Brandon', type:'Final', dateHeure:'25/02/2025 11:00', duree:'1h30', lieu:'Salle A - Siège', evaluateurs:'Mme. Fotso Marie, M. Nkoulou Paul', statut:'Annule', resultat:'En attente', posteVise:'Réceptionniste Nuit', score:null, prochaineEtape:'', dateProchaineEtape:'', notes:'Candidat indisponible, report demandé' },
];

export default function Entretiens() {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const filtered = useMemo(() => {
    if (tab === 0) return data;
    if (tab === 1) return data.filter(d => d.statut === 'Planifie');
    if (tab === 2) return data.filter(d => d.statut === 'Realise');
    return data.filter(d => d.statut === 'Annule');
  }, [data, tab]);

  const cols = ['Candidat','Type','Date & Heure','Durée','Lieu/Lien','Évaluateur(s)','Statut','Résultat','Actions','N° Entretien','Poste Visé','Score (/20)','Prochaine Étape','Date Prochaine Étape','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Planification des Entretiens</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>7 entretien(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter Entretien</Button>
      </Box>
      <Tabs value={tab} onChange={(e, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
        <Tab label="Tous" />
        <Tab label="Planifiés" />
        <Tab label="Réalisés" />
        <Tab label="Annulés" />
      </Tabs>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell><Chip label={row.type} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateHeure}</TableCell>
          <TableCell>{row.duree}</TableCell>
          <TableCell>{row.lieu}</TableCell>
          <TableCell>{row.evaluateurs}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell><Chip label={row.resultat} size="small" color={resultatColor[row.resultat]} /></TableCell>
          <TableCell><Button size="small" variant="outlined">Voir</Button></TableCell>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell>{row.posteVise}</TableCell>
          <TableCell align="center">{row.score !== null ? row.score : '—'}</TableCell>
          <TableCell>{row.prochaineEtape || '—'}</TableCell>
          <TableCell>{row.dateProchaineEtape || '—'}</TableCell>
          <TableCell>{row.notes && row.notes.length > 30 ? <Tooltip title={row.notes} arrow><span>{row.notes.substring(0, 30)}...</span></Tooltip> : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Entretien"
        fields={[{key: "candidat", label: "Candidat", required: true},{key: "type", label: "Type", type: "select", options: ["Telephonique", "Visioconference", "Presentiel", "Technique", "2eme tour", "Final"], required: true},{key: "dateHeure", label: "Date & Heure", required: true},{key: "duree", label: "Durée"},{key: "lieu", label: "Lieu/Lien", required: true},{key: "evaluateurs", label: "Évaluateur(s)", required: true},{key: "posteVise", label: "Poste Visé"},{key: "notes", label: "Notes", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "ENT-2025-" + String(nid).padStart(3, '0'), ...{statut: "Planifie", resultat: "En attente", score: null}, ...vals }]); }}
      />
    </Box>
  );
}
