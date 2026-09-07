// ============================================================
// SuiviDocumentsD2.jsx — Feuille « Suivi Documents » (ÉTAPE 1)
// Tableau structuré T_Documents (13 colonnes A-M)
//
// Excel équivalent :
//   A: ID_Document       = "DOC-"&TEXTE(LIGNE()-4;"000")  (auto)
//   B: Matricule         = Liste déroulante (2-Base Candidats)
//   C: Employé           = RECHERCHEX([@Matricule]; '2-Base Candidats'!B:B; D&E; "Non trouvé"; 0)  (auto, read-only)
//   D: Type_Document     = Liste déroulante (CNI, Passeport, Attestation CNPS, etc.)
//   E: Numero_Document   = Saisie libre
//   F: Date_Emission     = Saisie date
//   G: Date_Expiration   = Saisie date (vide si permanent)
//   H: Jours_Restants    = SI([@Date_Expiration]=""; ""; [@Date_Expiration]-AUJOURDHUI())  (auto, read-only)
//   I: Statut            = SI imbriquée (🟢 Permanent / 🔴 Expiré / 🟠 <30j / 🟡 <60j / 🟢 OK)  (auto, read-only)
//   J: Lieu_Depot        = Liste déroulante (Dossier physique, Service RH, Archive numérique, Coffre fort)
//   K: Lien_Fichier      = Saisie libre (chemin/URL)
//   L: Dernier_Rappel    = Date (mis à jour par système d'alertes)
//   M: Notes             = Saisie libre
//
// Header indicators (NB.SI) :
//   - Total documents : =NBVAL(T_Documents[ID_Document])
//   - Expirés          : =NB.SI(T_Documents[Statut]; "🔴 Expiré")
//   - À renouveler <30j: =NB.SI(T_Documents[Statut]; "🟠 <30j")
//   - À surveiller <60j: =NB.SI(T_Documents[Statut]; "🟡 <60j")
//
// Mise en forme conditionnelle sur colonne I (Statut) :
//   - Rouge si 🔴 Expiré
//   - Orange si 🟠 <30j
//   - Jaune si 🟡 <60j
//   - Vert si 🟢 OK ou 🟢 Permanent
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, Tooltip, IconButton, Snackbar, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Link, Checkbox,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine,
} from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PersonIcon from '@mui/icons-material/Person';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import {
  DOCUMENTS, TYPES_DOCUMENT, LIEUX_DEPOT, EMPLOYEES, CONTRATS, findEmployee, employeeFullName,
  formatNumber, formatDate,
  CONFIG_ALERTES_DOCS, ALERTES_HISTORIQUE,
  genererCorpsEmailAlertes, necessiteRappel,
  calculerJoursRestants, calculerStatutDoc,
} from './data';
import { SectionHeader } from './components';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const JAUNE = '#d4a017';

// --- Couleur chip par type de document (mise en forme conditionnelle) ---
const TYPE_COLORS = {
  'CNI': BLEU,
  'Passeport': VIOLET,
  'Attestation CNPS': VERT,
  'Certificat médical': ORANGE,
  'Casier judiciaire': ROUGE,
  'Diplôme': NAVY,
  'RIB': BLEU,
  'Photo': '#6b7a8a',
  'Permis de conduire': ORANGE,
  'Autre': '#6b7a8a',
};

// --- ÉTAPE 4 : Durées de validité par type (pour renouvellement automatique) ---
// Équivalent VBA : Select Case typeDoc ... nouvelleDate = DateAdd("yyyy", N, dateExp)
const DUREES_VALIDITE = {
  'CNI': 10,                    // 10 ans
  'Passeport': 5,                // 5 ans
  'Attestation CNPS': 6,         // 6 ans
  'Certificat médical': 2,       // 2 ans
  'Casier judiciaire': 3,        // 3 ans
  'Diplôme': null,               // Permanent
  'RIB': null,                   // Permanent
  'Photo': null,                 // Permanent
  'Permis de conduire': 5,       // 5 ans
  'Autre': 1,                    // 1 an par défaut
};

// --- ÉTAPE 4 : Calculer nouvelle date d'expiration après renouvellement ---
// VBA : nouvelleDate = DateAdd("yyyy", N, dateExp)
function calculerNouvelleDateExpiration(typeDoc, dateExpiration) {
  const duree = DUREES_VALIDITE[typeDoc];
  if (!duree || !dateExpiration) return null; // Permanent ou pas de date initiale
  const date = new Date(dateExpiration);
  date.setFullYear(date.getFullYear() + duree);
  return date.toISOString().slice(0, 10);
}

