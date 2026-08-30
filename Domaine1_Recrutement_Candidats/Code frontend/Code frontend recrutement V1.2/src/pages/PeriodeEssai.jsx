import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const decisionColor = { 'En cours': 'warning', 'Embauche confirmee': 'success', 'Prolongation essai': 'info', 'Rupture essai': 'error' };

const initialData = [
  { id:1, numero:'ESS-001', employe:'Nkoulou Amina', poste:'Chef Cuisinier', departement:'Restauration', typeContrat:'CDI', dateDebutEssai:'01/03/2025', dateFinEssai:'01/06/2025', duree:92, evaluateur:'M. Nkoulou Paul', noteGlobale:17, decision:'En cours',
    objectifsFixes:'Maîtriser 100% de la carte, former 2 commis', scoreMiParcours:15, scoreFinal:null, dateDecision:'01/06/2025', notes:'Bon début, à suivre' },
  { id:2, numero:'ESS-002', employe:'Tabi Sandrine', poste:'Comptable Senior', departement:'Finance & Comptabilite', typeContrat:'CDI', dateDebutEssai:'01/02/2025', dateFinEssai:'01/05/2025', duree:89, evaluateur:'M. Tchouankou Jean', noteGlobale:16, decision:'Embauche confirmee',
    objectifsFixes:'Prendre en charge la comptabilité courante', scoreMiParcours:14, scoreFinal:16, dateDecision:'28/04/2025', notes:'Embauche confirmée ahead of schedule' },
  { id:3, numero:'ESS-003', employe:'Eyenga Clarisse', poste:'Agent Accueil', departement:'Service Client', typeContrat:'CDD', dateDebutEssai:'10/02/2025', dateFinEssai:'10/05/2025', duree:89, evaluateur:'Mme. Fotso Marie', noteGlobale:18, decision:'Embauche confirmee',
    objectifsFixes:'Autonomie accueil, gestion réservations', scoreMiParcours:17, scoreFinal:18, dateDecision:'05/05/2025', notes:'Excellente performance' },
  { id:4, numero:'ESS-004', employe:'Nganou André', poste:'Agent de Sécurité', departement:'Sécurité', typeContrat:'CDD', dateDebutEssai:'01/03/2025', dateFinEssai:'01/06/2025', duree:92, evaluateur:'M. Kamga Blaise', noteGlobale:13, decision:'En cours',
    objectifsFixes:'Maîtriser les protocoles de sécurité', scoreMiParcours:12, scoreFinal:null, dateDecision:'01/06/2025', notes:'Progression correcte' },
  { id:5, numero:'ESS-005', employe:'Kamga Blaise', poste:'Développeur Full Stack', departement:'Informatique', typeContrat:'CDI', dateDebutEssai:'01/04/2025', dateFinEssai:'01/07/2025', duree:91, evaluateur:'M. Ngo Ndobo Alain', noteGlobale:15, decision:'En cours',
    objectifsFixes:'Livrer 2 features, coder les tests unitaires', scoreMiParcours:null, scoreFinal:null, dateDecision:'01/07/2025', notes:'Trop tôt pour évaluer' },
  { id:6, numero:'ESS-006', employe:'Mebara Nadège', poste:'Community Manager', departement:'Marketing & Communication', typeContrat:'CDI', dateDebutEssai:'15/03/2025', dateFinEssai:'15/06/2025', duree:92, evaluateur:'Mme. Mebara Nadège', noteGlobale:14, decision:'En cours',
    objectifsFixes:'Gérer les réseaux sociaux, créer 1 campagne', scoreMiParcours:null, scoreFinal:null, dateDecision:'15/06/2025', notes:'Début prometteur' },
  { id:7, numero:'ESS-007', employe:'Ngo Ndobo Alain', poste:'Chef Approvisionnement', departement:'Logistique & Approvisionnement', typeContrat:'CDI', dateDebutEssai:'01/02/2025', dateFinEssai:'01/05/2025', duree:89, evaluateur:'M. Nkoulou Paul', noteGlobale:16, decision:'Embauche confirmee',
    objectifsFixes:'Optimiser les stocks, réduire les délais', scoreMiParcours:15, scoreFinal:16, dateDecision:'28/04/2025', notes:'Bonne intégration' },
  { id:8, numero:'ESS-008', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', departement:'Hébergement', typeContrat:'CDD', dateDebutEssai:'15/03/2025', dateFinEssai:'15/06/2025', duree:92, evaluateur:'Mme. Fotso Marie', noteGlobale:12, decision:'Prolongation essai',
    objectifsFixes:'Autonomie nuit, gestion urgences', scoreMiParcours:10, scoreFinal:null, dateDecision:'15/06/2025', notes:'Performance insuffisante, prolongation de 1 mois' },
  { id:9, numero:'ESS-009', employe:'Tchouankou Gloire', poste:'Agent de Blanchisserie', departement:'Lingerie', typeContrat:'CDD', dateDebutEssai:'01/04/2025', dateFinEssai:'01/07/2025', duree:91, evaluateur:'Mme. Ateba Chantal', noteGlobale:11, decision:'Rupture essai',
    objectifsFixes:'Maîtriser les équipements, cadence 50 pièces/jour', scoreMiParcours:9, scoreFinal:null, dateDecision:'20/04/2025', notes:'Rupture anticipée, inadaptation au poste' },
  { id:10, numero:'ESS-010', employe:'Fomumbod David', poste:'Agent de Sécurité', departement:'Sécurité', typeContrat:'CDD', dateDebutEssai:'01/04/2025', dateFinEssai:'01/07/2025', duree:91, evaluateur:'M. Kamga Blaise', noteGlobale:14, decision:'En cours',
    objectifsFixes:'Protocoles sécurité, rondes nocturnes', scoreMiParcours:null, scoreFinal:null, dateDecision:'01/07/2025', notes:'' },
];

