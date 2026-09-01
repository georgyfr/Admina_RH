import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper,
  Drawer, Divider, IconButton, TextField, Avatar, Alert, Snackbar,
  Stack, InputAdornment, Badge, Menu, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Popover, Fade
} from '@mui/material';
import {
  Add, Download, Close, Save, Edit, CalendarToday, Person,
  AccountBalanceWallet, Publish, Campaign, ArrowForward, Work,
  Create, Groups, AccessTime, Visibility, Delete, Archive,
  MoreVert, CheckCircle, KeyboardArrowDown, WarningAmber,
  Search, SearchOff, FilterListOff, AutoAwesome, DragIndicator
} from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import NouvelleOffreStepper from '../components/NouvelleOffreStepper';
import JobStudioModal from '../components/JobStudioModal';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '\u2014' : a.toLocaleString('fr-FR') + ' FCFA';

/* \u2550\u2550\u2550 HOOK DEBOUNCE \u2550\u2550\u2550 */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ═══ COULEURS ═══ */
const statutOffreColor = {
  'A creer': 'default',
  'Publiee': 'primary',
  'Candidatures en cours': 'warning',
  'Cloturee': 'success',
  'Annulee': 'error',
};
const prioriteColor = {
  'Urgente': 'error',
  'Haute': 'warning',
  'Moyenne': 'info',
  'Basse': 'default',
};

