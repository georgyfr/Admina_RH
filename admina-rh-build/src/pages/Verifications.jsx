import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'Favorable': 'success', 'Defavorable': 'error', 'Partiel': 'warning', 'En cours': 'info' };

const initialData = [
  { id:1, numero:'VERIF-2025-001', candidat:'Ndiaye Moussa', entreprise:'Hôtel Sawa', contact:'M. Mbarga Jean', telephone:'+237 699 123 456', dateVerification:'18/02/2025', verificateur:'Mme. Fotso Marie', statut:'Favorable',
    elementsVerifies: ['Diplome','Experience','Comportement'], resultatGlobal:'Favorable',
    detailsRetour:'Tous les éléments vérifiés sont conformes. Ancien employeur très satisfait.',
    suitesDonnees:'Embauche validée par DRH',
    decisionFinale:'Embauche recommandee', dateDecision:'20/02/2025',
    resultatChips: ['Fiabilité','Performance','Comportement'] },
  { id:2, numero:'VERIF-2025-002', candidat:'Tabe Arnaud', entreprise:'Hôtel Sélect', contact:'Mme. Ngassa Clarisse', telephone:'+237 677 987 654', dateVerification:'22/02/2025', verificateur:'M. Nkoulou Paul', statut:'Favorable',
    elementsVerifies: ['Diplome','Experience'], resultatGlobal:'Favorable',
    detailsRetour:'Diplôme vérifié auprès de l\'établissement. Expérience confirmée sur 3 ans.',
    suitesDonnees:'Processus en cours',
    decisionFinale:'En attente decision', dateDecision:'25/02/2025',
    resultatChips: ['Fiabilité','Performance'] },
];

export default function Verifications() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalVerif = data.length;
  const verifies = data.filter(d => d.statut === 'Favorable').length;
  const enAttente = 0;
  const nonVerifies = 0;

  const cols = ['Candidat','Entreprise','Contact','Téléphone','Date Vérification','Vérificateur','Statut','Résultat','Actions','N° Vérif.','Poste Visé','Éléments Vérifiés','Résultat Global','Détails/Retour','Suites Données','Décision Finale','Date Décision'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Vérification des Références</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>2 vérifications enregistrées</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Ajouter Vérification</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL" valeur={totalVerif} sousTexte={`${totalVerif} vérification(s)`} />
        <KPICard titre="VÉRIFIÉS" valeur={verifies} sousTexte={`${Math.round(verifies / Math.max(totalVerif, 1) * 100)}% vérifiés`} />
        <KPICard titre="EN ATTENTE" valeur={enAttente} sousTexte="vérifications en attente" />
        <KPICard titre="NON VÉRIFIÉS" valeur={nonVerifies} sousTexte="vérifications échouées" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell>{row.entreprise}</TableCell>
          <TableCell>{row.contact}</TableCell>
          <TableCell>{row.telephone}</TableCell>
          <TableCell>{row.dateVerification}</TableCell>
          <TableCell>{row.verificateur}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {row.resultatChips.map((chip, i) => <Chip key={i} label={chip} size="small" variant="outlined" color={row.statut === 'Favorable' ? 'success' : 'default'} />)}
            </Box>
          </TableCell>
          <TableCell><Button size="small" variant="outlined">Voir</Button></TableCell>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
          <TableCell>{row.posteVisé || '—'}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {row.elementsVerifies.map((el, i) => <Chip key={i} label={el} size="small" variant="outlined" />)}
            </Box>
          </TableCell>
          <TableCell><Chip label={row.resultatGlobal} size="small" color={statutColor[row.resultatGlobal]} /></TableCell>
          <TableCell>{row.detailsRetour && row.detailsRetour.length > 35 ? <Tooltip title={row.detailsRetour} arrow><span>{row.detailsRetour.substring(0, 35)}...</span></Tooltip> : (row.detailsRetour || '—')}</TableCell>
          <TableCell>{row.suitesDonnees || '—'}</TableCell>
          <TableCell><Chip label={row.decisionFinale} size="small" color={row.decisionFinale === 'Embauche recommandee' ? 'success' : 'default'} /></TableCell>
          <TableCell>{row.dateDecision || '—'}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
