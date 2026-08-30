import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const statutColor = { 'Fait': 'success', 'En cours': 'warning', 'A faire': 'default', 'Non applicable': 'info' };

const initialData = [
  { id:1, numero:'CHK-001', employe:'Nkoulou Amina', poste:'Chef Cuisinier', categorie:'Documents administratifs', etape:'Dossier administratif complet', responsable:'RH', datePrevue:'01/03/2025', dateRealisee:'01/03/2025', statut:'Fait', commentaires:'Tous les documents reçus', departement:'Restauration', dateArrivee:'01/03/2025' },
  { id:2, numero:'CHK-002', employe:'Nkoulou Amina', poste:'Chef Cuisinier', categorie:'Formation securite', etape:'Sécurité incendie & HACCP', responsable:'Sécurité', datePrevue:'03/03/2025', dateRealisee:'03/03/2025', statut:'Fait', commentaires:'Formation validée', departement:'Restauration', dateArrivee:'01/03/2025' },
  { id:3, numero:'CHK-003', employe:'Nkoulou Amina', poste:'Chef Cuisinier', categorie:'Equipement & Badge', etape:'Remise badge et uniforme', responsable:'Administration', datePrevue:'01/03/2025', dateRealisee:'01/03/2025', statut:'Fait', commentaires:'', departement:'Restauration', dateArrivee:'01/03/2025' },
  { id:4, numero:'CHK-004', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', categorie:'Documents administratifs', etape:'Contrat signé, documents complets', responsable:'RH', datePrevue:'15/03/2025', dateRealisee:'15/03/2025', statut:'Fait', commentaires:'', departement:'Hébergement', dateArrivee:'15/03/2025' },
  { id:5, numero:'CHK-005', employe:'Mbarga Paul', poste:'Réceptionniste Nuit', categorie:'Formation securite', etape:'Sécurité incendie', responsable:'Sécurité', datePrevue:'18/03/2025', dateRealisee:'18/03/2025', statut:'Fait', commentaires:'', departement:'Hébergement', dateArrivee:'15/03/2025' },
  { id:6, numero:'CHK-006', employe:'Tabi Sandrine', poste:'Comptable Senior', categorie:'Documents administratifs', etape:'Vérification diplômes', responsable:'RH', datePrevue:'01/02/2025', dateRealisee:'01/02/2025', statut:'Fait', commentaires:'Diplôme Licence Comptabilité vérifié', departement:'Finance & Comptabilite', dateArrivee:'01/02/2025' },
  { id:7, numero:'CHK-007', employe:'Tabi Sandrine', poste:'Comptable Senior', categorie:'Compte informatique', etape:'Création comptes Sage & email', responsable:'IT', datePrevue:'03/02/2025', dateRealisee:'05/02/2025', statut:'Fait', commentaires:'Retard de 2 jours', departement:'Finance & Comptabilite', dateArrivee:'01/02/2025' },
  { id:8, numero:'CHK-008', employe:'Eyenga Clarisse', poste:'Agent Accueil', categorie:'Documents administratifs', etape:'Dossier complet', responsable:'RH', datePrevue:'10/02/2025', dateRealisee:'10/02/2025', statut:'Fait', commentaires:'', departement:'Service Client', dateArrivee:'10/02/2025' },
  { id:9, numero:'CHK-009', employe:'Nganou André', poste:'Agent de Sécurité', categorie:'Equipement & Badge', etape:'Badge et équipement sécurité', responsable:'Sécurité', datePrevue:'01/03/2025', dateRealisee:'03/03/2025', statut:'Fait', commentaires:'Livraison retardée', departement:'Sécurité', dateArrivee:'01/03/2025' },
  { id:10, numero:'CHK-010', employe:'Kamga Blaise', poste:'Développeur Full Stack', categorie:'Compte informatique', etape:'Config poste dev + accès', responsable:'IT', datePrevue:'01/04/2025', dateRealisee:'', statut:'En cours', commentaires:'En attente matériel', departement:'Informatique', dateArrivee:'01/04/2025' },
  { id:11, numero:'CHK-011', employe:'Mebara Nadège', poste:'Community Manager', categorie:'Formation metier', etape:'Formation outils marketing', responsable:'Marketing', datePrevue:'20/03/2025', dateRealisee:'', statut:'A faire', commentaires:'', departement:'Marketing & Communication', dateArrivee:'15/03/2025' },
];

export default function Checklist() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const totalTaches = data.length;
  const faites = data.filter(d => d.statut === 'Fait').length;
  const enCours = data.filter(d => d.statut === 'En cours').length;
  const aFaire = data.filter(d => d.statut === 'A faire').length;

  const cols = ['N°','Employé','Poste','Catégorie','Étape/Tâche','Responsable','Date Prévue','Date Réalisée','Statut','Commentaires','Département','Date Arrivée'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Checklist d'Intégration</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>11 tâches au total</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouvelle Tâche</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL TÂCHES" valeur={totalTaches} sousTexte={`${totalTaches} tâche(s)`} />
        <KPICard titre="FAITES" valeur={faites} sousTexte={`${Math.round(faites / totalTaches * 100)}% accompli`} />
        <KPICard titre="EN COURS" valeur={enCours} sousTexte="en progression" />
        <KPICard titre="À FAIRE" valeur={aFaire} sousTexte="en attente" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell>{row.employe}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.categorie} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.etape}</TableCell>
          <TableCell>{row.responsable}</TableCell>
          <TableCell>{row.datePrevue}</TableCell>
          <TableCell>{row.dateRealisee || '—'}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell>{row.commentaires || '—'}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateArrivee}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Tâche"
        fields={[{key: "employe", label: "Employé", required: true},{key: "poste", label: "Poste", required: true},{key: "categorie", label: "Catégorie", type: "select", options: ["Documents administratifs", "Formation securite", "Formation metier", "Equipement & Badge", "Presentation equipes", "Visite locaux", "Compte informatique"], required: true},{key: "etape", label: "Étape/Tâche", required: true},{key: "responsable", label: "Responsable", required: true},{key: "datePrevue", label: "Date Prévue", required: true},{key: "departement", label: "Département"},{key: "commentaires", label: "Commentaires", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "CHK-" + String(nid).padStart(3, '0'), ...{statut: "A faire", dateRealisee: ""}, ...vals }]); }}
      />
    </Box>
  );
}
