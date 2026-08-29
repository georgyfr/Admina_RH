import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, TableSortLabel } from '@mui/material';
import { Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialData = [
  { id:1, numero:'COUT-001', poste:'Chef Cuisinier', publicite:50000, cabinet:150000, deplacement:20000, tests:15000, hebergement:30000, formation:5000, autres:0, demandeLiee:'DR-2025-001', date:'15/03/2025', departement:'Restauration', notes:'Cabinet HRC Cameroon' },
  { id:2, numero:'COUT-002', poste:'Réceptionniste Nuit', publicite:20000, cabinet:0, deplacement:5000, tests:5000, hebergement:0, formation:0, autres:5000, demandeLiee:'DR-2025-002', date:'10/03/2025', departement:'Herbergement', notes:'' },
  { id:3, numero:'COUT-003', poste:'Technicien Audiovisuel', publicite:15000, cabinet:0, deplacement:10000, tests:20000, hebergement:0, formation:0, autres:0, demandeLiee:'DR-2025-004', date:'08/03/2025', departement:'Audiovisuel', notes:'Tests techniques spécifiques' },
  { id:4, numero:'COUT-004', poste:'Agent de Sécurité', publicite:10000, cabinet:0, deplacement:5000, tests:0, hebergement:0, formation:0, autres:0, demandeLiee:'DR-2025-005', date:'05/03/2025', departement:'Securite', notes:'' },
  { id:5, numero:'COUT-005', poste:'Comptable Senior', publicite:30000, cabinet:250000, deplacement:15000, tests:10000, hebergement:0, formation:0, autres:5000, demandeLiee:'DR-2025-003', date:'20/03/2025', departement:'Finance & Comptabilite', notes:'Cabinet Activa RH' },
  { id:6, numero:'COUT-006', poste:'Agent de Blanchisserie', publicite:10000, cabinet:0, deplacement:0, tests:5000, hebergement:0, formation:0, autres:0, demandeLiee:'DR-2025-010', date:'01/04/2025', departement:'Lingerie', notes:'' },
  { id:7, numero:'COUT-007', poste:'Développeur Full Stack', publicite:40000, cabinet:300000, deplacement:25000, tests:30000, hebergement:0, formation:0, autres:10000, demandeLiee:'DR-2025-006', date:'01/05/2025', departement:'Informatique', notes:'Cabinet Skillmatch Africa' },
];

export default function Couts() {
  const [data] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const coutTotal = data.reduce((s, d) => s + d.publicite + d.cabinet + d.deplacement + d.tests + d.hebergement + d.formation + d.autres, 0);
  const coutMoyenDemande = Math.round(coutTotal / data.length);
  const postesPourvus = 2;
  const coutMoyenPoste = Math.round(coutTotal / postesPourvus);

  const cols = ['Poste','Publicité','Cabinet','Déplacement','Tests','Hébergement','Formation','Autres','Coût Total','Coût/Poste','N°','Demande Liée','Date','Département','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Analyse des Coûts de Recrutement</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="COÛT TOTAL" valeur={formatFCFA(coutTotal)} sousTexte="tous postes" />
        <KPICard titre="COÛT MOYEN/DEMANDE" valeur={formatFCFA(coutMoyenDemande)} sousTexte={"par demande"} />
        <KPICard titre="COÛT MOYEN/POSTE POURVU" valeur={formatFCFA(coutMoyenPoste)} sousTexte={"2 postes pourvus"} />
        <KPICard titre="DEMANDE LA PLUS CHÈRE" valeur="Chef Cuisinier" sousTexte={formatFCFA(520000)} />
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.slice(page * rpp, page * rpp + rpp).map(row => {
        const total = row.publicite + row.cabinet + row.deplacement + row.tests + row.hebergement + row.formation + row.autres;
        return (
          <TableRow key={row.id} hover>
            <TableCell sx={{ fontWeight: 500 }}>{row.poste}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.publicite)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.cabinet)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.deplacement)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.tests)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.hebergement)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.formation)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.autres)}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatFCFA(total)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(postesPourvus > 0 ? Math.round(total / postesPourvus) : 0)}</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.numero}</TableCell>
            <TableCell><Chip label={row.demandeLiee} size="small" variant="outlined" /></TableCell>
            <TableCell>{row.date}</TableCell>
            <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
            <TableCell>{row.notes || '—'}</TableCell>
          </TableRow>
        );
      })}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" /></Paper>
    </Box>
  );
}