/* ═══ DONNÉES INITIALES ═══ */
const initialData = [
  { id: 1, numero: 'OF-2025-001', intitule: 'Chef Cuisinier', departement: 'Restauration', typePoste: 'Cadre', typeContrat: 'CDI',
    canalDiffusion: 'Site web', statutOffre: 'Publiee', datePublication: '20/01/2025', dateCloture: '20/02/2025',
    dateRequise: '01/02/2025', responsable: 'M. Nkoulou Paul', roleResponsable: 'DRH',
    priorite: 'Urgente', budgetAlloue: 500000, salaireMin: 350000, salaireMax: 450000,
    nbCandidatures: 12, nbCandidaturesRecues: 8,
    candidatsAssocies: [
      { nom: 'Kamga Marie', score: 17, etatCandidature: 'Entretien realise', source: 'Cabinet' },
      { nom: 'Tchinda Jean', score: 14, etatCandidature: 'En cours d\'etude', source: 'Site web' },
      { nom: 'Fotso Anne', score: 19, etatCandidature: 'Retenu', source: 'Cooptation' },
    ],
    description: 'Recherchons un Chef Cuisinier experimente pour diriger la brigade de cuisine de l\'Hotel Sawa. Experience minimale 5 ans en hotellerie.',
    historique: [
      { date: '15/01/2025', evenement: 'Offre creee a partir de la demande DR-2025-001', auteur: 'M. Nkoulou Paul', type: 'creation' },
      { date: '20/01/2025', evenement: 'Offre publiee sur le site web', auteur: 'DRH', type: 'publication' },
      { date: '25/01/2025', evenement: '8 candidatures recues', auteur: 'Systeme', type: 'candidature' },
    ],
    site: 'Hotel Sawa',
  },
  { id: 2, numero: 'OF-2025-002', intitule: 'Responsable Marketing', departement: 'Marketing & Communication', typePoste: 'Cadre', typeContrat: 'CDI',
    canalDiffusion: 'LinkedIn', statutOffre: 'Candidatures en cours', datePublication: '01/02/2025', dateCloture: '15/03/2025',
    dateRequise: '01/04/2025', responsable: 'Mme. Mbarga Sophie', roleResponsable: 'Directrice Marketing',
    priorite: 'Haute', budgetAlloue: 800000, salaireMin: 600000, salaireMax: 750000,
    nbCandidatures: 25, nbCandidaturesRecues: 18,
    candidatsAssocies: [
      { nom: 'Nganou Yves', score: 15, etatCandidature: 'Entretien planifie', source: 'LinkedIn' },
      { nom: 'Epoh Clarisse', score: 16, etatCandidature: 'Entretien realise', source: 'Reseaux sociaux' },
    ],
    description: 'Poste de responsable pour piloter la strategie marketing digitale et traditionnelle du groupe. Competences en SEO/SEM requises.',
    historique: [
      { date: '28/01/2025', evenement: 'Offre creee', auteur: 'Mme. Mbarga Sophie', type: 'creation' },
      { date: '01/02/2025', evenement: 'Publication LinkedIn + Facebook', auteur: 'DRH', type: 'publication' },
    ],
    site: 'Siege (Douala)',
  },
  { id: 3, numero: 'OF-2025-003', intitule: 'Technicien de Maintenance', departement: 'Maintenance', typePoste: 'Agent de maitrise', typeContrat: 'CDI',
    canalDiffusion: 'Presse ecrite', statutOffre: 'Cloturee', datePublication: '10/01/2025', dateCloture: '10/02/2025',
    dateRequise: '01/03/2025', responsable: 'M. Essomba Andre', roleResponsable: 'Chef de Departement',
    priorite: 'Moyenne', budgetAlloue: 250000, salaireMin: 180000, salaireMax: 220000,
    nbCandidatures: 30, nbCandidaturesRecues: 30,
    candidatsAssocies: [
      { nom: 'Ngo Meli Patrick', score: 13, etatCandidature: 'Retenu', source: 'Presse ecrite' },
      { nom: 'Happi Brice', score: 11, etatCandidature: 'Refuse', source: 'Candidature spontanee' },
      { nom: 'Tcheumeni Kevin', score: 12, etatCandidature: 'En reserve', source: 'Presse ecrite' },
    ],
    description: 'Technicien polyvalent pour la maintenance courante des equipements hoteliers. CAGEC ou equivalent requis.',
    historique: [
      { date: '05/01/2025', evenement: 'Offre creee', auteur: 'M. Essomba Andre', type: 'creation' },
      { date: '10/01/2025', evenement: 'Publication presse', auteur: 'DRH', type: 'publication' },
      { date: '10/02/2025', evenement: 'Cloture de l\'offre - 30 candidatures', auteur: 'Systeme', type: 'cloture' },
      { date: '20/02/2025', evenement: 'Candidat retenu : Ngo Meli Patrick', auteur: 'DRH', type: 'selection' },
    ],
    site: 'Annexe (Yaounde)',
  },
  { id: 4, numero: 'OF-2025-004', intitule: 'Receptionniste Nuit', departement: 'Herbergement', typePoste: 'Operationnel', typeContrat: 'CDD',
    canalDiffusion: 'Site web', statutOffre: 'Publiee', datePublication: '15/02/2025', dateCloture: '15/03/2025',
    dateRequise: '01/03/2025', responsable: 'M. Nkoulou Paul', roleResponsable: 'DRH',
    priorite: 'Haute', budgetAlloue: 200000, salaireMin: 150000, salaireMax: 180000,
    nbCandidatures: 8, nbCandidaturesRecues: 5,
    candidatsAssocies: [
      { nom: 'Kouamo Lea', score: 14, etatCandidature: 'En cours d\'etude', source: 'Site web' },
    ],
    description: 'Receptionniste pour le service de nuit a l\'Hotel Sawa. Anglais courant indispensable.',
    historique: [
      { date: '12/02/2025', evenement: 'Offre creee', auteur: 'M. Nkoulou Paul', type: 'creation' },
      { date: '15/02/2025', evenement: 'Publication site web', auteur: 'DRH', type: 'publication' },
    ],
    site: 'Hotel Sawa',
  },
  { id: 5, numero: 'OF-2025-005', intitule: 'Developpeur Full-Stack', departement: 'Informatique', typePoste: 'Cadre', typeContrat: 'CDI',
    canalDiffusion: 'LinkedIn', statutOffre: 'A creer', datePublication: '', dateCloture: '',
    dateRequise: '01/04/2025', responsable: 'M. Tchinda Rene', roleResponsable: 'DSI',
    priorite: 'Urgente', budgetAlloue: 1200000, salaireMin: 900000, salaireMax: 1100000,
    nbCandidatures: 0, nbCandidaturesRecues: 0,
    candidatsAssocies: [],
    description: 'Developpeur Full-Stack pour le projet de transformation digitale. React, Node.js, PostgreSQL requis.',
    historique: [
      { date: '25/02/2025', evenement: 'Offre en cours de redaction', auteur: 'M. Tchinda Rene', type: 'creation' },
    ],
    site: 'Siege (Douala)',
  },
  { id: 6, numero: 'OF-2025-006', intitule: 'Agent de Securite', departement: 'Securite', typePoste: 'Operationnel', typeContrat: 'CDI',
    canalDiffusion: 'Affichage', statutOffre: 'Annulee', datePublication: '', dateCloture: '',
    dateRequise: '01/03/2025', responsable: 'M. Fotso Victor', roleResponsable: 'Chef de Service Securite',
    priorite: 'Basse', budgetAlloue: 150000, salaireMin: 120000, salaireMax: 140000,
    nbCandidatures: 0, nbCandidaturesRecues: 0,
    candidatsAssocies: [],
    description: 'Poste annule - reorganisation du service de securite interne.',
    historique: [
      { date: '10/02/2025', evenement: 'Offre creee', auteur: 'M. Fotso Victor', type: 'creation' },
      { date: '18/02/2025', evenement: 'Offre annulee - reorganisation', auteur: 'DSI', type: 'annulation' },
    ],
    site: 'Siege (Douala)',
  },
  { id: 7, numero: 'OF-2025-007', intitule: 'Comptable Senior', departement: 'Finance & Comptabilite', typePoste: 'Cadre', typeContrat: 'CDI',
    canalDiffusion: 'Cabinet', statutOffre: 'Candidatures en cours', datePublication: '05/02/2025', dateCloture: '05/04/2025',
    dateRequise: '01/05/2025', responsable: 'Mme. Ngassa Clarisse', roleResponsable: 'Directrice Financiere',
    priorite: 'Haute', budgetAlloue: 700000, salaireMin: 500000, salaireMax: 650000,
    nbCandidatures: 15, nbCandidaturesRecues: 9,
    candidatsAssocies: [
      { nom: 'Djoumessi Franck', score: 18, etatCandidature: 'Entretien realise', source: 'Cabinet' },
      { nom: 'Mbassi Carine', score: 15, etatCandidature: 'En cours d\'etude', source: 'Cabinet' },
      { nom: 'Atangana Paul', score: 16, etatCandidature: 'Entretien planifie', source: 'LinkedIn' },
    ],
    description: 'Comptable avec experience en hotellerie/tourisme. Maitrise de Sage comptable et Excel avance.',
    historique: [
      { date: '01/02/2025', evenement: 'Offre creee', auteur: 'Mme. Ngassa Clarisse', type: 'creation' },
      { date: '05/02/2025', evenement: 'Mandat confie au cabinet HRC Cameroon', auteur: 'DRH', type: 'cabinet' },
    ],
    site: 'Siege (Douala)',
  },
  { id: 8, numero: 'OF-2025-008', intitule: 'Plongeur', departement: 'Restauration', typePoste: 'Operationnel', typeContrat: 'CDD',
    canalDiffusion: 'Affichage', statutOffre: 'Cloturee', datePublication: '01/01/2025', dateCloture: '15/01/2025',
    dateRequise: '01/02/2025', responsable: 'M. Nkoulou Paul', roleResponsable: 'DRH',
    priorite: 'Moyenne', budgetAlloue: 100000, salaireMin: 75000, salaireMax: 90000,
    nbCandidatures: 20, nbCandidaturesRecues: 20,
    candidatsAssocies: [
      { nom: 'Mbane Joseph', score: null, etatCandidature: 'Retenu', source: 'Affichage' },
    ],
    description: 'Plongeur pour la cuisine de l\'Hotel Sawa. Aucune qualification requise.',
    historique: [
      { date: '28/12/2024', evenement: 'Offre creee', auteur: 'M. Nkoulou Paul', type: 'creation' },
      { date: '01/01/2025', evenement: 'Publication par affichage', auteur: 'DRH', type: 'publication' },
      { date: '15/01/2025', evenement: 'Cloture - candidat retenu', auteur: 'DRH', type: 'cloture' },
    ],
    site: 'Hotel Sawa',
  },
];

