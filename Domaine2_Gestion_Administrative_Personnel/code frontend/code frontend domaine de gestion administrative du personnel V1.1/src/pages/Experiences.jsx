// Experiences page v2
import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, FormControl, Select, MenuItem, Tooltip } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  { id:1, candidat:'Ndiaye Moussa', entreprise:'Hôtel Sawa', poste:'Chef Cuisinier', dateDebut:'01/2015', dateFin:'12/2024', duree:'9 ans 11 mois', description:'Responsable cuisine française et camerounaise, gestion équipe 12 personnes', verifiee:'Oui' },
  { id:2, candidat:'Ndiaye Moussa', entreprise:'Résidence Palace', poste:'Sous-chef', dateDebut:'03/2010', dateFin:'12/2014', duree:'4 ans 9 mois', description:'Cuisine internationale, banquets et événements', verifiee:'Oui' },
  { id:3, candidat:'Tchouankou Claire', entreprise:'Cabinet Fiduciaire ABC', poste:'Comptable', dateDebut:'09/2019', dateFin:'01/2025', duree:'5 ans 4 mois', description:'Comptabilité générale, TVA, IS, déclarations fiscales', verifiee:'Oui' },
  { id:4, candidat:'Nganou André', entreprise:'Groupo Security', poste:'Agent de sécurité', dateDebut:'06/2020', dateFin:'06/2023', duree:'3 ans', description:'Surveillance, contrôle d\'accès, rondes', verifiee:'Oui' },
  { id:5, candidat:'Mebara Nadège', entreprise:'Hôtel Mont Fébé', poste:'Réceptionniste', dateDebut:'01/2021', dateFin:'11/2024', duree:'3 ans 10 mois', description:'Accueil client, réservations, facturation', verifiee:'Oui' },
  { id:6, candidat:'Kamga Blaise', entreprise:'Activa Technologies', poste:'Développeur Junior', dateDebut:'04/2018', dateFin:'08/2022', duree:'4 ans 4 mois', description:'Développement web, PHP, MySQL, JavaScript', verifiee:'Oui' },
  { id:7, candidat:'Kamga Blaise', entreprise:'Freelance', poste:'Développeur Full Stack', dateDebut:'09/2022', dateFin:'', duree:'En cours', description:'Projets React, Node.js, déploiement cloud', verifiee:'Non' },
  { id:8, candidat:'Eyenga Clarisse', entreprise:'Agence Marketing Plus', poste:'Community Manager', dateDebut:'02/2023', dateFin:'12/2024', duree:'1 an 10 mois', description:'Gestion réseaux sociaux, création contenu, publicité digitale', verifiee:'Oui' },
];

const verifieeColor = { 'Oui': 'success', 'Non': 'warning' };

export default function Experiences() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterCandidat, setFilterCandidat] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const candidats = useMemo(() => ['Tous', ...new Set(data.map(d => d.candidat))], [data]);
  const filtered = useMemo(() => data.filter(d => filterCandidat === 'Tous' || d.candidat === filterCandidat), [data, filterCandidat]);
  const totalExp = data.length;
  const verifiees = data.filter(d => d.verifiee === 'Oui').length;

  const cols = ['N°', 'Candidat', 'Entreprise', 'Poste', 'Date Début', 'Date Fin', 'Durée', 'Description', 'Vérifiée'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Expériences des Candidats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} expérience(s) enregistrée(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="EXPÉRIENCES" valeur={totalExp} sousTexte="enregistrée(s)" />
        <KPICard titre="VÉRIFIÉES" valeur={verifiees} sousTexte={`${Math.round(verifiees / Math.max(totalExp, 1) * 100)}% vérifiées`} />
        <KPICard titre="CANDIDATS" valeur={new Set(data.map(d => d.candidat)).size} sousTexte="candidat(s) avec expérience" />
      </Box>
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={filterCandidat} onChange={e => { setFilterCandidat(e.target.value); setPage(0); }}>
            {candidats.map(c => <MenuItem key={c} value={c}>{c === 'Tous' ? 'Tous les candidats' : c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map((row, idx) => (
        <TableRow key={row.id} hover>
          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{'EXP-' + String(idx + 1).padStart(3, '0')}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>{row.candidat}</TableCell>
          <TableCell>{row.entreprise}</TableCell>
          <TableCell>{row.poste}</TableCell>
          <TableCell>{row.dateDebut}</TableCell>
          <TableCell>{row.dateFin || 'En cours'}</TableCell>
          <TableCell><Typography variant="body2" color="text.secondary">{row.duree}</Typography></TableCell>
          <TableCell>{row.description && row.description.length > 40 ? <Tooltip title={row.description} arrow><span>{row.description.substring(0, 40)}...</span></Tooltip> : (row.description || '—')}</TableCell>
          <TableCell><Chip label={row.verifiee} size="small" color={verifieeColor[row.verifiee]} /></TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Ajouter une Expérience"
        fields={[
          {key: 'candidat', label: 'Candidat', required: true},
          {key: 'entreprise', label: 'Entreprise', required: true},
          {key: 'poste', label: 'Poste Occupé', required: true},
          {key: 'dateDebut', label: 'Date Début', required: true},
          {key: 'dateFin', label: 'Date Fin'},
          {key: 'description', label: 'Description', required: true, multiline: true},
          {key: 'verifiee', label: 'Vérifiée', type: 'select', options: ['Oui', 'Non']},
        ]}
        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, duree: 'À calculer', ...vals }]); }}
      />
    </Box>
  );
}
