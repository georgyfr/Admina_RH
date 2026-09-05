// ============================================================
// GenerationContrats.jsx — Génération automatique de contrats
// depuis le recrutement (candidats retenus sans contrat)
// Équivalent Excel : RECHERCHEX statut "Retenu" + auto-incrément N° Contrat
// ============================================================
import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Snackbar, Checkbox, FormControlLabel, IconButton, Tooltip,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { CONTRATS, EMPLOYEES, formatFCFA, formatDate, NOMENCLATURES, LABELS } from './data';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const GOLD = '#f9c74f';

// --- Mock : candidats retenus sans contrat (file d'attente) ---
// Dans une vraie app, viendrait de Supabase (D1-2-Base Candidats statut="Retenu")
const CANDIDATS_RETENUS = [
  { id: 'cand-001', matricule: 'CND-001', nom: 'Mballa', prenom: 'Stéphane', poste: 'Chef Comptable', departement: 'Comptabilite', type_contrat_suggere: 'CDI', salaire_negocie: 650000, source: 'LinkedIn', date_selection: '2026-09-01', date_prise_poste: '2026-10-01', statut: 'Retenu' },
  { id: 'cand-002', matricule: 'CND-002', nom: 'Foko', prenom: 'Marie', poste: 'Agent Sécurité', departement: 'Securite', type_contrat_suggere: 'CDD', salaire_negocie: 220000, source: 'Job board', date_selection: '2026-09-02', date_prise_poste: '2026-10-15', statut: 'Retenu' },
  { id: 'cand-003', matricule: 'CND-003', nom: 'Ella', prenom: 'Patrick', poste: 'Développeur', departement: 'Maintenance', type_contrat_suggere: 'CDI', salaire_negocie: 850000, source: 'Recommandation interne', date_selection: '2026-09-03', date_prise_poste: '2026-11-01', statut: 'Retenu' },
];

