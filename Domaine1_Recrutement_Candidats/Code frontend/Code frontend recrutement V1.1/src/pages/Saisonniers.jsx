import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';
const statutColor = { 'En cours': 'warning', 'Termine': 'success', 'Abandonne': 'error' };

const initialData = [
  { id:1, numero:'SAI-001', nom:'Nkoum Patrick', prenom:'Patrick', poste:'Agent de Sécurité', departement:'Sécurité', dateDebut:'01/12/2024', dateFin:'31/03/2025', duree:121, statut:'Termine', tauxHoraire:2500, coutTotal:302500,
    motif:'Remplacement', source:'Site web entreprise', notes:'Saison de fin d\'année' },
  { id:2, numero:'SAI-002', nom:'Nganou Carine', prenom:'Carine', poste:'Agent Accueil', departement:'Hébergement', dateDebut:'01/12/2024', dateFin:'28/02/2025', duree:90, statut:'Termine', tauxHoraire:2000, coutTotal:180000,
    motif:'Saisonnalite', source:'Cooptation', notes:'' },
  { id:3, numero:'SAI-003', nom:'Fomumbod Thierry', prenom:'Thierry', poste:'Serveur', departement:'Restauration', dateDebut:'15/12/2024', dateFin:'15/03/2025', duree:91, statut:'Termine', tauxHoraire:1800, coutTotal:163800,
    motif:'Saisonnalite', source:'Candidature spontanee', notes:'' },
  { id:4, numero:'SAI-004', nom:'Tchouankou Gloire', prenom:'Gloire', poste:'Plongeur', departement:'Restauration', dateDebut:'01/01/2025', dateFin:'30/04/2025', duree:120, statut:'En cours', tauxHoraire:1500, coutTotal:180000,
    motif:'Surcharge', source:'Site web entreprise', notes:'' },
  { id:5, numero:'SAI-005', nom:'Moukouri Yvan', prenom:'Yvan', poste:'Agent de Blanchisserie', departement:'Lingerie', dateDebut:'01/01/2025', dateFin:'30/04/2025', duree:120, statut:'En cours', tauxHoraire:1500, coutTotal:180000,
    motif:'Saisonnalite', source:'Presse', notes:'' },
  { id:6, numero:'SAI-006', nom:'Atangana Bruno', prenom:'Bruno', poste:'Jardinier', departement:'Maintenance', dateDebut:'01/01/2025', dateFin:'31/05/2025', duree:151, statut:'En cours', tauxHoraire:1500, coutTotal:226500,
    motif:'Remplacement', source:'Cooptation', notes:'Remplacement congé maternité' },
  { id:7, numero:'SAI-007', nom:'Eyenga Junior', prenom:'Junior', poste:'Agent de Sécurité', departement:'Sécurité', dateDebut:'01/02/2025', dateFin:'31/05/2025', duree:120, statut:'En cours', tauxHoraire:2500, coutTotal:300000,
    motif:'Saisonnalite', source:'Cabinet de recrutement', notes:'' },
  { id:8, numero:'SAI-008', nom:'Tabi Estelle', prenom:'Estelle', poste:'Aide Cuisinière', departement:'Restauration', dateDebut:'01/03/2025', dateFin:'31/05/2025', duree:92, statut:'En cours', tauxHoraire:1600, coutTotal:147200,
    motif:'Surcharge', source:'Candidature spontanee', notes:'' },
  { id:9, numero:'SAI-009', nom:'Nkoulou Fabrice', prenom:'Fabrice', poste:'Manutentionnaire', departement:'Logistique & Approvisionnement', dateDebut:'15/02/2025', dateFin:'15/05/2025', duree:90, statut:'En cours', tauxHoraire:1500, coutTotal:135000,
    motif:'Surcharge', source:'Site web entreprise', notes:'' },
  { id:10, numero:'SAI-010', nom:'Tchouankou Gloire', prenom:'Gloire', poste:'Agent de Sécurité', departement:'Sécurité', dateDebut:'01/01/2025', dateFin:'31/03/2025', duree:90, statut:'Termine', tauxHoraire:2500, coutTotal:225000,
    motif:'Remplacement', source:'Référence interne', notes:'Contrat terminé' },
];

export default function Saisonniers() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [dlg, setDlg] = useState(false);

  const total = data.length;
  const coutTotal = data.reduce((s, d) => s + d.coutTotal, 0);
  const dureeMoyenne = Math.round(data.reduce((s, d) => s + d.duree, 0) / total);

  const cols = ['N°','Nom','Prénom','Poste','Département','Date Début','Date Fin','Durée (jours)','Statut','Taux Horaire (FCFA)','Coût Total (FCFA)','Motif','Source','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Saisonniers</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="Total Saisonniers" valeur={total} sousTexte={`${total} saisonnier(s)`} />
        <KPICard titre="Coût Total" valeur={formatFCFA(coutTotal)} sousTexte="tous saisonniers" />
        <KPICard titre="Durée Moyenne" valeur={`${dureeMoyenne} jours`} sousTexte="moyenne des contrats" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.numero}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.nom}</TableCell>
          <TableCell>{row.prenom}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin}</TableCell>
          <TableCell align="center">{row.duree}</TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.tauxHoraire)}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutTotal)}</TableCell>
          <TableCell><Chip label={row.motif} size="small" variant="outlined" /></TableCell>
          <TableCell><Chip label={row.source} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    
      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter un Saisonnier"
        fields={[{key: "nom", label: "Nom", required: true},{key: "prenom", label: "Prénom", required: true},{key: "poste", label: "Poste", required: true},{key: "departement", label: "Département", required: true},{key: "dateDebut", label: "Date Début", required: true},{key: "dateFin", label: "Date Fin", required: true},{key: "tauxHoraire", label: "Taux Horaire (FCFA)", type: "number", required: true},{key: "statut", label: "Statut", type: "select", options: ["En cours", "Termine", "Abandonne"], required: true},{key: "motif", label: "Motif", type: "select", options: ["Remplacement", "Saisonnalite", "Surcharge", "Reorganisation"]},{key: "source", label: "Source", type: "select", options: ["Site web entreprise", "Presse", "Cooptation", "Reseaux sociaux", "Candidature spontanee", "Cabinet de recrutement"]},{key: "notes", label: "Notes", multiline: true}]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "SAI-" + String(nid).padStart(3, '0'), ...{}, ...vals }]); }}
      />
    </Box>
  );
}
