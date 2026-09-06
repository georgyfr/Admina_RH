// ============================================================
// NavigationIntelligente.jsx — Boutons hyperliens contextuels
// 5 boutons "Aller à" qui naviguent vers les modules avec filtre employé
// Équivalent Excel : =HYPERLINK("#"&CELLULE("adresse"; ...); "Voir ...")
// + =NB.SI pour vérifier existence dans l'onglet cible
// ============================================================
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Button, Chip, Tooltip, Divider, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  EMPLOYEES, CONTRATS, DOCUMENTS, CONGES, ABSENCES, AVENANTS,
  FICHES_PAIE, SANCTIONS, VISITES_MEDICALES, PRETS, DEPARTS, findEmployee,
} from './data';
import {
  GRILLES_EVALUATION, SUIVI_POST_EMBAUCHE_DETAIL,
} from './dataD1';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ROUGE = '#b33a4a';
const ORANGE = '#b86a2a';

const D2_BASE = '/domaine2_Gestion_Administrative_Personnel';

// --- Vérifie si l'employé a des données dans un onglet (NB.SI) ---
function hasData(employeeId, arr) {
  return arr.filter(item => item.employee_id === employeeId).length;
}

export default function NavigationIntelligente({ employeeId }) {
  const navigate = useNavigate();
  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);

  // Compteurs NB.SI pour chaque onglet cible
  const counts = useMemo(() => ({
    contrats: hasData(employeeId, CONTRATS),
    avenants: hasData(employeeId, AVENANTS),
    documents: hasData(employeeId, DOCUMENTS),
    conges: hasData(employeeId, CONGES),
    absences: hasData(employeeId, ABSENCES),
    paie: hasData(employeeId, FICHES_PAIE),
    sanctions: hasData(employeeId, SANCTIONS),
    visites: hasData(employeeId, VISITES_MEDICALES),
    prets: hasData(employeeId, PRETS),
    departs: hasData(employeeId, DEPARTS),
    grille: GRILLES_EVALUATION[employeeId] ? 1 : 0,
    suiviPost: SUIVI_POST_EMBAUCHE_DETAIL[employeeId] ? 1 : 0,
  }), [employeeId]);

  // 5 boutons de navigation principale
  const buttons = [
    {
      label: 'Voir les Contrats',
      icon: <DescriptionIcon />,
      color: VIOLET,
      href: `${D2_BASE}/contrats`,
      count: counts.contrats,
      sublabel: `${counts.avenants} avenant(s)`,
      tooltip: `Onglet Contrats · ${counts.contrats} contrat(s) · ${counts.avenants} avenant(s)`,
    },
    {
      label: 'Voir les Congés',
      icon: <CalendarMonthIcon />,
      color: '#2a6a9a',
      href: `${D2_BASE}/conges`,
      count: counts.conges,
      sublabel: `${counts.absences} absence(s)`,
      tooltip: `Onglet Congés · ${counts.conges} demande(s) · ${counts.absences} absence(s) maladie`,
    },
    {
      label: 'Voir les Documents',
      icon: <SearchIcon />,
      color: ORANGE,
      href: `${D2_BASE}/documents`,
      count: counts.documents,
      sublabel: `${counts.documents} document(s)`,
      tooltip: `Onglet Suivi Documents · ${counts.documents} document(s)`,
    },
    {
      label: 'Voir la Paie',
      icon: <AssessmentIcon />,
      color: VERT,
      href: `${D2_BASE}/paie`,
      count: counts.paie,
      sublabel: `${counts.prets} prêt(s)`,
      tooltip: `Onglet Fiches de Paie · ${counts.paie} fiche(s) · ${counts.prets} prêt(s)`,
    },
    {
      label: 'Voir Suivi D1',
      icon: <BuildIcon />,
      color: NAVY,
      href: `${D2_BASE}`,
      count: counts.grille + counts.suiviPost,
      sublabel: `${counts.grille} éval. · ${counts.suiviPost} suivi`,
      tooltip: `Domaine 1 · ${counts.grille} grille(s) éval. · ${counts.suiviPost} suivi post-embauche`,
    },
  ];

  // Liens secondaires (modules supplémentaires)
  const secondaryLinks = [
    { label: 'Sanctions', href: `${D2_BASE}/sanctions`, count: counts.sanctions, color: ROUGE },
    { label: 'Visites méd.', href: `${D2_BASE}/visites-medicales`, count: counts.visites, color: '#2a6a9a' },
    { label: 'Prêts', href: `${D2_BASE}/prets`, count: counts.prets, color: ORANGE },
    { label: 'Départs', href: `${D2_BASE}/departs`, count: counts.departs, color: '#6b7a8a' },
    { label: 'Avenants', href: `${D2_BASE}/avenants`, count: counts.avenants, color: VIOLET },
    { label: 'Bancaires', href: `${D2_BASE}/bancaires`, count: hasData(employeeId, []), color: NAVY },
    { label: 'Mutuelle', href: `${D2_BASE}/mutuelle`, count: 0, color: VERT },
    { label: 'Permis', href: `${D2_BASE}/permis`, count: 0, color: ORANGE },
    { label: 'Pointage', href: `${D2_BASE}/pointage`, count: 0, color: '#2a6a9a' },
    { label: 'Planning', href: `${D2_BASE}/planning`, count: 0, color: VIOLET },
    { label: 'Déclarations', href: `${D2_BASE}/declarations`, count: 0, color: ROUGE },
    { label: 'Rappels', href: `${D2_BASE}/rappels`, count: 0, color: ORANGE },
  ];

  const handleNavigate = (href, count) => {
    if (count === 0) return; // Ne pas naviguer si aucune donnée
    navigate(href);
  };

  return (
    <Card sx={{ mt: 2.5, border: `2px solid ${VIOLET}`, borderLeft: `6px solid ${VIOLET}`, borderRadius: '16px', boxShadow: `0 2px 12px ${VIOLET}15` }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {/* En-tête */}
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowForwardIcon fontSize='small' />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
              Navigation Intelligente
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.7rem' }}>
              Hyperliens contextuels vers les feuilles sources · Filtre automatique sur {emp ? `${emp.prenom} ${emp.nom}` : 'l\'employé'}
            </Typography>
          </Box>
        </Stack>

        {/* 5 boutons principaux */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {buttons.map((btn, i) => {
            const hasDataFlag = btn.count > 0;
            return (
              <Grid item xs={12} sm={6} md={2.4} key={i}>
                <Button
                  fullWidth
                  variant={hasDataFlag ? 'contained' : 'outlined'}
                  onClick={() => handleNavigate(btn.href, btn.count)}
                  disabled={!hasDataFlag}
                  startIcon={btn.icon}
                  sx={{
                    py: 1.2, borderRadius: 2, textTransform: 'none',
                    bgcolor: hasDataFlag ? btn.color : 'transparent',
                    color: hasDataFlag ? '#fff' : '#bbb',
                    borderColor: '#ddd',
                    fontSize: '0.72rem', fontWeight: 600,
                    '&:hover': hasDataFlag ? { bgcolor: btn.color, filter: 'brightness(1.1)', transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${btn.color}40` } : {},
                    transition: 'all 0.15s',
                    flexDirection: 'column', gap: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {btn.icon}
                    {btn.label}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.6rem', opacity: 0.85 }}>
                    {hasDataFlag ? (
                      <>
                        <CheckCircleIcon sx={{ fontSize: 12 }} />
                        {btn.sublabel}
                      </>
                    ) : (
                      <>
                        <CancelIcon sx={{ fontSize: 12 }} />
                        Aucune donnée
                      </>
                    )}
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Liens secondaires (grille compacte) */}
        <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.68rem', color: NAVY, mb: 1, display: 'block' }}>
          Accès rapide aux autres modules
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          {secondaryLinks.map((link, i) => {
            const hasDataFlag = link.count > 0;
            return (
              <Tooltip key={i} title={hasDataFlag ? `${link.count} enregistrement(s)` : 'Aucune donnée pour cet employé'}>
                <Chip
                  label={`${link.label}${hasDataFlag ? ` (${link.count})` : ''}`}
                  size='small'
                  onClick={() => handleNavigate(link.href, link.count)}
                  disabled={!hasDataFlag}
                  sx={{
                    cursor: hasDataFlag ? 'pointer' : 'default',
                    bgcolor: hasDataFlag ? `${link.color}15` : '#f5f5f5',
                    color: hasDataFlag ? link.color : '#bbb',
                    border: `1px solid ${hasDataFlag ? `${link.color}40` : '#e0e0e0'}`,
                    fontWeight: 600, fontSize: '0.68rem',
                    '&:hover': hasDataFlag ? { bgcolor: `${link.color}25`, transform: 'translateY(-1px)' } : {},
                    transition: 'all 0.15s',
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        {/* Note bas de zone */}
        <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', display: 'block', mt: 1.5, textAlign: 'center' }}>
          Les boutons grisés indiquent qu'aucune donnée n'existe pour cet employé dans le module concerné (vérification NB.SI).
          Les boutons actifs naviguent directement vers le module avec le contexte de l'employé.
        </Typography>
      </CardContent>
    </Card>
  );
}
