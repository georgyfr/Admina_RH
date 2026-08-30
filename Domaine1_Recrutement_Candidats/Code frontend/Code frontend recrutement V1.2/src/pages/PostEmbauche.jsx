import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const satisfactionColor = { 'Tres satisfait': 'success', 'Satisfait': 'info', 'Neutre': 'default', 'Insatisfait': 'warning', 'Tres insatisfait': 'error' };
const risqueColor = { 'Faible': 'success', 'Moyen': 'warning', 'Eleve': 'error', 'Critique': 'error' };

const initialData = [
  { id:1, numero:'SPE-001', employe:'Nkoulou Amina', poste:'Chef Cuisinier', departement:'Restauration', dateEmbauche:'01/03/2025', anciennete:6, eval1mois:16, eval3mois:17, eval6mois:null, satisfaction:'Satisfait', risqueDepart:'Faible', commentaires:'Très bien intégrée, référent cuisine' },
  { id:2, numero:'SPE-002', employe:'Tabi Sandrine', poste:'Comptable Senior', departement:'Finance & Comptabilite', dateEmbauche:'01/02/2025', anciennete:7, eval1mois:15, eval3mois:16, eval6mois:null, satisfaction:'Satisfait', risqueDepart:'Faible', commentaires:'Performance solide' },
  { id:3, numero:'SPE-003', employe:'Eyenga Clarisse', poste:'Agent Accueil', departement:'Service Client', dateEmbauche:'10/02/2025', anciennete:6, eval1mois:17, eval3mois:18, eval6mois:null, satisfaction:'Tres satisfait', risqueDepart:'Faible', commentaires:'Étoile montante' },
  { id:4, numero:'SPE-004', employe:'Nganou André', poste:'Agent de Sécurité', departement:'Sécurité', dateEmbauche:'01/03/2025', anciennete:6, eval1mois:13, eval3mois:14, eval6mois:null, satisfaction:'Neutre', risqueDepart:'Moyen', commentaires:'Progression mais动机 fluctuant' },
  { id:5, numero:'SPE-005', employe:'Kamga Blaise', poste:'Développeur Full Stack', departement:'Informatique', dateEmbauche:'01/04/2025', anciennete:5, eval1mois:14, eval3mois:null, eval6mois:null, satisfaction:'Neutre', risqueDepart:'Moyen', commentaires:'Compétent mais opportunités externes' },
  { id:6, numero:'SPE-006', employe:'Mebara Nadège', poste:'Community Manager', departement:'Marketing & Communication', dateEmbauche:'15/03/2025', anciennete:5, eval1mois:15, eval3mois:null, eval6mois:null, satisfaction:'Satisfait', risqueDepart:'Faible', commentaires:'Créative et proactive' },
  { id:7, numero:'SPE-007', employe:'Ngo Ndobo Alain', poste:'Chef Approvisionnement', departement:'Logistique & Approvisionnement', dateEmbauche:'01/02/2025', anciennete:7, eval1mois:15, eval3mois:16, eval6mois:null, satisfaction:'Satisfait', risqueDepart:'Faible', commentaires:'Fiable et structuré' },
  { id:8, numero:'SPE-008', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', departement:'Hébergement', dateEmbauche:'15/03/2025', anciennete:5, eval1mois:12, eval3mois:null, eval6mois:null, satisfaction:'Neutre', risqueDepart:'Eleve', commentaires:'Difficulté adaptation horaire de nuit' },
  { id:9, numero:'SPE-009', employe:'Tchouante Ghislain', poste:'Technicien Audiovisuel', departement:'Audiovisuel', dateEmbauche:'01/01/2025', anciennete:8, eval1mois:16, eval3mois:17, eval6mois:18, satisfaction:'Tres satisfait', risqueDepart:'Faible', commentaires:'Pilier technique' },
];

export default function PostEmbauche() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const total = data.length;
  const satMoy = data.filter(d => d.satisfaction === 'Tres satisfait' || d.satisfaction === 'Satisfait').length;
  const satisfactionMoyenne = (satMoy / total * 5).toFixed(1);
  const risqueMoyen = (data.reduce((s, d) => {
    const r = { Faible: 1, Moyen: 2, Eleve: 3, Critique: 4 };
    return s + (r[d.risqueDepart] || 1);
  }, 0) / total).toFixed(1);

  const cols = ['N°','Employé','Poste','Département','Date Embauche','Ancienneté (mois)','Éval 1 mois (/20)','Éval 3 mois (/20)','Éval 6 mois (/20)','Satisfaction','Risque Départ','Commentaires'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Suivi Post-Embauche</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="Total Suivis" valeur={total} sousTexte={`${total} suivi(s)`} />
        <KPICard titre="Satisfaction Moyenne" valeur={`${satisfactionMoyenne}/5`} sousTexte={`${satMoy} satisfaits`} />
        <KPICard titre="Risque Moyen" valeur={`${risqueMoyen}/4`} sousTexte="moyenne équipe" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateEmbauche}</TableCell>
          <TableCell align="center">{row.anciennete}</TableCell>
          <TableCell align="center">{row.eval1mois}</TableCell>
          <TableCell align="center">{row.eval3mois || '—'}</TableCell>
          <TableCell align="center">{row.eval6mois || '—'}</TableCell>
          <TableCell><Chip label={row.satisfaction} size="small" color={satisfactionColor[row.satisfaction]} /></TableCell>
          <TableCell><Chip label={row.risqueDepart} size="small" color={risqueColor[row.risqueDepart]} /></TableCell>
          <TableCell>{row.commentaires && row.commentaires.length > 35 ? `${row.commentaires.substring(0, 35)}...` : (row.commentaires || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Suivi"
        fields={[{key: "employe", label: "Employé", required: true},{key: "poste", label: "Poste", required: true},{key: "departement", label: "Département", required: true},{key: "dateEmbauche", label: "Date Embauche", required: true},{key: "eval1mois", label: "Éval 1 mois (/20)", type: "number"},{key: "risqueDepart", label: "Risque Départ", type: "select", options: ["Faible", "Moyen", "Eleve", "Critique"]},{key: "commentaires", label: "Commentaires", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "SPE-" + String(nid).padStart(3, '0'), ...{anciennete: 0, satisfaction: "Neutre"}, ...vals }]); }}
      />
    </Box>
  );
}
