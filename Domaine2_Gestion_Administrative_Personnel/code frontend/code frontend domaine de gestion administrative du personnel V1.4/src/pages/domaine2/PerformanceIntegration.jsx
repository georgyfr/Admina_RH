// ============================================================
// PerformanceIntegration.jsx — Tableau de bord individuel des performances
// Récupère les données d'évaluation du Domaine 1 (RECHERCHEX sur 4 feuilles)
//   • 4-Grille Evaluation → Score entretien
//   • 19-Evaluation Strategique → Score stratégique
//   • 13-Periode Essai → Résultat période d'essai
//   • 17-Suivi Post-Embauche → Satisfaction + Risque de départ
// ============================================================
import { useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Grid, Divider, Alert, LinearProgress, Tooltip, Button,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { recupererEvaluationsEmployee } from './dataD1';
import { formatDate } from './data';

const NAVY = '#0b2a4a';
const VIOLET = '#7e3ff2';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const GOLD = '#f9c74f';

// --- Jauge circulaire (avec % de remplissage) ---
function JaugeScore({ value, max = 100, label, icon, color, subtitle, detail }) {
  const pct = Math.min(100, (value / max) * 100);
  const couleur = value >= 85 ? VERT : value >= 70 ? NAVY : value >= 50 ? ORANGE : ROUGE;
  return (
    <Card sx={{ borderRadius: '16px', border: `1px solid #e9edf2`, borderLeft: `4px solid ${couleur}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 1 }}>
          <Box>
            <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500, fontSize: '0.62rem', display: 'block', lineHeight: 1.2 }}>{label}</Typography>
            {subtitle && <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', display: 'block' }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: `${couleur}15`, color: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
        </Stack>
        <Typography variant='h4' fontWeight={800} sx={{ color: couleur, lineHeight: 1, mb: 0.5, fontSize: '1.6rem' }}>
          {value !== null && value !== undefined ? value : '—'}<span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b7a8a' }}>/{max}</span>
        </Typography>
        {detail && <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', fontWeight: 600, display: 'block', mb: 1 }}>{detail}</Typography>}
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant='determinate'
            value={pct}
            sx={{
              height: 8, borderRadius: 4, bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': { bgcolor: couleur, borderRadius: 4 },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// --- Jauge étoiles (pour satisfaction /5) ---
function JaugeEtoiles({ value, max = 5, label, subtitle }) {
  const fullStars = Math.floor(value || 0);
  const halfStar = (value || 0) - fullStars >= 0.5;
  const couleur = value >= 4 ? VERT : value >= 3 ? ORANGE : ROUGE;
  return (
    <Card sx={{ borderRadius: '16px', border: `1px solid #e9edf2`, borderLeft: `4px solid ${couleur}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500, fontSize: '0.62rem', display: 'block', mb: 0.5 }}>{label}</Typography>
        {subtitle && <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', display: 'block', mb: 0.5 }}>{subtitle}</Typography>}
        <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.5 }}>
          {Array.from({ length: max }).map((_, i) => (
            <StarIcon key={i} sx={{ fontSize: 20, color: i < fullStars ? couleur : (i === fullStars && halfStar ? couleur : '#e0e0e0') }} />
          ))}
          <Typography variant='h6' fontWeight={700} sx={{ color: couleur, ml: 0.5, fontSize: '1.1rem' }}>
            {value !== null && value !== undefined ? value.toFixed(1) : '—'}<span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#6b7a8a' }}>/5</span>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Badge risque ---
function RisqueBadge({ risque, niveau }) {
  const color = niveau === 0 ? VERT : niveau === 1 ? VERT : niveau === 2 ? ORANGE : ROUGE;
  const bg = niveau === 0 ? 'rgba(26,122,74,0.1)' : niveau === 1 ? 'rgba(26,122,74,0.1)' : niveau === 2 ? 'rgba(184,106,42,0.12)' : 'rgba(179,58,74,0.12)';
  const icon = niveau >= 3 ? <WarningAmberIcon fontSize='small' /> : niveau === 2 ? <WarningAmberIcon fontSize='small' /> : <CheckCircleIcon fontSize='small' />;
  return (
    <Chip icon={icon} label={risque} size='small' sx={{ bgcolor: bg, color, fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
  );
}

export default function PerformanceIntegration({ employeeId }) {
  const evals = useMemo(() => recupererEvaluationsEmployee(employeeId), [employeeId]);
  const { grille, strategique, periodeEssai, suiviPostEmbauche } = evals;

  // Risque de départ
  const risqueCritique = suiviPostEmbauche?.risque_depart === 'Élevé' || suiviPostEmbauche?.risque_depart === 'Critique';

  // Données pour le graphique d'évolution satisfaction
  const evolutionSatisfaction = useMemo(() => {
    if (!suiviPostEmbauche) return [];
    return [
      { periode: '1 mois', satisfaction: suiviPostEmbauche.satisfaction_1m },
      { periode: '3 mois', satisfaction: suiviPostEmbauche.satisfaction_3m },
      { periode: '6 mois', satisfaction: suiviPostEmbauche.satisfaction_6m },
    ].filter(s => s.satisfaction !== null && s.satisfaction !== undefined);
  }, [suiviPostEmbauche]);

  return (
    <Card sx={{ mt: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {/* En-tête */}
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpeedIcon fontSize='small' />
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
              Performance & Intégration
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.7rem' }}>
              Bilan du recrutement · Évaluations D1 (RECHERCHEX sur 4 feuilles)
            </Typography>
          </Box>
        </Stack>

        {/* === ALERTE RISQUE DE DÉPART === */}
        {risqueCritique && (
          <Alert severity='error' icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${ROUGE}`, borderLeft: `6px solid ${ROUGE}`, fontWeight: 600 }}>
            <strong>⚠️ Attention : risque de départ identifié ({suiviPostEmbauche.risque_depart}).</strong> Consulter l'onglet Suivi Post-Embauche.
            {suiviPostEmbauche.actions_recommandees && (
              <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontWeight: 400 }}>
                Action recommandée : {suiviPostEmbauche.actions_recommandees}
              </Typography>
            )}
          </Alert>
        )}

        {/* === 4 JAUGES BILAN RECRUTEMENT === */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {/* Score entretien (4-Grille Evaluation) */}
          <Grid item xs={6} sm={3}>
            <JaugeScore
              value={grille?.score}
              max={100}
              label='Score Entretien'
              subtitle={grille ? formatDate(grille.date_evaluation) : 'Non évalué'}
              icon={<AssessmentIcon fontSize='small' />}
              detail={grille?.recommandation}
            />
          </Grid>

          {/* Score stratégique (19-Evaluation Strategique) */}
          <Grid item xs={6} sm={3}>
            <JaugeScore
              value={strategique?.score}
              max={100}
              label='Score Stratégique'
              subtitle={strategique ? formatDate(strategique.date) : 'Non concerné'}
              icon={<PsychologyIcon fontSize='small' />}
              detail={strategique?.potentiel}
            />
          </Grid>

          {/* Résultat période d'essai (13-Periode Essai) */}
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: '16px', border: `1px solid #e9edf2`, borderLeft: `4px solid ${periodeEssai?.resultat === 'Confirmé' ? VERT : periodeEssai?.resultat === 'Rupture' ? ROUGE : ORANGE}`, height: '100%' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 1 }}>
                  <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500, fontSize: '0.62rem' }}>Période d'Essai</Typography>
                  <CheckCircleIcon sx={{ fontSize: 18, color: periodeEssai?.resultat === 'Confirmé' ? VERT : periodeEssai?.resultat === 'Rupture' ? ROUGE : ORANGE }} />
                </Stack>
                <Typography variant='h5' fontWeight={800} sx={{ color: periodeEssai?.resultat === 'Confirmé' ? VERT : periodeEssai?.resultat === 'Rupture' ? ROUGE : ORANGE, fontSize: '1.1rem', mb: 0.5 }}>
                  {periodeEssai?.resultat || 'Non concerné'}
                </Typography>
                {periodeEssai?.note_integration && (
                  <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', fontWeight: 600 }}>
                    Note intégration: {periodeEssai.note_integration}/5
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Satisfaction manager (17-Suivi Post-Embauche) */}
          <Grid item xs={6} sm={3}>
            <JaugeEtoiles
              value={suiviPostEmbauche?.satisfaction_3m}
              max={5}
              label='Satisfaction Manager'
              subtitle='À 3 mois (17-Suivi Post-Embauche)'
            />
          </Grid>
        </Grid>

        {/* === DÉTAIL DES ÉVALUATIONS === */}
        <Grid container spacing={2.5}>
          {/* Colonne gauche : détails évaluations */}
          <Grid item xs={12} md={7}>
            <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
              Détail des évaluations
            </Typography>

            {/* Grille d'évaluation */}
            {grille && (
              <Box sx={{ p: 1.5, bgcolor: '#fafcfe', borderRadius: 1.5, mb: 1.5, border: '1px solid #e9edf2' }}>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.5 }}>
                  <AssessmentIcon sx={{ fontSize: 16, color: NAVY }} />
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY }}>Grille d'évaluation (D1-4)</Typography>
                  <Chip label={grille.recommandation} size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: grille.score >= 85 ? 'rgba(26,122,74,0.1)' : 'rgba(184,106,42,0.1)', color: grille.score >= 85 ? VERT : ORANGE, fontWeight: 600 }} />
                </Stack>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.66rem', color: VERT, fontWeight: 600 }}>✓ Points forts</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', display: 'block' }}>{grille.points_forts}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.66rem', color: ORANGE, fontWeight: 600 }}>△ À améliorer</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', display: 'block' }}>{grille.points_faibles}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Évaluation stratégique */}
            {strategique && (
              <Box sx={{ p: 1.5, bgcolor: 'rgba(126, 63, 242, 0.04)', borderRadius: 1.5, mb: 1.5, border: '1px solid #e9edf2' }}>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.5 }}>
                  <PsychologyIcon sx={{ fontSize: 16, color: VIOLET }} />
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: VIOLET }}>Évaluation stratégique (D1-19)</Typography>
                  <Chip label={strategique.potentiel} size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(126, 63, 242, 0.1)', color: VIOLET, fontWeight: 600 }} />
                </Stack>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a' }}>Alignement culture</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#1a2a3a', display: 'block' }}>{strategique.alignement_culture}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a' }}>Plan de succession</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#1a2a3a', display: 'block' }}>{strategique.succession}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Bilan période d'essai */}
            {periodeEssai && (
              <Box sx={{ p: 1.5, bgcolor: periodeEssai.resultat === 'Confirmé' ? 'rgba(26,122,74,0.04)' : 'rgba(179,58,74,0.04)', borderRadius: 1.5, mb: 1.5, border: '1px solid #e9edf2' }}>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: periodeEssai.resultat === 'Confirmé' ? VERT : ROUGE }} />
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: periodeEssai.resultat === 'Confirmé' ? VERT : ROUGE }}>Bilan période d'essai (D1-13)</Typography>
                </Stack>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', display: 'block', mb: 0.5 }}>
                  <strong>Recommandation manager:</strong> {periodeEssai.recommandation_manager}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', display: 'block' }}>
                  <strong>Points d'amélioration:</strong> {periodeEssai.points_amelioration}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Colonne droite : suivi post-embauche + risque */}
          <Grid item xs={12} md={5}>
            <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
              Suivi post-embauche (D1-17)
            </Typography>

            {suiviPostEmbauche ? (
              <Box>
                {/* Risque de départ */}
                <Box sx={{ p: 1.5, bgcolor: risqueCritique ? 'rgba(179,58,74,0.08)' : 'rgba(26,122,74,0.06)', borderRadius: 1.5, mb: 1.5, border: `1px solid ${risqueCritique ? ROUGE : VERT}30` }}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <WarningAmberIcon sx={{ color: risqueCritique ? ROUGE : VERT, fontSize: 18 }} />
                      <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: risqueCritique ? ROUGE : VERT }}>Risque de départ</Typography>
                    </Stack>
                    <RisqueBadge risque={suiviPostEmbauche.risque_depart} niveau={suiviPostEmbauche.niveau_risque} />
                  </Stack>
                </Box>

                {/* Évolution satisfaction */}
                <Box sx={{ p: 1.5, bgcolor: '#fafcfe', borderRadius: 1.5, mb: 1.5, border: '1px solid #e9edf2' }}>
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.68rem', color: NAVY, mb: 1, display: 'block' }}>Évaluation par période</Typography>
                  {evolutionSatisfaction.map(s => (
                    <Stack key={s.periode} direction='row' justifyContent='space-between' alignItems='center' sx={{ py: 0.3 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>{s.periode}</Typography>
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <StarIcon sx={{ fontSize: 12, color: GOLD }} />
                        <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600, color: s.satisfaction >= 4 ? VERT : s.satisfaction >= 3 ? ORANGE : ROUGE }}>
                          {s.satisfaction.toFixed(1)}/5
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Box>

                {/* Feedbacks */}
                <Box sx={{ p: 1.5, bgcolor: '#fafcfe', borderRadius: 1.5, border: '1px solid #e9edf2' }}>
                  <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                    <FeedbackIcon sx={{ fontSize: 16, color: NAVY }} />
                    <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.68rem', color: NAVY }}>Feedbacks</Typography>
                  </Stack>
                  <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a', display: 'block', mb: 0.3 }}>
                    <strong style={{ color: NAVY }}>Manager:</strong> {suiviPostEmbauche.feedback_manager}
                  </Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a', display: 'block', mb: 0.3 }}>
                    <strong style={{ color: NAVY }}>Employé:</strong> {suiviPostEmbauche.feedback_employe}
                  </Typography>
                  <Divider sx={{ my: 0.8 }} />
                  <Typography variant='caption' sx={{ fontSize: '0.66rem', color: ORANGE, fontWeight: 600 }}>
                    <TrendingUpIcon sx={{ fontSize: 12, verticalAlign: 'text-bottom' }} /> Action: {suiviPostEmbauche.actions_recommandees}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: '#6b7a8a' }}>
                <Typography variant='caption' sx={{ fontSize: '0.78rem' }}>Aucun suivi post-embauche disponible</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
