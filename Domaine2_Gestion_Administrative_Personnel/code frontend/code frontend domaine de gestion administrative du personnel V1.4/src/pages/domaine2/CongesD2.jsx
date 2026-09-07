import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem, Stack, Button, Chip, IconButton, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, InputLabel, Select, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CONGES, EMPLOYEES, findEmployee, employeeFullName, formatDate, LABELS, NOMENCLATURES, SOLDES_CONGES } from './data';
import { StatusBadge, SectionHeader } from './components';

export default function CongesD2() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fStatut, setFStatut] = useState('');
  const [fType, setFType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ employee_id: '', type_conge: '', date_debut: '', date_fin: '', motif: '' });

  const filtered = useMemo(() => CONGES.filter(c => {
    if (fStatut && c.statut !== fStatut) return false;
    if (fType && c.type_conge !== fType) return false;
    return true;
  }), [fStatut, fType]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const calculerJours = (d1, d2) => {
    if (!d1 || !d2) return 0;
    return Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = () => {
    // TODO: en V2, appeler server action / API Supabase
    setOpenDialog(false);
    setForm({ employee_id: '', type_conge: '', date_debut: '', date_fin: '', motif: '' });
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <SectionHeader
            title='Congés annuels'
            subtitle={`${filtered.length} demande(s) · Workflow: employé → manager → DRH (si > 5j ou sans solde)`}
            action={<Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>Nouvelle demande</Button>}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.statut_conge.map(s => <MenuItem key={s} value={s}>{LABELS.statut_conge[s]}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type congé' value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }} sx={{ minWidth: 180 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_conge.map(t => <MenuItem key={t} value={t}>{LABELS.type_conge[t]}</MenuItem>)}
            </TextField>
          </Stack>

          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>N° Demande</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employé</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Du</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Au</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Jours</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Motif</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Approbateur</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map(c => {
                  const emp = findEmployee(c.employee_id);
                  const appr = findEmployee(c.approbateur);
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.leave_number}</Typography></TableCell>
                      <TableCell><Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.8rem' }}>{employeeFullName(emp)}</Typography></TableCell>
                      <TableCell><Chip label={LABELS.type_conge[c.type_conge]} size='small' variant='outlined' sx={{ fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(c.date_debut)}</Typography></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(c.date_fin)}</Typography></TableCell>
                      <TableCell align='right'><Typography variant='caption' sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{c.nombre_jours}</Typography></TableCell>
                      <TableCell><Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem', maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.motif}</Typography></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{appr ? employeeFullName(appr) : '—'}</Typography></TableCell>
                      <TableCell><StatusBadge status={c.statut} label={LABELS.statut_conge[c.statut]} /></TableCell>
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.5} justifyContent='center'>
                          {c.statut === 'en_attente' && (
                            <>
                              <Tooltip title='Approuver'><IconButton size='small' color='success'><CheckCircleIcon fontSize='small' /></IconButton></Tooltip>
                              <Tooltip title='Rejeter'><IconButton size='small' color='error'><CancelIcon fontSize='small' /></IconButton></Tooltip>
                            </>
                          )}
                          <Tooltip title='Voir'><IconButton size='small'><VisibilityIcon fontSize='small' /></IconButton></Tooltip>
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

      {/* Aperçu soldes congés (VLOOKUP + SUMIFS) */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <SectionHeader title='Soldes de congés 2025' subtitle='Auto-calcul: conges_pris = SUM(d02_leave_requests WHERE statut=approuvee) — VLOOKUP employé' />
          <TableContainer sx={{ maxHeight: 320 }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Employé</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Droit annuel</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Pris</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>En cours</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Solde dispo.</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Taux util.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SOLDES_CONGES.slice(0, 8).map(s => {
                  const emp = findEmployee(s.employee_id);
                  const pct = s.taux_utilisation;
                  const barColor = pct > 75 ? 'error' : pct > 50 ? 'warning' : 'success';
                  return (
                    <TableRow key={s.employee_id} hover>
                      <TableCell><Typography variant='body2' sx={{ fontSize: '0.8rem' }}>{employeeFullName(emp)}</Typography></TableCell>
                      <TableCell align='right'>{s.droit_annuel_jours} j</TableCell>
                      <TableCell align='right'>{s.conges_pris_jours} j</TableCell>
                      <TableCell align='right'>{s.conges_en_cours} j</TableCell>
                      <TableCell align='right'><Typography variant='body2' fontWeight={700} sx={{ color: s.solde_disponible < 5 ? 'error.main' : 'success.main' }}>{s.solde_disponible} j</Typography></TableCell>
                      <TableCell align='right'><Chip label={`${pct}%`} size='small' color={barColor} variant='outlined' sx={{ fontSize: '0.62rem' }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog nouvelle demande */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouvelle demande de congé</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Employé</InputLabel>
              <Select value={form.employee_id} label='Employé' onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField select size='small' label='Type de congé' value={form.type_conge} onChange={(e) => setForm({ ...form, type_conge: e.target.value })} fullWidth>
              {NOMENCLATURES.type_conge.map(t => <MenuItem key={t} value={t}>{LABELS.type_conge[t]}</MenuItem>)}
            </TextField>
            <Stack direction='row' spacing={2}>
              <TextField type='date' size='small' label='Date début' value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField type='date' size='small' label='Date fin' value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            {form.date_debut && form.date_fin && (
              <Typography variant='caption' sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                Nombre de jours calculé: <strong>{calculerJours(form.date_debut, form.date_fin)} j</strong> (hors weekends et jours fériés en V2)
              </Typography>
            )}
            <TextField multiline rows={3} size='small' label='Motif' value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.employee_id || !form.type_conge || !form.date_debut || !form.date_fin}>Soumettre</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
