import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';
const prioriteColor = { 'Urgente': 'error', 'Haute': 'warning', 'Moyenne': 'info', 'Basse': 'default' };
const statutColor = { 'A creer': 'default', 'Publiee': 'info', 'Candidatures en cours': 'warning', 'Cloturee': 'success', 'Annulee': 'error' };

const initialData = [
  { id:1, numero:'PO-001', departement:'Restauration', poste:'Chef Cuisinier', effectifActuel:2, effectifPrevu:3, ecart:'+1', motif:'Remplacement', dateBesoin:'01/02/2025', priorite:'Urgente', statut:'Cloturee', canalDiffusion:'Cabinet',
    budget:350000, profilRecherche:'BTS Hotellerie, 5 ans exp. cuisine camerounaise et internationale', datePublication:'15/01/2025', candidaturesRecues:8, notes:'Poste pourvu via HRC Cameroon' },
  { id:2, numero:'PO-002', departement:'Herbergement', poste:'Réceptionniste Nuit', effectifActuel:3, effectifPrevu:5, ecart:'+2', motif:'Saisonnalite', dateBesoin:'01/03/2025', priorite:'Haute', statut:'Candidatures en cours', canalDiffusion:'Site web',
    budget:180000, profilRecherche:'BTS Hotellerie, bilingue, expérience accueil hôtelier', datePublication:'20/01/2025', candidaturesRecues:12, notes:'Saison haute approche, besoin urgent' },
  { id:3, numero:'PO-003', departement:'Finance & Comptabilite', poste:'Comptable Senior', effectifActuel:2, effectifPrevu:3, ecart:'+1', motif:'Creation de poste', dateBesoin:'01/04/2025', priorite:'Moyenne', statut:'Candidatures en cours', canalDiffusion:'LinkedIn',
    budget:400000, profilRecherche:'Licence/Master Comptabilité, 5 ans exp., logiciel Sage', datePublication:'25/01/2025', candidaturesRecues:6, notes:'Recherche spécialisée via Activa RH' },
  { id:4, numero:'PO-004', departement:'Service Client', poste:'Agent Accueil', effectifActuel:1, effectifPrevu:2, ecart:'+1', motif:'Surcharge', dateBesoin:'15/02/2025', priorite:'Haute', statut:'Cloturee', canalDiffusion:'Cooptation',
    budget:150000, profilRecherche:'BTS Commerce, bonne présentation, sens du service', datePublication:'01/02/2025', candidaturesRecues:5, notes:'Recrutement rapide réussi' },
  { id:5, numero:'PO-005', departement:'Securite', poste:'Agent de Sécurité', effectifActuel:4, effectifPrevu:7, ecart:'+3', motif:'Remplacement', dateBesoin:'01/03/2025', priorite:'Moyenne', statut:'Publiee', canalDiffusion:'Site web',
    budget:120000, profilRecherche:'Certification sécurité, expérience 2 ans minimum', datePublication:'05/02/2025', candidaturesRecues:3, notes:'' },
  { id:6, numero:'PO-006', departement:'Informatique', poste:'Développeur Full Stack', effectifActuel:1, effectifPrevu:2, ecart:'+1', motif:'Creation de poste', dateBesoin:'01/05/2025', priorite:'Basse', statut:'A creer', canalDiffusion:'',
    budget:500000, profilRecherche:'Master Informatique, React/Node.js, 3 ans exp.', datePublication:'', candidaturesRecues:0, notes:'Profil rare, planification en cours' },
  { id:7, numero:'PO-007', departement:'Marketing & Communication', poste:'Community Manager', effectifActuel:1, effectifPrevu:2, ecart:'+1', motif:'Surcharge', dateBesoin:'01/03/2025', priorite:'Haute', statut:'Candidatures en cours', canalDiffusion:'Reseaux sociaux',
    budget:250000, profilRecherche:'Licence Communication, maîtrise réseaux sociaux, créatif', datePublication:'15/02/2025', candidaturesRecues:9, notes:'' },
  { id:8, numero:'PO-008', departement:'Logistique & Approvisionnement', poste:'Chef Approvisionnement', effectifActuel:1, effectifPrevu:2, ecart:'+1', motif:'Creation de poste', dateBesoin:'01/06/2025', priorite:'Moyenne', statut:'Publiee', canalDiffusion:'LinkedIn',
    budget:450000, profilRecherche:'BTS Logistique, 5 ans exp. achats, SAP préférable', datePublication:'20/02/2025', candidaturesRecues:4, notes:'Processus avec Michael Page Cameroon' },
  { id:9, numero:'PO-009', departement:'Audiovisuel', poste:'Technicien Audiovisuel', effectifActuel:2, effectifPrevu:3, ecart:'+1', motif:'Remplacement', dateBesoin:'15/03/2025', priorite:'Urgente', statut:'Annulee', canalDiffusion:'',
    budget:200000, profilRecherche:'BTS Audiovisuel, expérience montage/son', datePublication:'', candidaturesRecues:2, notes:'Poste annulé faute de budget' },
  { id:10, numero:'PO-010', departement:'Lingerie', poste:'Agent de Blanchisserie', effectifActuel:1, effectifPrevu:3, ecart:'+2', motif:'Saisonnalite', dateBesoin:'01/04/2025', priorite:'Basse', statut:'A creer', canalDiffusion:'',
    budget:100000, profilRecherche:'Sans diplôme requis, expérience blanchisserie industrielle', datePublication:'', candidaturesRecues:0, notes:'' },
  { id:11, numero:'PO-011', departement:'Maintenance', poste:'Technicien Maintenance', effectifActuel:2, effectifPrevu:3, ecart:'+1', motif:'Remplacement', dateBesoin:'01/05/2025', priorite:'Moyenne', statut:'A creer', canalDiffusion:'',
    budget:200000, profilRecherche:'BTS Electromécanique, plomberie/électricité/CVC', datePublication:'', candidaturesRecues:0, notes:'Départ prévu en avril' },
];

