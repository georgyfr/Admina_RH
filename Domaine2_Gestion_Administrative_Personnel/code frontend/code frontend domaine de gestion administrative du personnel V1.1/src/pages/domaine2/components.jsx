import { Box, Card, CardContent, Typography, Chip, LinearProgress, Tooltip, IconButton, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// --- Statut -> couleur ---
const STATUT_COLORS = {
  // Employés
  'Actif': 'success', 'Inactif': 'default', 'Suspendu': 'error', 'Essai': 'warning',
  // Contrats
  'En vigueur': 'success', 'Echu': 'default', 'Resilie': 'error', 'Suspendu': 'warning',
  // Congés
  'en_attente': 'warning', 'approuvee': 'success', 'rejetee': 'error', 'annulee': 'default',
  // Documents
  'Valide': 'success', 'A renouveler': 'warning', 'Expire': 'error',
  // Permis
  'Valide': 'success', 'A renouveler': 'warning', 'En renouvellement': 'info', 'Expire': 'error',
  // Déclarations
  'soumise': 'info', 'en_retard': 'error', 'validee': 'success',
  // Prêts
  'demande': 'default', 'accorde': 'info', 'en_remboursement': 'warning', 'solde': 'success', 'refuse': 'error',
  // Heures supp
  'en_attente': 'warning', 'validee': 'success', 'rejetee': 'error', 'payee': 'info',
  // Sanctions
  'avertissement_oral': 'warning', 'avertissement_ecrit': 'warning', 'blame': 'error', 'suspension': 'error',
  // Aptitude
  'apte': 'success', 'apte_avec_restrictions': 'warning', 'inapte_temporaire': 'error', 'inapte_definitif': 'error',
  // Rappels
  'en_attente': 'warning', 'en_retard': 'error', 'traite': 'success',
  // Départs
  'en_cours': 'info', 'en_attente_piece': 'warning', 'clos': 'success',
  'notififiee': 'info', 'en_execution': 'warning', 'executee': 'success', 'annulee': 'default',
};

export function StatusBadge({ status, label, size = 'small' }) {
  const color = STATUT_COLORS[status] || 'default';
  return <Chip label={label || status} size={size} color={color} variant='outlined' sx={{ fontWeight: 600, fontSize: '0.68rem', textTransform: 'capitalize' }} />;
}

// --- KPI Card ---
export function KPICard({ label, value, icon, color = 'primary', trend, subtitle, target }) {
  const trendIcon = trend > 0 ? <TrendingUpIcon /> : trend < 0 ? <TrendingDownIcon /> : <TrendingFlatIcon />;
  const trendColor = trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  return (
    <Card sx={{ position: 'relative', overflow: 'hidden', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}.main`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
          {trend !== undefined && (
            <Tooltip title={target ? `Cible: ${target}` : ''}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: trendColor, fontSize: '0.75rem', fontWeight: 600 }}>
                {trendIcon}
                {Math.abs(trend)}%
              </Box>
            </Tooltip>
          )}
        </Box>
        <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.1, mb: 0.3 }}>{value}</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.72rem', fontWeight: 500 }}>{label}</Typography>
        {subtitle && <Typography variant='caption' sx={{ display: 'block', fontSize: '0.65rem', color: 'text.disabled', mt: 0.3 }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

// --- Cellule montant FCFA ---
export function MontantCell({ value, align = 'right' }) {
  if (!value) return <Typography align={align} color='text.disabled'>—</Typography>;
  return <Typography align={align} sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 500 }}>{new Intl.NumberFormat('fr-FR').format(value)} <Box component='span' sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>FCFA</Box></Typography>;
}

// --- Cellule jours restants avec couleur ---
export function JoursRestantsCell({ date }) {
  if (!date) return <Typography color='text.disabled'>—</Typography>;
  const j = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  let color = 'success', label = `${j} j`;
  if (j < 0) { color = 'error'; label = 'Expiré'; }
  else if (j < 15) color = 'error';
  else if (j < 30) color = 'warning';
  return <Chip label={label} size='small' color={color} variant='outlined' sx={{ fontSize: '0.68rem' }} />;
}

// --- Barre de progression ---
export function ProgressCell({ value, max = 100, color, label }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = color || (pct > 75 ? 'error' : pct > 50 ? 'warning' : 'success');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress variant='determinate' value={pct} color={barColor} sx={{ height: 7, borderRadius: 4 }} />
      </Box>
      <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 35 }}>{label || `${Math.round(pct)}%`}</Typography>
    </Box>
  );
}

// --- Empty state ---
export function EmptyState({ icon, title, action }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
      {icon}
      <Typography variant='subtitle2' sx={{ mt: 1 }}>{title}</Typography>
      {action}
    </Box>
  );
}

// --- En-tête de section ---
export function SectionHeader({ title, subtitle, action }) {
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={2} sx={{ mb: 2, gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='subtitle1' fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant='caption' color='text.secondary'>{subtitle}</Typography>}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}
