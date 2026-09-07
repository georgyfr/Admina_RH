// ============================================================
// SuiviPermisD2.jsx — Feuille « 15-Autorisations Permis » (PROMPT 1)
// Tableau structuré T_Permis (13 colonnes A-M)
//
// A: N°                  = "PERM-"&TEXTE(LIGNE()-4;"000")  (auto)
// B: Matricule           = dropdown EMPLOYEES
// C: Employé             = RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E)  (auto, lock)
// D: Type Permis         = dropdown NOMENCLATURES.type_permit
// E: N° Permis           = saisie libre (monospace)
// F: Date Délivrance     = saisie date
// G: Date Expiration     = saisie date
// H: Autorité            = dropdown NOMENCLATURES.autorite
// I: Statut              = SI([@[Date Expiration]]=""; "Valide"; SI(<AUJOURDHUI(); "Expiré"; SI(<=+30; "À renouveler"; "Valide")))  (auto, lock)
// J: Alerte              = SI granulaire indépendante de I (auto, lock)
// K: Dernier Contrôle    = saisie date
// L: Actions             = boutons 👤 Voir fiche + ✏️ Modifier (PROMPT 5 étendra)
// M: Notes               = saisie libre
//
// PROMPT 1 : Structuration de la base et auto-remplissage
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, Tooltip, IconButton, Snackbar, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BadgeIcon from '@mui/icons-material/Badge';
import FlightIcon from '@mui/icons-material/Flight';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  PERMIS, NOMENCLATURES,
  EMPLOYEES, findEmployee, employeeFullName,
  formatDate,
  calculerStatutPermis, calculerAlertePermis,
  CONFIG_ALERTES_PERMIS, ALERTES_PERMIS_HISTORIQUE,
  genererCorpsEmailPermis, DUREES_VALIDITE_PERMIS,
} from './data';
import { SectionHeader } from './components';

// --- Thème couleur DISTINCTIF du module Permis ---
// Bleu turquoise (#0ea5e9) au lieu du violet Mutuelle — pour différencier visuellement
const TURQUOISE = '#0ea5e9';
const TURQUOISE_DARK = '#0284c7';
const VIOLET = '#7e3ff2'; // gardé pour compatibilité (Type Permis chip)
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const JAUNE = '#d4a017';

// --- Icônes sémantiques par type de permis (différenciation visuelle) ---
const TYPE_PERMIT_ICONS = {
  'Permis travail': { icon: <WorkIcon sx={{ fontSize: 14 }} />, emoji: '💼' },
  'Carte sejour': { icon: <HomeIcon sx={{ fontSize: 14 }} />, emoji: '🏠' },
  'Visa long sejour': { icon: <FlightIcon sx={{ fontSize: 14 }} />, emoji: '✈️' },
  'Titre de sejour': { icon: <BadgeIcon sx={{ fontSize: 14 }} />, emoji: '📋' },
};

// ============================================================
// PROMPT 5 : Audit trail des actions sur les permis (Permis_Audit)
// Conforme ISO 30401:2018 — traçabilité des changements :
// - renouveler_permis (individuel — col L 🔄, intelligent selon type)
// - modifier_permis (changement N°/Date via dialog ✏️)
// - envoyer_rappels (système d'alertes PROMPT 5)
// Chaque entrée enregistre : timestamp, action, permis_id, employee_id, user.
// ============================================================
const PERMIS_AUDIT_TRAIL = [];

// ============================================================
// PROMPT 6 : Journal des exports sécurisés (_Logs_Exports)
// Conforme ISO 9001:2015 + ISO 30414:2018 — traçabilité des exports.
// Types : export_pdf (vue filtrée), export_audit (tous les permis triés).
// ============================================================
const EXPORTS_LOG = [];

// ============================================================
// Couleurs par type de permis (chip colored)
// Mapping stable pour distinguer visuellement les types de permis.
// ============================================================
const TYPE_PERMIT_COLORS = {
  'Permis travail': { bg: 'rgba(184,106,42,0.10)', color: ORANGE },
  'Carte sejour': { bg: 'rgba(42,106,154,0.12)', color: BLEU },
  'Visa long sejour': { bg: 'rgba(126,63,242,0.10)', color: VIOLET },
  'Titre de sejour': { bg: 'rgba(11,42,74,0.10)', color: NAVY },
  'Autre': { bg: 'rgba(107,122,138,0.10)', color: '#6b7a8a' },
};

const getTypePermitStyle = (type) => TYPE_PERMIT_COLORS[type] || TYPE_PERMIT_COLORS['Autre'];

// --- Composant flèche de tri dynamique (PROMPT 3 : tri multi-colonnes) ---
// Affiche ↑ (asc) ou ↓ (desc) en TURQUOISE si la colonne est active, gris sinon
const SortIcon = ({ column, sortConfig }) => {
  const isActive = sortConfig.key === column;
  const isAsc = sortConfig.direction === 'asc';
  if (!isActive) return <ArrowUpwardIcon sx={{ fontSize: 10, color: '#777', opacity: 0.5 }} />;
  return isAsc ? <ArrowUpwardIcon sx={{ fontSize: 11, color: TURQUOISE }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: TURQUOISE }} />;
};

// ============================================================
// Couleurs par autorité (chip colored)
// Mapping stable pour distinguer visuellement les autorités émettrices.
// ============================================================
const AUTORITE_COLORS = {
  'MINTSS': { bg: 'rgba(42,106,154,0.12)', color: BLEU },
  'DGSN': { bg: 'rgba(126,63,242,0.10)', color: VIOLET },
  'Ministere Interieur': { bg: 'rgba(11,42,74,0.10)', color: NAVY },
  'Delegation Generale': { bg: 'rgba(184,106,42,0.10)', color: ORANGE },
  'Autre': { bg: 'rgba(107,122,138,0.10)', color: '#6b7a8a' },
};

const getAutoriteStyle = (autorite) => AUTORITE_COLORS[autorite] || AUTORITE_COLORS['Autre'];

