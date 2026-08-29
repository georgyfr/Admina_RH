import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';
const statutColor = { 'En cours': 'warning', 'Termine': 'success', 'Abandonne': 'error', 'Embauche': 'info' };

const initialData = [
  { id:1, numero:'STG-001', nom:'Tchoumi Sandra', prenom:'Sandra', etablissement:'Université de Douala', formation:'Licence Gestion Hôtelière', departementAccueil:'Restauration', tuteur:'M. Nkoulou Amina', dateDebut:'01/01/2025', dateFin:'30/06/2025', duree:181,
    indemnite:50000, statut:'En cours', evaluation:14, notes:'Très motivée' },
  { id:2, numero:'STG-002', nom:'Bikay Patricia', prenom:'Patricia', etablissement:'ISTAG', formation:'BTS Comptabilité', departementAccueil:'Finance & Comptabilite', tuteur:'M. Tabi Sandrine', dateDebut:'01/02/2025', dateFin:'31/07/2025', duree:181,
    indemnite:45000, statut:'En cours', evaluation:15, notes:'Bonne performance' },
  { id:3, numero:'STG-003', nom:'Ngassa Jean', prenom:'Jean', etablissement:'Université de Yaoundé', formation:'Master Informatique', departementAccueil:'Informatique', tuteur:'M. Kamga Blaise', dateDebut:'01/03/2025', dateFin:'31/08/2025', duree:184,
    indemnite:50000, statut:'En cours', evaluation:null, notes:'Profil développeur prometteur' },
  { id:4, numero:'STG-004', nom:'Fotso Brigitte', prenom:'Brigitte', etablissement:'Ecole Hôtelière de Douala', formation:'BTS Hôtellerie', departementAccueil:'Hébergement', tuteur:'Mme. Fotso Marie', dateDebut:'01/01/2025', dateFin:'30/06/2025', duree:181,
    indemnite:50000, statut:'En cours', evaluation:16, notes:'Excellente stagiaire' },
  { id:5, numero:'STG-005', nom:'Moukouri Patrice', prenom:'Patrice', etablissement:'ISTAG', formation:'Licence RH', departementAccueil:'Ressources Humaines', tuteur:'M. Nkoulou Paul', dateDebut:'01/01/2025', dateFin:'30/06/2025', duree:181,
    indemnite:45000, statut:'En cours', evaluation:13, notes:'' },
  { id:6, numero:'STG-006', nom:'Eyenga Carine', prenom:'Carine', etablissement:'Université de Douala', formation:'Licence Communication', departementAccueil:'Marketing & Communication', tuteur:'Mme. Mebara Nadège', dateDebut:'01/02/2025', dateFin:'31/07/2025', duree:181,
    indemnite:45000, statut:'En cours', evaluation:14, notes:'Créative' },
  { id:7, numero:'STG-007', nom:'Tchinda Armand', prenom:'Armand', etablissement:'Université de Dschang', formation:'Master Logistique', departementAccueil:'Logistique & Approvisionnement', tuteur:'M. Ngo Ndobo Alain', dateDebut:'01/03/2025', dateFin:'31/08/2025', duree:184,
    indemnite:50000, statut:'En cours', evaluation:null, notes:'' },
  { id:8, numero:'STG-008', nom:'Nkoulou Stephane', prenom:'Stephane', etablissement:'ENSP Yaoundé', formation:'Licence Sécurité', departementAccueil:'Sécurité', tuteur:'M. Kamga Blaise', dateDebut:'01/01/2025', dateFin:'30/06/2025', duree:181,
    indemnite:45000, statut:'Termine', evaluation:15, notes:'Stagiaire sérieux, embauché en CDD' },
  { id:9, numero:'STG-009', nom:'Atangana Sarah', prenom:'Sarah', etablissement:'Ecole Hôtelière de Douala', formation:'BTS Restauration', departementAccueil:'Restauration', tuteur:'M. Nkoulou Amina', dateDebut:'01/02/2025', dateFin:'15/04/2025', duree:74,
    indemnite:40000, statut:'Abandonne', evaluation:10, notes:'Abandon pour raison personnelle' },
  { id:10, numero:'STG-010', nom:'Bikay Patricia', prenom:'Patricia', etablissement:'ISTAG', formation:'BTS Comptabilité', departementAccueil:'Finance & Comptabilite', tuteur:'M. Tabi Sandrine', dateDebut:'01/01/2025', dateFin:'30/06/2025', duree:181,
    indemnite:45000, statut:'Embauche', evaluation:17, notes:'Embauchée suite au stage' },
];

export default function Stagiaires() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const total = data.length;
  const enCours = data.filter(d => d.statut === 'En cours').length;
  const indemniteTotale = data.reduce((s, d) => s + (d.indemnite || 0), 0);

  const cols = ['N°','Nom','Prénom','Établissement','Formation','Département Accueil','Tuteur','Date Début','Date Fin','Durée (jours)','Indemnité (FCFA/mois)','Statut','Évaluation (/20)','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Stagiaires</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="Total Stagiaires" valeur={total} sousTexte={`${total} stagiaire(s)`} />
        <KPICard titre="En Cours" valeur={enCours} sousTexte="stagiaires actifs" />
        <KPICard titre="Indemnité Totale" valeur={formatFCFA(indemniteTotale)} sousTexte="tous stagiaires" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.nom}</TableCell>
          <TableCell>{row.prenom}</TableCell>
          <TableCell>{row.etablissement}</TableCell>
          <TableCell>{row.formation}</TableCell>
          <TableCell><Chip label={row.departementAccueil} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.tuteur}</TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin}</TableCell>
          <TableCell align="center">{row.duree}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.indemnite)}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell align="center">{row.evaluation !== null ? row.evaluation : '—'}</TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
