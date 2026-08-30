import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';
const evalColor = { 'Excellent': 'success', 'Bon': 'info', 'Moyen': 'warning', 'Insuffisant': 'error', 'A evaluer': 'default' };

const initialData = [
  { id:1, numero:'CA-001', cabinet:'HRC Cameroon', specialite:'Hotellerie & Tourisme', contact:'M. Fotso André', telephone:'+237 699 111 222', email:'contact@hrc-cm.com', ville:'Douala', candidatsFournis:25, recrutements:8, tauxReussite:32.0,
    coutTotal:1250000, evaluation:'Bon', contratEnCours:'Oui', dateDebutContrat:'01/01/2025', dateFinContrat:'31/12/2025', notes:'Partenaire historique, résultats fiables' },
  { id:2, numero:'CA-002', cabinet:'Activa RH', specialite:'Generaliste', contact:'Mme. Nganso', telephone:'+237 677 333 444', email:'info@activa-rh.cm', ville:'Douala', candidatsFournis:18, recrutements:4, tauxReussite:22.2,
    coutTotal:720000, evaluation:'Moyen', contratEnCours:'Oui', dateDebutContrat:'01/03/2025', dateFinContrat:'28/02/2026', notes:'Performance en amélioration' },
  { id:3, numero:'CA-003', cabinet:'Skillmatch Africa', specialite:'Informatique', contact:'M. Kamga', telephone:'+237 699 555 666', email:'recrutement@skillmatch.africa', ville:'Yaoundé', candidatsFournis:12, recrutements:3, tauxReussite:25.0,
    coutTotal:600000, evaluation:'Bon', contratEnCours:'Oui', dateDebutContrat:'15/01/2025', dateFinContrat:'14/01/2026', notes:'Spécialiste IT, bons profils tech' },
  { id:4, numero:'CA-004', cabinet:'Michael Page Cameroon', specialite:'Cadres dirigeants', contact:'M. Tchinda', telephone:'+237 677 777 888', email:'douala@michaelpage.cm', ville:'Douala', candidatsFournis:8, recrutements:2, tauxReussite:25.0,
    coutTotal:960000, evaluation:'Excellent', contratEnCours:'Non', dateDebutContrat:'', dateFinContrat:'', notes:'Cabinet premium, profils haut niveau' },
  { id:5, numero:'CA-005', cabinet:'Pedarec', specialite:'Finance', contact:'Mme. Mbarga', telephone:'+237 699 999 000', email:'contact@pedarec.cm', ville:'Douala', candidatsFournis:10, recrutements:2, tauxReussite:20.0,
    coutTotal:500000, evaluation:'Moyen', contratEnCours:'Non', dateDebutContrat:'01/06/2024', dateFinContrat:'31/05/2025', notes:'Contrat expiré, renégociation en cours' },
  { id:6, numero:'CA-006', cabinet:'AfricSearch', specialite:'Generaliste', contact:'M. Ndong', telephone:'+237 677 111 333', email:'info@africsearch.com', ville:'Douala', candidatsFournis:15, recrutements:3, tauxReussite:20.0,
    coutTotal:675000, evaluation:'Moyen', contratEnCours:'Non', dateDebutContrat:'', dateFinContrat:'', notes:'Peu de retours sur les derniers mois' },
  { id:7, numero:'CA-007', cabinet:'Manpower Cameroon', specialite:'Generaliste', contact:'Mme. Tabi', telephone:'+237 699 222 444', email:'douala@manpower.cm', ville:'Douala', candidatsFournis:14, recrutements:2, tauxReussite:14.3,
    coutTotal:560000, evaluation:'Insuffisant', contratEnCours:'Non', dateDebutContrat:'', dateFinContrat:'', notes:'Taux de réussite en baisse' },
  { id:8, numero:'CA-008', cabinet:'Cabinet Prestige', specialite:'Hotellerie & Tourisme', contact:'M. Eyenga', telephone:'+237 677 555 777', email:'prestige@rh-cm.com', ville:'Yaoundé', candidatsFournis:6, recrutements:1, tauxReussite:16.7,
    coutTotal:300000, evaluation:'A evaluer', contratEnCours:'Non', dateDebutContrat:'', dateFinContrat:'', notes:'Nouveau partenaire à évaluer' },
  { id:9, numero:'CA-009', cabinet:'RecrutPro', specialite:'Commerce', contact:'M. Fotso', telephone:'+237 699 888 999', email:'contact@recrutpro.cm', ville:'Douala', candidatsFournis:5, recrutements:0, tauxReussite:0.0,
    coutTotal:150000, evaluation:'Insuffisant', contratEnCours:'Non', dateDebutContrat:'', dateFinContrat:'', notes:'Aucun recrutement réussi' },
  { id:10, numero:'CA-010', cabinet:'Interne (sans cabinet)', specialite:'Generaliste', contact:'DRH', telephone:'+237 699 000 111', email:'rh@hrc-cm.com', ville:'Douala', candidatsFournis:4, recrutements:2, tauxReussite:50.0,
    coutTotal:80000, evaluation:'Bon', contratEnCours:'Oui', dateDebutContrat:'01/01/2025', dateFinContrat:'31/12/2025', notes:'Recrutement interne, coûts réduits' },
];