/* ═══ RESPONSABLES AVEC AVATARS ═══ */
const responsablesList = [
  { nom: 'M. Nkoulou Paul', role: 'DRH', initials: 'NP', color: '#0D7C66' },
  { nom: 'Mme. Mbarga Sophie', role: 'Directrice Marketing', initials: 'MS', color: '#1976d2' },
  { nom: 'M. Essomba Andre', role: 'Chef de Departement', initials: 'EA', color: '#f57c00' },
  { nom: 'M. Tchinda Rene', role: 'DSI', initials: 'TR', color: '#7b1fa2' },
  { nom: 'M. Fotso Victor', role: 'Chef de Service Securite', initials: 'FV', color: '#c62828' },
  { nom: 'Mme. Ngassa Clarisse', role: 'Directrice Financiere', initials: 'NC', color: '#00838f' },
];

/* ═══ HISTOIRE COLORS ═══ */
const histColor = {
  creation: '#1976d2', publication: '#0D7C66', candidature: '#f57c00',
  cloture: '#9e9e9e', selection: '#2e7d32', annulation: '#d32f2f', cabinet: '#7b1fa2',
  modification: '#0288d1',
};

/* ═══ CANDIDAT STATE COLOR ═══ */
const candidatEtatColor = {
  'Entretien planifie': 'info',
  'Entretien realise': 'warning',
  'En cours d\'etude': 'default',
  'Retenu': 'success',
  'Refuse': 'error',
  'En reserve': 'default',
};

/* ═══ STATUTS DANGEREUX (nécessitent confirmation) ═══ */
const dangerousStatuses = ['Annulee', 'Cloturee'];

