import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Paper, Card, CardContent, CardActions, IconButton, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialCards = [
  { id: 1, nom: 'Site web entreprise', description: 'Candidatures via le site officiel de HRC Cameroon', nbCandidats: 32, cout: 50000, active: true },
  { id: 2, nom: 'Référence interne', description: 'Cooptation et recommandations des collaborateurs', nbCandidats: 28, cout: 0, active: true },
  { id: 3, nom: 'LinkedIn', description: 'Publications et recherche proactive sur LinkedIn', nbCandidats: 25, cout: 180000, active: true },
  { id: 4, nom: 'Indeed', description: 'Diffusion d\'offres sur la plateforme Indeed', nbCandidats: 18, cout: 120000, active: true },
  { id: 5, nom: 'Cabinet de recrutement', description: 'Prestataires externes spécialisés', nbCandidats: 22, cout: 450000, active: true },
  { id: 6, nom: 'École/Université', description: 'Partenariats avec les établissements de formation', nbCandidats: 12, cout: 80000, active: true },
  { id: 7, nom: 'Salon professionnel', description: 'Participation aux salons de l\'emploi', nbCandidats: 8, cout: 200000, active: true },
  { id: 8, nom: 'Candidature spontanée', description: 'Candidatures non sollicitées reçues directement', nbCandidats: 15, cout: 0, active: true },
  { id: 9, nom: 'Réseaux sociaux', description: 'Facebook, Instagram, Twitter/X pour le recrutement', nbCandidats: 10, cout: 130000, active: true },
  { id: 10, nom: 'Presse', description: 'Annonces dans la presse écrite locale', nbCandidats: 4, cout: 150000, active: false },
  { id: 11, nom: 'Autre', description: 'Autres canaux de recrutement', nbCandidats: 2, cout: 0, active: false },
];

const initialTableData = [
  { id: 1, numero: 'SRC-001', source: 'Site web entreprise', nbCandidats: 32, nbEntretiens: 14, nbRecrutements: 3, tauxTransformation: 9.4, coutRecrutement: 50000, delaiMoyen: 25, qualiteMoyenne: 14.5, notes: 'Canal performant, coût maîtrisé' },
  { id: 2, numero: 'SRC-002', source: 'Référence interne', nbCandidats: 28, nbEntretiens: 16, nbRecrutements: 4, tauxTransformation: 14.3, coutRecrutement: 0, delaiMoyen: 18, qualiteMoyenne: 16.2, notes: 'Meilleur taux de conversion, qualité élevée' },
  { id: 3, numero: 'SRC-003', source: 'LinkedIn', nbCandidats: 25, nbEntretiens: 10, nbRecrutements: 2, tauxTransformation: 8.0, coutRecrutement: 180000, delaiMoyen: 35, qualiteMoyenne: 15.0, notes: 'Bon pour profils cadres, délai plus long' },
  { id: 4, numero: 'SRC-004', source: 'Indeed', nbCandidats: 18, nbEntretiens: 6, nbRecrutements: 1, tauxTransformation: 5.6, coutRecrutement: 120000, delaiMoyen: 30, qualiteMoyenne: 13.0, notes: 'Volume correct mais qualité variable' },
  { id: 5, numero: 'SRC-005', source: 'Cabinet de recrutement', nbCandidats: 22, nbEntretiens: 12, nbRecrutements: 3, tauxTransformation: 13.6, coutRecrutement: 450000, delaiMoyen: 40, qualiteMoyenne: 16.5, notes: 'Coût élevé mais profils qualifiés' },
  { id: 6, numero: 'SRC-006', source: 'École/Université', nbCandidats: 12, nbEntretiens: 4, nbRecrutements: 0, tauxTransformation: 0.0, coutRecrutement: 80000, delaiMoyen: 45, qualiteMoyenne: 11.0, notes: 'Principallement pour stagiaires et juniors' },
  { id: 7, numero: 'SRC-007', source: 'Salon professionnel', nbCandidats: 8, nbEntretiens: 3, nbRecrutements: 1, tauxTransformation: 12.5, coutRecrutement: 200000, delaiMoyen: 20, qualiteMoyenne: 14.0, notes: 'Bon contact direct, volume limité' },
  { id: 8, numero: 'SRC-008', source: 'Candidature spontanée', nbCandidats: 15, nbEntretiens: 5, nbRecrutements: 1, tauxTransformation: 6.7, coutRecrutement: 0, delaiMoyen: 22, qualiteMoyenne: 13.5, notes: 'Qualité aléatoire mais coût nul' },
  { id: 9, numero: 'SRC-009', source: 'Réseaux sociaux', nbCandidats: 10, nbEntretiens: 3, nbRecrutements: 0, tauxTransformation: 0.0, coutRecrutement: 130000, delaiMoyen: 28, qualiteMoyenne: 12.0, notes: 'Peu de résultats concrets à ce jour' },
];

