// ============================================================
// AlertesCritiques.jsx — Zone d'alertes intelligentes (feux tricolores)
// Détecte proactivement les échéances : contrats, documents, permis, visites médicales
// Équivalent Excel : zone "Alertes critiques" + mise en forme conditionnelle
// ============================================================
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, IconButton, Tooltip, Divider,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedIcon from '@mui/icons-material/Verified';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { detecterEcheancesCritiques, genererTexteSynthese, FEUX } from './seuils';
import { formatDate } from './data';

const TYPE_ICONS = {
  contrat: <DescriptionIcon fontSize='small' />,
  document: <DescriptionIcon fontSize='small' />,
  cnps: <VerifiedIcon fontSize='small' />,
  permis: <VerifiedIcon fontSize='small' />,
  visiteMedicale: <MedicalServicesIcon fontSize='small' />,
};

const TYPE_LABELS = {
  contrat: 'Contrat',
  document: 'Document',
  cnps: 'CNPS',
  permis: 'Permis',
  visiteMedicale: 'Visite méd.',
};

function AlerteItem({ alerte, onNavigate }) {
  const feu = alerte.feu;
  return (
    <Box
      onClick={() => onNavigate(alerte.href)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1.5,
        borderLeft: `4px solid ${feu.color}`, bgcolor: feu.bg, borderRadius: 1, mb: 0.8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { boxShadow: `0 4px 12px ${feu.color}30`, transform: 'translateX(2px)', bgcolor: feu.bg },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', bgcolor: feu.color, color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
        {TYPE_ICONS[alerte.type] || <WarningAmberIcon fontSize='small' />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.78rem', color: '#1a2a3a' }}>
          {alerte.employe} — {alerte.detail}
        </Typography>
        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a' }}>
          {TYPE_LABELS[alerte.type]} · {alerte.jours < 0 ? 'Expiré depuis ' + Math.abs(alerte.jours) + 'j' : 'Échéance: ' + formatDate(alerte.date)}
        </Typography>
      </Box>
      <Chip
        label={alerte.jours < 0 ? 'EXPIRÉ' : alerte.jours + 'j'}
        size='small'
        sx={{
          bgcolor: feu.color, color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20,
        }}
      />
      <Tooltip title='Voir le détail'>
        <IconButton
          size='small'
          onClick={(e) => { e.stopPropagation(); onNavigate(alerte.href); }}
          sx={{ color: feu.color, '&:hover': { bgcolor: `${feu.color}20` } }}
        >
          <ArrowForwardIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function AlertesCritiques({ data }) {
  const navigate = useNavigate();
  const alertes = useMemo(() => detecterEcheancesCritiques(data), [data]);
  const synthese = useMemo(() => genererTexteSynthese(alertes), [alertes]);

  const critiques = alertes.filter(a => a.feu === FEUX.rouge);
  const attentions = alertes.filter(a => a.feu === FEUX.jaune);

  // Navigation vers le module concerné (ex: /domaine2_Gestion_Administrative_Personnel/contrats)
  const handleNavigate = (href) => navigate(href);

  return (
    <Card
      sx={{
        mb: 2.5,
        border: `2px solid ${synthese.feu.color}`,
        borderLeft: `6px solid ${synthese.feu.color}`,
        bgcolor: synthese.feu.bg,
        boxShadow: alertes.length > 0 ? `0 4px 16px ${synthese.feu.color}30` : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <CardContent sx={{ py: 1.8, '&:last-child': { pb: 1.8 } }}>
        {/* En-tête : texte synthétique */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems='center' justifyContent='space-between'>
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ flex: 1 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%', bgcolor: synthese.feu.color, color: '#fff', flexShrink: 0,
            }}>
              {synthese.feu === FEUX.vert ? <CheckCircleIcon /> : <WarningAmberIcon />}
            </Box>
            <Box>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.88rem', color: '#1a2a3a' }}>
                {synthese.feu === FEUX.vert ? 'Système conforme' : synthese.feu === FEUX.rouge ? 'Alertes critiques détectées' : 'Échéances à surveiller'}
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.74rem', color: '#4a5a6a' }}>
                {synthese.texte}
              </Typography>
            </Box>
          </Stack>

          {alertes.length > 0 && (
            <Stack direction='row' spacing={1}>
              {critiques.length > 0 && (
                <Chip
                  icon={<ErrorIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${critiques.length} critique(s)`}
                  size='small'
                  sx={{ bgcolor: FEUX.rouge.color, color: '#fff', fontWeight: 700, fontSize: '0.68rem' }}
                />
              )}
              {attentions.length > 0 && (
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${attentions.length} à surveiller`}
                  size='small'
                  sx={{ bgcolor: FEUX.jaune.color, color: '#fff', fontWeight: 700, fontSize: '0.68rem' }}
                />
              )}
            </Stack>
          )}
        </Stack>

        {/* Liste des alertes (si critiques) */}
        {alertes.length > 0 && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(0,0,0,0.08)' }} />
            <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#b0c4de', borderRadius: 3 } }}>
              {alertes.map((a, i) => <AlerteItem key={i} alerte={a} onNavigate={handleNavigate} />)}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