export default function Cabinets() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const totalCab = data.length;
  const tauxMoyen = (data.reduce((s, d) => s + d.tauxReussite, 0) / totalCab).toFixed(1);
  const totalCandidats = data.reduce((s, d) => s + d.candidatsFournis, 0);

  const cols = ['N° Cabinet','Cabinet/Agence','Spécialité','Contact','Téléphone','Email','Ville','Candidats Fournis','Recrutements','Taux Réussite (%)','Coût Total (FCFA)','Évaluation','Contrat en Cours','Date Début Contrat','Date Fin Contrat','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Gestion des Cabinets</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>12 cabinets partenaires</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau Cabinet</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL CABINETS" valeur={totalCab} sousTexte={`${totalCab} partenaires`} />
        <KPICard titre="TAUX RÉUSSITE MOYEN" valeur={`${tauxMoyen}%`} sousTexte="moyenne tous cabinets" />
        <KPICard titre="CANDIDATS FOURNIS TOTAL" valeur={totalCandidats} sousTexte="tous cabinets confondus" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.cabinet}</TableCell>
          <TableCell><Chip label={row.specialite} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.contact}</TableCell>
          <TableCell>{row.telephone}</TableCell>
          <TableCell>{row.email}</TableCell>
          <TableCell>{row.ville}</TableCell>
          <TableCell align="center">{row.candidatsFournis}</TableCell>
          <TableCell align="center">{row.recrutements}</TableCell>
          <TableCell align="center"><Chip label={`${row.tauxReussite}%`} size="small" color={row.tauxReussite >= 30 ? 'success' : row.tauxReussite >= 20 ? 'warning' : 'error'} /></TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutTotal)}</TableCell>
          <TableCell><Chip label={row.evaluation} size="small" color={evalColor[row.evaluation]} /></TableCell>
          <TableCell><Chip label={row.contratEnCours} size="small" color={row.contratEnCours === 'Oui' ? 'success' : 'default'} /></TableCell>
          <TableCell>{row.dateDebutContrat || '—'}</TableCell>
          <TableCell>{row.dateFinContrat || '—'}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Cabinet"
        fields={[{key: "nom", label: "Nom du Cabinet", required: true},{key: "specialite", label: "Spécialité", type: "select", options: ["Generaliste", "Cadres dirigeants", "Informatique", "Finance", "Hotellerie & Tourisme", "Commerce", "BTP", "Logistique"], required: true},{key: "contact", label: "Contact"},{key: "telephone", label: "Téléphone"},{key: "evaluation", label: "Évaluation", type: "select", options: ["Excellent", "Bon", "Moyen", "Insuffisant", "A evaluer"]},{key: "notes", label: "Notes", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "CA-" + String(nid).padStart(3, '0'), ...{nbRecrutements: 0, coutTotal: 0}, ...vals }]); }}
      />
    </Box>
  );
}