export default function SuiviDocumentsD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fType, setFType] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fEmploye, setFEmploye] = useState('');
  const [fDateMode, setFDateMode] = useState(''); // '', 'expired', '<30', '<60', '>60', 'permanent'
  const [snack, setSnack] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [newDoc, setNewDoc] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  // --- ÉTAPE 4 : sélection multiple (checkboxes) ---
  const [selected, setSelected] = useState(new Set());
  const [renouvelerDialog, setRenouvelerDialog] = useState(null); // { docs, nouvelleDate, count }
  // --- ÉTAPE 6.3 : Rapport Audit ---
  const [auditDialog, setAuditDialog] = useState(false);
  // --- ÉTAPE 2 : tri dynamique ---
  const [sortConfig, setSortConfig] = useState({ key: 'date_expiration', direction: 'asc' });

  // --- Filtrage avancé (ÉTAPE 2 : équivalent FILTRE Excel multi-critères) ---
  // Excel: =SIERREUR(FILTRE(T_Documents[#Tout]; (SI(ESTVIDE(B1);VRAI;Type=B1)) * (SI(ESTVIDE(C1);VRAI;Statut=C1)) * (SI(ESTVIDE(D1);VRAI;Employé=D1)) * (SI(ESTVIDE(E1);VRAI;ESTNUM(CHERCHE(E1;Employé&Num&Type))))); "Aucun résultat")
  const filtered = useMemo(() => {
    let result = DOCUMENTS.filter(d => {
      const emp = findEmployee(d.employee_id);
      const empName = emp ? employeeFullName(emp) : '';
      const statut = calculerStatutDoc(d.date_expiration);
      // B1: Filtre Type
      if (fType && d.type_document !== fType) return false;
      // C1: Filtre Statut
      if (fStatut && statut.short !== fStatut) return false;
      // D1: Filtre Employé (dropdown dynamique)
      if (fEmploye && d.employee_id !== fEmploye) return false;
      // E1: Recherche texte (plein texte sur nom, numéro, type)
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${empName} ${d.document_number} ${d.type_document} ${d.numero_document} ${emp?.matricule || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Filtre Date_Expiration (mode)
      if (fDateMode) {
        if (fDateMode === 'permanent' && d.date_expiration) return false;
        if (fDateMode === 'expired' && statut.short !== 'Expiré') return false;
        if (fDateMode === '<30' && statut.short !== '<30j') return false;
        if (fDateMode === '<60' && statut.short !== '<60j') return false;
        if (fDateMode === '>60' && !['OK'].includes(statut.short)) return false;
      }
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
        } else if (sortConfig.key === 'jours_restants') {
          valA = calculerJoursRestants(a.date_expiration) ?? 99999;
          valB = calculerJoursRestants(b.date_expiration) ?? 99999;
        } else if (sortConfig.key === 'statut') {
          valA = calculerStatutDoc(a.date_expiration).short;
          valB = calculerStatutDoc(b.date_expiration).short;
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
  }, [search, fType, fStatut, fEmploye, fDateMode, sortConfig, refreshKey]);

  // --- Tri : changement de colonne ---
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // --- Réinitialiser tous les filtres ---
  const handleResetFilters = () => {
    setSearch('');
    setFType('');
    setFStatut('');
    setFEmploye('');
    setFDateMode('');
    setPage(0);
    setSnack({ msg: 'Filtres réinitialisés', severity: 'info' });
  };

  // --- ÉTAPE 4 : Sélection (checkboxes) ---
  const handleToggleSelect = (docId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(d => d.id)));
    }
  };

  const handleClearSelection = () => {
    setSelected(new Set());
    setSnack({ msg: 'Sélection vidée', severity: 'info' });
  };

  // --- ÉTAPE 4 : Renouveler un document individuel ---
  // VBA : Sub RenouvelerDocument(ligne)
  //   nouvelleDate = DateAdd("yyyy", N, dateExp) selon type
  //   ws.Cells(ligne, "G").Value = nouvelleDate
  //   ws.Cells(ligne, "L").Value = ""  ' Réinitialiser le rappel
  const handleRenouvelerDoc = (doc) => {
    const nouvelleDate = calculerNouvelleDateExpiration(doc.type_document, doc.date_expiration);
    if (!nouvelleDate) {
      setSnack({ msg: `Impossible de renouveler : ${doc.type_document} est permanent ou sans date`, severity: 'warning' });
      return;
    }
    const idx = DOCUMENTS.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      DOCUMENTS[idx].date_expiration = nouvelleDate;
      DOCUMENTS[idx].dernier_rappel = ''; // Réinitialiser le rappel
    }
    setRefreshKey(k => k + 1);
    setSnack({ msg: `🔄 Document ${doc.document_number} renouvelé — nouvelle expiration : ${formatDate(nouvelleDate)}`, severity: 'success' });
  };

  // --- ÉTAPE 4 : Renouveler les sélectionnés (action groupée) ---
  const handleRenouvelerSelection = () => {
    if (selected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins un document', severity: 'warning' });
      return;
    }
    const docsSelectionnes = DOCUMENTS.filter(d => selected.has(d.id));
    const docsRenouvables = docsSelectionnes.filter(d => calculerNouvelleDateExpiration(d.type_document, d.date_expiration));
    if (docsRenouvables.length === 0) {
      setSnack({ msg: 'Aucun document renouvelable dans la sélection (tous permanents)', severity: 'warning' });
      return;
    }
    // Ouvre le dialog de confirmation
    setRenouvelerDialog({
      docs: docsRenouvables,
      count: docsRenouvables.length,
      skipped: docsSelectionnes.length - docsRenouvables.length,
    });
  };

  // --- ÉTAPE 4 : Confirmer le renouvellement groupé ---
  const handleConfirmRenouveler = () => {
    if (!renouvelerDialog) return;
    renouvelerDialog.docs.forEach(doc => {
      const nouvelleDate = calculerNouvelleDateExpiration(doc.type_document, doc.date_expiration);
      const idx = DOCUMENTS.findIndex(d => d.id === doc.id);
      if (idx !== -1 && nouvelleDate) {
        DOCUMENTS[idx].date_expiration = nouvelleDate;
        DOCUMENTS[idx].dernier_rappel = ''; // Réinitialiser le rappel
      }
    });
    setSnack({ msg: `🔄 ${renouvelerDialog.count} document(s) renouvelé(s) — rappels réinitialisés`, severity: 'success' });
    setSelected(new Set());
    setRenouvelerDialog(null);
    setRefreshKey(k => k + 1);
  };

  // --- ÉTAPE 4 : Exporter les sélectionnés en PDF (rapport) ---
  const handleExportSelectionPDF = () => {
    if (selected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins un document', severity: 'warning' });
      return;
    }
    const docsSelectionnes = DOCUMENTS.filter(d => selected.has(d.id));
    // Génère un rapport HTML imprimable
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      setSnack({ msg: 'Veuillez autoriser les pop-ups', severity: 'error' });
      return;
    }
    const rows = docsSelectionnes.map(d => {
      const emp = findEmployee(d.employee_id);
      const empName = emp ? employeeFullName(emp) : '—';
      const jr = calculerJoursRestants(d.date_expiration);
      const st = calculerStatutDoc(d.date_expiration);
      return `
        <tr>
          <td>${d.document_number}</td>
          <td>${emp?.matricule || '—'}</td>
          <td>${empName}</td>
          <td>${d.type_document}</td>
          <td>${d.numero_document || '—'}</td>
          <td>${d.date_expiration ? formatDate(d.date_expiration) : 'Permanent'}</td>
          <td>${jr !== null ? `${jr}j` : '∞'}</td>
          <td style="font-weight:700;color:${st.color}">${st.label}</td>
        </tr>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>Rapport documents sélectionnés - ${new Date().toLocaleDateString('fr-FR')}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Inter', Arial, sans-serif; color: #0b2a4a; margin: 0; padding: 20px; }
        h1 { font-size: 1.2rem; text-align: center; margin-bottom: 5px; }
        .meta { text-align: center; color: #6b7a8a; font-size: 0.75rem; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px 8px; border: 1px solid #d6dde6; font-size: 0.75rem; text-align: left; }
        th { background: #f4f7fc; font-weight: 700; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.65rem; color: #6b7a8a; }
      </style></head>
      <body>
        <h1>📋 Rapport des documents sélectionnés</h1>
        <div class="meta">Généré le ${new Date().toLocaleDateString('fr-FR')} · ${docsSelectionnes.length} document(s) · Admina-RH</div>
        <table>
          <thead>
            <tr>
              <th>N° Doc</th>
              <th>Matricule</th>
              <th>Employé</th>
              <th>Type</th>
              <th>N° Document</th>
              <th>Expiration</th>
              <th>Jours restants</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">Document généré automatiquement par Admina-RH · Conforme ISO 30401:2018</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
    setSnack({ msg: `📄 Rapport PDF généré pour ${docsSelectionnes.length} document(s)`, severity: 'success' });
  };

  // --- ÉTAPE 6.3 : Export PDF de la zone filtrée (avec filtres appliqués) ---
  const handleExportPDF = () => {
    if (filtered.length === 0) {
      setSnack({ msg: 'Aucun document à exporter', severity: 'warning' });
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      setSnack({ msg: 'Veuillez autoriser les pop-ups', severity: 'error' });
      return;
    }
    const rows = filtered.map(d => {
      const emp = findEmployee(d.employee_id);
      const jr = calculerJoursRestants(d.date_expiration);
      const st = calculerStatutDoc(d.date_expiration);
      const contrat = CONTRATS.find(c => c.employee_id === d.employee_id);
      return `
        <tr style="background:${st.short === 'Expiré' ? 'rgba(179,58,74,0.06)' : st.short === '<30j' ? 'rgba(179,58,74,0.04)' : 'transparent'}">
          <td>${d.document_number}</td>
          <td>${emp?.matricule || '—'}</td>
          <td>${emp ? employeeFullName(emp) : '—'}</td>
          <td>${d.type_document}</td>
          <td>${d.numero_document || '—'}</td>
          <td>${d.date_emission ? formatDate(d.date_emission) : '—'}</td>
          <td>${d.date_expiration ? formatDate(d.date_expiration) : 'Permanent'}</td>
          <td>${jr !== null ? `${jr}j` : '∞'}</td>
          <td style="font-weight:700;color:${st.color}">${st.label}</td>
          <td>${contrat?.contract_number || '—'}</td>
        </tr>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>Suivi Documents — Export PDF ${new Date().toLocaleDateString('fr-FR')}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: 'Inter', Arial, sans-serif; color: #0b2a4a; margin: 0; padding: 20px; }
        h1 { font-size: 1.1rem; text-align: center; margin-bottom: 5px; }
        .meta { text-align: center; color: #6b7a8a; font-size: 0.72rem; margin-bottom: 15px; }
        .filters { background: #faf5ff; padding: 8px 12px; border-radius: 4px; margin-bottom: 15px; font-size: 0.68rem; color: #7e3ff2; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 5px 7px; border: 1px solid #d6dde6; font-size: 0.7rem; text-align: left; }
        th { background: #f4f7fc; font-weight: 700; }
        .footer { text-align: center; margin-top: 15px; font-size: 0.62rem; color: #6b7a8a; }
      </style></head>
      <body>
        <h1>📋 Suivi Documents — Export PDF</h1>
        <div class="meta">Généré le ${new Date().toLocaleDateString('fr-FR')} · ${filtered.length} document(s) · Admina-RH</div>
        <div class="filters">Filtres appliqués : ${[
          fType && `Type=${fType}`,
          fStatut && `Statut=${fStatut}`,
          fEmploye && `Employé=${employeeFullName(findEmployee(fEmploye))}`,
          search && `Recherche="${search}"`,
          fDateMode && `Date=${fDateMode}`,
        ].filter(Boolean).join(' · ') || 'Aucun filtre (tous les documents)'}</div>
        <table>
          <thead>
            <tr>
              <th>N° Doc</th><th>Matricule</th><th>Employé</th><th>Type</th><th>N° Document</th>
              <th>Émission</th><th>Expiration</th><th>Jours</th><th>Statut</th><th>Contrat</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">Document généré automatiquement par Admina-RH · Conforme ISO 30401:2018</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 350);
    setSnack({ msg: `📄 Export PDF généré (${filtered.length} documents filtrés)`, severity: 'success' });
  };

  // --- ÉTAPE 6.3 : Rapport Audit Documents (docs expirés + à renouveler, trié par Employé + Date) ---
  const auditData = useMemo(() => {
    return DOCUMENTS
      .filter(d => {
        const st = calculerStatutDoc(d.date_expiration);
        return st.short === 'Expiré' || st.short === '<30j' || st.short === '<60j';
      })
      .sort((a, b) => {
        // Tri par Employé puis par Date_Expiration
        const eA = findEmployee(a.employee_id);
        const eB = findEmployee(b.employee_id);
        const nameA = eA ? employeeFullName(eA) : '';
        const nameB = eB ? employeeFullName(eB) : '';
        if (nameA !== nameB) return nameA.localeCompare(nameB);
        return new Date(a.date_expiration || '9999') - new Date(b.date_expiration || '9999');
      });
  }, [refreshKey]);

  // --- Nombre de filtres actifs ---
  const activeFilterCount = [search, fType, fStatut, fEmploye, fDateMode].filter(Boolean).length;

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- ÉTAPE 3 : Système d'alertes (états) ---
  const [configDialog, setConfigDialog] = useState(false);
  const [alerteRecapDialog, setAlerteRecapDialog] = useState(null); // { corps, docsAlerte, count }
  const [alerteConfig, setAlerteConfig] = useState({ ...CONFIG_ALERTES_DOCS });

  // --- ÉTAPE 3 : Calcul des documents nécessitant un rappel ---
  const docsARappeler = useMemo(() => {
    return DOCUMENTS.filter(d => necessiteRappel(d, alerteConfig.frequence_jours));
  }, [refreshKey, alerteConfig.frequence_jours]);

  const totalAlertes = useMemo(() => {
    return DOCUMENTS.filter(d => {
      const st = calculerStatutDoc(d.date_expiration);
      return st.short === 'Expiré' || st.short === '<30j';
    }).length;
  }, [refreshKey]);

  // --- ÉTAPE 3 : Envoyer les rappels maintenant ---
  // Excel VBA : Sub EnvoyerRappelsDocuments()
  //   - Scanne documents statut "🔴 Expiré" ou "🟠 <30j"
  //   - Si Dernier_Rappel < Date - 7 ou vide, envoie email
  //   - Met à jour colonne L (Dernier_Rappel) avec Date du jour
  const handleSendRappels = () => {
    if (!alerteConfig.activer) {
      setSnack({ msg: 'Les alertes sont désactivées. Activez-les dans la configuration.', severity: 'warning' });
      return;
    }
    if (!alerteConfig.destinataires?.trim()) {
      setSnack({ msg: 'Aucun destinataire configuré. Ajoutez des emails dans la configuration.', severity: 'warning' });
      return;
    }
    // Génère le corps de l'email (équivalent VBA corps = "Documents expirés..." & vbCrLf)
    const recap = genererCorpsEmailAlertes(DOCUMENTS);
    if (!recap) {
      setSnack({ msg: 'Aucun document expiré ou à renouveler. Aucun email envoyé.', severity: 'info' });
      return;
    }
    // Filtre : ne garder que les docs nécessitant un rappel (fréquence 7 jours)
    const docsEffectivementRappeles = recap.docsAlerte.filter(d => necessiteRappel(d, alerteConfig.frequence_jours));
    if (docsEffectivementRappeles.length === 0) {
      setSnack({ msg: `Tous les ${recap.count} document(s) en alerte ont déjà reçu un rappel récemment (fréquence ${alerteConfig.frequence_jours}j). Aucun nouvel envoi nécessaire.`, severity: 'info' });
      return;
    }
    // Met à jour Dernier_Rappel (col L) pour chaque doc rappelé
    const now = new Date().toISOString().slice(0, 10);
    docsEffectivementRappeles.forEach(d => {
      const idx = DOCUMENTS.findIndex(doc => doc.id === d.id);
      if (idx !== -1) {
        DOCUMENTS[idx].dernier_rappel = now;
      }
    });
    // Met à jour derniere_execution dans CONFIG
    CONFIG_ALERTES_DOCS.derniere_execution = now;
    setAlerteConfig({ ...CONFIG_ALERTES_DOCS });
    // Enregistre dans l'historique (audit trail)
    ALERTES_HISTORIQUE.push({
      timestamp: new Date().toISOString(),
      destinataires: alerteConfig.destinataires,
      nb_documents: docsEffectivementRappeles.length,
      documents: docsEffectivementRappeles.map(d => d.document_number),
      objet: alerteConfig.objet_email,
      corps: recap.corps,
    });
    // Ouvre le dialog de récapitulatif (email preview)
    setAlerteRecapDialog({
      corps: recap.corps,
      docsAlerte: docsEffectivementRappeles,
      count: docsEffectivementRappeles.length,
      destinataires: alerteConfig.destinataires,
      objet: alerteConfig.objet_email,
      dateEnvoi: now,
    });
    setRefreshKey(k => k + 1);
    setSnack({ msg: `✉ ${docsEffectivementRappeles.length} rappel(s) envoyé(s) à ${alerteConfig.destinataires}`, severity: 'success' });
  };

  // --- ÉTAPE 3 : Sauvegarder la configuration ---
  const handleSaveConfig = () => {
    CONFIG_ALERTES_DOCS.destinataires = alerteConfig.destinataires;
    CONFIG_ALERTES_DOCS.frequence_jours = alerteConfig.frequence_jours;
    CONFIG_ALERTES_DOCS.activer = alerteConfig.activer;
    CONFIG_ALERTES_DOCS.objet_email = alerteConfig.objet_email;
    setConfigDialog(false);
    setSnack({ msg: 'Configuration des alertes enregistrée', severity: 'success' });
  };

  // --- ÉTAPE 3 : Ouvrir le client mail avec mailto (simulation envoi) ---
  const handleOpenMailto = () => {
    if (!alerteRecapDialog) return;
    const { destinataires, objet, corps } = alerteRecapDialog;
    const mailto = `mailto:${destinataires}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
    window.location.href = mailto;
    setSnack({ msg: 'Client email ouvert (mailto)', severity: 'info' });
  };

  // --- Header indicators (NB.SI) + Taux de conformité (ÉTAPE 5) ---
  const stats = useMemo(() => {
    const total = DOCUMENTS.length;
    const expires = DOCUMENTS.filter(d => calculerStatutDoc(d.date_expiration).short === 'Expiré').length;
    const moins30 = DOCUMENTS.filter(d => calculerStatutDoc(d.date_expiration).short === '<30j').length;
    const moins60 = DOCUMENTS.filter(d => calculerStatutDoc(d.date_expiration).short === '<60j').length;
    const ok = DOCUMENTS.filter(d => ['OK', 'Permanent'].includes(calculerStatutDoc(d.date_expiration).short)).length;
    // =1-(Expirés+<30j)/Total (format pourcentage)
    const tauxConformite = total > 0 ? Math.round((1 - (expires + moins30) / total) * 100) : 100;
    return { total, expires, moins30, moins60, ok, tauxConformite };
  }, [refreshKey]);

  // --- ÉTAPE 5 : Graphique 1 — Barres empilées Type_Document × Statut (TCD) ---
  const chartBarData = useMemo(() => {
    const typeStatut = {};
    DOCUMENTS.forEach(d => {
      if (!typeStatut[d.type_document]) {
        typeStatut[d.type_document] = { type: d.type_document, Expiré: 0, '<30j': 0, '<60j': 0, OK: 0, Permanent: 0 };
      }
      const st = calculerStatutDoc(d.date_expiration).short;
      typeStatut[d.type_document][st] = (typeStatut[d.type_document][st] || 0) + 1;
    });
    return Object.values(typeStatut).sort((a, b) => {
      const aTotal = a.Expiré + a['<30j'] + a['<60j'];
      const bTotal = b.Expiré + b['<30j'] + b['<60j'];
      return bTotal - aTotal;
    });
  }, [refreshKey]);

  // --- ÉTAPE 5 : Graphique 2 — Anneau (répartition statut global) ---
  const chartPieData = useMemo(() => {
    const counts = { Expiré: 0, '<30j': 0, '<60j': 0, OK: 0, Permanent: 0 };
    DOCUMENTS.forEach(d => {
      const st = calculerStatutDoc(d.date_expiration).short;
      counts[st] = (counts[st] || 0) + 1;
    });
    return [
      { name: '🔴 Expiré', value: counts.Expiré, color: ROUGE },
      { name: '🟠 <30j', value: counts['<30j'], color: '#e8783a' },
      { name: '🟡 <60j', value: counts['<60j'], color: JAUNE },
      { name: '🟢 OK', value: counts.OK, color: VERT },
      { name: '🟢 Permanent', value: counts.Permanent, color: BLEU },
    ].filter(d => d.value > 0);
  }, [refreshKey]);

  // --- ÉTAPE 5 : Graphique 3 — Courbes projection expirations 6 prochains mois ---
  // =TEXTE([@[Date_Expiration]];"mmm aaaa") + table de fréquence
  const chartLineData = useMemo(() => {
    const now = new Date();
    const mois = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      mois.push({ key, label, Expiré: 0, '<30j': 0, '<60j': 0, total: 0 });
    }
    DOCUMENTS.forEach(d => {
      if (!d.date_expiration) return;
      const expDate = new Date(d.date_expiration);
      const key = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
      const moisItem = mois.find(m => m.key === key);
      if (moisItem) {
        const st = calculerStatutDoc(d.date_expiration).short;
        if (st === 'Expiré') moisItem.Expiré++;
        else if (st === '<30j') moisItem['<30j']++;
        else if (st === '<60j') moisItem['<60j']++;
        moisItem.total++;
      }
    });
    return mois;
  }, [refreshKey]);

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['ID_Document', 'Matricule', 'Employé', 'Type_Document', 'Numero_Document', 'Date_Emission', 'Date_Expiration', 'Jours_Restants', 'Statut', 'Lieu_Depot', 'Lien_Fichier', 'Dernier_Rappel', 'Notes'];
    const rows = filtered.map(d => {
      const emp = findEmployee(d.employee_id);
      const jr = calculerJoursRestants(d.date_expiration);
      const st = calculerStatutDoc(d.date_expiration);
      return [
        `"${d.document_number}"`,
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${d.type_document}"`,
        `"${d.numero_document || ''}"`,
        `"${d.date_emission || ''}"`,
        `"${d.date_expiration || ''}"`,
        `"${jr !== null ? jr : 'Permanent'}"`,
        `"${st.short}"`,
        `"${d.lieu_depot || ''}"`,
        `"${d.lien_fichier || ''}"`,
        `"${d.dernier_rappel || ''}"`,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suivi-documents-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${filtered.length} document(s) exporté(s) en CSV`, severity: 'success' });
  };

  // --- Création document ---
  const handleCreate = () => {
    if (!newDoc.employee_id) { setSnack({ msg: 'Veuillez sélectionner un employé', severity: 'warning' }); return; }
    if (!newDoc.type_document) { setSnack({ msg: 'Veuillez sélectionner un type de document', severity: 'warning' }); return; }
    const num = `DOC-${String(DOCUMENTS.length + 1).padStart(3, '0')}`;
    DOCUMENTS.push({
      id: `doc-${Date.now()}`,
      employee_id: newDoc.employee_id,
      document_number: num,
      type_document: newDoc.type_document,
      numero_document: newDoc.numero_document || '',
      date_emission: newDoc.date_emission || '',
      date_expiration: newDoc.date_expiration || null,
      statut: 'Valide',
      lieu_depot: newDoc.lieu_depot || 'Dossier physique',
      lien_fichier: newDoc.lien_fichier || '',
      dernier_rappel: '',
      notes: newDoc.notes || '',
    });
    setCreateDialog(false);
    setNewDoc({});
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Document ${num} créé`, severity: 'success' });
  };

  // --- Édition document ---
  const handleSaveEdit = () => {
    if (!editDialog) return;
    const idx = DOCUMENTS.findIndex(d => d.id === editDialog.id);
    if (idx !== -1) {
      DOCUMENTS[idx] = { ...DOCUMENTS[idx], ...editDialog };
    }
    setEditDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Document modifié`, severity: 'success' });
  };

  return (
    <Box>
      {/* === ÉTAPE 5 : TABLEAU DE BORD DOCUMENTAIRE (KPI + Graphiques) === */}
      {/* Lignes 1-2 : 6 indicateurs clés */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(126,63,242,0.08)', borderRadius: 1.5, textAlign: 'center', border: `1px solid ${VIOLET}20` }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: VIOLET, fontSize: '1.6rem' }}>{stats.total}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>Total documents</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NBVAL(T_Documents[ID_Document])</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(179,58,74,0.1)', borderRadius: 1.5, textAlign: 'center', border: `1px solid ${ROUGE}30` }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.6rem' }}>{stats.expires}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>🔴 Expirés</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(T_Documents[Statut];"🔴 Expiré")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(179,58,74,0.06)', borderRadius: 1.5, textAlign: 'center', border: `1px solid ${ROUGE}20` }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.6rem' }}>{stats.moins30}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>🟠 &lt;30j</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(T_Documents[Statut];"🟠 &lt;30j")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(212,160,23,0.1)', borderRadius: 1.5, textAlign: 'center', border: `1px solid ${JAUNE}30` }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: JAUNE, fontSize: '1.6rem' }}>{stats.moins60}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>🟡 &lt;60j</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(T_Documents[Statut];"🟡 &lt;60j")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(26,122,74,0.1)', borderRadius: 1.5, textAlign: 'center', border: `1px solid ${VERT}30` }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: VERT, fontSize: '1.6rem' }}>{stats.ok}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>🟢 OK / Permanent</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Statut;"🟢 OK")+NB.SI("🟢 Permanent")</Typography>
          </Box>
        </Grid>
        {/* ÉTAPE 5 : Taux de conformité =1-(Expirés+<30j)/Total */}
        <Grid item xs={6} sm={2}>
          <Box sx={{
            p: 1.5, borderRadius: 1.5, textAlign: 'center',
            bgcolor: stats.tauxConformite >= 80 ? 'rgba(26,122,74,0.12)' : stats.tauxConformite >= 60 ? 'rgba(212,160,23,0.12)' : 'rgba(179,58,74,0.12)',
            border: `1px solid ${stats.tauxConformite >= 80 ? VERT : stats.tauxConformite >= 60 ? JAUNE : ROUGE}40`,
          }}>
            <Typography variant='h5' fontWeight={800} sx={{
              color: stats.tauxConformite >= 80 ? VERT : stats.tauxConformite >= 60 ? JAUNE : ROUGE,
              fontSize: '1.6rem',
            }}>{stats.tauxConformite}%</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a' }}>Taux conformité</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=1-(Expirés+&lt;30j)/Total</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* === Lignes 4-10 : Graphiques dynamiques (ÉTAPE 5) === */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Graphique 1 : Barres empilées Type_Document × Statut (TCD) */}
        <Grid item xs={12} lg={6}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${VIOLET}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 18, color: VIOLET }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition par Type × Statut (TCD empilé)
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Type_Document · Colonnes=Statut · Valeurs=Comptage ID_Document
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='type' tick={{ fontSize: 9, fill: '#6b7a8a' }} angle={-25} textAnchor='end' height={60} interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${VIOLET}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: 'rgba(126,63,242,0.05)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.62rem' }} />
                    <Bar dataKey='Expiré' stackId='a' fill={ROUGE} name='🔴 Expiré' />
                    <Bar dataKey='<30j' stackId='a' fill='#e8783a' name='🟠 <30j' />
                    <Bar dataKey='<60j' stackId='a' fill={JAUNE} name='🟡 <60j' />
                    <Bar dataKey='OK' stackId='a' fill={VERT} name='🟢 OK' />
                    <Bar dataKey='Permanent' stackId='a' fill={BLEU} name='🟢 Permanent' />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 2 : Anneau (répartition statut global) */}
        <Grid item xs={12} lg={6}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${ORANGE}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutLargeIcon sx={{ fontSize: 18, color: ORANGE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Proportion des statuts (anneau)
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                =NB.SI(T_Documents[Statut]; chaque statut) · Camembert global
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartPieData}
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
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${ORANGE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.62rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 3 : Courbes projection expirations 6 prochains mois */}
        <Grid item xs={12}>
          <Card variant='outlined' sx={{ border: `1px solid ${NAVY}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18, color: NAVY }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Projection des expirations — 6 prochains mois
                </Typography>
                <Chip label='=TEXTE([@[Date_Expiration]];"mmm aaaa")' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: 'rgba(11,42,74,0.08)', color: NAVY, fontFamily: 'monospace' }} />
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Mois_Expiration · Colonnes=Statut · Valeurs=Comptage ID_Document · Filtre=6 prochains mois
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={chartLineData} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='label' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${NAVY}30`, borderRadius: 2, fontSize: '0.72rem' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.62rem' }} />
                    <ReferenceLine x={chartLineData[0]?.label} stroke={VIOLET} strokeDasharray='5 3' label={{ value: "Aujourd'hui", fontSize: 9, fill: VIOLET, position: 'top' }} />
                    <Line type='monotone' dataKey='Expiré' stroke={ROUGE} strokeWidth={2.5} dot={{ r: 4, fill: ROUGE }} activeDot={{ r: 6 }} name='🔴 Expiré' />
                    <Line type='monotone' dataKey='<30j' stroke='#e8783a' strokeWidth={2.5} dot={{ r: 4, fill: '#e8783a' }} activeDot={{ r: 6 }} name='🟠 <30j' />
                    <Line type='monotone' dataKey='<60j' stroke={JAUNE} strokeWidth={2.5} dot={{ r: 4, fill: JAUNE }} activeDot={{ r: 6 }} name='🟡 <60j' />
                    <Line type='monotone' dataKey='total' stroke={NAVY} strokeWidth={1.5} strokeDasharray='5 4' dot={{ r: 3, fill: NAVY }} name='Total expirations' />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === ENRICHISSEMENT : Indicateurs NB.SI pour colonne Alerte (M) — lignes 111-114 équivalent === */}
      <Card variant='outlined' sx={{ mb: 2, border: `1px solid ${ROUGE}20`, borderRadius: '12px', bgcolor: '#fff8f8' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <WarningAmberIcon sx={{ fontSize: 18, color: ROUGE }} />
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY }}>
                Indicateurs colonne Alerte (M) — =NB.SI(M5:M104; ...)
              </Typography>
            </Stack>
            <Stack direction='row' spacing={1.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.2rem' }}>{stats.expires}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>🔴 Expirés (Alerte)</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.45rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(M:M;"🔴 Expiré")</Typography>
              </Box>
              <Divider orientation='vertical' flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.2rem' }}>{stats.moins30}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>🟠 À renouveler &lt;30j</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.45rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(M:M;"🟠 &lt;30j")</Typography>
              </Box>
              <Divider orientation='vertical' flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={800} sx={{ color: JAUNE, fontSize: '1.2rem' }}>{stats.moins60}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>🟡 À surveiller &lt;60j</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.45rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(M:M;"🟡 &lt;60j")</Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* === INFO STRUCTURE TABLEAU === */}
      <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem' }}>
        <strong>📌 Tableau structuré T_Documents</strong> — 16 colonnes (A-P) avec formules automatiques en C (RECHERCHEX), H (Jours_Restants), I (Statut SI imbriquée) et M (Alerte granulaire). Les colonnes en <LockIcon sx={{ fontSize: 11, verticalAlign: 'middle' }} /> sont protégées (lecture seule). La colonne Alerte (M) est indépendante de Statut (I) pour préserver la compatibilité Dashboard.
      </Alert>

      <Card>
        <CardContent>
          {/* === ÉTAPE 3 : SYSTÈME D'ALERTES AUTOMATIQUES === */}
          <Card variant='outlined' sx={{ mb: 2, border: `2px solid ${ROUGE}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(179,58,74,0.06) 0%, rgba(184,106,42,0.04) 100%)` }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: totalAlertes > 0 ? ROUGE : VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NotificationsActiveIcon fontSize='small' />
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                      Système d'alertes automatiques
                    </Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block' }}>
                      {totalAlertes > 0 ? (
                        <>
                          <strong style={{ color: ROUGE }}>{totalAlertes} document(s)</strong> en alerte · <strong style={{ color: VIOLET }}>{docsARappeler.length} à rappeler</strong> (fréquence {alerteConfig.frequence_jours}j)
                        </>
                      ) : (
                        <>Aucune alerte active — tous les documents sont à jour</>
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
                  <Tooltip title="Envoyer les rappels maintenant (équivalent VBA EnvoyerRappelsDocuments)">
                    <Button
                      variant='contained' size='small'
                      startIcon={<SendIcon />}
                      onClick={handleSendRappels}
                      disabled={!alerteConfig.activer || docsARappeler.length === 0}
                      sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: ROUGE, '&:hover': { bgcolor: '#9a2f3a' } }}
                    >
                      Envoyer les rappels ({docsARappeler.length})
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* === CODE VBA Excel (tooltip info) === */}
          <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem' }}>
            <Typography variant='caption' sx={{ fontSize: '0.68rem' }}>
              📧 <strong>Système d'alertes</strong> — Scanne quotidiennement les documents "🔴 Expiré" ou "🟠 &lt;30j" et envoie un email récapitulatif.
              Fréquence : <strong>{alerteConfig.frequence_jours} jours</strong> (évite les doublons via colonne L « Dernier_Rappel »).
              Destinataires : <strong>{alerteConfig.destinataires}</strong>.
            </Typography>
          </Alert>

          <SectionHeader
            title='Suivi Documents (T_Documents)'
            subtitle={`${filtered.length} document(s) · Filtres dynamiques (Type, Statut, Employé, Date, Texte) · Tri multi-colonnes · =FILTRE + =NBVAL`}
            action={<Stack direction='row' spacing={1} flexWrap='wrap'>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
              <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ textTransform: 'none', fontSize: '0.75rem', color: ROUGE, borderColor: `${ROUGE}40` }}>Export PDF</Button>
              <Button variant='outlined' size='small' startIcon={<AssessmentIcon />} onClick={() => setAuditDialog(true)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: NAVY, borderColor: `${NAVY}40` }}>Rapport Audit</Button>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewDoc({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: VIOLET }}>Nouveau document</Button>
            </Stack>}
          />

          {/* === ÉTAPE 2 : ZONE DE FILTRES DYNAMIQUES (lignes B1-E1 équivalent Excel) === */}
          <Card variant='outlined' sx={{ mb: 2, border: `2px solid ${VIOLET}20`, borderRadius: '12px', bgcolor: '#faf5ff' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent='space-between' sx={{ mb: 1 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <FilterListIcon sx={{ fontSize: 18, color: VIOLET }} />
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.8rem', color: NAVY }}>
                    Zone de filtres dynamiques
                  </Typography>
                  {activeFilterCount > 0 && (
                    <Chip label={`${activeFilterCount} filtre(s) actif(s)`} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: 'rgba(126,63,242,0.15)', color: VIOLET, fontWeight: 700 }} />
                  )}
                </Stack>
                {activeFilterCount > 0 && (
                  <Button size='small' startIcon={<ClearIcon sx={{ fontSize: 14 }} />} onClick={handleResetFilters} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE }}>
                    Réinitialiser
                  </Button>
                )}
              </Stack>
              {/* Cellules B1-E1 équivalent */}
              <Grid container spacing={1.5}>
                {/* B1: Filtre Type */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.3 }}>
                    <Box sx={{ fontSize: '0.55rem', color: VIOLET, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', px: 0.5, borderRadius: 0.3 }}>B1</Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Filtre Type</Typography>
                  </Stack>
                  <TextField select size='small' fullWidth value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }} sx={{ bgcolor: '#fff', '& .MuiInput-root': { fontSize: '0.75rem' } }}>
                    <MenuItem value=''>Tous les types</MenuItem>
                    {TYPES_DOCUMENT.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
                {/* C1: Filtre Statut */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.3 }}>
                    <Box sx={{ fontSize: '0.55rem', color: VIOLET, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', px: 0.5, borderRadius: 0.3 }}>C1</Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Filtre Statut</Typography>
                  </Stack>
                  <TextField select size='small' fullWidth value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ bgcolor: '#fff', '& .MuiInput-root': { fontSize: '0.75rem' } }}>
                    <MenuItem value=''>Tous les statuts</MenuItem>
                    <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
                    <MenuItem value='<30j'>🟠 &lt;30j</MenuItem>
                    <MenuItem value='<60j'>🟡 &lt;60j</MenuItem>
                    <MenuItem value='OK'>🟢 OK</MenuItem>
                    <MenuItem value='Permanent'>🟢 Permanent</MenuItem>
                  </TextField>
                </Grid>
                {/* D1: Filtre Employé (dropdown dynamique) */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.3 }}>
                    <Box sx={{ fontSize: '0.55rem', color: VIOLET, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', px: 0.5, borderRadius: 0.3 }}>D1</Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Filtre Employé</Typography>
                  </Stack>
                  <TextField select size='small' fullWidth value={fEmploye} onChange={(e) => { setFEmploye(e.target.value); setPage(0); }} sx={{ bgcolor: '#fff', '& .MuiInput-root': { fontSize: '0.75rem' } }}>
                    <MenuItem value=''>Tous les employés</MenuItem>
                    {EMPLOYEES.filter(e => DOCUMENTS.some(d => d.employee_id === e.id)).map(e => <MenuItem key={e.id} value={e.id}>{employeeFullName(e)}</MenuItem>)}
                  </TextField>
                </Grid>
                {/* E1: Recherche texte (plein texte) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.3 }}>
                    <Box sx={{ fontSize: '0.55rem', color: VIOLET, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', px: 0.5, borderRadius: 0.3 }}>E1</Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Recherche texte (nom, n°, type)</Typography>
                  </Stack>
                  <TextField
                    size='small' fullWidth placeholder='Rechercher...'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
                      endAdornment: search ? <InputAdornment position='end'><IconButton size='small' onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
                    }}
                    sx={{ bgcolor: '#fff', '& .MuiInput-root': { fontSize: '0.75rem' } }}
                  />
                </Grid>
                {/* Filtre Date_Expiration (mode) */}
                <Grid item xs={12} sm={6} md={2.2}>
                  <Stack direction='row' spacing={0.3} alignItems='center' sx={{ mb: 0.3 }}>
                    <Box sx={{ fontSize: '0.55rem', color: VIOLET, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(126,63,242,0.1)', px: 0.5, borderRadius: 0.3 }}>F1</Box>
                    <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Date expiration</Typography>
                  </Stack>
                  <TextField select size='small' fullWidth value={fDateMode} onChange={(e) => { setFDateMode(e.target.value); setPage(0); }} sx={{ bgcolor: '#fff', '& .MuiInput-root': { fontSize: '0.75rem' } }}>
                    <MenuItem value=''>Toutes</MenuItem>
                    <MenuItem value='expired'>🔴 Expirés</MenuItem>
                    <MenuItem value='<30'>🟠 &lt;30 jours</MenuItem>
                    <MenuItem value='<60'>🟡 &lt;60 jours</MenuItem>
                    <MenuItem value='>60'>🟢 &gt;60 jours</MenuItem>
                    <MenuItem value='permanent'>🟢 Permanents</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {/* Formule FILTRE Excel affichée */}
              <Tooltip title='Formule Excel FILTRE multi-critères avec SIERREUR'>
                <Box sx={{ mt: 1, p: 0.8, bgcolor: 'rgba(126,63,242,0.05)', borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.55rem', color: VIOLET, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {'=SIERREUR(FILTRE(T_Documents[#Tout]; (SI(ESTVIDE(B1);VRAI;Type=B1)) * (SI(ESTVIDE(C1);VRAI;Statut=C1)) * (SI(ESTVIDE(D1);VRAI;Employé=D1)) * (SI(ESTVIDE(E1);VRAI;ESTNUM(CHERCHE(E1;Employé&Num&Type))))); "Aucun résultat")'}
                </Box>
              </Tooltip>
            </CardContent>
          </Card>

          {/* === COMPTEUR DYNAMIQUE DE RÉSULTATS + ACTIONS GROUPEES (ÉTAPE 4) === */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, px: 1 }} justifyContent='space-between'>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>
                <strong style={{ color: NAVY, fontSize: '0.85rem' }}>{filtered.length}</strong> résultat(s) affiché(s) sur {DOCUMENTS.length}
              </Typography>
              <Tooltip title='=NBVAL(PlageFiltrée) — Compte le nombre de résultats après filtrage'>
                <Chip
                  label={`=NBVAL(PlageFiltrée) = ${filtered.length}`}
                  size='small'
                  sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(126,63,242,0.08)', color: VIOLET, fontFamily: 'monospace', fontWeight: 700 }}
                />
              </Tooltip>
              {filtered.length === 0 && (
                <Chip label='Aucun résultat — SIERREUR(FILTRE(...); "Aucun résultat")' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
              )}
              {sortConfig.key && (
                <Chip label={`Tri: ${sortConfig.key} (${sortConfig.direction})`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(11,42,74,0.08)', color: NAVY, fontWeight: 600 }} />
              )}
              {selected.size > 0 && (
                <Chip
                  label={`${selected.size} sélectionné(s)`}
                  size='small'
                  onDelete={handleClearSelection}
                  deleteIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                  sx={{ fontSize: '0.6rem', height: 20, bgcolor: 'rgba(126,63,242,0.15)', color: VIOLET, fontWeight: 700 }}
                />
              )}
            </Stack>
            {/* Actions groupées (ÉTAPE 4) */}
            {selected.size > 0 && (
              <Stack direction='row' spacing={1}>
                <Tooltip title='Renouveler les documents sélectionnés (+ durée selon type, réinitialise le rappel)'>
                  <Button variant='outlined' size='small' startIcon={<AutorenewIcon />} onClick={handleRenouvelerSelection} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ORANGE, borderColor: ORANGE }}>
                    Renouveler ({selected.size})
                  </Button>
                </Tooltip>
                <Tooltip title='Exporter les documents sélectionnés en PDF (rapport imprimable)'>
                  <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportSelectionPDF} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE, borderColor: ROUGE }}>
                    Export PDF ({selected.size})
                  </Button>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* === TABLEAU T_Documents (13 colonnes A-M + checkbox + actions) === */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {/* Colonne A : Checkbox (sélection multiple) */}
                  <TableCell padding='checkbox' sx={{ width: 40, borderBottom: `2px solid ${VIOLET}` }}>
                    <Checkbox
                      size='small'
                      indeterminate={selected.size > 0 && selected.size < filtered.length}
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={handleSelectAll}
                      sx={{ color: VIOLET, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: VIOLET } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>A</Box>ID Document
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('document_number')}>
                        {sortConfig.key === 'document_number' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>B</Box>Matricule
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>C</Box>Employé<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} />
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('employee')}>
                        {sortConfig.key === 'employee' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>D</Box>Type
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('type_document')}>
                        {sortConfig.key === 'type_document' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>E</Box>N° Document</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>F</Box>Émission</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>G</Box>Expiration
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('date_expiration')}>
                        {sortConfig.key === 'date_expiration' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center' justifyContent='flex-end'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>H</Box>Jours restants<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} />
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('jours_restants')}>
                        {sortConfig.key === 'jours_restant' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>I</Box>Statut<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} />
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('statut')}>
                        {sortConfig.key === 'statut' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>J</Box>Lieu dépôt</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>K</Box>Lien fichier</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>L</Box>Dernier rappel</Stack></TableCell>
                  {/* ENRICHISSEMENT : Colonne M — Alerte (formule granulaire, protégée, sans modifier Statut en I) */}
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: 'rgba(179,58,74,0.04)' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>M</Box>Alerte<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} />
                      <IconButton size='small' sx={{ p: 0, ml: 0.3 }} onClick={() => handleSort('alerte')}>
                        {sortConfig.key === 'alerte' ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 11, color: VIOLET }} /> : <ArrowDownwardIcon sx={{ fontSize: 11, color: VIOLET }} />) : <ArrowUpwardIcon sx={{ fontSize: 10, color: '#ccc' }} />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>N</Box>Notes</Stack></TableCell>
                  {/* ÉTAPE 6.4 : Colonne O — Contrat associé (RECHERCHEX) */}
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>O</Box>Contrat<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /></Stack></TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                    <Stack direction='row' spacing={0.3} alignItems='center' justifyContent='center'>
                      <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>P</Box>Actions
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((d) => {
                  const emp = findEmployee(d.employee_id);
                  const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                  const jr = calculerJoursRestants(d.date_expiration);
                  const statut = calculerStatutDoc(d.date_expiration);
                  const typeColor = TYPE_COLORS[d.type_document] || '#6b7a8a';
                  return (
                    <TableRow key={d.id} hover sx={{
                      // Mise en forme conditionnelle sur la ligne selon statut
                      bgcolor: selected.has(d.id) ? 'rgba(126,63,242,0.08)' :
                               statut.short === 'Expiré' ? 'rgba(179,58,74,0.04)' :
                               statut.short === '<30j' ? 'rgba(179,58,74,0.03)' :
                               statut.short === '<60j' ? 'rgba(212,160,23,0.03)' :
                               'transparent',
                      '&:hover': {
                        bgcolor: selected.has(d.id) ? 'rgba(126,63,242,0.12)' :
                                 statut.short === 'Expiré' ? 'rgba(179,58,74,0.08)' :
                                 statut.short === '<30j' ? 'rgba(179,58,74,0.06)' :
                                 statut.short === '<60j' ? 'rgba(212,160,23,0.06)' :
                                 'action.hover',
                      },
                    }}>
                      {/* Colonne A : Checkbox (sélection) */}
                      <TableCell padding='checkbox'>
                        <Checkbox
                          size='small'
                          checked={selected.has(d.id)}
                          onChange={() => handleToggleSelect(d.id)}
                          sx={{ color: VIOLET, '&.Mui-checked': { color: VIOLET } }}
                        />
                      </TableCell>
                      {/* A: ID_Document */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700, color: VIOLET }}>{d.document_number}</Typography>
                      </TableCell>
                      {/* B: Matricule (dropdown source) */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: NAVY }}>{emp?.matricule || '—'}</Typography>
                      </TableCell>
                      {/* C: Employé (RECHERCHEX auto, read-only) */}
                      <TableCell sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title={`=RECHERCHEX([@Matricule]; '2-Base Candidats'!B:B; D&E; "Non trouvé"; 0)`}>
                          <Stack direction='row' spacing={0.5} alignItems='center'>
                            <LockIcon sx={{ fontSize: 11, color: '#9aa8b8' }} />
                            <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{empName}</Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* D: Type_Document */}
                      <TableCell>
                        <Chip label={d.type_document} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: `${typeColor}15`, color: typeColor, fontWeight: 600, border: `1px solid ${typeColor}30` }} />
                      </TableCell>
                      {/* E: Numero_Document */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem' }}>{d.numero_document || '—'}</Typography>
                      </TableCell>
                      {/* F: Date_Emission */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>{d.date_emission ? formatDate(d.date_emission) : '—'}</Typography>
                      </TableCell>
                      {/* G: Date_Expiration */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.68rem', fontWeight: 600, color: d.date_expiration ? NAVY : '#9aa8b8' }}>
                          {d.date_expiration ? formatDate(d.date_expiration) : 'Permanent'}
                        </Typography>
                      </TableCell>
                      {/* H: Jours_Restants (auto, read-only) */}
                      <TableCell align='right' sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title='=SI([@[Date_Expiration]]=""; ""; [@[Date_Expiration]]-AUJOURDHUI())'>
                          {jr === null ? (
                            <Chip label='∞' size='small' sx={{ fontSize: '0.6rem', height: 16, bgcolor: 'rgba(107,122,138,0.1)', color: '#6b7a8a', fontWeight: 700 }} />
                          ) : (
                            <Stack direction='row' spacing={0.3} alignItems='center' justifyContent='flex-end'>
                              <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                              <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: jr < 0 ? ROUGE : jr <= 30 ? ROUGE : jr <= 60 ? JAUNE : VERT }}>
                                {jr < 0 ? `${jr}j` : `${jr}j`}
                              </Typography>
                            </Stack>
                          )}
                        </Tooltip>
                      </TableCell>
                      {/* I: Statut (auto SI imbriquée, read-only) + Mise en forme conditionnelle */}
                      <TableCell sx={{ bgcolor: statut.bg }}>
                        <Tooltip title='=SI([@[Date_Expiration]]=""; "🟢 Permanent"; SI(<AUJOURDHUI(); "🔴 Expiré"; SI(<=+30; "🟠 <30j"; SI(<=+60; "🟡 <60j"; "🟢 OK"))))'>
                          <Chip label={statut.label} size='small' sx={{
                            fontSize: '0.6rem', height: 18, fontWeight: 700,
                            bgcolor: statut.bg, color: statut.color,
                            border: `1px solid ${statut.color}40`,
                          }} />
                        </Tooltip>
                      </TableCell>
                      {/* J: Lieu_Depot */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#4a5a6a' }}>{d.lieu_depot || '—'}</Typography>
                      </TableCell>
                      {/* K: Lien_Fichier */}
                      <TableCell>
                        {d.lien_fichier ? (
                          <Tooltip title={d.lien_fichier}>
                            <IconButton size='small' sx={{ color: ROUGE }}><DescriptionIcon sx={{ fontSize: 14 }} /></IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>
                        )}
                      </TableCell>
                      {/* L: Dernier_Rappel */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.66rem', color: d.dernier_rappel ? ORANGE : '#9aa8b8' }}>
                          {d.dernier_rappel ? formatDate(d.dernier_rappel) : '—'}
                        </Typography>
                      </TableCell>
                      {/* ENRICHISSEMENT : M — Alerte (formule granulaire SI imbriquée, protégée, distincte de Statut I) */}
                      {/* =SI(G5=""; "🟢 Permanent"; SI(G5<AUJOURDHUI(); "🔴 Expiré"; SI(G5<=AUJOURDHUI()+30; "🟠 <30j"; SI(G5<=AUJOURDHUI()+60; "🟡 <60j"; "🟢 OK")))) */}
                      <TableCell sx={{ bgcolor: statut.bg, borderLeft: `3px solid ${statut.color}` }}>
                        <Tooltip title='=SI(G=""; "🟢 Permanent"; SI(G<AUJOURDHUI(); "🔴 Expiré"; SI(G<=+30; "🟠 <30j"; SI(G<=+60; "🟡 <60j"; "🟢 OK")))) — Colonne protégée (lecture seule)'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={statut.label} size='small' sx={{
                              fontSize: '0.58rem', height: 18, fontWeight: 700,
                              bgcolor: statut.bg, color: statut.color,
                              border: `1px solid ${statut.color}40`,
                            }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* N: Notes */}
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.64rem', color: '#6b7a8a', maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.notes || '—'}</Typography>
                      </TableCell>
                      {/* ÉTAPE 6.4 : O — Contrat associé (RECHERCHEX matricule → 6-Suivi Contrats) */}
                      <TableCell sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        {(() => {
                          const emp = findEmployee(d.employee_id);
                          const contrat = CONTRATS.find(c => c.employee_id === d.employee_id);
                          if (!contrat) return <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#9aa8b8' }}>Non trouvé</Typography>;
                          return (
                            <Tooltip title={`=RECHERCHEX([@Matricule]; '6-Suivi Contrats'!B:B; '6-Suivi Contrats'!A:A; "Non trouvé";0)`}>
                              <Stack direction='row' spacing={0.3} alignItems='center'>
                                <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                                <Chip
                                  label={contrat.contract_number}
                                  size='small'
                                  clickable
                                  onClick={() => navigate('/domaine2_Gestion_Administrative_Personnel/contrats')}
                                  sx={{ fontSize: '0.58rem', height: 18, color: BLEU, border: `1px solid ${BLEU}40`, cursor: 'pointer', fontWeight: 600 }}
                                />
                              </Stack>
                            </Tooltip>
                          );
                        })()}
                      </TableCell>
                      {/* O: Actions individuelles (ÉTAPE 4) */}
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.3} justifyContent='center'>
                          {/* 📄 Télécharger (=HYPERLINK([@[Lien_Fichier]]; "📄")) */}
                          {d.lien_fichier ? (
                            <Tooltip title={`Télécharger — ${d.lien_fichier}`}>
                              <IconButton size='small' component='a' href={d.lien_fichier} target='_blank' rel='noopener noreferrer' sx={{ color: ROUGE }}>
                                <DescriptionIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title='Aucun fichier lié'>
                              <span>
                                <IconButton size='small' disabled>
                                  <DescriptionIcon sx={{ fontSize: 14, color: '#ccc' }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {/* ✏️ Modifier (ouvre formulaire modification) */}
                          <Tooltip title='Modifier le document'>
                            <IconButton size='small' color='info' onClick={() => setEditDialog({ ...d })}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {/* 🔄 Renouveler (macro RenouvelerDocument) */}
                          <Tooltip title={`Renouveler (+${DUREES_VALIDITE[d.type_document] || 1} an${(DUREES_VALIDITE[d.type_document] || 1) > 1 ? 's' : ''} selon type ${d.type_document})`}>
                            <IconButton
                              size='small'
                              sx={{ color: ORANGE }}
                              disabled={!DUREES_VALIDITE[d.type_document] || !d.date_expiration}
                              onClick={() => handleRenouvelerDoc(d)}
                            >
                              <AutorenewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {/* 👤 Fiche employé (=HYPERLINK vers 2-Fiche Employé) */}
                          <Tooltip title='Voir fiche employé'>
                            <IconButton size='small' sx={{ color: VIOLET }} onClick={() => navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${d.employee_id}`)}>
                              <PersonIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={17} align='center' sx={{ py: 6, color: 'text.secondary' }}>
                    <WarningAmberIcon sx={{ fontSize: 32, color: '#bbb', mb: 1 }} />
                    <Typography variant='body2' sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Aucun résultat
                    </Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#9aa8b8', display: 'block', mt: 0.5 }}>
                      SIERREUR(FILTRE(...); "Aucun résultat") — Aucun document ne correspond aux critères sélectionnés
                    </Typography>
                    {activeFilterCount > 0 && (
                      <Button size='small' startIcon={<ClearIcon sx={{ fontSize: 14 }} />} onClick={handleResetFilters} sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.72rem', color: VIOLET }}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </TableCell></TableRow>
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

      {/* === DIALOG CRÉATION DOCUMENT === */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color='success' /> Nouveau document — N° auto: DOC-{String(DOCUMENTS.length + 1).padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
              L'ID Document est généré automatiquement (=DOC-&TEXTE(LIGNE()-4;"000")). L'Employé (col C) et les Jours_Restants (col H) + Statut (col I) sont calculés automatiquement via RECHERCHEX et SI imbriquée.
            </Alert>
            {/* B: Matricule (liste déroulante issue de 2-Base Candidats) */}
            <TextField select size='small' label='Matricule employé (source: 2-Base Candidats / 6-Suivi Contrats)' fullWidth value={newDoc.employee_id || ''} onChange={(e) => setNewDoc({ ...newDoc, employee_id: e.target.value })}>
              {EMPLOYEES.map(emp => <MenuItem key={emp.id} value={emp.id}>{emp.matricule} — {employeeFullName(emp)} ({emp.poste})</MenuItem>)}
            </TextField>
            {/* D: Type_Document (liste déroulante) */}
            <TextField select size='small' label='Type de document (col D)' fullWidth value={newDoc.type_document || ''} onChange={(e) => setNewDoc({ ...newDoc, type_document: e.target.value })}>
              {TYPES_DOCUMENT.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            {/* E: Numero_Document */}
            <TextField size='small' label='Numéro du document (col E)' fullWidth value={newDoc.numero_document || ''} onChange={(e) => setNewDoc({ ...newDoc, numero_document: e.target.value })} placeholder='Ex: ID-123456789, CNPS-456...' />
            <Stack direction='row' spacing={1.5}>
              {/* F: Date_Emission */}
              <TextField type='date' size='small' label="Date d'émission (col F)" fullWidth value={newDoc.date_emission || ''} onChange={(e) => setNewDoc({ ...newDoc, date_emission: e.target.value })} InputLabelProps={{ shrink: true }} />
              {/* G: Date_Expiration */}
              <TextField type='date' size='small' label="Date d'expiration (col G — vide si permanent)" fullWidth value={newDoc.date_expiration || ''} onChange={(e) => setNewDoc({ ...newDoc, date_expiration: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Stack>
            {/* J: Lieu_Depot */}
            <TextField select size='small' label='Lieu de dépôt (col J)' fullWidth value={newDoc.lieu_depot || 'Dossier physique'} onChange={(e) => setNewDoc({ ...newDoc, lieu_depot: e.target.value })}>
              {LIEUX_DEPOT.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
            {/* K: Lien_Fichier */}
            <TextField size='small' label='Lien fichier (col K)' fullWidth value={newDoc.lien_fichier || ''} onChange={(e) => setNewDoc({ ...newDoc, lien_fichier: e.target.value })} placeholder='/docs/xxx.pdf' />
            {/* M: Notes */}
            <TextField size='small' label='Notes (col M)' fullWidth multiline rows={2} value={newDoc.notes || ''} onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<AddIcon />} disabled={!newDoc.employee_id || !newDoc.type_document} onClick={handleCreate} sx={{ bgcolor: VIOLET }}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION DOCUMENT === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier — {editDialog?.document_number}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField select size='small' label='Type de document' fullWidth value={editDialog.type_document || ''} onChange={(e) => setEditDialog({ ...editDialog, type_document: e.target.value })}>
                {TYPES_DOCUMENT.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField size='small' label='Numéro du document' fullWidth value={editDialog.numero_document || ''} onChange={(e) => setEditDialog({ ...editDialog, numero_document: e.target.value })} />
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label="Date d'émission" fullWidth value={(editDialog.date_emission || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_emission: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField type='date' size='small' label="Date d'expiration (vide = permanent)" fullWidth value={(editDialog.date_expiration || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_expiration: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              <TextField select size='small' label='Lieu de dépôt' fullWidth value={editDialog.lieu_depot || ''} onChange={(e) => setEditDialog({ ...editDialog, lieu_depot: e.target.value })}>
                {LIEUX_DEPOT.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </TextField>
              <TextField size='small' label='Lien fichier' fullWidth value={editDialog.lien_fichier || ''} onChange={(e) => setEditDialog({ ...editDialog, lien_fichier: e.target.value })} placeholder='/docs/xxx.pdf' />
              <TextField type='date' size='small' label='Dernier rappel envoyé' fullWidth value={(editDialog.dernier_rappel || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, dernier_rappel: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField size='small' label='Notes' fullWidth multiline rows={2} value={editDialog.notes || ''} onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })} />
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                <strong>Colonnes auto (non modifiables) :</strong> Employé (RECHERCHEX), Jours_Restants (Date - AUJOURDHUI), Statut (SI imbriquée).
                <br />Statut actuel calculé : <strong>{calculerStatutDoc(editDialog.date_expiration).label}</strong>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === ÉTAPE 3 : DIALOG CONFIGURATION ALERTES (_Config_Alertes_Docs) === */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color='primary' /> Configuration des alertes (_Config_Alertes_Docs)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Feuille de configuration Excel <strong>_Config_Alertes_Docs</strong> — Paramètres du système d'alertes automatiques.
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
                helperText='Évite les doublons (col L)'
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
                {'Sub EnvoyerRappelsDocuments()\n  For i = 2 To lastRow\n    If Statut = "🔴 Expiré" Or "🟠 <30j" Then\n      If Dernier_Rappel < Date - 7 Or "" Then\n        corps = corps & Employé & " - " & Type\n        ws.Cells(i, "L").Value = Date\n      End If\n    End If\n  Next i\n  outMail.Send\nEnd Sub'}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfigDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SettingsIcon />} onClick={handleSaveConfig} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === ÉTAPE 3 : DIALOG RÉCAPITULATIF EMAIL (après envoi) === */}
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
              {/* Liste des documents rappelés */}
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📋 Documents concernés ({alerteRecapDialog.count})
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 200 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N° Doc</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expire le</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Jours</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Dernier rappel (MAJ)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerteRecapDialog.docsAlerte.map(d => {
                        const emp = findEmployee(d.employee_id);
                        const jr = calculerJoursRestants(d.date_expiration);
                        const st = calculerStatutDoc(d.date_expiration);
                        return (
                          <TableRow key={d.id} hover>
                            <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: VIOLET }}>{d.document_number}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{d.type_document}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{formatDate(d.date_expiration)}</TableCell>
                            <TableCell align='right' sx={{ fontSize: '0.65rem', fontWeight: 700, color: jr < 0 ? ROUGE : ORANGE }}>{jr}j</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem' }}><Chip label={st.label} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
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
                📝 <strong>Audit trail</strong> — L'envoi a été enregistré dans <code>ALERTES_HISTORIQUE</code>. La colonne L (Dernier_Rappel) a été mise à jour pour chaque document concerné.
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

      {/* === ÉTAPE 4 : DIALOG RENOUVELLEMENT GROUPÉ (confirmation) === */}
      <Dialog open={Boolean(renouvelerDialog)} onClose={() => setRenouvelerDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutorenewIcon sx={{ color: ORANGE }} /> Confirmer le renouvellement — {renouvelerDialog?.count} document(s)
        </DialogTitle>
        <DialogContent>
          {renouvelerDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                Cette action va <strong>renouveler automatiquement</strong> {renouvelerDialog.count} document(s) en ajoutant la durée de validité selon le type (Select Case typeDoc).
                La colonne L (Dernier_Rappel) sera <strong>réinitialisée</strong> pour chaque document.
                {renouvelerDialog.skipped > 0 && <><br />⚠️ {renouvelerDialog.skipped} document(s) permanent(s) ignoré(s) (RIB, Diplôme, Photo).</>}
              </Alert>
              {/* Code VBA Excel affiché */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#1e1e2e', borderRadius: 1 }}>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#a6accd', fontFamily: 'monospace', display: 'block', whiteSpace: 'pre-wrap' }}>
                  {'Sub RenouvelerDocument(ligne)\n  Select Case typeDoc\n    Case "CNI": nouvelleDate = DateAdd("yyyy", 10, dateExp)\n    Case "Passeport": +5 ans\n    Case "Certificat medical": +2 ans\n    Case "Casier judiciaire": +3 ans\n    Case Else: +1 an\n  End Select\n  ws.Cells(ligne, "G").Value = nouvelleDate\n  ws.Cells(ligne, "L").Value = ""  \' Réinitialiser rappel\nEnd Sub'}
                </Typography>
              </Paper>
              {/* Table des documents à renouveler */}
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 300 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N° Doc</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expiration actuelle</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Durée</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Nouvelle expiration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renouvelerDialog.docs.map(d => {
                      const emp = findEmployee(d.employee_id);
                      const duree = DUREES_VALIDITE[d.type_document] || 1;
                      const nouvelleDate = calculerNouvelleDateExpiration(d.type_document, d.date_expiration);
                      return (
                        <TableRow key={d.id} hover>
                          <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: VIOLET }}>{d.document_number}</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem' }}>{d.type_document}</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>{formatDate(d.date_expiration)}</TableCell>
                          <TableCell align='right' sx={{ fontSize: '0.65rem', fontWeight: 700, color: ORANGE }}>+{duree} an{duree > 1 ? 's' : ''}</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 700, color: VERT }}>{formatDate(nouvelleDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRenouvelerDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<AutorenewIcon />} onClick={handleConfirmRenouveler} sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#9a571f' } }}>
            Confirmer le renouvellement
          </Button>
        </DialogActions>
      </Dialog>

      {/* === ÉTAPE 6.3 : DIALOG RAPPORT AUDIT DOCUMENTS === */}
      <Dialog open={auditDialog} onClose={() => setAuditDialog(false)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon sx={{ color: NAVY }} /> Rapport Audit Documents — {auditData.length} document(s) en alerte
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='warning' sx={{ fontSize: '0.72rem' }}>
              <strong>Récapitulatif des documents expirés et à renouveler</strong> — Trié par Employé puis par Date_Expiration.
              <br />Inclut : 🔴 Expirés + 🟠 &lt;30j + 🟡 &lt;60j.
            </Alert>
            {/* Stats rapides */}
            <Stack direction='row' spacing={2}>
              <Chip label={`🔴 Expirés : ${auditData.filter(d => calculerStatutDoc(d.date_expiration).short === 'Expiré').length}`} size='small' sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
              <Chip label={`🟠 <30j : ${auditData.filter(d => calculerStatutDoc(d.date_expiration).short === '<30j').length}`} size='small' sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(179,58,74,0.06)', color: ROUGE, fontWeight: 700 }} />
              <Chip label={`🟡 <60j : ${auditData.filter(d => calculerStatutDoc(d.date_expiration).short === '<60j').length}`} size='small' sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(212,160,23,0.1)', color: JAUNE, fontWeight: 700 }} />
            </Stack>
            {/* Table audit (triée par Employé + Date) */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 400 }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Matricule</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N° Doc</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Expiration</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Jours</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Contrat</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Lieu dépôt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData.map(d => {
                    const emp = findEmployee(d.employee_id);
                    const jr = calculerJoursRestants(d.date_expiration);
                    const st = calculerStatutDoc(d.date_expiration);
                    const contrat = CONTRATS.find(c => c.employee_id === d.employee_id);
                    return (
                      <TableRow key={d.id} hover sx={{ bgcolor: st.short === 'Expiré' ? 'rgba(179,58,74,0.04)' : 'transparent' }}>
                        <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>{emp?.matricule || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: VIOLET }}>{d.document_number}</TableCell>
                        <TableCell sx={{ fontSize: '0.65rem' }}>{d.type_document}</TableCell>
                        <TableCell sx={{ fontSize: '0.65rem' }}>{formatDate(d.date_expiration)}</TableCell>
                        <TableCell align='right' sx={{ fontSize: '0.65rem', fontWeight: 700, color: jr < 0 ? ROUGE : ORANGE }}>{jr}j</TableCell>
                        <TableCell><Chip label={st.label} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ fontSize: '0.65rem', color: BLEU }}>{contrat?.contract_number || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.62rem' }}>{d.lieu_depot || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace' }}>
              TCD équivalent : Lignes=Employé · Tri=Date_Expiration · Filtre=Statut (Expiré + &lt;30j + &lt;60j)
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAuditDialog(false)}>Fermer</Button>
          <Button variant='outlined' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
            Export CSV
          </Button>
          <Button variant='contained' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ bgcolor: ROUGE, textTransform: 'none', fontSize: '0.72rem' }}>
            Export PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