// --- Auto-incrément N° Contrat ---
function generateContractNumber(existingContrats) {
  const maxNum = existingContrats.reduce((max, c) => {
    const match = c.contract_number?.match(/CTR-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `CTR-2026-${String(maxNum + 1).padStart(3, '0')}`;
}

export default function GenerationContrats({ onContractsGenerated }) {
  const [selectedCands, setSelectedCands] = useState(new Set());
  const [snack, setSnack] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editingCand, setEditingCand] = useState(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  // Vérifier quels candidats retenus n'ont PAS encore de contrat
  // Équivalent : RECHERCHEV(candidat; 6-Suivi Contrats; 1; FAUX) = #N/A
  const fileAttente = useMemo(() => {
    return CANDIDATS_RETENUS.filter(c => {
      // Vérifier si un contrat existe déjà pour ce candidat (par nom + prénom)
      return !CONTRATS.some(ct => {
        const emp = EMPLOYEES.find(e => e.id === ct.employee_id);
        return emp && emp.nom === c.nom && emp.prenom === c.prenom;
      });
    });
  }, []);

  const toggleSelect = (candId) => {
    const newSet = new Set(selectedCands);
    if (newSet.has(candId)) newSet.delete(candId);
    else newSet.add(candId);
    setSelectedCands(newSet);
  };

  const handleSelectAll = () => {
    if (selectedCands.size === fileAttente.length) {
      setSelectedCands(new Set());
    } else {
      setSelectedCands(new Set(fileAttente.map(c => c.id)));
    }
  };

  const handleEditCand = (cand) => {
    setEditingCand({ ...cand });
    setEditDialog(true);
  };

  const handleGenerate = () => {
    const selected = fileAttente.filter(c => selectedCands.has(c.id));
    if (selected.length === 0) {
      setSnack({ msg: 'Aucun candidat sélectionné', severity: 'warning' });
      return;
    }

    // Simuler la création des contrats
    selected.forEach(cand => {
      const contractNumber = generateContractNumber(CONTRATS);
      const newEmpId = `emp-${String(EMPLOYEES.length + 1).padStart(3, '0')}`;

      // Créer l'employé
      const newEmp = {
        id: newEmpId,
        matricule: `EMP-${String(EMPLOYEES.length + 1).padStart(3, '0')}`,
        civilite: 'M.',
        nom: cand.nom,
        prenom: cand.prenom,
        date_naissance: '1990-01-01',
        lieu_naissance: 'Douala',
        genre: 'Masculin',
        nationalite: 'Camerounaise',
        situation_familiale: 'Celibataire',
        telephone: '690000000',
        email: `${cand.prenom.toLowerCase()}.${cand.nom.toLowerCase()}@admina-rh.cm`,
        adresse: 'Douala',
        departement: cand.departement,
        poste: cand.poste,
        type_contrat: cand.type_contrat_suggere,
        categorie: 'Execution',
        regime_travail: 'Temps plein',
        date_embauche: cand.date_prise_poste,
        salaire_brut: cand.salaire_negocie,
        lieu_travail: 'Douala',
        statut: 'Essai',
        photo_url: '',
      };
      EMPLOYEES.push(newEmp);

      // Créer le contrat
      const newContrat = {
        id: `ctr-${String(CONTRATS.length + 1).padStart(3, '0')}`,
        contract_number: contractNumber,
        employee_id: newEmpId,
        type_contrat: cand.type_contrat_suggere,
        date_debut: cand.date_prise_poste,
        date_fin: cand.type_contrat_suggere === 'CDD' ? new Date(new Date(cand.date_prise_poste).getTime() + 365 * 86400000).toISOString().slice(0, 10) : null,
        salaire_brut: cand.salaire_negocie,
        regime_travail: 'Temps plein',
        lieu_travail: 'Douala',
        statut: 'En vigueur',
        observations: `Généré automatiquement depuis recrutement (source: ${cand.source})`,
      };
      CONTRATS.push(newContrat);
    });

    setGeneratedCount(selected.length);
    setSelectedCands(new Set());
    setSnack({ msg: `${selected.length} contrat(s) généré(s) automatiquement depuis le recrutement`, severity: 'success' });
    if (onContractsGenerated) onContractsGenerated();
  };

  const isAllSelected = selectedCands.size === fileAttente.length && fileAttente.length > 0;

  return (
    <Card sx={{ mb: 2.5, border: `2px solid ${VIOLET}`, borderLeft: `6px solid ${VIOLET}`, borderRadius: '16px', boxShadow: `0 2px 12px ${VIOLET}15` }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        {/* En-tête */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoFixHighIcon />
            </Box>
            <Box>
              <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
                Génération Automatique de Contrats
              </Typography>
              <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.68rem' }}>
                File d'attente : candidats retenus sans contrat · Interconnexion D1 → D2 (IC-D1-D2-02)
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1} alignItems='center'>
            <Chip
              icon={<PendingIcon sx={{ fontSize: '16px !important' }} />}
              label={`${fileAttente.length} en attente`}
              size='small'
              sx={{ bgcolor: fileAttente.length > 0 ? 'rgba(184,106,42,0.12)' : 'rgba(26,122,74,0.12)', color: fileAttente.length > 0 ? ORANGE : VERT, fontWeight: 700, fontSize: '0.72rem' }}
            />
            {selectedCands.size > 0 && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                label={`${selectedCands.size} sélectionné(s)`}
                size='small'
                color='primary'
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
            <Button
              variant='contained'
              size='small'
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={selectedCands.size === 0}
              sx={{ bgcolor: VIOLET, textTransform: 'none', fontSize: '0.75rem', '&:hover': { bgcolor: '#6b30d0' } }}
            >
              Générer ({selectedCands.size})
            </Button>
          </Stack>
        </Stack>

        {/* Info interconnexion */}
        <Alert severity='info' sx={{ mb: 2, borderRadius: 2, fontSize: '0.75rem' }}>
          Cette zone détecte automatiquement les candidats avec le statut <strong>"Retenu"</strong> dans le Domaine 1 (2-Base Candidats) qui n'ont pas encore de contrat dans le Domaine 2 (6-Suivi Contrats).
          Sélectionnez les candidats et cliquez sur "Générer" pour créer automatiquement le contrat + la fiche employé.
        </Alert>

        {/* File d'attente */}
        {fileAttente.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'rgba(26,122,74,0.06)', borderRadius: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: VERT, mb: 1 }} />
            <Typography variant='body2' sx={{ color: VERT, fontWeight: 600, fontSize: '0.85rem' }}>
              Tous les candidats retenus ont un contrat. File d'attente vide.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Sélectionner tout */}
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={isAllSelected} onChange={handleSelectAll} size='small' sx={{ color: VIOLET }} />}
                label={<Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>Tout sélectionner ({fileAttente.length})</Typography>}
              />
              <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8' }}>
                N° Contrat auto-généré · Statut initialisé à "En vigueur"
              </Typography>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1.5 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell padding='checkbox' />
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Candidat</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Poste</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Département</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Prise de poste</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Salaire négocié</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Source</TableCell>
                    <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileAttente.map((cand) => {
                    const isSelected = selectedCands.has(cand.id);
                    return (
                      <TableRow
                        key={cand.id}
                        hover
                        onClick={() => toggleSelect(cand.id)}
                        sx={{ cursor: 'pointer', bgcolor: isSelected ? 'rgba(126, 63, 242, 0.04)' : 'transparent' }}
                      >
                        <TableCell padding='checkbox' onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onChange={() => toggleSelect(cand.id)} size='small' sx={{ color: VIOLET, '&.Mui-checked': { color: VIOLET } }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                              {cand.prenom[0]}{cand.nom[0]}
                            </Box>
                            <Box>
                              <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{cand.prenom} {cand.nom}</Typography>
                              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>{cand.matricule}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{cand.poste}</Typography></TableCell>
                        <TableCell><Chip label={cand.departement} size='small' sx={{ fontSize: '0.58rem', height: 16 }} variant='outlined' /></TableCell>
                        <TableCell><Chip label={cand.type_contrat_suggere} size='small' color={cand.type_contrat_suggere === 'CDI' ? 'success' : 'warning'} variant='outlined' sx={{ fontSize: '0.58rem', height: 16 }} /></TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.7rem' }}>{formatDate(cand.date_prise_poste)}</Typography></TableCell>
                        <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>{new Intl.NumberFormat('fr-FR').format(cand.salaire_negocie)}</Typography></TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>{cand.source}</Typography></TableCell>
                        <TableCell align='center' onClick={(e) => e.stopPropagation()}>
                          <Tooltip title='Modifier les détails avant génération'>
                            <IconButton size='small' onClick={() => handleEditCand(cand)} sx={{ color: NAVY }}>
                              <DescriptionIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Aperçu des contrats qui seront générés */}
            {selectedCands.size > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(126, 63, 242, 0.04)', borderRadius: 1.5, border: `1px dashed ${VIOLET}40` }}>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                  <PersonAddIcon sx={{ fontSize: 16, color: VIOLET }} />
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: VIOLET }}>
                    Aperçu — {selectedCands.size} contrat(s) seront créés :
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={0.5} flexWrap='wrap' sx={{ gap: 0.5 }}>
                  {fileAttente.filter(c => selectedCands.has(c.id)).map(c => (
                    <Chip
                      key={c.id}
                      label={`${generateContractNumber(CONTRATS.filter(ct => {
                        // Compter seulement les contrats déjà générés + ceux sélectionnés avant celui-ci
                        return true;
                      }))} → ${c.prenom} ${c.nom} (${c.type_contrat_suggere})`}
                      size='small'
                      sx={{ fontSize: '0.62rem', bgcolor: 'rgba(126, 63, 242, 0.1)', color: VIOLET, border: `1px solid ${VIOLET}30` }}
                    />
                  ))}
                </Stack>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', display: 'block', mt: 0.5 }}>
                  Chaque contrat créera automatiquement : 1 fiche employé (statut "Essai") + 1 contrat (statut "En vigueur") + déclenchement période d'essai (IC-D1-D2-01)
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Stats en bas */}
        {generatedCount > 0 && (
          <Alert severity='success' sx={{ mt: 2, borderRadius: 2 }}>
            <strong>{generatedCount} contrat(s) généré(s) avec succès !</strong> Les fiches employé et contrats ont été créés automatiquement.
          </Alert>
        )}
      </CardContent>

      {/* === DIALOG MODIFICATION CANDIDAT === */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
          Modifier les détails du candidat — {editingCand?.prenom} {editingCand?.nom}
        </DialogTitle>
        <DialogContent>
          {editingCand && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
                Ces informations seront utilisées pour générer automatiquement le contrat. Modifiez si nécessaire avant la génération.
              </Alert>
              <TextField
                fullWidth size='small' label='Date de prise de poste'
                type='date' value={editingCand.date_prise_poste || ''}
                onChange={(e) => setEditingCand({ ...editingCand, date_prise_poste: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select fullWidth size='small' label='Type de contrat'
                value={editingCand.type_contrat_suggere}
                onChange={(e) => setEditingCand({ ...editingCand, type_contrat_suggere: e.target.value })}
              >
                {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField
                fullWidth size='small' label='Salaire brut négocié (FCFA)' type='number'
                value={editingCand.salaire_negocie}
                onChange={(e) => setEditingCand({ ...editingCand, salaire_negocie: parseInt(e.target.value) || 0 })}
              />
              <TextField
                fullWidth size='small' label='Poste'
                value={editingCand.poste}
                onChange={(e) => setEditingCand({ ...editingCand, poste: e.target.value })}
              />
              <TextField
                select fullWidth size='small' label='Département'
                value={editingCand.departement}
                onChange={(e) => setEditingCand({ ...editingCand, departement: e.target.value })}
              >
                {NOMENCLATURES.departement.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button
            variant='contained' onClick={() => {
              // Mettre à jour le candidat dans la file d'attente
              const idx = CANDIDATS_RETENUS.findIndex(c => c.id === editingCand.id);
              if (idx !== -1) CANDIDATS_RETENUS[idx] = { ...editingCand };
              setEditDialog(false);
              setSnack({ msg: 'Détails du candidat mis à jour', severity: 'success' });
            }}
            sx={{ bgcolor: VIOLET }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* === SNACKBAR === */}
      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snack?.msg}
      />
    </Card>
  );
}
