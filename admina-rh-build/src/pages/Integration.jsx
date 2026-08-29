import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'En cours': 'warning', 'Terminee': 'success', 'Echec': 'error', 'Prolongee': 'info' };

const initialData = [
  { id:1, numero:'INT-001', employe:'Nkoulou Amina', poste:'Chef Cuisinier', departement:'Restauration', dateArrivee:'01/03/2025', managerAccueil:'M. Nkoulou Paul', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'En cours', visiteLocaux:'Fait', statutIntegration:'En cours', dateFinIntegration:'01/06/2025', notes:'Parcours standard' },
  { id:2, numero:'INT-002', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', departement:'Hébergement', dateArrivee:'15/03/2025', managerAccueil:'Mme. Fotso Marie', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'Planifiée', visiteLocaux:'Fait', statutIntegration:'En cours', dateFinIntegration:'15/06/2025', notes:'' },
  { id:3, numero:'INT-003', employe:'Tabi Sandrine', poste:'Comptable Senior', departement:'Finance & Comptabilite', dateArrivee:'01/02/2025', managerAccueil:'M. Tchouankou Jean', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'Terminée', visiteLocaux:'Fait', statutIntegration:'Terminee', dateFinIntegration:'01/05/2025', notes:'Intégration réussie' },
  { id:4, numero:'INT-004', employe:'Eyenga Clarisse', poste:'Agent Accueil', departement:'Service Client', dateArrivee:'10/02/2025', managerAccueil:'M. Nkoulou Paul', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'Terminée', visiteLocaux:'Fait', statutIntegration:'Terminee', dateFinIntegration:'10/05/2025', notes:'Excellente intégration' },
  { id:5, numero:'INT-005', employe:'Nganou André', poste:'Agent de Sécurité', departement:'Sécurité', dateArrivee:'01/03/2025', managerAccueil:'M. Kamga Blaise', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'En cours',
    formationMetier:'En cours', visiteLocaux:'Fait', statutIntegration:'En cours', dateFinIntegration:'01/06/2025', notes:'' },
  { id:6, numero:'INT-006', employe:'Kamga Blaise', poste:'Développeur Full Stack', departement:'Informatique', dateArrivee:'01/04/2025', managerAccueil:'M. Ngo Ndobo Alain', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'En cours', compteInfo:'En cours',
    formationMetier:'Planifiée', visiteLocaux:'Non fait', statutIntegration:'En cours', dateFinIntegration:'01/07/2025', notes:'Config IT en cours' },
  { id:7, numero:'INT-007', employe:'Mebara Nadège', poste:'Community Manager', departement:'Marketing & Communication', dateArrivee:'15/03/2025', managerAccueil:'Mme. Mebara Nadège', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'En cours', visiteLocaux:'Fait', statutIntegration:'En cours', dateFinIntegration:'15/06/2025', notes:'' },
  { id:8, numero:'INT-008', employe:'Ngo Ndobo Alain', poste:'Chef Approvisionnement', departement:'Logistique & Approvisionnement', dateArrivee:'01/02/2025', managerAccueil:'M. Nkoulou Paul', docsAdmin:'Oui', formationSecurite:'Oui', equipementBadge:'Oui', compteInfo:'Oui',
    formationMetier:'Terminée', visiteLocaux:'Fait', statutIntegration:'Terminee', dateFinIntegration:'01/05/2025', notes:'Intégration complète' },
  { id:9, numero:'INT-009', employe:'Tchouankou Gloire', poste:'Agent de Blanchisserie', departement:'Lingerie', dateArrivee:'01/04/2025', managerAccueil:'Mme. Ateba Chantal', docsAdmin:'En cours', formationSecurite:'Planifiée', equipementBadge:'En cours', compteInfo:'Non',
    formationMetier:'Planifiée', visiteLocaux:'Non fait', statutIntegration:'En cours', dateFinIntegration:'01/07/2025', notes:'Démarrage progressif' },
];

export default function Integration() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const enCours = data.filter(d => d.statutIntegration === 'En cours').length;
  const terminees = data.filter(d => d.statutIntegration === 'Terminee').length;
  const enRetard = 0;

  const cols = ['N°','Employé','Poste','Département','Date Arrivée','Manager Accueillant','Documents Admin','Formation Sécurité','Équipement Badge','Compte Informatique','Formation Métier','Visite Locaux','Statut Intégration','Date Fin Intégration','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Intégration Employé</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>9 intégrations</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle Intégration</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="EN COURS" valeur={enCours} sousTexte="intégrations en cours" />
        <KPICard titre="TERMINÉES" valeur={terminees} sousTexte="intégrations complétées" />
        <KPICard titre="EN RETARD" valeur={enRetard} sousTexte="retards signalés" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateArrivee}</TableCell>
          <TableCell>{row.managerAccueil}</TableCell>
          <TableCell><Chip label={row.docsAdmin} size="small" color={row.docsAdmin === 'Oui' ? 'success' : row.docsAdmin === 'En cours' ? 'warning' : 'default'} /></TableCell>
          <TableCell><Chip label={row.formationSecurite} size="small" color={row.formationSecurite === 'Oui' ? 'success' : row.formationSecurite === 'Planifiée' ? 'info' : 'default'} /></TableCell>
          <TableCell><Chip label={row.equipementBadge} size="small" color={row.equipementBadge === 'Oui' ? 'success' : row.equipementBadge === 'En cours' ? 'warning' : 'default'} /></TableCell>
          <TableCell><Chip label={row.compteInfo === 'Oui' ? 'Oui' : row.compteInfo === 'En cours' ? 'En cours' : 'Non'} size="small" color={row.compteInfo === 'Oui' ? 'success' : row.compteInfo === 'En cours' ? 'warning' : 'error'} /></TableCell>
          <TableCell><Chip label={row.formationMetier} size="small" color={row.formationMetier === 'Terminée' ? 'success' : row.formationMetier === 'En cours' ? 'warning' : 'info'} /></TableCell>
          <TableCell><Chip label={row.visiteLocaux} size="small" color={row.visiteLocaux === 'Fait' ? 'success' : 'default'} /></TableCell>
          <TableCell><Chip label={row.statutIntegration} size="small" color={statutColor[row.statutIntegration]} /></TableCell>
          <TableCell>{row.dateFinIntegration}</TableCell>
          <TableCell>{row.notes || '—'}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
