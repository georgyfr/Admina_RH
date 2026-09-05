// ============================================================
// SimulateurConges.jsx — Simulateur de solde de congés en temps réel
// Récupère les soldes (RECHERCHEX sur Soldes Congés) + absences maladie (FILTER)
// Ajoute un micro-simulateur (curseur) pour anticiper l'impact d'une prise de congé
// ============================================================
import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Grid, Divider, Alert,
  TextField, Slider, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Tooltip, IconButton, MenuItem,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SickIcon from '@mui/icons-material/Sick';
import CalculateIcon from '@mui/icons-material/Calculate';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  SOLDES_CONGES, CONGES, ABSENCES, findEmployee, formatDate, LABELS,
} from './data';

const NAVY = '#0b2a4a';
const VIOLET = '#7e3ff2';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const GOLD = '#f9c74f';

// --- Carte solde ---
function SoldeCard({ label, value, max, color, icon, subtitle }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <Card sx={{ borderRadius: '14px', border: `1px solid #e9edf2`, borderLeft: `4px solid ${color}`, height: '100%' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 0.5 }}>
          <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 500, fontSize: '0.6rem' }}>{label}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Stack>
        <Typography variant='h5' fontWeight={800} sx={{ color, fontSize: '1.3rem', lineHeight: 1 }}>
          {value}<span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b7a8a' }}> j</span>
        </Typography>
        {subtitle && <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', display: 'block', mt: 0.2 }}>{subtitle}</Typography>}
        {max > 0 && (
          <LinearProgress variant='determinate' value={pct} sx={{ mt: 0.8, height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
        )}
      </CardContent>
    </Card>
  );
}

export default function SimulateurConges({ employeeId }) {
  const [joursSimules, setJoursSimules] = useState(0);
  const [typeCongeSim, setTypeCongeSim] = useState('conge_annuel');

  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);

  // Récupérer les soldes (RECHERCHEX sur Soldes Congés)
  const solde = useMemo(() => SOLDES_CONGES.find(s => s.employee_id === employeeId), [employeeId]);

  // Récupérer les congés de l'employé
  const congesEmp = useMemo(() => CONGES.filter(c => c.employee_id === employeeId).sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut)), [employeeId]);

  // Récupérer les absences maladie (FILTER sur Absences Maladie)
  const absencesEmp = useMemo(() => ABSENCES.filter(a => a.employee_id === employeeId).sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut)).slice(0, 5), [employeeId]);

  // Calcul du solde simulé
  const soldeActuel = solde?.solde_disponible ?? 0;
  const soldeSimule = soldeActuel - joursSimules;
  const soldeSuffisant = soldeSimule >= 0;

  // Congés en cours / en attente
  const congesEnAttente = congesEmp.filter(c => c.statut === 'en_attente');
  const congesApprouves = congesEmp.filter(c => c.statut === 'approuvee');
  const joursEnAttente = congesEnAttente.reduce((s, c) => s + c.nombre_jours, 0);

  return (
    <Card sx={{ mt: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {/* En-tête */}
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EventAvailableIcon fontSize='small' />
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
              Simulateur de Congés & Absences
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.7rem' }}>
              Soldes en temps réel · Simulation de prise de congé · Historique absences
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          {/* === COLONNE GAUCHE : Soldes + Simulateur === */}
          <Grid item xs={12} md={7}>
            {/* Soldes actuels (RECHERCHEX) */}
            <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
              Soldes actuels ({solde?.annee || '2025'})
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <SoldeCard label='Droit acquis' value={solde?.droit_annuel_jours ?? 0} max={solde?.droit_annuel_jours ?? 30} color={NAVY} icon={<CalendarTodayIcon fontSize='small' />} subtitle='Annuel' />
              </Grid>
              <Grid item xs={6} sm={3}>
                <SoldeCard label='Pris' value={solde?.conges_pris_jours ?? 0} max={solde?.droit_annuel_jours ?? 30} color={ORANGE} icon={<TrendingDownIcon fontSize='small' />} subtitle='Cette année' />
              </Grid>
              <Grid item xs={6} sm={3}>
                <SoldeCard label='En cours' value={solde?.conges_en_cours ?? 0} max={solde?.droit_annuel_jours ?? 30} color={GOLD} icon={<EventAvailableIcon fontSize='small' />} subtitle='Demandes en attente' />
              </Grid>
              <Grid item xs={6} sm={3}>
                <SoldeCard label='Solde disponible' value={solde?.solde_disponible ?? 0} max={solde?.droit_annuel_jours ?? 30} color={solde?.solde_disponible >= 5 ? VERT : ROUGE} icon={<CheckCircleIcon fontSize='small' />} subtitle='Restant' />
              </Grid>
            </Grid>

            {/* Alert si solde faible */}
            {soldeActuel < 5 && soldeActuel > 0 && (
              <Alert severity='warning' icon={<TrendingDownIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.78rem' }}>
                <strong>Solde faible :</strong> Il ne reste que {soldeActuel} jour(s) de congé. Anticipez les demandes.
              </Alert>
            )}
            {soldeActuel <= 0 && (
              <Alert severity='error' icon={<CancelIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.78rem' }}>
                <strong>Solde épuisé :</strong> Aucun congé disponible. Toute demande sera en solde négatif.
              </Alert>
            )}

            {/* === SIMULATEUR === */}
            <Box sx={{ p: 2, bgcolor: '#fafcfe', borderRadius: 2, border: '1px solid #e9edf2' }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.5 }}>
                <CalculateIcon sx={{ fontSize: 18, color: VIOLET }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: VIOLET }}>
                  Simulateur de prise de congé
                </Typography>
              </Stack>

              {/* Curseur nombre de jours */}
              <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', mb: 0.5, display: 'block' }}>
                Jours à poser : <strong style={{ color: NAVY, fontSize: '0.85rem' }}>{joursSimules}</strong> jour(s)
              </Typography>
              <Slider
                value={joursSimules}
                onChange={(_, v) => setJoursSimules(v)}
                min={0}
                max={Math.max(soldeActuel + 10, 30)}
                step={0.5}
                marks={[
                  { value: 0, label: '0' },
                  { value: soldeActuel, label: `${soldeActuel}` },
                  { value: Math.max(soldeActuel + 10, 30), label: `${Math.max(soldeActuel + 10, 30)}` },
                ]}
                sx={{
                  color: soldeSuffisant ? VERT : ROUGE,
                  '& .MuiSlider-thumb': { width: 20, height: 20, bgcolor: soldeSuffisant ? VERT : ROUGE },
                  '& .MuiSlider-markLabel': { fontSize: '0.6rem', color: '#6b7a8a' },
                  mb: 2,
                }}
              />

              {/* Saisie manuelle aussi */}
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
                <TextField
                  type='number' size='small' label='Jours à poser'
                  value={joursSimules}
                  onChange={(e) => setJoursSimules(Math.max(0, parseFloat(e.target.value) || 0))}
                  inputProps={{ min: 0, max: 60, step: 0.5 }}
                  sx={{ width: 120 }}
                />
                <TextField
                  select size='small' label='Type de congé' value={typeCongeSim} onChange={(e) => setTypeCongeSim(e.target.value)} sx={{ flex: 1, minWidth: 150 }}
                >
                  {Object.entries(LABELS.type_conge).map(([k, v]) => <MenuItem key={k} value={k} sx={{ fontSize: '0.75rem' }}>{v}</MenuItem>)}
                </TextField>
              </Stack>

              {/* Résultat simulation */}
              <Box sx={{
                p: 1.5, borderRadius: 1.5,
                bgcolor: soldeSuffisant ? 'rgba(26,122,74,0.08)' : 'rgba(179,58,74,0.08)',
                border: `1px solid ${soldeSuffisant ? VERT : ROUGE}30`,
              }}>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  {soldeSuffisant ? <CheckCircleIcon sx={{ color: VERT }} /> : <CancelIcon sx={{ color: ROUGE }} />}
                  <Box sx={{ flex: 1 }}>
                    {joursSimules === 0 ? (
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', color: '#6b7a8a' }}>
                        Déplacez le curseur ou saisissez un nombre de jours pour simuler une prise de congé.
                      </Typography>
                    ) : soldeSuffisant ? (
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', color: VERT, fontWeight: 600 }}>
                        ✅ Solde après congé : <strong>{soldeSimule} jour(s)</strong>
                        <span style={{ color: '#6b7a8a', fontWeight: 400 }}> ({soldeActuel} - {joursSimules} = {soldeSimule})</span>
                      </Typography>
                    ) : (
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', color: ROUGE, fontWeight: 600 }}>
                        ❌ Solde insuffisant (solde actuel : {soldeActuel}j, demande : {joursSimules}j, déficit : {Math.abs(soldeSimule)}j)
                      </Typography>
                    )}
                  </Box>
                  {joursSimules > 0 && (
                    <Chip
                      label={soldeSuffisant ? `Reste ${soldeSimule}j` : `Déficit ${Math.abs(soldeSimule)}j`}
                      size='small'
                      sx={{ bgcolor: soldeSuffisant ? VERT : ROUGE, color: '#fff', fontWeight: 700, fontSize: '0.68rem' }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Barre de comparaison visuelle */}
              {joursSimules > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', mb: 0.5, display: 'block' }}>Comparaison visuelle</Typography>
                  <Stack direction='row' spacing={0.5} sx={{ height: 24, borderRadius: 1, overflow: 'hidden' }}>
                    {/* Solde actuel */}
                    <Box sx={{
                      flex: soldeActuel,
                      bgcolor: VERT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff', fontWeight: 600,
                    }}>
                      {soldeActuel > 0 ? `${soldeActuel}j` : ''}
                    </Box>
                    {/* Congé simulé */}
                    <Box sx={{
                      flex: joursSimules,
                      bgcolor: soldeSuffisant ? ORANGE : ROUGE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff', fontWeight: 600,
                    }}>
                      {joursSimules > 0 ? `-${joursSimules}j` : ''}
                    </Box>
                    {/* Solde restant */}
                    {soldeSimule > 0 && (
                      <Box sx={{
                        flex: soldeSimule, bgcolor: NAVY_LIGHT || '#1a4a7a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', color: '#fff', fontWeight: 600,
                      }}>
                        {soldeSimule > 0 ? `${soldeSimule}j` : ''}
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Congés en attente */}
              {joursEnAttente > 0 && (
                <Alert severity='info' sx={{ mt: 1.5, borderRadius: 1, fontSize: '0.72rem' }}>
                  <strong>{congesEnAttente.length} demande(s) en attente</strong> ({joursEnAttente}j) — non encore déduites du solde.
                </Alert>
              )}
            </Box>
          </Grid>

          {/* === COLONNE DROITE : Dernières absences maladie === */}
          <Grid item xs={12} md={5}>
            <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
              5 dernières absences maladie
            </Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8', mb: 1, display: 'block' }}>
              Source: D2-10-Absences Maladie · FILTER sur employé
            </Typography>

            {absencesEmp.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#fafcfe', borderRadius: 1.5, border: '1px solid #e9edf2' }}>
                <SickIcon sx={{ fontSize: 32, color: '#ccc', mb: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.75rem', color: '#6b7a8a' }}>Aucune absence maladie enregistrée</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1.5, maxHeight: 280 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Période</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Durée</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Motif</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {absencesEmp.map((a, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Chip label={LABELS.type_absence?.[a.type_absence] || a.type_absence} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.type_absence === 'maladie' ? 'error' : 'warning'} variant='outlined' />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                            {formatDate(a.date_debut)} → {formatDate(a.date_fin)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='caption' sx={{ fontSize: '0.68rem', fontWeight: 700, color: ORANGE }}>
                            {a.duree_jours}j
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#4a5a6a', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.motif}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={LABELS.statut_absence?.[a.statut] || a.statut} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.statut === 'justifiee' ? 'success' : a.statut === 'non_justifiee' ? 'error' : 'warning'} variant='outlined' />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Résumé absences */}
            <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'rgba(179,58,74,0.06)', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={700} sx={{ color: ROUGE, fontSize: '0.85rem' }}>
                  {absencesEmp.reduce((s, a) => s + a.duree_jours, 0)}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>Jours (5 der.)</Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: 'rgba(184,106,42,0.06)', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={700} sx={{ color: ORANGE, fontSize: '0.85rem' }}>
                  {absencesEmp.filter(a => a.statut === 'justifiee').length}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>Justifiées</Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: 'rgba(179,58,74,0.06)', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={700} sx={{ color: ROUGE, fontSize: '0.85rem' }}>
                  {absencesEmp.filter(a => a.statut === 'non_justifiee').length}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>Non justifiées</Typography>
              </Box>
            </Box>

            {/* Derniers congés approuvés */}
            <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mt: 2, mb: 1, display: 'block' }}>
              Derniers congés ({congesApprouves.length} approuvés)
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1.5, maxHeight: 180 }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Période</TableCell>
                    <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Jours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {congesApprouves.slice(0, 5).map((c, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Chip label={LABELS.type_conge[c.type_conge]} size='small' sx={{ fontSize: '0.58rem', height: 16 }} variant='outlined' /></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.62rem' }}>{formatDate(c.date_debut)} → {formatDate(c.date_fin)}</Typography></TableCell>
                      <TableCell align='center'><Typography variant='caption' sx={{ fontSize: '0.65rem', fontWeight: 700, color: VERT }}>{c.nombre_jours}j</Typography></TableCell>
                    </TableRow>
                  ))}
                  {congesApprouves.length === 0 && (
                    <TableRow><TableCell colSpan={3} sx={{ py: 1.5, textAlign: 'center', color: '#6b7a8a', fontSize: '0.7rem' }}>Aucun congé approuvé</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
