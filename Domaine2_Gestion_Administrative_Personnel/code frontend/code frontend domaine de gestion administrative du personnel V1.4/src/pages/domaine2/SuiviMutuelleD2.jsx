// ============================================================
// SuiviMutuelleD2.jsx — Feuille « 7-Mutuelle Prévoyance » (PROMPTS 1-6)
// Tableau structuré T_Mutuelle (16 colonnes A-P)
//
// A: N°                  = "MUT-"&TEXTE(LIGNE()-4;"000")  (auto)
// B: Matricule           = dropdown EMPLOYEES
// C: Employé             = RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E)  (auto, lock)
// D: Organisme           = dropdown ORGANISMES_MUTUELLE
// E: N° Adhérent         = saisie libre (monospace)
// F: Date Adhésion       = saisie date
// G: Date Échéance       = saisie date (bold si présent, "Permanent" si vide)
// H: Couverture          = dropdown COUVERTURES_MUTUELLE
// I: Personnes à Charge  = saisie nombre (chip orange si 0 — "Aucune pers.")
// J: Cotisation Mensuelle= saisie nombre (formatNumber + "FCFA")
// K: Cotisation Annuelle = =[@[Cotisation Mensuelle]]*12  (auto, lock)
// L: Statut              = SI([@[Date Échéance]]=""; "Actif"; SI(<AUJOURDHUI(); "Expiré"; SI(<=+30; "À renouveler"; "Actif")))  (auto, lock)
// M: Alerte              = SI imbriquée (auto, lock, indépendante de L)
// N: Dernier Contrôle    = saisie date
// O: Actions             = boutons 👤 Voir fiche + ✏️ Modifier + 🔄 Renouveler (PROMPT 5)
// P: Notes               = saisie libre
//
// PROMPT 6 : Exports sécurisés (PDF masqué / Paie complet+mdp / Audit global)
//            + journalisation EXPORTS_LOG + MUTUELLE_AUDIT_TRAIL (ISO 9001/30414).
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
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  MUTUELLES, ORGANISMES_MUTUELLE, COUVERTURES_MUTUELLE,
  EMPLOYEES, findEmployee, employeeFullName,
  formatNumber, formatDate,
  calculerStatutMutuelle, calculerAlerteMutuelle,
  CONFIG_ALERTES_MUTUELLE, ALERTES_MUTUELLE_HISTORIQUE,
  genererCorpsEmailMutuelle,
} from './data';
import { SectionHeader } from './components';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const JAUNE = '#d4a017';

// ============================================================
// Couleurs par organisme de mutuelle (chip colored)
// Mapping stable pour distinguer visuellement les organismes.
// ============================================================
const ORGANISMES_COLORS = {
  'CNPS': { bg: 'rgba(42,106,154,0.12)', color: BLEU },
  'ACTIVA Assurances': { bg: 'rgba(126,63,242,0.10)', color: VIOLET },
  'AXA Cameroun': { bg: 'rgba(26,122,74,0.10)', color: VERT },
  'SUNU Vie': { bg: 'rgba(212,160,23,0.12)', color: JAUNE },
  'Saham Assurance': { bg: 'rgba(184,106,42,0.10)', color: ORANGE },
  'Allianz Cameroon': { bg: 'rgba(11,42,74,0.10)', color: NAVY },
  'BICEC Assurances': { bg: 'rgba(179,58,74,0.10)', color: ROUGE },
  'Beneficial Life': { bg: 'rgba(42,122,154,0.10)', color: BLEU },
  'Activa Assurances': { bg: 'rgba(126,63,242,0.10)', color: VIOLET },
  'Autre': { bg: 'rgba(107,122,138,0.10)', color: '#6b7a8a' },
};

const getOrganismeStyle = (organisme) => ORGANISMES_COLORS[organisme] || ORGANISMES_COLORS['Autre'];

// ============================================================
// PROMPT 4 : Couleurs pour les graphiques Recharts
// Mapping stable organismes / couvertures / statuts → couleur.
// Par défaut (#95a5a6) pour les valeurs non listées.
// ============================================================
const ORGANISME_COLORS_MAP = {
  'ACTIVA Assurances': '#3498db', 'SUNU Vie': '#2ecc71', 'Saham Assurance': '#f39c12',
  'AXA Cameroun': '#9b59b6', 'CNPS': '#e74c3c', 'Allianz Cameroon': '#1abc9c',
  'BICEC Assurances': '#e67e22',
};
const COUVERTURE_COLORS_MAP = {
  'Familiale': '#3498db', 'Individuelle': '#2ecc71', 'Santé': '#f39c12',
  'Santé + Retraite': '#9b59b6', 'Complète': '#e74c3c', 'Santé + Décès': '#1abc9c',
  'Retraite': '#e67e22', 'Autre': '#95a5a6',
};
const STATUT_COLORS_MAP = {
  'Actif': '#27ae60', 'À renouveler': '#f39c12', 'Expiré': '#e74c3c',
};

// ============================================================
// PROMPT 6 : Audit trail des modifications mutuelle (Mutuelle_Audit)
// Conforme ISO 30401:2018 — traçabilité des changements :
// - renouveler_adhesion (individuel — col O 🔄)
// - modifier_adhesion (changement couverture/cotisation — col O ✏️)
// - envoyer_rappels (système d'alertes PROMPT 5)
// - export_pdf / export_paie / export_csv / export_audit (PROMPT 6)
// Chaque entrée enregistre : timestamp, action, mutuelle_id, employee_id, user.
// ============================================================
const MUTUELLE_AUDIT_TRAIL = [];

// ============================================================
// PROMPT 6 : Journal des exports sécurisés (_Logs_Exports)
// Conforme ISO 9001:2015 + ISO 30414:2018 — traçabilité des exports de données.
// Chaque entrée : timestamp, type, filename, nb_lignes, statut, user.
// Types : export_pdf (N° Adhérent masqué RGPD), export_paie (complet — sensible,
// protégé par mot de passe), export_csv, export_audit (N° Adhérent masqué).
// ============================================================
const EXPORTS_LOG = [];