/* ═══ COMPOSANT QUICK STATUS CHIP MENU ═══ */
function StatusChipMenu({ offre, onStatutChange, loadingId, loadingStatut }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmAnchor, setConfirmAnchor] = useState(null);
  const [pendingStatut, setPendingStatut] = useState(null);
  const open = Boolean(anchorEl);
  const isLoading = loadingId === offre.id;
  const currentColor = statutOffreColor[offre.statutOffre] || 'default';

  const handleClick = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = () => { setAnchorEl(null); setConfirmAnchor(null); setPendingStatut(null); };

  const handleSelect = (e, newStatut) => {
    e.stopPropagation();
    setAnchorEl(null);
    if (newStatut === offre.statutOffre) return;
    if (dangerousStatuses.includes(newStatut)) { setPendingStatut(newStatut); setConfirmAnchor(e.currentTarget); return; }
    onStatutChange(offre.id, newStatut);
  };

  const handleConfirm = (e) => {
    e.stopPropagation(); setConfirmAnchor(null);
    if (pendingStatut) { onStatutChange(offre.id, pendingStatut); setPendingStatut(null); }
  };
  const handleCancelConfirm = (e) => { e.stopPropagation(); setConfirmAnchor(null); setPendingStatut(null); };

  const statusDotColor = { 'A creer': '#9e9e9e', 'Publiee': '#2e7d32', 'Candidatures en cours': '#f57f17', 'Cloturee': '#616161', 'Annulee': '#d32f2f' };

  const chipEl = (
    <Chip
      icon={isLoading ? <CircularProgress size={14} sx={{ color: 'inherit', ml: 0.5 }} /> : undefined}
      label={isLoading && loadingStatut ? loadingStatut : offre.statutOffre}
      color={isLoading ? 'default' : currentColor}
      size="small" onClick={handleClick} onDelete={handleClick}
      deleteIcon={<KeyboardArrowDown sx={{ fontSize: 16, color: 'inherit' }} />}
      sx={{ fontWeight: 600, height: 26, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
      aria-expanded={open} aria-haspopup="true" role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
    />
  );

  const menuEl = (
    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
      PaperProps={{ sx: { minWidth: 200, py: 0.5, borderRadius: 2 } }} transitionDuration={150}
    >
      <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>Changer le statut</Typography>
      {nomenclatures.statut_offre.map(s => {
        const isActive = s === offre.statutOffre;
        const dot = statusDotColor[s] || '#9e9e9e';
        return (
          <MenuItem key={s} value={s} onClick={(e) => handleSelect(e, s)} selected={isActive} disabled={isActive}
            sx={{ py: 0.8, px: 1.5, gap: 1.5, fontSize: '0.85rem' }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
            {s}
            {isActive && <CheckCircle sx={{ fontSize: 16, ml: 'auto', color: '#1976d2' }} />}
          </MenuItem>
        );
      })}
    </Menu>
  );

  const confirmMsg = pendingStatut === 'Annulee' ? 'Etes-vous sur de vouloir annuler cette offre ?' : 'Etes-vous sur de vouloir clore cette offre ?';
  const confirmBtnColor = pendingStatut === 'Annulee' ? '#d32f2f' : '#616161';

  const popoverEl = (
    <Popover anchorEl={confirmAnchor} open={Boolean(confirmAnchor)} onClose={handleCancelConfirm}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      PaperProps={{ sx: { borderRadius: 2, p: 2, maxWidth: 280 } }} disablePortal
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <WarningAmber sx={{ fontSize: 20, color: pendingStatut === 'Annulee' ? '#d32f2f' : '#f57f17' }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>Confirmer le changement</Typography>
      </Box>
      <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>{confirmMsg}</Typography>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={handleCancelConfirm} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Annuler</Button>
        <Button size="small" variant="contained" onClick={handleConfirm} sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, bgcolor: confirmBtnColor }}>Confirmer</Button>
      </Box>
    </Popover>
  );

  return <>{chipEl}{menuEl}{popoverEl}</>;
}

/* ═══ COMPOSANT QUICK ACTION BUTTONS (ligne) ═══ */
function QuickActions({ offre, onView, onArchive, onDelete }) {
  return (
    <Stack direction="row" spacing={0.3} onClick={e => e.stopPropagation()}>
      <Tooltip title="Voir / Editer" arrow placement="top">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onView(offre); }}
          sx={{ color: '#1976d2', '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}
          aria-label={`Voir l'offre ${offre.numero}`}
        >
          <Visibility sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Archiver" arrow placement="top">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onArchive(offre); }}
          sx={{ color: '#f57f17', '&:hover': { bgcolor: 'rgba(245,127,23,0.08)' } }}
          aria-label={`Archiver l'offre ${offre.numero}`}
        >
          <Archive sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Supprimer" arrow placement="top">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(offre); }}
          sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
          aria-label={`Supprimer l'offre ${offre.numero}`}
        >
          <Delete sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/* ═══ TABLEAU COLONNES ═══ */


const INITIAL_TABLE_COLS = [
  { key: 'numero', label: 'N° Offre', width: 110 },
  { key: 'datePublication', label: 'Publication', width: 95 },
  { key: 'departement', label: 'Département', width: 145, chip: true },
  { key: 'intitule', label: 'Intitulé du Poste', width: 200 },
  { key: 'canalDiffusion', label: 'Canal', width: 110 },
  { key: 'nbCandidaturesRecues', label: 'Candidatures', width: 90 },
  { key: 'responsable', label: 'Responsable', width: 150 },
];

/* ═══ COMPOSANT CHAMP ÉDITABLE ═══ */
function EditableField({ label, value, type = 'text', editKey, editing, onEdit, onChange, options, disabled, endAdornment, multiline }) {
  if (type === 'select') {
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
          {!disabled && <Edit sx={{ fontSize: 13, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => onEdit(editKey)} />}
        </Box>
        <FormControl size="small" fullWidth disabled={disabled}>
          <Select
            value={value || ''}
            onChange={e => onChange(editKey, e.target.value)}
            sx={{
              bgcolor: editing === editKey ? '#fffde7' : 'transparent',
              '& .MuiSelect-select': { fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 },
              transition: 'background-color 0.2s',
            }}
            renderValue={(v) => (
              <Chip
                label={v}
                size="small"
                color={options?.colorMap?.[v] || 'default'}
                sx={{ fontWeight: 600, height: 26, fontSize: '0.78rem' }}
              />
            )}
          >
            {(options?.list || []).map(opt => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  if (type === 'date') {
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
          {!disabled && <Edit sx={{ fontSize: 13, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => onEdit(editKey)} />}
        </Box>
        <TextField
          size="small"
          type="date"
          fullWidth
          value={value || ''}
          onChange={e => onChange(editKey, e.target.value)}
          disabled={disabled}
          InputProps={{
            startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: 'action.active' }} /></InputAdornment>,
            sx: { fontSize: '0.85rem' },
          }}
          sx={{
            '& input': { fontSize: '0.85rem' },
            bgcolor: editing === editKey ? '#fffde7' : 'transparent',
            transition: 'background-color 0.2s',
          }}
        />
      </Box>
    );
  }

  if (type === 'number') {
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
          {!disabled && <Edit sx={{ fontSize: 13, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => onEdit(editKey)} />}
        </Box>
        <TextField
          size="small"
          type="number"
          fullWidth
          value={value ?? ''}
          onChange={e => onChange(editKey, e.target.value ? Number(e.target.value) : '')}
          disabled={disabled}
          InputProps={{
            endAdornment: endAdornment ? <InputAdornment position="end">{endAdornment}</InputAdornment> : null,
            sx: { fontSize: '0.85rem' },
            inputProps: { min: 0 },
          }}
          sx={{
            '& input': { fontSize: '0.85rem' },
            bgcolor: editing === editKey ? '#fffde7' : 'transparent',
            transition: 'background-color 0.2s',
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
        {!disabled && <Edit sx={{ fontSize: 13, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => onEdit(editKey)} />}
      </Box>
      <TextField
        size="small"
        fullWidth
        value={value || ''}
        onChange={e => onChange(editKey, e.target.value)}
        disabled={disabled}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        sx={{
          '& textarea, & input': { fontSize: '0.85rem' },
          bgcolor: editing === editKey ? '#fffde7' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      />
    </Box>
  );
}

/* ═══ DRAWER D'ÉDITION INTERACTIVE ═══ */
function OffreDrawer({ offre, open, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  /* Synchroniser le formulaire quand l'offre change */
  useEffect(() => {
    if (offre) {
      setForm({
        numero: offre.numero,
        intitule: offre.intitule,
        departement: offre.departement,
        dateRequise: offre.dateRequise,
        datePublication: offre.datePublication,
        dateCloture: offre.dateCloture,
        priorite: offre.priorite,
        statutOffre: offre.statutOffre,
        responsable: offre.responsable,
        roleResponsable: offre.roleResponsable,
        typeContrat: offre.typeContrat,
        typePoste: offre.typePoste,
        canalDiffusion: offre.canalDiffusion,
        budgetAlloue: offre.budgetAlloue,
        salaireMin: offre.salaireMin,
        salaireMax: offre.salaireMax,
        description: offre.description,
        site: offre.site,
      });
      setHasChanges(false);
      setEditing(null);
    }
  }, [offre]);

  if (!offre) return null;

  const d = offre;

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const handleEdit = (key) => setEditing(key);

  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(d.id, form);
      setHasChanges(false);
      setEditing(null);
    }
  };

  const handleCancel = () => {
    /* Restaurer les valeurs originales */
    setForm({
      numero: d.numero, intitule: d.intitule, departement: d.departement,
      dateRequise: d.dateRequise, datePublication: d.datePublication, dateCloture: d.dateCloture,
      priorite: d.priorite, statutOffre: d.statutOffre, responsable: d.responsable,
      roleResponsable: d.roleResponsable, typeContrat: d.typeContrat, typePoste: d.typePoste,
      canalDiffusion: d.canalDiffusion, budgetAlloue: d.budgetAlloue,
      salaireMin: d.salaireMin, salaireMax: d.salaireMax, description: d.description, site: d.site,
    });
    setHasChanges(false);
    setEditing(null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ BackdropProps: { sx: { bgcolor: 'rgba(0,0,0,0.25)' } } }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 560 },
          display: 'flex',
          flexDirection: 'column',
          p: 0,
        }
      }}
    >
      {/* ═══ EN-TÊTE ═══ */}
      <Box sx={{
        p: 2.5, pb: 2,
        background: 'linear-gradient(135deg, #1565c0 0%, #0D7C66 100%)',
        color: 'white', flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.5, fontSize: '0.7rem' }}>Détails et Édition</Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.3, lineHeight: 1.2, fontSize: '1.15rem' }}>{d.numero}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9, fontSize: '0.85rem' }}>
              Poste : <Box component="span" fontWeight="bold">{form.intitule}</Box> | Département : <Box component="span" fontWeight="bold">{form.departement}</Box>
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', ml: 1 }}><Close /></IconButton>
        </Box>
      </Box>

      {/* ═══ CONTENU SCROLLABLE ═══ */}
      <Box sx={{ overflow: 'auto', flex: 1, px: 3, py: 2.5 }}>

        {/* ─── SECTION 1 : INFORMATIONS CLÉS ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
          <Work sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>Informations Clés</Typography>
        </Box>

        {/* N° Offre (lecture seule) */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>N° d'offre</Typography>
          </Box>
          <TextField
            size="small" fullWidth value={form.numero || ''} disabled
            sx={{ '& input': { fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }, '& .MuiOutlinedInput-root.Mui-disabled': { bgcolor: '#f5f5f5' } }}
          />
        </Box>

        <EditableField label="Date requise" value={form.dateRequise} editKey="dateRequise" editing={editing} onEdit={handleEdit} onChange={handleChange} type="date" />
        <EditableField label="Date de publication" value={form.datePublication} editKey="datePublication" editing={editing} onEdit={handleEdit} onChange={handleChange} type="date" />
        <EditableField label="Date de clôture" value={form.dateCloture} editKey="dateCloture" editing={editing} onEdit={handleEdit} onChange={handleChange} type="date" />
        <EditableField label="Département" value={form.departement} editKey="departement" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.departement }} />
        <EditableField label="Intitulé du Poste" value={form.intitule} editKey="intitule" editing={editing} onEdit={handleEdit} onChange={handleChange} />
        <EditableField label="Type de poste" value={form.typePoste} editKey="typePoste" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.type_poste }} />
        <EditableField label="Type de contrat" value={form.typeContrat} editKey="typeContrat" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.type_contrat }} />
        <EditableField label="Site" value={form.site} editKey="site" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.site }} />

        <Divider sx={{ my: 2.5 }} />

        {/* ─── PRIORITÉ & STATUT ─── */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <EditableField label="Priorité" value={form.priorite} editKey="priorite" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
              options={{ list: nomenclatures.priorite, colorMap: prioriteColor }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <EditableField label="Statut" value={form.statutOffre} editKey="statutOffre" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
              options={{ list: nomenclatures.statut_offre, colorMap: statutOffreColor }} />
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* ─── SECTION 2 : RESPONSABLE & BUDGET ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
          <Person sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>Responsable & Budget</Typography>
        </Box>

        <EditableField label="Responsable" value={form.responsable} editKey="responsable" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: responsablesList.map(r => r.nom) }} />
        <EditableField label="Rôle" value={form.roleResponsable} editKey="roleResponsable" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.role_responsable }} />

        <EditableField label="Budget alloué" value={form.budgetAlloue} editKey="budgetAlloue" editing={editing} onEdit={handleEdit} onChange={handleChange} type="number"
          endAdornment="FCFA" />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <EditableField label="Salaire Min" value={form.salaireMin} editKey="salaireMin" editing={editing} onEdit={handleEdit} onChange={handleChange} type="number"
              endAdornment="FCFA" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <EditableField label="Salaire Max" value={form.salaireMax} editKey="salaireMax" editing={editing} onEdit={handleEdit} onChange={handleChange} type="number"
              endAdornment="FCFA" />
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* ─── CANAL DE DIFFUSION ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
          <Campaign sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>Diffusion</Typography>
        </Box>
        <EditableField label="Canal de diffusion" value={form.canalDiffusion} editKey="canalDiffusion" editing={editing} onEdit={handleEdit} onChange={handleChange} type="select"
          options={{ list: nomenclatures.canal_diffusion }} />
        <EditableField label="Description de l'offre" value={form.description} editKey="description" editing={editing} onEdit={handleEdit} onChange={handleChange} multiline />

        <Divider sx={{ my: 2.5 }} />

        {/* ─── SECTION 3 : CANDIDATURES LIÉES ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Groups sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>Candidatures liées</Typography>
            <Badge badgeContent={d.candidatsAssocies?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }} />
          </Box>
          <Chip label={`${d.nbCandidaturesRecues} / ${d.nbCandidatures} reçues`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
        </Box>

        {d.candidatsAssocies?.length > 0 ? (
          <Paper variant="outlined" sx={{ mb: 1 }}>
            {d.candidatsAssocies.map((c, i) => {
              const scoreColor = c.score === null ? 'default' : c.score >= 16 ? 'success' : c.score >= 12 ? 'warning' : 'error';
              const etatC = candidatEtatColor[c.etatCandidature] || 'default';
              return (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                  borderBottom: i < d.candidatsAssocies.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                }}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: '0.75rem', bgcolor: '#1976d2' }}>
                    {c.nom.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{c.nom}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                      <Chip label={c.etatCandidature} size="small" color={etatC} sx={{ height: 20, fontSize: '0.65rem' }} />
                      <Chip label={c.source} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: scoreColor === 'success' ? '#2e7d32' : scoreColor === 'warning' ? '#f57f17' : scoreColor === 'error' ? '#d32f2f' : 'text.primary', fontSize: '0.9rem' }}>
                      {c.score !== null ? `${c.score}/20` : '\u2014'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>Score</Typography>
                  </Box>
                  <Tooltip title="Voir le profil">
                    <IconButton size="small"><ArrowForward sx={{ fontSize: 16 }} /></IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Aucune candidature associée</Typography>
          </Paper>
        )}

        <Divider sx={{ my: 2.5 }} />

        {/* ─── HISTORIQUE ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
          <AccessTime sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>Historique</Typography>
          <Badge badgeContent={d.historique?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }} />
        </Box>
        {d.historique?.length > 0 ? (
          <Box sx={{ position: 'relative', ml: 1.5, pl: 3, borderLeft: '2px solid #e0e0e0' }}>
            {d.historique.map((h, i) => (
              <Box key={i} sx={{ position: 'relative', pb: i < d.historique.length - 1 ? 2 : 0 }}>
                <Box sx={{
                  position: 'absolute', left: -25, top: 2, width: 12, height: 12,
                  borderRadius: '50%',
                  bgcolor: histColor[h.type] || '#9e9e9e',
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px ' + (histColor[h.type] || '#9e9e9e'),
                }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{h.date}</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{h.evenement}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>par {h.auteur}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Aucun historique</Typography>
        )}

      </Box>

      {/* ═══ FOOTER ═══ */}
      <Box sx={{
        p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <Button
          color="inherit" onClick={handleCancel} disabled={!hasChanges}
          sx={{ textTransform: 'none', fontSize: '0.85rem' }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={<Save sx={{ fontSize: 18 }} />}
          onClick={handleSave}
          disabled={!hasChanges}
          sx={{
            textTransform: 'none', fontSize: '0.85rem', fontWeight: 600,
            bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
          }}
        >
          Enregistrer les modifications
        </Button>
      </Box>
    </Drawer>
  );
}

/* ═══ PAGE PRINCIPALE ═══ */
export default function Offres() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [filterDep, setFilterDep] = useState('Tous');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterCanal, setFilterCanal] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [drawerOffre, setDrawerOffre] = useState(null);
  const [snack, setSnack] = useState(null);
  /* Quick Actions states */
  const [loadingStatus, setLoadingStatus] = useState({ id: null, statut: null });
  const [confirmDlg, setConfirmDlg] = useState(null); /* { type: 'archive'|'delete', offre: {...} } */

  /* ═══ RECHERCHE & FILTRES AVANCÉS ═══ */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedQuery = useDebounce(searchQuery, 250);
  const isInitialized = useRef(false);

  const [cols, setCols] = useState(INITIAL_TABLE_COLS);
  const dragColRef = useRef(null); // key being dragged
  const handleColDragStart = (e, key) => { dragColRef.current = key; e.dataTransfer.effectAllowed = 'move'; };
  const handleColDragOver = (e, key) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleColDrop = (e, targetKey) => {
    e.preventDefault();
    const srcKey = dragColRef.current;
    if (!srcKey || srcKey === targetKey) return;
    setCols(prev => {
      const arr = [...prev];
      const si = arr.findIndex(c => c.key === srcKey);
      const ti = arr.findIndex(c => c.key === targetKey);
      const [moved] = arr.splice(si, 1);
      arr.splice(ti, 0, moved);
      return arr;
    });
    dragColRef.current = null;
  };

  /* Indicateur : y a-t-il des filtres actifs ? */
  const hasActiveFilters = filterDep !== 'Tous' || filterStatut !== 'Tous' || filterCanal !== 'Tous' || searchQuery !== '';

  /* Initialisation depuis les query params URL (au premier mount uniquement) */
  useEffect(() => {
    const p = searchParams;
    const dept = p.get('dept');
    const statut = p.get('statut');
    const canal = p.get('canal');
    const q = p.get('q');
    if (dept) setFilterDep(dept);
    if (statut) setFilterStatut(statut);
    if (canal) setFilterCanal(canal);
    if (q) setSearchQuery(q);
    isInitialized.current = true;
  }, []);

  /* Synchroniser les filtres dans l'URL (après init) */
  useEffect(() => {
    if (!isInitialized.current) return;
    const p = new URLSearchParams();
    if (filterDep !== 'Tous') p.set('dept', filterDep);
    if (filterStatut !== 'Tous') p.set('statut', filterStatut);
    if (filterCanal !== 'Tous') p.set('canal', filterCanal);
    if (searchQuery) p.set('q', searchQuery);
    setSearchParams(p, { replace: true });
  }, [filterDep, filterStatut, filterCanal, searchQuery, setSearchParams]);

  /* Réinitialiser tous les filtres */
  const handleResetFilters = useCallback(() => {
    setFilterDep('Tous');
    setFilterStatut('Tous');
    setFilterCanal('Tous');
    setSearchQuery('');
    setPage(0);
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    return data.filter(o =>
      (filterDep === 'Tous' || o.departement === filterDep) &&
      (filterStatut === 'Tous' || o.statutOffre === filterStatut) &&
      (filterCanal === 'Tous' || o.canalDiffusion === filterCanal) &&
      (!q || o.numero.toLowerCase().includes(q) ||
           o.intitule.toLowerCase().includes(q) ||
           o.departement.toLowerCase().includes(q) ||
           o.responsable.toLowerCase().includes(q))
    );
  }, [data, filterDep, filterStatut, filterCanal, debouncedQuery]);

  const handleSaveOffre = useCallback((id, formData) => {
    const today = new Date().toLocaleDateString('fr-FR');
    setData(prev => prev.map(o => {
      if (o.id !== id) return o;
      const changes = [];
      if (o.statutOffre !== formData.statutOffre) changes.push(`Statut : ${o.statutOffre} → ${formData.statutOffre}`);
      if (o.priorite !== formData.priorite) changes.push(`Priorité : ${o.priorite} → ${formData.priorite}`);
      if (o.intitule !== formData.intitule) changes.push('Intitulé modifié');
      if (o.responsable !== formData.responsable) changes.push(`Responsable : ${o.responsable} → ${formData.responsable}`);
      if (o.budgetAlloue !== formData.budgetAlloue) changes.push('Budget modifié');
      if (o.canalDiffusion !== formData.canalDiffusion) changes.push(`Canal : ${o.canalDiffusion} → ${formData.canalDiffusion}`);

      const newHist = [...(o.historique || [])];
      changes.forEach(ch => {
        newHist.push({ date: today, evenement: ch, auteur: 'Utilisateur', type: 'modification' });
      });
      if (changes.length === 0) {
        newHist.push({ date: today, evenement: 'Offre modifiée', auteur: 'Utilisateur', type: 'modification' });
      }

      return {
        ...o,
        ...formData,
        historique: newHist,
      };
    }));
    /* Mettre à jour le drawer avec les nouvelles données */
    setDrawerOffre(prev => prev && prev.id === id ? { ...prev, ...formData } : prev);
    setSnack({ msg: 'Offre mise à jour avec succès', severity: 'success' });
  }, []);

  /* ═══ QUICK STATUS CHANGE (optimiste + spinner 300ms) ═══ */
  const handleQuickStatutChange = useCallback((id, newStatut) => {
    const offre = data.find(o => o.id === id);
    if (!offre || offre.statutOffre === newStatut) return;

    /* Spinner + affichage du nouveau statut immédiatement (optimiste) */
    setLoadingStatus({ id, statut: newStatut });

    const today = new Date().toLocaleDateString('fr-FR');
    const oldStatut = offre.statutOffre;

    /* Mise à jour optimiste du state */
    setData(prev => prev.map(o => {
      if (o.id !== id) return o;
      return {
        ...o,
        statutOffre: newStatut,
        historique: [...(o.historique || []), {
          date: today,
          evenement: `Statut changé : ${oldStatut} → ${newStatut}`,
          auteur: 'Utilisateur',
          type: newStatut === 'Annulee' ? 'annulation' : newStatut === 'Cloturee' ? 'cloture' : 'modification',
        }],
        ...(newStatut === 'Cloturee' ? { dateCloture: today } : {}),
        ...(newStatut === 'Publiee' && !o.datePublication ? { datePublication: today } : {}),
      };
    }));

    /* Mettre à jour le drawer si ouvert */
    setDrawerOffre(prev => prev && prev.id === id ? { ...prev, statutOffre: newStatut } : prev);

    /* Simuler un délai API de 300ms puis effacer le spinner */
    setTimeout(() => {
      setLoadingStatus({ id: null, statut: null });
      setSnack({ msg: `Statut de ${offre.numero} mis à jour vers '${newStatut}'`, severity: 'success' });
    }, 300);
  }, [data]);

  /* ═══ ARCHIVER UNE OFFRE ═══ */
  const handleArchive = useCallback((offre) => {
    setConfirmDlg({ type: 'archive', offre });
  }, []);

  /* ═══ SUPPRIMER UNE OFFRE ═══ */
  const handleDelete = useCallback((offre) => {
    setConfirmDlg({ type: 'delete', offre });
  }, []);

  /* ═══ CONFIRMER ACTION CRITIQUE ═══ */
  const handleConfirmAction = useCallback(() => {
    if (!confirmDlg) return;
    const { type, offre } = confirmDlg;
    const today = new Date().toLocaleDateString('fr-FR');

    if (type === 'archive') {
      setData(prev => prev.map(o => o.id === offre.id ? {
        ...o, statutOffre: 'Cloturee',
        historique: [...(o.historique || []), { date: today, evenement: 'Offre archivée (clôturée)', auteur: 'Utilisateur', type: 'cloture' }],
        dateCloture: o.dateCloture || today,
      } : o));
      setDrawerOffre(prev => prev && prev.id === offre.id ? { ...prev, statutOffre: 'Cloturee' } : prev);
      setSnack({ msg: `${offre.numero} archivée avec succès`, severity: 'info' });
    } else if (type === 'delete') {
      setData(prev => prev.filter(o => o.id !== offre.id));
      if (drawerOffre?.id === offre.id) setDrawerOffre(null);
      setSnack({ msg: `${offre.numero} supprimée`, severity: 'warning' });
    }

    setConfirmDlg(null);
  }, [confirmDlg, drawerOffre]);

  const handleExport = useCallback(() => {
    const cols = ['N°','Intitulé','Département','Type Poste','Type Contrat','Canal','Statut Offre','Date Publication','Date Clôture','Date Requise','Responsable','Priorité','Budget Alloué','Salaire Min','Salaire Max','Candidatures Reçues','Site'];
    const rows = [cols.join(';')];
    filtered.forEach(o => rows.push([o.numero, o.intitule, o.departement, o.typePoste, o.typeContrat, o.canalDiffusion, o.statutOffre, o.datePublication, o.dateCloture, o.dateRequise, o.responsable, o.priorite, o.budgetAlloue, o.salaireMin, o.salaireMax, o.nbCandidaturesRecues, o.site].map(v => `"${v}"`).join(';')));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offres_emploi.csv';
    a.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: 'Export CSV téléchargé', severity: 'info' });
  }, [filtered]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Offres d'Emploi</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {hasActiveFilters
          ? <><strong>{filtered.length}</strong> offre(s) trouvée(s) sur <strong>{data.length}</strong></>
          : <>{data.length} offre(s) d'emploi</>
        }
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />} onClick={handleExport}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)} sx={{ bgcolor: '#0D7C66', '&:hover': { bgcolor: '#0a5c4a' } }}>Offre Rapide</Button>
        <Button
          variant="outlined"
          startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
          onClick={() => setStudioOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderWidth: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            borderColor: '#7c3aed',
            '&:hover': {
              borderColor: '#5b21b6',
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              bgcolor: 'rgba(124,58,237,0.04)',
            },
          }}
        >
          Studio d'Analyse & Publication
        </Button>
      </Box>

      {/* KPIs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL OFFRES" valeur={filtered.length} sousTexte={`${filtered.length} offre(s) enregistrée(s)`} />
        <Box
          onClick={() => { setFilterStatut('Publiee'); setPage(0); }}
          sx={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-2px)' }, '&:active': { transform: 'translateY(0)' } }}
        >
          <KPICard titre="PUBLIÉES" valeur={filtered.filter(o => o.statutOffre === 'Publiee').length} sousTexte={`${Math.round(filtered.filter(o => o.statutOffre === 'Publiee').length / Math.max(filtered.length, 1) * 100)}% du total`} />
        </Box>
        <KPICard titre="CANDIDATURES EN COURS" valeur={filtered.filter(o => o.statutOffre === 'Candidatures en cours').length} sousTexte="offres actives" />
        <KPICard titre="TOTAL CANDIDATURES" valeur={filtered.reduce((s, o) => s + (o.nbCandidaturesRecues || 0), 0)} sousTexte="candidatures reçues" />
      </Box>

      {/* ═══ Recherche + Filtres avancés ═══ */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Rechercher par N°, intitulé, département, responsable..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          sx={{ flex: '1 1 320px', minWidth: 280 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: 'action.active' }} /></InputAdornment>,
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setSearchQuery(''); setPage(0); }} sx={{ color: 'text.secondary' }} aria-label="Effacer la recherche">
                  <Close sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select value={filterDep} onChange={e => { setFilterDep(e.target.value); setPage(0); }} displayEmpty>
            <MenuItem value="Tous">Tous les départements</MenuItem>
            {nomenclatures.departement.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }} displayEmpty>
            <MenuItem value="Tous">Tous les statuts</MenuItem>
            {nomenclatures.statut_offre.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select value={filterCanal} onChange={e => { setFilterCanal(e.target.value); setPage(0); }} displayEmpty>
            <MenuItem value="Tous">Tous les canaux</MenuItem>
            {nomenclatures.canal_diffusion.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <Fade in={hasActiveFilters}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListOff sx={{ fontSize: 18 }} />}
            onClick={handleResetFilters}
            sx={{ textTransform: 'none', borderColor: 'grey.400', color: 'text.secondary' }}
          >
            Effacer les filtres
          </Button>
        </Fade>
      </Box>

      {/* Tableau */}
      <Paper>
        <TableContainer sx={{ maxHeight: 700 }}><Table size="small" stickyHeader>
          <TableHead><TableRow>
            {cols.map(c => (
              <TableCell key={c.key} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: c.width }}
                draggable
                onDragStart={e => handleColDragStart(e, c.key)}
                onDragOver={e => handleColDragOver(e, c.key)}
                onDrop={e => handleColDrop(e, c.key)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'grab' }}>
                  <DragIndicator sx={{ fontSize: 14, color: 'grey.500' }} />
                  {c.label}
                </Box>
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', width: 230, textAlign: 'center', position: 'sticky', right: 0, zIndex: 3, boxShadow: '-4px 0 8px rgba(0,0,0,0.05)' }}>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={cols.length + 1} sx={{ p: 0, border: 'none' }}>
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <SearchOff sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune offre ne correspond à vos critères de recherche.
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                    Essayez de modifier vos filtres ou votre recherche.
                  </Typography>
                  <Button variant="outlined" startIcon={<FilterListOff />} onClick={handleResetFilters} sx={{ textTransform: 'none' }}>
                    Réinitialiser les filtres
                  </Button>
                </Box>
              </TableCell></TableRow>
            ) : (
              filtered.slice(page * rpp, page * rpp + rpp).map(row => (
              <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrawerOffre(row)}>
                {cols.map(c => (
                  <TableCell key={c.key} sx={{ whiteSpace: 'nowrap' }}>
                    {c.chip ? <Chip label={row[c.key]} size="small" variant="outlined" /> :
                     row[c.key]}
                  </TableCell>
                ))}
                <TableCell sx={{ position: 'sticky', right: 0, zIndex: 3, bgcolor: '#fff', boxShadow: '-4px 0 8px rgba(0,0,0,0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                    <StatusChipMenu
                      offre={row}
                      onStatutChange={handleQuickStatutChange}
                      loadingId={loadingStatus.id}
                      loadingStatut={loadingStatus.statut}
                    />
                    <Box sx={{ width: 1, height: 24, bgcolor: 'divider', borderRadius: 1 }} />
                    <QuickActions
                      offre={row}
                      onView={o => setDrawerOffre(o)}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table></TableContainer>
        <TablePagination
          component="div" count={filtered.length} page={page}
          onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp}
          onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page"
        />
      </Paper>

      {/* Drawer d'édition */}
      <OffreDrawer
        offre={drawerOffre}
        open={Boolean(drawerOffre)}
        onClose={() => setDrawerOffre(null)}
        onSave={handleSaveOffre}
      />

      {/* Stepper Modal - Nouvelle Offre */}
      <NouvelleOffreStepper
        open={dlg}
        onClose={() => setDlg(false)}
        responsablesList={responsablesList}
        onSubmit={(vals, toastMsg) => {
          const nid = data.length + 1;
          const today = new Date().toLocaleDateString('fr-FR');
          const newOffre = {
            id: nid,
            numero: 'OF-2025-' + String(nid).padStart(3, '0'),
            statutOffre: 'A creer',
            datePublication: '',
            nbCandidatures: 0,
            nbCandidaturesRecues: 0,
            candidatsAssocies: [],
            historique: [
              {
                date: today,
                evenement: vals.statutOffre === 'Publiee' ? 'Offre créée et publiée' : 'Offre créée (brouillon)',
                auteur: vals.responsable || 'Utilisateur',
                type: 'creation',
              },
            ],
            site: vals.site || 'Siege (Douala)',
            ...vals,
          };
          setData(prev => [newOffre, ...prev]);
          setSnack({ msg: toastMsg, severity: 'success' });
          setDlg(false);
        }}
      />

      {/* Studio d'Analyse & Publication (Modal XXL) */}
      <JobStudioModal
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        responsablesList={responsablesList}
        onSubmit={(vals, toastMsg) => {
          const nid = data.length + 1;
          const today = new Date().toLocaleDateString('fr-FR');
          const studioD = vals._studioData || {};
          const newOffre = {
            id: nid,
            numero: 'OF-2025-' + String(nid).padStart(3, '0'),
            statutOffre: 'A creer',
            datePublication: '',
            nbCandidatures: 0,
            nbCandidaturesRecues: 0,
            candidatsAssocies: [],
            historique: [
              {
                date: today,
                evenement: vals.statutOffre === 'Publiee'
                  ? `Offre creee via Studio et publiee sur ${studioD.canaux?.length || 0} canal(aux)`
                  : 'Offre creee via Studio (brouillon)',
                auteur: vals.responsable || 'Utilisateur',
                type: 'creation',
              },
            ],
            site: vals.site || 'Siege (Douala)',
            ...vals,
          };
          setData(prev => [newOffre, ...prev]);
          setSnack({ msg: toastMsg, severity: 'success' });
          setStudioOpen(false);
        }}
      />

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>}
      </Snackbar>

      {/* ═══ DIALOGUE DE CONFIRMATION (Archive / Supprimer) ═══ */}
      <Dialog
        open={Boolean(confirmDlg)}
        onClose={() => setConfirmDlg(null)}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
      >
        {confirmDlg && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: confirmDlg.type === 'delete' ? 'rgba(211,47,47,0.1)' : 'rgba(245,127,23,0.1)',
              }}>
                {confirmDlg.type === 'delete'
                  ? <Delete sx={{ color: '#d32f2f', fontSize: 22 }} />
                  : <Archive sx={{ color: '#f57f17', fontSize: 22 }} />
                }
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                  {confirmDlg.type === 'delete' ? 'Supprimer cette offre' : 'Archiver cette offre'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {confirmDlg.offre.numero} — {confirmDlg.offre.intitule}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {confirmDlg.type === 'delete'
                  ? `Cette action est irréversible. L'offre ${confirmDlg.offre.numero} et toutes ses données associées (candidatures, historique) seront définitivement supprimées.`
                  : `L'offre ${confirmDlg.offre.numero} sera marquée comme clôturée et archivée. Elle ne recevra plus de candidatures.`
                }
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setConfirmDlg(null)} color="inherit" sx={{ textTransform: 'none' }}>
                Annuler
              </Button>
              <Button
                onClick={handleConfirmAction} variant="contained"
                sx={{
                  textTransform: 'none', fontWeight: 600,
                  bgcolor: confirmDlg.type === 'delete' ? '#d32f2f' : '#f57f17',
                  '&:hover': { bgcolor: confirmDlg.type === 'delete' ? '#b71c1c' : '#e65100' },
                }}
              >
                {confirmDlg.type === 'delete' ? 'Supprimer définitivement' : 'Confirmer l\'archivage'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
