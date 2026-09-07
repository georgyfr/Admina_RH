// ============================================================
// AvenantsModule.jsx — Module complet de gestion des avenants
// Structure Excel A-U (21 colonnes) + auto-génération + RECHERCHEX
// + workflow statut interactif (Projet → Envoyé → Signé → Archivé/Refusé)
// + bouclage auto contrat (ÉTAPE 7) + validations (Master Prompt)
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Stack, Button, Chip, Typography, Tooltip, IconButton,
  Alert, Divider, Snackbar, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, InputAdornment, Collapse, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MailIcon from '@mui/icons-material/Mail';
import ArchiveIcon from '@mui/icons-material/Archive';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import {
  AVENANTS, CONTRATS, EMPLOYEES, findEmployee, employeeFullName,
  formatNumber, formatDate, LABELS, NOMENCLATURES,
  generateAvenantNumber, MOTIFS_AVENANT, calculerStatutAvenant,
  STATUTS_AVENANT, getHorodatage, calculerDelaiSignature,
} from './data';
import { StatusBadge, SectionHeader } from './components';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const SMIC_FCFA = 36000; // SMIC mensuel Cameroun (référence minimale)
const AUDIT_TRAIL = []; // Historique des modifications (Avenants_Audit)

// --- Mise en forme conditionnelle statut (colonne M) ---
// Vert si "Archivé", Orange si "Signé", Bleu si "Envoyé au salarié", Gris si "Projet", Rouge si "Refusé"
const STATUT_STYLES = {
  'Archivé':          { color: VERT, bg: 'rgba(26,122,74,0.1)', label: '🟢 Archivé' },
  'Signé':            { color: ORANGE, bg: 'rgba(184,106,42,0.1)', label: '🟠 Signé' },
  'Envoyé au salarié': { color: BLEU, bg: 'rgba(42,106,154,0.1)', label: '🔵 Envoyé' },
  'Projet':           { color: '#6b7a8a', bg: 'rgba(107,122,138,0.1)', label: '⚪ Projet' },
  'Refusé':           { color: ROUGE, bg: 'rgba(179,58,74,0.1)', label: '🔴 Refusé' },
};

