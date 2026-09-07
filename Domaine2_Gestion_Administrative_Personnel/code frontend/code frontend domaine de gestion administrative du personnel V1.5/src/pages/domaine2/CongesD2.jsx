// ============================================================
// CongesD2.jsx — Feuille « 09-Solde Conges » / « 08-Conges Annuels »
// PROMPTS 1-5 — Version complète reconstruite
//
// PROMPT 1 : Structuration base + auto-remplissage Employé (RECHERCHEX)
// PROMPT 2 : KPI + table interactive (8 colonnes, tri, surbrillance)
// PROMPT 3 : Formulaire complet (Autocomplete, chevauchement, solde temps réel)
// PROMPT 4 : 3 graphiques (type, mensuel, statut) + interconnexions
// PROMPT 5 : RACI + audit trail + history + feedback + ISO
//
// Thème TURQUOISE (#0ea5e9) — cohérent avec SuiviPermisD2/SuiviMutuelleD2.
// ============================================================
import { useState, useMemo, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, Tooltip, IconButton, Snackbar, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Checkbox, Autocomplete,
  Popover, LinearProgress, RadioGroup, Radio, FormControlLabel, Rating,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import HistoryIcon from '@mui/icons-material/History';
import HubIcon from '@mui/icons-material/Hub';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import GavelIcon from '@mui/icons-material/Gavel';
import CakeIcon from '@mui/icons-material/Cake';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MedicationIcon from '@mui/icons-material/Medication';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  CONGES, NOMENCLATURES, EMPLOYEES, SOLDES_CONGES, RAPPELS, LABELS,
  findEmployee, employeeFullName, formatDate, formatNumber,
  refreshSoldesConges, genererRappelsRetourConge, getCongesKPIs,
} from './data';
import { StatusBadge, SectionHeader } from './components';

// --- Thème couleur TURQUOISE (cohérent SuiviPermis/Mutuelle) ---
const TURQUOISE = '#0ea5e9';
const TURQUOISE_DARK = '#0284c7';
const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const JAUNE = '#d4a017';
const GRIS = '#6b7a8a';

// --- Constantes de dates ---
const now = new Date();
const CONGES_YEARS = [...new Set(CONGES.map(c => new Date(c.date_debut).getFullYear()))].sort((a, b) => b - a);
const DEFAULT_YEAR = CONGES_YEARS.length > 0 ? String(CONGES_YEARS[0]) : String(now.getFullYear());

const MONTHS = [
  { value: 1, label: 'Janvier', short: 'Jan' },
  { value: 2, label: 'Février', short: 'Fév' },
  { value: 3, label: 'Mars', short: 'Mar' },
  { value: 4, label: 'Avril', short: 'Avr' },
  { value: 5, label: 'Mai', short: 'Mai' },
  { value: 6, label: 'Juin', short: 'Jui' },
  { value: 7, label: 'Juillet', short: 'Jul' },
  { value: 8, label: 'Août', short: 'Aoû' },
  { value: 9, label: 'Septembre', short: 'Sep' },
  { value: 10, label: 'Octobre', short: 'Oct' },
  { value: 11, label: 'Novembre', short: 'Nov' },
  { value: 12, label: 'Décembre', short: 'Déc' },
];

const DEPARTEMENTS = [...new Set(EMPLOYEES.map(e => e.departement).filter(Boolean))].sort();

// --- Couleurs par type de congé (chips + charts) ---
const TYPE_CONGE_COLORS = {
  conge_annuel: { bg: 'rgba(14,165,233,0.10)', color: TURQUOISE, emoji: '🏖️', icon: <BeachAccessIcon sx={{ fontSize: 14 }} /> },
  conge_maladie: { bg: 'rgba(179,58,74,0.10)', color: ROUGE, emoji: '🤒', icon: <MedicationIcon sx={{ fontSize: 14 }} /> },
  conge_maternite: { bg: 'rgba(126,63,242,0.10)', color: VIOLET, emoji: '🤰', icon: <PregnantWomanIcon sx={{ fontSize: 14 }} /> },
  conge_paternite: { bg: 'rgba(42,106,154,0.10)', color: BLEU, emoji: '👶', icon: <FamilyRestroomIcon sx={{ fontSize: 14 }} /> },
  conge_marriage: { bg: 'rgba(212,160,23,0.10)', color: JAUNE, emoji: '💍', icon: <CakeIcon sx={{ fontSize: 14 }} /> },
  conge_deuil: { bg: 'rgba(107,122,138,0.10)', color: GRIS, emoji: '🕯️', icon: <SentimentDissatisfiedIcon sx={{ fontSize: 14 }} /> },
  conge_sans_solde: { bg: 'rgba(184,106,42,0.10)', color: ORANGE, emoji: '⏸️', icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} /> },
  conge_exceptionnel: { bg: 'rgba(11,42,74,0.10)', color: NAVY, emoji: '✨', icon: <EventIcon sx={{ fontSize: 14 }} /> },
};

const STATUT_CONGE_COLORS = {
  en_attente: { bg: 'rgba(212,160,23,0.12)', color: JAUNE, label: 'En attente' },
  approuvee: { bg: 'rgba(42,122,74,0.12)', color: VERT, label: 'Approuvée' },
  rejetee: { bg: 'rgba(179,58,74,0.12)', color: ROUGE, label: 'Rejetée' },
  annulee: { bg: 'rgba(107,122,138,0.12)', color: GRIS, label: 'Annulée' },
};

const getTypeCongeStyle = (type) => TYPE_CONGE_COLORS[type] || { bg: 'rgba(107,122,138,0.10)', color: GRIS, emoji: '📋' };
const getStatutCongeStyle = (statut) => STATUT_CONGE_COLORS[statut] || STATUT_CONGE_COLORS.annulee;

// --- PROMPT 5 : Matrice RACI (4 acteurs) ---
const RACI_ROLES = [
  {
    value: 'drh', label: 'DRH', color: TURQUOISE, emoji: '👔',
    perms: { approuver: true, refuser: true, modifier: true, supprimer: true, creer: true, voirHistorique: true, voirSolde: true },
  },
  {
    value: 'manager', label: 'Manager', color: ORANGE, emoji: '👥',
    perms: { approuver: true, refuser: true, modifier: false, supprimer: false, creer: false, voirHistorique: false, voirSolde: true },
  },
  {
    value: 'assistant_rh', label: 'Assistant RH', color: VIOLET, emoji: '🗂️',
    perms: { approuver: false, refuser: false, modifier: true, supprimer: false, creer: true, voirHistorique: false, voirSolde: true },
  },
  {
    value: 'employe', label: 'Employé', color: GRIS, emoji: '👤',
    perms: { approuver: false, refuser: false, modifier: false, supprimer: false, creer: true, voirHistorique: false, voirSolde: false },
  },
];

// ============================================================
// PROMPT 5 : Audit trail — conformité ISO 30401:2018
// Toute action sur CONGES est journalisée avec timestamp, user,
// old_value, new_value. Visualisable dans le dialog Historique.
// ============================================================
const CONGES_AUDIT_TRAIL = [];

function logAction(action, congeId, employeeId, details = {}, oldValue = null, newValue = null) {
  CONGES_AUDIT_TRAIL.push({
    timestamp: new Date().toISOString(),
    action,
    conge_id: congeId,
    employee_id: employeeId,
    user: window.__congesD2Role || 'drh',
    details,
    old_value: oldValue,
    new_value: newValue,
  });
}