export default function SuiviMutuelleD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fOrganisme, setFOrganisme] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fAlerte, setFAlerte] = useState('');
  const [fCouverture, setFCouverture] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_echeance', direction: 'asc' });
  const [snack, setSnack] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [newMut, setNewMut] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // --- PROMPT 5 : Système d'alertes mutuelle (états) ---
  // configDialog : ouvre/ferme le dialog _Config_Alertes_Mutuelle
  // alerteRecapDialog : { corps, docsAlerte, count, destinataires, objet, dateEnvoi } après envoi
  // alerteConfig : copie locale mutable de CONFIG_ALERTES_MUTUELLE
  const [configDialog, setConfigDialog] = useState(false);
  const [alerteRecapDialog, setAlerteRecapDialog] = useState(null);
  const [alerteConfig, setAlerteConfig] = useState({ ...CONFIG_ALERTES_MUTUELLE });

  // --- PROMPT 6 : Exports sécurisés (états) ---
  // paieDialog : { password, confirmPassword } — N° Adhérent complet soumis à mot de passe
  // auditDialog : booléen — ouvre le rapport d'audit (toutes les adhésions, triées Employé + Organisme)
  const [paieDialog, setPaieDialog] = useState(null);
  const [auditDialog, setAuditDialog] = useState(false);

  // --- KPI INTERACTIFS (centre de commande opérationnel) ---
  // kpiDialog : type du KPI cliqué ('total' | 'cotMensuelle' | 'cotAnnuelle' | 'tauxCouverture'
  //            | 'aRenouveler' | 'expires' | 'aucunePers' | 'actifs') | null
  // kpiSelected : Set des IDs d'adhésions sélectionnées dans le dialog (pour actions groupées)
  const [kpiDialog, setKpiDialog] = useState(null);
  const [kpiSelected, setKpiSelected] = useState(new Set());

  // --- INTERACTIVITÉ LIGNES (actions enrichies sur chaque adhésion) ---
  // persDialog : adhésion pour laquelle modifier le nombre de personnes à charge | null
  // supprimerDialog : adhésion à confirmer suppression | null
  // ficheCompleteDialog : adhésion dont on affiche la fiche complète (pop-up récapitulatif) | null
  const [persDialog, setPersDialog] = useState(null);
  const [persValue, setPersValue] = useState(0);
  const [supprimerDialog, setSupprimerDialog] = useState(null);
  const [ficheCompleteDialog, setFicheCompleteDialog] = useState(null);

  // --- Filtrage ---
  const filtered = useMemo(() => {
    let result = MUTUELLES.filter(m => {
      if (search) {
        const emp = findEmployee(m.employee_id);
        const empName = emp ? employeeFullName(emp).toLowerCase() : '';
        const q = search.toLowerCase();
        if (!empName.includes(q) &&
            !m.organisme?.toLowerCase().includes(q) &&
            !m.numero_adherent?.toLowerCase().includes(q) &&
            !emp?.matricule?.toLowerCase().includes(q) &&
            !m.couverture?.toLowerCase().includes(q)) return false;
      }
      if (fOrganisme && m.organisme !== fOrganisme) return false;
      if (fStatut && calculerStatutMutuelle(m).short !== fStatut) return false;
      if (fAlerte && calculerAlerteMutuelle(m).short !== fAlerte) return false;
      if (fCouverture && m.couverture !== fCouverture) return false;
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
          valA = sortConfig.key === 'statut' ? calculerStatutMutuelle(a).short : calculerAlerteMutuelle(a).short;
          valB = sortConfig.key === 'statut' ? calculerStatutMutuelle(b).short : calculerAlerteMutuelle(b).short;
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
  }, [search, fOrganisme, fStatut, fAlerte, fCouverture, sortConfig, refreshKey]);

  // --- Tri dynamique ---
  const handleSort = (key) => {
    setSortConfig(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  // --- Réinitialiser tous les filtres ---
  const handleResetFilters = () => {
    setSearch(''); setFOrganisme(''); setFStatut(''); setFAlerte(''); setFCouverture(''); setPage(0);
    setSnack({ msg: 'Filtres réinitialisés', severity: 'info' });
  };

  const activeFilterCount = [search, fOrganisme, fStatut, fAlerte, fCouverture].filter(Boolean).length;

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- KPI (NBVAL / NB.SI / SOMME) — PROMPT 2 enrichi avec Taux de couverture ---
  const stats = useMemo(() => {
    const total = MUTUELLES.length;
    const expires = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'Expiré').length;
    const aRenouveler = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'À renouveler').length;
    const aucunePers = MUTUELLES.filter(m => (m.personnes_a_charge || 0) === 0).length;
    const actifs = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'Actif').length;
    // Cotisation mensuelle totale = SOMME(J)
    const cotMensuelleTotale = MUTUELLES.reduce((acc, m) => acc + (Number(m.cotisation_mensuelle) || 0), 0);
    // Cotisation annuelle totale = SOMME(K) = SOMME(J * 12)
    const cotAnnuelleTotale = cotMensuelleTotale * 12;
    // Taux de couverture = 1 - (Expirés + À renouveler) / Total
    // =SIERREUR(1 - (NB.SI(Alerte;"🔴 Expiré") + NB.SI(Alerte;"🟠 <30j")) / NBVAL(N°); 0)
    const tauxCouverture = total > 0 ? Math.round((1 - (expires + aRenouveler) / total) * 100) : 0;
    return { total, expires, aRenouveler, aucunePers, actifs, cotMensuelleTotale, cotAnnuelleTotale, tauxCouverture };
  }, [refreshKey]);

  // --- PROMPT 4 : Chart 1 — Répartition par organisme (BarChart horizontal) ---
  const chartOrganismeData = useMemo(() => {
    const counts = {};
    MUTUELLES.forEach(m => {
      const key = m.organisme || 'Autre';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([organisme, count]) => ({ organisme, count }));
  }, [refreshKey]);

  // --- PROMPT 4 : Chart 2 — Répartition par type de couverture (PieChart donut) ---
  const chartCouvertureData = useMemo(() => {
    const counts = {};
    MUTUELLES.forEach(m => {
      const key = m.couverture || 'Autre';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name, value, color: COUVERTURE_COLORS_MAP[name] || '#95a5a6',
    }));
  }, [refreshKey]);

  // --- PROMPT 4 : Chart 3 — Statut des adhésions (BarChart vertical) ---
  const chartStatutData = useMemo(() => {
    const counts = { 'Actif': 0, 'À renouveler': 0, 'Expiré': 0 };
    MUTUELLES.forEach(m => {
      const st = calculerStatutMutuelle(m).short;
      counts[st] = (counts[st] || 0) + 1;
    });
    // Ordre fixe : Actif → À renouveler → Expiré
    return [
      { statut: 'Actif', count: counts['Actif'] },
      { statut: 'À renouveler', count: counts['À renouveler'] },
      { statut: 'Expiré', count: counts['Expiré'] },
    ];
  }, [refreshKey]);

  // --- PROMPT 5 : Comptage des anomalies pour le bandeau d'alertes ---
  // totalAnomalies = MUTUELLES dont l'Alerte (M) !== 'OK'
  // expires + aRenouveler extraits pour le sub-text du bandeau.
  const alerteStats = useMemo(() => {
    let total = 0, expires = 0, aRenouveler = 0;
    MUTUELLES.forEach(m => {
      const al = calculerAlerteMutuelle(m);
      if (al.short !== 'OK') total++;
      if (al.short === 'Expiré') expires++;
      if (al.short === '<30j') aRenouveler++;
    });
    return { total, expires, aRenouveler };
  }, [refreshKey]);

  // --- PROMPT 6 : Données triées pour le rapport d'audit (toutes les adhésions) ---
  // Tri par Nom Employé puis par Organisme (indépendant des filtres du tableau principal).
  const auditData = useMemo(() => {
    return [...MUTUELLES].sort((a, b) => {
      const eA = findEmployee(a.employee_id);
      const eB = findEmployee(b.employee_id);
      const nameA = eA ? employeeFullName(eA) : '';
      const nameB = eB ? employeeFullName(eB) : '';
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      return (a.organisme || '').localeCompare(b.organisme || '');
    });
  }, [refreshKey]);

  // --- PROMPT 6 : Stats pour le rapport d'audit (3 chips : Anomalies / À renouveler / OK) ---
  const auditStats = useMemo(() => {
    let anomalies = 0, aRenouveler = 0, ok = 0;
    MUTUELLES.forEach(m => {
      const al = calculerAlerteMutuelle(m);
      if (al.short === 'OK') ok++;
      else if (al.short === 'Expiré') anomalies++;
      else aRenouveler++;
    });
    return { anomalies, aRenouveler, ok, total: MUTUELLES.length };
  }, [refreshKey]);

  // --- KPI INTERACTIFS : données filtrées selon le type de KPI cliqué ---
  // Chaque KPI ouvre un dialog avec la liste des adhésions correspondantes.
  // Mapping type → MUTUELLES filtrées + métadonnées (titre, icône, couleur, actions).
  const kpiData = useMemo(() => {
    if (!kpiDialog) return null;
    let data = [];
    let title = '';
    let icon = null;
    let color = VIOLET;
    let actions = []; // liste d'actions disponibles pour ce KPI
    switch (kpiDialog) {
      case 'total':
        data = [...MUTUELLES];
        title = `Liste des adhérents (${stats.total})`;
        icon = <FilterAltIcon sx={{ color: VIOLET }} />;
        color = VIOLET;
        actions = ['ajouter', 'exportCSV', 'modifier', 'voirFiche'];
        break;
      case 'cotMensuelle':
        data = [...MUTUELLES].sort((a, b) => (Number(b.cotisation_mensuelle) || 0) - (Number(a.cotisation_mensuelle) || 0));
        title = `Cotisations mensuelles (${formatNumber(stats.cotMensuelleTotale)} FCFA/mois)`;
        icon = <AssessmentIcon sx={{ color: VERT }} />;
        color = VERT;
        actions = ['modifier', 'exportCSV'];
        break;
      case 'cotAnnuelle':
        data = [...MUTUELLES].sort((a, b) => (Number(b.cotisation_mensuelle) || 0) - (Number(a.cotisation_mensuelle) || 0));
        title = `Cotisations annuelles (${formatNumber(stats.cotAnnuelleTotale)} FCFA/an)`;
        icon = <AssessmentIcon sx={{ color: NAVY }} />;
        color = NAVY;
        actions = ['modifier', 'exportCSV'];
        break;
      case 'tauxCouverture':
        data = [...MUTUELLES];
        title = `Taux de couverture — ${stats.tauxCouverture}%`;
        icon = <AssessmentIcon sx={{ color: stats.tauxCouverture >= 90 ? VERT : stats.tauxCouverture >= 70 ? ORANGE : ROUGE }} />;
        color = stats.tauxCouverture >= 90 ? VERT : stats.tauxCouverture >= 70 ? ORANGE : ROUGE;
        actions = []; // KPI informatif, pas d'action directe
        break;
      case 'aRenouveler':
        data = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'À renouveler');
        title = `Adhésions à renouveler (${stats.aRenouveler})`;
        icon = <AutorenewIcon sx={{ color: ORANGE }} />;
        color = ORANGE;
        actions = ['renouvelerSelection', 'renouvelerTout', 'exportCSV'];
        break;
      case 'expires':
        data = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'Expiré');
        title = `Adhésions expirées (${stats.expires})`;
        icon = <WarningAmberIcon sx={{ color: ROUGE }} />;
        color = ROUGE;
        actions = ['renouvelerSelection', 'renouvelerTout', 'exportCSV'];
        break;
      case 'aucunePers':
        data = MUTUELLES.filter(m => (m.personnes_a_charge || 0) === 0);
        title = `Adhésions sans personne à charge (${stats.aucunePers})`;
        icon = <FilterAltIcon sx={{ color: JAUNE }} />;
        color = JAUNE;
        actions = ['modifier', 'exportCSV'];
        break;
      case 'actifs':
        data = MUTUELLES.filter(m => calculerStatutMutuelle(m).short === 'Actif');
        title = `Adhésions actives (${stats.actifs})`;
        icon = <CheckCircleIcon sx={{ color: BLEU }} />;
        color = BLEU;
        actions = ['modifier', 'exportCSV', 'voirFiche'];
        break;
      default:
        return null;
    }
    return { data, title, icon, color, actions };
  }, [kpiDialog, refreshKey, stats]);

  // --- Export CSV (PROMPT 6 : paramétré + journalisation EXPORTS_LOG) ---
  // data : source des données (défaut = filtered). Permet au rapport d'audit de réutiliser
  //        la même fonction avec auditData (toutes les adhésions, triées).
  // sourceLabel : 'filtrée' | 'audit' — pour le log d'audit.
  const handleExportCSV = (data, sourceLabel = 'filtrée') => {
    const rowsData = data || filtered;
    const headers = [
      'N°', 'Matricule', 'Employé', 'Organisme', 'N° Adhérent',
      'Date Adhésion', 'Date Échéance', 'Couverture', 'Personnes à Charge',
      'Cotisation Mensuelle', 'Cotisation Annuelle', 'Statut', 'Alerte',
      'Dernier Contrôle', 'Notes',
    ];
    const rows = rowsData.map(m => {
      const emp = findEmployee(m.employee_id);
      const st = calculerStatutMutuelle(m);
      const al = calculerAlerteMutuelle(m);
      const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
      const cotAnnuelle = (Number(m.cotisation_mensuelle) || 0) * 12;
      return [
        `"${num}"`,
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${m.organisme || ''}"`,
        `"${m.numero_adherent || ''}"`,
        `"${m.date_adhesion || ''}"`,
        `"${m.date_echeance || ''}"`,
        `"${m.couverture || ''}"`,
        `"${m.personnes_a_charge ?? 0}"`,
        `"${m.cotisation_mensuelle ?? 0}"`,
        `"${cotAnnuelle}"`,
        `"${st.short}"`,
        `"${al.short}"`,
        `"${m.dernier_controle || ''}"`,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const suffix = sourceLabel === 'audit' ? '_audit' : '';
    const filename = `donnees-mutuelle${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
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
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: sourceLabel === 'audit' ? 'export_audit' : 'export_csv',
      mutuelle_id: null,
      employee_id: null,
      nb_lignes: rowsData.length,
      user: 'DRH',
    });
  };

  // ============================================================
  // PROMPT 6 : Export PDF — N° Adhérent masqué (sécurité RGPD)
  // Ouvre une nouvelle fenêtre avec un HTML imprimable, filtres appliqués,
  // N° Adhérent masqué (XX****XX), mise en forme des lignes en anomalie.
  // data : source (défaut = filtered). Le rapport d'audit appelle avec auditData.
  // ============================================================
  const handleExportPDF = (data) => {
    const rowsData = data || filtered;
    const dateStr = new Date().toLocaleString('fr-FR');
    const filename = `Export_Mutuelle_PDF_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filtresActifs = [];
    if (search) filtresActifs.push(`Recherche: "${search}"`);
    if (fOrganisme) filtresActifs.push(`Organisme: ${fOrganisme}`);
    if (fStatut) filtresActifs.push(`Statut: ${fStatut}`);
    if (fAlerte) filtresActifs.push(`Alerte: ${fAlerte}`);
    if (fCouverture) filtresActifs.push(`Couverture: ${fCouverture}`);
    const isAudit = Boolean(data);
    const filtresHTML = isAudit
      ? `<div class="filters"><strong>Source :</strong> <span class="filter-chip">Rapport d'audit — toutes les adhésions (triées par Employé + Organisme)</span></div>`
      : (filtresActifs.length > 0
        ? `<div class="filters"><strong>Filtres appliqués :</strong> ${filtresActifs.map(f => `<span class="filter-chip">${f}</span>`).join('')}</div>`
        : `<div class="filters"><strong>Filtres :</strong> <span class="filter-chip">Aucun (toutes les adhésions)</span></div>`);

    const rowsHTML = rowsData.map(m => {
      const emp = findEmployee(m.employee_id);
      const st = calculerStatutMutuelle(m);
      const al = calculerAlerteMutuelle(m);
      const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
      const adhMasque = m.numero_adherent ? `${m.numero_adherent.slice(0, 2)}****${m.numero_adherent.slice(-2)}` : '— MANQUANT —';
      const isAnomalie = al.short === 'Expiré' || al.short === '<30j';
      const rowClass = isAnomalie ? 'row-anomalie' : '';
      return `<tr class="${rowClass}">
        <td>${num}</td>
        <td>${emp?.matricule || '—'}</td>
        <td>${emp ? employeeFullName(emp) : 'Non trouvé'}</td>
        <td>${m.organisme || '—'}</td>
        <td class="adh">${adhMasque}</td>
        <td>${m.couverture || '—'}</td>
        <td style="text-align:right">${formatNumber(m.cotisation_mensuelle || 0)} FCFA</td>
        <td>${m.date_echeance ? formatDate(m.date_echeance) : 'Permanent'}</td>
        <td>${st.short}</td>
        <td>${al.short}</td>
      </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Mutuelle & Prévoyance — Export PDF</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2a3a; font-size: 11px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #7e3ff2; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 18px; margin: 0; color: #0b2a4a; }
  .header .meta { text-align: right; font-size: 10px; color: #6b7a8a; }
  .filters { background: #f4f7fc; border: 1px solid #e9edf2; border-radius: 4px; padding: 8px 10px; margin-bottom: 12px; font-size: 10px; }
  .filter-chip { display: inline-block; background: rgba(126,63,242,0.1); color: #7e3ff2; padding: 2px 8px; border-radius: 10px; margin-right: 6px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #2c3e50; color: #fff; padding: 6px 5px; text-align: left; font-weight: 700; border: 1px solid #2c3e50; }
  td { padding: 5px 5px; border: 1px solid #d6dde6; vertical-align: middle; }
  tr:nth-child(even) td { background: #fafbfc; }
  .row-anomalie td { background: #ffe5e8 !important; color: #b33a4a; font-weight: 600; }
  .adh { font-family: monospace; font-weight: 700; color: #0b2a4a; }
  .footer { margin-top: 14px; font-size: 9px; color: #9aa8b8; border-top: 1px solid #e9edf2; padding-top: 6px; }
  .alert-gdpr { background: rgba(184,106,42,0.08); border-left: 3px solid #b86a2a; padding: 6px 10px; margin-bottom: 10px; font-size: 9px; color: #b86a2a; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🏥 Mutuelle & Prévoyance — ${isAudit ? 'Rapport Audit' : 'Export PDF'}</h1>
      <div style="font-size: 10px; color: #6b7a8a; margin-top: 2px;">Tableau structuré T_Mutuelle — Domaine 2 (Administration Personnel)</div>
    </div>
    <div class="meta">
      <div><strong>Date :</strong> ${dateStr}</div>
      <div><strong>Nombre :</strong> ${rowsData.length} enregistrement(s)</div>
      <div><strong>Édité par :</strong> DRH</div>
    </div>
  </div>
  <div class="alert-gdpr">
    🔒 <strong>Sécurité RGPD :</strong> les N° Adhérent sont masqués (XX****XX) dans ce document. Pour un export avec données complètes, utilisez « Export Paie » (sécurisé par mot de passe).
  </div>
  ${filtresHTML}
  <table>
    <thead>
      <tr>
        <th>N°</th>
        <th>Matricule</th>
        <th>Employé</th>
        <th>Organisme</th>
        <th>N° Adhérent (masqué)</th>
        <th>Couverture</th>
        <th>Cotis. Mens.</th>
        <th>Échéance</th>
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
    Audit trail : MUTUELLE_AUDIT_TRAIL · EXPORTS_LOG.
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
    setSnack({ msg: `📄 Export PDF généré (${rowsData.length} enregistrement(s)) — N° Adhérent masqué`, severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: isAudit ? 'export_audit' : 'export_pdf',
      filename,
      nb_lignes: rowsData.length,
      statut: 'succès',
      user: 'DRH',
    });
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: isAudit ? 'export_audit' : 'export_pdf',
      mutuelle_id: null,
      employee_id: null,
      nb_lignes: rowsData.length,
      adh_masque: true,
      user: 'DRH',
    });
  };

  // ============================================================
  // PROMPT 6 : Export Paie — CSV avec N° Adhérent COMPLET (sensible)
  // Protégé par mot de passe (double saisie, ≥ 6 caractères).
  // Colonnes restreintes : Matricule, Employé, Organisme, N° Adhérent, Cotisation Mensuelle.
  // Toutes les adhésions (indépendamment des filtres) — pour le prélèvement paie.
  // ============================================================
  const handleExportPaie = () => {
    if (!paieDialog) { setPaieDialog({ password: '', confirmPassword: '' }); return; }
    const { password, confirmPassword } = paieDialog;
    if (!password || password.length < 6) {
      setSnack({ msg: '🔒 Mot de passe trop court (6 caractères minimum)', severity: 'warning' });
      return;
    }
    if (password !== confirmPassword) {
      setSnack({ msg: '🔒 Les mots de passe ne correspondent pas', severity: 'warning' });
      return;
    }
    // Mot de passe OK → génération du CSV avec N° Adhérent complet (non masqué)
    const headers = ['Matricule', 'Employé', 'Organisme', 'N° Adhérent', 'Cotisation Mensuelle (FCFA)'];
    const rows = MUTUELLES.map(m => {
      const emp = findEmployee(m.employee_id);
      return [
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${m.organisme || ''}"`,
        `"${m.numero_adherent || ''}"`,
        `"${m.cotisation_mensuelle ?? 0}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    const filename = `Export_Mutuelle_Paie_${today}.csv`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setPaieDialog(null);
    setSnack({ msg: '✅ Export paie généré (N° Adhérent complets) — fichier sensible', severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: 'export_paie',
      filename,
      nb_lignes: MUTUELLES.length,
      statut: 'succès',
      user: 'DRH',
    });
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'export_paie',
      mutuelle_id: null,
      employee_id: null,
      nb_lignes: MUTUELLES.length,
      adh_masque: false,
      user: 'DRH',
      note: 'Export paie avec N° Adhérent complet — mot de passe fourni',
    });
  };

  // --- Création ---
  const handleCreate = () => {
    if (!newMut.employee_id) { setSnack({ msg: 'Veuillez sélectionner un employé', severity: 'warning' }); return; }
    const num = `MUT-${String(MUTUELLES.length + 1).padStart(3, '0')}`;
    MUTUELLES.push({
      id: `mut-${Date.now()}`,
      employee_id: newMut.employee_id,
      organisme: newMut.organisme || '',
      numero_adherent: newMut.numero_adherent || '',
      date_adhesion: newMut.date_adhesion || '',
      date_echeance: newMut.date_echeance || '',
      couverture: newMut.couverture || '',
      personnes_a_charge: Number(newMut.personnes_a_charge) || 0,
      cotisation_mensuelle: Number(newMut.cotisation_mensuelle) || 0,
      dernier_controle: new Date().toISOString().slice(0, 10),
      notes: newMut.notes || '',
    });
    setCreateDialog(false);
    setNewMut({});
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Enregistrement ${num} créé`, severity: 'success' });
  };

  // --- Édition (MAJ date_maj + dernier_controle = aujourd'hui) ---
  const handleSaveEdit = () => {
    if (!editDialog) return;
    const idx = MUTUELLES.findIndex(m => m.id === editDialog.id);
    if (idx !== -1) {
      const now = new Date().toISOString().slice(0, 10);
      MUTUELLES[idx] = {
        ...MUTUELLES[idx],
        ...editDialog,
        personnes_a_charge: Number(editDialog.personnes_a_charge) || 0,
        cotisation_mensuelle: Number(editDialog.cotisation_mensuelle) || 0,
        // Si Dernier Contrôle n'a pas été modifié manuellement, on force à aujourd'hui
        dernier_controle: editDialog.dernier_controle || now,
      };
    }
    setEditDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: 'Donnée mutuelle modifiée', severity: 'success' });
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'modifier_adhesion',
      mutuelle_id: editDialog?.id || null,
      employee_id: editDialog?.employee_id || null,
      user: 'DRH',
      details: 'Modification couverture/cotisation via dialog ✏️',
    });
  };

  // --- Navigation vers fiche employé ---
  const handleVoirFiche = (employeeId) => {
    navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${employeeId}`);
  };

  // --- PROMPT 5 : Renouveler l'adhésion (+1 an) ---
  // Si date_echeance vide → aujourd'hui + 1 an (et snackbar "Date d'échéance définie au ...")
  // Si date_echeance existe → +1 an sur cette date (et snackbar "Adhésion renouvelée jusqu'au ...")
  // Met à jour dernier_controle à aujourd'hui et déclenche le re-render.
  const handleRenouveler = (m) => {
    const idx = MUTUELLES.findIndex(x => x.id === m.id);
    if (idx === -1) return;
    const now = new Date().toISOString().slice(0, 10);
    let nouvelleDate;
    let message;
    if (!m.date_echeance) {
      // Aucune date d'échéance — on définit aujourd'hui + 1 an
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      nouvelleDate = d.toISOString().slice(0, 10);
      message = `Date d'échéance définie au ${formatDate(nouvelleDate)}`;
    } else {
      // Date existante — on ajoute 1 an
      const d = new Date(m.date_echeance);
      d.setFullYear(d.getFullYear() + 1);
      nouvelleDate = d.toISOString().slice(0, 10);
      message = `Adhésion renouvelée jusqu'au ${formatDate(nouvelleDate)}`;
    }
    MUTUELLES[idx] = {
      ...MUTUELLES[idx],
      date_echeance: nouvelleDate,
      dernier_controle: now,
    };
    setRefreshKey(k => k + 1);
    setSnack({ msg: message, severity: 'success' });
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'renouveler_adhesion',
      mutuelle_id: m.id,
      employee_id: m.employee_id,
      user: 'DRH',
      details: `Nouvelle échéance: ${formatDate(nouvelleDate)}`,
    });
  };

  // --- PROMPT 5 : Envoyer les rappels mutuelle maintenant ---
  // Génère le corps de l'email via genererCorpsEmailMutuelle, met à jour dernier_controle
  // de chaque adhésion en anomalie, ouvre le dialog récapitulatif.
  const handleSendRappels = () => {
    if (!alerteConfig.activer) {
      setSnack({ msg: 'Les alertes sont désactivées. Activez-les dans la configuration.', severity: 'warning' });
      return;
    }
    if (!alerteConfig.destinataires?.trim()) {
      setSnack({ msg: 'Aucun destinataire configuré. Ajoutez des emails dans la configuration.', severity: 'warning' });
      return;
    }
    const recap = genererCorpsEmailMutuelle(MUTUELLES);
    if (!recap) {
      setSnack({ msg: 'Aucune anomalie mutuelle détectée. Aucun email envoyé.', severity: 'info' });
      return;
    }
    // Met à jour dernier_controle (col N) pour chaque adhésion en anomalie
    const now = new Date().toISOString().slice(0, 10);
    recap.docsAlerte.forEach(m => {
      const idx = MUTUELLES.findIndex(x => x.id === m.id);
      if (idx !== -1) {
        MUTUELLES[idx].dernier_controle = now;
      }
    });
    // Met à jour derniere_execution dans CONFIG
    CONFIG_ALERTES_MUTUELLE.derniere_execution = now;
    setAlerteConfig({ ...CONFIG_ALERTES_MUTUELLE });
    // Audit trail
    ALERTES_MUTUELLE_HISTORIQUE.push({
      timestamp: new Date().toISOString(),
      destinataires: alerteConfig.destinataires,
      nb_anomalies: recap.count,
      mutuelles: recap.docsAlerte.map(m => m.id),
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

  // --- PROMPT 5 : Sauvegarder la configuration des alertes mutuelle ---
  const handleSaveConfig = () => {
    CONFIG_ALERTES_MUTUELLE.destinataires = alerteConfig.destinataires;
    CONFIG_ALERTES_MUTUELLE.frequence_jours = alerteConfig.frequence_jours;
    CONFIG_ALERTES_MUTUELLE.activer = alerteConfig.activer;
    CONFIG_ALERTES_MUTUELLE.objet_email = alerteConfig.objet_email;
    setConfigDialog(false);
    setSnack({ msg: 'Configuration des alertes mutuelle enregistrée', severity: 'success' });
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
  // handleOpenKpi(type) : ouvre le dialog KPI + réinitialise la sélection
  // handleToggleKpiSelect(id) : toggle une adhésion dans kpiSelected (Set)
  // handleToggleAllKpi() : sélectionne/désélectionne toutes les adhésions visibles
  // handleRenouvelerSelectionKpi() : renouvelle les adhésions sélectionnées (+1 an chacune)
  // handleRenouvelerToutKpi() : renouvelle TOUTES les adhésions du dialog (ex: tous les expirés)
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
      setKpiSelected(new Set(kpiData.data.map(m => m.id)));
    }
  };

  const handleRenouvelerSelectionKpi = () => {
    if (kpiSelected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins une adhésion', severity: 'warning' });
      return;
    }
    let count = 0;
    kpiSelected.forEach(id => {
      const idx = MUTUELLES.findIndex(x => x.id === id);
      if (idx !== -1) {
        const now = new Date().toISOString().slice(0, 10);
        const m = MUTUELLES[idx];
        let nouvelleDate;
        if (!m.date_echeance) {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          nouvelleDate = d.toISOString().slice(0, 10);
        } else {
          const d = new Date(m.date_echeance);
          d.setFullYear(d.getFullYear() + 1);
          nouvelleDate = d.toISOString().slice(0, 10);
        }
        MUTUELLES[idx] = { ...MUTUELLES[idx], date_echeance: nouvelleDate, dernier_controle: now };
        count++;
        MUTUELLE_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'renouveler_adhesion',
          mutuelle_id: m.id,
          employee_id: m.employee_id,
          user: 'DRH',
          details: `Renouvellement groupé depuis KPI dialog — Nouvelle échéance: ${formatDate(nouvelleDate)}`,
        });
      }
    });
    setKpiSelected(new Set());
    setRefreshKey(k => k + 1);
    setSnack({ msg: `🔄 ${count} adhésion(s) renouvelée(s) avec succès`, severity: 'success' });
  };

  const handleRenouvelerToutKpi = () => {
    if (!kpiData || kpiData.data.length === 0) return;
    let count = 0;
    kpiData.data.forEach(m => {
      const idx = MUTUELLES.findIndex(x => x.id === m.id);
      if (idx !== -1) {
        const now = new Date().toISOString().slice(0, 10);
        let nouvelleDate;
        if (!m.date_echeance) {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          nouvelleDate = d.toISOString().slice(0, 10);
        } else {
          const d = new Date(m.date_echeance);
          d.setFullYear(d.getFullYear() + 1);
          nouvelleDate = d.toISOString().slice(0, 10);
        }
        MUTUELLES[idx] = { ...MUTUELLES[idx], date_echeance: nouvelleDate, dernier_controle: now };
        count++;
        MUTUELLE_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'renouveler_adhesion',
          mutuelle_id: m.id,
          employee_id: m.employee_id,
          user: 'DRH',
          details: `Renouvellement en masse (bouton "Renouveler tout") — Nouvelle échéance: ${formatDate(nouvelleDate)}`,
        });
      }
    });
    setKpiSelected(new Set());
    setRefreshKey(k => k + 1);
    setSnack({ msg: `🔄 ${count} adhésion(s) renouvelée(s) en masse`, severity: 'success' });
    // Ferme le dialog si plus aucune adhésion dans la catégorie après renouvellement
    if (kpiDialog === 'expires' || kpiDialog === 'aRenouveler') {
      setTimeout(() => setKpiDialog(null), 800);
    }
  };

  // --- INTERACTIVITÉ LIGNES : handlers pour les nouvelles actions ---
  // handleOpenPersDialog(m) : ouvre le dialog de modification du nombre de personnes à charge
  // handleSavePers() : valide la nouvelle valeur + met à jour MUTUELLES + audit trail
  // handleExporterLigne(m) : exporte les données d'une ligne en CSV individuel
  // handleSupprimer(m) : supprime l'adhésion après confirmation (avec audit trail)
  // handleFicheComplete(m) : ouvre le pop-up récapitulatif complet d'une adhésion
  const handleOpenPersDialog = (m) => {
    setPersDialog(m);
    setPersValue(Number(m.personnes_a_charge) || 0);
  };

  const handleSavePers = () => {
    if (!persDialog) return;
    const newPers = Math.max(0, parseInt(persValue) || 0);
    const idx = MUTUELLES.findIndex(x => x.id === persDialog.id);
    if (idx !== -1) {
      const now = new Date().toISOString().slice(0, 10);
      MUTUELLES[idx] = {
        ...MUTUELLES[idx],
        personnes_a_charge: newPers,
        dernier_controle: now,
      };
      MUTUELLE_AUDIT_TRAIL.push({
        timestamp: new Date().toISOString(),
        action: 'modifier_personnes_a_charge',
        mutuelle_id: persDialog.id,
        employee_id: persDialog.employee_id,
        user: 'DRH',
        details: `Personnes à charge: ${persDialog.personnes_a_charge ?? 0} → ${newPers}`,
      });
    }
    setPersDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: `✅ Personnes à charge mises à jour: ${newPers}`, severity: 'success' });
  };

  const handleExporterLigne = (m) => {
    const emp = findEmployee(m.employee_id);
    const st = calculerStatutMutuelle(m);
    const al = calculerAlerteMutuelle(m);
    const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
    const cotAnnuelle = (Number(m.cotisation_mensuelle) || 0) * 12;
    const headers = ['N°', 'Matricule', 'Employé', 'Organisme', 'N° Adhérent', 'Date Adhésion', 'Date Échéance', 'Couverture', 'Personnes à Charge', 'Cotisation Mensuelle', 'Cotisation Annuelle', 'Statut', 'Alerte', 'Dernier Contrôle', 'Notes'];
    const row = [
      `"${num}"`, `"${emp?.matricule || ''}"`, `"${emp ? employeeFullName(emp) : ''}"`,
      `"${m.organisme || ''}"`, `"${m.numero_adherent || ''}"`, `"${m.date_adhesion || ''}"`,
      `"${m.date_echeance || ''}"`, `"${m.couverture || ''}"`, `"${m.personnes_a_charge ?? 0}"`,
      `"${m.cotisation_mensuelle ?? 0}"`, `"${cotAnnuelle}"`, `"${st.short}"`, `"${al.short}"`,
      `"${m.dernier_controle || ''}"`, `"${(m.notes || '').replace(/"/g, '""')}"`,
    ];
    const csv = '\uFEFF' + headers.join(';') + '\n' + row.join(';');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const empName = emp ? employeeFullName(emp).replace(/\s+/g, '_') : 'employe';
    const filename = `Adhesion_${empName}_${num}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: 'export_ligne',
      filename,
      nb_lignes: 1,
      statut: 'succès',
      user: 'DRH',
    });
    MUTUELLE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'export_ligne',
      mutuelle_id: m.id,
      employee_id: m.employee_id,
      user: 'DRH',
      details: `Export individuel ligne ${num}`,
    });
    setSnack({ msg: `📋 Ligne ${num} exportée (${filename})`, severity: 'success' });
  };

  const handleSupprimer = () => {
    if (!supprimerDialog) return;
    const idx = MUTUELLES.findIndex(x => x.id === supprimerDialog.id);
    if (idx !== -1) {
      const num = `MUT-${String(idx + 1).padStart(3, '0')}`;
      MUTUELLE_AUDIT_TRAIL.push({
        timestamp: new Date().toISOString(),
        action: 'supprimer_adhesion',
        mutuelle_id: supprimerDialog.id,
        employee_id: supprimerDialog.employee_id,
        user: 'DRH',
        details: `Suppression adhésion ${num}`,
      });
      MUTUELLES.splice(idx, 1);
      setSnack({ msg: `🗑️ Adhésion ${num} supprimée`, severity: 'success' });
    }
    setSupprimerDialog(null);
    setRefreshKey(k => k + 1);
  };

  const handleFicheComplete = (m) => {
    setFicheCompleteDialog(m);
  };

  return (
    <Box>
      {/* === KPI INTERACTIFS (centre de commande opérationnel) === */}
      {/* Chaque KPI est cliquable → ouvre un dialog contextuel avec liste + actions */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {/* 1. Total adhérents — VIOLET → Liste complète + Ajouter/Exporter */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('total')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${VIOLET}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(126,63,242,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir la liste des adhérents + actions' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: VIOLET, fontSize: '1.6rem' }}>{stats.total}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>Total adhérents</Typography>
                <Chip label='Voir' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: VIOLET, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NBVAL(T_Mutuelle[N°])</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 2. 💰 Cotisation mensuelle totale — VERT → Détail par organisme */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('cotMensuelle')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${VERT}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(26,122,74,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir le détail des cotisations mensuelles' placement='top'>
              <Box>
                <Typography variant='h6' fontWeight={800} sx={{ color: VERT, fontSize: '1.05rem', fontFamily: 'monospace' }} title={`${formatNumber(stats.cotMensuelleTotale)} FCFA`}>
                  {formatNumber(stats.cotMensuelleTotale)}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: VERT, fontFamily: 'monospace', display: 'block' }}>FCFA/mois</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>💰 Cot. mensuelle totale</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=SOMME(Cot_Mensuelle)</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 3. 💰 Cotisation annuelle totale — NAVY → Détail par organisme */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('cotAnnuelle')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${NAVY}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(11,42,74,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir le détail des cotisations annuelles' placement='top'>
              <Box>
                <Typography variant='h6' fontWeight={800} sx={{ color: NAVY, fontSize: '1.05rem', fontFamily: 'monospace' }} title={`${formatNumber(stats.cotAnnuelleTotale)} FCFA`}>
                  {formatNumber(stats.cotAnnuelleTotale)}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: NAVY, fontFamily: 'monospace', display: 'block' }}>FCFA/an</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>💰 Cot. annuelle totale</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=SOMME(Cot_Annuelle)</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 4. 📊 Taux de couverture — dynamique → Breakdown + actions d'amélioration */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('tauxCouverture')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${stats.tauxCouverture >= 90 ? VERT : stats.tauxCouverture >= 70 ? ORANGE : ROUGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: `0 8px 24px ${stats.tauxCouverture >= 90 ? 'rgba(26,122,74,0.18)' : stats.tauxCouverture >= 70 ? 'rgba(184,106,42,0.18)' : 'rgba(179,58,74,0.18)'}`, transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir le détail du taux de couverture' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: stats.tauxCouverture >= 90 ? VERT : stats.tauxCouverture >= 70 ? ORANGE : ROUGE, fontSize: '1.6rem' }}>{stats.tauxCouverture}%</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>📊 Taux de couverture</Typography>
                <Chip label={stats.tauxCouverture >= 90 ? 'Excellent' : stats.tauxCouverture >= 70 ? 'Moyen' : 'Critique'} size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: stats.tauxCouverture >= 90 ? VERT : stats.tauxCouverture >= 70 ? ORANGE : ROUGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=1-(Expirés+À renouv.)/Total</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 5. 🟠 À renouveler — ORANGE → Liste + Renouveler sélection/tout */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('aRenouveler')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${ORANGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(184,106,42,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir les adhésions à renouveler + actions' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: ORANGE, fontSize: '1.6rem' }}>{stats.aRenouveler}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🟠 À renouveler</Typography>
                <Chip label='Voir' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: ORANGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Statut;"À renouveler")</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 6. 🔴 Expirés — ROUGE → Liste + Renouveler en masse */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('expires')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${ROUGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(179,58,74,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir les adhésions expirées + renouveler' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.6rem' }}>{stats.expires}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🔴 Expirés</Typography>
                <Chip label='Voir' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: ROUGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Statut;"Expiré")</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 7. 🟡 Aucune pers. — JAUNE → Liste + Modifier couverture */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('aucunePers')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${JAUNE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(212,160,23,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir les adhésions sans personne à charge' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: JAUNE, fontSize: '1.6rem' }}>{stats.aucunePers}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🟡 Aucune pers.</Typography>
                <Chip label='Voir' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: JAUNE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Pers;0)</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        {/* 8. 🟢 Actifs — BLEU → Liste + Modifier/Consulter */}
        <Grid item xs={6} sm={4} md={1.5}>
          <Box onClick={() => handleOpenKpi('actifs')} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${BLEU}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 8px 24px rgba(42,106,154,0.18)', transform: 'translateY(-2px)' } }}>
            <Tooltip title='Cliquer pour voir les adhésions actives' placement='top'>
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ color: BLEU, fontSize: '1.6rem' }}>{stats.actifs}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🟢 Actifs</Typography>
                <Chip label='Voir' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: BLEU, color: '#fff', fontWeight: 700, mt: 0.5 }} />
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Statut;"Actif")</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {/* === PROMPT 4 : GRAPHIQUES (Recharts) — 3 visualisations dynamiques === */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Graphique 1 : Répartition par organisme (BarChart horizontal) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: '1px solid #e9edf2', borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 18, color: BLEU }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition par organisme
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Organisme · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={chartOrganismeData} layout='vertical' margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis type='number' tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <YAxis type='category' dataKey='organisme' tick={{ fontSize: 9, fill: '#6b7a8a' }} width={110} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: '1px solid #e9edf2', borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: 'rgba(42,106,154,0.05)' }}
                    />
                    <Bar dataKey='count' name='Adhésions' radius={[0, 4, 4, 0]}>
                      {chartOrganismeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ORGANISME_COLORS_MAP[entry.organisme] || '#95a5a6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 2 : Répartition par type de couverture (PieChart donut) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: '1px solid #e9edf2', borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutLargeIcon sx={{ fontSize: 18, color: VIOLET }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition par type de couverture
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Couverture · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartCouvertureData}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#6b7a8a', strokeWidth: 0.5 }}
                      style={{ fontSize: '0.62rem' }}
                    >
                      {chartCouvertureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: '1px solid #e9edf2', borderRadius: 2, fontSize: '0.72rem' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.6rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 3 : Statut des adhésions (BarChart vertical) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: '1px solid #e9edf2', borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18, color: ORANGE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Statut des adhésions
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Statut · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={chartStatutData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='statut' tick={{ fontSize: 10, fill: '#6b7a8a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: '1px solid #e9edf2', borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: 'rgba(184,106,42,0.05)' }}
                    />
                    <Bar dataKey='count' name='Adhésions' radius={[4, 4, 0, 0]}>
                      {chartStatutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUT_COLORS_MAP[entry.statut] || '#95a5a6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === PROMPT 5 : SYSTÈME D'ALERTES MUTUELLE === */}
      <Card variant='outlined' sx={{ mb: 2, border: `2px solid ${ROUGE}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(179,58,74,0.06) 0%, rgba(184,106,42,0.04) 100%)` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: alerteStats.total > 0 ? ROUGE : VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NotificationsActiveIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Système d'alertes mutuelle — {alerteStats.total} adhésion(s) en anomalie
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block' }}>
                  {alerteStats.total > 0 ? (
                    <>
                      <strong style={{ color: ROUGE }}>{alerteStats.expires}</strong> expirée(s) · <strong style={{ color: ORANGE }}>{alerteStats.aRenouveler}</strong> à renouveler
                    </>
                  ) : (
                    <>Aucune anomalie détectée — toutes les adhésions mutuelle sont à jour</>
                  )}
                  {alerteConfig.derniere_execution && (
                    <span> · Dernière exécution : <strong>{formatDate(alerteConfig.derniere_execution)}</strong></span>
                  )}
                </Typography>
              </Box>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Tooltip title='Configurer les destinataires, fréquence et activation'>
                <Button variant='outlined' size='small' startIcon={<SettingsIcon />} onClick={() => setConfigDialog(true)} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
                  Config
                </Button>
              </Tooltip>
              <Tooltip title="Envoyer les rappels mutuelle (génère email récap, met à jour dernier_controle)">
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

      <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem' }}>
        <strong>📌 Tableau structuré T_Mutuelle</strong> — 16 colonnes (A-P) avec auto-remplissage Employé (RECHERCHEX C), Cotisation Annuelle (=J×12 K), Statut (SI imbriquée L) et Alerte granulaire (M). Colonnes <LockIcon sx={{ fontSize: 11, verticalAlign: 'middle' }} /> protégées (lecture seule).
      </Alert>

      <Card>
        <CardContent>
          <SectionHeader
            title='Mutuelle Prévoyance (T_Mutuelle)'
            subtitle={`${filtered.length} adhésion(s) · RECHERCHEX employé · Cotisation Annuelle auto · Statut + Alerte auto`}
            action={<Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={() => handleExportCSV()} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
              {/* PROMPT 6 : 3 nouveaux exports sécurisés (PDF / Paie / Audit) */}
              <Tooltip title='Export PDF imprimable — N° Adhérent masqué (sécurité RGPD)'>
                <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={() => handleExportPDF()} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VERT, borderColor: VERT }}>Export PDF</Button>
              </Tooltip>
              <Tooltip title='Export CSV pour la paie — N° Adhérent COMPLET (sécurisé par mot de passe)'>
                <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={() => setPaieDialog({ password: '', confirmPassword: '' })} sx={{ textTransform: 'none', fontSize: '0.75rem', color: ORANGE, borderColor: ORANGE }}>Export Paie</Button>
              </Tooltip>
              <Tooltip title="Rapport d'audit global (toutes les adhésions, triées par employé + organisme)">
                <Button variant='outlined' size='small' startIcon={<AssessmentIcon />} onClick={() => setAuditDialog(true)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: BLEU, borderColor: BLEU }}>Rapport Audit</Button>
              </Tooltip>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewMut({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: VIOLET }}>Nouvelle adhésion</Button>
            </Stack>}
          />

          {/* Filtres (B1-F1 équivalent Excel) — PROMPT 3 avec tri + réinitialiser */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2, alignItems: { md: 'center' } }}>
            <TextField
              size='small' placeholder='Rechercher (nom, organisme, n° adhérent, matricule, couverture)...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
              }}
              sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.8rem' } }}
            />
            <TextField select size='small' label='Organisme' value={fOrganisme} onChange={(e) => { setFOrganisme(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
              <MenuItem value=''>Tous</MenuItem>
              {ORGANISMES_MUTUELLE.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 140 }}>
              <MenuItem value=''>Tous</MenuItem>
              <MenuItem value='Actif'>🟢 Actif</MenuItem>
              <MenuItem value='À renouveler'>🟠 À renouveler</MenuItem>
              <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
            </TextField>
            <TextField select size='small' label='Alerte' value={fAlerte} onChange={(e) => { setFAlerte(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Toutes</MenuItem>
              <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
              <MenuItem value='<30j'>🟠 &lt;30j</MenuItem>
              <MenuItem value='Aucune pers.'>🟡 Aucune pers.</MenuItem>
              <MenuItem value='OK'>🟢 OK</MenuItem>
            </TextField>
            <TextField select size='small' label='Couverture' value={fCouverture} onChange={(e) => { setFCouverture(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Toutes</MenuItem>
              {COUVERTURES_MUTUELLE.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            {activeFilterCount > 0 && (
              <Button size='small' startIcon={<ClearIcon sx={{ fontSize: 14 }} />} onClick={handleResetFilters} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE, flexShrink: 0 }}>
                Réinitialiser
              </Button>
            )}
          </Stack>

          {/* Compteur dynamique + formule FILTRE + chip filtres actifs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, px: 1 }} justifyContent='space-between'>
            <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap' useFlexGap>
              <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>
                <strong style={{ color: NAVY, fontSize: '0.85rem' }}>{filtered.length}</strong> adhésion(s) affichée(s) sur {MUTUELLES.length}
              </Typography>
              <Chip label={`=NBVAL(Plage_Filtrée) = ${filtered.length}`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(126,63,242,0.08)', color: VIOLET, fontFamily: 'monospace', fontWeight: 700 }} />
              {activeFilterCount > 0 && (
                <Chip icon={<FilterListIcon sx={{ fontSize: 12 }} />} label={`${activeFilterCount} filtre(s) actif(s)`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(126,63,242,0.15)', color: VIOLET, fontWeight: 700 }} />
              )}
              {sortConfig.key && (
                <Chip label={`Tri: ${sortConfig.key} (${sortConfig.direction})`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(11,42,74,0.08)', color: NAVY, fontWeight: 600 }} />
              )}
              {filtered.length === 0 && (
                <Chip label='Aucune adhésion trouvée — SIERREUR(FILTRE(...))' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
              )}
            </Stack>
            <Tooltip title='Formule Excel FILTRE multi-critères'>
              <Box sx={{ p: 0.8, bgcolor: 'rgba(126,63,242,0.05)', borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.55rem', color: VIOLET, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', md: 600 } }}>
                {'=SIERREUR(FILTRE(T_Mutuelle[#Tout]; (SI(ESTVIDE(B1);VRAI;Organisme=B1)) * (SI(ESTVIDE(C1);VRAI;Statut=C1)) * (SI(ESTVIDE(D1);VRAI;Alerte=D1)) * (SI(ESTVIDE(E1);VRAI;Couverture=E1)) * (SI(ESTVIDE(F1);VRAI;ESTNUM(CHERCHE(F1;Nom&Organisme&N_Adherent&Matricule))))); "Aucune adhésion trouvée")'}
              </Box>
            </Tooltip>
          </Stack>

          {/* Tableau T_Mutuelle — en-têtes foncées + lignes alternées */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, overflowX: 'auto', maxWidth: '100%', '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#c1c9d4', borderRadius: 4 } }}>
            <Table size='small' stickyHeader sx={{ '& .MuiTableCell-head': { bgcolor: '#2c3e50', color: '#fff', fontWeight: 700, fontSize: '0.68rem', borderBottom: '2px solid #1a2a3a', whiteSpace: 'nowrap' }, tableLayout: 'auto' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2c3e50' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>A</Box>N°<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('numero_adherent')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'numero_adherent' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>B</Box>Matricule</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>C</Box>Employé<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('employee')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'employee' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>D</Box>Organisme<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('organisme')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'organisme' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>E</Box>N° Adhérent</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>F</Box>Date Adhésion</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>G</Box>Date Échéance<IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('date_echeance')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'date_echeance' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>H</Box>Couverture</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>I</Box>Pers. à Charge</Stack></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center' justifyContent='flex-end'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>J</Box>Cot. Mensuelle</Stack></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center' justifyContent='flex-end'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>K</Box>Cot. Annuelle<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>L</Box>Statut<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('statut')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'statut' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>M</Box>Alerte<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /><IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('alerte')}><ArrowUpwardIcon sx={{ fontSize: 10, color: sortConfig.key === 'alerte' ? VIOLET : '#777' }} /></IconButton></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>N</Box>Dernier Contrôle</Stack></TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.62rem', position: 'sticky', right: 0, zIndex: 2, bgcolor: '#2c3e50', boxShadow: '-6px 0 12px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}><Stack direction='row' spacing={0.3} alignItems='center' justifyContent='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>O</Box>Actions</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>P</Box>Notes</Stack></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((m, idx) => {
                  const emp = findEmployee(m.employee_id);
                  const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                  const statut = calculerStatutMutuelle(m);
                  const alerte = calculerAlerteMutuelle(m);
                  const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
                  const cotMensuelle = Number(m.cotisation_mensuelle) || 0;
                  const cotAnnuelle = cotMensuelle * 12;
                  const orgStyle = getOrganismeStyle(m.organisme);
                  const persCharge = Number(m.personnes_a_charge) || 0;
                  const isExpiré = statut.short === 'Expiré';
                  const isARenouveler = statut.short === 'À renouveler';
                  // PROMPT 5 : adhésion "Permanent" = pas de date d'échéance ET organisme CNPS
                  // (cas d'une adhésion CNPS permanente — non renouvelable)
                  const isPermanentCnps = !m.date_echeance && m.organisme === 'CNPS';
                  return (
                    <TableRow key={m.id} hover sx={{
                      // Lignes alternées + mise en forme conditionnelle
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
                      {/* C: Employé (RECHERCHEX auto, lock) — CLIQUABLE → ouvre fiche employé */}
                      <TableCell sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title={`=RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E; "Non trouvé"; 0)`}>
                          <Stack direction='row' spacing={0.5} alignItems='center' sx={{ cursor: 'pointer', '&:hover': { color: VIOLET } }} onClick={() => handleVoirFiche(m.employee_id)}>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>{empName}</Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* D: Organisme (chip coloré) */}
                      <TableCell>
                        {m.organisme ? (
                          <Chip label={m.organisme} size='small' sx={{ fontSize: '0.58rem', height: 20, bgcolor: orgStyle.bg, color: orgStyle.color, fontWeight: 700, border: `1px solid ${orgStyle.color}30` }} />
                        ) : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>}
                      </TableCell>
                      {/* E: N° Adhérent (monospace) */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem', color: NAVY, fontWeight: 600 }}>{m.numero_adherent || '—'}</Typography></TableCell>
                      {/* F: Date Adhésion */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontSize: '0.66rem', color: m.date_adhesion ? NAVY : '#9aa8b8' }}>{m.date_adhesion ? formatDate(m.date_adhesion) : '—'}</Typography></TableCell>
                      {/* G: Date Échéance — CLIQUABLE → renouvelle l'adhésion (si pas permanente CNPS) */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {m.date_echeance ? (
                          <Tooltip title={isPermanentCnps ? 'Adhésion permanente' : 'Cliquer pour renouveler (+1 an)'}>
                            <Typography variant='caption' onClick={() => !isPermanentCnps && handleRenouveler(m)} sx={{ fontSize: '0.66rem', fontWeight: 700, color: isExpiré ? ROUGE : isARenouveler ? ORANGE : NAVY, cursor: isPermanentCnps ? 'default' : 'pointer', '&:hover': isPermanentCnps ? {} : { textDecoration: 'underline', color: ORANGE } }}>{formatDate(m.date_echeance)}</Typography>
                          </Tooltip>
                        ) : (
                          <Chip label='Permanent' size='small' variant='outlined' sx={{ fontSize: '0.55rem', height: 16, color: VERT, borderColor: VERT, fontWeight: 700 }} />
                        )}
                      </TableCell>
                      {/* H: Couverture — CLIQUABLE → ouvre le dialog de modification */}
                      <TableCell>
                        {m.couverture ? (
                          <Tooltip title='Cliquer pour modifier la couverture'>
                            <Chip label={m.couverture} size='small' variant='outlined' onClick={() => setEditDialog({ ...m })} sx={{ fontSize: '0.58rem', height: 18, color: NAVY, borderColor: NAVY, fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(126,63,242,0.08)', borderColor: VIOLET, color: VIOLET } }} />
                          </Tooltip>
                        ) : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>}
                      </TableCell>
                      {/* I: Personnes à Charge — CLIQUABLE → ouvre le dialog de modification du nombre */}
                      <TableCell>
                        {persCharge === 0 ? (
                          <Tooltip title='Cliquer pour ajouter une personne à charge'>
                            <Chip label='Aucune pers.' size='small' onClick={() => handleOpenPersDialog(m)} sx={{ fontSize: '0.55rem', height: 18, bgcolor: 'rgba(212,160,23,0.15)', color: JAUNE, fontWeight: 700, border: `1px solid ${JAUNE}40`, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(212,160,23,0.25)' } }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title='Cliquer pour modifier le nombre de personnes à charge'>
                            <Typography variant='caption' onClick={() => handleOpenPersDialog(m)} sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: NAVY, cursor: 'pointer', '&:hover': { color: VIOLET, textDecoration: 'underline' } }}>{persCharge}</Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      {/* J: Cotisation Mensuelle — CLIQUABLE → ouvre le dialog de modification */}
                      <TableCell align='right'>
                        <Tooltip title='Cliquer pour modifier la cotisation mensuelle'>
                          <Typography variant='caption' onClick={() => setEditDialog({ ...m })} sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: NAVY, fontWeight: 600, cursor: 'pointer', '&:hover': { color: VIOLET, textDecoration: 'underline' } }}>
                            {formatNumber(cotMensuelle)} <span style={{ color: '#9aa8b8', fontSize: '0.6rem' }}>FCFA</span>
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      {/* K: Cotisation Annuelle (auto =J*12, lock) */}
                      <TableCell align='right' sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title='=[@[Cotisation Mensuelle]]*12'>
                          <Stack direction='row' spacing={0.5} alignItems='center' justifyContent='flex-end'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: VERT, fontWeight: 700 }}>
                              {formatNumber(cotAnnuelle)} <span style={{ color: '#9aa8b8', fontSize: '0.6rem' }}>FCFA</span>
                            </Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* L: Statut (auto, lock) */}
                      <TableCell sx={{ bgcolor: statut.bg }}>
                        <Tooltip title='=SI([@[Date Échéance]]=""; "Actif"; SI(<AUJOURDHUI(); "Expiré"; SI(<=+30; "À renouveler"; "Actif")))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={statut.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: statut.bg, color: statut.color, fontWeight: 700, border: `1px solid ${statut.color}30` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* M: Alerte (auto, lock, indépendante de L, borderLeft) */}
                      <TableCell sx={{ bgcolor: alerte.bg, borderLeft: `3px solid ${alerte.color}` }}>
                        <Tooltip title='=SI(Statut="Expiré"; "🔴 Expiré"; SI(Statut="À renouveler"; "🟠 <30j"; SI(Pers=0; "🟡 Aucune pers. à charge"; "🟢 OK")))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={alerte.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: alerte.bg, color: alerte.color, fontWeight: 700, border: `1px solid ${alerte.color}40` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* N: Dernier Contrôle */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant='caption' sx={{ fontSize: '0.66rem', color: m.dernier_controle ? BLEU : '#9aa8b8' }}>{m.dernier_controle ? formatDate(m.dernier_controle) : '—'}</Typography></TableCell>
                      {/* O: Actions — 7 boutons (sticky right, 2 lignes pour réduire largeur) */}
                      {/* 👤 Voir fiche · ✏️ Modifier · 🔄 Renouveler · ➕ Ajouter pers | 📊 Fiche complète · 📋 Exporter · 🗑️ Supprimer */}
                      <TableCell align='center' sx={{ position: 'sticky', right: 0, zIndex: 1, bgcolor: isExpiré ? '#fce8ea' : isARenouveler ? '#fdf0e3' : idx % 2 === 0 ? '#f8f9fa' : '#fff', boxShadow: '-6px 0 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', '&:hover': { bgcolor: isExpiré ? '#f8d7da' : isARenouveler ? '#f8d9c0' : 'action.hover' } }}>
                        <Stack spacing={0.3} alignItems='center'>
                          {/* Ligne 1 : 4 icônes principales */}
                          <Stack direction='row' spacing={0.3} justifyContent='center' alignItems='center'>
                            <Tooltip title='Voir fiche employé'>
                              <IconButton size='small' sx={{ color: VIOLET, p: 0.4 }} onClick={() => handleVoirFiche(m.employee_id)}>
                                <VisibilityIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Modifier (dialog complet)'>
                              <IconButton size='small' color='info' sx={{ p: 0.4 }} onClick={() => setEditDialog({ ...m })}>
                                <EditIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            {/* 🔄 Renouveler (+1 an) — ORANGE — désactivé si adhésion permanente CNPS */}
                            <Tooltip title={isPermanentCnps ? "Adhésion permanente CNPS — non renouvelable" : "Renouveler l'adhésion (+1 an)"}>
                              <span>
                                <IconButton
                                  size='small'
                                  sx={{ color: ORANGE, p: 0.4 }}
                                  onClick={() => handleRenouveler(m)}
                                  disabled={isPermanentCnps}
                                >
                                  <AutorenewIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {/* ➕ Ajouter / Modifier personnes à charge — JAUNE */}
                            <Tooltip title={`Modifier les personnes à charge (actuel: ${persCharge})`}>
                              <IconButton size='small' sx={{ color: JAUNE, p: 0.4 }} onClick={() => handleOpenPersDialog(m)}>
                                <PersonAddIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          {/* Ligne 2 : 3 icônes secondaires */}
                          <Stack direction='row' spacing={0.3} justifyContent='center' alignItems='center'>
                            {/* 📊 Fiche complète (pop-up récapitulatif) — BLEU */}
                            <Tooltip title='Fiche complète (pop-up récapitulatif)'>
                              <IconButton size='small' sx={{ color: BLEU, p: 0.4 }} onClick={() => handleFicheComplete(m)}>
                                <InfoIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            {/* 📋 Exporter la ligne (CSV) — VERT */}
                            <Tooltip title='Exporter cette adhésion (CSV)'>
                              <IconButton size='small' sx={{ color: VERT, p: 0.4 }} onClick={() => handleExporterLigne(m)}>
                                <DownloadIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            {/* 🗑️ Supprimer (avec confirmation) — ROUGE */}
                            <Tooltip title='Supprimer cette adhésion (avec confirmation)'>
                              <IconButton size='small' sx={{ color: ROUGE, p: 0.4 }} onClick={() => setSupprimerDialog(m)}>
                                <DeleteIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </TableCell>
                      {/* P: Notes */}
                      <TableCell sx={{ maxWidth: 160 }}><Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes || '—'}</Typography></TableCell>
                    </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={16} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun enregistrement trouvé</TableCell></TableRow>
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
          <AddIcon color='success' /> Nouvelle adhésion Mutuelle — N° auto: MUT-{String(MUTUELLES.length + 1).padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
              Le N° est généré automatiquement. L'Employé (col C), la Cotisation Annuelle (col K), le Statut (col L) et l'Alerte (col M) sont calculés automatiquement via RECHERCHEX et formules SI imbriquées.
            </Alert>
            <TextField select size='small' label='Matricule employé' fullWidth value={newMut.employee_id || ''} onChange={(e) => setNewMut({ ...newMut, employee_id: e.target.value })}>
              {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Organisme' fullWidth value={newMut.organisme || ''} onChange={(e) => setNewMut({ ...newMut, organisme: e.target.value })}>
              {ORGANISMES_MUTUELLE.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <Stack direction='row' spacing={1.5}>
              <TextField size='small' label='N° Adhérent' fullWidth value={newMut.numero_adherent || ''} onChange={(e) => setNewMut({ ...newMut, numero_adherent: e.target.value })} placeholder='ACT-001' />
              <TextField select size='small' label='Couverture' fullWidth value={newMut.couverture || ''} onChange={(e) => setNewMut({ ...newMut, couverture: e.target.value })}>
                {COUVERTURES_MUTUELLE.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction='row' spacing={1.5}>
              <TextField type='date' size='small' label='Date Adhésion' fullWidth value={(newMut.date_adhesion || '').slice(0, 10)} onChange={(e) => setNewMut({ ...newMut, date_adhesion: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField type='date' size='small' label='Date Échéance (laisser vide si permanent)' fullWidth value={(newMut.date_echeance || '').slice(0, 10)} onChange={(e) => setNewMut({ ...newMut, date_echeance: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Stack>
            <Stack direction='row' spacing={1.5}>
              <TextField type='number' size='small' label='Personnes à Charge' fullWidth value={newMut.personnes_a_charge ?? 0} onChange={(e) => setNewMut({ ...newMut, personnes_a_charge: e.target.value })} inputProps={{ min: 0 }} />
              <TextField type='number' size='small' label='Cotisation Mensuelle (FCFA)' fullWidth value={newMut.cotisation_mensuelle ?? 0} onChange={(e) => setNewMut({ ...newMut, cotisation_mensuelle: e.target.value })} inputProps={{ min: 0 }} />
            </Stack>
            <TextField size='small' label='Notes' fullWidth multiline rows={2} value={newMut.notes || ''} onChange={(e) => setNewMut({ ...newMut, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<AddIcon />} disabled={!newMut.employee_id} onClick={handleCreate} sx={{ bgcolor: VIOLET }}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier — {editDialog && `MUT-${String(MUTUELLES.findIndex(m => m.id === editDialog.id) + 1).padStart(3, '0')}`}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                <strong>Colonnes auto (non modifiables) :</strong> Employé (RECHERCHEX), Cotisation Annuelle (=J×12), Statut (SI imbriquée), Alerte (SI imbriquée granulaire).
                <br />Date MAJ et Dernier contrôle seront automatiquement mis à jour à aujourd'hui lors de la sauvegarde.
                <br />Statut actuel : <strong>{calculerStatutMutuelle(editDialog).label}</strong> · Alerte : <strong>{calculerAlerteMutuelle(editDialog).label}</strong>
              </Alert>
              <TextField select size='small' label='Organisme' fullWidth value={editDialog.organisme || ''} onChange={(e) => setEditDialog({ ...editDialog, organisme: e.target.value })}>
                {ORGANISMES_MUTUELLE.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
              <Stack direction='row' spacing={1.5}>
                <TextField size='small' label='N° Adhérent' fullWidth value={editDialog.numero_adherent || ''} onChange={(e) => setEditDialog({ ...editDialog, numero_adherent: e.target.value })} />
                <TextField select size='small' label='Couverture' fullWidth value={editDialog.couverture || ''} onChange={(e) => setEditDialog({ ...editDialog, couverture: e.target.value })}>
                  {COUVERTURES_MUTUELLE.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Date Adhésion' fullWidth value={(editDialog.date_adhesion || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_adhesion: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField type='date' size='small' label='Date Échéance (vide = permanent)' fullWidth value={(editDialog.date_echeance || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_echeance: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='number' size='small' label='Personnes à Charge' fullWidth value={editDialog.personnes_a_charge ?? 0} onChange={(e) => setEditDialog({ ...editDialog, personnes_a_charge: e.target.value })} inputProps={{ min: 0 }} />
                <TextField type='number' size='small' label='Cotisation Mensuelle (FCFA)' fullWidth value={editDialog.cotisation_mensuelle ?? 0} onChange={(e) => setEditDialog({ ...editDialog, cotisation_mensuelle: e.target.value })} inputProps={{ min: 0 }} />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Dernier Contrôle' fullWidth value={(editDialog.dernier_controle || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, dernier_controle: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField size='small' label='Cotisation Annuelle (auto =J×12)' fullWidth disabled value={formatNumber((Number(editDialog.cotisation_mensuelle) || 0) * 12) + ' FCFA'} helperText='Calculée automatiquement' />
              </Stack>
              <TextField size='small' label='Notes' fullWidth multiline rows={2} value={editDialog.notes || ''} onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 5 : DIALOG CONFIGURATION ALERTES MUTUELLE (_Config_Alertes_Mutuelle) === */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color='primary' /> Configuration des alertes mutuelle (_Config_Alertes_Mutuelle)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Feuille de configuration Excel <strong>_Config_Alertes_Mutuelle</strong> — Paramètres du système d'alertes mutuelle automatiques (PROMPT 5).
            </Alert>
            {/* B2: Destinataires RH (emails) */}
            <TextField
              size='small' label='Destinataires RH (emails)' fullWidth multiline rows={2}
              value={alerteConfig.destinataires || ''}
              onChange={(e) => setAlerteConfig({ ...alerteConfig, destinataires: e.target.value })}
              placeholder='rh@admina-rh.com, manager1@admina-rh.com'
              helperText='Séparez les emails par des virgules'
            />
            <Stack direction='row' spacing={1.5}>
              {/* B3: Fréquence (jours) */}
              <TextField
                type='number' size='small' label='Fréquence (jours)' fullWidth
                value={alerteConfig.frequence_jours || 7}
                onChange={(e) => setAlerteConfig({ ...alerteConfig, frequence_jours: parseInt(e.target.value) || 7 })}
                helperText='Cadence des contrôles'
              />
              {/* B4: Activer alertes */}
              <TextField
                select size='small' label='Activer alertes' fullWidth
                value={alerteConfig.activer ? 'Oui' : 'Non'}
                onChange={(e) => setAlerteConfig({ ...alerteConfig, activer: e.target.value === 'Oui' })}
              >
                <MenuItem value='Oui'>Oui</MenuItem>
                <MenuItem value='Non'>Non</MenuItem>
              </TextField>
            </Stack>
            {/* Objet email */}
            <TextField
              size='small' label='Objet email' fullWidth
              value={alerteConfig.objet_email || ''}
              onChange={(e) => setAlerteConfig({ ...alerteConfig, objet_email: e.target.value })}
            />
            {/* Dernière exécution (read-only) */}
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', borderRadius: 1, border: '1px solid #e9edf2' }}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <LockIcon sx={{ fontSize: 14, color: '#9aa8b8' }} />
                <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>
                  Dernière exécution : <strong style={{ color: NAVY }}>{alerteConfig.derniere_execution ? formatDate(alerteConfig.derniere_execution) : 'Jamais'}</strong>
                </Typography>
              </Stack>
            </Paper>
            {/* Code VBA Excel (référence) */}
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#1e1e2e', borderRadius: 1 }}>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#a6accd', fontFamily: 'monospace', display: 'block', whiteSpace: 'pre-wrap' }}>
                {'Sub EnvoyerRappelsMutuelle()\n  For i = 2 To lastRow\n    al = AlerteMutuelle(Date_Echeance, Pers)\n    If al <> "OK" Then\n      corps = corps & Employe & " - " & Organisme & " - " & al\n      ws.Cells(i, "N").Value = Date  \' Dernier controle\n    End If\n  Next i\n  outMail.Send\nEnd Sub'}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfigDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SettingsIcon />} onClick={handleSaveConfig} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 5 : DIALOG RÉCAPITULATIF EMAIL (après envoi) === */}
      <Dialog open={Boolean(alerteRecapDialog)} onClose={() => setAlerteRecapDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailIcon sx={{ color: VIOLET }} /> Récapitulatif d'envoi — {alerteRecapDialog?.count} rappel(s)
          <Chip label='Envoyé' size='small' color='success' sx={{ ml: 1, fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent>
          {alerteRecapDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='success' sx={{ fontSize: '0.75rem' }} icon={<CheckCircleIcon />}>
                ✅ <strong>{alerteRecapDialog.count} rappel(s) envoyé(s)</strong> avec succès à {alerteRecapDialog.destinataires}.
                <br />Date d'envoi : <strong>{formatDate(alerteRecapDialog.dateEnvoi)}</strong>
              </Alert>
              {/* Métadonnées email */}
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
              {/* Corps de l'email */}
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📧 Corps de l'email
                </Typography>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #d6dde6', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.7rem', color: '#1a2a3a', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: 300, overflowY: 'auto' }}>
                  {alerteRecapDialog.corps}
                </Paper>
              </Box>
              {/* Liste des adhésions en anomalie */}
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📋 Adhésions concernées ({alerteRecapDialog.count})
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 220 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Organisme</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Échéance</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Dernier contrôle (MAJ)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerteRecapDialog.docsAlerte.map(m => {
                        const emp = findEmployee(m.employee_id);
                        const al = calculerAlerteMutuelle(m);
                        const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
                        return (
                          <TableRow key={m.id} hover>
                            <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: VIOLET }}>{num}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{m.organisme || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem' }}><Chip label={al.label} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{m.date_echeance ? formatDate(m.date_echeance) : 'Permanent'}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem', color: VERT, fontWeight: 700 }}>{formatDate(alerteRecapDialog.dateEnvoi)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              {/* Audit trail */}
              <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
                📝 <strong>Audit trail</strong> — L'envoi a été enregistré dans <code>ALERTES_MUTUELLE_HISTORIQUE</code>. La colonne N (Dernier contrôle) a été mise à jour pour chaque adhésion en anomalie.
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

      {/* === PROMPT 6 : DIALOG EXPORT PAIE (mot de passe — N° Adhérent complet) === */}
      <Dialog open={Boolean(paieDialog)} onClose={() => setPaieDialog(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ color: ORANGE }} /> Export Paie — N° Adhérent complet
        </DialogTitle>
        <DialogContent>
          {paieDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                ⚠️ <strong>Fichier sensible.</strong> Cet export contient les N° Adhérent <strong>non masqués</strong> (colonnes : Matricule, Employé, Organisme, N° Adhérent, Cotisation Mensuelle) pour toutes les adhésions ({MUTUELLES.length}).
                <br />Saisissez deux fois un mot de passe (≥ 6 caractères) pour confirmer l'export.
              </Alert>
              <TextField
                type='password'
                size='small'
                label='Mot de passe'
                fullWidth
                value={paieDialog.password || ''}
                onChange={(e) => setPaieDialog({ ...paieDialog, password: e.target.value })}
                autoFocus
              />
              <TextField
                type='password'
                size='small'
                label='Confirmer le mot de passe'
                fullWidth
                value={paieDialog.confirmPassword || ''}
                onChange={(e) => setPaieDialog({ ...paieDialog, confirmPassword: e.target.value })}
                error={Boolean(paieDialog.password && paieDialog.confirmPassword && paieDialog.password !== paieDialog.confirmPassword)}
                helperText={paieDialog.password && paieDialog.confirmPassword && paieDialog.password !== paieDialog.confirmPassword ? 'Les mots de passe ne correspondent pas' : ''}
              />
              <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                🔒 Audit trail : MUTUELLE_AUDIT_TRAIL · EXPORTS_LOG (action 'export_paie')
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPaieDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<DownloadIcon />} onClick={handleExportPaie} sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#9a5a1f' } }}>
            Générer l'export
          </Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 6 : DIALOG RAPPORT AUDIT MUTUELLE (toutes les adhésions, triées Employé + Organisme) === */}
      <Dialog open={auditDialog} onClose={() => setAuditDialog(false)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <AssessmentIcon sx={{ color: BLEU }} /> Rapport d'Audit Mutuelle — {auditStats.total} adhésion(s)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Récapitulatif de toutes les adhésions avec statuts, alertes et dates de contrôle. Trié par <strong>Employé</strong> puis <strong>Organisme</strong>. Indépendant des filtres du tableau principal.
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Organisme</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N° Adhérent (masqué)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Couverture</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Cotis. Mens.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Échéance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Dernier Contrôle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData.map(m => {
                    const emp = findEmployee(m.employee_id);
                    const st = calculerStatutMutuelle(m);
                    const al = calculerAlerteMutuelle(m);
                    const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
                    return (
                      <TableRow key={m.id} hover sx={{
                        bgcolor: al.short === 'Expiré' ? 'rgba(179,58,74,0.05)' :
                                 al.short === '<30j' || al.short === 'Aucune pers.' ? 'rgba(184,106,42,0.04)' :
                                 'transparent',
                      }}>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: VIOLET, fontWeight: 700 }}>{num}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: NAVY }}>{emp?.matricule || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{m.organisme || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>{m.numero_adherent ? `${m.numero_adherent.slice(0, 2)}****${m.numero_adherent.slice(-2)}` : <span style={{ color: ROUGE, fontWeight: 700 }}>— MANQUANT —</span>}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{m.couverture || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: VERT, fontWeight: 700 }}>{formatNumber(m.cotisation_mensuelle || 0)}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', color: m.date_echeance ? NAVY : '#9aa8b8' }}>{m.date_echeance ? formatDate(m.date_echeance) : 'Permanent'}</TableCell>
                        <TableCell><Chip label={st.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ bgcolor: al.bg, borderLeft: `3px solid ${al.color}` }}><Chip label={al.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ fontSize: '0.62rem', color: m.dernier_controle ? BLEU : '#9aa8b8' }}>{m.dernier_controle ? formatDate(m.dernier_controle) : '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {auditData.length === 0 && (
                    <TableRow><TableCell colSpan={11} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucune adhésion à auditer</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
              📋 <strong>Rapport complet</strong> — {auditStats.total} adhésion(s) au total. N° Adhérent masqué (XX****XX) conformément RGPD. Tri alphabétique par Employé puis Organisme.
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
                  ⚠️ <strong>{kpiData.data.length} adhésion(s) expirée(s).</strong> Renouvelez individuellement (✏️ Modifier) ou en masse (🔄 Renouveler tout) ci-dessous.
                </Alert>
              )}
              {kpiDialog === 'aRenouveler' && (
                <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<AutorenewIcon />}>
                  🟠 Ces adhésions arrivent à échéance dans moins de 30 jours. Renouvelez avant expiration.
                </Alert>
              )}
              {kpiDialog === 'aucunePers' && (
                <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                  ℹ️ Ces adhésions n'ont aucune personne à charge déclarée. Vérifiez si une couverture familiale est nécessaire.
                </Alert>
              )}
              {kpiDialog === 'tauxCouverture' && (
                <Alert severity={stats.tauxCouverture >= 90 ? 'success' : stats.tauxCouverture >= 70 ? 'warning' : 'error'} sx={{ fontSize: '0.72rem' }}>
                  📊 <strong>Taux de couverture : {stats.tauxCouverture}%</strong> — Calcul : 1 - (Expirés + À renouveler) / Total.
                  <br />Composition : <strong style={{ color: VERT }}>{stats.actifs} actifs</strong> · <strong style={{ color: ORANGE }}>{stats.aRenouveler} à renouveler</strong> · <strong style={{ color: ROUGE }}>{stats.expires} expirés</strong> sur {stats.total} adhésions.
                  {stats.tauxCouverture < 70 && ' ⚠️ Taux critique — renouvelez les adhésions expirées pour améliorer ce taux.'}
                  {stats.tauxCouverture >= 70 && stats.tauxCouverture < 90 && ' 🟡 Taux moyen — quelques renouvellements nécessaires.'}
                  {stats.tauxCouverture >= 90 && ' ✅ Excellent taux de couverture !'}
                </Alert>
              )}
              {kpiDialog === 'total' && (
                <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                  📋 Liste complète des {stats.total} adhésions mutuelle. Utilisez ➕ Ajouter pour créer une nouvelle adhésion, ou ✏️ Modifier pour éditer une ligne.
                </Alert>
              )}

              {/* Table des adhésions avec checkbox de sélection (si actions groupées disponibles) */}
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 440 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                      {/* Checkbox "tout sélectionner" seulement si actions groupées disponibles */}
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
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Organisme</TableCell>
                      {(kpiDialog === 'cotMensuelle' || kpiDialog === 'cotAnnuelle') && (
                        <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Cotis. Mens.</TableCell>
                      )}
                      {(kpiDialog === 'cotMensuelle' || kpiDialog === 'cotAnnuelle') && (
                        <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Cotis. Ann.</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Échéance</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                      {/* Colonne Actions individuelles */}
                      <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpiData.data.map(m => {
                      const emp = findEmployee(m.employee_id);
                      const st = calculerStatutMutuelle(m);
                      const al = calculerAlerteMutuelle(m);
                      const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
                      const isSelected = kpiSelected.has(m.id);
                      return (
                        <TableRow key={m.id} hover selected={isSelected} sx={{
                          bgcolor: isSelected ? 'rgba(126,63,242,0.06)' :
                                   al.short === 'Expiré' ? 'rgba(179,58,74,0.04)' :
                                   al.short === '<30j' ? 'rgba(184,106,42,0.03)' : 'transparent',
                        }}>
                          {kpiData.actions.includes('renouvelerSelection') && (
                            <TableCell padding='checkbox'>
                              <Checkbox
                                size='small'
                                checked={isSelected}
                                onChange={() => handleToggleKpiSelect(m.id)}
                                sx={{ color: kpiData.color, '&.Mui-checked': { color: kpiData.color } }}
                              />
                            </TableCell>
                          )}
                          <TableCell sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: VIOLET, fontWeight: 700 }}>{num}</TableCell>
                          <TableCell sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</TableCell>
                          <TableCell sx={{ fontSize: '0.62rem' }}>{m.organisme || '—'}</TableCell>
                          {(kpiDialog === 'cotMensuelle' || kpiDialog === 'cotAnnuelle') && (
                            <TableCell align='right' sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: VERT, fontWeight: 700 }}>{formatNumber(m.cotisation_mensuelle || 0)}</TableCell>
                          )}
                          {(kpiDialog === 'cotMensuelle' || kpiDialog === 'cotAnnuelle') && (
                            <TableCell align='right' sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: NAVY, fontWeight: 700 }}>{formatNumber((Number(m.cotisation_mensuelle) || 0) * 12)}</TableCell>
                          )}
                          <TableCell sx={{ fontSize: '0.62rem', color: m.date_echeance ? NAVY : '#9aa8b8' }}>{m.date_echeance ? formatDate(m.date_echeance) : 'Permanent'}</TableCell>
                          <TableCell><Chip label={st.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                          <TableCell sx={{ bgcolor: al.bg, borderLeft: `3px solid ${al.color}` }}><Chip label={al.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                          <TableCell align='center'>
                            <Stack direction='row' spacing={0.5} justifyContent='center'>
                              {kpiData.actions.includes('voirFiche') && (
                                <Tooltip title='Voir fiche employé'>
                                  <IconButton size='small' onClick={() => handleVoirFiche(m.employee_id)}>
                                    <VisibilityIcon sx={{ fontSize: 14, color: BLEU }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {kpiData.actions.includes('modifier') && (
                                <Tooltip title='Modifier cette adhésion'>
                                  <IconButton size='small' onClick={() => setEditDialog({ ...m })}>
                                    <EditIcon sx={{ fontSize: 14, color: VIOLET }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(kpiData.actions.includes('renouvelerSelection') || kpiData.actions.includes('renouvelerTout')) && (
                                <Tooltip title='Renouveler cette adhésion (+1 an)'>
                                  <IconButton size='small' onClick={() => handleRenouveler(m)}>
                                    <AutorenewIcon sx={{ fontSize: 14, color: ORANGE }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {kpiData.data.length === 0 && (
                      <TableRow><TableCell colSpan={kpiData.actions.includes('renouvelerSelection') ? 10 : 9} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                        ✅ Aucune adhésion dans cette catégorie
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Résumé pour les KPI de cotisations (détail par organisme) */}
              {(kpiDialog === 'cotMensuelle' || kpiDialog === 'cotAnnuelle') && (
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', borderRadius: 1, border: '1px solid #e9edf2' }}>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1 }}>
                    📊 Répartition par organisme
                  </Typography>
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    {Object.entries(
                      kpiData.data.reduce((acc, m) => {
                        const org = m.organisme || 'Autre';
                        if (!acc[org]) acc[org] = { count: 0, total: 0 };
                        acc[org].count++;
                        acc[org].total += kpiDialog === 'cotMensuelle'
                          ? (Number(m.cotisation_mensuelle) || 0)
                          : (Number(m.cotisation_mensuelle) || 0) * 12;
                        return acc;
                      }, {})
                    ).sort(([, a], [, b]) => b.total - a.total).map(([org, { count, total }]) => (
                      <Chip
                        key={org}
                        label={`${org}: ${count} adh. · ${formatNumber(total)} FCFA${kpiDialog === 'cotMensuelle' ? '/mois' : '/an'}`}
                        size='small'
                        sx={{ fontSize: '0.6rem', height: 22, bgcolor: 'rgba(126,63,242,0.08)', color: VIOLET, fontWeight: 600, border: '1px solid rgba(126,63,242,0.2)' }}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Audit trail info */}
              <Alert severity='info' sx={{ fontSize: '0.66rem' }}>
                📝 <strong>Audit trail</strong> — Toutes les actions effectuées ici sont journalisées dans <code>MUTUELLE_AUDIT_TRAIL</code> (ISO 30401:2018). Les KPI sont automatiquement rafraîchis après chaque action.
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
                  <Button variant='outlined' startIcon={<AddIcon />} onClick={() => { setKpiDialog(null); setNewMut({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.72rem', color: VIOLET, borderColor: VIOLET }}>➕ Ajouter</Button>
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

      {/* === DIALOG AJOUTER / MODIFIER PERSONNES À CHARGE (pop-up simple) === */}
      <Dialog open={Boolean(persDialog)} onClose={() => setPersDialog(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon sx={{ color: JAUNE }} /> Modifier les personnes à charge
        </DialogTitle>
        <DialogContent>
          {persDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {(() => {
                const emp = findEmployee(persDialog.employee_id);
                const num = `MUT-${String(MUTUELLES.indexOf(persDialog) + 1).padStart(3, '0')}`;
                return (
                  <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                    <strong>{emp ? employeeFullName(emp) : 'Employé'}</strong> ({num}) — Organisme : {persDialog.organisme || '—'}
                    <br />Nombre actuel : <strong>{persDialog.personnes_a_charge ?? 0}</strong>
                  </Alert>
                );
              })()}
              <TextField
                type='number'
                size='small'
                label='Nouveau nombre de personnes à charge'
                fullWidth
                value={persValue}
                onChange={(e) => setPersValue(e.target.value)}
                inputProps={{ min: 0, max: 20 }}
                autoFocus
                helperText='Saisissez un nombre entier ≥ 0 (0 = aucune personne à charge)'
              />
              <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                📝 Audit trail : MUTUELLE_AUDIT_TRAIL (action 'modifier_personnes_a_charge')
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPersDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<PersonAddIcon />} onClick={handleSavePers} sx={{ bgcolor: JAUNE, '&:hover': { bgcolor: '#b8900f' } }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG CONFIRMATION SUPPRESSION === */}
      <Dialog open={Boolean(supprimerDialog)} onClose={() => setSupprimerDialog(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: ROUGE }}>
          <DeleteIcon /> Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          {supprimerDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='error' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                ⚠️ <strong>Action irréversible.</strong> Cette adhésion sera définitivement supprimée du tableau T_Mutuelle.
              </Alert>
              {(() => {
                const emp = findEmployee(supprimerDialog.employee_id);
                const num = `MUT-${String(MUTUELLES.indexOf(supprimerDialog) + 1).padStart(3, '0')}`;
                return (
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', borderRadius: 1, border: '1px solid #e9edf2' }}>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>N°</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 700, color: VIOLET, fontFamily: 'monospace' }}>{num}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', mt: 0.5 }}>Employé</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', mt: 0.5 }}>Organisme</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{supprimerDialog.organisme || '—'}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', mt: 0.5 }}>N° Adhérent</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{supprimerDialog.numero_adherent || '—'}</Typography>
                    </Stack>
                  </Paper>
                );
              })()}
              <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
                📝 Cette action sera journalisée dans MUTUELLE_AUDIT_TRAIL (ISO 30401:2018).
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSupprimerDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<DeleteIcon />} onClick={handleSupprimer} sx={{ bgcolor: ROUGE, '&:hover': { bgcolor: '#9a2f3a' } }}>
            🗑️ Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG FICHE COMPLÈTE (pop-up récapitulatif d'une adhésion) === */}
      <Dialog open={Boolean(ficheCompleteDialog)} onClose={() => setFicheCompleteDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', borderBottom: `3px solid ${VIOLET}`, pb: 1.5 }}>
          <InfoIcon sx={{ color: BLEU }} />
          {ficheCompleteDialog && (() => {
            const emp = findEmployee(ficheCompleteDialog.employee_id);
            const num = `MUT-${String(MUTUELLES.indexOf(ficheCompleteDialog) + 1).padStart(3, '0')}`;
            return (
              <>
                <Typography component='span' variant='h6' sx={{ fontWeight: 700, fontSize: '1.05rem', color: NAVY }}>
                  Fiche adhésion — {num}
                </Typography>
                <Chip label={emp ? employeeFullName(emp) : 'Employé inconnu'} size='small' sx={{ ml: 1, fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', color: VIOLET }} />
              </>
            );
          })()}
        </DialogTitle>
        <DialogContent>
          {ficheCompleteDialog && (() => {
            const m = ficheCompleteDialog;
            const emp = findEmployee(m.employee_id);
            const st = calculerStatutMutuelle(m);
            const al = calculerAlerteMutuelle(m);
            const num = `MUT-${String(MUTUELLES.indexOf(m) + 1).padStart(3, '0')}`;
            const cotMensuelle = Number(m.cotisation_mensuelle) || 0;
            const cotAnnuelle = cotMensuelle * 12;
            const orgStyle = getOrganismeStyle(m.organisme);
            return (
              <Stack spacing={2} sx={{ mt: 1 }}>
                {/* En-tête : avatar + identité + statut */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(126,63,242,0.04)', borderRadius: 2, border: '1px solid rgba(126,63,242,0.15)' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent='space-between'>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                        {emp ? `${emp.prenom[0]}${emp.nom[0]}` : '?'}
                      </Box>
                      <Box>
                        <Typography variant='subtitle1' fontWeight={700} sx={{ color: NAVY, fontSize: '0.95rem' }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</Typography>
                        <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>{emp?.matricule || '—'} · {num}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction='row' spacing={1}>
                      <Chip label={st.label} size='small' sx={{ fontWeight: 700, bgcolor: st.bg, color: st.color, border: `1px solid ${st.color}30` }} />
                      <Chip label={al.label} size='small' sx={{ fontWeight: 700, bgcolor: al.bg, color: al.color, border: `1px solid ${al.color}40` }} />
                    </Stack>
                  </Stack>
                </Paper>

                {/* Grille de données : tous les champs */}
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Organisme</Typography>
                      {m.organisme ? (
                        <Chip label={m.organisme} size='small' sx={{ mt: 0.5, fontWeight: 700, bgcolor: orgStyle.bg, color: orgStyle.color, border: `1px solid ${orgStyle.color}30` }} />
                      ) : <Typography variant='body2' sx={{ fontSize: '0.8rem', color: '#bbb' }}>—</Typography>}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>N° Adhérent</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: NAVY, mt: 0.5 }}>{m.numero_adherent || '—'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Date Adhésion</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontWeight: 600, color: NAVY, mt: 0.5 }}>{m.date_adhesion ? formatDate(m.date_adhesion) : '—'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Date Échéance</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontWeight: 700, color: m.date_echeance ? (st.short === 'Expiré' ? ROUGE : st.short === 'À renouveler' ? ORANGE : NAVY) : VERT, mt: 0.5 }}>
                        {m.date_echeance ? formatDate(m.date_echeance) : 'Permanent'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Couverture</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {m.couverture ? (
                          <Chip label={m.couverture} size='small' variant='outlined' sx={{ fontWeight: 600, color: NAVY, borderColor: NAVY }} />
                        ) : <Typography variant='body2' sx={{ fontSize: '0.8rem', color: '#bbb' }}>—</Typography>}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Personnes à Charge</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: (m.personnes_a_charge ?? 0) === 0 ? JAUNE : NAVY, mt: 0.5 }}>
                        {m.personnes_a_charge ?? 0} {m.personnes_a_charge === 0 && '(aucune)'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Cotisation Mensuelle</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: VERT, mt: 0.5 }}>{formatNumber(cotMensuelle)} FCFA</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(244,247,252,0.5)', border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <LockIcon sx={{ fontSize: 11, color: '#9aa8b8' }} />
                        <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Cotisation Annuelle (auto =×12)</Typography>
                      </Stack>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: VERT, mt: 0.5 }}>{formatNumber(cotAnnuelle)} FCFA</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Dernier Contrôle</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.82rem', fontWeight: 600, color: m.dernier_controle ? BLEU : '#9aa8b8', mt: 0.5 }}>{m.dernier_controle ? formatDate(m.dernier_controle) : '—'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e9edf2', borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', textTransform: 'uppercase', fontWeight: 700 }}>Notes</Typography>
                      <Typography variant='body2' sx={{ fontSize: '0.78rem', color: m.notes ? '#1a2a3a' : '#bbb', mt: 0.5 }}>{m.notes || '—'}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Récapitulatif financier */}
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(26,122,74,0.04)', borderRadius: 1, border: '1px solid rgba(26,122,74,0.15)' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='space-around' alignItems={{ sm: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Mensuel</Typography>
                      <Typography variant='h6' sx={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 700, color: VERT }}>{formatNumber(cotMensuelle)}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>FCFA/mois</Typography>
                    </Box>
                    <Divider orientation={{ xs: 'horizontal', sm: 'vertical' }} flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Annuel</Typography>
                      <Typography variant='h6' sx={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 800, color: NAVY }}>{formatNumber(cotAnnuelle)}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>FCFA/an</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setFicheCompleteDialog(null)}>Fermer</Button>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {ficheCompleteDialog && !(!ficheCompleteDialog.date_echeance && ficheCompleteDialog.organisme === 'CNPS') && (
              <Button variant='outlined' startIcon={<AutorenewIcon />} onClick={() => { handleRenouveler(ficheCompleteDialog); setFicheCompleteDialog(null); }} sx={{ textTransform: 'none', fontSize: '0.72rem', color: ORANGE, borderColor: ORANGE }}>🔄 Renouveler</Button>
            )}
            <Button variant='outlined' startIcon={<EditIcon />} onClick={() => { setEditDialog({ ...ficheCompleteDialog }); setFicheCompleteDialog(null); }} sx={{ textTransform: 'none', fontSize: '0.72rem', color: VIOLET, borderColor: VIOLET }}>✏️ Modifier</Button>
            {ficheCompleteDialog && (
              <Button variant='outlined' startIcon={<DownloadIcon />} onClick={() => handleExporterLigne(ficheCompleteDialog)} sx={{ textTransform: 'none', fontSize: '0.72rem', color: VERT, borderColor: VERT }}>📋 Exporter</Button>
            )}
            {ficheCompleteDialog && (
              <Button variant='outlined' startIcon={<VisibilityIcon />} onClick={() => handleVoirFiche(ficheCompleteDialog.employee_id)} sx={{ textTransform: 'none', fontSize: '0.72rem', color: BLEU, borderColor: BLEU }}>👤 Fiche employé</Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
