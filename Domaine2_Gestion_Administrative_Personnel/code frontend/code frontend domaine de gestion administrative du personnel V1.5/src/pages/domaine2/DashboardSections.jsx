// ============================================================
// Domaine 2 — DashboardSections.jsx
// 6 sections du Tableau de Bord D2 (post réécriture Task 6)
//   1. Vue d'Ensemble Stratégique
//   2. Données & Contrats
//   3. Présence & Congés
//   4. Finances & Conformité
//   5. Pilotage & Qualité
//   6. Rapports
// Style : marine #0b2a4a→#1a4a7a, accent doré #f9c74f
// ============================================================
import { useMemo, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Avatar, Button,
  TextField, InputAdornment, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Tooltip, Popover,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AlarmIcon from '@mui/icons-material/Alarm';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  EMPLOYEES, CONTRATS, CONGES, DOCUMENTS, RAPPELS, HEURES_SUPP, DECLARATIONS,
  SANCTIONS, PRETS, DEPARTS, AVENANTS, PERMIS, FICHES_PAIE,
  POINTAGE, PLANNING_MENSUEL, ABSENCES, MUTUELLES, BANCAIRES, SOLDES_CONGES,
  VISITES_MEDICALES,
  findEmployee, employeeFullName, formatFCFA, formatNumber, formatDate,
  joursRestants, calculerAnciennete, LABELS, NOMENCLATURES,
} from './data';
import { evaluerFeu, calculerTendance, FEUX, detecterEcheancesCritiques, genererTexteSynthese } from './seuils';
import DrillDownDetail from './DrillDownDetail';
import AnalysePrevisionnelle from './AnalysePrevisionnelle';
import Sparkline from './Sparkline';
import TCDCharts from './TCDCharts';

// ------------------------------------------------------------
// Palette — Marine + doré + statuts ISO
// ------------------------------------------------------------
export const CHART_COLORS = ['#0b2a4a', '#1a4a7a', '#f9c74f', '#2a7a4a', '#b86a2a', '#b33a4a', '#5a4a8a', '#8aa9d6'];
export const NAVY = '#0b2a4a';
export const NAVY_LIGHT = '#1a4a7a';
export const GOLD = '#f9c74f';
export const STATUS_COLORS = {
  success: '#1a7a4a',
  warning: '#b86a2a',
  error: '#b33a4a',
  info: '#2a6a9a',
  neutral: '#6b7a8a',
};

// ------------------------------------------------------------
// Hook : scope les données selon le rôle simulé + filtres utilisateur
//   DRH      -> toutes les données
//   Manager  -> 7 premiers employés (vue équipe)
//   Employé  -> emp-001 uniquement (vue personnelle)
//   filters  -> { departements, typesContrat, statuts, dateFrom, dateTo }
//   Équivalent Slicers Excel : SOUS.TOTAL(103;…) = employees.length après filtrage
// ------------------------------------------------------------
export function useScopedData(role, filters) {
  return useMemo(() => {
    let scopedIds = null;
    if (role === 'Manager') scopedIds = new Set(EMPLOYEES.slice(0, 7).map((e) => e.id));
    else if (role === 'Employé') scopedIds = new Set(['emp-001']);

    // 1. Scope par rôle
    let employees = scopedIds === null ? EMPLOYEES : EMPLOYEES.filter((e) => scopedIds.has(e.id));

    // 2. Appliquer filtres utilisateur (Slicers + Timeline)
    //    Filtre Département
    if (filters && filters.departements && filters.departements.length > 0) {
      employees = employees.filter((e) => filters.departements.includes(e.departement));
    }
    //    Filtre Type Contrat
    if (filters && filters.typesContrat && filters.typesContrat.length > 0) {
      employees = employees.filter((e) => filters.typesContrat.includes(e.type_contrat));
    }
    //    Filtre Statut
    if (filters && filters.statuts && filters.statuts.length > 0) {
      employees = employees.filter((e) => filters.statuts.includes(e.statut));
    }
    //    Timeline Date Embauche (du / au)
    if (filters && filters.dateFrom) {
      employees = employees.filter((e) => e.date_embauche >= filters.dateFrom);
    }
    if (filters && filters.dateTo) {
      employees = employees.filter((e) => e.date_embauche <= filters.dateTo);
    }

    // 3. Construire l'ensemble des employee_ids filtrés pour les tables satellites
    const filteredIds = new Set(employees.map((e) => e.id));
    const filt = (arr) => arr.filter((it) => filteredIds.has(it.employee_id));

    const contrats = filt(CONTRATS);
    const conges = filt(CONGES);
    const documents = filt(DOCUMENTS);
    const rappels = filt(RAPPELS);
    const heuresSupp = filt(HEURES_SUPP);
    const fichesPaie = filt(FICHES_PAIE);
    const pointage = filt(POINTAGE);
    const planning = filt(PLANNING_MENSUEL);
    const absences = filt(ABSENCES);
    const mutuelles = filt(MUTUELLES);
    const bancaires = filt(BANCAIRES);
    const prets = filt(PRETS);
    const sanctions = filt(SANCTIONS);
    const visites = filt(VISITES_MEDICALES);
    const departs = filt(DEPARTS);
    const avenants = filt(AVENANTS);
    const permis = filt(PERMIS);
    const soldesConges = filt(SOLDES_CONGES);
    const declarations = DECLARATIONS; // périmètre global

    // 4. Recalculer les KPIs depuis les données filtrées (équivalent SOUS.TOTAL)
    const k = {
      effectifTotal: employees.length,
      employesActifs: employees.filter((e) => e.statut === 'Actif').length,
      cadres: employees.filter((e) => e.categorie === 'Cadre').length,
      cdi: employees.filter((e) => e.type_contrat === 'CDI').length,
      cddInterim: contrats.filter((c) => c.type_contrat === 'CDD' || c.type_contrat === 'Interim').length,
      contratsEnVigueur: contrats.filter((c) => c.statut === 'En vigueur').length,
      contratsEchus: contrats.filter((c) => c.statut === 'Echu').length,
      contratsResilies: contrats.filter((c) => c.statut === 'Resilie').length,
      documentsValides: documents.filter((d) => d.statut === 'Valide').length,
      documentsARenouveler: documents.filter((d) => d.statut === 'A renouveler' || d.statut === 'Expire').length,
      permisValides: permis.filter((p) => p.statut === 'Valide').length,
      rappelsEnRetard: rappels.filter((r) => r.statut === 'en_retard').length,
      tauxPresenceMoyen: pointage.length ? Math.round(pointage.reduce((s, p) => s + p.taux_presence, 0) / pointage.length) : 0,
      masseSalarialeBrute: employees.filter((e) => e.statut === 'Actif').reduce((s, e) => s + e.salaire_brut, 0),
      totalNetPaye: fichesPaie.reduce((s, f) => s + f.net_a_payer, 0),
      totalCotisations: fichesPaie.reduce((s, f) => s + f.cotisations, 0),
      avenantsEnAttente: avenants.filter((a) => a.statut === 'En attente').length,
      congesEnAttente: conges.filter((c) => c.statut === 'en_attente').length,
      congesApprouves: conges.filter((c) => c.statut === 'approuvee').length,
      congesRejetes: conges.filter((c) => c.statut === 'rejetee').length,
      totalRetardsMin: planning.reduce((s, p) => s + p.retards_minutes, 0),
      heuresSuppMensuelles: planning.reduce((s, p) => s + p.heures_supp, 0),
      heuresSuppTotales: heuresSupp.reduce((s, h) => s + h.heures_supp, 0),
      totalAvances: prets.filter((p) => p.statut === 'en_remboursement').reduce((s, p) => s + p.montant_accorde, 0),
      sanctionsAnnee: sanctions.length,
      dossiersDepartsClos: departs.filter((d) => d.statut_dossier === 'clos').length,
      dossiersDepartsEnCours: departs.filter((d) => d.statut_dossier !== 'clos').length,
      indemnitesDeparts: departs.reduce((s, d) => s + d.indemnite, 0),
      declarationsEnRetard: declarations.filter((d) => d.statut === 'en_retard').length,
      tauxActifs: employees.length ? Math.round((employees.filter((e) => e.statut === 'Actif').length / employees.length) * 100) : 0,
    };

    return {
      k, employees, contrats, conges, documents, rappels, heuresSupp,
      fichesPaie, pointage, planning, absences, mutuelles, bancaires,
      prets, sanctions, visites, departs, declarations, avenants, permis,
      soldesConges,
    };
  }, [role, filters]);
}

