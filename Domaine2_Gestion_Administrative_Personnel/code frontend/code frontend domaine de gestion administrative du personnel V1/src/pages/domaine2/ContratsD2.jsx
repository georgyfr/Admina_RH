import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem, Stack, Button, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CONTRATS, EMPLOYEES, findEmployee, employeeFullName, formatFCFA, formatDate, joursRestants, LABELS, NOMENCLATURES } from './data';
import { StatusBadge, SectionHeader, MontantCell } from './components';

export default function ContratsD2() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fStatut, setFStatut] = useState('');
  const [fType, setFType] = useState('');

  const filtered = useMemo(() => CONTRATS.filter(c => {
    if (fStatut && c.statut !== fStatut) return false;
    if (fType && c.type_contrat !== fType) return false;
    return true;
  }), [fStatut, fType]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Card>
        <CardContent>
          <SectionHeader
            title='Contrats de travail'
            subtitle={`${filtered.length} contrat(s) · Lié à Fiche Employé (FK employee_id)`}
            action={<Button variant='contained' size='small' startIcon={<AddIcon />}>Nouveau contrat</Button>}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.statut_contrat.map(s => <MenuItem key={s} value={s}>{LABELS.statut_contrat[s] || s}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type contrat' value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Stack>

          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>N° Contrat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employé</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date début</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date fin</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Durée (mois)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Jours restants</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Salaire brut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map(c => {
                  const emp = findEmployee(c.employee_id);
                  const jr = c.date_fin ? joursRestants(c.date_fin) : null;
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.contract_number}</Typography></TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.8rem' }}>{employeeFullName(emp)}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>{emp?.departement}</Typography>
                      </TableCell>
                      <TableCell><Chip label={c.type_contrat} size='small' color={c.type_contrat === 'CDI' ? 'success' : 'warning'} variant='outlined' sx={{ fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(c.date_debut)}</Typography></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{c.date_fin ? formatDate(c.date_fin) : '—'}</Typography></TableCell>
                      <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{c.date_fin ? Math.round((new Date(c.date_fin) - new Date(c.date_debut)) / (1000*60*60*24*30.44)) : '∞'}</Typography></TableCell>
                      <TableCell>
                        {jr !== null ? (
                          <Chip label={jr < 0 ? 'Expiré' : `${jr} j`} size='small' color={jr < 0 ? 'error' : jr < 30 ? 'error' : jr < 60 ? 'warning' : 'success'} variant='outlined' sx={{ fontSize: '0.65rem' }} />
                        ) : <Typography color='text.disabled'>—</Typography>}
                      </TableCell>
                      <TableCell align='right'><MontantCell value={c.salaire_brut} /></TableCell>
                      <TableCell><StatusBadge status={c.statut} label={LABELS.statut_contrat[c.statut]} /></TableCell>
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.5} justifyContent='center'>
                          <Tooltip title='Voir'><IconButton size='small'><VisibilityIcon fontSize='small' /></IconButton></Tooltip>
                          <Tooltip title='Modifier'><IconButton size='small'><EditIcon fontSize='small' /></IconButton></Tooltip>
                          <Tooltip title='Créer avenant'><IconButton size='small'><NoteAltIcon fontSize='small' /></IconButton></Tooltip>
                          <Tooltip title='Dupliquer'><IconButton size='small'><ContentCopyIcon fontSize='small' /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div' count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage='Lignes:' labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
