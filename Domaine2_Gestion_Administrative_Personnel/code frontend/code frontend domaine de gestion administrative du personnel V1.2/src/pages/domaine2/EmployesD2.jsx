import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem, Stack, Button, Chip, Avatar, IconButton, Tooltip, InputAdornment, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert, Snackbar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { EMPLOYEES, NOMENCLATURES, formatFCFA, formatDate, calculerAnciennete, formatNumber } from './data';
import { StatusBadge, SectionHeader } from './components';

export default function EmployesD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fDept, setFDept] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fContrat, setFContrat] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [snack, setSnack] = useState(null);

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

  // --- Actions ---
  const handleViewDetail = (empId) => {
    // Naviguer vers la Fiche Employé avec l'ID sélectionné (via query param)
    navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${empId}`);
  };

  const handleEdit = (emp) => {
    setEditEmp({ ...emp });
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    // Mock : dans une vraie app, on appellerait une API
    const idx = EMPLOYEES.findIndex(e => e.id === editEmp.id);
    if (idx !== -1) {
      EMPLOYEES[idx] = { ...editEmp };
    }
    setEditDialog(false);
    setSnack({ msg: `Employé ${editEmp.prenom} ${editEmp.nom} modifié avec succès`, severity: 'success' });
  };

  const handleCreate = () => {
    setCreateDialog(false);
    setSnack({ msg: 'Nouvel employé créé (simulation mock)', severity: 'success' });
  };

  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prenom', 'Email', 'Departement', 'Poste', 'Type Contrat', 'Statut', 'Date Embauche', 'Salaire Brut'];
    const rows = filtered.map(e => [e.matricule, e.nom, e.prenom, e.email, e.departement, e.poste, e.type_contrat, e.statut, e.date_embauche, e.salaire_brut]);
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.map(v => `"${v}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${filtered.length} employés exportés en CSV`, severity: 'success' });
  };

  // --- Champs formulaire édition ---
  const formFields = [
    { key: 'matricule', label: 'Matricule', xs: 6 },
    { key: 'civilite', label: 'Civilité', xs: 6, select: NOMENCLATURES.civilite },
    { key: 'nom', label: 'Nom', xs: 6 },
    { key: 'prenom', label: 'Prénom', xs: 6 },
    { key: 'email', label: 'Email', xs: 6 },
    { key: 'telephone', label: 'Téléphone', xs: 6 },
    { key: 'departement', label: 'Département', xs: 6, select: NOMENCLATURES.departement },
    { key: 'poste', label: 'Poste', xs: 6 },
    { key: 'type_contrat', label: 'Type contrat', xs: 4, select: NOMENCLATURES.type_contrat },
    { key: 'categorie', label: 'Catégorie', xs: 4, select: NOMENCLATURES.categorie_salarie },
    { key: 'statut', label: 'Statut', xs: 4, select: NOMENCLATURES.statut_employe },
    { key: 'date_embauche', label: 'Date embauche', xs: 6, type: 'date' },
    { key: 'salaire_brut', label: 'Salaire brut (FCFA)', xs: 6, type: 'number' },
    { key: 'lieu_travail', label: 'Lieu de travail', xs: 6 },
    { key: 'adresse', label: 'Adresse', xs: 12 },
  ];

  return (
    <Box>
      <Card>
        <CardContent>
          <SectionHeader
            title='Liste des employés'
            subtitle={`${filtered.length} employé(s) · Source unique de vérité (feuille maîtresse)`}
            action={<Stack direction='row' spacing={1}>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>Nouvel Employé</Button>
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
                  <TableRow key={e.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => handleViewDetail(e.id)}>
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
                    <TableCell align='center' onClick={(ev) => ev.stopPropagation()}>
                      <Stack direction='row' spacing={0.5} justifyContent='center'>
                        <Tooltip title='Voir détail (fiche complète)'>
                          <IconButton size='small' color='primary' onClick={() => handleViewDetail(e.id)}>
                            <VisibilityIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Modifier'>
                          <IconButton size='small' color='info' onClick={() => handleEdit(e)}>
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
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

      {/* === DIALOG ÉDITION EMPLOYÉ === */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier l'employé — {editEmp?.prenom} {editEmp?.nom}
        </DialogTitle>
        <DialogContent>
          {editEmp && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {formFields.map(f => (
                <Grid item xs={12} sm={f.xs} key={f.key}>
                  <TextField
                    fullWidth size='small' label={f.label}
                    type={f.type || 'text'}
                    value={f.type === 'date' ? (editEmp[f.key] || '').slice(0, 10) : (editEmp[f.key] ?? '')}
                    onChange={(e) => setEditEmp({ ...editEmp, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                    select={!!f.select}
                    InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                  >
                    {f.select && f.select.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
            </Grid>
          )}
          <Alert severity='info' sx={{ mt: 2 }}>
            Mode simulation : les modifications sont appliquées localement (mock). En production, elles seraient sauvegardées via API Supabase.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSaveEdit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG NOUVEL EMPLOYÉ === */}
      <CreateEmployeDialog open={createDialog} onClose={() => setCreateDialog(false)} onCreate={handleCreate} formFields={formFields} />

      {/* === SNACKBAR NOTIFICATION === */}
      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snack?.msg}
      />
    </Box>
  );
}

// --- Composant : Dialog création employé ---
function CreateEmployeDialog({ open, onClose, onCreate, formFields }) {
  const [newEmp, setNewEmp] = useState({
    matricule: `EMP-${String(Math.floor(Math.random() * 900) + 100)}`,
    civilite: 'M.',
    nom: '', prenom: '', email: '', telephone: '',
    departement: '', poste: '', type_contrat: 'CDI', categorie: 'Execution', statut: 'Actif',
    date_embauche: new Date().toISOString().slice(0, 10),
    salaire_brut: 0, lieu_travail: '', adresse: '',
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon color='success' /> Nouvel Employé
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {formFields.map(f => (
            <Grid item xs={12} sm={f.xs} key={f.key}>
              <TextField
                fullWidth size='small' label={f.label}
                type={f.type || 'text'}
                value={f.type === 'date' ? (newEmp[f.key] || '').slice(0, 10) : (newEmp[f.key] ?? '')}
                onChange={(e) => setNewEmp({ ...newEmp, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                select={!!f.select}
                InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
              >
                {f.select && f.select.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
        </Grid>
        <Alert severity='info' sx={{ mt: 2 }}>
          Mode simulation : le nouvel employé sera créé localement (mock). En production, il serait sauvegardé via API Supabase avec génération automatique du matricule.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant='contained' startIcon={<SaveIcon />} onClick={onCreate}>Créer l'employé</Button>
      </DialogActions>
    </Dialog>
  );
}