// ------------------------------------------------------------
// Carte panneau (card-panel du design de référence)
// ------------------------------------------------------------
export function PageCard({ title, badge, badgeColor = 'info', icon, children, sx, action }) {
  const badgeBg = {
    info: '#eef3f9', success: '#e6f4ed', warning: '#fef1e6', error: '#fde8eb', neutral: '#eef0f3',
  };
  const badgeFg = {
    info: '#3a5a7a', success: '#1a7a4a', warning: '#b86a2a', error: '#b33a4a', neutral: '#5a6a7a',
  };
  return (
    <Card sx={{ borderRadius: '18px', border: '1px solid #eaedf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }, height: '100%', ...sx }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
            )}
            <Typography variant='subtitle2' fontWeight={600} sx={{ color: '#1a2a3a', fontSize: '0.95rem' }}>{title}</Typography>
          </Box>
          <Stack direction='row' spacing={1} alignItems='center'>
            {badge && (
              <Chip label={badge} size='small' sx={{ bgcolor: badgeBg[badgeColor], color: badgeFg[badgeColor], fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
            )}
            {action}
          </Stack>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// KPI card moderne (border-left accent + icône + trend + feu tricolore)
// Nouveau : feu tricolore (🟢/🟡/🔴) selon seuils paramétrables
// Nouveau : flèche de tendance CLIQUABLE (ouvre popover détail)
// ------------------------------------------------------------
export function ModernKPI({ label, value, icon, accent = 'primary', trend, trendLabel, subtitle, feu, trendArrow, onClick, selected, sparkData, sparkColor }) {
  const [trendAnchor, setTrendAnchor] = useState(null);
  const accentMap = {
    primary: NAVY, success: '#1a7a4a', warning: '#b86a2a', error: '#b33a4a', info: '#2a6a9a', neutral: '#6b7a8a',
  };
  const accentBg = {
    primary: 'rgba(11,42,74,0.08)', success: 'rgba(26,122,74,0.10)', warning: 'rgba(184,106,42,0.10)',
    error: 'rgba(179,58,74,0.10)', info: 'rgba(42,106,154,0.10)', neutral: 'rgba(107,122,138,0.10)',
  };
  const c = accentMap[accent] || NAVY;
  const bg = accentBg[accent] || accentBg.primary;

  // Feu tricolore (prioritaire sur accent si fourni)
  const feuColor = feu ? feu.color : c;
  const feuBg = feu ? feu.bg : bg;
  const feuIcon = feu ? feu.icon : null;
  const feuLabel = feu ? feu.label : null;

  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUpIcon : trend < 0 ? TrendingDownIcon : TrendingFlatIcon;
  const trendColor = trend === undefined ? '' : trend > 0 ? '#1a7a4a' : trend < 0 ? '#b33a4a' : '#6b7a8a';
  const trendBg = trend === undefined ? '' : trend > 0 ? '#e6f4ed' : trend < 0 ? '#fde8eb' : '#eef0f3';

  const hasTrend = TrendIcon || trendArrow;
  const trendText = trendArrow ? trendArrow.texte : (trend !== undefined ? (trend > 0 ? '+' : '') + trend + '%' : '');

  // Détail de la tendance pour le popover
  const trendDetail = trendArrow ? {
    actuel: trendArrow.delta,
    precedent: '-',
    delta: trendArrow.texte,
    interpretation: trendArrow.up === true ? 'En amélioration vs mois précédent' : trendArrow.up === false ? 'En baisse vs mois précédent' : 'Stable vs mois précédent',
    fleche: trendArrow.fleche,
  } : (trend !== undefined ? {
    actuel: value,
    precedent: '-',
    delta: (trend > 0 ? '+' : '') + trend + '%',
    interpretation: trend > 0 ? 'En hausse vs mois précédent' : trend < 0 ? 'En baisse vs mois précédent' : 'Stable vs mois précédent',
    fleche: trend > 0 ? '▲' : trend < 0 ? '▼' : '→',
  } : null);

  return (
    <Card
      onClick={() => onClick && onClick()}
      sx={{
        borderRadius: '16px',
        border: selected ? `2px solid ${feuColor}` : '1px solid #eaedf2',
        borderLeft: `4px solid ${feuColor}`,
        boxShadow: selected ? `0 0 0 3px ${feuColor}30, 0 4px 16px ${feuColor}25` : (feu ? `0 2px 8px ${feuColor}25` : '0 2px 8px rgba(0,0,0,0.04)'),
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${feuColor}30` } : {},
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Badge feu tricolore en haut à droite */}
      {feu && (
        <Tooltip title={feuLabel ? `${feuLabel} — seuil: ${feuIcon}` : feuIcon}>
          <Box sx={{
            position: 'absolute', top: 8, right: 8,
            width: 14, height: 14, borderRadius: '50%',
            bgcolor: feuColor, border: '2px solid #fff',
            boxShadow: `0 0 0 1px ${feuColor}40`,
          }} />
        </Tooltip>
      )}
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500, fontSize: '0.66rem', display: 'block', lineHeight: 1.2 }}>{label}</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#0b2a4a', mt: 0.5, lineHeight: 1.1, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>{value}</Typography>
            {subtitle && <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.66rem', display: 'block', mt: 0.3 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: feuBg, color: feuColor, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1, flexShrink: 0 }}>{icon}</Box>
        </Box>

        {/* Flèche de tendance CLIQUABLE (ouvre popover détail) */}
        {hasTrend && (
          <>
            <Box
              onClick={(e) => { e.stopPropagation(); setTrendAnchor(e.currentTarget); }}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1, px: 1, py: 0.3, borderRadius: 30,
                bgcolor: trendArrow ? trendArrow.bg : trendBg,
                color: trendArrow ? trendArrow.color : trendColor,
                fontSize: '0.7rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
                userSelect: 'none',
              }}
            >
              {trendArrow ? (
                <span style={{ fontSize: '0.78rem', lineHeight: 1 }}>{trendArrow.fleche}</span>
              ) : TrendIcon ? (
                <TrendIcon sx={{ fontSize: 14 }} />
              ) : null}
              <span>{trendText}</span>
              {trendLabel && <span style={{ color: '#6b7a8a', fontWeight: 400, marginLeft: 4 }}>{trendLabel}</span>}
              <ExpandMoreIcon sx={{ fontSize: 12, opacity: 0.6 }} />
            </Box>
            <Popover
              open={Boolean(trendAnchor)}
              anchorEl={trendAnchor}
              onClose={() => setTrendAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              slotProps={{ paper: { sx: { mt: 0.5, p: 2, borderRadius: 2, minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
            >
              <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: '#0b2a4a', mb: 1, display: 'block' }}>
                Détail de la tendance — {label}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {trendDetail && (
                <Stack spacing={0.8}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>Flèche</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.78rem', fontWeight: 700, color: trendColor }}>{trendDetail.fleche} {trendDetail.delta}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>Valeur actuelle</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0b2a4a' }}>{trendDetail.actuel}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>Mois précédent</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7a8a' }}>{trendDetail.precedent}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ p: 1, bgcolor: trendArrow ? trendArrow.bg : trendBg, borderRadius: 1 }}>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', color: trendArrow ? trendArrow.color : trendColor, fontWeight: 600 }}>
                      {trendDetail.interpretation}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Popover>
          </>
        )}

        {/* Sparkline (mini-graphique tendance 6 mois) */}
        {sparkData && sparkData.length >= 2 && (
          <Box sx={{ mt: 1, height: 32, width: '100%' }}>
            <Sparkline data={sparkData} color={sparkColor || accent} type='area' height={32} />
          </Box>
        )}

        {/* Label feu tricolore (texte d'alerte) */}
        {feu && feu !== FEUX.gris && (
          <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontSize: '0.62rem', fontWeight: 600, color: feuColor }}>
            {feuIcon} {feuLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Chart card (wrapper chart avec hauteur responsive)
// ------------------------------------------------------------
export function ChartCard({ title, badge, badgeColor = 'info', icon, height = 260, children, action }) {
  return (
    <PageCard title={title} badge={badge} badgeColor={badgeColor} icon={icon} action={action}>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width='100%' height='100%'>
          {children}
        </ResponsiveContainer>
      </Box>
    </PageCard>
  );
}

// ------------------------------------------------------------
// Légende personnalisée Recharts (vertical, compacte)
// ------------------------------------------------------------
function CompactLegend({ payload }) {
  if (!payload) return null;
  return (
    <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center', mt: 1, gap: 1 }}>
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant='caption' sx={{ color: '#3a4a5a', fontSize: '0.72rem', fontWeight: 500 }}>{entry.value}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

// ============================================================
// SECTION 1 — VUE D'ENSEMBLE STRATÉGIQUE
// ============================================================
export function Section1VueEnsemble({ data }) {
  const { k, employees, documents, permis } = data;
  const [selectedKpi, setSelectedKpi] = useState(null);

  // Données agrégées
  const parDept = useMemo(() => {
    const m = {};
    employees.forEach((e) => { if (e.statut !== 'Inactif') m[e.departement] = (m[e.departement] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [employees]);

  const parContrat = useMemo(() => {
    const m = {};
    employees.forEach((e) => { if (e.statut !== 'Inactif') m[e.type_contrat] = (m[e.type_contrat] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const presenceTrend = [94, 92, 96, 93, 95, 97, 94, 96, 98, 95, 93, 96].map((v, i) => ({ mois: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][i], taux: v }));

  const docStatus = useMemo(() => {
    const counts = { Valide: 0, 'A renouveler': 0, Expire: 0 };
    documents.forEach((d) => { counts[d.statut] = (counts[d.statut] || 0) + 1; });
    permis.forEach((p) => { counts[p.statut] = (counts[p.statut] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [documents, permis]);

  // Historiques mockés 6 mois pour Sparklines (équivalent Plage_Historique)
  const sparkEffectif = [16, 17, 18, 18, 19, k.effectifTotal];
  const sparkActifs = [13, 14, 15, 16, 17, k.employesActifs];
  const sparkContrats = [14, 15, 16, 17, 18, k.contratsEnVigueur];
  const sparkPresence = [85, 87, 86, 88, 90, k.tauxPresenceMoyen];
  const sparkMasseSalariale = [9500, 9800, 10200, 10800, 11200, Math.round(k.masseSalarialeBrute / 1000)];
  const sparkDocumentsValides = [2, 3, 4, 4, 5, k.documentsValides];
  const sparkDocumentsARenouveler = [5, 4, 4, 3, 3, k.documentsARenouveler];
  const sparkRappelsRetard = [4, 3, 3, 2, 2, k.rappelsEnRetard];

  const kpis = [
    { label: 'Effectif Total', value: formatNumber(k.effectifTotal), icon: <PeopleIcon fontSize='small' />, accent: 'primary', trend: 2, subtitle: 'Tous statuts', feu: evaluerFeu('effectifTotal', k.effectifTotal), drillKey: 'effectifTotal', sparkData: sparkEffectif, sparkColor: 'primary' },
    { label: 'Employés Actifs', value: formatNumber(k.employesActifs), icon: <CheckCircleIcon fontSize='small' />, accent: 'success', trend: 1, subtitle: `${k.tauxActifs}% de l'effectif`, feu: evaluerFeu('employesActifs', k.employesActifs), drillKey: 'employesActifs', sparkData: sparkActifs, sparkColor: 'success' },
    { label: 'Cadres', value: formatNumber(k.cadres), icon: <VerifiedIcon fontSize='small' />, accent: 'info', trend: 0, subtitle: 'Catégorie Cadre', feu: evaluerFeu('cadres', k.cadres), drillKey: 'cadres', sparkData: [4, 5, 5, 6, 6, k.cadres], sparkColor: 'info' },
    { label: 'CDI', value: formatNumber(k.cdi), icon: <WorkIcon fontSize='small' />, accent: 'primary', trend: 1, subtitle: 'Contrats à durée indéterminée', feu: evaluerFeu('cdi', k.cdi), drillKey: 'cdi', sparkData: [12, 13, 14, 15, 15, k.cdi], sparkColor: 'primary' },
    { label: 'CDD / Intérim', value: formatNumber(k.cddInterim), icon: <WorkIcon fontSize='small' />, accent: 'warning', trend: -1, subtitle: 'Contrats temporaires', feu: evaluerFeu('cddInterim', k.cddInterim), drillKey: 'cddInterim', sparkData: [4, 4, 3, 3, 3, k.cddInterim], sparkColor: 'warning' },
    { label: 'Contrats en Vigueur', value: formatNumber(k.contratsEnVigueur), icon: <DescriptionIcon fontSize='small' />, accent: 'success', trend: 2, subtitle: `${k.contratsEchus} échus · ${k.contratsResilies} résiliés`, feu: evaluerFeu('contratsEnVigueur', k.contratsEnVigueur), drillKey: 'contratsEnVigueur', sparkData: sparkContrats, sparkColor: 'success' },
    { label: 'Documents Valides', value: formatNumber(k.documentsValides), icon: <CheckCircleIcon fontSize='small' />, accent: 'success', trend: 3, subtitle: 'Conformité administrative', feu: evaluerFeu('documentsValides', k.documentsValides), drillKey: 'documentsValides', sparkData: sparkDocumentsValides, sparkColor: 'success' },
    { label: 'Documents à Renouveler', value: formatNumber(k.documentsARenouveler), icon: <WarningAmberIcon fontSize='small' />, accent: 'error', trend: -2, subtitle: 'Action requise', feu: evaluerFeu('documentsARenouveler', k.documentsARenouveler), drillKey: 'documentsARenouveler', sparkData: sparkDocumentsARenouveler, sparkColor: 'error' },
    { label: 'Taux Présence Moyen', value: `${k.tauxPresenceMoyen}%`, icon: <TrendingUpIcon fontSize='small' />, accent: 'info', subtitle: 'Objectif > 95%', feu: evaluerFeu('tauxPresenceMoyen', k.tauxPresenceMoyen), trendArrow: calculerTendance(k.tauxPresenceMoyen, 87), drillKey: 'tauxPresenceMoyen', sparkData: sparkPresence, sparkColor: 'info' },
    { label: 'Rappels en Retard', value: formatNumber(k.rappelsEnRetard), icon: <AlarmIcon fontSize='small' />, accent: 'error', trend: -3, subtitle: 'Échéances dépassées', feu: evaluerFeu('rappelsEnRetard', k.rappelsEnRetard), drillKey: 'rappelsEnRetard', sparkData: sparkRappelsRetard, sparkColor: 'error' },
    { label: 'Masse Salariale Brute', value: formatNumber(Math.round(k.masseSalarialeBrute / 1000)) + 'k', icon: <PaymentsIcon fontSize='small' />, accent: 'warning', trend: 5, subtitle: 'FCFA / mois', feu: evaluerFeu('masseSalarialeBrute', k.masseSalarialeBrute), sparkData: sparkMasseSalariale, sparkColor: 'warning' },
    { label: 'Total Net Payé', value: formatNumber(Math.round(k.totalNetPaye / 1000)) + 'k', icon: <AccountBalanceWalletIcon fontSize='small' />, accent: 'success', trend: 5, subtitle: 'FCFA cumulés', feu: evaluerFeu('totalNetPaye', k.totalNetPaye), sparkData: [2800, 2900, 3000, 3100, 3300, Math.round(k.totalNetPaye / 1000)], sparkColor: 'success' },
    { label: "Taux d'Actifs", value: `${k.tauxActifs}%`, icon: <VerifiedIcon fontSize='small' />, accent: 'primary', trend: 1, subtitle: 'Effectif opérationnel', feu: evaluerFeu('tauxActifs', k.tauxActifs), sparkData: [80, 82, 84, 85, 86, k.tauxActifs], sparkColor: 'primary' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Vue d'Ensemble Stratégique</Typography>
          <Typography variant='caption' color='text.secondary'>13 indicateurs clés · 4 graphiques · ISO 30401:2018</Typography>
        </Box>
        <Chip label='Pilotage Direction' size='small' sx={{ bgcolor: '#eef3f9', color: '#3a5a7a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      {/* 13 KPI cards — cliquables pour drill-down */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {kpis.map((kpi, i) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={i}>
            <ModernKPI
              {...kpi}
              onClick={kpi.drillKey ? () => setSelectedKpi(selectedKpi === kpi.drillKey ? null : kpi.drillKey) : undefined}
              selected={selectedKpi === kpi.drillKey}
            />
          </Grid>
        ))}
      </Grid>

      {/* TCD dynamiques (barres empilées Effectifs + courbe Présence) — alimentés par Slicers */}
      <TCDCharts data={data} />

      {/* 2 charts complémentaires (PieChart contrat + BarChart doc status) */}
      <Grid container spacing={2.5} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={6}>
          <ChartCard title='Types de Contrat' badge='%' icon={<DescriptionIcon fontSize='small' />} height={280}>
            <PieChart>
              <Pie data={parContrat} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={55} outerRadius={90} paddingAngle={2}>
                {parContrat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Legend content={<CompactLegend />} />
            </PieChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard title='Documents & Permis — État' badge='Suivi' icon={<DescriptionIcon fontSize='small' />} height={280}>
            <BarChart data={docStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#eaedf2' />
              <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Bar dataKey='value' radius={[6, 6, 0, 0]} name='Documents'>
                {docStatus.map((d, i) => {
                  const color = d.name === 'Valide' ? '#1a7a4a' : d.name === 'A renouveler' ? '#b86a2a' : '#b33a4a';
                  return <Cell key={i} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Zone "Détail dynamique" (drill-down) — affiche la liste filtrée selon le KPI sélectionné */}
      <DrillDownDetail data={data} selectedKpi={selectedKpi} setSelectedKpi={setSelectedKpi} />

      {/* Analyse prévisionnelle (Prévision ETS + résumé exécutif + alertes périodes d'essai) */}
      <AnalysePrevisionnelle data={data} />
    </Box>
  );
}

// ============================================================
// SECTION 2 — DONNÉES & CONTRATS
// ============================================================
export function Section2DonneesContrats({ data }) {
  const { employees, contrats, avenants } = data;
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    if (!search.trim()) { setResult(null); return; }
    const q = search.trim().toLowerCase();
    const found = employees.find((e) =>
      e.matricule.toLowerCase() === q ||
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
    setResult(found || 'notfound');
  };

  const contractStatus = useMemo(() => {
    const m = {};
    contrats.forEach((c) => { m[c.statut] = (m[c.statut] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [contrats]);

  const avenantsEnAttente = avenants.filter((a) => a.statut === 'En attente');

  const detailFields = result && result !== 'notfound' ? [
    { label: 'Matricule', value: result.matricule },
    { label: 'Civilité', value: result.civilite },
    { label: 'Nom complet', value: employeeFullName(result) },
    { label: 'Poste', value: result.poste },
    { label: 'Département', value: result.departement },
    { label: 'Catégorie', value: result.categorie },
    { label: 'Type contrat', value: result.type_contrat },
    { label: 'Régime', value: result.regime_travail },
    { label: 'Date embauche', value: formatDate(result.date_embauche) },
    { label: 'Ancienneté', value: calculerAnciennete(result.date_embauche) },
    { label: 'Salaire brut', value: formatFCFA(result.salaire_brut) },
    { label: 'Lieu travail', value: result.lieu_travail },
    { label: 'Statut', value: result.statut },
    { label: 'Email', value: result.email },
    { label: 'Téléphone', value: result.telephone },
    { label: 'Adresse', value: result.adresse },
    { label: 'Date naissance', value: formatDate(result.date_naissance) },
    { label: 'Lieu naissance', value: result.lieu_naissance },
    { label: 'Nationalité', value: result.nationalite },
    { label: 'Situation familiale', value: result.situation_familiale },
  ] : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Données & Contrats</Typography>
          <Typography variant='caption' color='text.secondary'>Recherche employé · statuts contrat · avenants en attente</Typography>
        </Box>
        <Chip label='Maître & Satellites' size='small' sx={{ bgcolor: '#eef3f9', color: '#3a5a7a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      <Grid container spacing={2.5}>
        {/* Recherche employé */}
        <Grid item xs={12} lg={6}>
          <PageCard title='Recherche Employé' badge={<SearchIcon sx={{ fontSize: 12 }} />} badgeColor='info' icon={<PeopleIcon fontSize='small' />} sx={{ height: '100%' }}>
            <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
              <TextField
                size='small' fullWidth placeholder='Nom, prénom ou matricule...'
                value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' sx={{ color: '#6b7a8a' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fafcfe', fontSize: '0.85rem' } }}
              />
              <Button variant='contained' onClick={handleSearch} sx={{ bgcolor: NAVY, borderRadius: '10px', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: NAVY_LIGHT } }}>
                Chercher
              </Button>
            </Stack>

            {result === 'notfound' && (
              <Paper sx={{ p: 2, bgcolor: '#fde8eb', borderRadius: 2, border: '1px solid #f5c5cf' }}>
                <Typography variant='caption' color='error' fontWeight={600}>Aucun employé trouvé pour « {search} ».</Typography>
              </Paper>
            )}

            {result && result !== 'notfound' && (
              <Paper sx={{ p: 2, bgcolor: '#f8faff', borderRadius: 2, border: '1px solid #eaedf2' }}>
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: NAVY, fontWeight: 600, fontSize: '0.9rem' }}>
                    {result.prenom[0]}{result.nom[0]}
                  </Avatar>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={700} sx={{ color: '#0b2a4a' }}>{employeeFullName(result)}</Typography>
                    <Typography variant='caption' color='text.secondary'>{result.matricule} · {result.poste}</Typography>
                  </Box>
                  <Chip
                    label={result.statut} size='small'
                    sx={{
                      ml: 'auto', fontWeight: 600, fontSize: '0.68rem',
                      bgcolor: result.statut === 'Actif' ? '#e6f4ed' : result.statut === 'Essai' ? '#fef1e6' : '#fde8eb',
                      color: result.statut === 'Actif' ? '#1a7a4a' : result.statut === 'Essai' ? '#b86a2a' : '#b33a4a',
                    }}
                  />
                </Stack>
                <Grid container spacing={1.5}>
                  {detailFields.map((f, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Typography variant='caption' sx={{ display: 'block', fontSize: '0.62rem', color: '#6b7a8a', textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 600 }}>{f.label}</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', color: '#1a2a3a', fontWeight: 500 }}>{f.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {!result && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <SearchIcon sx={{ fontSize: 14, color: '#6b7a8a' }} />
                <Typography variant='caption' color='text.secondary'>Saisissez un nom ou un matricule pour afficher la fiche complète.</Typography>
              </Box>
            )}
          </PageCard>
        </Grid>

        {/* Contrats en vigueur */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Contrats en Vigueur' badge='Statut' icon={<DescriptionIcon fontSize='small' />} height={340}>
            <PieChart>
              <Pie data={contractStatus} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={60} outerRadius={100} paddingAngle={2} label={(entry) => `${entry.name}: ${entry.value}`}>
                {contractStatus.map((d, i) => {
                  const color = d.name === 'En vigueur' ? '#1a7a4a' : d.name === 'Echu' ? '#b86a2a' : d.name === 'Resilie' ? '#b33a4a' : CHART_COLORS[i % CHART_COLORS.length];
                  return <Cell key={i} fill={color} />;
                })}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Legend content={<CompactLegend />} />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* Avenants en attente */}
        <Grid item xs={12}>
          <PageCard title='Avenants en Attente' badge={`${avenantsEnAttente.length} en attente`} badgeColor='warning' icon={<DescriptionIcon fontSize='small' />}>
            <TableContainer component={Paper} sx={{ border: '1px solid #eaedf2', borderRadius: 2, overflow: 'hidden' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f6f9fc' }}>
                    {['N° Avenant', 'Employé', 'Type Modification', 'Nouvelle Valeur', 'Date Effet', 'Statut'].map((h) => (
                      <TableCell key={h} sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#3a4a5a', textTransform: 'uppercase', letterSpacing: 0.3, py: 1.2 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avenantsEnAttente.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align='center' sx={{ py: 3, color: '#6b7a8a', fontSize: '0.8rem' }}>Aucun avenant en attente.</TableCell></TableRow>
                  ) : (
                    avenantsEnAttente.map((a) => {
                      const emp = findEmployee(a.employee_id);
                      return (
                        <TableRow key={a.id} hover>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0b2a4a' }}>{a.amendment_number}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{a.type_modification}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{a.nouvelle_valeur}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(a.date_effet)}</TableCell>
                          <TableCell>
                            <Chip label={a.statut} size='small' sx={{ bgcolor: '#fef1e6', color: '#b86a2a', fontSize: '0.65rem', fontWeight: 600 }} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </PageCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================
// SECTION 3 — PRÉSENCE & CONGÉS
// ============================================================
export function Section3PresenceConges({ data }) {
  const { k, employees, conges, soldesConges, heuresSupp } = data;
  const [localConges, setLocalConges] = useState(conges);

  const leaveStatus = [
    { name: 'Approuvés', value: localConges.filter((c) => c.statut === 'approuvee').length, color: '#1a7a4a' },
    { name: 'En attente', value: localConges.filter((c) => c.statut === 'en_attente').length, color: '#b86a2a' },
    { name: 'Refusés', value: localConges.filter((c) => c.statut === 'rejetee').length, color: '#b33a4a' },
    { name: 'Annulés', value: localConges.filter((c) => c.statut === 'annulee').length, color: '#6b7a8a' },
  ].filter((d) => d.value > 0);

  const leaveBalanceByDept = useMemo(() => {
    const m = {};
    employees.forEach((e) => {
      const s = soldesConges.find((x) => x.employee_id === e.id);
      if (!s) return;
      if (!m[e.departement]) m[e.departement] = { total: 0, count: 0 };
      m[e.departement].total += s.solde_disponible;
      m[e.departement].count += 1;
    });
    return Object.entries(m).map(([name, v]) => ({ name, value: Math.round(v.total / v.count) })).sort((a, b) => b.value - a.value);
  }, [employees, soldesConges]);

  const hsParEmploye = useMemo(() => {
    const m = {};
    heuresSupp.forEach((h) => { m[h.employee_id] = (m[h.employee_id] || 0) + h.heures_supp; });
    return Object.entries(m)
      .map(([id, value]) => ({ name: employeeFullName(findEmployee(id)) || id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [heuresSupp]);

  const pendingLeaves = localConges.filter((c) => c.statut === 'en_attente');

  const updateLeaveStatus = (id, newStatus) => {
    setLocalConges((prev) => prev.map((c) => (c.id === id ? { ...c, statut: newStatus } : c)));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Présence & Congés</Typography>
          <Typography variant='caption' color='text.secondary'>Pointage · soldes · heures supplémentaires · approbations</Typography>
        </Box>
        <Chip label='Cycle Mensuel' size='small' sx={{ bgcolor: '#e6f4ed', color: '#1a7a4a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      {/* 2 KPI cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6}>
          <ModernKPI label='Total Retards (min)' value={formatNumber(k.totalRetardsMin) + ' min'} icon={<AlarmIcon fontSize='small' />} accent='warning' trend={-4} subtitle='Cumul planning mensuel' />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ModernKPI label='Heures Supp Mensuelles' value={formatNumber(k.heuresSuppMensuelles) + ' h'} icon={<TrendingUpIcon fontSize='small' />} accent='info' trend={2} subtitle='Cumul planning mensuel' />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Donut statut congés */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Statut des Congés' badge='Demandes' icon={<EventAvailableIcon fontSize='small' />} height={280}>
            <PieChart>
              <Pie data={leaveStatus} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={60} outerRadius={95} paddingAngle={2} label={(entry) => `${entry.name}: ${entry.value}`}>
                {leaveStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Legend content={<CompactLegend />} />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* Solde par département */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Solde Congés Moyen par Département' badge='Jours' icon={<EventAvailableIcon fontSize='small' />} height={280}>
            <BarChart data={leaveBalanceByDept} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#eaedf2' />
              <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#6b7a8a' }} angle={-15} textAnchor='end' height={50} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${v} j`, 'Solde moyen']} />
              <Bar dataKey='value' radius={[6, 6, 0, 0]} fill={NAVY_LIGHT} name='Jours' />
            </BarChart>
          </ChartCard>
        </Grid>

        {/* HS par employé */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Heures Supplémentaires par Employé' badge='Top 5' icon={<TrendingUpIcon fontSize='small' />} height={300}>
            <BarChart data={hsParEmploye} layout='vertical' margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='#eaedf2' />
              <XAxis type='number' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <YAxis type='category' dataKey='name' width={130} tick={{ fontSize: 11, fill: '#3a4a5a' }} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${v} h`, 'Heures supp']} />
              <Bar dataKey='value' radius={[0, 6, 6, 0]} fill={GOLD} name='Heures' />
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Demandes en attente */}
        <Grid item xs={12} lg={6}>
          <PageCard title='Demandes de Congés en Attente' badge={`${pendingLeaves.length} à valider`} badgeColor='warning' icon={<HourglassEmptyIcon fontSize='small' />}>
            <TableContainer sx={{ maxHeight: 280, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#b0c4de', borderRadius: 3 } }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f6f9fc' }}>
                    {['Employé', 'Type', 'Période', 'Jours', 'Action'].map((h) => (
                      <TableCell key={h} sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#3a4a5a', textTransform: 'uppercase', letterSpacing: 0.3, py: 1 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingLeaves.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align='center' sx={{ py: 2, color: '#6b7a8a', fontSize: '0.78rem' }}>Aucune demande en attente.</TableCell></TableRow>
                  ) : (
                    pendingLeaves.map((c) => {
                      const emp = findEmployee(c.employee_id);
                      return (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem' }}>{LABELS.type_conge[c.type_conge] || c.type_conge}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem' }}>{formatDate(c.date_debut)} → {formatDate(c.date_fin)}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{c.nombre_jours} j</TableCell>
                          <TableCell>
                            <Stack direction='row' spacing={0.5}>
                              <Tooltip title='Approuver'>
                                <IconButton size='small' onClick={() => updateLeaveStatus(c.id, 'approuvee')} sx={{ bgcolor: '#e6f4ed', color: '#1a7a4a', '&:hover': { bgcolor: '#1a7a4a', color: '#fff' }, width: 26, height: 26 }}>
                                  <CheckIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Rejeter'>
                                <IconButton size='small' onClick={() => updateLeaveStatus(c.id, 'rejetee')} sx={{ bgcolor: '#fde8eb', color: '#b33a4a', '&:hover': { bgcolor: '#b33a4a', color: '#fff' }, width: 26, height: 26 }}>
                                  <CancelIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </PageCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================
// SECTION 4 — FINANCES & CONFORMITÉ
// ============================================================
export function Section4FinancesConformite({ data }) {
  const { fichesPaie, prets, declarations, sanctions } = data;

  // 3 KPIs paie
  const salaireBrut = fichesPaie.reduce((s, f) => s + f.salaire_brut, 0);
  const cotisations = fichesPaie.reduce((s, f) => s + f.cotisations, 0);
  const netAPayer = fichesPaie.reduce((s, f) => s + f.net_a_payer, 0);

  const payrollData = [
    { name: 'Brut', value: salaireBrut, color: NAVY },
    { name: 'Cotisations', value: cotisations, color: '#b86a2a' },
    { name: 'Net payé', value: netAPayer, color: '#1a7a4a' },
  ];

  const pretsParType = useMemo(() => {
    const m = {};
    prets.filter((p) => p.statut === 'en_remboursement' || p.statut === 'accorde').forEach((p) => {
      const lbl = LABELS.type_pret[p.type_pret] || p.type_pret;
      if (!m[lbl]) m[lbl] = { count: 0, montant: 0 };
      m[lbl].count += 1;
      m[lbl].montant += p.montant_accorde;
    });
    return Object.entries(m).map(([name, v]) => ({ name, count: v.count, montant: v.montant }));
  }, [prets]);

  const declStatus = [
    { name: 'Validées', value: declarations.filter((d) => d.statut === 'validee').length, color: '#1a7a4a' },
    { name: 'Soumises', value: declarations.filter((d) => d.statut === 'soumise').length, color: '#2a6a9a' },
    { name: 'En retard', value: declarations.filter((d) => d.statut === 'en_retard').length, color: '#b33a4a' },
  ].filter((d) => d.value > 0);

  const sanctionsParType = useMemo(() => {
    const m = {};
    sanctions.forEach((s) => { const lbl = LABELS.type_sanction[s.type_sanction] || s.type_sanction; m[lbl] = (m[lbl] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [sanctions]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Finances & Conformité</Typography>
          <Typography variant='caption' color='text.secondary'>Paie · prêts · déclarations sociales · sanctions</Typography>
        </Box>
        <Chip label='Conformité ISO' size='small' sx={{ bgcolor: '#fef1e6', color: '#b86a2a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      {/* 3 KPI cards paie */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <ModernKPI label='Salaire Brut (mois courant)' value={formatNumber(Math.round(salaireBrut / 1000)) + 'k FCFA'} icon={<PaymentsIcon fontSize='small' />} accent='primary' trend={5} subtitle={`${fichesPaie.length} fiches`} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ModernKPI label='Cotisations Sociales' value={formatNumber(Math.round(cotisations / 1000)) + 'k FCFA'} icon={<AccountBalanceWalletIcon fontSize='small' />} accent='warning' trend={4} subtitle='Charges patronales + salariales' />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ModernKPI label='Net à Payer' value={formatNumber(Math.round(netAPayer / 1000)) + 'k FCFA'} icon={<AccountBalanceWalletIcon fontSize='small' />} accent='success' trend={5} subtitle='Versé aux employés' />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Détail masse salariale (waterfall simulé) */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Détail de la Masse Salariale' badge='FCFA' icon={<PaymentsIcon fontSize='small' />} height={300}>
            <BarChart data={payrollData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#eaedf2' />
              <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [formatFCFA(v), 'Montant']} />
              <Bar dataKey='value' radius={[6, 6, 0, 0]} name='Montant'>
                {payrollData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Prêts par type */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Prêts en Cours par Type' badge='Montant total' icon={<AccountBalanceWalletIcon fontSize='small' />} height={300}>
            <BarChart data={pretsParType} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#eaedf2' />
              <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#6b7a8a' }} angle={-10} textAnchor='end' height={50} interval={0} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#6b7a8a' }} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [formatFCFA(v), 'Montant total']} />
              <Bar dataKey='montant' radius={[6, 6, 0, 0]} name='Montant'>
                {pretsParType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Déclarations sociales */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Déclarations Sociales — État' badge='Conformité' badgeColor='warning' icon={<ReceiptLongIcon fontSize='small' />} height={300}>
            <PieChart>
              <Pie data={declStatus} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={60} outerRadius={95} paddingAngle={2} label={(entry) => `${entry.name}: ${entry.value}`}>
                {declStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Legend content={<CompactLegend />} />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* Sanctions */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Sanctions Disciplinaires' badge='Année en cours' badgeColor='error' icon={<GavelIcon fontSize='small' />} height={300}>
            <BarChart data={sanctionsParType} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#eaedf2' />
              <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#6b7a8a' }} angle={-10} textAnchor='end' height={50} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${v} cas`, 'Sanctions']} />
              <Bar dataKey='value' radius={[6, 6, 0, 0]} fill='#b33a4a' name='Cas' />
            </BarChart>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================
// SECTION 5 — PILOTAGE & QUALITÉ
// ============================================================
export function Section5PilotageQualite({ data }) {
  const { rappels, documents, departs } = data;

  const prioritizedAlerts = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    return [...rappels]
      .filter((r) => r.statut !== 'traite')
      .map((r) => {
        const echeance = new Date(r.date_echeance).getTime();
        const jours = Math.ceil((echeance - now) / dayMs);
        let niveau;
        if (jours < 0) niveau = 'error';
        else if (jours <= 7) niveau = 'warning';
        else if (jours <= 30) niveau = 'info';
        else niveau = 'success';
        return { ...r, jours, niveau };
      })
      .sort((a, b) => a.jours - b.jours);
  }, [rappels]);

  const docsARenouveler = useMemo(() => {
    return [...documents]
      .filter((d) => d.statut !== 'Valide')
      .map((d) => {
        const jours = d.date_expiration ? joursRestants(d.date_expiration) : null;
        return { ...d, jours };
      })
      .sort((a, b) => (a.jours ?? 9999) - (b.jours ?? 9999));
  }, [documents]);

  const departsData = [
    { name: 'Clos', value: departs.filter((d) => d.statut_dossier === 'clos').length, color: '#1a7a4a' },
    { name: 'En cours', value: departs.filter((d) => d.statut_dossier !== 'clos').length, color: '#2a6a9a' },
  ].filter((d) => d.value > 0);

  const gaugeRetention = [{ name: 'Rétention', value: 92, fill: '#1a7a4a' }];
  const gaugeDelai = [{ name: 'Délai', value: 85, fill: NAVY_LIGHT }];

  const alerteIcon = (niveau) => {
    if (niveau === 'error') return <NotificationsActiveIcon sx={{ fontSize: 18, color: '#b33a4a' }} />;
    if (niveau === 'warning') return <WarningAmberIcon sx={{ fontSize: 18, color: '#b86a2a' }} />;
    if (niveau === 'info') return <ScheduleIcon sx={{ fontSize: 18, color: '#2a6a9a' }} />;
    return <CheckCircleIcon sx={{ fontSize: 18, color: '#1a7a4a' }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Pilotage & Qualité</Typography>
          <Typography variant='caption' color='text.secondary'>Alertes priorisées · qualité recrutement · dossiers départs</Typography>
        </Box>
        <Chip label='PDCA · ISO 9001' size='small' sx={{ bgcolor: '#eef3f9', color: '#3a5a7a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      <Grid container spacing={2.5}>
        {/* Alertes priorisées */}
        <Grid item xs={12} lg={6}>
          <PageCard title='Rappels Administratifs Prioritaires' badge='Urgence' badgeColor='error' icon={<NotificationsActiveIcon fontSize='small' />} sx={{ height: '100%' }}>
            <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#b0c4de', borderRadius: 3 } }}>
              {prioritizedAlerts.length === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 3 }}>Aucune alerte en cours.</Typography>
              ) : (
                prioritizedAlerts.map((a) => {
                  const emp = findEmployee(a.employee_id);
                  const borderColor = a.niveau === 'error' ? '#b33a4a' : a.niveau === 'warning' ? '#b86a2a' : a.niveau === 'info' ? '#2a6a9a' : '#1a7a4a';
                  const chipBg = a.niveau === 'error' ? '#fde8eb' : a.niveau === 'warning' ? '#fef1e6' : a.niveau === 'info' ? '#eef3f9' : '#e6f4ed';
                  const chipColor = borderColor;
                  const joursLabel = a.jours < 0 ? `${Math.abs(a.jours)}j de retard` : `${a.jours}j restants`;
                  return (
                    <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, mb: 1, borderRadius: 2, bgcolor: '#fafcfe', borderLeft: `4px solid ${borderColor}`, '&:hover': { bgcolor: '#f0f5fc' } }}>
                      <Box sx={{ width: 32, display: 'flex', justifyContent: 'center' }}>{alerteIcon(a.niveau)}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#1a2a3a' }}>{a.description}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                          {emp ? employeeFullName(emp) : '—'} · échéance {formatDate(a.date_echeance)} · {LABELS.type_rappel[a.type_rappel] || a.type_rappel}
                        </Typography>
                      </Box>
                      <Chip label={joursLabel} size='small' sx={{ bgcolor: chipBg, color: chipColor, fontWeight: 700, fontSize: '0.65rem' }} />
                    </Box>
                  );
                })
              )}
            </Box>
          </PageCard>
        </Grid>

        {/* Documents à renouveler */}
        <Grid item xs={12} lg={6}>
          <PageCard title='Documents à Renouveler' badge={`${docsARenouveler.length} docs`} badgeColor='warning' icon={<DescriptionIcon fontSize='small' />} sx={{ height: '100%' }}>
            <TableContainer sx={{ maxHeight: 380, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#b0c4de', borderRadius: 3 } }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f6f9fc' }}>
                    {['Employé', 'Document', 'Expiration', 'Jours', 'Statut'].map((h) => (
                      <TableCell key={h} sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#3a4a5a', textTransform: 'uppercase', letterSpacing: 0.3, py: 1 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docsARenouveler.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align='center' sx={{ py: 2, color: '#6b7a8a', fontSize: '0.78rem' }}>Aucun document à renouveler.</TableCell></TableRow>
                  ) : (
                    docsARenouveler.map((d) => {
                      const emp = findEmployee(d.employee_id);
                      const jourLabel = d.jours === null ? '—' : d.jours < 0 ? 'Expiré' : `${d.jours}j`;
                      const jourColor = d.jours === null ? '#6b7a8a' : d.jours < 0 ? '#b33a4a' : d.jours <= 15 ? '#b33a4a' : d.jours <= 30 ? '#b86a2a' : '#1a7a4a';
                      return (
                        <TableRow key={d.id} hover>
                          <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem' }}>{d.type_document}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem' }}>{formatDate(d.date_expiration)}</TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: jourColor }}>{jourLabel}</TableCell>
                          <TableCell>
                            <Chip label={d.statut} size='small' sx={{
                              bgcolor: d.statut === 'Expire' ? '#fde8eb' : '#fef1e6',
                              color: d.statut === 'Expire' ? '#b33a4a' : '#b86a2a',
                              fontSize: '0.65rem', fontWeight: 600,
                            }} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </PageCard>
        </Grid>

        {/* Dossiers départs pie */}
        <Grid item xs={12} lg={6}>
          <ChartCard title='Dossiers de Départ' badge='Suivi' icon={<LogoutIcon fontSize='small' />} height={300}>
            <PieChart>
              <Pie data={departsData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={55} outerRadius={95} paddingAngle={2} label={(entry) => `${entry.name}: ${entry.value}`}>
                {departsData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} />
              <Legend content={<CompactLegend />} />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* 2 quality gauges */}
        <Grid item xs={12} lg={6}>
          <PageCard title='Indicateurs Qualité Recrutement' badge='Post-embauche' badgeColor='success' icon={<VerifiedIcon fontSize='small' />}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>Taux Rétention 3 mois</Typography>
                  <Box sx={{ width: '100%', height: 180, mt: 1 }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <RadialBarChart cx='50%' cy='50%' innerRadius='65%' outerRadius='100%' data={gaugeRetention} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type='number' domain={[0, 100]} tick={false} />
                        <RadialBar background dataKey='value' cornerRadius={10} />
                        <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Rétention']} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#1a7a4a', mt: -3 }}>92%</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>Objectif ≥ 90%</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#6b7a8a', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>Délai Moyen Complétude Dossier</Typography>
                  <Box sx={{ width: '100%', height: 180, mt: 1 }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <RadialBarChart cx='50%' cy='50%' innerRadius='65%' outerRadius='100%' data={gaugeDelai} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type='number' domain={[0, 100]} tick={false} />
                        <RadialBar background dataKey='value' cornerRadius={10} />
                        <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }} formatter={(v) => [`${(v / 10).toFixed(1)} j`, 'Délai']} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#0b2a4a', mt: -3 }}>8,5 j</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>Objectif ≤ 10 j</Typography>
                </Box>
              </Grid>
            </Grid>
          </PageCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================
// SECTION 6 — RAPPORTS
// ============================================================
export function Section6Rapports({ data, role }) {
  const { employees, conges } = data;
  const [periode, setPeriode] = useState('currentMonth');
  const [dept, setDept] = useState('all');
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const handleGenerate = () => {
    const filteredEmps = dept === 'all' ? employees : employees.filter((e) => e.departement === dept);
    const periodeLabel = {
      lastMonth: 'Mois dernier', currentMonth: 'Mois en cours', currentQuarter: 'Trimestre en cours', custom: 'Période personnalisée',
    }[periode];
    const deptLabel = dept === 'all' ? 'Tous départements' : dept;
    const actifs = filteredEmps.filter((e) => e.statut === 'Actif').length;
    const cadres = filteredEmps.filter((e) => e.categorie === 'Cadre').length;
    const masse = filteredEmps.filter((e) => e.statut === 'Actif').reduce((s, e) => s + e.salaire_brut, 0);
    const cdi = filteredEmps.filter((e) => e.type_contrat === 'CDI').length;
    const congesAtt = conges.filter((c) => filteredEmps.some((e) => e.id === c.employee_id) && c.statut === 'en_attente').length;

    setPreview({
      periode: periodeLabel, dept: deptLabel, effectif: filteredEmps.length, actifs, cadres, cdi, masse, congesAtt,
      genereLe: new Date().toLocaleString('fr-FR'),
    });
  };

  const handleExport = (format) => {
    setToast(`Rapport ${format} généré — ${preview ? preview.periode : 'mois en cours'} / ${preview ? preview.dept : 'Tous départements'}`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#0b2a4a' }}>Rapports</Typography>
          <Typography variant='caption' color='text.secondary'>Générateur de rapports RH · export PDF / Excel</Typography>
        </Box>
        <Chip label='Exports' size='small' sx={{ bgcolor: '#eef3f9', color: '#3a5a7a', fontWeight: 600, fontSize: '0.72rem' }} />
      </Box>

      <Grid container spacing={2.5}>
        {/* Générateur */}
        <Grid item xs={12}>
          <PageCard title='Générer un Rapport' badge='Export' icon={<DescriptionIcon fontSize='small' />}>
            <Grid container spacing={2} alignItems='flex-end'>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='caption' sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem', fontWeight: 600, color: '#3a4a5a' }}>Période</Typography>
                <Box sx={{ '& .MuiSelect-select': { borderRadius: '10px', bgcolor: '#fafcfe', fontSize: '0.82rem', py: 0.9 } }}>
                  <select value={periode} onChange={(e) => setPeriode(e.target.value)} style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: '1px solid #dce1e8', background: '#fafcfe', fontSize: '0.82rem', outline: 'none' }}>
                    <option value='lastMonth'>Mois dernier</option>
                    <option value='currentMonth'>Mois en cours</option>
                    <option value='currentQuarter'>Trimestre en cours</option>
                    <option value='custom'>Personnalisé...</option>
                  </select>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='caption' sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem', fontWeight: 600, color: '#3a4a5a' }}>Département</Typography>
                <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: '1px solid #dce1e8', background: '#fafcfe', fontSize: '0.82rem', outline: 'none' }}>
                  <option value='all'>Tous</option>
                  {NOMENCLATURES.departement.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button variant='contained' onClick={handleGenerate} sx={{ bgcolor: NAVY, borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3, '&:hover': { bgcolor: NAVY_LIGHT } }}>
                    Générer
                  </Button>
                  <Button variant='outlined' onClick={() => handleExport('PDF')} startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#b33a4a', color: '#b33a4a', '&:hover': { bgcolor: '#fde8eb', borderColor: '#b33a4a' } }}>
                    Export PDF
                  </Button>
                  <Button variant='outlined' onClick={() => handleExport('Excel')} startIcon={<GridOnIcon />} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#1a7a4a', color: '#1a7a4a', '&:hover': { bgcolor: '#e6f4ed', borderColor: '#1a7a4a' } }}>
                    Export Excel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </PageCard>
        </Grid>

        {/* Aperçu rapport */}
        <Grid item xs={12}>
          <PageCard title='Aperçu Rapport' badge={role} badgeColor='info' icon={<DescriptionIcon fontSize='small' />}>
            {!preview ? (
              <Box sx={{ bgcolor: '#f8faff', borderRadius: 2, p: 3, border: '1px solid #eaedf2', textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>Sélectionnez les paramètres et cliquez sur « Générer » pour visualiser un aperçu du rapport.</Typography>
              </Box>
            ) : (
              <Box sx={{ bgcolor: '#f8faff', borderRadius: 2, p: 3, border: '1px solid #eaedf2' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant='subtitle2' sx={{ color: '#0b2a4a', fontWeight: 700 }}>Rapport RH — {preview.periode}</Typography>
                    <Typography variant='caption' color='text.secondary'>{preview.dept} · Généré le {preview.genereLe}</Typography>
                  </Box>
                  <Chip label={`Rôle : ${role}`} size='small' sx={{ bgcolor: '#eef3f9', color: '#3a5a7a', fontWeight: 600, fontSize: '0.7rem' }} />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Effectif</Typography>
                    <Typography variant='h6' sx={{ color: '#0b2a4a', fontWeight: 700 }}>{preview.effectif}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Actifs</Typography>
                    <Typography variant='h6' sx={{ color: '#1a7a4a', fontWeight: 700 }}>{preview.actifs}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Cadres</Typography>
                    <Typography variant='h6' sx={{ color: '#0b2a4a', fontWeight: 700 }}>{preview.cadres}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>CDI</Typography>
                    <Typography variant='h6' sx={{ color: '#0b2a4a', fontWeight: 700 }}>{preview.cdi}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Masse Salariale Brute</Typography>
                    <Typography variant='subtitle1' sx={{ color: '#0b2a4a', fontWeight: 700 }}>{formatFCFA(preview.masse)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Congés en attente</Typography>
                    <Typography variant='subtitle1' sx={{ color: '#b86a2a', fontWeight: 700 }}>{preview.congesAtt} demande(s)</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                  Conforme aux normes ISO 30401:2018 (Knowledge Management) et ISO 9001:2015 (Quality Management). Données issues du référentiel employés (Fiche Employé = source unique de vérité).
                </Typography>
              </Box>
            )}
          </PageCard>
        </Grid>
      </Grid>

      {toast && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300, bgcolor: '#1a7a4a', color: '#fff', px: 2.5, py: 1.5, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 18 }} />
          <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.82rem' }}>{toast}</Typography>
        </Box>
      )}
    </Box>
  );
}