export default function SuiviPermisD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fType, setFType] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fAlerte, setFAlerte] = useState('');
  const [fAutorite, setFAutorite] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_expiration', direction: 'asc' });
  const [snack, setSnack] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [newPerm, setNewPerm] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // --- PROMPT 5 : Système d'alertes permis (états) ---
  // configDialog : ouvre/ferme le dialog _Config_Alertes_Permis
  // alerteRecapDialog : { corps, docsAlerte, count, destinataires, objet, dateEnvoi } après envoi
  // alerteConfig : copie locale mutable de CONFIG_ALERTES_PERMIS
  const [configDialog, setConfigDialog] = useState(false);
  const [alerteRecapDialog, setAlerteRecapDialog] = useState(null);
  const [alerteConfig, setAlerteConfig] = useState({ ...CONFIG_ALERTES_PERMIS });

  // --- PROMPT 6 : Exports sécurisés (états) ---
  // auditDialog : booléen — ouvre le rapport d'audit (tous les permis, triés Employé + Date Expiration)
  const [auditDialog, setAuditDialog] = useState(false);

  // --- KPI INTERACTIFS (centre de commande opérationnel) ---
  // kpiDialog : type du KPI cliqué ('total' | 'valides' | 'aRenouveler' | 'expires' | 'tauxConformite' | 'alerte60j') | null
  // kpiSelected : Set des IDs de permis sélectionnés dans le dialog (pour actions groupées)
  const [kpiDialog, setKpiDialog] = useState(null);
  const [kpiSelected, setKpiSelected] = useState(new Set());

  // --- Filtrage (5 critères + tri dynamique) ---
  const filtered = useMemo(() => {
    let result = PERMIS.filter(p => {
      if (search) {
        const emp = findEmployee(p.employee_id);
        const empName = emp ? employeeFullName(emp).toLowerCase() : '';
        const q = search.toLowerCase();
        if (!empName.includes(q) &&
            !p.type_permit?.toLowerCase().includes(q) &&
            !p.numero_permit?.toLowerCase().includes(q) &&
            !p.permit_number?.toLowerCase().includes(q) &&
            !p.autorite?.toLowerCase().includes(q) &&
            !emp?.matricule?.toLowerCase().includes(q)) return false;
      }
      if (fType && p.type_permit !== fType) return false;
      if (fStatut && calculerStatutPermis(p).short !== fStatut) return false;
      if (fAlerte && calculerAlertePermis(p).short !== fAlerte) return false;
      if (fAutorite && p.autorite !== fAutorite) return false;
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
        } else if (sortConfig.key === 'statut' || sortConfig.key === 'alerte') {
          valA = sortConfig.key === 'statut' ? calculerStatutPermis(a).short : calculerAlertePermis(a).short;
          valB = sortConfig.key === 'statut' ? calculerStatutPermis(b).short : calculerAlertePermis(b).short;
        } else if (sortConfig.key === 'numero') {
          valA = PERMIS.indexOf(a);
          valB = PERMIS.indexOf(b);
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
  }, [search, fType, fStatut, fAlerte, fAutorite, sortConfig, refreshKey]);

  // --- Tri dynamique ---
  const handleSort = (key) => {
    setSortConfig(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  // --- Réinitialiser tous les filtres ---
  const handleResetFilters = () => {
    setSearch(''); setFType(''); setFStatut(''); setFAlerte(''); setFAutorite(''); setPage(0);
    setSnack({ msg: 'Filtres réinitialisés', severity: 'info' });
  };

  const activeFilterCount = [search, fType, fStatut, fAlerte, fAutorite].filter(Boolean).length;

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- PROMPT 2 : KPI (NBVAL / NB.SI sur Alerte) — 6 cartes ---
  // Conforme ISO 30414 (Reporting) + ISO 9001 (Pilotage par la performance)
  // Les KPI Expirés et À renouveler utilisent NB.SI sur la colonne Alerte (J),
  // conformément aux formules du PROMPT 2.
  const stats = useMemo(() => {
    const total = PERMIS.length;
    // Comptages par Alerte (col J) — conformes aux formules PROMPT 2
    const expires = PERMIS.filter(p => calculerAlertePermis(p).short === 'Expiré').length; // =NB.SI(Alerte;"🔴 Expiré")
    const aRenouveler = PERMIS.filter(p => calculerAlertePermis(p).short === '<30j').length; // =NB.SI(Alerte;"🟠 <30j")
    const valides = PERMIS.filter(p => calculerStatutPermis(p).short === 'Valide').length; // =NB.SI(Statut;"Valide")
    // Taux de conformité = 1 - (Expirés + À renouveler) / Total
    const tauxConformite = total > 0 ? Math.round((1 - (expires + aRenouveler) / total) * 100) : 0;
    // Alerte <60j (alerte granulaire indépendante du statut)
    const alerte60j = PERMIS.filter(p => calculerAlertePermis(p).short === '<60j').length;
    return { total, expires, aRenouveler, valides, tauxConformite, alerte60j };
  }, [refreshKey]);

  // --- Widget "Prochaines échéances" : 5 permis les plus urgents (non expirés) ---
  // Timeline horizontale avec employé + date + jours restants — UNIQUE au module Permis
  const prochainesEcheances = useMemo(() => {
    return PERMIS
      .filter(p => p.date_expiration && calculerStatutPermis(p).short !== 'Expiré')
      .map(p => {
        const jours = Math.ceil((new Date(p.date_expiration) - new Date()) / (1000 * 60 * 60 * 24));
        return { ...p, joursRestants: jours };
      })
      .sort((a, b) => a.joursRestants - b.joursRestants)
      .slice(0, 5);
  }, [refreshKey]);

  // --- Barre de progression visuelle pour Date Expiration ---
  // Calcule le % de temps écoulé depuis la délivrance jusqu'à l'expiration
  // Retourne { percent, color } pour afficher une barre fine sous la date
  const getProgressionExpiration = (p) => {
    if (!p.date_expiration || !p.date_delivrance) return { percent: 0, color: VERT };
    const delivrance = new Date(p.date_delivrance);
    const expiration = new Date(p.date_expiration);
    const now = new Date();
    const total = expiration - delivrance;
    const ecoule = now - delivrance;
    if (total <= 0) return { percent: 100, color: ROUGE };
    let percent = Math.round((ecoule / total) * 100);
    percent = Math.max(0, Math.min(100, percent));
    const color = percent >= 90 ? ROUGE : percent >= 70 ? ORANGE : VERT;
    return { percent, color };
  };

  // --- PROMPT 4 : Graphiques dynamiques (TCD basés sur T_Permis) ---
  // 3 graphiques : Répartition par type / Statut / Autorité — actualisation auto via refreshKey

  // Graphique 1 : Répartition par type de permis (BarChart horizontal)
  // TCD : Lignes = Type Permis, Valeurs = Comptage de N°
  const chartTypePermisData = useMemo(() => {
    const counts = {};
    PERMIS.forEach(p => {
      const key = p.type_permit || 'Autre';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([type_permit, count]) => ({ type_permit, count }));
  }, [refreshKey]);

  // Graphique 2 : Statut des permis (PieChart donut)
  // TCD : Lignes = Statut (Valide, À renouveler, Expiré), Valeurs = Comptage de N°
  const chartStatutData = useMemo(() => {
    const counts = { 'Valide': 0, 'À renouveler': 0, 'Expiré': 0 };
    PERMIS.forEach(p => {
      const st = calculerStatutPermis(p).short;
      counts[st] = (counts[st] || 0) + 1;
    });
    return [
      { name: 'Valide', value: counts['Valide'], color: VERT },
      { name: 'À renouveler', value: counts['À renouveler'], color: ORANGE },
      { name: 'Expiré', value: counts['Expiré'], color: ROUGE },
    ];
  }, [refreshKey]);

  // Graphique 3 : Répartition par autorité (BarChart vertical)
  // TCD : Lignes = Autorité, Valeurs = Comptage de N°
  const chartAutoriteData = useMemo(() => {
    const counts = {};
    PERMIS.forEach(p => {
      const key = p.autorite || 'Autre';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([autorite, count]) => ({ autorite, count }));
  }, [refreshKey]);

  // Couleurs pour le graphique Type Permis (harmonisées, cohérentes avec les chips du tableau)
  const TYPE_PERMIT_CHART_COLORS = {
    'Permis travail': ORANGE,
    'Carte sejour': TURQUOISE,
    'Visa long sejour': VIOLET,
    'Titre de sejour': NAVY,
    'Autre': '#6b7a8a',
  };

  // --- Export CSV (PROMPT 1 — basique + snackbar) ---
  // --- PROMPT 6 : Export CSV (paramétré + journalisation EXPORTS_LOG) ---
  // data : source des données (défaut = filtered). Permet au rapport d'audit de réutiliser
  //        la même fonction avec auditData (tous les permis, triés).
  // sourceLabel : 'filtrée' | 'audit' — pour le log d'audit.
  const handleExportCSV = (data, sourceLabel = 'filtrée') => {
    const rowsData = data || filtered;
    const headers = [
      'N°', 'Matricule', 'Employé', 'Type Permis', 'N° Permis',
      'Date Délivrance', 'Date Expiration', 'Autorité', 'Statut', 'Alerte',
      'Dernier Contrôle', 'Notes',
    ];
    const rows = rowsData.map(p => {
      const emp = findEmployee(p.employee_id);
      const st = calculerStatutPermis(p);
      const al = calculerAlertePermis(p);
      const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
      return [
        `"${num}"`,
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${p.type_permit || ''}"`,
        `"${p.numero_permit || ''}"`,
        `"${p.date_delivrance || ''}"`,
        `"${p.date_expiration || ''}"`,
        `"${p.autorite || ''}"`,
        `"${st.short}"`,
        `"${al.short}"`,
        `"${p.dernier_controle || ''}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const suffix = sourceLabel === 'audit' ? '_audit' : '';
    const filename = `donnees-permis${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${rowsData.length} enregistrement(s) exporté(s)`, severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: sourceLabel === 'audit' ? 'export_audit' : 'export_csv',
      filename,
      nb_lignes: rowsData.length,
      statut: 'succès',
      user: 'DRH',
    });
    PERMIS_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: sourceLabel === 'audit' ? 'export_audit' : 'export_csv',
      permis_id: null,
      employee_id: null,
      nb_lignes: rowsData.length,
      user: 'DRH',
    });
  };

  // ============================================================
  // PROMPT 6 : Export PDF — vue filtrée avec mise en page professionnelle
  // Ouvre une nouvelle fenêtre avec un HTML imprimable, filtres appliqués,
  // en-tête personnalisé (Admina-RH + date), N° Permis non masqué (pas sensible RGPD).
  // data : source (défaut = filtered). Le rapport d'audit appelle avec auditData.
  // ============================================================
  const handleExportPDF = (data) => {
    const rowsData = data || filtered;
    const dateStr = new Date().toLocaleString('fr-FR');
    const filename = `Export_Permis_PDF_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filtresActifs = [];
    if (search) filtresActifs.push(`Recherche: "${search}"`);
    if (fType) filtresActifs.push(`Type: ${fType}`);
    if (fStatut) filtresActifs.push(`Statut: ${fStatut}`);
    if (fAlerte) filtresActifs.push(`Alerte: ${fAlerte}`);
    if (fAutorite) filtresActifs.push(`Autorité: ${fAutorite}`);
    const isAudit = Boolean(data);
    const filtresHTML = isAudit
      ? `<div class="filters"><strong>Source :</strong> <span class="filter-chip">Rapport d'audit — tous les permis (triés par Employé + Date Expiration)</span></div>`
      : (filtresActifs.length > 0
        ? `<div class="filters"><strong>Filtres appliqués :</strong> ${filtresActifs.map(f => `<span class="filter-chip">${f}</span>`).join('')}</div>`
        : `<div class="filters"><strong>Filtres :</strong> <span class="filter-chip">Aucun (tous les permis)</span></div>`);

    const rowsHTML = rowsData.map(p => {
      const emp = findEmployee(p.employee_id);
      const st = calculerStatutPermis(p);
      const al = calculerAlertePermis(p);
      const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
      const isAnomalie = al.short === 'Expiré' || al.short === '<30j';
      const rowClass = isAnomalie ? 'row-anomalie' : '';
      const typeIcon = TYPE_PERMIT_ICONS[p.type_permit]?.emoji || '📋';
      return `<tr class="${rowClass}">
        <td>${num}</td>
        <td>${emp?.matricule || '—'}</td>
        <td>${emp ? employeeFullName(emp) : 'Non trouvé'}</td>
        <td>${typeIcon} ${p.type_permit || '—'}</td>
        <td>${p.numero_permit || '—'}</td>
        <td>${p.date_delivrance ? formatDate(p.date_delivrance) : '—'}</td>
        <td>${p.date_expiration ? formatDate(p.date_expiration) : 'Permanent'}</td>
        <td>${p.autorite || '—'}</td>
        <td>${st.short}</td>
        <td>${al.short}</td>
      </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Autorisations & Permis — Export PDF</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2a3a; font-size: 11px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 18px; margin: 0; color: #0b2a4a; }
  .header .meta { text-align: right; font-size: 10px; color: #6b7a8a; }
  .filters { background: #f0f7ff; border: 1px solid #0ea5e930; border-radius: 4px; padding: 8px 10px; margin-bottom: 12px; font-size: 10px; }
  .filter-chip { display: inline-block; background: rgba(14,165,233,0.1); color: #0284c7; padding: 2px 8px; border-radius: 10px; margin-right: 6px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #2c3e50; color: #fff; padding: 6px 5px; text-align: left; font-weight: 700; border: 1px solid #2c3e50; }
  td { padding: 5px 5px; border: 1px solid #d6dde6; vertical-align: middle; }
  tr:nth-child(even) td { background: #fafbfc; }
  .row-anomalie td { background: #ffe5e8 !important; color: #b33a4a; font-weight: 600; }
  .footer { margin-top: 14px; font-size: 9px; color: #9aa8b8; border-top: 1px solid #e9edf2; padding-top: 6px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🪪 Autorisations & Permis — ${isAudit ? 'Rapport Audit' : 'Export PDF'}</h1>
      <div style="font-size: 10px; color: #6b7a8a; margin-top: 2px;">Tableau structuré T_Permis — Domaine 2 (Administration Personnel)</div>
    </div>
    <div class="meta">
      <div><strong>Date :</strong> ${dateStr}</div>
      <div><strong>Nombre :</strong> ${rowsData.length} enregistrement(s)</div>
      <div><strong>Édité par :</strong> DRH</div>
    </div>
  </div>
  ${filtresHTML}
  <table>
    <thead>
      <tr>
        <th>N°</th>
        <th>Matricule</th>
        <th>Employé</th>
        <th>Type Permis</th>
        <th>N° Permis</th>
        <th>Délivrance</th>
        <th>Expiration</th>
        <th>Autorité</th>
        <th>Statut</th>
        <th>Alerte</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML || '<tr><td colspan="10" style="text-align:center;padding:20px;color:#9aa8b8">Aucun enregistrement à exporter</td></tr>'}
    </tbody>
  </table>
  <div class="footer">
    Document généré automatiquement par Admina-RH · Conforme ISO 30401:2018 (traçabilité des exports).
    Audit trail : PERMIS_AUDIT_TRAIL · EXPORTS_LOG.
  </div>
  <script>
    setTimeout(function() { window.print(); }, 350);
  </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      setSnack({ msg: "Impossible d'ouvrir la fenêtre d'impression (vérifiez le bloqueur de pop-ups)", severity: 'warning' });
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setSnack({ msg: `📄 Export PDF généré (${rowsData.length} enregistrement(s))`, severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: isAudit ? 'export_audit' : 'export_pdf',
      filename,
      nb_lignes: rowsData.length,
      statut: 'succès',
      user: 'DRH',
    });
    PERMIS_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: isAudit ? 'export_audit' : 'export_pdf',
      permis_id: null,
      employee_id: null,
      nb_lignes: rowsData.length,
      user: 'DRH',
    });
  };

  // --- Création ---
  const handleCreate = () => {
    if (!newPerm.employee_id) { setSnack({ msg: 'Veuillez sélectionner un employé', severity: 'warning' }); return; }
    const num = `PERM-${String(PERMIS.length + 1).padStart(3, '0')}`;
    PERMIS.push({
      id: `prm-${Date.now()}`,
      employee_id: newPerm.employee_id,
      permit_number: newPerm.numero_permit || newPerm.permit_number || '',
      type_permit: newPerm.type_permit || '',
      numero_permit: newPerm.numero_permit || '',
      date_delivrance: newPerm.date_delivrance || '',
      date_expiration: newPerm.date_expiration || '',
      autorite: newPerm.autorite || '',
      statut: '',
      dernier_controle: new Date().toISOString().slice(0, 10),
      notes: newPerm.notes || '',
    });
    setCreateDialog(false);
    setNewPerm({});
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Enregistrement ${num} créé`, severity: 'success' });
  };

  // --- Édition (MAJ dernier_controle = aujourd'hui par défaut) ---
  const handleSaveEdit = () => {
    if (!editDialog) return;
    const idx = PERMIS.findIndex(p => p.id === editDialog.id);
    if (idx !== -1) {
      const now = new Date().toISOString().slice(0, 10);
      PERMIS[idx] = {
        ...PERMIS[idx],
        ...editDialog,
        numero_permit: editDialog.numero_permit || '',
        permit_number: editDialog.numero_permit || editDialog.permit_number || '',
        dernier_controle: editDialog.dernier_controle || now,
      };
    }
    setEditDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: 'Donnée permis modifiée', severity: 'success' });
  };

  // --- Navigation vers fiche employé ---
  const handleVoirFiche = (employeeId) => {
    navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${employeeId}`);
  };

  // --- PROMPT 5 : Comptage des anomalies pour le bandeau d'alertes ---
  // totalAnomalies = PERMIS dont l'Alerte (J) !== 'OK'
  // expires + aRenouveler extraits pour le sub-text du bandeau.
  const alerteStats = useMemo(() => {
    let total = 0, expires = 0, aRenouveler = 0;
    PERMIS.forEach(p => {
      const al = calculerAlertePermis(p);
      if (al.short !== 'OK') total++;
      if (al.short === 'Expiré') expires++;
      if (al.short === '<30j') aRenouveler++;
    });
    return { total, expires, aRenouveler };
  }, [refreshKey]);

  // --- PROMPT 6 : Données triées pour le rapport d'audit (tous les permis) ---
  // Tri par Nom Employé puis par Date Expiration (indépendant des filtres du tableau principal).
  const auditData = useMemo(() => {
    return [...PERMIS].sort((a, b) => {
      const eA = findEmployee(a.employee_id);
      const eB = findEmployee(b.employee_id);
      const nameA = eA ? employeeFullName(eA) : '';
      const nameB = eB ? employeeFullName(eB) : '';
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      return (a.date_expiration || '').localeCompare(b.date_expiration || '');
    });
  }, [refreshKey]);

  // --- PROMPT 6 : Stats pour le rapport d'audit (3 chips : Anomalies / À renouveler / OK) ---
  const auditStats = useMemo(() => {
    let anomalies = 0, aRenouveler = 0, ok = 0;
    PERMIS.forEach(p => {
      const al = calculerAlertePermis(p);
      if (al.short === 'OK') ok++;
      else if (al.short === 'Expiré') anomalies++;
      else aRenouveler++;
    });
    return { anomalies, aRenouveler, ok, total: PERMIS.length };
  }, [refreshKey]);

  // --- KPI INTERACTIFS : données filtrées selon le type de KPI cliqué ---
  // Chaque KPI ouvre un dialog avec la liste des permis correspondantes + actions.
  const kpiData = useMemo(() => {
    if (!kpiDialog) return null;
    let data = [];
    let title = '';
    let icon = null;
    let color = TURQUOISE;
    let actions = [];
    switch (kpiDialog) {
      case 'total':
        data = [...PERMIS];
        title = `Liste des permis (${stats.total})`;
        icon = <BadgeIcon sx={{ color: TURQUOISE }} />;
        color = TURQUOISE;
        actions = ['ajouter', 'exportCSV', 'modifier', 'voirFiche'];
        break;
      case 'valides':
        data = PERMIS.filter(p => calculerStatutPermis(p).short === 'Valide');
        title = `Permis valides (${stats.valides})`;
        icon = <CheckCircleIcon sx={{ color: VERT }} />;
        color = VERT;
        actions = ['modifier', 'exportCSV', 'voirFiche'];
        break;
      case 'aRenouveler':
        data = PERMIS.filter(p => calculerStatutPermis(p).short === 'À renouveler');
        title = `Permis à renouveler (${stats.aRenouveler})`;
        icon = <AutorenewIcon sx={{ color: ORANGE }} />;
        color = ORANGE;
        actions = ['renouvelerSelection', 'renouvelerTout', 'exportCSV'];
        break;
      case 'expires':
        data = PERMIS.filter(p => calculerStatutPermis(p).short === 'Expiré');
        title = `Permis expirés (${stats.expires})`;
        icon = <WarningAmberIcon sx={{ color: ROUGE }} />;
        color = ROUGE;
        actions = ['renouvelerSelection', 'renouvelerTout', 'exportCSV'];
        break;
      case 'tauxConformite':
        data = [...PERMIS];
        title = `Taux de conformité — ${stats.tauxConformite}%`;
        icon = <AssessmentIcon sx={{ color: stats.tauxConformite >= 90 ? VERT : stats.tauxConformite >= 70 ? ORANGE : ROUGE }} />;
        color = stats.tauxConformite >= 90 ? VERT : stats.tauxConformite >= 70 ? ORANGE : ROUGE;
        actions = [];
        break;
      case 'alerte60j':
        data = PERMIS.filter(p => calculerAlertePermis(p).short === '<60j');
        title = `Permis <60j (${stats.alerte60j})`;
        icon = <FilterListIcon sx={{ color: JAUNE }} />;
        color = JAUNE;
        actions = ['renouvelerSelection', 'renouvelerTout', 'exportCSV'];
        break;
      default:
        return null;
    }
    return { data, title, icon, color, actions };
  }, [kpiDialog, refreshKey, stats]);

  // --- PROMPT 5 : Renouveler le permis (intelligent selon le type) ---
  // Macro RenouvelerPermis : prolonge la date d'expiration selon DUREES_VALIDITE_PERMIS :
  // CNI → +10 ans · Passeport → +5 ans · Permis travail → +2 ans · Carte séjour → +1 an · Autre → +1 an
  // Met à jour dernier_controle à aujourd'hui + audit trail + refreshKey.
  const handleRenouvelerPermis = (p) => {
    const idx = PERMIS.findIndex(x => x.id === p.id);
    if (idx === -1) return;
    const now = new Date().toISOString().slice(0, 10);
    const dureeAns = DUREES_VALIDITE_PERMIS[p.type_permit] || 1;
    let nouvelleDate;
    let message;
    if (!p.date_expiration) {
      // Aucune date d'expiration — on définit aujourd'hui + durée
      const d = new Date();
      d.setFullYear(d.getFullYear() + dureeAns);
      nouvelleDate = d.toISOString().slice(0, 10);
      message = `Date d'expiration définie au ${formatDate(nouvelleDate)} (+${dureeAns} an${dureeAns > 1 ? 's' : ''})`;
    } else {
      // Date existante — on ajoute la durée selon le type
      const d = new Date(p.date_expiration);
      d.setFullYear(d.getFullYear() + dureeAns);
      nouvelleDate = d.toISOString().slice(0, 10);
      message = `Permis renouvelé jusqu'au ${formatDate(nouvelleDate)} (+${dureeAns} an${dureeAns > 1 ? 's' : ''} — ${p.type_permit})`;
    }
    PERMIS[idx] = {
      ...PERMIS[idx],
      date_expiration: nouvelleDate,
      dernier_controle: now,
    };
    setRefreshKey(k => k + 1);
    setSnack({ msg: message, severity: 'success' });
    PERMIS_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'renouveler_permis',
      permis_id: p.id,
      employee_id: p.employee_id,
      user: 'DRH',
      details: `Type: ${p.type_permit} · +${dureeAns} an(s) · Nouvelle échéance: ${formatDate(nouvelleDate)}`,
    });
  };

  // --- PROMPT 5 : Envoyer les rappels permis maintenant ---
  // Génère le corps de l'email via genererCorpsEmailPermis, met à jour dernier_controle
  // de chaque permis en anomalie, ouvre le dialog récapitulatif.
  const handleSendRappels = () => {
    if (!alerteConfig.activer) {
      setSnack({ msg: 'Les alertes sont désactivées. Activez-les dans la configuration.', severity: 'warning' });
      return;
    }
    if (!alerteConfig.destinataires?.trim()) {
      setSnack({ msg: 'Aucun destinataire configuré. Ajoutez des emails dans la configuration.', severity: 'warning' });
      return;
    }
    const recap = genererCorpsEmailPermis(PERMIS);
    if (!recap) {
      setSnack({ msg: 'Aucune anomalie permis détectée. Aucun email envoyé.', severity: 'info' });
      return;
    }
    // Met à jour dernier_controle (col K) pour chaque permis en anomalie
    const now = new Date().toISOString().slice(0, 10);
    recap.docsAlerte.forEach(p => {
      const idx = PERMIS.findIndex(x => x.id === p.id);
      if (idx !== -1) {
        PERMIS[idx].dernier_controle = now;
      }
    });
    // Met à jour derniere_execution dans CONFIG
    CONFIG_ALERTES_PERMIS.derniere_execution = now;
    setAlerteConfig({ ...CONFIG_ALERTES_PERMIS });
    // Audit trail
    ALERTES_PERMIS_HISTORIQUE.push({
      timestamp: new Date().toISOString(),
      destinataires: alerteConfig.destinataires,
      nb_anomalies: recap.count,
      permis: recap.docsAlerte.map(p => p.id),
      objet: alerteConfig.objet_email,
      corps: recap.corps,
    });
    setAlerteRecapDialog({
      corps: recap.corps,
      docsAlerte: recap.docsAlerte,
      count: recap.count,
      destinataires: alerteConfig.destinataires,
      objet: alerteConfig.objet_email,
      dateEnvoi: now,
    });
    setRefreshKey(k => k + 1);
    setSnack({ msg: `✉ ${recap.count} rappel(s) envoyé(s) à ${alerteConfig.destinataires}`, severity: 'success' });
  };

  // --- PROMPT 5 : Sauvegarder la configuration des alertes permis ---
  const handleSaveConfig = () => {
    CONFIG_ALERTES_PERMIS.destinataires = alerteConfig.destinataires;
    CONFIG_ALERTES_PERMIS.frequence_jours = alerteConfig.frequence_jours;
    CONFIG_ALERTES_PERMIS.activer = alerteConfig.activer;
    CONFIG_ALERTES_PERMIS.objet_email = alerteConfig.objet_email;
    setConfigDialog(false);
    setSnack({ msg: 'Configuration des alertes permis enregistrée', severity: 'success' });
  };

  // --- PROMPT 5 : Ouvrir le client mail avec mailto ---
  const handleOpenMailto = () => {
    if (!alerteRecapDialog) return;
    const { destinataires, objet, corps } = alerteRecapDialog;
    const mailto = `mailto:${destinataires}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
    window.location.href = mailto;
    setSnack({ msg: 'Client email ouvert (mailto)', severity: 'info' });
  };

  // --- KPI INTERACTIFS : handlers pour le dialog contextuel ---
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
    if (kpiSelected.size === kpiData.data.length) {
      setKpiSelected(new Set());
    } else {
      setKpiSelected(new Set(kpiData.data.map(p => p.id)));
    }
  };

  const handleRenouvelerSelectionKpi = () => {
    if (kpiSelected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins un permis', severity: 'warning' });
      return;
    }
    let count = 0;
    kpiSelected.forEach(id => {
      const idx = PERMIS.findIndex(x => x.id === id);
      if (idx !== -1) {
        const now = new Date().toISOString().slice(0, 10);
        const p = PERMIS[idx];
        const dureeAns = DUREES_VALIDITE_PERMIS[p.type_permit] || 1;
        let nouvelleDate;
        if (!p.date_expiration) {
          const d = new Date();
          d.setFullYear(d.getFullYear() + dureeAns);
          nouvelleDate = d.toISOString().slice(0, 10);
        } else {
          const d = new Date(p.date_expiration);
          d.setFullYear(d.getFullYear() + dureeAns);
          nouvelleDate = d.toISOString().slice(0, 10);
        }
        PERMIS[idx] = { ...PERMIS[idx], date_expiration: nouvelleDate, dernier_controle: now };
        count++;
        PERMIS_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'renouveler_permis',
          permis_id: p.id,
          employee_id: p.employee_id,
          user: 'DRH',
          details: `Renouvellement groupé depuis KPI dialog — Type: ${p.type_permit} · +${dureeAns} an(s) · Nouvelle échéance: ${formatDate(nouvelleDate)}`,
        });
      }
    });
    setKpiSelected(new Set());
    setRefreshKey(k => k + 1);
    setSnack({ msg: `🔄 ${count} permis renouvelé(s) avec succès`, severity: 'success' });
  };

  const handleRenouvelerToutKpi = () => {
    if (!kpiData || kpiData.data.length === 0) return;
    let count = 0;
    kpiData.data.forEach(p => {
      const idx = PERMIS.findIndex(x => x.id === p.id);
      if (idx !== -1) {
        const now = new Date().toISOString().slice(0, 10);
        const dureeAns = DUREES_VALIDITE_PERMIS[p.type_permit] || 1;
        let nouvelleDate;
        if (!p.date_expiration) {
          const d = new Date();
          d.setFullYear(d.getFullYear() + dureeAns);
          nouvelleDate = d.toISOString().slice(0, 10);
        } else {
          const d = new Date(p.date_expiration);
          d.setFullYear(d.getFullYear() + dureeAns);
          nouvelleDate = d.toISOString().slice(0, 10);
        }
        PERMIS[idx] = { ...PERMIS[idx], date_expiration: nouvelleDate, dernier_controle: now };
        count++;
        PERMIS_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'renouveler_permis',
          permis_id: p.id,
          employee_id: p.employee_id,
          user: 'DRH',
          details: `Renouvellement en masse (bouton "Renouveler tout") — Type: ${p.type_permit} · +${dureeAns} an(s) · Nouvelle échéance: ${formatDate(nouvelleDate)}`,
        });
      }
    });
    setKpiSelected(new Set());
    setRefreshKey(k => k + 1);
    setSnack({ msg: `🔄 ${count} permis renouvelé(s) en masse`, severity: 'success' });
    if (kpiDialog === 'expires' || kpiDialog === 'aRenouveler' || kpiDialog === 'alerte60j') {
      setTimeout(() => setKpiDialog(null), 800);
    }
  };

  // --- Couleur dynamique du taux de conformité ---
  const tauxColor = stats.tauxConformite >= 90 ? VERT : stats.tauxConformite >= 70 ? ORANGE : ROUGE;
  const tauxChip = stats.tauxConformite >= 90 ? 'OK' : stats.tauxConformite >= 70 ? 'Attention' : 'Critique';

  return (
    <Box>
      {/* === DESIGN DISTINCTIF — KPI HORIZONTAUX + JAUGE CIRCULAIRE === */}
      {/* Layout horizontal (icône à gauche + chiffre à droite) au lieu des cartes verticales Mutuelle */}
      {/* Thème TURQUOISE (#0ea5e9) au lieu du VIOLET Mutuelle */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f0f7ff', pt: 1.5, pb: 1.5, mb: 2, borderBottom: `2px solid ${TURQUOISE}40` }}>
        <Grid container spacing={1.5} alignItems='stretch'>
          {/* 5 KPI compacts horizontaux (gauche) */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={1}>
              {/* 1. Total permis — TURQUOISE → Liste complète + Ajouter/Exporter */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Tooltip title='Cliquer pour voir la liste des permis + actions' placement='top'>
                <Box onClick={() => handleOpenKpi('total')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, borderLeft: `3px solid ${TURQUOISE}`, boxShadow: '0 2px 8px rgba(14,165,233,0.08)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(14,165,233,0.18)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: TURQUOISE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>🎫</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ color: TURQUOISE, fontSize: '1.5rem', lineHeight: 1 }}>{stats.total}</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#555', display: 'block', fontWeight: 600 }}>Total permis</Typography>
                  </Box>
                </Box>
                </Tooltip>
              </Grid>
              {/* 2. Valides — VERT → Liste + Modifier/Consulter */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Tooltip title='Cliquer pour voir les permis valides' placement='top'>
                <Box onClick={() => handleOpenKpi('valides')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, borderLeft: `3px solid ${VERT}`, boxShadow: '0 2px 8px rgba(26,122,74,0.08)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(26,122,74,0.18)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>✅</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ color: VERT, fontSize: '1.5rem', lineHeight: 1 }}>{stats.valides}</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#555', display: 'block', fontWeight: 600 }}>Valides</Typography>
                  </Box>
                </Box>
                </Tooltip>
              </Grid>
              {/* 3. À renouveler — ORANGE → Liste + Renouveler sélection/tout */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Tooltip title='Cliquer pour voir les permis à renouveler + actions' placement='top'>
                <Box onClick={() => handleOpenKpi('aRenouveler')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, borderLeft: `3px solid ${ORANGE}`, boxShadow: '0 2px 8px rgba(184,106,42,0.08)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(184,106,42,0.18)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>⏰</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ color: ORANGE, fontSize: '1.5rem', lineHeight: 1 }}>{stats.aRenouveler}</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#555', display: 'block', fontWeight: 600 }}>À renouv. &lt;30j</Typography>
                  </Box>
                </Box>
                </Tooltip>
              </Grid>
              {/* 4. Expirés — ROUGE → Liste + Renouveler en masse */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Tooltip title='Cliquer pour voir les permis expirés + renouveler' placement='top'>
                <Box onClick={() => handleOpenKpi('expires')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, borderLeft: `3px solid ${ROUGE}`, boxShadow: '0 2px 8px rgba(179,58,74,0.08)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(179,58,74,0.18)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: ROUGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>⚠️</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.5rem', lineHeight: 1 }}>{stats.expires}</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#555', display: 'block', fontWeight: 600 }}>Expirés</Typography>
                  </Box>
                </Box>
                </Tooltip>
              </Grid>
              {/* 5. <60j — JAUNE → Liste + Renouveler */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Tooltip title='Cliquer pour voir les permis <60j' placement='top'>
                <Box onClick={() => handleOpenKpi('alerte60j')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, borderLeft: `3px solid ${JAUNE}`, boxShadow: '0 2px 8px rgba(212,160,23,0.08)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(212,160,23,0.18)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: JAUNE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>🟡</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ color: JAUNE, fontSize: '1.5rem', lineHeight: 1 }}>{stats.alerte60j}</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#555', display: 'block', fontWeight: 600 }}>&lt;60j vigilance</Typography>
                  </Box>
                </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          {/* JAUGE CIRCULAIRE Taux conformité (droite) — cliquable → breakdown + actions d'amélioration */}
          <Grid item xs={12} md={4}>
            <Tooltip title='Cliquer pour voir le détail du taux de conformité' placement='top'>
            <Box onClick={() => handleOpenKpi('tauxConformite')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%', border: `1px solid ${tauxColor}30`, cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: `0 8px 24px ${stats.tauxConformite >= 90 ? 'rgba(26,122,74,0.18)' : stats.tauxConformite >= 70 ? 'rgba(184,106,42,0.18)' : 'rgba(179,58,74,0.18)'}`, transform: 'translateY(-2px)' } }}>
              {/* Jauge circulaire SVG */}
              <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                <svg width='64' height='64' viewBox='0 0 64 64'>
                  <circle cx='32' cy='32' r='28' fill='none' stroke='#e9edf2' strokeWidth='6' />
                  <circle
                    cx='32' cy='32' r='28' fill='none' stroke={tauxColor} strokeWidth='6' strokeLinecap='round'
                    strokeDasharray={`${2 * Math.PI * 28 * stats.tauxConformite / 100} ${2 * Math.PI * 28}`}
                    transform='rotate(-90 32 32)'
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Typography variant='caption' fontWeight={800} sx={{ color: tauxColor, fontSize: '0.9rem', lineHeight: 1 }}>{stats.tauxConformite}%</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Taux conformité</Typography>
                <Typography variant='body2' fontWeight={700} sx={{ color: tauxColor, fontSize: '0.85rem' }}>
                  {stats.tauxConformite >= 90 ? '🟢 Excellent' : stats.tauxConformite >= 70 ? '🟠 Moyen' : '🔴 Critique'}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=1-(Exp+Renouv)/Total</Typography>
              </Box>
            </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* === WIDGET "PROCHAINES ÉCHÉANCES" — UNIQUE au module Permis === */}
      {/* Timeline horizontale des 5 permis les plus urgents (non expirés) */}
      {prochainesEcheances.length > 0 && (
        <Card variant='outlined' sx={{ mb: 2, border: `1px solid ${TURQUOISE}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(255,255,255,0.8) 100%)` }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
              <ScheduleIcon sx={{ fontSize: 18, color: TURQUOISE }} />
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                ⏰ Prochaines échéances ({prochainesEcheances.length})
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                — Top 5 permis à renouveler en priorité
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {prochainesEcheances.map((p, i) => {
                const emp = findEmployee(p.employee_id);
                const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                const typeIcon = TYPE_PERMIT_ICONS[p.type_permit]?.emoji || '📋';
                const urgencyColor = p.joursRestants <= 30 ? ROUGE : p.joursRestants <= 60 ? ORANGE : VERT;
                return (
                  <Box key={p.id} sx={{ flex: 1, p: 1, bgcolor: '#fff', borderRadius: 1.5, border: `1px solid ${urgencyColor}25`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: urgencyColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
                      {i + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.68rem', fontWeight: 700, color: NAVY, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeIcon} {empName}
                      </Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8' }}>
                        {formatDate(p.date_expiration)}
                      </Typography>
                    </Box>
                    <Chip
                      label={p.joursRestants <= 0 ? 'Expiré' : `${p.joursRestants}j`}
                      size='small'
                      sx={{ fontSize: '0.55rem', height: 16, bgcolor: `${urgencyColor}15`, color: urgencyColor, fontWeight: 700, flexShrink: 0 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem', bgcolor: `${TURQUOISE}08`, borderColor: `${TURQUOISE}30` }}>
        <strong>📌 Tableau structuré T_Permis</strong> — 13 colonnes (A-M) avec auto-remplissage Employé (RECHERCHEX C), Statut (SI imbriquée I) et Alerte granulaire (J). Colonnes <LockIcon sx={{ fontSize: 11, verticalAlign: 'middle' }} /> protégées (lecture seule). Conforme ISO 30408/30400/30414.
      </Alert>

      {/* === PROMPT 4 : GRAPHIQUES DYNAMIQUES (3 TCD basés sur T_Permis) === */}
      {/* Conforme ISO 30414 (reporting visuel) + ISO 30408 (aide à la décision) */}
      {/* Actualisation automatique via refreshKey (ajout/modification déclenche le re-render) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Graphique 1 : Répartition par type de permis (BarChart horizontal) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition par type
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Type Permis · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={chartTypePermisData} layout='vertical' margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis type='number' tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <YAxis type='category' dataKey='type_permit' tick={{ fontSize: 9, fill: '#6b7a8a' }} width={110} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: `${TURQUOISE}08` }}
                    />
                    <Bar dataKey='count' name='Permis' radius={[0, 4, 4, 0]}>
                      {chartTypePermisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_PERMIT_CHART_COLORS[entry.type_permit] || '#95a5a6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 2 : Statut des permis (PieChart donut) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutSmallIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Statut des permis
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Statut · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartStatutData}
                      cx='50%'
                      cy='50%'
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#6b7a8a', strokeWidth: 0.5 }}
                      style={{ fontSize: '0.62rem' }}
                    >
                      {chartStatutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 3 : Répartition par autorité (BarChart vertical) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${TURQUOISE}25`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <AccountBalanceIcon sx={{ fontSize: 18, color: TURQUOISE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Par autorité émettrice
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Autorité · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={chartAutoriteData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='autorite' tick={{ fontSize: 9, fill: '#6b7a8a' }} interval={0} angle={-15} textAnchor='end' height={50} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${TURQUOISE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: `${TURQUOISE}08` }}
                    />
                    <Bar dataKey='count' name='Permis' radius={[4, 4, 0, 0]}>
                      {chartAutoriteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TURQUOISE} fillOpacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <SectionHeader
            title='Autorisations & Permis (T_Permis)'
            subtitle={`${filtered.length} permis · RECHERCHEX employé · Statut + Alerte auto · 4 autorités`}
            action={<Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={() => handleExportCSV()} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
              {/* PROMPT 6 : 2 nouveaux exports sécurisés (PDF + Audit) */}
              <Tooltip title='Export PDF imprimable — vue filtrée avec mise en page professionnelle'>
                <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={() => handleExportPDF()} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VERT, borderColor: VERT }}>Export PDF</Button>
              </Tooltip>
              <Tooltip title="Rapport d'audit global (tous les permis, triés par employé + date expiration)">
                <Button variant='outlined' size='small' startIcon={<AssessmentIcon />} onClick={() => setAuditDialog(true)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: TURQUOISE_DARK, borderColor: TURQUOISE }}>Rapport Audit</Button>
              </Tooltip>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewPerm({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>Nouveau permis</Button>
            </Stack>}
          />

          {/* PROMPT 3 : Filtres dynamiques (5 critères + tri + réinitialiser) — style TURQUOISE */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2, alignItems: { md: 'center' }, p: 1.5, bgcolor: `${TURQUOISE}06`, borderRadius: 1.5, border: `1px solid ${TURQUOISE}20` }}>
            <TextField
              size='small' placeholder='Rechercher (nom, n° permis, type, autorité)...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: TURQUOISE }} /></InputAdornment>,
                endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
              }}
              sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.8rem' }, '& .Mui-focused .MuiInputAdornment-root svg': { color: TURQUOISE } }}
            />
            <TextField select size='small' label='Type Permis' value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }} sx={{ minWidth: 160, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_permit.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 140, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Tous</MenuItem>
              <MenuItem value='Valide'>🟢 Valide</MenuItem>
              <MenuItem value='À renouveler'>🟠 À renouveler</MenuItem>
              <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
            </TextField>
            <TextField select size='small' label='Alerte' value={fAlerte} onChange={(e) => { setFAlerte(e.target.value); setPage(0); }} sx={{ minWidth: 150, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Toutes</MenuItem>
              <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
              <MenuItem value='&lt;30j'>🟠 &lt;30j</MenuItem>
              <MenuItem value='&lt;60j'>🟡 &lt;60j</MenuItem>
              <MenuItem value='OK'>🟢 OK</MenuItem>
            </TextField>
            <TextField select size='small' label='Autorité' value={fAutorite} onChange={(e) => { setFAutorite(e.target.value); setPage(0); }} sx={{ minWidth: 170, '& .MuiInputLabel-root.Mui-focused': { color: TURQUOISE }, '& .MuiInput-root:after': { borderColor: TURQUOISE } }}>
              <MenuItem value=''>Toutes</MenuItem>
              {NOMENCLATURES.autorite.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            {activeFilterCount > 0 && (
              <Button size='small' startIcon={<ClearIcon sx={{ fontSize: 14 }} />} onClick={handleResetFilters} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE, flexShrink: 0 }}>
                Réinitialiser
              </Button>
            )}
          </Stack>

          {/* Compteur dynamique + formule FILTRE + chip filtres actifs — style TURQUOISE */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, px: 1 }} justifyContent='space-between'>
            <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap' useFlexGap>
              <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>
                <strong style={{ color: NAVY, fontSize: '0.95rem' }}>{filtered.length}</strong> permis affiché(s) sur {PERMIS.length}
              </Typography>
              <Chip label={`=NBVAL(Plage_Filtrée) = ${filtered.length}`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: `${TURQUOISE}15`, color: TURQUOISE_DARK, fontFamily: 'monospace', fontWeight: 700 }} />
              {activeFilterCount > 0 && (
                <Chip icon={<FilterListIcon sx={{ fontSize: 12 }} />} label={`${activeFilterCount} filtre(s) actif(s)`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: `${TURQUOISE}25`, color: TURQUOISE_DARK, fontWeight: 700 }} />
              )}
              {sortConfig.key && (
                <Chip label={`Tri: ${sortConfig.key} (${sortConfig.direction === 'asc' ? '↑' : '↓'})`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(11,42,74,0.08)', color: NAVY, fontWeight: 600 }} />
              )}
              {filtered.length === 0 && (
                <Chip label='Aucun permis trouvé — SIERREUR(FILTRE(...))' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
              )}
            </Stack>
            <Tooltip title='Formule Excel FILTRE multi-critères — PROMPT 3'>
              <Box sx={{ p: 0.8, bgcolor: `${TURQUOISE}08`, borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.52rem', color: TURQUOISE_DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', md: 550 } }}>
                {'=SIERREUR(FILTRE(T_Permis[#Tout]; (SI(ESTVIDE(B1);VRAI;Type_Permis=B1)) * (SI(ESTVIDE(C1);VRAI;Statut=C1)) * (SI(ESTVIDE(D1);VRAI;Autorite=D1)) * (SI(ESTVIDE(E1);VRAI;ESTNUM(CHERCHE(E1;Employe&N_Permis&Type_Permis&Autorite))))); "Aucun permis trouvé")'}
              </Box>
            </Tooltip>
          </Stack>

          {/* Tableau T_Permis — en-têtes foncées + lignes alternées */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, overflowX: 'auto', maxWidth: '100%', '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#c1c9d4', borderRadius: 4 } }}>
            <Table size='small' stickyHeader sx={{ '& .MuiTableCell-head': { bgcolor: '#2c3e50', color: '#fff', fontWeight: 700, fontSize: '0.68rem', borderBottom: '2px solid #1a2a3a', whiteSpace: 'nowrap' }, tableLayout: 'auto' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2c3e50' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>A</Box>N°<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('numero')}><SortIcon column='numero' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>B</Box>Matricule</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>C</Box>Employé<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('employee')}><SortIcon column='employee' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>D</Box>Type Permis<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('type_permit')}><SortIcon column='type_permit' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>E</Box>N° Permis</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>F</Box>Date Délivrance</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>G</Box>Date Expiration<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('date_expiration')}><SortIcon column='date_expiration' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>H</Box>Autorité</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>I</Box>Statut<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('statut')}><SortIcon column='statut' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>J</Box>Alerte<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('alerte')}><SortIcon column='alerte' sortConfig={sortConfig} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>K</Box>Dernier Contrôle</Stack></TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center' justifyContent='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>L</Box>Actions</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>M</Box>Notes</Stack></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((p, idx) => {
                  const emp = findEmployee(p.employee_id);
                  const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                  const statut = calculerStatutPermis(p);
                  const alerte = calculerAlertePermis(p);
                  const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
                  const typeStyle = getTypePermitStyle(p.type_permit);
                  const autoriteStyle = getAutoriteStyle(p.autorite);
                  const isExpiré = statut.short === 'Expiré';
                  const isARenouveler = statut.short === 'À renouveler';
                  return (
                    <TableRow key={p.id} hover sx={{
                      bgcolor: isExpiré ? 'rgba(179,58,74,0.05)' :
                               isARenouveler ? 'rgba(184,106,42,0.05)' :
                               idx % 2 === 0 ? '#f8f9fa' : '#fff',
                      '&:hover': {
                        bgcolor: isExpiré ? 'rgba(179,58,74,0.10)' :
                                 isARenouveler ? 'rgba(184,106,42,0.10)' :
                                 'action.hover',
                      },
                    }}>
                      {/* A: N° */}
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700, color: VIOLET }}>{num}</Typography></TableCell>
                      {/* B: Matricule */}
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: NAVY }}>{emp?.matricule || '—'}</Typography></TableCell>
                      {/* C: Employé (RECHERCHEX auto, lock) */}
                      <TableCell sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title={`=RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E; "Non trouvé"; 0)`}>
                          <Stack direction='row' spacing={0.5} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{empName}</Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* D: Type Permis (chip coloré + icône sémantique) */}
                      <TableCell>
                        {p.type_permit ? (
                          <Chip 
                            icon={TYPE_PERMIT_ICONS[p.type_permit]?.icon} 
                            label={p.type_permit} 
                            size='small' 
                            sx={{ fontSize: '0.58rem', height: 22, bgcolor: typeStyle.bg, color: typeStyle.color, fontWeight: 700, border: `1px solid ${typeStyle.color}30`, '& .MuiChip-icon': { color: typeStyle.color, ml: '4px', fontSize: '14px' } }} 
                          />
                        ) : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>}
                      </TableCell>
                      {/* E: N° Permis (monospace) */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem', color: NAVY, fontWeight: 600 }}>{p.numero_permit || '—'}</Typography></TableCell>
                      {/* F: Date Délivrance */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontSize: '0.66rem', color: p.date_delivrance ? NAVY : '#9aa8b8' }}>{p.date_delivrance ? formatDate(p.date_delivrance) : '—'}</Typography></TableCell>
                      {/* G: Date Expiration + barre de progression visuelle */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', fontWeight: 700, color: isExpiré ? ROUGE : isARenouveler ? ORANGE : NAVY }}>{p.date_expiration ? formatDate(p.date_expiration) : '—'}</Typography>
                        {p.date_expiration && (() => {
                          const prog = getProgressionExpiration(p);
                          return (
                            <Box sx={{ mt: 0.3, width: 70, height: 3, bgcolor: '#e9edf2', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ width: `${prog.percent}%`, height: '100%', bgcolor: prog.color, borderRadius: 2, transition: 'width 0.3s ease' }} />
                            </Box>
                          );
                        })()}
                      </TableCell>
                      {/* H: Autorité (chip coloré) */}
                      <TableCell>
                        {p.autorite ? (
                          <Chip label={p.autorite} size='small' sx={{ fontSize: '0.58rem', height: 20, bgcolor: autoriteStyle.bg, color: autoriteStyle.color, fontWeight: 700, border: `1px solid ${autoriteStyle.color}30` }} />
                        ) : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>}
                      </TableCell>
                      {/* I: Statut (auto, lock) */}
                      <TableCell sx={{ bgcolor: statut.bg }}>
                        <Tooltip title='=SI([@[Date Expiration]]=""; "Valide"; SI(<AUJOURDHUI(); "Expiré"; SI(<=+30; "À renouveler"; "Valide")))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={statut.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: statut.bg, color: statut.color, fontWeight: 700, border: `1px solid ${statut.color}30` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* J: Alerte (auto, lock, indépendante de I, borderLeft) */}
                      <TableCell sx={{ bgcolor: alerte.bg, borderLeft: `3px solid ${alerte.color}` }}>
                        <Tooltip title='=SI([@Statut]="Expiré"; "🔴 Expiré"; SI([@Statut]="À renouveler"; "🟠 <30j"; SI([@[Date Expiration]]<=AUJOURDHUI()+60; "🟡 <60j"; "🟢 OK")))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={alerte.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: alerte.bg, color: alerte.color, fontWeight: 700, border: `1px solid ${alerte.color}40` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* K: Dernier Contrôle */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontSize: '0.66rem', color: p.dernier_controle ? BLEU : '#9aa8b8' }}>{p.dernier_controle ? formatDate(p.dernier_controle) : '—'}</Typography></TableCell>
                      {/* L: Actions — 3 boutons (👤 Voir fiche + ✏️ Modifier + 🔄 Renouveler) */}
                      <TableCell align='center' sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction='row' spacing={0.3} justifyContent='center' alignItems='center'>
                          <Tooltip title='Voir fiche employé'>
                            <IconButton size='small' sx={{ color: TURQUOISE, p: 0.4 }} onClick={() => handleVoirFiche(p.employee_id)}>
                              <VisibilityIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Modifier ce permis'>
                            <IconButton size='small' sx={{ color: 'info.main', p: 0.4 }} onClick={() => setEditDialog({ ...p })}>
                              <EditIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          {/* PROMPT 5 : 🔄 Renouveler (intelligent selon type : CNI+10, Passeport+5, Permis travail+2, etc.) */}
                          <Tooltip title={`Renouveler (+${DUREES_VALIDITE_PERMIS[p.type_permit] || 1} an${(DUREES_VALIDITE_PERMIS[p.type_permit] || 1) > 1 ? 's' : ''} — ${p.type_permit})`}>
                            <IconButton size='small' sx={{ color: ORANGE, p: 0.4 }} onClick={() => handleRenouvelerPermis(p)}>
                              <AutorenewIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      {/* M: Notes */}
                      <TableCell sx={{ maxWidth: 160 }}><Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '—'}</Typography></TableCell>
                    </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={13} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun enregistrement trouvé</TableCell></TableRow>
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

      {/* === DIALOG CRÉATION === */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color='success' /> Nouveau permis — N° auto: PERM-{String(PERMIS.length + 1).padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
              Le N° est généré automatiquement. Les colonnes Employé (RECHERCHEX C), Statut (SI imbriquée I) et Alerte (SI granulaire J) sont calculées automatiquement.
            </Alert>
            <TextField select size='small' label='Matricule employé' fullWidth value={newPerm.employee_id || ''} onChange={(e) => setNewPerm({ ...newPerm, employee_id: e.target.value })}>
              {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type Permis' fullWidth value={newPerm.type_permit || ''} onChange={(e) => setNewPerm({ ...newPerm, type_permit: e.target.value })}>
              {NOMENCLATURES.type_permit.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Stack direction='row' spacing={1.5}>
              <TextField size='small' label='N° Permis' fullWidth value={newPerm.numero_permit || ''} onChange={(e) => setNewPerm({ ...newPerm, numero_permit: e.target.value })} placeholder='PT-2025-001' />
              <TextField select size='small' label='Autorité' fullWidth value={newPerm.autorite || ''} onChange={(e) => setNewPerm({ ...newPerm, autorite: e.target.value })}>
                {NOMENCLATURES.autorite.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction='row' spacing={1.5}>
              <TextField type='date' size='small' label='Date Délivrance' fullWidth value={(newPerm.date_delivrance || '').slice(0, 10)} onChange={(e) => setNewPerm({ ...newPerm, date_delivrance: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField type='date' size='small' label='Date Expiration' fullWidth value={(newPerm.date_expiration || '').slice(0, 10)} onChange={(e) => setNewPerm({ ...newPerm, date_expiration: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField type='date' size='small' label="Dernier Contrôle (défaut: aujourd'hui)" fullWidth value={(newPerm.dernier_controle || new Date().toISOString().slice(0, 10)).slice(0, 10)} onChange={(e) => setNewPerm({ ...newPerm, dernier_controle: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField size='small' label='Notes' fullWidth multiline rows={2} value={newPerm.notes || ''} onChange={(e) => setNewPerm({ ...newPerm, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<AddIcon />} disabled={!newPerm.employee_id} onClick={handleCreate} sx={{ bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier — {editDialog && `PERM-${String(PERMIS.findIndex(p => p.id === editDialog.id) + 1).padStart(3, '0')}`}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                <strong>Colonnes auto (non modifiables) :</strong> Employé (RECHERCHEX), Statut (SI imbriquée), Alerte (SI granulaire indépendante).
                <br />Date MAJ et Dernier contrôle seront automatiquement mis à jour à aujourd'hui.
                <br />Statut actuel : <strong>{calculerStatutPermis(editDialog).label}</strong> · Alerte : <strong>{calculerAlertePermis(editDialog).label}</strong>
              </Alert>
              <TextField select size='small' label='Matricule employé' fullWidth value={editDialog.employee_id || ''} onChange={(e) => setEditDialog({ ...editDialog, employee_id: e.target.value })}>
                {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)}</MenuItem>)}
              </TextField>
              <Stack direction='row' spacing={1.5}>
                <TextField select size='small' label='Type Permis' fullWidth value={editDialog.type_permit || ''} onChange={(e) => setEditDialog({ ...editDialog, type_permit: e.target.value })}>
                  {NOMENCLATURES.type_permit.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField size='small' label='N° Permis' fullWidth value={editDialog.numero_permit || ''} onChange={(e) => setEditDialog({ ...editDialog, numero_permit: e.target.value })} />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Date Délivrance' fullWidth value={(editDialog.date_delivrance || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_delivrance: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField type='date' size='small' label='Date Expiration' fullWidth value={(editDialog.date_expiration || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_expiration: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField select size='small' label='Autorité' fullWidth value={editDialog.autorite || ''} onChange={(e) => setEditDialog({ ...editDialog, autorite: e.target.value })}>
                  {NOMENCLATURES.autorite.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </TextField>
                <TextField type='date' size='small' label='Dernier Contrôle' fullWidth value={(editDialog.dernier_controle || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, dernier_controle: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              {/* Statut + Alerte (read-only, auto-calculés) */}
              <Stack direction='row' spacing={1.5}>
                <TextField size='small' label='Statut (auto)' fullWidth disabled value={calculerStatutPermis(editDialog).label} helperText='Calculée automatiquement' />
                <TextField size='small' label='Alerte (auto)' fullWidth disabled value={calculerAlertePermis(editDialog).label} helperText='Indépendante du statut' />
              </Stack>
              <TextField size='small' label='Notes' fullWidth multiline rows={2} value={editDialog.notes || ''} onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit} sx={{ bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 5 : SYSTÈME D'ALERTES PERMIS (bandeau + config + envoi) === */}
      <Card variant='outlined' sx={{ mb: 2, border: `2px solid ${ROUGE}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(179,58,74,0.06) 0%, rgba(184,106,42,0.04) 100%)` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: alerteStats.total > 0 ? ROUGE : VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NotificationsActiveIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Système d'alertes permis — {alerteStats.total} permis en anomalie
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block' }}>
                  {alerteStats.total > 0 ? (
                    <>
                      <strong style={{ color: ROUGE }}>{alerteStats.expires}</strong> expiré(s) · <strong style={{ color: ORANGE }}>{alerteStats.aRenouveler}</strong> à renouveler
                    </>
                  ) : (
                    <>Aucune anomalie détectée — tous les permis sont à jour</>
                  )}
                  {alerteConfig.derniere_execution && (
                    <span> · Dernière exécution : <strong>{formatDate(alerteConfig.derniere_execution)}</strong></span>
                  )}
                </Typography>
              </Box>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Tooltip title='Configurer les destinataires, fréquence et activation'>
                <Button variant='outlined' size='small' startIcon={<SettingsIcon />} onClick={() => setConfigDialog(true)} sx={{ textTransform: 'none', fontSize: '0.72rem', borderColor: TURQUOISE, color: TURQUOISE_DARK }}>
                  Config
                </Button>
              </Tooltip>
              <Tooltip title="Envoyer les rappels permis (génère email récap, met à jour dernier_controle)">
                <Button
                  variant='contained' size='small'
                  startIcon={<SendIcon />}
                  onClick={handleSendRappels}
                  disabled={!alerteConfig.activer || alerteStats.total === 0}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: ROUGE, '&:hover': { bgcolor: '#9a2f3a' } }}
                >
                  Envoyer les rappels ({alerteStats.total})
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* === PROMPT 5 : DIALOG CONFIGURATION ALERTES PERMIS (_Config_Alertes_Permis) === */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ color: TURQUOISE }} /> Configuration des alertes permis (_Config_Alertes_Permis)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Feuille de configuration Excel <strong>_Config_Alertes_Permis</strong> — Paramètres du système d'alertes permis automatiques (PROMPT 5).
            </Alert>
            <TextField
              size='small' label='Destinataires RH (emails)' fullWidth multiline rows={2}
              value={alerteConfig.destinataires || ''}
              onChange={(e) => setAlerteConfig({ ...alerteConfig, destinataires: e.target.value })}
              placeholder='rh@admina-rh.com, manager1@admina-rh.com'
              helperText='Séparez les emails par des virgules'
            />
            <Stack direction='row' spacing={1.5}>
              <TextField
                type='number' size='small' label='Fréquence (jours)' fullWidth
                value={alerteConfig.frequence_jours || 7}
                onChange={(e) => setAlerteConfig({ ...alerteConfig, frequence_jours: parseInt(e.target.value) || 7 })}
                helperText='Cadence des contrôles'
              />
              <TextField
                select size='small' label='Activer alertes' fullWidth
                value={alerteConfig.activer ? 'Oui' : 'Non'}
                onChange={(e) => setAlerteConfig({ ...alerteConfig, activer: e.target.value === 'Oui' })}
              >
                <MenuItem value='Oui'>Oui</MenuItem>
                <MenuItem value='Non'>Non</MenuItem>
              </TextField>
            </Stack>
            <TextField
              size='small' label='Objet email' fullWidth
              value={alerteConfig.objet_email || ''}
              onChange={(e) => setAlerteConfig({ ...alerteConfig, objet_email: e.target.value })}
            />
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', borderRadius: 1, border: '1px solid #e9edf2' }}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <LockIcon sx={{ fontSize: 14, color: '#9aa8b8' }} />
                <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>
                  Dernière exécution : <strong style={{ color: NAVY }}>{alerteConfig.derniere_execution ? formatDate(alerteConfig.derniere_execution) : 'Jamais'}</strong>
                </Typography>
              </Stack>
            </Paper>
            <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
              📋 <strong>Durées de renouvellement par type</strong> (macro RenouvelerPermis intelligente) :
              <br />· Permis travail → +2 ans · Carte séjour → +1 an · Visa long séjour → +1 an
              <br />· Titre de séjour → +1 an · CNI → +10 ans · Passeport → +5 ans
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfigDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SettingsIcon />} onClick={handleSaveConfig} sx={{ bgcolor: TURQUOISE, '&:hover': { bgcolor: TURQUOISE_DARK } }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 5 : DIALOG RÉCAPITULATIF EMAIL (après envoi) === */}
      <Dialog open={Boolean(alerteRecapDialog)} onClose={() => setAlerteRecapDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailIcon sx={{ color: TURQUOISE }} /> Récapitulatif d'envoi — {alerteRecapDialog?.count} rappel(s)
          <Chip label='Envoyé' size='small' color='success' sx={{ ml: 1, fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent>
          {alerteRecapDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='success' sx={{ fontSize: '0.75rem' }} icon={<CheckCircleIcon />}>
                ✅ <strong>{alerteRecapDialog.count} rappel(s) envoyé(s)</strong> avec succès à {alerteRecapDialog.destinataires}.
                <br />Date d'envoi : <strong>{formatDate(alerteRecapDialog.dateEnvoi)}</strong>
              </Alert>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', borderRadius: 1, border: '1px solid #e9edf2' }}>
                <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap'>
                  <Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>À</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{alerteRecapDialog.destinataires}</Typography>
                  </Box>
                  <Divider orientation='vertical' flexItem />
                  <Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>Objet</Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{alerteRecapDialog.objet}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📧 Corps de l'email
                </Typography>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #d6dde6', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.7rem', color: '#1a2a3a', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: 300, overflowY: 'auto' }}>
                  {alerteRecapDialog.corps}
                </Paper>
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📋 Permis concernés ({alerteRecapDialog.count})
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 220 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expiration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerteRecapDialog.docsAlerte.map(p => {
                        const emp = findEmployee(p.employee_id);
                        const al = calculerAlertePermis(p);
                        const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
                        return (
                          <TableRow key={p.id} hover>
                            <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: TURQUOISE, fontWeight: 700 }}>{num}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{p.type_permit || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem' }}><Chip label={al.label} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{p.date_expiration ? formatDate(p.date_expiration) : 'Permanent'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
                📝 <strong>Audit trail</strong> — L'envoi a été enregistré dans <code>ALERTES_PERMIS_HISTORIQUE</code>. La colonne K (Dernier contrôle) a été mise à jour pour chaque permis en anomalie.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAlerteRecapDialog(null)}>Fermer</Button>
          <Button variant='outlined' startIcon={<MailIcon />} onClick={handleOpenMailto} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
            Ouvrir dans le client email (mailto)
          </Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 6 : DIALOG RAPPORT AUDIT PERMIS (tous les permis, triés Employé + Date Expiration) === */}
      <Dialog open={auditDialog} onClose={() => setAuditDialog(false)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', borderBottom: `3px solid ${TURQUOISE}`, pb: 1.5 }}>
          <AssessmentIcon sx={{ color: TURQUOISE }} /> Rapport d'Audit Permis — {auditStats.total} permis
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Récapitulatif de tous les permis avec statuts, alertes et dates de contrôle. Trié par <strong>Employé</strong> puis <strong>Date Expiration</strong>. Indépendant des filtres du tableau principal.
            </Alert>
            {/* 3 chips de stats : Anomalies / À renouveler / OK */}
            <Stack direction='row' spacing={1.5} flexWrap='wrap' useFlexGap>
              <Chip
                label={`🔴 Anomalies : ${auditStats.anomalies}`}
                size='small'
                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700, border: `1px solid ${ROUGE}40` }}
              />
              <Chip
                label={`🟠 À renouveler : ${auditStats.aRenouveler}`}
                size='small'
                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(184,106,42,0.1)', color: ORANGE, fontWeight: 700, border: `1px solid ${ORANGE}40` }}
              />
              <Chip
                label={`🟢 OK : ${auditStats.ok}`}
                size='small'
                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(26,122,74,0.1)', color: VERT, fontWeight: 700, border: `1px solid ${VERT}40` }}
              />
            </Stack>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 480 }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N°</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Matricule</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type Permis</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N° Permis</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Délivrance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expiration</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Autorité</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Dernier Contrôle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData.map(p => {
                    const emp = findEmployee(p.employee_id);
                    const st = calculerStatutPermis(p);
                    const al = calculerAlertePermis(p);
                    const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
                    return (
                      <TableRow key={p.id} hover sx={{
                        bgcolor: al.short === 'Expiré' ? 'rgba(179,58,74,0.05)' :
                                 al.short === '<30j' || al.short === '<60j' ? 'rgba(184,106,42,0.04)' :
                                 'transparent',
                      }}>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: TURQUOISE, fontWeight: 700 }}>{num}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: NAVY }}>{emp?.matricule || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{p.type_permit || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>{p.numero_permit || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{p.date_delivrance ? formatDate(p.date_delivrance) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', color: p.date_expiration ? (st.short === 'Expiré' ? ROUGE : st.short === 'À renouveler' ? ORANGE : NAVY) : VERT }}>{p.date_expiration ? formatDate(p.date_expiration) : 'Permanent'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{p.autorite || '—'}</TableCell>
                        <TableCell><Chip label={st.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ bgcolor: al.bg, borderLeft: `3px solid ${al.color}` }}><Chip label={al.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', color: p.dernier_controle ? BLEU : '#9aa8b8' }}>{p.dernier_controle ? formatDate(p.dernier_controle) : '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {auditData.length === 0 && (
                    <TableRow><TableCell colSpan={11} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun permis à auditer</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
              📋 <strong>Rapport complet</strong> — {auditStats.total} permis au total. Tri alphabétique par Employé puis Date Expiration. Indépendant des filtres du tableau principal.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAuditDialog(false)}>Fermer</Button>
          <Button variant='outlined' startIcon={<DownloadIcon />} onClick={() => handleExportCSV(auditData, 'audit')} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export Excel (CSV)</Button>
          <Button variant='outlined' startIcon={<PictureAsPdfIcon />} onClick={() => handleExportPDF(auditData)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VERT, borderColor: VERT }}>Export PDF</Button>
        </DialogActions>
      </Dialog>

      {/* === KPI INTERACTIFS : DIALOG CONTEXTUEL (centre de commande opérationnel) === */}
      {/* Un seul dialog générique qui s'adapte au type de KPI cliqué.
          Affiche : titre + compteur + sélection multiple + table + actions groupées. */}
      <Dialog open={Boolean(kpiDialog)} onClose={() => { setKpiDialog(null); setKpiSelected(new Set()); }} maxWidth='lg' fullWidth>
        {kpiData && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', borderBottom: `3px solid ${kpiData.color}`, pb: 1.5 }}>
              {kpiData.icon}
              <Typography component='span' variant='h6' sx={{ fontWeight: 700, fontSize: '1.05rem', color: kpiData.color }}>
                {kpiData.title}
              </Typography>
              <Chip
                label={`${kpiData.data.length} enregistrement(s)`}
                size='small'
                sx={{ ml: 1, fontWeight: 700, bgcolor: `${kpiData.color}15`, color: kpiData.color, border: `1px solid ${kpiData.color}40` }}
              />
              {kpiSelected.size > 0 && (
                <Chip
                  label={`${kpiSelected.size} sélectionné(s)`}
                  size='small'
                  color='primary'
                  onDelete={() => setKpiSelected(new Set())}
                  sx={{ ml: 0.5, fontWeight: 700, fontSize: '0.65rem' }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {/* Alerte contextuelle selon le type de KPI */}
                {kpiDialog === 'expires' && (
                  <Alert severity='error' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                    ⚠️ <strong>{kpiData.data.length} permis expiré(s).</strong> Renouvelez individuellement (🔄) ou en masse (🔄 Renouveler tout) ci-dessous.
                  </Alert>
                )}
                {kpiDialog === 'aRenouveler' && (
                  <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<AutorenewIcon />}>
                    🟠 Ces permis arrivent à échéance dans moins de 30 jours. Renouvelez avant expiration.
                  </Alert>
                )}
                {kpiDialog === 'alerte60j' && (
                  <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                    🟡 Ces permis expirent dans moins de 60 jours. Anticipez les renouvellements.
                  </Alert>
                )}
                {kpiDialog === 'tauxConformite' && (
                  <Alert severity={stats.tauxConformite >= 90 ? 'success' : stats.tauxConformite >= 70 ? 'warning' : 'error'} sx={{ fontSize: '0.72rem' }}>
                    📊 <strong>Taux de conformité : {stats.tauxConformite}%</strong> — Calcul : 1 - (Expirés + À renouveler) / Total.
                    <br />Composition : <strong style={{ color: VERT }}>{stats.valides} valides</strong> · <strong style={{ color: ORANGE }}>{stats.aRenouveler} à renouveler</strong> · <strong style={{ color: ROUGE }}>{stats.expires} expirés</strong> sur {stats.total} permis.
                    {stats.tauxConformite < 70 && ' ⚠️ Taux critique — renouvelez les permis expirés pour améliorer ce taux.'}
                    {stats.tauxConformite >= 70 && stats.tauxConformite < 90 && ' 🟡 Taux moyen — quelques renouvellements nécessaires.'}
                    {stats.tauxConformite >= 90 && ' ✅ Excellent taux de conformité !'}
                  </Alert>
                )}
                {kpiDialog === 'total' && (
                  <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                    📋 Liste complète des {stats.total} permis. Utilisez ➕ Ajouter pour créer un nouveau permis, ou ✏️ Modifier pour éditer une ligne.
                  </Alert>
                )}

                {/* Table des permis avec checkbox de sélection (si actions groupées disponibles) */}
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 440 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                        {kpiData.actions.includes('renouvelerSelection') && (
                          <TableCell padding='checkbox' sx={{ bgcolor: '#2c3e50' }}>
                            <Checkbox
                              size='small'
                              checked={kpiData.data.length > 0 && kpiSelected.size === kpiData.data.length}
                              indeterminate={kpiSelected.size > 0 && kpiSelected.size < kpiData.data.length}
                              onChange={handleToggleAllKpi}
                              sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type Permis</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expiration</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                        <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiData.data.map(p => {
                        const emp = findEmployee(p.employee_id);
                        const st = calculerStatutPermis(p);
                        const al = calculerAlertePermis(p);
                        const num = `PERM-${String(PERMIS.indexOf(p) + 1).padStart(3, '0')}`;
                        const isSelected = kpiSelected.has(p.id);
                        const typeIcon = TYPE_PERMIT_ICONS[p.type_permit]?.emoji || '📋';
                        return (
                          <TableRow key={p.id} hover selected={isSelected} sx={{
                            bgcolor: isSelected ? `${kpiData.color}10` :
                                     al.short === 'Expiré' ? 'rgba(179,58,74,0.04)' :
                                     al.short === '<30j' ? 'rgba(184,106,42,0.03)' : 'transparent',
                          }}>
                            {kpiData.actions.includes('renouvelerSelection') && (
                              <TableCell padding='checkbox'>
                                <Checkbox
                                  size='small'
                                  checked={isSelected}
                                  onChange={() => handleToggleKpiSelect(p.id)}
                                  sx={{ color: kpiData.color, '&.Mui-checked': { color: kpiData.color } }}
                                />
                              </TableCell>
                            )}
                            <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: TURQUOISE, fontWeight: 700 }}>{num}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem' }}>{typeIcon} {p.type_permit || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem', color: p.date_expiration ? (st.short === 'Expiré' ? ROUGE : st.short === 'À renouveler' ? ORANGE : NAVY) : VERT }}>{p.date_expiration ? formatDate(p.date_expiration) : 'Permanent'}</TableCell>
                            <TableCell><Chip label={st.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                            <TableCell sx={{ bgcolor: al.bg, borderLeft: `3px solid ${al.color}` }}><Chip label={al.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                            <TableCell align='center'>
                              <Stack direction='row' spacing={0.5} justifyContent='center'>
                                {kpiData.actions.includes('voirFiche') && (
                                  <Tooltip title='Voir fiche employé'>
                                    <IconButton size='small' sx={{ p: 0.3 }} onClick={() => handleVoirFiche(p.employee_id)}>
                                      <VisibilityIcon sx={{ fontSize: 15, color: TURQUOISE }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {kpiData.actions.includes('modifier') && (
                                  <Tooltip title='Modifier ce permis'>
                                    <IconButton size='small' sx={{ p: 0.3 }} onClick={() => setEditDialog({ ...p })}>
                                      <EditIcon sx={{ fontSize: 15, color: 'info.main' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {(kpiData.actions.includes('renouvelerSelection') || kpiData.actions.includes('renouvelerTout')) && (
                                  <Tooltip title={`Renouveler (+${DUREES_VALIDITE_PERMIS[p.type_permit] || 1} an(s))`}>
                                    <IconButton size='small' sx={{ p: 0.3 }} onClick={() => handleRenouvelerPermis(p)}>
                                      <AutorenewIcon sx={{ fontSize: 15, color: ORANGE }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {kpiData.data.length === 0 && (
                        <TableRow><TableCell colSpan={kpiData.actions.includes('renouvelerSelection') ? 8 : 7} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                          ✅ Aucun permis dans cette catégorie
                        </TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Audit trail info */}
                <Alert severity='info' sx={{ fontSize: '0.66rem' }}>
                  📝 <strong>Audit trail</strong> — Toutes les actions effectuées ici sont journalisées dans <code>PERMIS_AUDIT_TRAIL</code> (ISO 30401:2018). Les KPI sont automatiquement rafraîchis après chaque action.
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Button onClick={() => { setKpiDialog(null); setKpiSelected(new Set()); }}>Fermer</Button>
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                {kpiData.actions.includes('exportCSV') && (
                  <Button variant='outlined' startIcon={<DownloadIcon />} onClick={() => handleExportCSV(kpiData.data, 'filtrée')} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>Export CSV</Button>
                )}
                {kpiData.actions.includes('ajouter') && (
                  <Button variant='outlined' startIcon={<AddIcon />} onClick={() => { setKpiDialog(null); setNewPerm({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.72rem', color: TURQUOISE, borderColor: TURQUOISE }}>➕ Ajouter</Button>
                )}
                {kpiData.actions.includes('renouvelerSelection') && (
                  <Button
                    variant='outlined'
                    startIcon={<AutorenewIcon />}
                    onClick={handleRenouvelerSelectionKpi}
                    disabled={kpiSelected.size === 0}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', color: ORANGE, borderColor: ORANGE }}
                  >
                    🔄 Renouveler sélection ({kpiSelected.size})
                  </Button>
                )}
                {kpiData.actions.includes('renouvelerTout') && (
                  <Button
                    variant='contained'
                    startIcon={<AutorenewIcon />}
                    onClick={handleRenouvelerToutKpi}
                    disabled={kpiData.data.length === 0}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: kpiData.color, '&:hover': { bgcolor: kpiData.color, filter: 'brightness(0.9)' } }}
                  >
                    🔄 Renouveler tout ({kpiData.data.length})
                  </Button>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