// --- Colonnes A-O (structure Excel) ---
const COLUMNS = [
  { key: 'amendment_number', label: 'N° Avenant', col: 'A', render: (r) => <Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}>{r.amendment_number}</Typography> },
  { key: 'contract', label: 'N° Contrat', col: 'B', render: (r) => {
    const c = CONTRATS.find(ct => ct.id === r.contract_id);
    return <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{c ? c.contract_number : '—'}</Typography>;
  }},
  { key: 'employee', label: 'Employé', col: 'C', render: (r) => {
    const emp = findEmployee(r.employee_id);
    return emp ? (
      <Stack direction='row' spacing={0.8} alignItems='center'>
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>{emp.prenom[0]}{emp.nom[0]}</Box>
        <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{employeeFullName(emp)}</Typography>
      </Stack>
    ) : '—';
  }},
  { key: 'poste_actuel', label: 'Poste actuel', col: 'D', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{r.poste_actuel || '—'}</Typography> },
  { key: 'nouveau_poste', label: 'Nouveau poste', col: 'E', render: (r) => r.nouveau_poste ? <Chip label={r.nouveau_poste} size='small' color='primary' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} /> : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.68rem' }}>—</Typography> },
  { key: 'salaire_ancien', label: 'Salaire ancien', col: 'F', align: 'right', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6b7a8a' }}>{formatNumber(r.salaire_ancien) || '—'}</Typography> },
  { key: 'nouveau_salaire', label: 'Nouveau salaire', col: 'G', align: 'right', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: r.nouveau_salaire > r.salaire_ancien ? VERT : ROUGE }}>{formatNumber(r.nouveau_salaire) || '—'}</Typography> },
  { key: 'temps_ancien', label: 'Temps ancien', col: 'H', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>{r.temps_ancien || '—'}</Typography> },
  { key: 'nouveau_temps', label: 'Nouveau temps', col: 'I', render: (r) => r.nouveau_temps ? <Chip label={r.nouveau_temps} size='small' color='warning' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} /> : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.68rem' }}>—</Typography> },
  { key: 'motif', label: 'Motif', col: 'J', render: (r) => <Chip label={r.motif} size='small' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} /> },
  { key: 'date_signature', label: 'Date signature', col: 'K', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.68rem' }}>{r.date_signature ? formatDate(r.date_signature) : '—'}</Typography> },
  { key: 'date_effet', label: 'Date effet', col: 'L', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{formatDate(r.date_effet)}</Typography> },
  { key: 'statut', label: 'Statut', col: 'M', render: (r) => {
    const style = STATUT_STYLES[r.statut] || STATUT_STYLES['Projet'];
    return <Chip label={style.label} size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: style.bg, color: style.color, fontWeight: 700, border: `1px solid ${style.color}30` }} />;
  }},
  { key: 'lien_document', label: 'Lien doc', col: 'N', render: (r) => r.lien_document ? <Tooltip title={r.lien_document}><IconButton size='small' sx={{ color: ROUGE }}><PictureAsPdfIcon fontSize='small' /></IconButton></Tooltip> : <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography> },
  { key: 'notes', label: 'Notes', col: 'O', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', maxWidth: 100, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</Typography> },
  // --- Colonnes P-T (horodatage + délai) ---
  { key: 'date_envoi', label: 'Date envoi', col: 'P', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.65rem', color: BLEU }}>{r.date_envoi ? formatDate(r.date_envoi) : '—'}</Typography> },
  { key: 'date_retour_signe', label: 'Retour signé', col: 'Q', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.65rem', color: ORANGE }}>{r.date_retour_signe ? formatDate(r.date_retour_signe) : '—'}</Typography> },
  { key: 'date_archivage', label: 'Date archivage', col: 'R', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.65rem', color: VERT }}>{r.date_archivage ? formatDate(r.date_archivage) : '—'}</Typography> },
  { key: 'date_refus', label: 'Date refus', col: 'S', render: (r) => <Typography variant='caption' sx={{ fontSize: '0.65rem', color: ROUGE }}>{r.date_refus ? formatDate(r.date_refus) : '—'}</Typography> },
  { key: 'delai_signature', label: 'Délai sign.', col: 'T', align: 'right', render: (r) => {
    const delai = calculerDelaiSignature(r.date_envoi, r.date_retour_signe);
    if (delai === null) return <Typography variant='caption' sx={{ color: '#bbb', fontSize: '0.62rem' }}>—</Typography>;
    const color = delai <= 7 ? VERT : delai <= 15 ? ORANGE : ROUGE;
    return <Chip label={`${delai}j`} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: `${color}15`, color, fontWeight: 700 }} />;
  }},
  // --- Colonne U : Contrat mis à jour (bouclage ÉTAPE 7) ---
  { key: 'contrat_maj', label: 'Contrat MAJ', col: 'U', align: 'center', render: (r) => {
    const maj = r.contrat_maj === 'Oui';
    return <Chip
      label={maj ? '✅ Oui' : '⏳ Non'}
      size='small'
      sx={{
        fontSize: '0.58rem', height: 16, fontWeight: 700,
        bgcolor: maj ? 'rgba(26,122,74,0.1)' : 'rgba(107,122,138,0.1)',
        color: maj ? VERT : '#6b7a8a',
        border: `1px solid ${maj ? VERT : '#6b7a8a'}30`,
      }}
    />;
  }},
];

// --- Helper : enregistre une entrée dans l'audit trail (Avenants_Audit) ---
// Conforme ISO 30401:2018 — traçabilité des modifications
function logAudit(avenantId, amendmentNumber, champ, ancienneVal, nouvelleVal, utilisateur = 'DRH') {
  AUDIT_TRAIL.push({
    timestamp: new Date().toISOString(),
    avenant_id: avenantId,
    amendment_number: amendmentNumber,
    champ,
    ancienne_valeur: ancienneVal,
    nouvelle_valeur: nouvelleVal,
    utilisateur,
  });
}

// --- Helper : récupère l'historique des modifications d'un avenant ---
function getAuditHistory(avenantId) {
  return AUDIT_TRAIL.filter(a => a.avenant_id === avenantId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
}

export default function AvenantsModule() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fStatut, setFStatut] = useState('');
  const [snack, setSnack] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [newAvenant, setNewAvenant] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  // --- Master Prompt : nouveaux states ---
  const [refuseDialog, setRefuseDialog] = useState(null); // { avenant, motif: '' }
  const [showAudit, setShowAudit] = useState(false); // collapsible historique
  const [editErrors, setEditErrors] = useState({}); // erreurs de validation edit

  // Filtrage
  const filtered = useMemo(() => {
    return AVENANTS.filter(a => {
      if (search) {
        const emp = findEmployee(a.employee_id);
        const empName = emp ? employeeFullName(emp).toLowerCase() : '';
        const q = search.toLowerCase();
        if (!empName.includes(q) && !a.amendment_number?.toLowerCase().includes(q) && !a.motif?.toLowerCase().includes(q)) return false;
      }
      if (fStatut && a.statut !== fStatut) return false;
      return true;
    });
  }, [search, fStatut, refreshKey]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Stats par statut (NB.SI)
  const stats = useMemo(() => ({
    projet: AVENANTS.filter(a => a.statut === 'Projet').length,
    envoye: AVENANTS.filter(a => a.statut === 'Envoyé au salarié').length,
    signe: AVENANTS.filter(a => a.statut === 'Signé').length,
    archive: AVENANTS.filter(a => a.statut === 'Archivé').length,
    refuse: AVENANTS.filter(a => a.statut === 'Refusé').length,
  }), [refreshKey]);

  // KPI Dashboard : Avenants signés ce mois
  const signesCeMois = useMemo(() => {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    return AVENANTS.filter(a => a.statut === 'Signé' && a.date_retour_signe && new Date(a.date_retour_signe) >= debutMois).length;
  }, [refreshKey]);

  // Délai moyen de signature
  const delaiMoyen = useMemo(() => {
    const delais = AVENANTS.map(a => calculerDelaiSignature(a.date_envoi, a.date_retour_signe)).filter(d => d !== null);
    return delais.length > 0 ? Math.round(delais.reduce((s, d) => s + d, 0) / delais.length) : null;
  }, [refreshKey]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => {
      const emp = findEmployee(r.employee_id);
      if (c.key === 'employee') return `"${emp ? employeeFullName(emp) : ''}"`;
      if (c.key === 'contract') { const ct = CONTRATS.find(x => x.id === r.contract_id); return `"${ct ? ct.contract_number : ''}"`; }
      return `"${String(r[c.key] || '').replace(/"/g, '""')}"`;
    }));
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `avenants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: `${filtered.length} avenant(s) exporté(s) en CSV`, severity: 'success' });
  };

  // Actions workflow avec horodatage + audit + bouclage
  const handleWorkflow = (avenant, action) => {
    const idx = AVENANTS.findIndex(a => a.id === avenant.id);
    if (idx === -1) return;
    const now = new Date().toISOString().slice(0, 10);
    const ancienStatut = AVENANTS[idx].statut;

    if (action === 'envoyer') {
      AVENANTS[idx].statut = 'Envoyé au salarié';
      AVENANTS[idx].date_envoi = now;
      logAudit(avenant.id, avenant.amendment_number, 'statut', ancienStatut, 'Envoyé au salarié');
      logAudit(avenant.id, avenant.amendment_number, 'date_envoi', '—', now);
      setSnack({ msg: `Avenant ${avenant.amendment_number} envoyé au salarié`, severity: 'info' });
    } else if (action === 'signer') {
      AVENANTS[idx].statut = 'Signé';
      AVENANTS[idx].date_signature = now;
      AVENANTS[idx].date_retour_signe = now;
      logAudit(avenant.id, avenant.amendment_number, 'statut', ancienStatut, 'Signé');
      logAudit(avenant.id, avenant.amendment_number, 'date_signature', '—', now);
      logAudit(avenant.id, avenant.amendment_number, 'date_retour_signe', '—', now);
      setSnack({ msg: `Avenant ${avenant.amendment_number} signé (retour le ${now}) — bouton Archiver activé`, severity: 'success' });
    } else if (action === 'archiver') {
      AVENANTS[idx].statut = 'Archivé';
      AVENANTS[idx].date_archivage = now;
      AVENANTS[idx].lien_document = `/docs/${avenant.amendment_number}.pdf`;
      // --- Master Prompt section 6.2 : mise à jour automatique du contrat principal ---
      AVENANTS[idx].contrat_maj = 'Oui';
      logAudit(avenant.id, avenant.amendment_number, 'statut', ancienStatut, 'Archivé');
      logAudit(avenant.id, avenant.amendment_number, 'date_archivage', '—', now);
      logAudit(avenant.id, avenant.amendment_number, 'lien_document', '—', `/docs/${avenant.amendment_number}.pdf`);
      logAudit(avenant.id, avenant.amendment_number, 'contrat_maj', 'Non', 'Oui');
      setSnack({ msg: `Avenant ${avenant.amendment_number} archivé — contrat principal mis à jour automatiquement (bouclage RECHERCHEX)`, severity: 'success' });
    } else if (action === 'refuser') {
      // --- Master Prompt section 5.2 : motif de refus obligatoire ---
      // Ouvre un dialog pour demander le motif avant de refuser
      setRefuseDialog({ avenant, motif: '' });
      return; // Le refus est confirmé dans handleConfirmRefuse
    }
    setRefreshKey(k => k + 1);
  };

  // --- Confirmation du refus avec motif obligatoire ---
  const handleConfirmRefuse = () => {
    if (!refuseDialog) return;
    if (!refuseDialog.motif || refuseDialog.motif.trim().length < 5) {
      setSnack({ msg: 'Le motif de refus est obligatoire (minimum 5 caractères)', severity: 'warning' });
      return;
    }
    const idx = AVENANTS.findIndex(a => a.id === refuseDialog.avenant.id);
    if (idx === -1) return;
    const now = new Date().toISOString().slice(0, 10);
    const ancienStatut = AVENANTS[idx].statut;
    AVENANTS[idx].statut = 'Refusé';
    AVENANTS[idx].date_refus = now;
    AVENANTS[idx].motif_refus = refuseDialog.motif.trim();
    logAudit(refuseDialog.avenant.id, refuseDialog.avenant.amendment_number, 'statut', ancienStatut, 'Refusé');
    logAudit(refuseDialog.avenant.id, refuseDialog.avenant.amendment_number, 'date_refus', '—', now);
    logAudit(refuseDialog.avenant.id, refuseDialog.avenant.amendment_number, 'motif_refus', '—', refuseDialog.motif.trim());
    setSnack({ msg: `Avenant ${refuseDialog.avenant.amendment_number} refusé — motif: ${refuseDialog.motif.trim()}`, severity: 'error' });
    setRefuseDialog(null);
    setRefreshKey(k => k + 1);
  };

  // --- Master Prompt section 7 : validations création ---
  // Calcule les erreurs de validation pour le formulaire de création
  const createErrors = useMemo(() => {
    const errs = {};
    if (!newAvenant.contract_id) return errs; // pas encore sélectionné
    // Contrôle 3.3 : au moins un champ modifié
    const hasSalaireChange = (newAvenant.nouveau_salaire || 0) !== (newAvenant.salaire_ancien || 0);
    const hasPosteChange = Boolean(newAvenant.nouveau_poste && newAvenant.nouveau_poste.trim());
    const hasTempsChange = Boolean(newAvenant.nouveau_temps && newAvenant.nouveau_temps.trim());
    if (!hasSalaireChange && !hasPosteChange && !hasTempsChange) {
      errs.noChange = 'Aucune modification détectée. Veuillez saisir au moins une nouvelle valeur (nouveau salaire, nouveau poste ou nouveau temps).';
    }
    // Contrôle 7 : salaire minimum (SMIC Cameroun)
    if ((newAvenant.nouveau_salaire || 0) > 0 && (newAvenant.nouveau_salaire || 0) < SMIC_FCFA) {
      errs.smic = `Le salaire ne peut pas être inférieur au SMIC (${formatNumber(SMIC_FCFA)} FCFA).`;
    }
    // Contrôle 7 : cohérence date signature vs effet (si date signature saisie)
    if (newAvenant.date_signature && newAvenant.date_effet) {
      if (new Date(newAvenant.date_signature) > new Date(newAvenant.date_effet)) {
        errs.dateCoherence = 'La date de signature ne peut pas être postérieure à la date d\'effet.';
      }
    }
    // Contrôle 7 : date postérieure au 01/01/2000
    const dateMin = new Date('2000-01-01');
    if (newAvenant.date_effet && new Date(newAvenant.date_effet) < dateMin) {
      errs.dateMin = 'La date d\'effet doit être postérieure au 01/01/2000.';
    }
    return errs;
  }, [newAvenant]);

  // --- Master Prompt section 3.2 : message récapitulatif auto ---
  const createRecap = useMemo(() => {
    if (!newAvenant.contract_id) return '';
    const contrat = CONTRATS.find(c => c.id === newAvenant.contract_id);
    const emp = contrat ? findEmployee(contrat.employee_id) : null;
    const empName = emp ? employeeFullName(emp) : '—';
    const salaireDiff = (newAvenant.nouveau_salaire || 0) - (newAvenant.salaire_ancien || 0);
    const parts = [empName];
    if (salaireDiff !== 0) {
      parts.push(`${salaireDiff > 0 ? 'Augmentation' : 'Diminution'} de ${formatNumber(Math.abs(salaireDiff))} FCFA (${salaireDiff > 0 ? '+' : ''}${salaireDiff})`);
    } else {
      parts.push('Salaire inchangé');
    }
    if (newAvenant.nouveau_poste && newAvenant.nouveau_poste.trim()) {
      parts.push(`Changement de poste vers ${newAvenant.nouveau_poste}`);
    } else {
      parts.push('Poste inchangé');
    }
    if (newAvenant.nouveau_temps && newAvenant.nouveau_temps.trim()) {
      parts.push(`Nouveau temps: ${newAvenant.nouveau_temps}`);
    }
    return parts.join(' · ');
  }, [newAvenant]);

  // Création avenant
  const handleCreate = () => {
    if (!newAvenant.contract_id) { setSnack({ msg: 'Veuillez sélectionner un contrat', severity: 'warning' }); return; }
    // --- Master Prompt : vérification des erreurs avant création ---
    if (Object.keys(createErrors).length > 0) {
      setSnack({ msg: createErrors.noChange || createErrors.smic || createErrors.dateCoherence || createErrors.dateMin || 'Erreur de validation', severity: 'warning' });
      return;
    }
    const num = generateAvenantNumber();
    const contrat = CONTRATS.find(c => c.id === newAvenant.contract_id);
    const emp = contrat ? findEmployee(contrat.employee_id) : null;
    AVENANTS.push({
      id: `avn-${Date.now()}`,
      amendment_number: num,
      contract_id: newAvenant.contract_id,
      employee_id: contrat?.employee_id || '',
      poste_actuel: emp?.poste || '',
      nouveau_poste: newAvenant.nouveau_poste || '',
      salaire_ancien: contrat?.salaire_brut || 0,
      nouveau_salaire: newAvenant.nouveau_salaire || contrat?.salaire_brut || 0,
      temps_ancien: emp?.regime_travail || 'Temps plein',
      nouveau_temps: newAvenant.nouveau_temps || '',
      motif: newAvenant.motif || 'Augmentation',
      date_signature: '',
      date_effet: newAvenant.date_effet || new Date().toISOString().slice(0, 10),
      statut: 'Projet',
      lien_document: '',
      notes: newAvenant.notes || '',
      // --- Master Prompt : nouveaux champs ---
      contrat_maj: 'Non', // Bouclage non encore effectué (passera à "Oui" à l'archivage)
      motif_refus: '',
      // --- Master Prompt section 6.1 : nouvelles colonnes P, Q, R ---
      nouveau_lieu: newAvenant.nouveau_lieu || '',
      nouvelle_fin_essai: newAvenant.nouvelle_fin_essai || '',
      observations_avn: newAvenant.observations_avn || '',
    });
    logAudit(`avn-${Date.now()}`, num, 'création', '—', `Avenant créé (statut: Projet, motif: ${newAvenant.motif || 'Augmentation'})`);
    setCreateDialog(false);
    setNewAvenant({});
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Avenant ${num} créé (statut: Projet)`, severity: 'success' });
  };

  // --- Master Prompt section 7 : validations édition ---
  const validateEdit = useMemo(() => {
    const errs = {};
    if (!editDialog) return errs;
    // Contrôle 7 : salaire minimum (SMIC)
    if ((editDialog.nouveau_salaire || 0) > 0 && (editDialog.nouveau_salaire || 0) < SMIC_FCFA) {
      errs.smic = `Le salaire ne peut pas être inférieur au SMIC (${formatNumber(SMIC_FCFA)} FCFA).`;
    }
    // Contrôle 7 : cohérence date signature vs effet
    if (editDialog.date_signature && editDialog.date_effet) {
      if (new Date(editDialog.date_signature) > new Date(editDialog.date_effet)) {
        errs.dateCoherence = 'La date de signature ne peut pas être postérieure à la date d\'effet.';
      }
    }
    // Contrôle 7 : format lien document (/docs/...)
    if (editDialog.lien_document && !editDialog.lien_document.startsWith('/docs/')) {
      errs.docFormat = "Le chemin du document doit commencer par '/docs/'.";
    }
    // Contrôle 7 : date postérieure au 01/01/2000
    const dateMin = new Date('2000-01-01');
    if (editDialog.date_effet && new Date(editDialog.date_effet) < dateMin) {
      errs.dateMin = 'La date d\'effet doit être postérieure au 01/01/2000.';
    }
    return errs;
  }, [editDialog]);

  // Édition avenant (avec audit trail)
  const handleSaveEdit = () => {
    if (!editDialog) return;
    // --- Master Prompt : vérification des erreurs avant sauvegarde ---
    if (Object.keys(validateEdit).length > 0) {
      setEditErrors(validateEdit);
      setSnack({ msg: Object.values(validateEdit)[0], severity: 'warning' });
      return;
    }
    setEditErrors({});
    const idx = AVENANTS.findIndex(a => a.id === editDialog.id);
    if (idx !== -1) {
      const original = AVENANTS[idx];
      // --- Master Prompt section 4.3 : audit trail des modifications ---
      const champs = ['nouveau_poste', 'nouveau_salaire', 'nouveau_temps', 'motif', 'date_signature', 'date_effet', 'lien_document', 'notes', 'nouveau_lieu', 'nouvelle_fin_essai', 'observations_avn'];
      champs.forEach(champ => {
        const ancien = String(original[champ] ?? '');
        const nouveau = String(editDialog[champ] ?? '');
        if (ancien !== nouveau) {
          logAudit(original.id, original.amendment_number, champ, ancien, nouveau);
        }
      });
      AVENANTS[idx] = { ...AVENANTS[idx], ...editDialog };
      // Le statut reste celui défini par le workflow (ne pas recalculer automatiquement)
      // (Master Prompt section 5.1 : remplacer le statut automatique par des boutons d'action)
    }
    setEditDialog(null);
    setRefreshKey(k => k + 1);
    setSnack({ msg: `Avenant modifié — ${getAuditHistory(editDialog.id).length} entrée(s) d'audit enregistrée(s)`, severity: 'success' });
  };

  return (
    <Box>
      {/* === STATS PAR STATUT (NB.SI) + KPI DASHBOARD === */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[
          { statut: 'Projet', key: 'projet' },
          { statut: 'Envoyé au salarié', key: 'envoye' },
          { statut: 'Signé', key: 'signe' },
          { statut: 'Archivé', key: 'archive' },
          { statut: 'Refusé', key: 'refuse' },
        ].map(({ statut, key }) => {
          const style = STATUT_STYLES[statut];
          return (
            <Grid item xs={6} sm={2.4} key={statut}>
              <Box sx={{ p: 1.5, bgcolor: style.bg, borderRadius: 1.5, textAlign: 'center', border: `1px solid ${style.color}20` }}>
                <Typography variant='h5' fontWeight={800} sx={{ color: style.color, fontSize: '1.2rem' }}>{stats[key] || 0}</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>{style.label}</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
      {/* KPI Dashboard : Avenants en attente + Signés ce mois + Délai moyen */}
      <Card sx={{ mb: 2, border: `1px solid ${VIOLET}20`, borderRadius: '12px' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent='center' divider={<Divider orientation='vertical' flexItem />}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>En attente de signature</Typography>
              <Typography variant='h5' fontWeight={800} sx={{ color: BLEU, fontSize: '1.3rem' }}>{stats.envoye}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>=NB.SI(M:M; "Envoyé au salarié")</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>Signés ce mois</Typography>
              <Typography variant='h5' fontWeight={800} sx={{ color: ORANGE, fontSize: '1.3rem' }}>{signesCeMois}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>{'=NB.SI.ENS(M:M;"Signé";Q:Q;">="&DEBUT.MOIS)'}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>Délai moyen signature</Typography>
              <Typography variant='h5' fontWeight={800} sx={{ color: delaiMoyen !== null ? (delaiMoyen <= 7 ? VERT : delaiMoyen <= 15 ? ORANGE : ROUGE) : '#6b7a8a', fontSize: '1.3rem' }}>{delaiMoyen !== null ? `${delaiMoyen}j` : '—'}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>=Q- P (moyenne)</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeader
            title='Avenants de contrat'
            subtitle={`${filtered.length} avenant(s) · Structure A-O · Auto-génération N° · RECHERCHEX contrat/employé · Workflow Projet → Signé → Envoyé → Archivé`}
            action={<Stack direction='row' spacing={1}>
              <Button variant='outlined' size='small' startIcon={<PictureAsPdfIcon />} onClick={() => navigate('/domaine2_Gestion_Administrative_Personnel/avenants/modele-pdf')} sx={{ textTransform: 'none', fontSize: '0.75rem', color: ROUGE, borderColor: `${ROUGE}40`, '&:hover': { borderColor: ROUGE, bgcolor: 'rgba(179,58,74,0.04)' } }}>📄 Modèle PDF</Button>
              <Button variant='outlined' size='small' startIcon={<DownloadIcon />} onClick={handleExportCSV} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Export CSV</Button>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewAvenant({}); setCreateDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: VIOLET }}>Nouvel avenant</Button>
            </Stack>}
          />

          {/* Filtres */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size='small' placeholder='Rechercher (N° avenant, employé, motif)...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.8rem' } }}
            />
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 130 }}>
              <MenuItem value=''>Tous</MenuItem>
              {Object.keys(STATUT_STYLES).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>

          {/* Tableau A-O */}
          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {COLUMNS.map(c => (
                    <TableCell key={c.key} align={c.align || 'left'} sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                      <Stack direction='row' spacing={0.3} alignItems='center'>
                        <Box component='span' sx={{ fontSize: '0.55rem', color: '#bbb', fontFamily: 'monospace' }}>{c.col}</Box>
                        {c.label}
                      </Stack>
                    </TableCell>
                  ))}
                  <TableCell align='center' sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row) => {
                  // Mise en forme conditionnelle : surlignage jaune si date effet dans les 30 jours à venir
                  const jrEffet = row.date_effet ? Math.ceil((new Date(row.date_effet) - new Date()) / 86400000) : null;
                  const isUrgent = jrEffet !== null && jrEffet >= 0 && jrEffet <= 30;
                  return (
                  <TableRow key={row.id} hover sx={{
                    bgcolor: isUrgent ? 'rgba(249,201,79,0.12)' : 'transparent',
                    '&:hover': { bgcolor: isUrgent ? 'rgba(249,201,79,0.18)' : 'action.hover' },
                    borderLeft: isUrgent ? '4px solid #f9c74f' : 'none',
                  }}>
                    {COLUMNS.map(c => (
                      <TableCell key={c.key} align={c.align || 'left'}>{c.render(row)}</TableCell>
                    ))}
                    <TableCell align='center'>
                      <Stack direction='row' spacing={0.3} justifyContent='center' flexWrap='wrap'>
                        {row.employee_id && (
                          <Tooltip title='Voir fiche employé'>
                            <IconButton size='small' color='primary' onClick={() => navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${row.employee_id}`)}>
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title='Modifier'>
                          <IconButton size='small' color='info' onClick={() => setEditDialog({ ...row })}>
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        {row.statut === 'Projet' && (
                          <Tooltip title="Envoyer au salarié">
                            <IconButton size='small' sx={{ color: BLEU }} onClick={() => handleWorkflow(row, 'envoyer')}>
                              <MailIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {row.statut === 'Envoyé au salarié' && (
                          <Tooltip title='Marquer signé (retour)'>
                            <IconButton size='small' sx={{ color: ORANGE }} onClick={() => handleWorkflow(row, 'signer')}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(row.statut === 'Envoyé au salarié' || row.statut === 'Projet') && (
                          <Tooltip title='Refuser'>
                            <IconButton size='small' sx={{ color: ROUGE }} onClick={() => handleWorkflow(row, 'refuser')}>
                              <CancelIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {row.statut === 'Signé' && (
                          <Tooltip title='Archiver'>
                            <IconButton size='small' sx={{ color: VERT }} onClick={() => handleWorkflow(row, 'archiver')}>
                              <ArchiveIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={COLUMNS.length + 1} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun avenant{search ? ' trouvé' : ''}</TableCell></TableRow>
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

      {/* === DIALOG CRÉATION AVENANT (Master Prompt section 3) === */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color='success' /> Nouvel avenant — N° auto: {generateAvenantNumber()}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
              Le N° Avenant est généré automatiquement. L'employé, le poste actuel, le salaire ancien et le temps actuel sont récupérés via RECHERCHEX depuis le contrat sélectionné.
            </Alert>
            {/* Col B: N° Contrat (liste déroulante) */}
            <TextField select size='small' label='N° Contrat (source: 6-Suivi Contrats)' fullWidth value={newAvenant.contract_id || ''} onChange={(e) => {
              const c = CONTRATS.find(ct => ct.id === e.target.value);
              const emp = c ? findEmployee(c.employee_id) : null;
              setNewAvenant({ ...newAvenant, contract_id: e.target.value, salaire_ancien: c?.salaire_brut || 0, nouveau_salaire: c?.salaire_brut || 0, temps_ancien: emp?.regime_travail || 'Temps plein', poste_actuel: emp?.poste || '' });
            }}>
              {CONTRATS.map(c => { const emp = findEmployee(c.employee_id); return <MenuItem key={c.id} value={c.id}>{c.contract_number} — {emp ? employeeFullName(emp) : '?'}</MenuItem>; })}
            </TextField>

            {/* --- Master Prompt section 3.1 : Poste actuel + Temps actuel (lecture seule RECHERCHEX) --- */}
            {newAvenant.contract_id && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', border: '1px solid #e9edf2', borderRadius: 1 }}>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.7rem', color: NAVY, display: 'block', mb: 0.8 }}>
                  Valeurs actuelles (lecture seule · RECHERCHEX depuis 6-Suivi Contrats)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', minWidth: 80 }}>Poste actuel:</Typography>
                      <Chip label={newAvenant.poste_actuel || '—'} size='small' variant='outlined' sx={{ fontSize: '0.6rem', height: 18 }} />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', minWidth: 80 }}>Temps actuel:</Typography>
                      <Chip label={newAvenant.temps_ancien || '—'} size='small' variant='outlined' sx={{ fontSize: '0.6rem', height: 18 }} />
                    </Stack>
                  </Grid>
                </Grid>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                  =RECHERCHEX([N° Contrat]; '6-Suivi Contrats'!A:A; '6-Suivi Contrats'!C:C; "Non trouvé"; 0)
                </Typography>
              </Paper>
            )}

            {/* Col E: Nouveau poste */}
            <TextField size='small' label='Nouveau poste (si changement)' fullWidth value={newAvenant.nouveau_poste || ''} onChange={(e) => setNewAvenant({ ...newAvenant, nouveau_poste: e.target.value })} placeholder='Laisser vide si pas de changement de poste' />
            {/* Col F-G: Salaires */}
            <Stack direction='row' spacing={1.5}>
              <TextField type='number' size='small' label='Salaire ancien (auto)' fullWidth value={newAvenant.salaire_ancien || 0} onChange={(e) => setNewAvenant({ ...newAvenant, salaire_ancien: parseInt(e.target.value) || 0 })} helperText='RECHERCHEX depuis contrat' InputProps={{ readOnly: true }} />
              <TextField type='number' size='small' label='Nouveau salaire' fullWidth value={newAvenant.nouveau_salaire || 0} onChange={(e) => setNewAvenant({ ...newAvenant, nouveau_salaire: parseInt(e.target.value) || 0 })}
                error={Boolean(createErrors.smic)}
                helperText={createErrors.smic || 'Variation: ' + ((newAvenant.nouveau_salaire || 0) - (newAvenant.salaire_ancien || 0) >= 0 ? '+' : '') + formatNumber((newAvenant.nouveau_salaire || 0) - (newAvenant.salaire_ancien || 0)) + ' FCFA'}
              />
            </Stack>
            {/* Col H-I: Temps */}
            <Stack direction='row' spacing={1.5}>
              <TextField size='small' label='Temps ancien (auto)' fullWidth value={newAvenant.temps_ancien || ''} onChange={(e) => setNewAvenant({ ...newAvenant, temps_ancien: e.target.value })} InputProps={{ readOnly: true }} />
              <TextField size='small' label='Nouveau temps (si modif)' fullWidth value={newAvenant.nouveau_temps || ''} onChange={(e) => setNewAvenant({ ...newAvenant, nouveau_temps: e.target.value })} placeholder='ex: 25h/sem, 169h/mois' />
            </Stack>
            {/* Col J: Motif (liste déroulante) */}
            <TextField select size='small' label='Motif' fullWidth value={newAvenant.motif || 'Augmentation'} onChange={(e) => setNewAvenant({ ...newAvenant, motif: e.target.value })}>
              {MOTIFS_AVENANT.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            {/* Col L: Date effet */}
            <TextField type='date' size='small' label='Date effet' fullWidth value={newAvenant.date_effet || new Date().toISOString().slice(0, 10)} onChange={(e) => setNewAvenant({ ...newAvenant, date_effet: e.target.value })} InputLabelProps={{ shrink: true }}
              error={Boolean(createErrors.dateMin || createErrors.dateCoherence)}
              helperText={createErrors.dateMin || createErrors.dateCoherence || 'La date d\'effet doit être postérieure au 01/01/2000'}
            />
            {/* Col O: Notes */}
            <TextField size='small' label='Notes' fullWidth multiline rows={2} value={newAvenant.notes || ''} onChange={(e) => setNewAvenant({ ...newAvenant, notes: e.target.value })} />

            {/* --- Master Prompt section 9 : nouveaux champs optionnels (colonnes P, Q, R) --- */}
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fff8e6', border: '1px solid #f0ad4e40', borderRadius: 1 }}>
              <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.7rem', color: ORANGE, display: 'block', mb: 0.8 }}>
                Clauses optionnelles (Master Prompt Étape 4)
              </Typography>
              <Stack spacing={1.5}>
                <TextField size='small' label='Nouveau lieu de travail (col P)' fullWidth value={newAvenant.nouveau_lieu || ''} onChange={(e) => setNewAvenant({ ...newAvenant, nouveau_lieu: e.target.value })} placeholder='Ex: Yaoundé (si mutation géographique)' helperText="Apparaît comme Article 4 si renseigné" />
                <TextField type='date' size='small' label="Nouvelle date de fin d'essai (col Q)" fullWidth value={newAvenant.nouvelle_fin_essai || ''} onChange={(e) => setNewAvenant({ ...newAvenant, nouvelle_fin_essai: e.target.value })} InputLabelProps={{ shrink: true }} helperText="Apparaît comme Article 5 si renseigné" />
                <TextField size='small' label='Observations spécifiques (col R)' fullWidth multiline rows={2} value={newAvenant.observations_avn || ''} onChange={(e) => setNewAvenant({ ...newAvenant, observations_avn: e.target.value })} placeholder="Ex: Annule et remplace l'avenant précédent..." helperText="Apparaît avant les signatures si renseigné" />
              </Stack>
            </Paper>

            {/* --- Master Prompt section 3.2 : zone récapitulative "Validation avant création" --- */}
            {newAvenant.contract_id && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: createErrors.noChange ? 'rgba(179,58,74,0.06)' : 'rgba(126,63,242,0.05)', border: `1px solid ${createErrors.noChange ? ROUGE : VIOLET}30`, borderRadius: 1 }}>
                <Stack direction='row' spacing={1} alignItems='flex-start'>
                  {createErrors.noChange ? <WarningAmberIcon sx={{ color: ROUGE, fontSize: 18 }} /> : <CheckCircleIcon sx={{ color: VIOLET, fontSize: 18 }} />}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.7rem', color: createErrors.noChange ? ROUGE : VIOLET, display: 'block' }}>
                      {createErrors.noChange ? '⚠️ Validation avant création' : '✅ Validation avant création'}
                    </Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#4a5a6a', display: 'block', mt: 0.3 }}>
                      {createRecap || 'Sélectionnez un contrat pour générer le résumé.'}
                    </Typography>
                    <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                      {'=RECHERCHEX([N° Contrat]; \'6-Suivi Contrats\'!A:A; \'6-Suivi Contrats\'!B:B; "") & " – " & SI([Nouveau salaire]<>[Salaire ancien]; "Augmentation de ..."; "Salaire inchangé") & " – " & SI([Nouveau poste]<>""; "Changement de poste vers ..."; "Poste inchangé")'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Affichage des erreurs de validation */}
            {(createErrors.smic || createErrors.dateCoherence || createErrors.dateMin) && !createErrors.noChange && (
              <Alert severity='warning' sx={{ fontSize: '0.72rem' }}>
                {createErrors.smic || createErrors.dateCoherence || createErrors.dateMin}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button
            variant='contained' startIcon={<AddIcon />}
            disabled={!newAvenant.contract_id || Object.keys(createErrors).length > 0}
            onClick={handleCreate}
            sx={{ bgcolor: VIOLET }}
          >
            Créer (statut: Projet)
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION AVENANT (Master Prompt section 4) === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier — {editDialog?.amendment_number}
          {editDialog && <Chip label={editDialog.statut} size='small' sx={{ ml: 1, fontWeight: 700, fontSize: '0.62rem' }} color={editDialog.statut === 'Archivé' ? 'success' : editDialog.statut === 'Refusé' ? 'error' : 'default'} />}
        </DialogTitle>
        <DialogContent>
          {editDialog && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {/* --- Master Prompt section 4.1 : tableau comparatif "Valeurs enregistrées" --- */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f4f7fc', border: '1px solid #e9edf2', borderRadius: 1 }}>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, display: 'block', mb: 1 }}>
                  Valeurs enregistrées (lecture seule · RECHERCHEX depuis Avenants!A:A)
                </Typography>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#eef3f9' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem', width: '33%' }}>Rubrique</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem', width: '33%' }}>Ancienne valeur (col D/F/H/J/L)</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem', width: '33%' }}>Nouvelle valeur (col E/G/I/J/L)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Poste',        ancien: editDialog.poste_actuel,    nouveau: editDialog.nouveau_poste,    colA: 'D', colN: 'E' },
                      { label: 'Salaire',      ancien: editDialog.salaire_ancien ? `${formatNumber(editDialog.salaire_ancien)} FCFA` : '—', nouveau: editDialog.nouveau_salaire ? `${formatNumber(editDialog.nouveau_salaire)} FCFA` : '—', colA: 'F', colN: 'G' },
                      { label: 'Temps travail', ancien: editDialog.temps_ancien,   nouveau: editDialog.nouveau_temps,    colA: 'H', colN: 'I' },
                      { label: 'Motif',        ancien: '—',                        nouveau: editDialog.motif,             colA: 'J', colN: 'J' },
                      { label: 'Date d\'effet', ancien: '—',                        nouveau: editDialog.date_effet ? formatDate(editDialog.date_effet) : '—', colA: 'L', colN: 'L' },
                    ].map((row, i) => {
                      const isModified = String(row.ancien ?? '') !== String(row.nouveau ?? '') && row.nouveau !== '—';
                      return (
                        <TableRow key={i} hover sx={{ bgcolor: isModified ? 'rgba(26,122,74,0.06)' : 'transparent' }}>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: NAVY }}>{row.label}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>
                            {row.ancien || '—'}
                            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace', display: 'block' }}>col {row.colA}</Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: isModified ? VERT : NAVY }}>
                            {row.nouveau || '—'}
                            <Typography variant='caption' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace', display: 'block' }}>col {row.colN}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                  =RECHERCHEX([N° Avenant]; 'Avenants'!A:A; 'Avenants'!D:D; "Non trouvé"; 0) · =RECHERCHEX([N° Avenant]; 'Avenants'!A:A; 'Avenants'!E:E; "Non trouvé"; 0)
                </Typography>
              </Paper>

              {/* --- Master Prompt section 4.2 : champs modifiables --- */}
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.78rem', color: NAVY, mt: 1 }}>
                Champs modifiables
              </Typography>
              <Stack direction='row' spacing={1.5}>
                <TextField size='small' label='Nouveau poste' fullWidth value={editDialog.nouveau_poste || ''} onChange={(e) => setEditDialog({ ...editDialog, nouveau_poste: e.target.value })} />
                <TextField type='number' size='small' label='Nouveau salaire' fullWidth value={editDialog.nouveau_salaire || 0} onChange={(e) => setEditDialog({ ...editDialog, nouveau_salaire: parseInt(e.target.value) || 0 })}
                  error={Boolean(validateEdit.smic)}
                  helperText={validateEdit.smic || ''}
                />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField size='small' label='Nouveau temps' fullWidth value={editDialog.nouveau_temps || ''} onChange={(e) => setEditDialog({ ...editDialog, nouveau_temps: e.target.value })} />
                <TextField select size='small' label='Motif' fullWidth value={editDialog.motif || ''} onChange={(e) => setEditDialog({ ...editDialog, motif: e.target.value })}>
                  {MOTIFS_AVENANT.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </TextField>
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Date signature' fullWidth value={(editDialog.date_signature || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_signature: e.target.value })} InputLabelProps={{ shrink: true }}
                  error={Boolean(validateEdit.dateCoherence)}
                />
                <TextField type='date' size='small' label='Date effet' fullWidth value={(editDialog.date_effet || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, date_effet: e.target.value })} InputLabelProps={{ shrink: true }}
                  error={Boolean(validateEdit.dateMin || validateEdit.dateCoherence)}
                  helperText={validateEdit.dateMin || ''}
                />
              </Stack>
              <TextField size='small' label='Lien document (PDF signé)' fullWidth value={editDialog.lien_document || ''} onChange={(e) => setEditDialog({ ...editDialog, lien_document: e.target.value })} placeholder='/docs/AVN-2025-XXX.pdf'
                error={Boolean(validateEdit.docFormat)}
                helperText={validateEdit.docFormat || "Le chemin doit commencer par '/docs/'"}
              />
              <TextField size='small' label='Notes' fullWidth multiline rows={2} value={editDialog.notes || ''} onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })} />

              {/* --- Master Prompt section 9 : nouveaux champs optionnels (colonnes P, Q, R) --- */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fff8e6', border: '1px solid #f0ad4e40', borderRadius: 1 }}>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.7rem', color: ORANGE, display: 'block', mb: 0.8 }}>
                  Clauses optionnelles (Master Prompt Étape 4)
                </Typography>
                <Stack spacing={1.5}>
                  <TextField size='small' label='Nouveau lieu de travail (col P)' fullWidth value={editDialog.nouveau_lieu || ''} onChange={(e) => setEditDialog({ ...editDialog, nouveau_lieu: e.target.value })} placeholder='Ex: Yaoundé (si mutation géographique)' helperText="Génère l'Article 4 dans le PDF" />
                  <TextField type='date' size='small' label="Nouvelle date de fin d'essai (col Q)" fullWidth value={(editDialog.nouvelle_fin_essai || '').slice(0, 10)} onChange={(e) => setEditDialog({ ...editDialog, nouvelle_fin_essai: e.target.value })} InputLabelProps={{ shrink: true }} helperText="Génère l'Article 5 dans le PDF" />
                  <TextField size='small' label='Observations spécifiques (col R)' fullWidth multiline rows={2} value={editDialog.observations_avn || ''} onChange={(e) => setEditDialog({ ...editDialog, observations_avn: e.target.value })} placeholder="Ex: Annule et remplace l'avenant précédent..." helperText="Affiché avant les signatures dans le PDF" />
                </Stack>
              </Paper>

              {/* Erreurs de validation globales */}
              {Object.keys(validateEdit).length > 0 && (
                <Alert severity='warning' sx={{ fontSize: '0.72rem' }} icon={<WarningAmberIcon />}>
                  {Object.values(validateEdit).map((e, i) => <div key={i}>• {e}</div>)}
                </Alert>
              )}

              {/* --- Master Prompt section 4.3 : historique des modifications (masquable) --- */}
              <Paper elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
                <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between' sx={{ p: 1, cursor: 'pointer' }} onClick={() => setShowAudit(!showAudit)}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <HistoryIcon sx={{ fontSize: 16, color: VIOLET }} />
                    <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY }}>
                      Historique des modifications (Avenants_Audit)
                    </Typography>
                    <Chip label={`${getAuditHistory(editDialog.id).length} entrée(s)`} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: 'rgba(126,63,242,0.1)', color: VIOLET, fontWeight: 700 }} />
                  </Stack>
                  <IconButton size='small'>{showAudit ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}</IconButton>
                </Stack>
                <Collapse in={showAudit}>
                  <Box sx={{ p: 1, borderTop: '1px solid #e9edf2' }}>
                    {getAuditHistory(editDialog.id).length === 0 ? (
                      <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#9aa8b8', display: 'block', textAlign: 'center', py: 1 }}>
                        Aucune modification enregistrée pour cet avenant.
                      </Typography>
                    ) : (
                      <Table size='small'>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.6rem' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.6rem' }}>Champ</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.6rem' }}>Ancien</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.6rem' }}>Nouveau</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.6rem' }}>Utilisateur</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getAuditHistory(editDialog.id).map((h, i) => (
                            <TableRow key={i} hover>
                              <TableCell sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>{new Date(h.timestamp).toLocaleString('fr-FR')}</TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{h.champ}</TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>{String(h.ancienne_valeur).slice(0, 30) || '—'}</TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', color: VERT, fontWeight: 600 }}>{String(h.nouvelle_valeur).slice(0, 30) || '—'}</TableCell>
                              <TableCell sx={{ fontSize: '0.65rem' }}>{h.utilisateur}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                </Collapse>
              </Paper>

              {/* --- Master Prompt section 5.2 : workflow boutons d'action --- */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#faf5ff', border: `1px solid ${VIOLET}30`, borderRadius: 1 }}>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, display: 'block', mb: 1 }}>
                  Workflow de statut (boutons d'action avec horodatage)
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    size='small' variant='outlined' startIcon={<MailIcon />}
                    disabled={editDialog.statut !== 'Projet'}
                    onClick={() => handleWorkflow(editDialog, 'envoyer')}
                    sx={{ textTransform: 'none', fontSize: '0.7rem', color: BLEU, borderColor: BLEU }}
                  >📨 Envoyer</Button>
                  <Button
                    size='small' variant='outlined' startIcon={<EditIcon />}
                    disabled={editDialog.statut !== 'Envoyé au salarié'}
                    onClick={() => handleWorkflow(editDialog, 'signer')}
                    sx={{ textTransform: 'none', fontSize: '0.7rem', color: ORANGE, borderColor: ORANGE }}
                  >✍️ Signer</Button>
                  <Button
                    size='small' variant='outlined' startIcon={<ArchiveIcon />}
                    disabled={editDialog.statut !== 'Signé'}
                    onClick={() => handleWorkflow(editDialog, 'archiver')}
                    sx={{ textTransform: 'none', fontSize: '0.7rem', color: VERT, borderColor: VERT }}
                  >📁 Archiver</Button>
                  <Button
                    size='small' variant='outlined' startIcon={<CancelIcon />}
                    disabled={editDialog.statut === 'Archivé' || editDialog.statut === 'Refusé'}
                    onClick={() => handleWorkflow(editDialog, 'refuser')}
                    sx={{ textTransform: 'none', fontSize: '0.7rem', color: ROUGE, borderColor: ROUGE }}
                  >❌ Refuser</Button>
                </Stack>
                <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block', mt: 0.8 }}>
                  Statut actuel: <strong>{editDialog.statut}</strong> · {editDialog.statut === 'Projet' && 'Disponible: Envoyer, Refuser'}
                  {editDialog.statut === 'Envoyé au salarié' && 'Disponible: Signer, Refuser'}
                  {editDialog.statut === 'Signé' && 'Disponible: Archiver (déclenche le bouclage automatique du contrat)'}
                  {editDialog.statut === 'Archivé' && 'Workflow terminé — contrat mis à jour'}
                  {editDialog.statut === 'Refusé' && 'Workflow terminé'}
                </Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Annuler</Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleSaveEdit} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG REFUS AVEC MOTIF OBLIGATOIRE (Master Prompt section 5.2) === */}
      <Dialog open={Boolean(refuseDialog)} onClose={() => setRefuseDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color='error' /> Refus de l'avenant {refuseDialog?.avenant?.amendment_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity='warning' sx={{ fontSize: '0.75rem' }} icon={<WarningAmberIcon />}>
              Vous êtes sur le point de refuser cet avenant. Un <strong>motif de refus</strong> est obligatoire pour la traçabilité (ISO 30401:2018).
            </Alert>
            <TextField
              autoFocus size='small' label='Motif de refus (obligatoire)' fullWidth multiline rows={3}
              value={refuseDialog?.motif || ''}
              onChange={(e) => setRefuseDialog({ ...refuseDialog, motif: e.target.value })}
              placeholder='Ex: Refus du salarié, conditions non acceptées, erreur de saisie...'
              error={Boolean(refuseDialog?.motif && refuseDialog.motif.trim().length < 5)}
              helperText="Minimum 5 caractères — sera enregistré dans l'audit trail"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRefuseDialog(null)}>Annuler</Button>
          <Button variant='contained' color='error' startIcon={<CancelIcon />} onClick={handleConfirmRefuse} disabled={!refuseDialog?.motif || refuseDialog.motif.trim().length < 5}>
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4500} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