export default function PeriodeEssai() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const total = data.length;
  const tauxReussite = Math.round(data.filter(d => d.decision === 'Embauche confirmee').length / total * 100);
  const noteMoyenne = (data.reduce((s, d) => s + d.noteGlobale, 0) / total).toFixed(1);

  const cols = ['N°','Employé','Poste','Département','Type Contrat','Date Début Essai','Date Fin Essai','Durée (jours)','Évaluateur','Note Globale (/20)','Décision','Objectifs Fixés','Score Mi-parcours (/20)','Score Final (/20)','Date Décision','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Périodes d'Essai</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="Total Périodes" valeur={total} sousTexte={`${total} période(s)`} />
        <KPICard titre="Taux de Réussite" valeur={`${tauxReussite}%`} sousTexte={`${data.filter(d => d.decision === 'Embauche confirmee').length} confirmées`} />
        <KPICard titre="Note Moyenne" valeur={`${noteMoyenne}/20`} sousTexte="toutes périodes" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell><Chip label={row.typeContrat} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateDebutEssai}</TableCell>
          <TableCell>{row.dateFinEssai}</TableCell>
          <TableCell align="center">{row.duree}</TableCell>
          <TableCell>{row.evaluateur}</TableCell>
          <TableCell align="center"><strong>{row.noteGlobale}</strong>/20</TableCell>
          <TableCell><Chip label={row.decision} size="small" color={decisionColor[row.decision]} /></TableCell>
          <TableCell>{row.objectifsFixes && row.objectifsFixes.length > 40 ? <Tooltip title={row.objectifsFixes} arrow><span>{row.objectifsFixes.substring(0, 40)}...</span></Tooltip> : (row.objectifsFixes || '—')}</TableCell>
          <TableCell align="center">{row.scoreMiParcours !== null ? row.scoreMiParcours : '—'}</TableCell>
          <TableCell align="center">{row.scoreFinal !== null ? row.scoreFinal : '—'}</TableCell>
          <TableCell>{row.dateDecision}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Période d'Essai"
        fields={[{key: "employe", label: "Employé", required: true},{key: "poste", label: "Poste", required: true},{key: "departement", label: "Département", required: true},{key: "typeContrat", label: "Type Contrat", type: "select", options: ["CDI", "CDD", "Stage", "Interim"], required: true},{key: "dateDebutEssai", label: "Date Début", required: true},{key: "dateFinEssai", label: "Date Fin", required: true},{key: "evaluateur", label: "Évaluateur", required: true},{key: "objectifsFixes", label: "Objectifs", multiline: true},{key: "notes", label: "Notes", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "ESS-" + String(nid).padStart(3, '0'), ...{decision: "En cours", noteGlobale: 0, scoreMiParcours: null, scoreFinal: null}, ...vals }]); }}
      />
    </Box>
  );
}