export default function Sources() {
  const [view, setView] = useState('cards');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const totalCandidats = initialCards.reduce((s, d) => s + d.nbCandidats, 0);
  const coutTotal = initialCards.reduce((s, d) => s + d.cout, 0);
  const sourcesActives = initialCards.filter(d => d.active).length;

  const tableCols = ['N°', 'Source', 'Nb Candidats', 'Nb Entretiens', 'Nb Recrutements', 'Taux Transformation', 'Coût/Recrutement (FCFA)', 'Délai Moyen (j)', 'Qualité Moyenne (/20)', 'Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Sources de Recrutement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Gestion des canaux de recrutement</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant={view === 'cards' ? 'contained' : 'outlined'} onClick={() => setView('cards')}>Vue Cartes</Button>
        <Button variant={view === 'table' ? 'contained' : 'outlined'} onClick={() => setView('table')}>Vue Tableau</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Ajouter</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="SOURCES ACTIVES" valeur={`${sourcesActives}/11`} sousTexte="sources actives" />
        <KPICard titre="TOTAL CANDIDATS" valeur={totalCandidats} sousTexte="tous canaux confondus" />
        <KPICard titre="COÛT TOTAL" valeur={formatFCFA(coutTotal)} sousTexte="toutes sources" />
      </Box>

      {view === 'cards' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          {initialCards.map(src => (
            <Card key={src.id} variant="outlined" sx={{ opacity: src.active ? 1 : 0.5 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>{src.nom}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>{src.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2"><strong>{src.nbCandidats}</strong> candidats</Typography>
                  <Typography variant="body2">{formatFCFA(src.cout)}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper><TableContainer><Table size="small"><TableHead><TableRow>{tableCols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
        <TableBody>{initialTableData.slice(page * rpp, page * rpp + rpp).map(row => (
          <TableRow key={row.id} hover>
            <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{row.source}</TableCell>
            <TableCell align="center">{row.nbCandidats}</TableCell>
            <TableCell align="center">{row.nbEntretiens}</TableCell>
            <TableCell align="center">{row.nbRecrutements}</TableCell>
            <TableCell align="center"><Chip label={`${row.tauxTransformation}%`} size="small" color={row.tauxTransformation >= 10 ? 'success' : row.tauxTransformation >= 5 ? 'warning' : 'error'} /></TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.nbRecrutements > 0 ? Math.round(row.coutRecrutement / row.nbRecrutements) : 0)}</TableCell>
            <TableCell align="center">{row.delaiMoyen}</TableCell>
            <TableCell align="center">{row.qualiteMoyenne}</TableCell>
            <TableCell>{row.notes && row.notes.length > 35 ? `${row.notes.substring(0, 35)}...` : (row.notes || '—')}</TableCell>
          </TableRow>
        ))}</TableBody></Table></TableContainer>
        <TablePagination component="div" count={initialTableData.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
      )}
    </Box>
  );
}