// ============================================================
// Composant KPICard inline — horizontal, borderLeft, hover lift
// ============================================================
function KPICard({ value, label, emoji, color, onClick, subtitle, progress }) {
  return (
    <Tooltip title={subtitle || 'Cliquer pour voir le détail'} placement='top'>
      <Box
        onClick={onClick}
        sx={{
          p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1,
          borderLeft: `4px solid ${color}`,
          boxShadow: `0 2px 8px ${color}14`,
          height: '100%', cursor: 'pointer', transition: 'all 0.2s ease',
          '&:hover': { boxShadow: `0 8px 24px ${color}28`, transform: 'translateY(-3px)' },
        }}
      >
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%', bgcolor: color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1.2rem',
        }}>
          {emoji}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant='h5' fontWeight={800} sx={{ color, fontSize: '1.6rem', lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', fontWeight: 600, lineHeight: 1.2 }}>
            {label}
          </Typography>
          {progress !== undefined && (
            <Box sx={{ mt: 0.5 }}>
              <LinearProgress
                variant='determinate' value={progress} size='small'
                sx={{
                  height: 4, borderRadius: 2,
                  bgcolor: `${color}20`,
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}

// --- Composant flèche de tri dynamique ---
const SortIcon = ({ column, sortConfig }) => {
  const isActive = sortConfig.key === column;
  const isAsc = sortConfig.direction === 'asc';
  if (!isActive) return <ArrowUpwardIcon sx={{ fontSize: 10, color: '#777', opacity: 0.5 }} />;
  return isAsc ? <ArrowUpwardIcon sx={{ fontSize: 11, color: TURQUOISE }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: TURQUOISE }} />;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CongesD2() {
  // --- États principaux ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fMonth, setFMonth] = useState('');           // '' = Tous
  const [fYear, setFYear] = useState(DEFAULT_YEAR);
  const [fDept, setFDept] = useState('');
  const [fType, setFType] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_debut', direction: 'desc' });
  const [snack, setSnack] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Sélection multiple (Prompt 2) ---
  const [selected, setSelected] = useState(new Set());

  // --- Dialogs ---
  const [createDialog, setCreateDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(null);
  const [editDialog, setEditDialog] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [historyDialog, setHistoryDialog] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [kpiDialog, setKpiDialog] = useState(null);
  const [kpiSelected, setKpiSelected] = useState(new Set());

  // --- Popover solde ---
  const [soldeAnchor, setSoldeAnchor] = useState(null);
  const [soldeEmp, setSoldeEmp] = useState(null);

  // --- Formulaire création/édition ---
  const [form, setForm] = useState({ employee_id: '', type_conge: '', date_debut: '', date_fin: '', motif: '', forcer: false, notifier_manager: true, envoyer_copie: false });
  const [submitting, setSubmitting] = useState(false);

  // --- RACI role (Prompt 5) ---
  const [raciRole, setRaciRole] = useState('drh');
  const raci = RACI_ROLES.find(r => r.value === raciRole);

  // --- Feedback ---
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });

  // Expose role for logAction
  if (typeof window !== 'undefined') window.__congesD2Role = raciRole;

  // --- Helpers ---
  const calculerJours = (d1, d2) => {
    if (!d1 || !d2) return 0;
    return Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getSolde = (employeeId) => SOLDES_CONGES.find(s => s.employee_id === employeeId);

  // Détection de chevauchement de congés pour un employé
  const detecterChevauchement = (employeeId, dateDebut, dateFin, excludeId = null) => {
    if (!employeeId || !dateDebut || !dateFin) return [];
    const d1 = new Date(dateDebut);
    const d2 = new Date(dateFin);
    return CONGES.filter(c =>
      c.id !== excludeId &&
      c.employee_id === employeeId &&
      c.statut !== 'rejetee' &&
      c.statut !== 'annulee' &&
      new Date(c.date_debut) <= d2 &&
      new Date(c.date_fin) >= d1
    );
  };

  // ============================================================
  // PROMPT 4 : triggerInterconnexions() — appelé après chaque action
  // Recalcule les soldes (SUMIFS) + génère les rappels retour congé
  // Met à jour Tableau de Bord + Fiche Employé (via le recalcul)
  // ============================================================
  const triggerInterconnexions = () => {
    refreshSoldesConges();
    const nbRappels = genererRappelsRetourConge();
    setRefreshKey(k => k + 1);
    return nbRappels;
  };

  // --- Filtrage multi-critères ---
  const filtered = useMemo(() => {
    let result = CONGES.filter(c => {
      const emp = findEmployee(c.employee_id);
      if (search) {
        const empName = emp ? employeeFullName(emp).toLowerCase() : '';
        const q = search.toLowerCase();
        if (!empName.includes(q) &&
            !c.leave_number?.toLowerCase().includes(q) &&
            !c.motif?.toLowerCase().includes(q) &&
            !emp?.matricule?.toLowerCase().includes(q)) return false;
      }
      if (fMonth) {
        const mDebut = new Date(c.date_debut).getMonth() + 1;
        const mFin = new Date(c.date_fin).getMonth() + 1;
        if (mDebut !== Number(fMonth) && mFin !== Number(fMonth)) return false;
      }
      if (fYear && String(new Date(c.date_debut).getFullYear()) !== String(fYear)) return false;
      if (fDept && emp?.departement !== fDept) return false;
      if (fType && c.type_conge !== fType) return false;
      if (fStatut && c.statut !== fStatut) return false;
      return true;
    });
    // Tri dynamique
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'employee') {
          const eA = findEmployee(a.employee_id);
          const eB = findEmployee(b.employee_id);
          valA = eA ? employeeFullName(eA).toLowerCase() : '';
          valB = eB ? employeeFullName(eB).toLowerCase() : '';
        } else if (sortConfig.key === 'jours') {
          valA = a.nombre_jours;
          valB = b.nombre_jours;
        } else if (sortConfig.key === 'statut') {
          valA = a.statut;
          valB = b.statut;
        } else {
          valA = a[sortConfig.key] || '';
          valB = b[sortConfig.key] || '';
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [search, fMonth, fYear, fDept, fType, fStatut, sortConfig, refreshKey]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- KPI stats ---
  const kpis = useMemo(() => getCongesKPIs(), [refreshKey]);

  const stats = useMemo(() => {
    const enAttente = kpis.enAttente;
    const approuves = kpis.approuves;
    const rejetees = kpis.rejetees;
    const total = kpis.total;
    // Taux d'utilisation moyen (somme pris / somme droits)
    const totalPris = SOLDES_CONGES.reduce((s, x) => s + x.conges_pris_jours, 0);
    const totalDroit = SOLDES_CONGES.reduce((s, x) => s + x.droit_annuel_jours, 0);
    const tauxUtilisation = totalDroit > 0 ? Math.round((totalPris / totalDroit) * 100) : 0;
    // Alertes solde critique (< 5 jours)
    const soldesCritiques = SOLDES_CONGES.filter(s => s.solde_disponible < 5);
    return { enAttente, approuves, rejetees, total, tauxUtilisation, soldesCritiques };
  }, [kpis, refreshKey]);

  // --- Compteur filtres actifs ---
  const activeFilterCount = [search, fMonth, fDept, fType, fStatut].filter(Boolean).length;

  // --- Tri dynamique ---
  const handleSort = (key) => {
    setSortConfig(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  const handleResetFilters = () => {
    setSearch(''); setFMonth(''); setFDept(''); setFType(''); setFStatut(''); setFYear(DEFAULT_YEAR); setPage(0);
    setSnack({ msg: 'Filtres réinitialisés', severity: 'info' });
  };

  // ============================================================
  // PROMPT 4 : Données pour les 3 graphiques (TCD)
  // ============================================================

  // Graphique 1 : Répartition par type de congé (PieChart donut) — cliquable filtre tableau
  const chartTypeData = useMemo(() => {
    const counts = {};
    CONGES.forEach(c => {
      const k = c.type_conge || 'Autre';
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).map(([type_conge, count]) => ({
      name: LABELS.type_conge[type_conge] || type_conge,
      type_conge,
      value: count,
      color: getTypeCongeStyle(type_conge).color,
    }));
  }, [refreshKey]);

  // Graphique 2 : Évolution mensuelle (BarChart) — toggle Jours pris / Demandes
  const [chartMode, setChartMode] = useState('jours'); // 'jours' | 'demandes'
  const chartMensuelData = useMemo(() => {
    const monthsAgg = {};
    for (let m = 1; m <= 12; m++) {
      monthsAgg[m] = { mois: MONTHS[m - 1].short, jours: 0, demandes: 0 };
    }
    CONGES.forEach(c => {
      const m = new Date(c.date_debut).getMonth() + 1;
      if (monthsAgg[m]) {
        monthsAgg[m].jours += c.nombre_jours || 0;
        monthsAgg[m].demandes += 1;
      }
    });
    return Object.values(monthsAgg);
  }, [refreshKey]);

  // Graphique 3 : Statut des demandes (PieChart donut) — cliquable filtre tableau
  const chartStatutData = useMemo(() => {
    const counts = { en_attente: 0, approuvee: 0, rejetee: 0, annulee: 0 };
    CONGES.forEach(c => { counts[c.statut] = (counts[c.statut] || 0) + 1; });
    return [
      { name: 'En attente', value: counts.en_attente, statut: 'en_attente', color: JAUNE },
      { name: 'Approuvée', value: counts.approuvee, statut: 'approuvee', color: VERT },
      { name: 'Rejetée', value: counts.rejetee, statut: 'rejetee', color: ROUGE },
      { name: 'Annulée', value: counts.annulee, statut: 'annulee', color: GRIS },
    ].filter(x => x.value > 0);
  }, [refreshKey]);

  // --- Widget "Prochains retours de congé" — top 5 next date_fin ---
  const prochainsRetours = useMemo(() => {
    const today = new Date();
    return CONGES
      .filter(c => c.statut === 'approuvee' && new Date(c.date_fin) >= today)
      .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
      .slice(0, 5)
      .map(c => {
        const jours = Math.ceil((new Date(c.date_fin) - today) / (1000 * 60 * 60 * 24));
        return { ...c, joursRestants: jours };
      });
  }, [refreshKey]);

  // --- Alertes : demandes en attente > 5 jours ---
  const alerteAttenteLongue = useMemo(() => {
    const today = new Date();
    return CONGES.filter(c => {
      if (c.statut !== 'en_attente') return false;
      const deposee = new Date(c.date_debut);
      const diffJours = Math.ceil((today - deposee) / (1000 * 60 * 60 * 24));
      return diffJours > 5;
    });
  }, [refreshKey]);

  // ============================================================
  // PROMPT 5 : Actions sur les congés — toutes tracées (audit)
  // ============================================================

  const handleApprouver = (c) => {
    if (!raci.perms.approuver) {
      setSnack({ msg: `Permission refusée : ${raci.label} ne peut pas approuver`, severity: 'error' });
      return;
    }
    const idx = CONGES.findIndex(x => x.id === c.id);
    if (idx === -1) return;
    const oldValue = { statut: CONGES[idx].statut };
    CONGES[idx] = {
      ...CONGES[idx],
      statut: 'approuvee',
      date_approbation: new Date().toISOString().slice(0, 10),
      approbateur: 'emp-012', // DRH fictif
    };
    logAction('approuver', c.id, c.employee_id, { type: c.type_conge, jours: c.nombre_jours }, oldValue, { statut: 'approuvee' });
    const nbRappels = triggerInterconnexions();
    setSnack({ msg: `Demande ${c.leave_number} approuvée${nbRappels > 0 ? ` · ${nbRappels} rappel(s) généré(s)` : ''}`, severity: 'success' });
  };

  const handleRefuser = (c) => {
    if (!raci.perms.refuser) {
      setSnack({ msg: `Permission refusée : ${raci.label} ne peut pas refuser`, severity: 'error' });
      return;
    }
    const idx = CONGES.findIndex(x => x.id === c.id);
    if (idx === -1) return;
    const oldValue = { statut: CONGES[idx].statut };
    CONGES[idx] = {
      ...CONGES[idx],
      statut: 'rejetee',
      date_approbation: new Date().toISOString().slice(0, 10),
      approbateur: 'emp-012',
    };
    logAction('refuser', c.id, c.employee_id, { type: c.type_conge }, oldValue, { statut: 'rejetee' });
    triggerInterconnexions();
    setSnack({ msg: `Demande ${c.leave_number} refusée`, severity: 'warning' });
  };

  const handleSupprimer = (c) => {
    if (!raci.perms.supprimer) {
      setSnack({ msg: `Permission refusée : ${raci.label} ne peut pas supprimer`, severity: 'error' });
      return;
    }
    const idx = CONGES.findIndex(x => x.id === c.id);
    if (idx === -1) return;
    const oldValue = { ...CONGES[idx] };
    CONGES.splice(idx, 1);
    logAction('supprimer', c.id, c.employee_id, { leave_number: c.leave_number }, oldValue, null);
    triggerInterconnexions();
    setDeleteDialog(null);
    setSnack({ msg: `Demande ${c.leave_number} supprimée`, severity: 'info' });
  };

  const handleCreate = () => {
    if (!raci.perms.creer) {
      setSnack({ msg: `Permission refusée : ${raci.label} ne peut pas créer`, severity: 'error' });
      return;
    }
    if (!form.employee_id || !form.type_conge || !form.date_debut || !form.date_fin || !form.motif) {
      setSnack({ msg: 'Veuillez remplir tous les champs obligatoires', severity: 'warning' });
      return;
    }
    if (new Date(form.date_fin) < new Date(form.date_debut)) {
      setSnack({ msg: 'La date de fin doit être postérieure à la date de début', severity: 'error' });
      return;
    }
    const chevauchements = detecterChevauchement(form.employee_id, form.date_debut, form.date_fin);
    if (chevauchements.length > 0 && !form.forcer) {
      setSnack({ msg: `Chevauchement détecté avec ${chevauchements.length} demande(s). Cochez "Forcer" pour continuer.`, severity: 'warning' });
      return;
    }
    setSubmitting(true);
    // Simulation d'appel API
    setTimeout(() => {
      const num = `CG-${new Date(form.date_debut).getFullYear()}-${String(CONGES.length + 1).padStart(3, '0')}`;
      const newConge = {
        id: `cng-${Date.now()}`,
        leave_number: num,
        employee_id: form.employee_id,
        type_conge: form.type_conge,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        nombre_jours: calculerJours(form.date_debut, form.date_fin),
        motif: form.motif,
        statut: raciRole === 'employe' ? 'en_attente' : 'en_attente',
        date_approbation: null,
        approbateur: null,
      };
      CONGES.push(newConge);
      logAction('creer', newConge.id, newConge.employee_id, {
        leave_number: num,
        type: newConge.type_conge,
        jours: newConge.nombre_jours,
        notifier_manager: form.notifier_manager,
        envoyer_copie: form.envoyer_copie,
      }, null, { statut: 'en_attente' });
      triggerInterconnexions();
      setSubmitting(false);
      setCreateDialog(false);
      setForm({ employee_id: '', type_conge: '', date_debut: '', date_fin: '', motif: '', forcer: false, notifier_manager: true, envoyer_copie: false });
      setSnack({ msg: `Demande ${num} créée${form.notifier_manager ? ' · Manager notifié' : ''}`, severity: 'success' });
    }, 600);
  };

  const handleSaveEdit = () => {
    if (!raci.perms.modifier) {
      setSnack({ msg: `Permission refusée : ${raci.label} ne peut pas modifier`, severity: 'error' });
      return;
    }
    if (!editDialog) return;
    if (new Date(editDialog.date_fin) < new Date(editDialog.date_debut)) {
      setSnack({ msg: 'La date de fin doit être postérieure à la date de début', severity: 'error' });
      return;
    }
    const idx = CONGES.findIndex(x => x.id === editDialog.id);
    if (idx === -1) return;
    const oldValue = { ...CONGES[idx] };
    const newNbJours = calculerJours(editDialog.date_debut, editDialog.date_fin);
    CONGES[idx] = {
      ...CONGES[idx],
      type_conge: editDialog.type_conge,
      date_debut: editDialog.date_debut,
      date_fin: editDialog.date_fin,
      nombre_jours: newNbJours,
      motif: editDialog.motif,
    };
    logAction('modifier', editDialog.id, editDialog.employee_id, {
      type: editDialog.type_conge,
      jours: newNbJours,
    }, oldValue, CONGES[idx]);
    triggerInterconnexions();
    setEditDialog(null);
    setSnack({ msg: `Demande ${editDialog.leave_number} modifiée`, severity: 'success' });
  };

  // --- Sélection multiple ---
  const handleToggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (pageRows.length > 0 && pageRows.every(r => selected.has(r.id))) {
      setSelected(new Set());
    } else {
      const next = new Set(selected);
      pageRows.forEach(r => next.add(r.id));
      setSelected(next);
    }
  };

  const handleBulkApprouver = () => {
    if (!raci.perms.approuver) {
      setSnack({ msg: 'Permission refusée', severity: 'error' });
      return;
    }
    let count = 0;
    selected.forEach(id => {
      const idx = CONGES.findIndex(x => x.id === id);
      if (idx !== -1 && CONGES[idx].statut === 'en_attente') {
        const oldValue = { statut: CONGES[idx].statut };
        CONGES[idx] = {
          ...CONGES[idx],
          statut: 'approuvee',
          date_approbation: new Date().toISOString().slice(0, 10),
          approbateur: 'emp-012',
        };
        logAction('approuver_bulk', CONGES[idx].id, CONGES[idx].employee_id, {}, oldValue, { statut: 'approuvee' });
        count++;
      }
    });
    if (count > 0) {
      triggerInterconnexions();
      setSelected(new Set());
      setSnack({ msg: `${count} demande(s) approuvée(s)`, severity: 'success' });
    } else {
      setSnack({ msg: 'Aucune demande en attente dans la sélection', severity: 'info' });
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['N°', 'Matricule', 'Employé', 'Département', 'Type', 'Du', 'Au', 'Jours', 'Motif', 'Statut', 'Approbateur'];
    const rows = filtered.map(c => {
      const emp = findEmployee(c.employee_id);
      const appr = findEmployee(c.approbateur);
      return [
        `"${c.leave_number}"`,
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${emp?.departement || ''}"`,
        `"${LABELS.type_conge[c.type_conge] || c.type_conge}"`,
        `"${c.date_debut}"`,
        `"${c.date_fin}"`,
        c.nombre_jours,
        `"${(c.motif || '').replace(/"/g, '""')}"`,
        `"${LABELS.statut_conge[c.statut] || c.statut}"`,
        `"${appr ? employeeFullName(appr) : ''}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conges-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${filtered.length} congé(s) exporté(s) en CSV`, severity: 'success' });
  };

  // --- KPI Dialog handlers ---
  const handleOpenKpi = (type) => {
    setKpiSelected(new Set());
    setKpiDialog(type);
  };

  const handleToggleKpiSelect = (id) => {
    setKpiSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAllKpi = () => {
    if (!kpiData) return;
    if (kpiSelected.size === kpiData.data.length) setKpiSelected(new Set());
    else setKpiSelected(new Set(kpiData.data.map(c => c.id)));
  };

  const handleKpiBulkApprouver = () => {
    let count = 0;
    kpiSelected.forEach(id => {
      const idx = CONGES.findIndex(x => x.id === id);
      if (idx !== -1 && CONGES[idx].statut === 'en_attente') {
        const oldValue = { statut: CONGES[idx].statut };
        CONGES[idx] = { ...CONGES[idx], statut: 'approuvee', date_approbation: new Date().toISOString().slice(0, 10), approbateur: 'emp-012' };
        logAction('approuver_kpi', CONGES[idx].id, CONGES[idx].employee_id, {}, oldValue, { statut: 'approuvee' });
        count++;
      }
    });
    if (count > 0) {
      triggerInterconnexions();
      setKpiSelected(new Set());
      setSnack({ msg: `${count} demande(s) approuvée(s) depuis le KPI`, severity: 'success' });
    } else {
      setSnack({ msg: 'Aucune demande en attente sélectionnée', severity: 'info' });
    }
  };

  const handleKpiApprouverTout = () => {
    if (!kpiData || kpiData.data.length === 0) return;
    let count = 0;
    kpiData.data.forEach(c => {
      if (c.statut === 'en_attente') {
        const idx = CONGES.findIndex(x => x.id === c.id);
        if (idx !== -1) {
          const oldValue = { statut: CONGES[idx].statut };
          CONGES[idx] = { ...CONGES[idx], statut: 'approuvee', date_approbation: new Date().toISOString().slice(0, 10), approbateur: 'emp-012' };
          logAction('approuver_tout_kpi', c.id, c.employee_id, {}, oldValue, { statut: 'approuvee' });
          count++;
        }
      }
    });
    if (count > 0) {
      triggerInterconnexions();
      setSnack({ msg: `${count} demande(s) approuvée(s) en masse`, severity: 'success' });
      setTimeout(() => setKpiDialog(null), 700);
    }
  };

  // --- KPI Dialog data ---
  const kpiData = useMemo(() => {
    if (!kpiDialog) return null;
    let data = [], title = '', color = TURQUOISE, actions = [];
    switch (kpiDialog) {
      case 'enAttente':
        data = CONGES.filter(c => c.statut === 'en_attente');
        title = `Demandes en attente (${stats.enAttente})`;
        color = stats.enAttente > 5 ? ROUGE : ORANGE;
        actions = ['approuverSelection', 'approuverTout'];
        break;
      case 'approuves':
        data = CONGES.filter(c => c.statut === 'approuvee');
        title = `Congés approuvés (${stats.approuves})`;
        color = VERT;
        actions = [];
        break;
      case 'tauxUtilisation':
        data = SOLDES_CONGES.map(s => ({ ...s, _type: 'solde' }));
        title = `Taux d'utilisation — ${stats.tauxUtilisation}%`;
        color = stats.tauxUtilisation >= 75 ? ROUGE : stats.tauxUtilisation >= 50 ? ORANGE : VERT;
        actions = [];
        break;
      case 'soldeCritique':
        data = stats.soldesCritiques.map(s => ({ ...s, _type: 'solde' }));
        title = `Alertes solde critique (${stats.soldesCritiques.length})`;
        color = ROUGE;
        actions = [];
        break;
      default:
        return null;
    }
    return { data, title, color, actions };
  }, [kpiDialog, refreshKey, stats]);

  // --- Popover solde ---
  const handleOpenSolde = (event, employeeId) => {
    setSoldeAnchor(event.currentTarget);
    setSoldeEmp(getSolde(employeeId));
  };

  const handleCloseSolde = () => {
    setSoldeAnchor(null);
    setSoldeEmp(null);
  };

  // --- Soumission feedback ---
  const handleSubmitFeedback = () => {
    logAction('feedback', null, null, { rating: feedback.rating, comment: feedback.comment }, null, feedback);
    setFeedbackDialog(false);
    setFeedback({ rating: 0, comment: '' });
    setSnack({ msg: 'Merci pour votre retour !', severity: 'success' });
  };

  // --- Employee selectionné dans le formulaire ---
  const selectedEmp = form.employee_id ? findEmployee(form.employee_id) : null;
  const selectedSolde = selectedEmp ? getSolde(selectedEmp.id) : null;
  const formNbJours = calculerJours(form.date_debut, form.date_fin);
  const formChevauchements = form.employee_id ? detecterChevauchement(form.employee_id, form.date_debut, form.date_fin) : [];
  const soldeApresDemande = selectedSolde ? selectedSolde.solde_disponible - formNbJours : null;
  const soldeInsuffisant = soldeApresDemande !== null && soldeApresDemande < 0 && form.type_conge === 'conge_annuel';

  // Taux utilisation dynamic color
  const tauxColor = stats.tauxUtilisation >= 75 ? ROUGE : stats.tauxUtilisation >= 50 ? ORANGE : VERT;
  const tauxLabel = stats.tauxUtilisation >= 75 ? 'Critique' : stats.tauxUtilisation >= 50 ? 'À surveiller' : 'Sain';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Box>
      {/* === STICKY KPI BAR (4 cartes cliquables) === */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f0f7ff',
        pt: 1.5, pb: 1.5, mb: 2, borderBottom: `2px solid ${TURQUOISE}40`,
      }}>
        <Grid container spacing={1.5}>
          {/* 1. Demandes en attente — ORANGE/ROUGE si >5 */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              value={stats.enAttente} label='Demandes en attente'
              emoji='⏳' color={stats.enAttente > 5 ? ROUGE : ORANGE}
              subtitle={`Cliquer pour voir la liste (${stats.enAttente} en attente)`}
              onClick={() => handleOpenKpi('enAttente')}
            />
          </Grid>
          {/* 2. Congés approuvés — VERT */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              value={stats.approuves} label='Congés approuvés'
              emoji='✅' color={VERT}
              subtitle={`${kpis.totalJoursPris} jours pris au total`}
              onClick={() => handleOpenKpi('approuves')}
            />
          </Grid>
          {/* 3. Taux d'utilisation — dynamic color + LinearProgress */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              value={`${stats.tauxUtilisation}%`} label={`Taux utilisation · ${tauxLabel}`}
              emoji='📊' color={tauxColor}
              subtitle='Pris / Droit annuel (tous employés)'
              progress={stats.tauxUtilisation}
              onClick={() => handleOpenKpi('tauxUtilisation')}
            />
          </Grid>
          {/* 4. Alertes solde critique — ROUGE */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              value={stats.soldesCritiques.length} label='Alertes solde critique'
              emoji='🚨' color={ROUGE}
              subtitle='Employés avec solde < 5 jours'
              onClick={() => handleOpenKpi('soldeCritique')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* === ALERTES === */}
      {alerteAttenteLongue.length > 0 && (
        <Alert severity='warning' sx={{ mb: 2, fontSize: '0.75rem' }} icon={<WarningAmberIcon />}>
          <strong>⚠ {alerteAttenteLongue.length} demande(s) en attente depuis plus de 5 jours</strong> —{' '}
          {alerteAttenteLongue.map(c => {
            const emp = findEmployee(c.employee_id);
            return emp ? employeeFullName(emp) : c.leave_number;
          }).join(', ')}
          . Action requise : valider ou refuser rapidement.
        </Alert>
      )}

      {/* === WIDGET PROCHAINS RETOURS DE CONGÉ === */}
      {prochainsRetours.length > 0 && (
        <Card variant='outlined' sx={{
          mb: 2, border: `1px solid ${TURQUOISE}30`, borderRadius: '12px',
          background: `linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(255,255,255,0.8) 100%)`,
        }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
              <ScheduleIcon sx={{ fontSize: 18, color: TURQUOISE }} />
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                📅 Prochains retours de congé ({prochainsRetours.length})
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                — Top 5 des retours à anticiper
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap='wrap' useFlexGap>
              {prochainsRetours.map((c, i) => {
                const emp = findEmployee(c.employee_id);
                const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                const urgencyColor = c.joursRestants <= 3 ? ROUGE : c.joursRestants <= 7 ? ORANGE : VERT;
                const typeStyle = getTypeCongeStyle(c.type_conge);
                return (
                  <Box key={c.id} sx={{
                    flex: 1, minWidth: 180, p: 1, bgcolor: '#fff', borderRadius: 1.5,
                    border: `1px solid ${urgencyColor}25`, display: 'flex', alignItems: 'center', gap: 1,
                  }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', bgcolor: urgencyColor, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.7rem', flexShrink: 0,
                    }}>
                      {i + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant='caption' sx={{
                        fontSize: '0.68rem', fontWeight: 700, color: NAVY, display: 'block',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {typeStyle.emoji} {empName}
                      </Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>
                        Retour: {formatDate(c.date_fin)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${c.joursRestants}j`}
                      size='small'
                      sx={{
                        fontSize: '0.55rem', height: 16, bgcolor: `${urgencyColor}15`, color: urgencyColor,
                        fontWeight: 700, flexShrink: 0,
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* === INTERCONNEXIONS PANEL (Prompt 4) === */}
      <Card variant='outlined' sx={{
        mb: 2, border: `1px solid ${TURQUOISE}20`, borderRadius: '12px',
        bgcolor: `${TURQUOISE}04`,
      }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems='center' justifyContent='space-between'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <HubIcon sx={{ fontSize: 20, color: TURQUOISE }} />
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Interconnexions actives
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                  refreshSoldesConges() + genererRappelsRetourConge() appelés après chaque action
                </Typography>
              </Box>
            </Stack>
            <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
              <Chip size='small' label='🔄 Solde Congés' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${TURQUOISE}15`, color: TURQUOISE_DARK, fontWeight: 700 }} />
              <Chip size='small' label='📨 Rappels Admin' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${ORANGE}15`, color: ORANGE, fontWeight: 700 }} />
              <Chip size='small' label='📊 Tableau de Bord' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${VIOLET}15`, color: VIOLET, fontWeight: 700 }} />
              <Chip size='small' label='👤 Fiche Employé' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${VERT}15`, color: VERT, fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* === 3 CHARTS (Prompt 4) === */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Chart 1 : Répartition par type — PieChart donut clickable */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutSmallIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition par type de congé
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD · Cliquez sur une part pour filtrer le tableau
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartTypeData} cx='50%' cy='50%'
                      innerRadius={50} outerRadius={85} paddingAngle={3}
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#6b7a8a', strokeWidth: 0.5 }}
                      style={{ fontSize: '0.6rem', cursor: 'pointer' }}
                      onClick={(e) => {
                        if (e && e.type_conge) {
                          setFType(e.type_conge);
                          setPage(0);
                          setSnack({ msg: `Filtre Type appliqué : ${LABELS.type_conge[e.type_conge]}`, severity: 'info' });
                        }
                      }}
                    >
                      {chartTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2 : Évolution mensuelle — BarChart avec toggle */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <BarChartIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                    Évolution mensuelle
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={0.5}>
                  <Chip
                    label='Jours pris' size='small'
                    onClick={() => setChartMode('jours')}
                    sx={{
                      fontSize: '0.55rem', height: 20,
                      bgcolor: chartMode === 'jours' ? TURQUOISE : `${TURQUOISE}15`,
                      color: chartMode === 'jours' ? '#fff' : TURQUOISE_DARK, fontWeight: 700, cursor: 'pointer',
                    }}
                  />
                  <Chip
                    label='Demandes' size='small'
                    onClick={() => setChartMode('demandes')}
                    sx={{
                      fontSize: '0.55rem', height: 20,
                      bgcolor: chartMode === 'demandes' ? TURQUOISE : `${TURQUOISE}15`,
                      color: chartMode === 'demandes' ? '#fff' : TURQUOISE_DARK, fontWeight: 700, cursor: 'pointer',
                    }}
                  />
                </Stack>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD · Lignes = Mois · Valeurs = {chartMode === 'jours' ? 'Somme jours' : 'Comptage demandes'}
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={chartMensuelData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='mois' tick={{ fontSize: 9, fill: '#6b7a8a' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: `${TURQUOISE}08` }}
                    />
                    <Bar dataKey={chartMode} name={chartMode === 'jours' ? 'Jours pris' : 'Demandes'} radius={[4, 4, 0, 0]}>
                      {chartMensuelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TURQUOISE} fillOpacity={0.4 + (entry[chartMode] / Math.max(...chartMensuelData.map(d => d[chartMode]), 1)) * 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3 : Statut des demandes — PieChart donut clickable */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutSmallIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Statut des demandes
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD · Cliquez sur une part pour filtrer le tableau
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartStatutData} cx='50%' cy='50%'
                      innerRadius={50} outerRadius={85} paddingAngle={3}
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#6b7a8a', strokeWidth: 0.5 }}
                      style={{ fontSize: '0.6rem', cursor: 'pointer' }}
                      onClick={(e) => {
                        if (e && e.statut) {
                          setFStatut(e.statut);
                          setPage(0);
                          setSnack({ msg: `Filtre Statut appliqué : ${LABELS.statut_conge[e.statut]}`, severity: 'info' });
                        }
                      }}
                    >
                      {chartStatutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === MAIN CARD : TABLE + FILTERS === */}
      <Card>
        <CardContent>
          <SectionHeader
            title='Congés annuels & absences'
            subtitle={`${filtered.length} demande(s) · Workflow: employé → manager → DRH (si > 5j ou sans solde)`}
            action={
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                  Export CSV
                </Button>
                <Button variant='outlined' size='small' startIcon={<HistoryIcon />} onClick={() => setHistoryDialog('all')} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VIOLET, borderColor: VIOLET }} disabled={!raci.perms.voirHistorique}>
                  Historique
                </Button>
                <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => {
                  setForm({ employee_id: '', type_conge: '', date_debut: '', date_fin: '', motif: '', forcer: false, notifier_manager: true, envoyer_copie: false });
                  setCreateDialog(true);
                }} disabled={!raci.perms.creer}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>
                  Nouvelle demande
                </Button>
              </Stack>
            }
          />

          {/* === 5 GLOBAL FILTERS === */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2, p: 1.5, bgcolor: `${TURQUOISE}06`, borderRadius: 1.5, border: `1px solid ${TURQUOISE}20` }}>
            <TextField
              size='small' placeholder='Rechercher (nom, n° demande, motif)...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: TURQUOISE }} /></InputAdornment>,
                endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
              }}
              sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.8rem' }, '& .Mui-focused .MuiInputAdornment-root svg': { color: TURQUOISE } }}
            />
            <TextField select size='small' label='Mois' value={fMonth} onChange={(e) => { setFMonth(e.target.value); setPage(0); }}
              sx={{ minWidth: 140, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Année' value={fYear} onChange={(e) => { setFYear(e.target.value); setPage(0); }}
              sx={{ minWidth: 110, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              {CONGES_YEARS.map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Département' value={fDept} onChange={(e) => { setFDept(e.target.value); setPage(0); }}
              sx={{ minWidth: 150, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              {DEPARTEMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type' value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }}
              sx={{ minWidth: 160, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_conge.map(t => <MenuItem key={t} value={t}>{getTypeCongeStyle(t).emoji} {LABELS.type_conge[t]}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }}
              sx={{ minWidth: 140, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.statut_conge.map(s => <MenuItem key={s} value={s}>{LABELS.statut_conge[s]}</MenuItem>)}
            </TextField>
            {activeFilterCount > 0 && (
              <Button size='small' startIcon={<ClearIcon sx={{ fontSize: 14 }} />} onClick={handleResetFilters}
                sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE, flexShrink: 0 }}>
                Réinitialiser ({activeFilterCount})
              </Button>
            )}
          </Stack>

          {/* Compteur + chips filtres actifs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, px: 1 }} justifyContent='space-between'>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
              <Chip label={`${filtered.length} congé(s) trouvé(s)`} size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${TURQUOISE}12`, color: TURQUOISE_DARK, fontWeight: 700 }} />
              {sortConfig.key && (
                <Chip label={`Tri: ${sortConfig.key} (${sortConfig.direction === 'asc' ? '↑' : '↓'})`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(11,42,74,0.08)', color: NAVY, fontWeight: 600 }} />
              )}
              {filtered.length === 0 && (
                <Chip label='Aucun congé — SIERREUR(FILTRE(...))' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
              )}
            </Stack>
            <Tooltip title='Formule Excel FILTRE multi-critères — PROMPT 3'>
              <Box sx={{ p: 0.8, bgcolor: `${TURQUOISE}08`, borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.52rem', color: TURQUOISE_DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', md: 550 } }}>
                {'=SIERREUR(FILTRE(T_Conges; (Mois=MoisFiltre)*(Annee=AnneeFiltre)*(Dept=DeptFiltre)*(Type=TypeFiltre)*(Statut=StatutFiltre)); "Aucun congé")'}
              </Box>
            </Tooltip>
          </Stack>

          {/* === BULK ACTIONS BAR === */}
          {selected.size > 0 && (
            <Alert severity='info' icon={<CheckCircleIcon />} sx={{ mb: 1.5, bgcolor: `${TURQUOISE}08`, borderColor: `${TURQUOISE}30`, '& .MuiAlert-message': { width: '100%' } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent='space-between'>
                <Typography variant='body2' fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                  {selected.size} demande(s) sélectionnée(s)
                </Typography>
                <Stack direction='row' spacing={1}>
                  {raci.perms.approuver && (
                    <Button size='small' variant='contained' color='success' startIcon={<CheckCircleIcon />} onClick={handleBulkApprouver} sx={{ textTransform: 'none', fontSize: '0.7rem' }}>
                      Approuver sélection
                    </Button>
                  )}
                  <Button size='small' variant='outlined' startIcon={<ClearIcon />} onClick={() => setSelected(new Set())} sx={{ textTransform: 'none', fontSize: '0.7rem' }}>
                    Annuler sélection
                  </Button>
                </Stack>
              </Stack>
            </Alert>
          )}

          {/* === TABLE INTERACTIVE === */}
          <TableContainer component={Paper} elevation={0} sx={{
            border: '1px solid #e9edf2', borderRadius: 1, overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#c1c9d4', borderRadius: 4 },
          }}>
            <Table size='small' stickyHeader sx={{
              '& .MuiTableCell-head': { bgcolor: '#2c3e50', color: '#fff', fontWeight: 700, fontSize: '0.68rem', borderBottom: '2px solid #1a2a3a', whiteSpace: 'nowrap' },
              tableLayout: 'auto',
            }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2c3e50' }}>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      size='small' sx={{ color: '#fff', '&.Mui-checked': { color: TURQUOISE } }}
                      indeterminate={selected.size > 0 && selected.size < pageRows.length}
                      checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))}
                      onChange={handleToggleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      N°<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('leave_number')}><SortIcon column='leave_number' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      Employé<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('employee')}><SortIcon column='employee' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Département</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      Type<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('type_conge')}><SortIcon column='type_conge' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      Du<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('date_debut')}><SortIcon column='date_debut' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      Au<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('date_fin')}><SortIcon column='date_fin' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center' justifyContent='flex-end'>
                      Jours<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('jours')}><SortIcon column='jours' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Motif</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      Statut<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('statut')}><SortIcon column='statut' sortConfig={sortConfig} /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((c, idx) => {
                  const emp = findEmployee(c.employee_id);
                  const appr = findEmployee(c.approbateur);
                  const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                  const typeStyle = getTypeCongeStyle(c.type_conge);
                  const statutStyle = getStatutCongeStyle(c.statut);
                  const isAttente = c.statut === 'en_attente';
                  // Surbrillance si en_attente depuis > 7 jours
                  const deposee = new Date(c.date_debut);
                  const isAttenteLongue = isAttente && Math.ceil((now - deposee) / (1000 * 60 * 60 * 24)) > 7;
                  const isSelected = selected.has(c.id);
                  return (
                    <TableRow key={c.id} hover sx={{
                      bgcolor: isSelected ? `${TURQUOISE}10` :
                        isAttenteLongue ? 'rgba(212,160,23,0.08)' :
                        idx % 2 === 0 ? '#f8f9fa' : '#fff',
                      '&:hover': {
                        bgcolor: isSelected ? `${TURQUOISE}18` :
                          isAttenteLongue ? 'rgba(212,160,23,0.14)' : 'action.hover',
                      },
                    }}>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          size='small' color='primary'
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          sx={{ '&.Mui-checked': { color: TURQUOISE } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem', fontWeight: 700, color: VIOLET }}>
                          {c.leave_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={0.5} alignItems='center'>
                          <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: `${TURQUOISE}20`, color: TURQUOISE_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                            {emp ? emp.prenom.charAt(0) : '?'}
                          </Box>
                          <Box>
                            <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                              {empName}
                            </Typography>
                            <Typography variant='caption' sx={{ fontSize: '0.58rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                              {emp?.matricule || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: NAVY }}>
                          {emp?.departement || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={typeStyle.icon}
                          label={LABELS.type_conge[c.type_conge] || c.type_conge}
                          size='small'
                          sx={{
                            fontSize: '0.58rem', height: 22,
                            bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 700,
                            border: `1px solid ${typeStyle.color}30`,
                            '& .MuiChip-icon': { color: typeStyle.color, ml: '4px', fontSize: '14px' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: NAVY, fontFamily: 'monospace' }}>
                          {formatDate(c.date_debut)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: NAVY, fontFamily: 'monospace' }}>
                          {formatDate(c.date_fin)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='caption' sx={{ fontWeight: 700, fontSize: '0.78rem', color: c.nombre_jours > 30 ? ORANGE : NAVY }}>
                          {c.nombre_jours}j
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.66rem', maxWidth: 140, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.motif || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={0.3} alignItems='center'>
                          <Chip
                            label={LABELS.statut_conge[c.statut] || c.statut}
                            size='small'
                            sx={{
                              fontSize: '0.58rem', height: 18,
                              bgcolor: statutStyle.bg, color: statutStyle.color, fontWeight: 700,
                              border: `1px solid ${statutStyle.color}40`,
                            }}
                          />
                          {isAttenteLongue && (
                            <Tooltip title='En attente depuis > 7 jours'>
                              <WarningAmberIcon sx={{ fontSize: 14, color: ORANGE }} />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.3} justifyContent='center' alignItems='center'>
                          <Tooltip title='Voir détail'>
                            <IconButton size='small' sx={{ color: TURQUOISE, p: 0.4 }} onClick={() => setDetailDialog({ ...c })}>
                              <VisibilityIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Voir solde'>
                            <IconButton size='small' sx={{ color: BLEU, p: 0.4 }} onClick={(e) => handleOpenSolde(e, c.employee_id)}>
                              <TrendingUpIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Modifier'>
                            <IconButton size='small' sx={{ color: 'info.main', p: 0.4 }} disabled={!raci.perms.modifier} onClick={() => setEditDialog({ ...c })}>
                              <EditIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          {isAttente && raci.perms.approuver && (
                            <Tooltip title='Approuver'>
                              <IconButton size='small' sx={{ color: VERT, p: 0.4 }} onClick={() => handleApprouver(c)}>
                                <CheckCircleIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isAttente && raci.perms.refuser && (
                            <Tooltip title='Refuser'>
                              <IconButton size='small' sx={{ color: ROUGE, p: 0.4 }} onClick={() => handleRefuser(c)}>
                                <CancelIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {raci.perms.supprimer && (
                            <Tooltip title='Supprimer'>
                              <IconButton size='small' sx={{ color: ROUGE, p: 0.4 }} onClick={() => setDeleteDialog({ ...c })}>
                                <DeleteIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={11} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun enregistrement trouvé</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div' count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage='Lignes:' labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* === PROMPT 5 : PANEL CONFORMITÉ ISO + RACI === */}
      <Card variant='outlined' sx={{ mt: 2, border: `1px solid ${VIOLET}30`, borderRadius: '12px' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Box>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ fontSize: 18, color: VIOLET }} />
                Conformité ISO · Matrice RACI · Audit trail
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8', display: 'block', mt: 0.3 }}>
                Sélectionnez un rôle pour tester les permissions · Audit trail horodaté
              </Typography>
            </Box>
            <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
              <Chip size='small' icon={<VerifiedIcon sx={{ fontSize: 12 }} />} label='ISO 9001:2015' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${VERT}12`, color: VERT, fontWeight: 700 }} />
              <Chip size='small' icon={<SecurityIcon sx={{ fontSize: 12 }} />} label='ISO 30401:2018' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${VIOLET}12`, color: VIOLET, fontWeight: 700 }} />
              <Chip size='small' icon={<HistoryIcon sx={{ fontSize: 12 }} />} label={`Audit: ${CONGES_AUDIT_TRAIL.length} actions`} sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${BLEU}12`, color: BLEU, fontWeight: 700 }} />
              <Chip size='small' icon={<AccessibilityNewIcon sx={{ fontSize: 12 }} />} label='WCAG AA' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${TURQUOISE}12`, color: TURQUOISE_DARK, fontWeight: 700 }} />
              <Chip size='small' icon={<GavelIcon sx={{ fontSize: 12 }} />} label='RGPD' sx={{ fontSize: '0.6rem', height: 22, bgcolor: `${ORANGE}12`, color: ORANGE, fontWeight: 700 }} />
            </Stack>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: NAVY }}>
              Rôle actif :
            </Typography>
            <RadioGroup row value={raciRole} onChange={(e) => setRaciRole(e.target.value)}>
              {RACI_ROLES.map(r => (
                <FormControlLabel
                  key={r.value} value={r.value}
                  control={<Radio size='small' sx={{ color: r.color, '&.Mui-checked': { color: r.color } }} />}
                  label={<Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{r.emoji} {r.label}</Typography>}
                />
              ))}
            </RadioGroup>
            <Box sx={{ flex: 1 }} />
            <Stack direction='row' spacing={0.5}>
              <Chip size='small' label={`Approuver: ${raci.perms.approuver ? 'Oui' : 'Non'}`} sx={{ fontSize: '0.55rem', height: 18, bgcolor: raci.perms.approuver ? `${VERT}12` : `${GRIS}12`, color: raci.perms.approuver ? VERT : GRIS }} />
              <Chip size='small' label={`Modifier: ${raci.perms.modifier ? 'Oui' : 'Non'}`} sx={{ fontSize: '0.55rem', height: 18, bgcolor: raci.perms.modifier ? `${VERT}12` : `${GRIS}12`, color: raci.perms.modifier ? VERT : GRIS }} />
              <Chip size='small' label={`Supprimer: ${raci.perms.supprimer ? 'Oui' : 'Non'}`} sx={{ fontSize: '0.55rem', height: 18, bgcolor: raci.perms.supprimer ? `${VERT}12` : `${GRIS}12`, color: raci.perms.supprimer ? VERT : GRIS }} />
            </Stack>
            <Button size='small' variant='outlined' onClick={() => setFeedbackDialog(true)} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ORANGE, borderColor: ORANGE }}>
              Laisser un feedback
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ============================================================
          DIALOG CRÉATION (Prompt 3)
          ============================================================ */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon sx={{ color: TURQUOISE }} /> Nouvelle demande de congé
          <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#9aa8b8', fontFamily: 'monospace', ml: 1 }}>
            N° auto: CG-{new Date().getFullYear()}-{String(CONGES.length + 1).padStart(3, '0')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Les colonnes Employé, Département, Solde sont auto-remplies (RECHERCHEX). Le nombre de jours est calculé automatiquement.
            </Alert>

            {/* Autocomplete employé (search by name/matricule) */}
            <Autocomplete
              size='small'
              options={EMPLOYEES}
              getOptionLabel={(e) => `${e.matricule} — ${employeeFullName(e)} (${e.poste || '—'})`}
              value={selectedEmp || null}
              onChange={(_, e) => setForm({ ...form, employee_id: e ? e.id : '' })}
              renderInput={(params) => <TextField {...params} label='Employé *' placeholder='Rechercher par nom ou matricule...' />}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />

            {/* Auto-fill info employé */}
            {selectedEmp && (
              <Box sx={{ p: 1.5, bgcolor: `${TURQUOISE}06`, borderRadius: 1.5, border: `1px solid ${TURQUOISE}20` }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Nom</Typography>
                    <Typography variant='body2' sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{employeeFullName(selectedEmp)}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Matricule</Typography>
                    <Typography variant='body2' sx={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>{selectedEmp.matricule}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Département</Typography>
                    <Typography variant='body2' sx={{ fontSize: '0.78rem' }}>{selectedEmp.departement}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Poste</Typography>
                    <Typography variant='body2' sx={{ fontSize: '0.78rem' }}>{selectedEmp.poste}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Solde actuel</Typography>
                    {selectedSolde ? (
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', fontWeight: 700, color: selectedSolde.solde_disponible < 5 ? ROUGE : VERT }}>
                        {selectedSolde.solde_disponible} j / {selectedSolde.droit_annuel_jours} j
                      </Typography>
                    ) : <Typography variant='body2' sx={{ fontSize: '0.78rem' }}>—</Typography>}
                  </Grid>
                </Grid>
              </Box>
            )}

            <TextField select size='small' label='Type de congé *' fullWidth value={form.type_conge}
              onChange={(e) => setForm({ ...form, type_conge: e.target.value })}>
              {NOMENCLATURES.type_conge.map(t => <MenuItem key={t} value={t}>{getTypeCongeStyle(t).emoji} {LABELS.type_conge[t]}</MenuItem>)}
            </TextField>

            <Stack direction='row' spacing={1.5}>
              <TextField type='date' size='small' label='Date début *' fullWidth
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                InputLabelProps={{ shrink: true }}
                error={Boolean(form.date_fin && form.date_debut && new Date(form.date_fin) < new Date(form.date_debut))}
              />
              <TextField type='date' size='small' label='Date fin *' fullWidth
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                InputLabelProps={{ shrink: true }}
                error={Boolean(form.date_fin && form.date_debut && new Date(form.date_fin) < new Date(form.date_debut))}
                helperText={form.date_fin && form.date_debut && new Date(form.date_fin) < new Date(form.date_debut) ? 'La fin doit être ≥ au début' : ''}
              />
            </Stack>

            {/* Auto-calc nombre de jours + solde après demande */}
            {form.date_debut && form.date_fin && new Date(form.date_fin) >= new Date(form.date_debut) && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box sx={{ flex: 1, p: 1, bgcolor: `${TURQUOISE}06`, borderRadius: 1 }}>
                  <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Nombre de jours calculé</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: TURQUOISE_DARK }}>{formNbJours} j</Typography>
                </Box>
                {selectedSolde && (
                  <Box sx={{ flex: 1, p: 1, bgcolor: soldeInsuffisant ? `${ROUGE}10` : `${VERT}06`, borderRadius: 1, border: soldeInsuffisant ? `1px solid ${ROUGE}30` : 'none' }}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Solde après demande</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: soldeInsuffisant ? ROUGE : VERT }}>
                      {soldeApresDemande} j {soldeInsuffisant && '⚠ Insuffisant'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}

            {/* Chevauchement detection + Forcer checkbox */}
            {formChevauchements.length > 0 && (
              <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                <strong>Chevauchement détecté avec {formChevauchements.length} demande(s) existante(s) :</strong>{' '}
                {formChevauchements.slice(0, 3).map(c => c.leave_number).join(', ')}
                {formChevauchements.length > 3 && ` (+${formChevauchements.length - 3} autres)`}
                <FormControlLabel
                  control={<Checkbox size='small' checked={form.forcer} onChange={(e) => setForm({ ...form, forcer: e.target.checked })} sx={{ ml: 1 }} />}
                  label={<Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Forcer la création malgré le chevauchement</Typography>}
                  sx={{ display: 'flex', mt: 0.5 }}
                />
              </Alert>
            )}

            <TextField multiline rows={3} size='small' label='Motif *' fullWidth value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              error={false}
              helperText='Motif obligatoire pour validation du workflow'
            />

            <Stack direction='row' spacing={2}>
              <FormControlLabel
                control={<Checkbox size='small' checked={form.notifier_manager} onChange={(e) => setForm({ ...form, notifier_manager: e.target.checked })} />}
                label={<Typography variant='caption' sx={{ fontSize: '0.72rem' }}>Notifier le manager</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size='small' checked={form.envoyer_copie} onChange={(e) => setForm({ ...form, envoyer_copie: e.target.checked })} />}
                label={<Typography variant='caption' sx={{ fontSize: '0.72rem' }}>Envoyer copie à l'employé</Typography>}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button
            variant='contained' startIcon={submitting ? undefined : <AddIcon />}
            disabled={!form.employee_id || !form.type_conge || !form.date_debut || !form.date_fin || !form.motif || submitting}
            onClick={handleCreate}
            sx={{ bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK }, minWidth: 140 }}
          >
            {submitting ? 'Soumission...' : 'Soumettre la demande'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG DÉTAIL
          ============================================================ */}
      <Dialog open={Boolean(detailDialog)} onClose={() => setDetailDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon sx={{ color: TURQUOISE }} /> Détail de la demande
          {detailDialog && (
            <Typography variant='caption' sx={{ fontFamily: 'monospace', ml: 1, color: VIOLET, fontWeight: 700 }}>
              {detailDialog.leave_number}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {detailDialog && (() => {
            const emp = findEmployee(detailDialog.employee_id);
            const appr = findEmployee(detailDialog.approbateur);
            const solde = getSolde(detailDialog.employee_id);
            const typeStyle = getTypeCongeStyle(detailDialog.type_conge);
            const statutStyle = getStatutCongeStyle(detailDialog.statut);
            return (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Box sx={{ p: 1.5, bgcolor: `${TURQUOISE}06`, borderRadius: 1.5, border: `1px solid ${TURQUOISE}20` }}>
                  <Stack direction='row' spacing={1.5} alignItems='center'>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: TURQUOISE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                      {emp ? emp.prenom.charAt(0) : '?'}
                    </Box>
                    <Box>
                      <Typography variant='body2' fontWeight={700}>{emp ? employeeFullName(emp) : 'Non trouvé'}</Typography>
                      <Typography variant='caption' sx={{ color: '#9aa8b8', fontFamily: 'monospace' }}>
                        {emp?.matricule} · {emp?.departement}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Type de congé</Typography>
                    <Chip icon={typeStyle.icon} label={LABELS.type_conge[detailDialog.type_conge]} size='small' sx={{ fontSize: '0.65rem', bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 700 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Statut</Typography>
                    <Chip label={LABELS.statut_conge[detailDialog.statut]} size='small' sx={{ fontSize: '0.65rem', bgcolor: statutStyle.bg, color: statutStyle.color, fontWeight: 700 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Date début</Typography>
                    <Typography variant='body2' fontWeight={600}>{formatDate(detailDialog.date_debut)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Date fin</Typography>
                    <Typography variant='body2' fontWeight={600}>{formatDate(detailDialog.date_fin)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Nombre de jours</Typography>
                    <Typography variant='body2' fontWeight={700} sx={{ color: TURQUOISE_DARK }}>{detailDialog.nombre_jours} j</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Approbateur</Typography>
                    <Typography variant='body2'>{appr ? employeeFullName(appr) : 'En attente'}</Typography>
                  </Grid>
                  {detailDialog.date_approbation && (
                    <Grid item xs={6}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Date approbation</Typography>
                      <Typography variant='body2'>{formatDate(detailDialog.date_approbation)}</Typography>
                    </Grid>
                  )}
                </Grid>
                <Box>
                  <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Motif</Typography>
                  <Typography variant='body2' sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, mt: 0.5 }}>{detailDialog.motif || '—'}</Typography>
                </Box>
                {solde && (
                  <Box sx={{ p: 1.5, bgcolor: `${BLEU}06`, borderRadius: 1.5, border: `1px solid ${BLEU}20` }}>
                    <Typography variant='caption' sx={{ fontSize: '0.65rem', color: BLEU, fontWeight: 700, display: 'block', mb: 0.5 }}>
                      Solde congés {solde.annee}
                    </Typography>
                    <Stack direction='row' spacing={2}>
                      <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Droit: <strong>{solde.droit_annuel_jours}j</strong></Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Pris: <strong>{solde.conges_pris_jours}j</strong></Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Dispo: <strong style={{ color: solde.solde_disponible < 5 ? ROUGE : VERT }}>{solde.solde_disponible}j</strong></Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {raci.perms.voirHistorique && detailDialog && (
            <Button onClick={() => { setHistoryDialog(detailDialog.id); setDetailDialog(null); }} startIcon={<HistoryIcon />} sx={{ color: VIOLET }}>
              Historique
            </Button>
          )}
          <Button onClick={() => setDetailDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG ÉDITION
          ============================================================ */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon sx={{ color: 'info.main' }} /> Modifier la demande
          {editDialog && (
            <Typography variant='caption' sx={{ fontFamily: 'monospace', ml: 1, color: VIOLET, fontWeight: 700 }}>
              {editDialog.leave_number}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                Employé: <strong>{employeeFullName(findEmployee(editDialog.employee_id))}</strong> · Statut actuel: <strong>{LABELS.statut_conge[editDialog.statut]}</strong>
              </Alert>
              <TextField select size='small' label='Type de congé' fullWidth value={editDialog.type_conge || ''}
                onChange={(e) => setEditDialog({ ...editDialog, type_conge: e.target.value })}>
                {NOMENCLATURES.type_conge.map(t => <MenuItem key={t} value={t}>{getTypeCongeStyle(t).emoji} {LABELS.type_conge[t]}</MenuItem>)}
              </TextField>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Date début' fullWidth
                  value={(editDialog.date_debut || '').slice(0, 10)}
                  onChange={(e) => setEditDialog({ ...editDialog, date_debut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(editDialog.date_fin && editDialog.date_debut && new Date(editDialog.date_fin) < new Date(editDialog.date_debut))}
                />
                <TextField type='date' size='small' label='Date fin' fullWidth
                  value={(editDialog.date_fin || '').slice(0, 10)}
                  onChange={(e) => setEditDialog({ ...editDialog, date_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(editDialog.date_fin && editDialog.date_debut && new Date(editDialog.date_fin) < new Date(editDialog.date_debut))}
                />
              </Stack>
              {editDialog.date_debut && editDialog.date_fin && new Date(editDialog.date_fin) >= new Date(editDialog.date_debut) && (
                <Typography variant='caption' sx={{ p: 1, bgcolor: `${TURQUOISE}06`, borderRadius: 1, fontSize: '0.7rem' }}>
                  Nouveau nombre de jours calculé: <strong>{calculerJours(editDialog.date_debut, editDialog.date_fin)} j</strong>
                </Typography>
              )}
              <TextField multiline rows={3} size='small' label='Motif' fullWidth value={editDialog.motif || ''}
                onChange={(e) => setEditDialog({ ...editDialog, motif: e.target.value })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit}
            sx={{ bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG SUPPRESSION (confirmation + warning)
          ============================================================ */}
      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: ROUGE }}>
          <DeleteIcon /> Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          {deleteDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                Cette action est <strong>irréversible</strong>. La demande sera supprimée et les soldes seront recalculés automatiquement.
              </Alert>
              <Box sx={{ p: 1.5, bgcolor: `${ROUGE}06`, borderRadius: 1, border: `1px solid ${ROUGE}20` }}>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>Demande</Typography>
                <Typography variant='body2' fontWeight={700} sx={{ fontFamily: 'monospace' }}>{deleteDialog.leave_number}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>
                  {employeeFullName(findEmployee(deleteDialog.employee_id))} · {LABELS.type_conge[deleteDialog.type_conge]} · {deleteDialog.nombre_jours}j
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(null)}>Annuler</Button>
          <Button variant='contained' color='error' startIcon={<DeleteIcon />} onClick={() => handleSupprimer(deleteDialog)}>
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG KPI (Prompt 2) — avec sélection + actions groupées
          ============================================================ */}
      <Dialog open={Boolean(kpiDialog)} onClose={() => setKpiDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {kpiData && (
            <>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: kpiData.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                {kpiData.data.length}
              </Box>
              {kpiData.title}
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {kpiData && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {kpiData.actions.includes('approuverSelection') && (
                <Stack direction='row' spacing={1}>
                  <Button size='small' variant='contained' color='success' startIcon={<CheckCircleIcon />}
                    onClick={handleKpiBulkApprouver} disabled={kpiSelected.size === 0}
                    sx={{ textTransform: 'none', fontSize: '0.7rem' }}>
                    Approuver sélection ({kpiSelected.size})
                  </Button>
                  <Button size='small' variant='outlined' color='success' startIcon={<CheckCircleIcon />}
                    onClick={handleKpiApprouverTout}
                    sx={{ textTransform: 'none', fontSize: '0.7rem' }}>
                    Tout approuver
                  </Button>
                </Stack>
              )}

              {kpiDialog === 'soldeCritique' || kpiDialog === 'tauxUtilisation' ? (
                // Table employés avec solde
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 400 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Employé</TableCell>
                        <TableCell align='right' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Droit</TableCell>
                        <TableCell align='right' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Pris</TableCell>
                        <TableCell align='right' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Dispo</TableCell>
                        <TableCell align='right' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Taux</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiData.data.map((s, idx) => {
                        const emp = findEmployee(s.employee_id);
                        return (
                          <TableRow key={s.employee_id} sx={{ bgcolor: idx % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                            <TableCell>
                              <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                                {emp ? employeeFullName(emp) : s.employee_id}
                              </Typography>
                              <Typography variant='caption' sx={{ fontSize: '0.58rem', color: '#9aa8b8', display: 'block' }}>
                                {emp?.matricule} · {emp?.departement}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{s.droit_annuel_jours}j</Typography></TableCell>
                            <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{s.conges_pris_jours}j</Typography></TableCell>
                            <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 700, color: s.solde_disponible < 5 ? ROUGE : VERT }}>{s.solde_disponible}j</Typography></TableCell>
                            <TableCell align='right'><Chip label={`${s.taux_utilisation}%`} size='small' sx={{ fontSize: '0.55rem', height: 18, bgcolor: s.taux_utilisation > 75 ? `${ROUGE}15` : s.taux_utilisation > 50 ? `${ORANGE}15` : `${VERT}15`, color: s.taux_utilisation > 75 ? ROUGE : s.taux_utilisation > 50 ? ORANGE : VERT, fontWeight: 700 }} /></TableCell>
                          </TableRow>
                        );
                      })}
                      {kpiData.data.length === 0 && (
                        <TableRow><TableCell colSpan={5} align='center' sx={{ py: 3, color: 'text.secondary' }}>Aucun employé en alerte</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Table congés avec checkbox + sélection
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 400 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50' }}>
                        {kpiData.actions.includes('approuverSelection') && (
                          <TableCell padding='checkbox'>
                            <Checkbox
                              size='small' sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                              indeterminate={kpiSelected.size > 0 && kpiSelected.size < kpiData.data.length}
                              checked={kpiData.data.length > 0 && kpiSelected.size === kpiData.data.length}
                              onChange={handleToggleAllKpi}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>N°</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Employé</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Type</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Période</TableCell>
                        <TableCell align='right' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Jours</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiData.data.map((c, idx) => {
                        const emp = findEmployee(c.employee_id);
                        const typeStyle = getTypeCongeStyle(c.type_conge);
                        return (
                          <TableRow key={c.id} sx={{ bgcolor: idx % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                            {kpiData.actions.includes('approuverSelection') && (
                              <TableCell padding='checkbox'>
                                <Checkbox
                                  size='small' color='primary'
                                  checked={kpiSelected.has(c.id)}
                                  onChange={() => handleToggleKpiSelect(c.id)}
                                  sx={{ '&.Mui-checked': { color: kpiData.color } }}
                                  disabled={c.statut !== 'en_attente'}
                                />
                              </TableCell>
                            )}
                            <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem', fontWeight: 700, color: VIOLET }}>{c.leave_number}</Typography></TableCell>
                            <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</Typography></TableCell>
                            <TableCell><Chip label={LABELS.type_conge[c.type_conge]} size='small' sx={{ fontSize: '0.58rem', height: 20, bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 700 }} /></TableCell>
                            <TableCell><Typography variant='caption' sx={{ fontSize: '0.65rem' }}>{formatDate(c.date_debut)} → {formatDate(c.date_fin)}</Typography></TableCell>
                            <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{c.nombre_jours}j</Typography></TableCell>
                            <TableCell><StatusBadge status={c.statut} label={LABELS.statut_conge[c.statut]} /></TableCell>
                          </TableRow>
                        );
                      })}
                      {kpiData.data.length === 0 && (
                        <TableRow><TableCell colSpan={kpiData.actions.includes('approuverSelection') ? 7 : 6} align='center' sx={{ py: 3, color: 'text.secondary' }}>Aucune demande</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setKpiDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG HISTORIQUE (PROMPT 5 — DRH only)
          ============================================================ */}
      <Dialog open={Boolean(historyDialog)} onClose={() => setHistoryDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: VIOLET }} /> Audit trail · Historique des actions
          {!raci.perms.voirHistorique && (
            <Chip label='DRH only' size='small' color='error' sx={{ ml: 1, fontSize: '0.55rem' }} />
          )}
        </DialogTitle>
        <DialogContent>
          {!raci.perms.voirHistorique ? (
            <Alert severity='error' sx={{ fontSize: '0.75rem' }}>
              Permission refusée : seul le rôle DRH peut consulter l'historique complet des actions.
            </Alert>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#9aa8b8' }}>
                {historyDialog === 'all'
                  ? `Total : ${CONGES_AUDIT_TRAIL.length} action(s) enregistrée(s)`
                  : `Actions sur la demande ${historyDialog}`}
              </Typography>
              {CONGES_AUDIT_TRAIL
                .filter(a => historyDialog === 'all' ? true : a.conge_id === historyDialog)
                .slice()
                .reverse()
                .map((a, i) => {
                  const emp = a.employee_id ? findEmployee(a.employee_id) : null;
                  return (
                    <Box key={i} sx={{
                      p: 1, bgcolor: i % 2 === 0 ? '#f8f9fa' : '#fff',
                      borderRadius: 1, border: '1px solid #e9edf2',
                      borderLeft: `3px solid ${a.action.includes('approuver') ? VERT : a.action.includes('refuser') ? ROUGE : a.action.includes('supprimer') ? ROUGE : a.action.includes('creer') ? TURQUOISE : VIOLET}`,
                    }}>
                      <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Chip label={a.action} size='small' sx={{ fontSize: '0.55rem', height: 18, bgcolor: `${VIOLET}12`, color: VIOLET, fontWeight: 700 }} />
                          {emp && (
                            <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                              {employeeFullName(emp)}
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                          {new Date(a.timestamp).toLocaleString('fr-FR')} · {a.user}
                        </Typography>
                      </Stack>
                      {a.details && Object.keys(a.details).length > 0 && (
                        <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                          {JSON.stringify(a.details)}
                        </Typography>
                      )}
                      {a.old_value && a.new_value && (
                        <Typography variant='caption' sx={{ fontSize: '0.58rem', color: '#9aa8b8', display: 'block', mt: 0.3 }}>
                          {JSON.stringify(a.old_value)} → {JSON.stringify(a.new_value)}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              {CONGES_AUDIT_TRAIL.filter(a => historyDialog === 'all' ? true : a.conge_id === historyDialog).length === 0 && (
                <Alert severity='info' sx={{ fontSize: '0.72rem' }}>Aucune action enregistrée pour le moment.</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHistoryDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          DIALOG FEEDBACK (PROMPT 5)
          ============================================================ */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ color: ORANGE }} /> Votre feedback
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, alignItems: 'center' }}>
            <Typography variant='body2' sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
              Comment évaluez-vous le module de gestion des congés ?
            </Typography>
            <Rating
              name='feedback-rating' value={feedback.rating}
              onChange={(_, v) => setFeedback({ ...feedback, rating: v })}
              size='large'
              icon={<StarIcon fontSize='inherit' />}
              emptyIcon={<StarIcon fontSize='inherit' sx={{ color: '#e9edf2' }} />}
            />
            <TextField multiline rows={3} size='small' label='Commentaire (optionnel)' fullWidth
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFeedbackDialog(false)}>Annuler</Button>
          <Button variant='contained' onClick={handleSubmitFeedback} disabled={feedback.rating === 0}
            sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#9d5818' } }}>
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================
          POPOVER SOLDE
          ============================================================ */}
      <Popover
        open={Boolean(soldeAnchor)}
        anchorEl={soldeAnchor}
        onClose={handleCloseSolde}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {soldeEmp && (() => {
          const emp = findEmployee(soldeEmp.employee_id);
          return (
            <Box sx={{ p: 2, width: 280 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY, mb: 1 }}>
                Solde congés {soldeEmp.annee} — {emp ? employeeFullName(emp) : ''}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Stack spacing={0.5}>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Droit annuel</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{soldeEmp.droit_annuel_jours} j</Typography>
                </Stack>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>Congés pris</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: ROUGE }}>{soldeEmp.conges_pris_jours} j</Typography>
                </Stack>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>En cours</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: ORANGE }}>{soldeEmp.conges_en_cours} j</Typography>
                </Stack>
                <Divider sx={{ my: 0.5 }} />
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Solde disponible</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.8rem', fontWeight: 800, color: soldeEmp.solde_disponible < 5 ? ROUGE : VERT }}>
                    {soldeEmp.solde_disponible} j
                  </Typography>
                </Stack>
                <Box sx={{ mt: 1 }}>
                  <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', mb: 0.5, display: 'block' }}>
                    Taux d'utilisation: {soldeEmp.taux_utilisation}%
                  </Typography>
                  <LinearProgress
                    variant='determinate' value={soldeEmp.taux_utilisation}
                    color={soldeEmp.taux_utilisation > 75 ? 'error' : soldeEmp.taux_utilisation > 50 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </Box>
          );
        })()}
      </Popover>

      {/* ============================================================
          SNACKBAR
          ============================================================ */}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={snack?.msg}
        severity={snack?.severity}
      />
    </Box>
  );
}
