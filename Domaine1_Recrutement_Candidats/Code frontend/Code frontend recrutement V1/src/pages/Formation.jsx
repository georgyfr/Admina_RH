import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'Terminee': 'success', 'En cours': 'warning', 'Planifiee': 'info', 'Annulee': 'error' };

const initialData = [
  { id:1, numero:'FMT-001', employe:'Nkoulou Amina', poste:'Chef Cuisinier', moduleFormation:'HACCP & Hygiène alimentaire', formateur:'M. Fotso André', dateDebut:'10/03/2025', dateFin:'12/03/2025', duree:18, statut:'Terminee', eval20:17,
    departement:'Restauration', dateArrivee:'01/03/2025', notes:'Formation obligatoire réussie' },
  { id:2, numero:'FMT-002', employe:'Nkoulou Amina', poste:'Chef Cuisinier', moduleFormation:'Management & Leadership', formateur:'Consultant externe', dateDebut:'15/04/2025', dateFin:'17/04/2025', duree:18, statut:'En cours', eval20:null,
    departement:'Restauration', dateArrivee:'01/03/2025', notes:'' },
  { id:3, numero:'FMT-003', employe:'Tabi Sandrine', poste:'Comptable Senior', moduleFormation:'Sage Comptabilité avancée', formateur:'M. Tchouankou Jean', dateDebut:'10/02/2025', dateFin:'14/02/2025', duree:30, statut:'Terminee', eval20:18,
    departement:'Finance & Comptabilite', dateArrivee:'01/02/2025', notes:'Très bonne appréhension du logiciel' },
  { id:4, numero:'FMT-004', employe:'Eyenga Clarisse', poste:'Agent Accueil', moduleFormation:'Techniques d\'accueil hôtelier', formateur:'Mme. Fotso Marie', dateDebut:'12/02/2025', dateFin:'13/02/2025', duree:12, statut:'Terminee', eval20:16,
    departement:'Service Client', dateArrivee:'10/02/2025', notes:'' },
  { id:5, numero:'FMT-005', employe:'Nganou André', poste:'Agent de Sécurité', moduleFormation:'Sécurité incendie', formateur:'M. Kamga Blaise', dateDebut:'03/03/2025', dateFin:'03/03/2025', duree:8, statut:'Terminee', eval20:15,
    departement:'Sécurité', dateArrivee:'01/03/2025', notes:'' },
  { id:6, numero:'FMT-006', employe:'Nganou André', poste:'Agent de Sécurité', moduleFormation:'Protocoles sûreté', formateur:'M. Kamga Blaise', dateDebut:'05/03/2025', dateFin:'06/03/2025', duree:12, statut:'Terminee', eval20:14,
    departement:'Sécurité', dateArrivee:'01/03/2025', notes:'' },
  { id:7, numero:'FMT-007', employe:'Kamga Blaise', poste:'Développeur Full Stack', moduleFormation:'Architecture interne & CI/CD', formateur:'M. Ngo Ndobo Alain', dateDebut:'02/04/2025', dateFin:'04/04/2025', duree:18, statut:'En cours', eval20:null,
    departement:'Informatique', dateArrivee:'01/04/2025', notes:'Formation en cours' },
  { id:8, numero:'FMT-008', employe:'Mebara Nadège', poste:'Community Manager', moduleFormation:'Stratégie réseaux sociaux', formateur:'Consultant digital', dateDebut:'20/03/2025', dateFin:'22/03/2025', duree:18, statut:'Planifiee', eval20:null,
    departement:'Marketing & Communication', dateArrivee:'15/03/2025', notes:'' },
  { id:9, numero:'FMT-009', employe:'Ngo Ndobo Alain', poste:'Chef Approvisionnement', moduleFormation:'SAP Achat', formateur:'M. Nkoulou Paul', dateDebut:'05/02/2025', dateFin:'07/02/2025', duree:18, statut:'Terminee', eval20:16,
    departement:'Logistique & Approvisionnement', dateArrivee:'01/02/2025', notes:'' },
  { id:10, numero:'FMT-010', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', moduleFormation:'PMS & Réception', formateur:'Mme. Fotso Marie', dateDebut:'18/03/2025', dateFin:'19/03/2025', duree:12, statut:'En cours', eval20:null,
    departement:'Hébergement', dateArrivee:'15/03/2025', notes:'' },
  { id:11, numero:'FMT-011', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', moduleFormation:'Service client & résolution conflits', formateur:'M. Nkoulou Paul', dateDebut:'25/03/2025', dateFin:'26/03/2025', duree:12, statut:'Planifiee', eval20:null,
    departement:'Hébergement', dateArrivee:'15/03/2025', notes:'' },
  { id:12, numero:'FMT-012', employe:'Eyenga Clarisse', poste:'Agent Accueil', moduleFormation:'Anglais hôtelier', formateur:'Mme. Tabi', dateDebut:'20/02/2025', dateFin:'28/02/2025', duree:24, statut:'Terminee', eval20:17,
    departement:'Service Client', dateArrivee:'10/02/2025', notes:'Progression notable' },
];

export default function Formation() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const total = data.length;
  const heuresTotal = data.reduce((s, d) => s + d.duree, 0);
  const notes = data.filter(d => d.eval20 !== null);
  const noteMoyenne = notes.length > 0 ? (notes.reduce((s, d) => s + d.eval20, 0) / notes.length).toFixed(1) : '—';

  const cols = ['N°','Employé','Poste','Module Formation','Formateur','Date Début','Date Fin','Durée (h)','Statut','Éval. /20','Notes','Département','Date Arrivée'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Plan d'Accueil & Formations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>12 formations au total</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouvelle Formation</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL FORMATIONS" valeur={total} sousTexte={`${total} formation(s)`} />
        <KPICard titre="HEURES TOTALES" valeur={`${heuresTotal}h`} sousTexte="heures de formation" />
        <KPICard titre="NOTE MOYENNE" valeur={`${noteMoyenne}/20`} sousTexte={notes.length > 0 ? `${notes.length} évaluée(s)` : 'aucune évaluation'} />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell>{row.moduleFormation}</TableCell>
          <TableCell>{row.formateur}</TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin}</TableCell>
          <TableCell align="center">{row.duree}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell align="center">{row.eval20 !== null ? row.eval20 : '—'}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateArrivee}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Formation"
        fields={[{key: "employe", label: "Employé", required: true},{key: "poste", label: "Poste", required: true},{key: "moduleFormation", label: "Module", required: true},{key: "formateur", label: "Formateur", required: true},{key: "dateDebut", label: "Date Début", required: true},{key: "dateFin", label: "Date Fin", required: true},{key: "duree", label: "Durée (h)", type: "number", required: true},{key: "departement", label: "Département"},{key: "notes", label: "Notes", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "FMT-" + String(nid).padStart(3, '0'), ...{statut: "Planifiee", eval20: null}, ...vals }]); }}
      />
    </Box>
  );
}
