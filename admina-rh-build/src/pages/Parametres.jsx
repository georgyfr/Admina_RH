import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';

const initialData = [
  { id:1, parametre:'Nom de l\'entreprise', valeur:'HRC Cameroon', categorie:'Général', description:'Nom officiel affiché dans les documents' },
  { id:2, parametre:'Adresse', valeur:'Douala, Cameroun', categorie:'Général', description:'Siège social de l\'entreprise' },
  { id:3, parametre:'Téléphone', valeur:'+237 2 33 42 00', categorie:'Général', description:'Numéro de contact principal' },
  { id:4, parametre:'Email RH', valeur:'rh@hrc-cameroon.com', categorie:'Notifications', description:'Adresse pour les notifications RH' },
  { id:5, parametre:'Durée période d\'essai (CDI)', valeur:'3 mois', categorie:'Contrats', description:'Durée standard pour les contrats CDI' },
  { id:6, parametre:'Durée période d\'essai (CDD)', valeur:'1 mois', categorie:'Contrats', description:'Durée standard pour les contrats CDD' },
  { id:7, parametre:'Salaire minimum', valeur:'36 270 FCFA', categorie:'Rémunération', description:'SMIG en vigueur au Cameroun' },
  { id:8, parametre:'Heures hebdomadaires', valeur:'40', categorie:'Rémunération', description:'Durée légale de travail hebdomadaire' },
  { id:9, parametre:'Taux CNPS employeur', valeur:'4.2%', categorie:'Charges', description:'Taux de cotisation patronale CNPS' },
  { id:10, parametre:'Taux CNPS employé', valeur:'2.8%', categorie:'Charges', description:'Taux de cotisation salariale CNPS' },
];

export default function Parametres() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const cols = ['Paramètre', 'Valeur', 'Catégorie', 'Description'];
  const categories = [...new Set(data.map(d => d.categorie))];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Paramètres du Système</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Configuration générale de l\'application</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouveau paramètre</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="PARAMÈTRES" valeur={data.length} sousTexte="paramètres configurés" />
        <KPICard titre="CATÉGORIES" valeur={categories.length} sousTexte="catégories distinctes" />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{row.parametre}</TableCell>
          <TableCell>{row.valeur}</TableCell>
          <TableCell><Typography variant="body2" color="text.secondary">{row.categorie}</Typography></TableCell>
          <TableCell><Typography variant="body2" color="text.secondary">{row.description}</Typography></TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Nouveau Paramètre"
        fields={[
          {key: "parametre", label: "Paramètre", required: true},
          {key: "valeur", label: "Valeur", required: true},
          {key: "categorie", label: "Catégorie", type: "select", options: ["Général", "Notifications", "Contrats", "Rémunération", "Charges", "Sécurité"], required: true},
          {key: "description", label: "Description", multiline: true},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, ...vals }]); }}
      />
    </Box>
  );
}