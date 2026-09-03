import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem, Stack, Button, Chip, Avatar, IconButton, Tooltip, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import { EMPLOYEES, NOMENCLATURES, formatFCFA, formatDate, calculerAnciennete } from './data';
import { StatusBadge, SectionHeader } from './components';

export default function EmployesD2() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fDept, setFDept] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fContrat, setFContrat] = useState('');

  const filtered = useMemo(() => {
    return EMPLOYEES.filter(e => {
      if (search && !`${e.matricule} ${e.nom} ${e.prenom} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (fDept && e.departement !== fDept) return false;
      if (fStatut && e.statut !== fStatut) return false;
      if (fContrat && e.type_contrat !== fContrat) return false;
      return true;
    });
  }, [search, fDept, fStatut, fContrat]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Card>
        <CardContent>
          <SectionHeader
            title='Liste des employés'
            subtitle={`${filtered.length} employé(s) · Source unique de vérité (feuille maîtresse)`}
            action={<Stack direction='row' spacing={1}>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />}>Export CSV</Button>
              <Button variant='contained' size='small' startIcon={<AddIcon />}>Nouvel Employé</Button>
            </Stack>}
          />

          {/* Filtres */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size='small' placeholder='Rechercher (matricule, nom, email)...' value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }}
              sx={{ flex: 1 }}
            />
            <TextField select size='small' label='Département' value={fDept} onChange={(e) => { setFDept(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.departement.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 120 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.statut_employe.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type contrat' value={fContrat} onChange={(e) => { setFContrat(e.target.value); setPage(0); }} sx={{ minWidth: 120 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Stack>

          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Matricule</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employé</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Poste</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Département</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contrat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Embauche</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ancienneté</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Salaire brut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map(e => (
                  <TableRow key={e.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.matricule}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: 'primary.light' }}>{e.prenom[0]}{e.nom[0]}</Avatar>
                        <Box>
                          <Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.8rem' }}>{e.prenom} {e.nom}</Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>{e.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant='body2' sx={{ fontSize: '0.78rem' }}>{e.poste}</Typography></TableCell>
                    <TableCell><Chip label={e.departement} size='small' variant='outlined' sx={{ fontSize: '0.65rem' }} /></TableCell>
                    <TableCell><Chip label={e.type_contrat} size='small' color={e.type_contrat === 'CDI' ? 'success' : e.type_contrat === 'CDD' ? 'warning' : 'default'} variant='outlined' sx={{ fontSize: '0.65rem' }} /></TableCell>
                    <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(e.date_embauche)}</Typography></TableCell>
                    <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }} color='text.secondary'>{calculerAnciennete(e.date_embauche)}</Typography></TableCell>
                    <TableCell align='right'><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem' }}>{new Intl.NumberFormat('fr-FR').format(e.salaire_brut)}</Typography></TableCell>
                    <TableCell><StatusBadge status={e.statut} /></TableCell>
                    <TableCell align='center'>
                      <Stack direction='row' spacing={0.5} justifyContent='center'>
                        <Tooltip title='Voir détail'><IconButton size='small'><VisibilityIcon fontSize='small' /></IconButton></Tooltip>
                        <Tooltip title='Modifier'><IconButton size='small'><EditIcon fontSize='small' /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={10} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun employé trouvé</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div' count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage='Lignes par page:' labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
