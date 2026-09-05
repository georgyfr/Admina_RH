// ============================================================
// AnalysePrevisionnelle.jsx — Analyse prédictive des effectifs
//   • LineChart historique 12 mois + prévision 3 mois (pointillés + IC)
//   • Résumé exécutif narratif dynamique
//   • Alertes périodes d'essai (fins <15j)
// ============================================================
import { useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Divider, Alert, AlertTitle, Button, Tooltip,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Legend, Area, ComposedChart, ReferenceLine,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import InfoIcon from '@mui/icons-material/Info';
import {
  genererHistoriqueEffectif, prevoirETS, genererCommentaireNarratif,
  genererDonneesChart, detecterPeriodesEssaiCritiques,
} from './prevision';
import { employeeFullName, formatDate } from './data';

// Couleurs
const NAVY = '#0b2a4a';
const NAVY_LIGHT = '#1a4a7a';
const GOLD = '#f9c74f';
const VERT = '#2a7a4a';
const ROUGE = '#b33a4a';
const ORANGE = '#b86a2a';

function TonIcon({ ton }) {
  if (ton === 'positif') return <TrendingUpIcon sx={{ color: VERT }} />;
  if (ton === 'attention') return <TrendingDownIcon sx={{ color: ROUGE }} />;
  return <TrendingFlatIcon sx={{ color: '#6b7a8a' }} />;
}

export default function AnalysePrevisionnelle({ data }) {
  const historique = useMemo(() => genererHistoriqueEffectif(), []);
  const previsions = useMemo(() => prevoirETS(historique, 3), [historique]);
  const chartData = useMemo(() => genererDonneesChart(historique, previsions), [historique, previsions]);
  const commentaire = useMemo(() => genererCommentaireNarratif(historique, previsions, data.k.effectifTotal, data.k.masseSalarialeBrute), [historique, previsions, data]);
  const essaisCritiques = useMemo(() => detecterPeriodesEssaiCritiques(), []);

  const prev3Mois = previsions.length > 0 ? previsions[previsions.length - 1].prevision : data.k.effectifTotal;
  const delta = prev3Mois - data.k.effectifTotal;

  return (
    <Box sx={{ mt: 2.5 }}>
      {/* En-tête section */}
      <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoGraphIcon fontSize='small' />
        </Box>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: NAVY, fontSize: '0.95rem' }}>
            Analyse Prévisionnelle
          </Typography>
          <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.72rem' }}>
            Prévision ETS sur 3 mois · Résumé exécutif · Alertes périodes d'essai
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 2.5 }}>
        {/* Graphique prévisionnel */}
        <Card sx={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Évolution et prévision de l'effectif
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>
                  Historique 12 mois + prévision 3 mois (méthode ETS)
                </Typography>
              </Box>
              <Stack direction='row' spacing={0.5}>
                <Chip label='Réel' size='small' sx={{ bgcolor: NAVY, color: '#fff', fontSize: '0.62rem', height: 20 }} />
                <Chip label='Prévision' size='small' sx={{ bgcolor: 'transparent', color: GOLD, border: `1px dashed ${GOLD}`, fontSize: '0.62rem', height: 20 }} />
                <Chip label='IC 95%' size='small' sx={{ bgcolor: 'rgba(184,106,42,0.1)', color: ORANGE, fontSize: '0.62rem', height: 20 }} />
              </Stack>
            </Stack>
            <ResponsiveContainer width='100%' height={280}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id='icGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={ORANGE} stopOpacity={0.25} />
                    <stop offset='95%' stopColor={ORANGE} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                <XAxis dataKey='mois' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                <RTooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }}
                  formatter={(value, name) => {
                    if (value === null || value === undefined) return ['—', name];
                    const labels = { effectif: 'Effectif réel', prevision: 'Prévision', icInf: 'IC inf', icSup: 'IC sup' };
                    return [value, labels[name] || name];
                  }}
                />
                {/* Zone intervalle de confiance */}
                <Area type='monotone' dataKey='icSup' stroke='none' fill='url(#icGrad)' name='IC sup' />
                <Area type='monotone' dataKey='icInf' stroke='none' fill='#fff' name='IC inf' />
                {/* Ligne historique (pleine) */}
                <Line type='monotone' dataKey='effectif' stroke={NAVY} strokeWidth={2.5} dot={{ fill: NAVY, r: 3 }} name='effectif' connectNulls={false} />
                {/* Ligne prévision (pointillée) */}
                <Line type='monotone' dataKey='prevision' stroke={GOLD} strokeWidth={2.5} strokeDasharray='6 4' dot={{ fill: GOLD, r: 3 }} name='prevision' connectNulls={true} />
                {/* Ligne verticale séparation réel/prévision */}
                {historique.length > 0 && (
                  <ReferenceLine x={historique[historique.length - 1].mois} stroke='#b0c4de' strokeDasharray='2 2' label={{ value: 'Auj.', position: 'top', fontSize: 10, fill: '#6b7a8a' }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Résumé exécutif narratif */}
        <Card sx={{
          border: `2px solid ${commentaire.ton === 'positif' ? VERT : commentaire.ton === 'attention' ? ROUGE : '#6b7a8a'}`,
          borderLeft: `6px solid ${commentaire.ton === 'positif' ? VERT : commentaire.ton === 'attention' ? ROUGE : '#6b7a8a'}`,
          boxShadow: `0 2px 8px ${commentaire.ton === 'positif' ? VERT : commentaire.ton === 'attention' ? ROUGE : '#6b7a8a'}25`,
        }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
              <TonIcon ton={commentaire.ton} />
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Résumé exécutif
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>
                  {commentaire.titre}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant='body2' sx={{ fontSize: '0.82rem', color: '#1a2a3a', lineHeight: 1.5 }}>
              {commentaire.texte}
            </Typography>

            {/* Synthèse chiffrée */}
            <Stack direction='row' spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ p: 1, bgcolor: '#eef3f9', borderRadius: 1, flex: 1, minWidth: 90 }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Effectif actuel</Typography>
                <Typography variant='h6' sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem' }}>{data.k.effectifTotal}</Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: delta > 0 ? 'rgba(26,122,74,0.08)' : delta < 0 ? 'rgba(179,58,74,0.08)' : '#eef3f9', borderRadius: 1, flex: 1, minWidth: 90 }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Prévision 3 mois</Typography>
                <Typography variant='h6' sx={{ fontWeight: 700, color: delta > 0 ? VERT : delta < 0 ? ROUGE : NAVY, fontSize: '1rem' }}>
                  {prev3Mois} ({delta > 0 ? '+' : ''}{delta})
                </Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: 'rgba(249,199,79,0.12)', borderRadius: 1, flex: 1, minWidth: 90 }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Variation</Typography>
                <Typography variant='h6' sx={{ fontWeight: 700, color: GOLD, fontSize: '1rem' }}>
                  {delta > 0 ? '+' : ''}{data.k.effectifTotal > 0 ? ((delta / data.k.effectifTotal) * 100).toFixed(1) : 0}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Alerte périodes d'essai */}
      {essaisCritiques.length > 0 && (
        <Alert
          severity={essaisCritiques.some(e => e.joursRestants < 0 || e.joursRestants <= 15) ? 'error' : 'warning'}
          icon={essaisCritiques.some(e => e.joursRestants < 0 || e.joursRestants <= 15) ? <WarningAmberIcon /> : <HourglassEmptyIcon />}
          sx={{
            mt: 2.5,
            border: `1px solid ${essaisCritiques.some(e => e.joursRestants < 0 || e.joursRestants <= 15) ? ROUGE : ORANGE}`,
            borderLeft: `6px solid ${essaisCritiques.some(e => e.joursRestants < 0 || e.joursRestants <= 15) ? ROUGE : ORANGE}`,
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
            {essaisCritiques.length} période(s) d'essai nécessitent une décision
          </AlertTitle>
          <Typography variant='body2' sx={{ fontSize: '0.78rem', mb: 1 }}>
            {essaisCritiques.filter(e => e.joursRestants <= 15 && e.joursRestants >= 0).length} fin(s) dans les 15 prochains jours, {essaisCritiques.filter(e => e.joursRestants < 0).length} déjà expirée(s). Décision RH requise (confirmation, prolongation ou rupture).
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {essaisCritiques.slice(0, 5).map((e, i) => (
              <Tooltip key={i} title={`Embauché le ${formatDate(e.dateEmbauche)} · Fin essai: ${formatDate(e.dateFinEssai)}`}>
                <Chip
                  size='small'
                  label={`${employeeFullName(e.employee)} — ${e.joursRestants < 0 ? 'EXPIRÉ' : e.joursRestants + 'j'}`}
                  sx={{
                    bgcolor: e.joursRestants < 0 ? ROUGE : e.joursRestants <= 15 ? ROUGE : ORANGE,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.68rem',
                  }}
                />
              </Tooltip>
            ))}
            {essaisCritiques.length > 5 && (
              <Chip size='small' label={`+${essaisCritiques.length - 5} autres`} sx={{ bgcolor: '#6b7a8a', color: '#fff', fontSize: '0.68rem' }} />
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
}
