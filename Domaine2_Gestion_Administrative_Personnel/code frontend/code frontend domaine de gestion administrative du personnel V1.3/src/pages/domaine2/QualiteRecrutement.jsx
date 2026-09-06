// ============================================================
// QualiteRecrutement.jsx — Section 7 : Qualité & Performance du Recrutement
// Interconnexion D1 -> D2 (IC-D1-D2-05)
// Récupère les indicateurs du Domaine 1 (Periode Essai, Suivi Post-Embauche, Base Candidats)
// et les affiche dans le tableau de bord Domaine 2
// ============================================================
import { useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Tooltip, LinearProgress, Alert,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Legend, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import StarIcon from '@mui/icons-material/Star';
import SyncIcon from '@mui/icons-material/Sync';
import LinkIcon from '@mui/icons-material/Link';

import {
  calculerIndicateursQualite, genererHistoriqueRetention, SUIVI_POST_EMBAUCHE,
  PERIODES_ESSAI, SOURCES_RECRUTEMENT, BASE_CANDIDATS_STATS, DEMANDES_RECRUTEMENT,
} from './dataD1';
import { findEmployee, employeeFullName, formatDate, formatNumber, formatFCFA } from './data';

const NAVY = '#0b2a4a';
const NAVY_LIGHT = '#1a4a7a';
const GOLD = '#f9c74f';
const VERT = '#2a7a4a';
const ROUGE = '#b33a4a';
const ORANGE = '#b86a2a';
const VIOLET = '#7e3ff2';

const SOURCE_COLORS = ['#0b2a4a', '#1a4a7a', '#7e3ff2', '#f9c74f', '#2a7a4a', '#b86a2a'];

function QualiteKPI({ label, value, subtitle, icon, color, target, trend }) {
  const targetMet = target !== undefined && typeof value === 'number' && value >= target;
  return (
    <Card sx={{ borderRadius: '16px', border: '1px solid #eaedf2', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500, fontSize: '0.66rem', display: 'block', lineHeight: 1.2 }}>{label}</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#0b2a4a', mt: 0.5, lineHeight: 1.1, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>{value}</Typography>
            {subtitle && <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.66rem', display: 'block', mt: 0.3 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1, flexShrink: 0 }}>{icon}</Box>
        </Box>
        {target !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Chip
              size='small'
              label={targetMet ? 'Objectif atteint' : `Objectif: ${target}`}
              color={targetMet ? 'success' : 'default'}
              variant='outlined'
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
            {trend !== undefined && (
              <Chip
                size='small'
                icon={trend > 0 ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                sx={{
                  fontSize: '0.6rem', height: 18,
                  bgcolor: trend > 0 ? '#e6f4ed' : '#fde8eb',
                  color: trend > 0 ? VERT : ROUGE,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function QualiteRecrutement({ data }) {
  const indicateurs = useMemo(() => calculerIndicateursQualite(), []);
  const historique = useMemo(() => genererHistoriqueRetention(), []);
  const sourcesData = useMemo(() => SOURCES_RECRUTEMENT.map(s => ({ name: s.label, count: s.count, cout: s.cout_moyen, qualite: s.qualite_moyenne })), []);
  const performanceData = useMemo(() => Object.entries(indicateurs.parPerformance).map(([name, value]) => ({ name, value })), [indicateurs]);

  // Table des employés récemment recrutés (suivi post-embauche)
  const recents = useMemo(() => {
    return SUIVI_POST_EMBAUCHE
      .sort((a, b) => new Date(b.date_embauche) - new Date(a.date_embauche))
      .slice(0, 8)
      .map(s => {
        const emp = findEmployee(s.employee_id);
        return { ...s, employee: emp };
      });
  }, []);

  return (
    <Box>
      {/* En-tête section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SyncIcon fontSize='small' />
          </Box>
          <Box>
            <Typography variant='subtitle1' fontWeight={700} sx={{ color: NAVY, fontSize: '0.95rem' }}>
              Qualité & Performance du Recrutement
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.72rem' }}>
              Interconnexion D1 → D2 · Indicateurs post-embauche (IC-D1-D2-05)
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={<LinkIcon sx={{ fontSize: '14px !important' }} />}
          label='Source: Domaine 1 (Recrutement)'
          size='small'
          sx={{ bgcolor: 'rgba(126, 63, 242, 0.1)', color: VIOLET, fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Bandeau interconnexion D1-D2 */}
      <Alert severity='info' icon={<LinkIcon />} sx={{ mb: 2.5, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.78rem' } }}>
        Cette section récupère automatiquement les données du <strong>Domaine 1 (Recrutement)</strong> : feuilles 13-Periode Essai, 17-Suivi Post-Embauche et 2-Base Candidats.
        Les indicateurs ci-dessous mesurent la <strong>qualité du recrutement après embauche</strong> (stabilité, performance, intégration).
      </Alert>

      {/* KPIs qualité recrutement */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Taux Rétention 3 mois' value={`${indicateurs.tauxRetention3m}%`} subtitle='Employés présents à 3 mois' icon={<CheckCircleIcon fontSize='small' />} color={VERT} target={90} trend={2} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Taux Rétention 6 mois' value={`${indicateurs.tauxRetention6m}%`} subtitle='Employés présents à 6 mois' icon={<VerifiedIcon fontSize='small' />} color={NAVY} target={85} trend={1} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Turnover Précoce' value={`${indicateurs.turnoverPrecoce}%`} subtitle={`${indicateurs.rupturesEssai} rupture(s) d'essai`} icon={<CancelIcon fontSize='small' />} color={ROUGE} target={0} trend={-1} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Délai Complétude Dossier' value={`${indicateurs.delaiMoyenCompletude}j`} subtitle='Dossier admin. après embauche' icon={<HourglassEmptyIcon fontSize='small' />} color={ORANGE} target={7} trend={-2} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Satisfaction 3 mois' value={`${indicateurs.satisfactionMoyenne3m}/5`} subtitle='Nouveaux employés' icon={<StarIcon fontSize='small' />} color={GOLD} target={4} trend={1} />
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <QualiteKPI label='Délai Moyen Recrutement' value={`${indicateurs.delaiMoyenRecrutement}j`} subtitle='De demande à embauche' icon={<PeopleIcon fontSize='small' />} color={VIOLET} target={25} trend={-3} />
        </Grid>
      </Grid>

      {/* Charts row 1 : Évolution rétention + Sources de recrutement */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Évolution taux de rétention 12 mois */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>Évolution du Taux de Rétention</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>12 derniers mois · 3 mois vs 6 mois</Typography>
                </Box>
                <Stack direction='row' spacing={0.5}>
                  <Chip label='3 mois' size='small' sx={{ bgcolor: NAVY, color: '#fff', fontSize: '0.62rem', height: 20 }} />
                  <Chip label='6 mois' size='small' sx={{ bgcolor: GOLD, color: NAVY, fontSize: '0.62rem', height: 20 }} />
                </Stack>
              </Stack>
              <ResponsiveContainer width='100%' height={280}>
                <LineChart data={historique} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                  <XAxis dataKey='mois' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${v}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type='monotone' dataKey='retention3m' stroke={NAVY} strokeWidth={2.5} dot={{ fill: NAVY, r: 3 }} name='Rétention 3 mois' />
                  <Line type='monotone' dataKey='retention6m' stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 3 }} name='Rétention 6 mois' />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition par source de recrutement */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY, mb: 0.3 }}>Sources de Recrutement</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', mb: 1.5, display: 'block' }}>Nombre d'embauches par source</Typography>
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={sourcesData} layout='vertical' margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='#eaedf2' />
                  <XAxis type='number' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                  <YAxis type='category' dataKey='name' width={130} tick={{ fontSize: 10, fill: '#3a4a5a' }} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v, n) => [v, n === 'count' ? 'Embauches' : n]} />
                  <Bar dataKey='count' radius={[0, 6, 6, 0]} name='Embauches'>
                    {sourcesData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts row 2 : Performance période essai + Coût par source */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Statut périodes d'essai */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY, mb: 0.3 }}>Statut des Périodes d'Essai</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', mb: 1.5, display: 'block' }}>Source: D1-13-Periode Essai ({PERIODES_ESSAI.length} essais)</Typography>
              <ResponsiveContainer width='100%' height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Confirmé', value: PERIODES_ESSAI.filter(p => p.statut === 'Confirmé').length, color: VERT },
                      { name: 'En cours', value: PERIODES_ESSAI.filter(p => p.statut === 'En cours').length, color: ORANGE },
                      { name: 'Rupture', value: PERIODES_ESSAI.filter(p => p.statut === 'Rupture').length, color: ROUGE },
                    ].filter(d => d.value > 0)}
                    dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={80} label={({ name, value }) => `${name}: ${value}`}
                  >
                    {[{ color: VERT }, { color: ORANGE }, { color: ROUGE }].map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Coût et qualité par source */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY, mb: 0.3 }}>Qualité & Coût par Source</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', mb: 1.5, display: 'block' }}>Note qualité moyenne (sur 5) et coût moyen (FCFA)</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 240, border: '1px solid #e9edf2', borderRadius: 1 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Source</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Embauches</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Coût moyen</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Qualité</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {SOURCES_RECRUTEMENT.map((s, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize: '0.72rem' }}>{s.label}</TableCell>
                        <TableCell align='center' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{s.count}</TableCell>
                        <TableCell align='right' sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{s.cout_moyen === 0 ? 'Gratuit' : formatNumber(s.cout_moyen)}</TableCell>
                        <TableCell align='center'>
                          <Chip label={`${s.qualite_moyenne}/5`} size='small' sx={{
                            bgcolor: s.qualite_moyenne >= 4.5 ? VERT : s.qualite_moyenne >= 4.0 ? NAVY : ORANGE,
                            color: '#fff', fontSize: '0.62rem', fontWeight: 700, height: 18,
                          }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table : Suivi post-embauche des employés récemment recrutés */}
      <Card sx={{ border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>Suivi Post-Embauche — Employés récents</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>Source: D1-17-Suivi Post-Embauche ({recents.length} derniers recrutements)</Typography>
            </Box>
            <Chip label='IC-D1-D2-05' size='small' sx={{ bgcolor: 'rgba(126, 63, 242, 0.1)', color: VIOLET, fontWeight: 600, fontSize: '0.62rem' }} />
          </Stack>
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 360, border: '1px solid #e9edf2', borderRadius: 1 }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Employé</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Embauche</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>3 mois</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>6 mois</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Satisf. 3m</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Performance</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Délai dossier</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recents.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                          {s.employee?.prenom?.[0]}{s.employee?.nom?.[0]}
                        </Box>
                        <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{employeeFullName(s.employee)}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(s.date_embauche)}</Typography></TableCell>
                    <TableCell align='center'>
                      {s.mois_3_atteint ? <CheckCircleIcon sx={{ color: VERT, fontSize: 16 }} /> : <CancelIcon sx={{ color: '#ccc', fontSize: 16 }} />}
                    </TableCell>
                    <TableCell align='center'>
                      {s.mois_6_atteint === null ? <span style={{ color: '#ccc', fontSize: '0.7rem' }}>—</span> :
                        s.mois_6_atteint ? <CheckCircleIcon sx={{ color: VERT, fontSize: 16 }} /> : <CancelIcon sx={{ color: ROUGE, fontSize: 16 }} />}
                    </TableCell>
                    <TableCell align='center'>
                      <Chip label={s.satisfaction_3m ? `${s.satisfaction_3m}/5` : '—'} size='small' sx={{
                        bgcolor: s.satisfaction_3m >= 4 ? VERT : s.satisfaction_3m >= 3 ? ORANGE : ROUGE,
                        color: '#fff', fontSize: '0.6rem', fontWeight: 600, height: 18,
                      }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={s.performance} size='small' variant='outlined' sx={{
                        fontSize: '0.6rem',
                        color: s.performance === 'Au-dessus attentes' ? VERT : s.performance === 'Conforme attentes' ? NAVY : s.performance === 'Sous attentes' ? ROUGE : ORANGE,
                        borderColor: 'currentColor',
                      }} />
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='caption' sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: s.delai_completude_dossier_jours <= 7 ? VERT : ORANGE, fontWeight: 600 }}>
                        {s.delai_completude_dossier_jours}j
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={s.encore_present ? 'Présent' : 'Parti'}
                        size='small'
                        sx={{
                          bgcolor: s.encore_present ? 'rgba(26,122,74,0.1)' : 'rgba(179,58,74,0.1)',
                          color: s.encore_present ? VERT : ROUGE,
                          fontSize: '0.6rem', fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Synthèse coûts de recrutement */}
      <Card sx={{ mt: 2.5, border: `2px solid ${VIOLET}`, borderLeft: `6px solid ${VIOLET}`, bgcolor: 'rgba(126, 63, 242, 0.03)' }}>
        <CardContent sx={{ py: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WorkIcon />
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.88rem', color: NAVY }}>Synthèse Coûts de Recrutement</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.74rem', color: '#4a5a6a' }}>
                  {BASE_CANDIDATS_STATS.total_candidats} candidats · {BASE_CANDIDATS_STATS.candidats_embauches} embauchés · Taux de conversion: {BASE_CANDIDATS_STATS.taux_conversion}%
                </Typography>
              </Box>
            </Stack>
            <Stack direction='row' spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>Coût total</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: NAVY }}>{formatNumber(BASE_CANDIDATS_STATS.cout_total_recrutement / 1000)}k</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>FCFA</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>Coût / embauche</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: VIOLET }}>{formatNumber(BASE_CANDIDATS_STATS.cout_moyen_par_embauche)}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>FCFA</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>Délai moyen</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: ORANGE }}>{indicateurs.delaiMoyenRecrutement}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>jours</Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
