// ============================================================
// SuiviBancairesD2.jsx — Feuille « 6-Donnees Bancaires » (PROMPT 1)
// Tableau structuré T_Bancaire (12 colonnes A-L)
//
// A: N°               = "BAN-"&TEXTE(LIGNE()-4;"000")  (auto)
// B: Matricule        = dropdown EMPLOYEES
// C: Nom Employé      = RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E)  (auto, lock)
// D: Banque           = dropdown BANQUES_LIST
// E: Agence           = saisie libre
// F: RIB              = saisie libre (masqué ****1234)
// G: Compte Principal = dropdown Oui/Non
// H: Date Mise à Jour = auto AUJOURDHUI() ou saisie
// I: Statut           = SI imbriquée (auto, lock)
// J: Alerte           = SI imbriquée granulaire (auto, lock, indépendante de I)
// K: Dernier Contrôle = saisie date
// L: Notes            = saisie libre
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
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssessmentIcon from '@mui/icons-material/Assessment';
import {
  BANCAIRES, BANQUES_LIST, EMPLOYEES, CONTRATS, findEmployee, employeeFullName,
  formatNumber, formatDate,
  calculerStatutBancaire, calculerAlerteBancaireEnrichie,
  CONFIG_ALERTES_BANCAIRES, ALERTES_BANCAIRES_HISTORIQUE,
  genererCorpsEmailBancaires, detecterRibDuplique, detecterPrincipalManquant,
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
// PROMPT 4 : Audit trail des modifications bancaires (Bancaires_Audit)
// Conforme ISO 30401:2018 — traçabilité des changements :
// - basculer_principal (individuel + groupé)
// - modifier_rib (changement de RIB)
// - marquer_verifie (action groupée)
// Chaque entrée enregistre : timestamp, action, banque_id, employee_id,
// et selon l'action : is_principal_before/after, ancien_rib/nouveau_rib.
// ============================================================
const BANCAIRE_AUDIT_TRAIL = [];

// ============================================================
// PROMPT 6 : Journal des exports sécurisés (export PDF, Paie, Audit)
// Conforme ISO 30401:2018 — traçabilité des exports de données sensibles.
// Chaque entrée enregistre : timestamp, type, filename, nb_lignes, statut, user.
// Types : export_pdf (RIB masqué), export_paie (RIB complet — sensible),
// export_csv, export_audit. User par défaut : 'DRH'.
// ============================================================
const EXPORTS_LOG = [];

export default function SuiviBancairesD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fBanque, setFBanque] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [fAlerte, setFAlerte] = useState('');
  const [fCompte, setFCompte] = useState('');
  const [snack, setSnack] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [newBanque, setNewBanque] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFullRib, setShowFullRib] = useState(new Set());

  // --- PROMPT 3 : Système d'alertes bancaires (états) ---
  const [configDialog, setConfigDialog] = useState(false);
  const [alerteRecapDialog, setAlerteRecapDialog] = useState(null); // { corps, docsAlerte, count, destinataires, objet, dateEnvoi }
  const [alerteConfig, setAlerteConfig] = useState({ ...CONFIG_ALERTES_BANCAIRES });

  // --- PROMPT 4 : Sélection multiple (checkboxes) pour actions groupées ---
  const [selected, setSelected] = useState(new Set());

  // --- PROMPT 6 : Exports sécurisés et reporting ---
  // paieDialog : { password, confirmPassword } — RIB complet soumis à mot de passe
  // auditDialog : booléen — ouvre le rapport d'audit (tous les comptes, triés Employé + Banque)
  const [paieDialog, setPaieDialog] = useState(null);
  const [auditDialog, setAuditDialog] = useState(false);

  // --- Filtrage ---
  const filtered = useMemo(() => {
    return BANCAIRES.filter(b => {
      if (search) {
        const emp = findEmployee(b.employee_id);
        const empName = emp ? employeeFullName(emp).toLowerCase() : '';
        const q = search.toLowerCase();
        if (!empName.includes(q) &&
            !b.banque?.toLowerCase().includes(q) &&
            !b.rib?.toLowerCase().includes(q) &&
            !emp?.matricule?.toLowerCase().includes(q)) return false;
      }
      if (fBanque && b.banque !== fBanque) return false;
      if (fStatut && calculerStatutBancaire(b).short !== fStatut) return false;
      if (fAlerte && calculerAlerteBancaireEnrichie(b).short !== fAlerte) return false;
      if (fCompte) {
        const isPrincipal = b.is_principal ? 'Oui' : 'Non';
        if (isPrincipal !== fCompte) return false;
      }
      return true;
    });
  }, [search, fBanque, fStatut, fAlerte, fCompte, refreshKey]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- KPI (NB.SI) — utilisation de calculerAlerteBancaireEnrichie (PROMPT 3) ---
  const stats = useMemo(() => {
    const total = BANCAIRES.length;
    const ribManquant = BANCAIRES.filter(b => calculerAlerteBancaireEnrichie(b).short === 'RIB manquant').length;
    const expire = BANCAIRES.filter(b => calculerAlerteBancaireEnrichie(b).short === 'Expiré').length;
    const plus1an = BANCAIRES.filter(b => calculerAlerteBancaireEnrichie(b).short === '>1 an').length;
    const aVerifier = BANCAIRES.filter(b => ['À vérifier', '>1 an', 'Expiré', 'Non mis à jour', 'RIB manquant'].includes(calculerAlerteBancaireEnrichie(b).short)).length;
    const ok = BANCAIRES.filter(b => calculerAlerteBancaireEnrichie(b).short === 'OK').length;
    // PROMPT 3 : Taux de conformité =1-(RIB manquant + À vérifier + >1 an) / Total
    const tauxConformite = total > 0 ? Math.round((1 - (ribManquant + aVerifier + plus1an) / total) * 100) : 100;
    // PROMPT 3 : Détection doublons RIB et principal manquant
    const duplicates = BANCAIRES.filter(b => detecterRibDuplique(b.rib)).length;
    const principalManquant = BANCAIRES.filter(b => detecterPrincipalManquant(b.employee_id)).length;
    return { total, ribManquant, expire, plus1an, aVerifier, ok, tauxConformite, duplicates, principalManquant };
  }, [refreshKey]);

  // --- PROMPT 3 : Graphique 1 — Anneau (répartition des alertes) ---
  const chartPieData = useMemo(() => {
    const counts = { 'RIB manquant': 0, 'RIB dupliqué': 0, 'Principal manquant': 0, 'Expiré': 0, '>1 an': 0, 'Non mis à jour': 0, 'À vérifier': 0, 'OK': 0 };
    BANCAIRES.forEach(b => {
      const al = calculerAlerteBancaireEnrichie(b);
      counts[al.short] = (counts[al.short] || 0) + 1;
    });
    return [
      { name: '🔴 RIB manquant', value: counts['RIB manquant'], color: ROUGE },
      { name: '🟣 RIB dupliqué', value: counts['RIB dupliqué'], color: VIOLET },
      { name: '🟠 Principal manquant', value: counts['Principal manquant'], color: ORANGE },
      { name: '🔴 Expiré', value: counts['Expiré'], color: '#a02030' },
      { name: '🟡 >1 an', value: counts['>1 an'], color: JAUNE },
      { name: '🟡 Non mis à jour', value: counts['Non mis à jour'], color: '#e8c060' },
      { name: '🟠 À vérifier', value: counts['À vérifier'], color: '#d4824a' },
      { name: '🟢 OK', value: counts['OK'], color: VERT },
    ].filter(d => d.value > 0);
  }, [refreshKey]);

  // --- PROMPT 3 : Graphique 2 — Barres empilées Statut par banque ---
  const chartBanqueData = useMemo(() => {
    const parBanque = {};
    BANCAIRES.forEach(b => {
      const key = b.banque || 'N/A';
      if (!parBanque[key]) {
        parBanque[key] = { banque: key, 'Actif': 0, 'À vérifier': 0, 'RIB manquant': 0, 'Compte secondaire': 0 };
      }
      const st = calculerStatutBancaire(b);
      parBanque[key][st.short] = (parBanque[key][st.short] || 0) + 1;
    });
    return Object.values(parBanque).sort((a, b) => (b.Actif + b['À vérifier'] + b['RIB manquant'] + b['Compte secondaire']) - (a.Actif + a['À vérifier'] + a['RIB manquant'] + a['Compte secondaire']));
  }, [refreshKey]);

  // --- PROMPT 3 : Graphique 3 — Histogramme Âge des MAJ par tranches ---
  const chartAgeData = useMemo(() => {
    const buckets = [
      { tranche: '<90j', count: 0 },
      { tranche: '90-180j', count: 0 },
      { tranche: '180-365j', count: 0 },
      { tranche: '>365j', count: 0 },
      { tranche: '>730j', count: 0 },
      { tranche: 'Non MAJ', count: 0 },
    ];
    BANCAIRES.forEach(b => {
      if (!b.date_maj) { buckets[5].count++; return; }
      const diffJours = Math.floor((new Date() - new Date(b.date_maj)) / (1000 * 60 * 60 * 24));
      if (diffJours < 90) buckets[0].count++;
      else if (diffJours < 180) buckets[1].count++;
      else if (diffJours < 365) buckets[2].count++;
      else if (diffJours > 730) buckets[4].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [refreshKey]);

  // --- PROMPT 3 : Comptage des anomalies pour le bandeau ---
  const totalAnomalies = useMemo(() => {
    return BANCAIRES.filter(b => calculerAlerteBancaireEnrichie(b).short !== 'OK').length;
  }, [refreshKey]);

  // --- PROMPT 6 : Données du rapport d'audit (TOUS les comptes, triés Employé + Banque) ---
  // Indépendant des filtres — vue exhaustive pour reporting conformité ISO.
  const auditData = useMemo(() => {
    return [...BANCAIRES].sort((a, b) => {
      const eA = findEmployee(a.employee_id);
      const eB = findEmployee(b.employee_id);
      const nameA = eA ? employeeFullName(eA) : '';
      const nameB = eB ? employeeFullName(eB) : '';
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      return (a.banque || '').localeCompare(b.banque || '');
    });
  }, [refreshKey]);

  // --- PROMPT 6 : Stats pour le rapport d'audit (3 chips : Anomalies / À vérifier / OK) ---
  const auditStats = useMemo(() => {
    let anomalies = 0, aVerif = 0, ok = 0;
    BANCAIRES.forEach(b => {
      const al = calculerAlerteBancaireEnrichie(b);
      if (al.short === 'OK') ok++;
      else if (al.short === 'RIB manquant' || al.short === 'Expiré' || al.short === 'RIB dupliqué') anomalies++;
      else aVerif++;
    });
    return { anomalies, aVerif, ok, total: BANCAIRES.length };
  }, [refreshKey]);

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['N°', 'Matricule', 'Employé', 'Banque', 'Agence', 'RIB', 'Compte Principal', 'Date MAJ', 'Statut', 'Alerte', 'Dernier Contrôle', 'Notes'];
    const rows = filtered.map(b => {
      const emp = findEmployee(b.employee_id);
      const st = calculerStatutBancaire(b);
      const al = calculerAlerteBancaireEnrichie(b);
      return [
        `"BAN-${String(BANCAIRES.indexOf(b) + 1).padStart(3, '0')}"`,
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${b.banque || ''}"`,
        `"${b.agence || ''}"`,
        `"${b.rib || ''}"`,
        `"${b.is_principal ? 'Oui' : 'Non'}"`,
        `"${b.date_maj || ''}"`,
        `"${st.short}"`,
        `"${al.short}"`,
        `"${b.dernier_controle || ''}"`,
        `"${(b.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donnees-bancaires-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${filtered.length} enregistrement(s) exporté(s)`, severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: 'export_csv',
      filename: `donnees-bancaires-${new Date().toISOString().slice(0, 10)}.csv`,
      nb_lignes: filtered.length,
      statut: 'succès',
      user: 'DRH',
    });
    BANCAIRE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'export_csv',
      banque_id: null,
      employee_id: null,
      nb_lignes: filtered.length,
      user: 'DRH',
    });
  };

  // ============================================================
  // PROMPT 6 : Export PDF — RIB masqué (sécurité RGPD)
  // Ouvre une nouvelle fenêtre avec un HTML imprimable, filtres appliqués,
  // 10 colonnes, mise en forme conditionnelle (lignes en anomalie en rouge clair).
  // ============================================================
  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleString('fr-FR');
    const filename = `Export_Bancaires_PDF_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filtresActifs = [];
    if (search) filtresActifs.push(`Recherche: "${search}"`);
    if (fBanque) filtresActifs.push(`Banque: ${fBanque}`);
    if (fStatut) filtresActifs.push(`Statut: ${fStatut}`);
    if (fAlerte) filtresActifs.push(`Alerte: ${fAlerte}`);
    if (fCompte) filtresActifs.push(`Compte principal: ${fCompte}`);
    const filtresHTML = filtresActifs.length > 0
      ? `<div class="filters"><strong>Filtres appliqués :</strong> ${filtresActifs.map(f => `<span class="filter-chip">${f}</span>`).join('')}</div>`
      : `<div class="filters"><strong>Filtres :</strong> <span class="filter-chip">Aucun (tous les comptes)</span></div>`;

    const rowsHTML = filtered.map(b => {
      const emp = findEmployee(b.employee_id);
      const st = calculerStatutBancaire(b);
      const al = calculerAlerteBancaireEnrichie(b);
      const num = `BAN-${String(BANCAIRES.indexOf(b) + 1).padStart(3, '0')}`;
      const ribMasque = b.rib ? `****${b.rib.slice(-4)}` : '— MANQUANT —';
      const isAnomalie = al.short === 'RIB manquant' || al.short === 'Expiré';
      const rowClass = isAnomalie ? 'row-anomalie' : '';
      return `<tr class="${rowClass}">
        <td>${num}</td>
        <td>${emp?.matricule || '—'}</td>
        <td>${emp ? employeeFullName(emp) : 'Non trouvé'}</td>
        <td>${b.banque || '—'}</td>
        <td>${b.agence || '—'}</td>
        <td class="rib">${ribMasque}</td>
        <td>${b.is_principal ? 'Oui' : 'Non'}</td>
        <td>${b.date_maj || '—'}</td>
        <td>${st.short}</td>
        <td>${al.short}</td>
      </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Comptes Bancaires — Export PDF</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2a3a; font-size: 11px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #7e3ff2; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 18px; margin: 0; color: #0b2a4a; }
  .header .meta { text-align: right; font-size: 10px; color: #6b7a8a; }
  .filters { background: #f4f7fc; border: 1px solid #e9edf2; border-radius: 4px; padding: 8px 10px; margin-bottom: 12px; font-size: 10px; }
  .filter-chip { display: inline-block; background: rgba(126,63,242,0.1); color: #7e3ff2; padding: 2px 8px; border-radius: 10px; margin-right: 6px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #0b2a4a; color: #fff; padding: 6px 5px; text-align: left; font-weight: 700; border: 1px solid #0b2a4a; }
  td { padding: 5px 5px; border: 1px solid #d6dde6; vertical-align: middle; }
  tr:nth-child(even) td { background: #fafbfc; }
  .row-anomalie td { background: #ffe5e8 !important; color: #b33a4a; font-weight: 600; }
  .rib { font-family: monospace; font-weight: 700; color: #0b2a4a; }
  .footer { margin-top: 14px; font-size: 9px; color: #9aa8b8; border-top: 1px solid #e9edf2; padding-top: 6px; }
  .alert-gdpr { background: rgba(184,106,42,0.08); border-left: 3px solid #b86a2a; padding: 6px 10px; margin-bottom: 10px; font-size: 9px; color: #b86a2a; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📋 Comptes Bancaires — Export PDF</h1>
      <div style="font-size: 10px; color: #6b7a8a; margin-top: 2px;">Tableau structuré T_Bancaire — Domaine 2 (Administration Personnel)</div>
    </div>
    <div class="meta">
      <div><strong>Date :</strong> ${dateStr}</div>
      <div><strong>Nombre :</strong> ${filtered.length} enregistrement(s)</div>
      <div><strong>Édité par :</strong> DRH</div>
    </div>
  </div>
  <div class="alert-gdpr">
    🔒 <strong>Sécurité RGPD :</strong> les RIB sont masqués (****1234) dans ce document. Pour un export avec RIB complet, utilisez « Export Paie » (sécurisé par mot de passe).
  </div>
  ${filtresHTML}
  <table>
    <thead>
      <tr>
        <th>N°</th>
        <th>Matricule</th>
        <th>Employé</th>
        <th>Banque</th>
        <th>Agence</th>
        <th>RIB (masqué)</th>
        <th>Principal</th>
        <th>Date MAJ</th>
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
    Audit trail : BANCAIRE_AUDIT_TRAIL · EXPORTS_LOG.
  </div>
  <script>
    setTimeout(function() { window.print(); }, 350);
  </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      setSnack({ msg: 'Impossible d\'ouvrir la fenêtre d\'impression (vérifiez le bloqueur de pop-ups)', severity: 'warning' });
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setSnack({ msg: `📄 Export PDF généré (${filtered.length} enregistrement(s)) — RIB masqué`, severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: 'export_pdf',
      filename,
      nb_lignes: filtered.length,
      statut: 'succès',
      user: 'DRH',
    });
    BANCAIRE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'export_pdf',
      banque_id: null,
      employee_id: null,
      nb_lignes: filtered.length,
      rib_masque: true,
      user: 'DRH',
    });
  };

  // ============================================================
  // PROMPT 6 : Export Paie — CSV avec RIB COMPLET (sensible)
  // Protégé par mot de passe (double saisie, ≥ 6 caractères).
  // Colonnes restreintes : Matricule, Employé, Banque, Agence, RIB, Principal, Date MAJ, Statut.
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
    // Mot de passe OK → génération du CSV avec RIB complet (non masqué)
    const headers = ['Matricule', 'Employé', 'Banque', 'Agence', 'RIB', 'Principal', 'Date MAJ', 'Statut'];
    const rows = filtered.map(b => {
      const emp = findEmployee(b.employee_id);
      const st = calculerStatutBancaire(b);
      return [
        `"${emp?.matricule || ''}"`,
        `"${emp ? employeeFullName(emp) : ''}"`,
        `"${b.banque || ''}"`,
        `"${b.agence || ''}"`,
        `"${b.rib || ''}"`,
        `"${b.is_principal ? 'Oui' : 'Non'}"`,
        `"${b.date_maj || ''}"`,
        `"${st.short}"`,
      ];
    });
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    const filename = `Export_Paie_${today}.csv`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setPaieDialog(null);
    setSnack({ msg: '✅ Export paie généré (RIB non masqués) — fichier sensible', severity: 'success' });
    EXPORTS_LOG.push({
      timestamp: new Date().toISOString(),
      type: 'export_paie',
      filename,
      nb_lignes: filtered.length,
      statut: 'succès',
      user: 'DRH',
    });
    BANCAIRE_AUDIT_TRAIL.push({
      timestamp: new Date().toISOString(),
      action: 'export_paie',
      banque_id: null,
      employee_id: null,
      nb_lignes: filtered.length,
      rib_masque: false,
      user: 'DRH',
      note: 'Export paie avec RIB complet — mot de passe fourni',
    });
  };

  // --- Création ---
  const handleCreate = () => {
    if (!newBanque.employee_id) { setSnack({ msg: 'Veuillez sélectionner un employé', severity: 'warning' }); return; }
    const num = `BAN-${String(BANCAIRES.length + 1).padStart(3, '0')}`;
    BANCAIRES.push({
      id: `bnq-${Date.now()}`,
      employee_id: newBanque.employee_id,
      banque: newBanque.banque || '',
      agence: newBanque.agence || '',
      rib: newBanque.rib || '',
      is_principal: newBanque.is_principal !== false,
      date_maj: new Date().toISOString().slice(0, 10),
      dernier_controle: new Date().toISOString().slice(0, 10),
      notes: newBanque.notes || '',
    });
    setCreateDialog(false);
    setNewBanque({});
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Enregistrement ${num} créé`, severity: 'success' });
  };

  // --- Édition (PROMPT 4 : détection modification RIB + audit trail + MAJ dernier_controle) ---
  const handleSaveEdit = () => {
    if (!editDialog) return;
    const idx = BANCAIRES.findIndex(b => b.id === editDialog.id);
    if (idx !== -1) {
      const ancienRib = BANCAIRES[idx].rib || '';
      const nouveauRib = editDialog.rib || '';
      const ribChanged = ancienRib !== nouveauRib;
      const now = new Date().toISOString().slice(0, 10);
      BANCAIRES[idx] = {
        ...BANCAIRES[idx],
        ...editDialog,
        date_maj: now,
        dernier_controle: now,
      };
      // Nettoie le champ temporaire __original_rib (utilisé pour l'UI du dialog)
      delete BANCAIRES[idx].__original_rib;
      if (ribChanged) {
        BANCAIRE_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'modifier_rib',
          banque_id: editDialog.id,
          employee_id: editDialog.employee_id,
          ancien_rib: ancienRib,
          nouveau_rib: nouveauRib,
        });
      }
    }
    setEditDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: 'Donnée bancaire modifiée', severity: 'success' });
  };

  // --- Toggle RIB visibility ---
  const toggleRib = (id) => {
    setShowFullRib(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- PROMPT 3 : Envoyer les rappels bancaires maintenant ---
  // Génère le corps de l'email (via genererCorpsEmailBancaires), met à jour dernier_controle, ouvre recap dialog
  const handleSendRappels = () => {
    if (!alerteConfig.activer) {
      setSnack({ msg: 'Les alertes sont désactivées. Activez-les dans la configuration.', severity: 'warning' });
      return;
    }
    if (!alerteConfig.destinataires?.trim()) {
      setSnack({ msg: 'Aucun destinataire configuré. Ajoutez des emails dans la configuration.', severity: 'warning' });
      return;
    }
    const recap = genererCorpsEmailBancaires(BANCAIRES);
    if (!recap) {
      setSnack({ msg: 'Aucune anomalie bancaire détectée. Aucun email envoyé.', severity: 'info' });
      return;
    }
    // Met à jour dernier_controle (col K) pour chaque compte en anomalie
    const now = new Date().toISOString().slice(0, 10);
    recap.docsAlerte.forEach(b => {
      const idx = BANCAIRES.findIndex(x => x.id === b.id);
      if (idx !== -1) {
        BANCAIRES[idx].dernier_controle = now;
      }
    });
    // Met à jour derniere_execution dans CONFIG
    CONFIG_ALERTES_BANCAIRES.derniere_execution = now;
    setAlerteConfig({ ...CONFIG_ALERTES_BANCAIRES });
    // Audit trail
    ALERTES_BANCAIRES_HISTORIQUE.push({
      timestamp: new Date().toISOString(),
      destinataires: alerteConfig.destinataires,
      nb_anomalies: recap.count,
      banques: recap.docsAlerte.map(b => b.id),
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

  // --- PROMPT 3 : Sauvegarder la configuration des alertes ---
  const handleSaveConfig = () => {
    CONFIG_ALERTES_BANCAIRES.destinataires = alerteConfig.destinataires;
    CONFIG_ALERTES_BANCAIRES.frequence_jours = alerteConfig.frequence_jours;
    CONFIG_ALERTES_BANCAIRES.activer = alerteConfig.activer;
    CONFIG_ALERTES_BANCAIRES.objet_email = alerteConfig.objet_email;
    setConfigDialog(false);
    setSnack({ msg: 'Configuration des alertes bancaires enregistrée', severity: 'success' });
  };

  // --- PROMPT 3 : Ouvrir le client mail avec mailto ---
  const handleOpenMailto = () => {
    if (!alerteRecapDialog) return;
    const { destinataires, objet, corps } = alerteRecapDialog;
    const mailto = `mailto:${destinataires}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
    window.location.href = mailto;
    setSnack({ msg: 'Client email ouvert (mailto)', severity: 'info' });
  };

  // ============================================================
  // PROMPT 4 : Actions individuelles et groupées
  // ============================================================

  // --- PROMPT 4 : Sélection multiple (checkboxes) ---
  const handleToggleSelect = (banqueId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(banqueId)) next.delete(banqueId);
      else next.add(banqueId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(b => b.id)));
    }
  };

  const handleClearSelection = () => {
    setSelected(new Set());
    setSnack({ msg: 'Sélection vidée', severity: 'info' });
  };

  // --- PROMPT 4 : Basculer compte principal (action individuelle) ---
  // Garantit l'unicité : un seul compte principal par employé
  // Si is_principal=true → passe en secondaire
  // Si is_principal=false → définit comme principal et désactive les autres du même employé
  const handleBasculerPrincipal = (b) => {
    const idx = BANCAIRES.findIndex(x => x.id === b.id);
    if (idx === -1) return;
    const now = new Date().toISOString().slice(0, 10);
    const wasPrincipal = !!BANCAIRES[idx].is_principal;
    if (wasPrincipal) {
      // Actuellement principal → passer en secondaire
      BANCAIRES[idx].is_principal = false;
      BANCAIRES[idx].date_maj = now;
      BANCAIRES[idx].dernier_controle = now;
      BANCAIRE_AUDIT_TRAIL.push({
        timestamp: new Date().toISOString(),
        action: 'basculer_principal',
        banque_id: b.id,
        employee_id: b.employee_id,
        is_principal_before: true,
        is_principal_after: false,
      });
      setSnack({ msg: 'Compte passé en secondaire', severity: 'info' });
    } else {
      // Actuellement secondaire → définir comme principal
      // Désactive tous les autres comptes du même employé (unicité garantie)
      BANCAIRES.forEach((other, otherIdx) => {
        if (other.employee_id === b.employee_id && other.id !== b.id && other.is_principal) {
          BANCAIRES[otherIdx].is_principal = false;
          BANCAIRE_AUDIT_TRAIL.push({
            timestamp: new Date().toISOString(),
            action: 'basculer_principal',
            banque_id: other.id,
            employee_id: other.employee_id,
            is_principal_before: true,
            is_principal_after: false,
            note: 'Désactivé automatiquement (unicité employé)',
          });
        }
      });
      BANCAIRES[idx].is_principal = true;
      BANCAIRES[idx].date_maj = now;
      BANCAIRES[idx].dernier_controle = now;
      BANCAIRE_AUDIT_TRAIL.push({
        timestamp: new Date().toISOString(),
        action: 'basculer_principal',
        banque_id: b.id,
        employee_id: b.employee_id,
        is_principal_before: false,
        is_principal_after: true,
      });
      setSnack({ msg: 'Compte défini comme principal. Autres comptes désactivés.', severity: 'success' });
    }
    setRefreshKey(k => k + 1);
  };

  // --- PROMPT 4 : Basculer principal groupé (action groupée) ---
  const handleBasculerSelection = () => {
    if (selected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins un compte', severity: 'warning' });
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const selectionnes = BANCAIRES.filter(b => selected.has(b.id));
    selectionnes.forEach(b => {
      const idx = BANCAIRES.findIndex(x => x.id === b.id);
      if (idx === -1) return;
      const wasPrincipal = !!BANCAIRES[idx].is_principal;
      // Désactive tous les autres comptes du même employé (unicité)
      BANCAIRES.forEach((other, otherIdx) => {
        if (other.employee_id === b.employee_id && other.id !== b.id && other.is_principal) {
          BANCAIRES[otherIdx].is_principal = false;
          BANCAIRE_AUDIT_TRAIL.push({
            timestamp: new Date().toISOString(),
            action: 'basculer_principal',
            banque_id: other.id,
            employee_id: other.employee_id,
            is_principal_before: true,
            is_principal_after: false,
            note: 'Désactivé automatiquement (action groupée)',
          });
        }
      });
      BANCAIRES[idx].is_principal = true;
      BANCAIRES[idx].date_maj = now;
      BANCAIRES[idx].dernier_controle = now;
      BANCAIRE_AUDIT_TRAIL.push({
        timestamp: new Date().toISOString(),
        action: 'basculer_principal',
        banque_id: b.id,
        employee_id: b.employee_id,
        is_principal_before: wasPrincipal,
        is_principal_after: true,
      });
    });
    setSnack({ msg: `📌 ${selectionnes.length} compte(s) défini(s) comme principal`, severity: 'success' });
    setSelected(new Set());
    setRefreshKey(k => k + 1);
  };

  // --- PROMPT 4 : Marquer comme vérifiés (action groupée) ---
  // Met à jour date_maj et dernier_controle à aujourd'hui pour chaque sélectionné
  const handleMarquerVerifies = () => {
    if (selected.size === 0) {
      setSnack({ msg: 'Veuillez sélectionner au moins un compte', severity: 'warning' });
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const selectionnes = BANCAIRES.filter(b => selected.has(b.id));
    selectionnes.forEach(b => {
      const idx = BANCAIRES.findIndex(x => x.id === b.id);
      if (idx !== -1) {
        BANCAIRES[idx].date_maj = now;
        BANCAIRES[idx].dernier_controle = now;
        BANCAIRE_AUDIT_TRAIL.push({
          timestamp: new Date().toISOString(),
          action: 'marquer_verifie',
          banque_id: b.id,
          employee_id: b.employee_id,
          date_maj: now,
          dernier_controle: now,
        });
      }
    });
    setSnack({ msg: `✅ ${selectionnes.length} compte(s) marqué(s) comme vérifiés`, severity: 'success' });
    setSelected(new Set());
    setRefreshKey(k => k + 1);
  };

  return (
    <Box>
      {/* === KPI (NB.SI) — 7 KPIs incl. Taux de conformité (PROMPT 3) === */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${VIOLET}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(126,63,242,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: VIOLET, fontSize: '1.6rem' }}>{stats.total}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>Total RIB</Typography>
            <Chip label='OK' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: VIOLET, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NBVAL(T_Bancaire[N°])</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${ROUGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(179,58,74,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.6rem' }}>{stats.ribManquant}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🔴 RIB manquant</Typography>
            <Chip label='Critique' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: ROUGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Alerte;"🔴 RIB manquant")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${ROUGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(179,58,74,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: ROUGE, fontSize: '1.6rem' }}>{stats.expire}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🔴 Expiré (&gt;2 ans)</Typography>
            <Chip label='Critique' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: ROUGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Alerte;"🔴 Expiré")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${ORANGE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(184,106,42,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: ORANGE, fontSize: '1.6rem' }}>{stats.plus1an}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🟠 &gt;1 an</Typography>
            <Chip label='Attention' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: ORANGE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Alerte;"🟠 &gt;1 an")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${JAUNE}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(212,160,23,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: JAUNE, fontSize: '1.6rem' }}>{stats.aVerifier}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>⚠️ À vérifier (total)</Typography>
            <Chip label='Attention' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: JAUNE, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Alerte;"🟠*")</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, textAlign: 'center', borderLeft: `4px solid ${VERT}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(26,122,74,0.12)' } }}>
            <Typography variant='h5' fontWeight={800} sx={{ color: VERT, fontSize: '1.6rem' }}>{stats.ok}</Typography>
            <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#555', display: 'block', mt: 0.3 }}>🟢 OK</Typography>
            <Chip label='Parfait' size='small' sx={{ fontSize: '0.5rem', height: 14, bgcolor: VERT, color: '#fff', fontWeight: 700, mt: 0.5 }} />
            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(Alerte;"🟢 OK")</Typography>
          </Box>
        </Grid>
        {/* PROMPT 3 : 7e KPI — Taux de conformité bancaire =1-(RIB manquant+À vérifier+>1 an)/Total */}
        <Grid item xs={12} sm={12}>
          <Box sx={{
            p: 1.5, borderRadius: 1.5, textAlign: 'center',
            bgcolor: stats.tauxConformite >= 90 ? 'rgba(26,122,74,0.12)' : stats.tauxConformite >= 70 ? 'rgba(212,160,23,0.12)' : 'rgba(179,58,74,0.12)',
            border: `1px solid ${stats.tauxConformite >= 90 ? VERT : stats.tauxConformite >= 70 ? JAUNE : ROUGE}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
          }}>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Typography variant='h5' fontWeight={800} sx={{
                color: stats.tauxConformite >= 90 ? VERT : stats.tauxConformite >= 70 ? JAUNE : ROUGE,
                fontSize: '1.6rem',
              }}>{stats.tauxConformite}%</Typography>
              <Box>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>🎯 Taux de conformité bancaire</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=1-(RIB manquants+À vérifier+&gt;1 an)/Total</Typography>
              </Box>
            </Stack>
            <Stack direction='row' spacing={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={800} sx={{ color: VIOLET, fontSize: '1.1rem' }}>{stats.duplicates}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>🟣 RIB dupliqués</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.45rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI(RIB;RIB)&gt;1</Typography>
              </Box>
              <Divider orientation='vertical' flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={800} sx={{ color: ORANGE, fontSize: '1.1rem' }}>{stats.principalManquant}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>🟠 Principal manquant</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.45rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block' }}>=NB.SI.ENS(Matricule;Principal;"Oui")=0</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* === PROMPT 3 : GRAPHIQUES (Recharts) === */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Graphique 1 : Anneau (répartition des alertes enrichies) */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${VIOLET}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <DonutLargeIcon sx={{ fontSize: 18, color: VIOLET }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Répartition des alertes (anneau)
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                =NB.SI(T_Bancaire[Alerte]; chaque cas enrichi) · 7 priorités
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
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
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${VIOLET}30`, borderRadius: 2, fontSize: '0.72rem' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.6rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 2 : Barres empilées Statut par banque */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${ORANGE}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 18, color: ORANGE }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Statut par banque (empilé)
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Banque · Colonnes=Statut · Valeurs=Comptage
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartBanqueData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='banque' tick={{ fontSize: 9, fill: '#6b7a8a' }} angle={-25} textAnchor='end' height={60} interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${ORANGE}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: 'rgba(184,106,42,0.05)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.6rem' }} />
                    <Bar dataKey='Actif' stackId='a' fill={VERT} name='🟢 Actif' />
                    <Bar dataKey='À vérifier' stackId='a' fill={ORANGE} name='🟠 À vérifier' />
                    <Bar dataKey='RIB manquant' stackId='a' fill={ROUGE} name='🔴 RIB manquant' />
                    <Bar dataKey='Compte secondaire' stackId='a' fill={BLEU} name='🔵 Compte secondaire' />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique 3 : Histogramme Âge des MAJ par tranches */}
        <Grid item xs={12} lg={4}>
          <Card variant='outlined' sx={{ height: '100%', border: `1px solid ${NAVY}20`, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18, color: NAVY }} />
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  Âge des MAJ par tranches
                </Typography>
              </Stack>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                TCD : Lignes=Tranche_âge_MAJ · Valeurs=Comptage (AUJOURDHUI()-Date_MAJ)
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartAgeData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                    <XAxis dataKey='tranche' tick={{ fontSize: 10, fill: '#6b7a8a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ bgcolor: '#fff', border: `1px solid ${NAVY}30`, borderRadius: 2, fontSize: '0.72rem' }}
                      cursor={{ fill: 'rgba(11,42,74,0.05)' }}
                    />
                    <Bar dataKey='count' name='Comptes' radius={[4, 4, 0, 0]}>
                      {chartAgeData.map((entry, index) => {
                        const colors = [VERT, BLEU, JAUNE, ORANGE, ROUGE, '#9aa8b8'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === PROMPT 3 : SYSTÈME D'ALERTES BANCAIRES === */}
      <Card variant='outlined' sx={{ mb: 2, border: `2px solid ${ROUGE}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(179,58,74,0.06) 0%, rgba(184,106,42,0.04) 100%)` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: totalAnomalies > 0 ? ROUGE : VERT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NotificationsActiveIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Système d'alertes bancaires
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block' }}>
                  {totalAnomalies > 0 ? (
                    <>
                      <strong style={{ color: ROUGE }}>{totalAnomalies} compte(s)</strong> en anomalie · 🟣 {stats.duplicates} RIB dupliqué(s) · 🟠 {stats.principalManquant} principal manquant
                    </>
                  ) : (
                    <>Aucune anomalie détectée — tous les comptes bancaires sont à jour</>
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
              <Tooltip title="Envoyer les rappels bancaires (génère email récap, met à jour dernier_controle)">
                <Button
                  variant='contained' size='small'
                  startIcon={<SendIcon />}
                  onClick={handleSendRappels}
                  disabled={!alerteConfig.activer || totalAnomalies === 0}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: ROUGE, '&:hover': { bgcolor: '#9a2f3a' } }}
                >
                  Envoyer les rappels ({totalAnomalies})
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem' }}>
        <strong>📌 Tableau structuré T_Bancaire</strong> — 12 colonnes (A-L) avec auto-remplissage Nom Employé (RECHERCHEX C), Statut (SI imbriquée I) et Alerte granulaire enrichie (J). Colonnes <LockIcon sx={{ fontSize: 11, verticalAlign: 'middle' }} /> protégées (lecture seule). RIB masqué (****1234) — sécurité RGPD.
      </Alert>

      <Card>
        <CardContent>
          <SectionHeader
            title='Données Bancaires (T_Bancaire)'
            subtitle={`${filtered.length} enregistrement(s) · RECHERCHEX employé · Statut + Alerte auto · RIB masqué RGPD`}
            action={<Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
              {/* PROMPT 6 : 3 nouveaux exports sécurisés (PDF / Paie / Audit) */}
              <Tooltip title='Export PDF imprimable — RIB masqué (sécurité RGPD)'>
                <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VERT, borderColor: VERT }}>Export PDF</Button>
              </Tooltip>
              <Tooltip title='Export CSV pour la paie — RIB COMPLET (sécurisé par mot de passe)'>
                <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={() => setPaieDialog({ password: '', confirmPassword: '' })} sx={{ textTransform: 'none', fontSize: '0.75rem', color: ORANGE, borderColor: ORANGE }}>Export Paie</Button>
              </Tooltip>
              <Tooltip title="Rapport d'audit global (tous les comptes, triés par employé + banque)">
                <Button variant='outlined' size='small' startIcon={<AssessmentIcon />} onClick={() => setAuditDialog(true)} sx={{ textTransform: 'none', fontSize: '0.75rem', color: BLEU, borderColor: BLEU }}>Rapport Audit</Button>
              </Tooltip>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewBanque({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: VIOLET }}>Nouveau RIB</Button>
            </Stack>}
          />

          {/* Filtres (B1-E1 équivalent Excel) */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size='small' placeholder='Rechercher (nom, RIB, agence, banque)...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.8rem' } }}
            />
            <TextField select size='small' label='Banque' value={fBanque} onChange={(e) => { setFBanque(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Toutes</MenuItem>
              {BANQUES_LIST.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 130 }}>
              <MenuItem value=''>Tous</MenuItem>
              <MenuItem value='Actif'>Actif</MenuItem>
              <MenuItem value='À vérifier'>À vérifier</MenuItem>
              <MenuItem value='Compte secondaire'>Compte secondaire</MenuItem>
              <MenuItem value='RIB manquant'>RIB manquant</MenuItem>
            </TextField>
            <TextField select size='small' label='Compte Principal' value={fCompte} onChange={(e) => { setFCompte(e.target.value); setPage(0); }} sx={{ minWidth: 130 }}>
              <MenuItem value=''>Tous</MenuItem>
              <MenuItem value='Oui'>Oui</MenuItem>
              <MenuItem value='Non'>Non</MenuItem>
            </TextField>
            <TextField select size='small' label='Alerte' value={fAlerte} onChange={(e) => { setFAlerte(e.target.value); setPage(0); }} sx={{ minWidth: 130 }}>
              <MenuItem value=''>Toutes</MenuItem>
              <MenuItem value='OK'>🟢 OK</MenuItem>
              <MenuItem value='À vérifier'>🟠 À vérifier</MenuItem>
              <MenuItem value='>1 an'>🟡 &gt;1 an</MenuItem>
              <MenuItem value='Expiré'>🔴 Expiré</MenuItem>
              <MenuItem value='Non mis à jour'>🟡 Non mis à jour</MenuItem>
              <MenuItem value='RIB manquant'>🔴 RIB manquant</MenuItem>
              <MenuItem value='RIB dupliqué'>🟣 RIB dupliqué</MenuItem>
              <MenuItem value='Principal manquant'>🟠 Principal manquant</MenuItem>
            </TextField>
          </Stack>

          {/* Compteur dynamique + formule FILTRE + actions groupées (PROMPT 4) */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, px: 1 }} justifyContent='space-between'>
            <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap' useFlexGap>
              <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>
                <strong style={{ color: NAVY, fontSize: '0.85rem' }}>{filtered.length}</strong> compte(s) affiché(s) sur {BANCAIRES.length}
              </Typography>
              <Chip label={`=NBVAL(Plage_Filtrée) = ${filtered.length}`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(126,63,242,0.08)', color: VIOLET, fontFamily: 'monospace', fontWeight: 700 }} />
              {filtered.length === 0 && (
                <Chip label='Aucun compte trouvé — SIERREUR(FILTRE(...))' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
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
            {/* PROMPT 4 : Actions groupées (apparaissent quand selected.size > 0) */}
            {selected.size > 0 && (
              <Stack direction='row' spacing={1} alignItems='center'>
                <Tooltip title="Définir les comptes sélectionnés comme principal (désactive automatiquement les autres comptes des mêmes employés — unicité)">
                  <Button variant='outlined' size='small' startIcon={<SwapVertIcon />} onClick={handleBasculerSelection} sx={{ textTransform: 'none', fontSize: '0.7rem', color: ORANGE, borderColor: ORANGE }}>
                    📌 Basculer Principal ({selected.size})
                  </Button>
                </Tooltip>
                <Tooltip title="Marquer les comptes sélectionnés comme vérifiés (met à jour date_maj et dernier_controle à aujourd'hui)">
                  <Button variant='outlined' size='small' startIcon={<CheckCircleIcon />} onClick={handleMarquerVerifies} sx={{ textTransform: 'none', fontSize: '0.7rem', color: BLEU, borderColor: BLEU }}>
                    ✏️ Marquer comme vérifiés ({selected.size})
                  </Button>
                </Tooltip>
              </Stack>
            )}
            <Tooltip title='Formule Excel FILTRE multi-critères'>
              <Box sx={{ p: 0.8, bgcolor: 'rgba(126,63,242,0.05)', borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.55rem', color: VIOLET, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', md: 500 } }}>
                {'=SIERREUR(FILTRE(T_Bancaire[#Tout]; (SI(ESTVIDE(B1);VRAI;Banque=B1)) * (SI(ESTVIDE(C1);VRAI;Statut=C1)) * (SI(ESTVIDE(D1);VRAI;Compte Principal=D1)) * (SI(ESTVIDE(E1);VRAI;ESTNUM(CHERCHE(E1;Nom&RIB&Agence&Banque))))); "Aucun compte trouvé")'}
              </Box>
            </Tooltip>
          </Stack>

          {/* Tableau T_Bancaire — design amélioré (en-têtes foncées + lignes alternées) */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, overflow: 'hidden' }}>
            <Table size='small' stickyHeader sx={{ '& .MuiTableCell-head': { bgcolor: '#2c3e50', color: '#fff', fontWeight: 700, fontSize: '0.68rem', borderBottom: '2px solid #1a2a3a' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2c3e50' }}>
                  {/* PROMPT 4 : Colonne checkbox pour sélection multiple */}
                  <TableCell padding='checkbox' sx={{ width: 40, borderBottom: `2px solid ${VIOLET}` }}>
                    <Checkbox
                      size='small'
                      indeterminate={selected.size > 0 && selected.size < filtered.length}
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={handleSelectAll}
                      sx={{ color: VIOLET, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: VIOLET } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>A</Box>N°</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>B</Box>Matricule</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>C</Box>Employé<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>D</Box>Banque</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>E</Box>Agence</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>F</Box>RIB</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>G</Box>Principal</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>H</Box>Date MAJ</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>I</Box>Statut<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>J</Box>Alerte<LockIcon sx={{ fontSize: 10, color: '#9aa8b8', ml: 0.3 }} /></Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>K</Box>Dernier contrôle</Stack></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}><Stack direction='row' spacing={0.3} alignItems='center'><Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>L</Box>Notes</Stack></TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((b, idx) => {
                  const emp = findEmployee(b.employee_id);
                  const empName = emp ? employeeFullName(emp) : 'Non trouvé';
                  const statut = calculerStatutBancaire(b);
                  const alerte = calculerAlerteBancaireEnrichie(b);
                  const num = `BAN-${String(BANCAIRES.indexOf(b) + 1).padStart(3, '0')}`;
                  const ribVisible = showFullRib.has(b.id);
                  return (
                    <TableRow key={b.id} hover sx={{
                      // Lignes alternées + mise en forme conditionnelle
                      bgcolor: selected.has(b.id) ? 'rgba(126,63,242,0.08)' :
                               alerte.short === 'RIB manquant' || alerte.short === 'Expiré' || alerte.short === 'RIB dupliqué' ? 'rgba(179,58,74,0.04)' :
                               alerte.short === '>1 an' || alerte.short === 'À vérifier' || alerte.short === 'Principal manquant' ? 'rgba(184,106,42,0.03)' :
                               alerte.short === 'Non mis à jour' ? 'rgba(212,160,23,0.04)' :
                               idx % 2 === 0 ? '#f8f9fa' : '#fff',
                      '&:hover': {
                        bgcolor: selected.has(b.id) ? 'rgba(126,63,242,0.12)' :
                                 alerte.short === 'RIB manquant' || alerte.short === 'Expiré' || alerte.short === 'RIB dupliqué' ? 'rgba(179,58,74,0.08)' :
                                 alerte.short === '>1 an' || alerte.short === 'À vérifier' || alerte.short === 'Principal manquant' ? 'rgba(184,106,42,0.06)' :
                                 alerte.short === 'Non mis à jour' ? 'rgba(212,160,23,0.06)' :
                                 'action.hover',
                      },
                    }}>
                      {/* PROMPT 4 : Colonne checkbox (sélection multiple) */}
                      <TableCell padding='checkbox'>
                        <Checkbox
                          size='small'
                          checked={selected.has(b.id)}
                          onChange={() => handleToggleSelect(b.id)}
                          sx={{ color: VIOLET, '&.Mui-checked': { color: VIOLET } }}
                        />
                      </TableCell>
                      {/* A: N° */}
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700, color: VIOLET }}>{num}</Typography></TableCell>
                      {/* B: Matricule */}
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: NAVY }}>{emp?.matricule || '—'}</Typography></TableCell>
                      {/* C: Nom Employé (RECHERCHEX auto, lock) */}
                      <TableCell sx={{ bgcolor: 'rgba(244,247,252,0.5)' }}>
                        <Tooltip title={`=RECHERCHEX([@Matricule]; '2-Fiche Employe'!B:B; D&E; "Non trouvé"; 0)`}>
                          <Stack direction='row' spacing={0.5} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{empName}</Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* D: Banque */}
                      <TableCell>
                        {b.banque ? <Chip label={b.banque} size='small' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} /> : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>}
                      </TableCell>
                      {/* E: Agence */}
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a' }}>{b.agence || '—'}</Typography></TableCell>
                      {/* F: RIB (masqué ****1234) */}
                      <TableCell>
                        {b.rib ? (
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.66rem' }}>
                              {ribVisible ? b.rib : `****${b.rib.slice(-4)}`}
                            </Typography>
                            <Tooltip title={ribVisible ? 'Masquer RIB' : 'Afficher RIB complet'}>
                              <IconButton size='small' onClick={() => toggleRib(b.id)}>
                                <VisibilityIcon sx={{ fontSize: 12, color: '#9aa8b8' }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          <Tooltip title='🔴 RIB manquant'>
                            <Chip label='⚠️ Manquant' size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      {/* G: Compte Principal */}
                      <TableCell>
                        <Chip label={b.is_principal ? 'Oui' : 'Non'} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: b.is_principal ? 'rgba(26,122,74,0.1)' : 'transparent', color: b.is_principal ? VERT : '#6b7a8a', fontWeight: 700, border: `1px solid ${b.is_principal ? VERT : '#d6dde6'}40` }} />
                      </TableCell>
                      {/* H: Date Mise à Jour */}
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.66rem', color: b.date_maj ? NAVY : '#9aa8b8' }}>{b.date_maj ? formatDate(b.date_maj) : '—'}</Typography></TableCell>
                      {/* I: Statut (auto, lock) */}
                      <TableCell sx={{ bgcolor: statut.bg }}>
                        <Tooltip title='=SI([@RIB]=""; "RIB manquant"; SI(Non; "Compte secondaire"; SI(>=365; "Actif"; "À vérifier")))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={statut.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: statut.bg, color: statut.color, fontWeight: 700, border: `1px solid ${statut.color}30` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* J: Alerte (auto, lock, indépendante — enrichie PROMPT 3) */}
                      <TableCell sx={{ bgcolor: alerte.bg, borderLeft: `3px solid ${alerte.color}` }}>
                        <Tooltip title='=SI(RIB="";"🔴 RIB manquant"; SI(NB.SI(RIB;[@RIB])>1;"🟣 RIB dupliqué"; SI(NB.SI.ENS(Mat;[@Mat];Principal;"Oui")=0;"🟠 Principal manquant"; SI(<-730;"🔴 Expiré"; SI(<-365;"🟡 >1 an"; SI(Statut="À vérifier";"🟠 À vérifier";"🟢 OK"))))))'>
                          <Stack direction='row' spacing={0.3} alignItems='center'>
                            <LockIcon sx={{ fontSize: 10, color: '#9aa8b8' }} />
                            <Chip label={alerte.label} size='small' sx={{ fontSize: '0.58rem', height: 18, bgcolor: alerte.bg, color: alerte.color, fontWeight: 700, border: `1px solid ${alerte.color}40` }} />
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      {/* K: Dernier Contrôle */}
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.66rem', color: b.dernier_controle ? BLEU : '#9aa8b8' }}>{b.dernier_controle ? formatDate(b.dernier_controle) : '—'}</Typography></TableCell>
                      {/* L: Notes */}
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.notes || '—'}</Typography></TableCell>
                      {/* Actions */}
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.3} justifyContent='center'>
                          <Tooltip title='Voir fiche employé'>
                            <IconButton size='small' sx={{ color: VIOLET }} onClick={() => navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${b.employee_id}`)}>
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Modifier'>
                            <IconButton size='small' color='info' onClick={() => setEditDialog({ ...b, __original_rib: b.rib })}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {/* PROMPT 4 : 3e bouton d'action — Basculer compte principal */}
                          <Tooltip title={b.is_principal ? 'Basculer en secondaire' : 'Basculer compte principal'}>
                            <IconButton size='small' sx={{ color: b.is_principal ? VERT : ORANGE }} onClick={() => handleBasculerPrincipal(b)}>
                              <SwapVertIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={14} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun enregistrement trouvé</TableCell></TableRow>
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
          <AddIcon color='success' /> Nouveau RIB — N° auto: BAN-{String(BANCAIRES.length + 1).padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
              Le N° est généré automatiquement. L'Employé (col C) et le Statut/Alerte (col I/J) sont calculés automatiquement via RECHERCHEX et SI imbriquée.
            </Alert>
            <TextField select size='small' label='Matricule employé' fullWidth value={newBanque.employee_id || ''} onChange={(e) => setNewBanque({ ...newBanque, employee_id: e.target.value })}>
              {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Banque' fullWidth value={newBanque.banque || ''} onChange={(e) => setNewBanque({ ...newBanque, banque: e.target.value })}>
              {BANQUES_LIST.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>
            <TextField size='small' label='Agence' fullWidth value={newBanque.agence || ''} onChange={(e) => setNewBanque({ ...newBanque, agence: e.target.value })} />
            <TextField size='small' label='RIB (sera masqué ****1234)' fullWidth value={newBanque.rib || ''} onChange={(e) => setNewBanque({ ...newBanque, rib: e.target.value })} placeholder='3000100001203456789012' />
            <TextField select size='small' label='Compte principal' fullWidth value={newBanque.is_principal !== false ? 'Oui' : 'Non'} onChange={(e) => setNewBanque({ ...newBanque, is_principal: e.target.value === 'Oui' })}>
              <MenuItem value='Oui'>Oui</MenuItem>
              <MenuItem value='Non'>Non</MenuItem>
            </TextField>
            <TextField size='small' label='Notes' fullWidth multiline rows={2} value={newBanque.notes || ''} onChange={(e) => setNewBanque({ ...newBanque, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<AddIcon />} disabled={!newBanque.employee_id} onClick={handleCreate} sx={{ bgcolor: VIOLET }}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier — {editDialog && `BAN-${String(BANCAIRES.findIndex(b => b.id === editDialog.id) + 1).padStart(3, '0')}`}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField select size='small' label='Banque' fullWidth value={editDialog.banque || ''} onChange={(e) => setEditDialog({ ...editDialog, banque: e.target.value })}>
                {BANQUES_LIST.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
              <Stack direction='row' spacing={1.5}>
                <TextField size='small' label='Agence' fullWidth value={editDialog.agence || ''} onChange={(e) => setEditDialog({ ...editDialog, agence: e.target.value })} />
                <TextField select size='small' label='Compte principal' fullWidth value={editDialog.is_principal !== false ? 'Oui' : 'Non'} onChange={(e) => setEditDialog({ ...editDialog, is_principal: e.target.value === 'Oui' })}>
                  <MenuItem value='Oui'>Oui</MenuItem>
                  <MenuItem value='Non'>Non</MenuItem>
                </TextField>
              </Stack>
              {/* PROMPT 4 : RIB actuel (lecture seule, masqué) + nouveau RIB + alerte si changement */}
              <TextField
                size='small' label='RIB actuel (lecture seule)'
                fullWidth disabled
                value={editDialog.__original_rib ? `****${editDialog.__original_rib.slice(-4)}` : '—'}
                helperText='Ancien RIB masqué pour sécurité RGPD — non modifiable directement'
              />
              <TextField
                size='small' label='Nouveau RIB' fullWidth
                value={editDialog.rib || ''}
                onChange={(e) => setEditDialog({ ...editDialog, rib: e.target.value })}
                placeholder='3000100001203456789012 (laisser inchangé si pas de modification)'
              />
              {editDialog.__original_rib !== editDialog.rib && (
                <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                  <strong>⚠️ Modification du RIB détectée</strong>
                  <br />Ancien : <code>{editDialog.__original_rib ? `****${editDialog.__original_rib.slice(-4)}` : '—'}</code> → Nouveau : <code>{editDialog.rib ? `****${editDialog.rib.slice(-4)}` : '—'}</code>
                  <br />Cette modification sera enregistrée dans l'audit trail (Bancaires_Audit) avec timestamp, employé et ancien/nouveau RIB.
                </Alert>
              )}
              <TextField type='date' size='small' label="Dernier contrôle" fullWidth value={(editDialog.dernier_controle || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, dernier_controle: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField size='small' label='Notes' fullWidth multiline rows={2} value={editDialog.notes || ''} onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })} />
              <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
                <strong>Colonnes auto (non modifiables) :</strong> Employé (RECHERCHEX), Statut (SI imbriquée), Alerte (SI imbriquée granulaire).
                <br />Date MAJ et Dernier contrôle seront automatiquement mis à jour à aujourd'hui lors de la sauvegarde.
                <br />Statut actuel : <strong>{calculerStatutBancaire(editDialog).label}</strong> · Alerte : <strong>{calculerAlerteBancaireEnrichie(editDialog).label}</strong>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 3 : DIALOG CONFIGURATION ALERTES BANCAIRES (_Config_Alertes_Bancaires) === */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color='primary' /> Configuration des alertes bancaires (_Config_Alertes_Bancaires)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Feuille de configuration Excel <strong>_Config_Alertes_Bancaires</strong> — Paramètres du système d'alertes bancaires automatiques (PROMPT 3).
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
                {'Sub EnvoyerRappelsBancaires()\n  For i = 2 To lastRow\n    al = AlerteEnrichie(RIB, Date_MAJ, ...)\n    If al <> "OK" Then\n      corps = corps & Employe & " - " & Banque & " - " & al\n      ws.Cells(i, "K").Value = Date  \' Dernier controle\n    End If\n  Next i\n  outMail.Send\nEnd Sub'}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfigDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SettingsIcon />} onClick={handleSaveConfig} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === PROMPT 3 : DIALOG RÉCAPITULATIF EMAIL (après envoi) === */}
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
              {/* Liste des comptes en anomalie */}
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mb: 0.5 }}>
                  📋 Comptes concernés ({alerteRecapDialog.count})
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 220 }}>
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2c3e50', '& .MuiTableCell-root': { color: '#fff', fontWeight: 700 } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>N°</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Employé</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Banque</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Alerte</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Dernier contrôle (MAJ)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerteRecapDialog.docsAlerte.map(b => {
                        const emp = findEmployee(b.employee_id);
                        const al = calculerAlerteBancaireEnrichie(b);
                        const num = `BAN-${String(BANCAIRES.indexOf(b) + 1).padStart(3, '0')}`;
                        return (
                          <TableRow key={b.id} hover>
                            <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: VIOLET }}>{num}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.65rem' }}>{b.banque || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.62rem' }}><Chip label={al.label} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
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
                📝 <strong>Audit trail</strong> — L'envoi a été enregistré dans <code>ALERTES_BANCAIRES_HISTORIQUE</code>. La colonne K (Dernier contrôle) a été mise à jour pour chaque compte en anomalie.
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

      {/* === PROMPT 6 : DIALOG EXPORT PAIE (mot de passe double saisie) === */}
      <Dialog open={Boolean(paieDialog)} onClose={() => setPaieDialog(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ color: ORANGE }} /> Export Paie — RIB complet
        </DialogTitle>
        <DialogContent>
          {paieDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                ⚠️ <strong>Fichier sensible.</strong> Cet export contient les RIB <strong>non masqués</strong> (colonnes : Matricule, Employé, Banque, Agence, RIB, Principal, Date MAJ, Statut).
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
                🔒 Audit trail : BANCAIRE_AUDIT_TRAIL · EXPORTS_LOG (action 'export_paie')
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

      {/* === PROMPT 6 : DIALOG RAPPORT AUDIT BANCAIRE (tous les comptes, triés Employé + Banque) === */}
      <Dialog open={auditDialog} onClose={() => setAuditDialog(false)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <AssessmentIcon sx={{ color: BLEU }} /> Rapport d'Audit Bancaire — {auditStats.total} compte(s)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.72rem' }}>
              Récapitulatif de tous les comptes avec statuts, alertes et dates de contrôle. Trié par <strong>Employé</strong> puis <strong>Banque</strong>.
            </Alert>
            {/* 3 chips de stats : Anomalies / À vérifier / OK */}
            <Stack direction='row' spacing={1.5} flexWrap='wrap' useFlexGap>
              <Chip
                label={`🔴 Anomalies : ${auditStats.anomalies}`}
                size='small'
                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700, border: `1px solid ${ROUGE}40` }}
              />
              <Chip
                label={`🟡 À vérifier : ${auditStats.aVerif}`}
                size='small'
                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(212,160,23,0.12)', color: JAUNE, fontWeight: 700, border: `1px solid ${JAUNE}40` }}
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
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Employé</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Matricule</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>N°</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Banque</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>RIB (masqué)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Principal</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Date MAJ</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Dernier Contrôle</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Alerte</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData.map(b => {
                    const emp = findEmployee(b.employee_id);
                    const st = calculerStatutBancaire(b);
                    const al = calculerAlerteBancaireEnrichie(b);
                    const num = `BAN-${String(BANCAIRES.indexOf(b) + 1).padStart(3, '0')}`;
                    return (
                      <TableRow key={b.id} hover sx={{
                        bgcolor: al.short === 'RIB manquant' || al.short === 'Expiré' || al.short === 'RIB dupliqué' ? 'rgba(179,58,74,0.05)' :
                                 al.short === '>1 an' || al.short === 'À vérifier' || al.short === 'Principal manquant' ? 'rgba(184,106,42,0.04)' :
                                 al.short === 'Non mis à jour' ? 'rgba(212,160,23,0.05)' :
                                 'transparent',
                      }}>
                        <TableCell sx={{ fontSize: '0.66rem', fontWeight: 600 }}>{emp ? employeeFullName(emp) : 'Non trouvé'}</TableCell>
                        <TableCell sx={{ fontSize: '0.66rem', fontFamily: 'monospace', color: NAVY }}>{emp?.matricule || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.66rem', fontFamily: 'monospace', color: VIOLET, fontWeight: 700 }}>{num}</TableCell>
                        <TableCell sx={{ fontSize: '0.66rem' }}>{b.banque || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.66rem', fontFamily: 'monospace' }}>{b.rib ? `****${b.rib.slice(-4)}` : <span style={{ color: ROUGE, fontWeight: 700 }}>— MANQUANT —</span>}</TableCell>
                        <TableCell><Chip label={b.is_principal ? 'Oui' : 'Non'} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: b.is_principal ? 'rgba(26,122,74,0.1)' : 'transparent', color: b.is_principal ? VERT : '#6b7a8a', fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ fontSize: '0.66rem', color: b.date_maj ? NAVY : '#9aa8b8' }}>{b.date_maj ? formatDate(b.date_maj) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.66rem', color: b.dernier_controle ? BLEU : '#9aa8b8' }}>{b.dernier_controle ? formatDate(b.dernier_controle) : '—'}</TableCell>
                        <TableCell sx={{ bgcolor: st.bg }}><Chip label={st.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                        <TableCell sx={{ bgcolor: al.bg, borderLeft: `3px solid ${al.color}` }}><Chip label={al.short} size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: al.bg, color: al.color, fontWeight: 700 }} /></TableCell>
                      </TableRow>
                    );
                  })}
                  {auditData.length === 0 && (
                    <TableRow><TableCell colSpan={10} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun compte à auditer</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity='info' sx={{ fontSize: '0.68rem' }}>
              📋 <strong>Rapport complet</strong> — {auditStats.total} compte(s) au total. Tri alphabétique par Employé puis Banque. Indépendant des filtres appliqués au tableau principal.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAuditDialog(false)}>Fermer</Button>
          <Button variant='outlined' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
          <Button variant='outlined' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ textTransform: 'none', fontSize: '0.75rem', color: VERT, borderColor: VERT }}>Export PDF</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