export default function Previsions() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalPostes = data.length;
  const ecartTotal = data.reduce((s, d) => s + parseInt(d.ecart.replace('+', '') || '0', 10), 0);
  const budgetTotal = data.reduce((s, d) => s + (d.budget || 0), 0);

  const cols = ['N° Offre','Département','Poste','Effectif Actuel','Effectif Prévu','Écart','Motif','Date Besoin','Priorité','Statut','Canal Diffusion','Budget (FCFA)','Profil Recherche','Date Publication','Candidatures Reçues','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Prévisions — Postes & Offres</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>11 offres prévisionnelles</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle Prévision</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL POSTES PRÉVUS" valeur={totalPostes} sousTexte={`${totalPostes} poste(s) planifié(s)`} />
        <KPICard titre="ÉCART TOTAL" valeur={`+${ecartTotal}`} sousTexte="postes à pourvoir" />
        <KPICard titre="BUDGET TOTAL" valeur={formatFCFA(budgetTotal)} sousTexte="budget prévisionnel" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell align="center">{row.effectifActuel}</TableCell>
          <TableCell align="center">{row.effectifPrevu}</TableCell>
          <TableCell align="center" sx={{ color: parseInt(row.ecart.replace('+', '')) > 0 ? 'error.main' : 'text.primary', fontWeight: 600 }}>{row.ecart}</TableCell>
          <TableCell><Chip label={row.motif} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateBesoin}</TableCell>
          <TableCell><Chip label={row.priorite} size="small" color={prioriteColor[row.priorite]} /></TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell>{row.canalDiffusion ? <Chip label={row.canalDiffusion} size="small" variant="outlined" /> : '—'}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.budget)}</TableCell>
          <TableCell>{row.profilRecherche && row.profilRecherche.length > 40 ? <Tooltip title={row.profilRecherche} arrow><span>{row.profilRecherche.substring(0, 40)}...</span></Tooltip> : (row.profilRecherche || '—')}</TableCell>
          <TableCell>{row.datePublication || '—'}</TableCell>
          <TableCell align="center">{row.candidaturesRecues}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
