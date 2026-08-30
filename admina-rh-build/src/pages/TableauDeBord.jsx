import { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Badge, Alert, Snackbar, Collapse, TextField,
  InputAdornment, Divider, Fab, Drawer, List, ListItemButton, ListItemText,
  ListItemIcon, Slider, Switch, FormControlLabel,
} from '@mui/material';
import {
  Download, Refresh, FilterListOff, Send, CheckCircle, Visibility,
  Schedule, Warning, TrendingUp, TrendingDown, FiberManualRecord,
  Search, Tune, Close, Person, Business, AdminPanelSettings,
  ArrowUpward, ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend, Tooltip as RTooltip,
} from 'recharts';
import { useDashboardFilters } from '../context/DashboardFilterContext';
import { useApp } from '../context/AppContext';
import { useRole } from '../context/RoleContext';

const COLORS = ['#1976d2', '#42a5f5', '#0D7C66', '#ffa726', '#ef5350', '#ab47bc', '#26c6da', '#8d6e63'];

/* ─── Enriched data ─── */
const allDemandes = [
  { numero: 'DR-2025-008', poste: 'Chef Approvisionnement', departement: 'Logistique', statut: 'Validée', date: '2025-02-20', site: 'Siège', joursAttente: 0, alerte: false, priorite: 'haute' },
  { numero: 'DR-2025-006', poste: 'Développeur Full Stack', departement: 'Informatique', statut: 'En attente', date: '2025-02-10', site: 'Siège', joursAttente: 20, alerte: true, priorite: 'haute' },
  { numero: 'DR-2025-003', poste: 'Comptable Senior', departement: 'Finance', statut: 'Validée', date: '2025-01-25', site: 'Annexe', joursAttente: 0, alerte: false, priorite: 'moyenne' },
  { numero: 'DR-2025-004', poste: 'Agent Accueil', departement: 'Service Client', statut: 'Pourvue', date: '2025-02-01', site: 'Hôtel Sawa', joursAttente: 0, alerte: false, priorite: 'basse' },
  { numero: 'DR-2025-002', poste: 'Réceptionniste Nuit', departement: 'Hébergement', statut: 'En cours', date: '2025-01-20', site: 'Hôtel Sawa', joursAttente: 41, alerte: true, priorite: 'moyenne' },
  { numero: 'DR-2025-001', poste: 'Chef Cuisinier', departement: 'Restauration', statut: 'En attente', date: '2025-01-15', site: 'Hôtel Sawa', joursAttente: 46, alerte: true, priorite: 'haute' },
  { numero: 'DR-2024-012', poste: 'Agent Sécurité', departement: 'Sécurité', statut: 'Clôturée', date: '2024-12-10', site: 'Siège', joursAttente: 0, alerte: false, priorite: 'basse' },
  { numero: 'DR-2025-009', poste: 'Community Manager', departement: 'Marketing', statut: 'En attente', date: '2025-02-25', site: 'Siège', joursAttente: 5, alerte: false, priorite: 'moyenne' },
  { numero: 'DR-2025-010', poste: 'Serveur', departement: 'Restauration', statut: 'Validée', date: '2025-02-28', site: 'Hôtel Sawa', joursAttente: 0, alerte: false, priorite: 'basse' },
  { numero: 'DR-2025-011', poste: 'Commercial Senior', departement: 'Commercial', statut: 'En attente', date: '2025-02-18', site: 'Annexe', joursAttente: 12, alerte: false, priorite: 'haute' },
];

const allCandidats = [
  { nom: 'Eyenga Clarisse', numero: 'CAN-006', source: 'Cooptation', etape: 'CV reçu', score: null, departement: 'Marketing', date: '2025-02-22', site: 'Siège', enAttente: false, experience: 3 },
  { nom: 'Bikay Jean-Pierre', numero: 'CAN-004', source: 'LinkedIn', etape: 'Entretien HR', score: 14, departement: 'Informatique', date: '2025-02-05', site: 'Siège', enAttente: true, experience: 6 },
  { nom: 'Nkoulou Brandon', numero: 'CAN-003', source: 'Site web', etape: 'Test technique', score: 10, departement: 'Informatique', date: '2025-01-28', site: 'Siège', enAttente: false, experience: 1 },
  { nom: 'Kamga Blaise', numero: 'CAN-005', source: 'Cabinet', etape: 'Entretien HR', score: null, departement: 'Finance', date: '2025-02-12', site: 'Annexe', enAttente: true, experience: 4 },
  { nom: 'Mebara Nadège', numero: 'CAN-007', source: 'Site web', etape: 'Offre envoyée', score: 17, departement: 'Service Client', date: '2025-01-20', site: 'Hôtel Sawa', enAttente: false, experience: 8 },
  { nom: 'Ndiaye Moussa', numero: 'CAN-001', source: 'Cooptation', etape: 'Sélectionné', score: 18, departement: 'Restauration', date: '2025-01-10', site: 'Hôtel Sawa', enAttente: false, experience: 9 },
  { nom: 'Nganou André', numero: 'CAN-002', source: 'Indeed', etape: 'Entretien technique', score: 12, departement: 'Sécurité', date: '2025-01-18', site: 'Siège', enAttente: false, experience: 5 },
  { nom: 'Fotso Amandine', numero: 'CAN-008', source: 'LinkedIn', etape: 'CV reçu', score: null, departement: 'Hébergement', date: '2025-02-26', site: 'Hôtel Sawa', enAttente: false, experience: 2 },
  { nom: 'Tabi Sandrine', numero: 'CAN-009', source: 'Site web', etape: 'Entretien HR', score: 15, departement: 'Restauration', date: '2025-02-15', site: 'Hôtel Sawa', enAttente: true, experience: 3 },
  { nom: 'Ateba Chantal', numero: 'CAN-010', source: 'Cabinet', etape: 'Vérification refs', score: 16, departement: 'Hébergement', date: '2025-01-30', site: 'Annexe', enAttente: false, experience: 7 },
];

const allEvolution = [
  { mois: 'Oct 2024', demandes: 3, pourvues: 1 },
  { mois: 'Nov 2024', demandes: 5, pourvues: 2 },
  { mois: 'Dec 2024', demandes: 4, pourvues: 3 },
  { mois: 'Jan 2025', demandes: 8, pourvues: 4 },
  { mois: 'Fev 2025', demandes: 10, pourvues: 5 },
];

const allSources = [
  { source: 'Site web', valeur: 32 }, { source: 'Cooptation', valeur: 28 },
  { source: 'LinkedIn', valeur: 25 }, { source: 'Indeed', valeur: 18 },
  { source: 'Cabinet', valeur: 22 }, { source: 'Autres', valeur: 27 },
];

const allDepart = [
  { name: 'Restauration', value: 18 }, { name: 'Hébergement', value: 15 },
  { name: 'Finance', value: 12 }, { name: 'Informatique', value: 10 },
  { name: 'Sécurité', value: 9 }, { name: 'Service Client', value: 13 },
  { name: 'Marketing', value: 11 }, { name: 'Logistique', value: 12 },
];

const allStatuts = [
  { statut: 'Brouillon', valeur: 1 }, { statut: 'En attente', valeur: 3 },
  { statut: 'Validée', valeur: 3 }, { statut: 'Publiée', valeur: 1 },
  { statut: 'Pourvue', valeur: 1 }, { statut: 'En cours', valeur: 1 },
  { statut: 'Clôturée', valeur: 1 },
];

const statutColor = { 'Pourvue': 'success', 'En cours': 'warning', 'Validée': 'info', 'En attente': 'warning', 'Annulee': 'error', 'Brouillon': 'default', 'Publiée': 'info', 'Clôturée': 'default' };
const statutSeverity = { 'En attente': 'warning', 'En cours': 'error' };

const ETAPES = ['CV reçu', 'Entretien HR', 'Test technique', 'Entretien technique', 'Vérification refs', 'Offre envoyée', 'Sélectionné', 'Rejeté'];
const SOURCES = ['Site web', 'Cooptation', 'LinkedIn', 'Indeed', 'Cabinet', 'Autres'];

function filterByPeriod(items, periode) {
  if (periode === 'tout') return items;
  const cutoff = periode === 'mois' ? new Date('2025-02-01') : new Date('2025-01-01');
  return items.filter(i => new Date(i.date) >= cutoff);
}

function ChartTooltip({ active, payload, label, clickable }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, boxShadow: 3, maxWidth: 220 }}>
      <Typography variant="caption" fontWeight="bold">{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" sx={{ color: p.color, mt: 0.3 }}>{p.name}: <strong>{p.value}</strong></Typography>
      ))}
      {clickable && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontStyle: 'italic' }}>Cliquer pour filtrer</Typography>}
    </Paper>
  );
}

function FilterChip({ label, onRemove }) {
  return <Chip label={label} size="small" onDelete={onRemove} sx={{ ml: 1, bgcolor: 'rgba(13,124,102,0.1)', borderColor: '#0D7C66', '& .MuiChip-deleteIcon': { color: '#0D7C66' } }} variant="outlined" />;
}

/* ═════════════════ FACETED SEARCH DRAWER ═════════════════ */
function FacetedSearchDrawer({ open, onClose, facets, onChange }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 320, p: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" fontSize="1rem">Recherche avancée</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Text search */}
      <TextField
        fullWidth size="small" placeholder="Rechercher..." value={facets.text || ''}
        onChange={e => onChange('text', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
        sx={{ mb: 2.5 }}
      />

      {/* Statut */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Statut</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {[...new Set(allDemandes.map(d => d.statut))].map(s => (
          <Chip key={s} label={s} size="small" variant={facets.statut === s ? 'filled' : 'outlined'}
            color={facets.statut === s ? 'primary' : 'default'}
            onClick={() => onChange('statut', facets.statut === s ? null : s)} />
        ))}
      </Box>

      {/* Source */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Source candidat</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {SOURCES.map(s => (
          <Chip key={s} label={s} size="small" variant={facets.source === s ? 'filled' : 'outlined'}
            color={facets.source === s ? 'primary' : 'default'}
            onClick={() => onChange('source', facets.source === s ? null : s)} />
        ))}
      </Box>

      {/* Étape */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Étape recrutement</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {ETAPES.map(e => (
          <Chip key={e} label={e} size="small" variant={facets.etape === e ? 'filled' : 'outlined'}
            color={facets.etape === e ? 'primary' : 'default'}
            onClick={() => onChange('etape', facets.etape === e ? null : e)} />
        ))}
      </Box>

      {/* Score range */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Score minimum</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Slider value={facets.minScore || 0} min={0} max={20} step={1} valueLabelDisplay="auto"
          marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
          onChange={(_, v) => onChange('minScore', v)} />
      </Box>

      {/* Expérience range */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Expérience min. (années)</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Slider value={facets.minExp || 0} min={0} max={15} step={1} valueLabelDisplay="auto"
          marks={[{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10+' }]}
          onChange={(_, v) => onChange('minExp', v)} />
      </Box>

      {/* Alertes only */}
      <FormControlLabel
        control={<Switch checked={facets.alertesOnly || false} onChange={e => onChange('alertesOnly', e.target.checked)} color="warning" />}
        label={<Typography variant="body2" fontSize="0.8rem">Afficher uniquement les alertes</Typography>}
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 2 }} />
      <Button fullWidth variant="outlined" startIcon={<FilterListOff />} onClick={() => { onChange('reset', null); onClose(); }}>
        Réinitialiser tous les filtres
      </Button>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function TableauDeBord() {
  const {
    periode, setPeriode, departement, setDepartement, site, setSite,
    activeSource, setActiveSource, activeStatut, setActiveStatut,
    resetFilters, hasActiveFilters, PERIODES, DEPARTEMENTS, SITES,
  } = useDashboardFilters();
  const { addNotification } = useApp();
  const { currentRole } = useRole();
  const [snack, setSnack] = useState(null);
  const [facetDrawer, setFacetDrawer] = useState(false);
  const [facets, setFacets] = useState({ text: '', statut: null, source: null, etape: null, minScore: 0, minExp: 0, alertesOnly: false });

  const handleFacetChange = useCallback((key, val) => {
    if (key === 'reset') { setFacets({ text: '', statut: null, source: null, etape: null, minScore: 0, minExp: 0, alertesOnly: false }); return; }
    setFacets(prev => ({ ...prev, [key]: val }));
  }, []);

  /* ─── Filtered data with facets ─── */
  const filteredDemandes = useMemo(() => {
    let data = filterByPeriod(allDemandes, periode);
    if (departement !== 'tout') data = data.filter(d => d.departement === departement);
    if (site !== 'tout') data = data.filter(d => d.site === site);
    if (activeStatut) data = data.filter(d => d.statut === activeStatut);
    if (facets.statut) data = data.filter(d => d.statut === facets.statut);
    if (facets.text) { const q = facets.text.toLowerCase(); data = data.filter(d => d.poste.toLowerCase().includes(q) || d.numero.toLowerCase().includes(q) || d.departement.toLowerCase().includes(q)); }
    if (facets.alertesOnly) data = data.filter(d => d.alerte);
    return data;
  }, [periode, departement, site, activeStatut, facets]);

  const filteredCandidats = useMemo(() => {
    let data = filterByPeriod(allCandidats, periode);
    if (departement !== 'tout') data = data.filter(c => c.departement === departement);
    if (site !== 'tout') data = data.filter(c => c.site === site);
    if (activeSource) data = data.filter(c => c.source === activeSource);
    if (facets.source) data = data.filter(c => c.source === facets.source);
    if (facets.etape) data = data.filter(c => c.etape === facets.etape);
    if (facets.minScore > 0) data = data.filter(c => c.score !== null && c.score >= facets.minScore);
    if (facets.minExp > 0) data = data.filter(c => c.experience >= facets.minExp);
    if (facets.text) { const q = facets.text.toLowerCase(); data = data.filter(c => c.nom.toLowerCase().includes(q) || c.numero.toLowerCase().includes(q) || c.etape.toLowerCase().includes(q)); }
    if (facets.alertesOnly) data = data.filter(c => c.enAttente);
    return data;
  }, [periode, departement, site, activeSource, facets]);

  /* ─── KPIs ─── */
  const kpis = useMemo(() => {
    const totalD = filteredDemandes.length;
    const ouvertes = filteredDemandes.filter(d => ['En attente', 'En cours', 'Validée', 'Publiée'].includes(d.statut)).length;
    const totalC = filteredCandidats.length;
    const actifs = filteredCandidats.filter(c => !['Sélectionné', 'Rejeté'].includes(c.etape)).length;
    const pourvues = filteredDemandes.filter(d => d.statut === 'Pourvue').length;
    const taux = totalC > 0 ? ((pourvues / totalC) * 100).toFixed(1) : '0.0';
    const enRetard = filteredDemandes.filter(d => d.alerte).length;
    const enAttente = filteredCandidats.filter(c => c.enAttente).length;
    const delai = totalD > 0 ? Math.round(filteredDemandes.reduce((s, d) => s + (d.joursAttente || 0), 0) / totalD) : 0;
    return [
      { titre: 'Total Demandes', valeur: totalD, sousTexte: `${ouvertes} ouvertes`, tendance: '+12%', up: true, alerte: enRetard > 0, alerteMsg: `${enRetard} en retard` },
      { titre: 'Total Candidats', valeur: totalC, sousTexte: `${actifs} actifs`, tendance: '+8%', up: true, alerte: false },
      { titre: 'Taux de Conversion', valeur: `${taux}%`, sousTexte: `${pourvues} retenus / ${totalC}`, tendance: '+3.2%', up: true, alerte: parseFloat(taux) < 15, alerteMsg: 'Sous objectif' },
      { titre: 'Délai Moyen', valeur: delai ? `${delai} j` : '—', sousTexte: 'jours ouvrés', tendance: '-5 j', up: false, alerte: delai > 30, alerteMsg: 'Objectif dépassé' },
      { titre: 'En Attente Décision', valeur: enAttente, sousTexte: 'candidats bloqués', tendance: enAttente > 3 ? '+2' : '0', up: enAttente > 3, alerte: enAttente >= 3, alerteMsg: 'Relance nécessaire' },
      { titre: 'Alertes', valeur: enRetard, sousTexte: 'demandes en retard', tendance: null, up: null, alerte: enRetard > 0, alerteMsg: `${enRetard} action(s) requise(s)` },
    ];
  }, [filteredDemandes, filteredCandidats]);

  /* ─── Chart data ─── */
  const filteredSources = useMemo(() => activeSource ? allSources.map(s => ({ ...s, valeur: s.source === activeSource ? s.valeur : 0 })) : allSources, [activeSource]);
  const filteredDepart = useMemo(() => departement === 'tout' ? allDepart : allDepart.map(d => ({ ...d, value: d.name === departement ? d.value : 0 })), [departement]);
  const filteredStatuts = useMemo(() => activeStatut ? allStatuts.map(s => ({ ...s, valeur: s.statut === activeStatut ? s.valeur : 0 })) : allStatuts, [activeStatut]);

  /* ─── Handlers ─── */
  const handleRelancer = useCallback((c) => { setSnack({ msg: `Relance envoyée à ${c.nom}`, severity: 'success' }); addNotification({ icon: 'send', color: '#0D7C66', msg: `Relance envoyée : ${c.nom}`, path: '/candidats' }); }, [addNotification]);
  const handleValider = useCallback((d) => { setSnack({ msg: `Demande ${d.numero} validée`, severity: 'success' }); addNotification({ icon: 'check_circle', color: '#2e7d32', msg: `Demande ${d.numero} validée`, path: '/offres' }); }, [addNotification]);
  const handleExporter = useCallback(() => {
    const rows = ['N°,Poste,Département,Statut,Date,Jours attente,Site'];
    filteredDemandes.forEach(d => rows.push(`${d.numero},${d.poste},${d.departement},${d.statut},${d.date},${d.joursAttente},${d.site}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dashboard_export.csv'; a.click();
    URL.revokeObjectURL(url); setSnack({ msg: 'Export CSV téléchargé', severity: 'info' });
  }, [filteredDemandes]);
  const handleSourceClick = useCallback((data) => { if (data?.activePayload?.[0]) { const src = data.activePayload[0].payload.source; setActiveSource(prev => prev === src ? null : src); } }, [setActiveSource]);
  const handleStatutClick = useCallback((data) => { if (data?.activePayload?.[0]) { const st = data.activePayload[0].payload.statut; setActiveStatut(prev => prev === st ? null : st); } }, [setActiveStatut]);

  const activeFacetCount = useMemo(() => [facets.statut, facets.source, facets.etape, facets.minScore > 0, facets.minExp > 0, facets.alertesOnly].filter(Boolean).length, [facets]);

  /* ─── Role-based section visibility ─── */
  const show = useMemo(() => {
    const s = currentRole.sections;
    return {
      kpi: true, evolution: s.includes('evolution'), sources: s.includes('sources'),
      depart: s.includes('departement'), statuts: s.includes('statuts'),
      demandes: s.includes('demandesRecentes'), candidats: s.includes('candidatsRecents'),
      couts: s.includes('coutsResume'), conformite: s.includes('conformiteResume'),
      pipeline: s.includes('pipelineResume'), entretiens: s.includes('entretiensJour'),
    };
  }, [currentRole]);

  const selectSx = { minWidth: 150, '& .MuiSelect-select': { py: 1, fontSize: '0.8rem' } };

  /* ─── Entretiens du jour (Recruteur view) ─── */
  const entretiensJour = [
    { heure: '09:00', candidat: 'Bikay Jean-Pierre', poste: 'Développeur Full Stack', type: 'HR' },
    { heure: '10:30', candidat: 'Tabi Sandrine', poste: 'Serveuse', type: 'Technique' },
    { heure: '14:00', candidat: 'Kamga Blaise', poste: 'Comptable', type: 'HR' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">Tableau de Bord</Typography>
            <Chip label={currentRole.label} size="small" sx={{ bgcolor: `${currentRole.color}18`, color: currentRole.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">Vue d'ensemble interactif — {currentRole.desc}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Tune />} onClick={() => setFacetDrawer(true)} size="small">Filtres</Button>
          <Button variant="outlined" startIcon={<Download fontSize="small" />} onClick={handleExporter} size="small">Export</Button>
        </Box>
      </Box>

      {/* Global Filter Bar */}
      <Paper elevation={0} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 1.5, mb: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <FilterListOff sx={{ color: 'text.secondary', fontSize: 20 }} />
        <FormControl size="small" sx={selectSx}><InputLabel>Période</InputLabel><Select value={periode} label="Période" onChange={e => setPeriode(e.target.value)}>{PERIODES.map(p => <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={selectSx}><InputLabel>Département</InputLabel><Select value={departement} label="Département" onChange={e => setDepartement(e.target.value)}>{DEPARTEMENTS.map(d => <MenuItem key={d.key} value={d.key}>{d.label}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={selectSx}><InputLabel>Site</InputLabel><Select value={site} label="Site" onChange={e => setSite(e.target.value)}>{SITES.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}</Select></FormControl>
        <Box sx={{ flex: 1 }} />
        {activeSource && <FilterChip label={`Source: ${activeSource}`} onRemove={() => setActiveSource(null)} />}
        {activeStatut && <FilterChip label={`Statut: ${activeStatut}`} onRemove={() => setActiveStatut(null)} />}
        {activeFacetCount > 0 && <FilterChip label={`${activeFacetCount} filtre(s) avancé(s)`} onRemove={() => handleFacetChange('reset', null)} />}
        {hasActiveFilters && <Button size="small" variant="text" startIcon={<FilterListOff />} onClick={resetFilters} sx={{ ml: 1, color: '#ef5350' }}>Réinitialiser</Button>}
      </Paper>

      {/* Alert banner */}
      {kpis[5].valeur > 0 && show.kpi && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} action={<Button size="small" color="inherit" variant="outlined" onClick={() => setDepartement('tout')}>Voir les détails</Button>}>
          <strong>{kpis[5].valeur} demande(s) en retard</strong> — Le délai moyen dépasse la cible sur certains postes.
        </Alert>
      )}

      {/* KPI Cards */}
      {show.kpi && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          {kpis.map(k => (
            <Paper key={k.titre} sx={{ p: 2, flex: '1 1 150px', minWidth: 145, position: 'relative', borderLeft: k.alerte ? '4px solid #ef5350' : '4px solid transparent', transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
              {k.alerte && <Tooltip title={k.alerteMsg}><Warning sx={{ position: 'absolute', top: 8, right: 8, fontSize: 18, color: '#ef5350' }} /></Tooltip>}
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.titre}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 0.5 }}>
                <Typography variant="h5" fontWeight="bold">{k.valeur}</Typography>
                {k.tendance && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>{k.up ? <TrendingUp sx={{ fontSize: 14, color: '#2e7d32' }} /> : <TrendingDown sx={{ fontSize: 14, color: k.alerte ? '#ef5350' : '#2e7d32' }} />}<Typography variant="caption" sx={{ color: k.up ? '#2e7d32' : '#ef5350', fontWeight: 600, fontSize: '0.7rem' }}>{k.tendance}</Typography></Box>}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{k.sousTexte}</Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Entretiens du jour — Recruteur only */}
      {show.entretiens && (
        <Paper sx={{ p: 2, mb: 2, borderLeft: '4px solid #1976d2' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">Entretiens du jour</Typography>
            <Chip label={`${entretiensJour.length} prévus`} size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
            {entretiensJour.map((e, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, minWidth: 220, flexShrink: 0, borderColor: '#e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', fontSize: '1.1rem' }}>{e.heure}</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>{e.candidat}</Typography>
                <Typography variant="caption" color="text.secondary">{e.poste}</Typography>
                <Chip label={e.type} size="small" sx={{ mt: 1, bgcolor: e.type === 'HR' ? '#e3f2fd' : '#fff3e0', color: e.type === 'HR' ? '#1976d2' : '#e65100', fontSize: '0.65rem' }} />
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* Pipeline résumé — Recruteur only */}
      {show.pipeline && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Pipeline candidatures</Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {ETAPES.slice(0, 6).map(etape => {
              const count = allCandidats.filter(c => c.etape === etape).length;
              return (
                <Paper key={etape} variant="outlined" sx={{ p: 1.5, minWidth: 100, textAlign: 'center', flexShrink: 0, borderColor: '#e0e0e0' }}>
                  <Typography variant="h5" fontWeight="bold" color="#1976d2">{count}</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{etape}</Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Charts Row 1 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: show.sources ? '1fr 1fr' : '1fr' }, gap: 2, mb: 2 }}>
        {show.evolution && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Évolution du Recrutement</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={allEvolution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mois" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><RTooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line type="monotone" dataKey="demandes" stroke="#1976d2" name="Demandes créées" strokeWidth={2} dot={{ r: 4 }} /><Line type="monotone" dataKey="pourvues" stroke="#0D7C66" name="Demandes pourvues" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
            </ResponsiveContainer>
          </Paper>
        )}
        {show.sources && (
          <Paper sx={{ p: 2, border: activeSource ? '2px solid #0D7C66' : 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold">Sources de Recrutement</Typography>
              {activeSource && <Chip label={activeSource} size="small" color="primary" onDelete={() => setActiveSource(null)} />}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Cliquer sur une barre pour filtrer</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredSources} layout="vertical" onClick={handleSourceClick} style={{ cursor: 'pointer' }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={80} /><RTooltip content={<ChartTooltip clickable />} /><Bar dataKey="valeur" name="Candidats" radius={[0, 4, 4, 0]}>{filteredSources.map((s, i) => <Cell key={i} fill={activeSource && s.source !== activeSource ? '#e0e0e0' : COLORS[i % COLORS.length]} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>

      {/* Charts Row 2 */}
      {(show.depart || show.statuts) && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: show.depart && show.statuts ? '1fr 1fr' : '1fr' }, gap: 2, mb: 3 }}>
          {show.depart && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Répartition par Département</Typography>
              <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={filteredDepart} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>{filteredDepart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><RTooltip /></PieChart></ResponsiveContainer>
            </Paper>
          )}
          {show.statuts && (
            <Paper sx={{ p: 2, border: activeStatut ? '2px solid #0D7C66' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="subtitle2" fontWeight="bold">Statuts des Demandes</Typography>{activeStatut && <Chip label={activeStatut} size="small" color="primary" onDelete={() => setActiveStatut(null)} />}</Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Cliquer pour filtrer</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={filteredStatuts} onClick={handleStatutClick} style={{ cursor: 'pointer' }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="statut" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} /><YAxis tick={{ fontSize: 11 }} /><RTooltip content={<ChartTooltip clickable />} /><Bar dataKey="valeur" name="Demandes" radius={[4, 4, 0, 0]}>{filteredStatuts.map((s, i) => { const sev = statutSeverity[s.statut]; return <Cell key={i} fill={activeStatut && s.statut !== activeStatut ? '#e0e0e0' : sev === 'error' ? '#ef5350' : sev === 'warning' ? '#ffa726' : '#42a5f5'} />; })}</Bar></BarChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* Coûts résumé — Manager / DRH */}
      {show.couts && (
        <Paper sx={{ p: 2, mb: 2, borderLeft: '4px solid #7b1fa2' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Résumé des Coûts</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[{ label: 'Budget annuel', val: '12 500 000 FCFA', sub: 'Prévisionnel 2025' }, { label: 'Coût moyen / embauche', val: '285 000 FCFA', sub: '-8% vs 2024' }, { label: 'Coût par source', val: 'LinkedIn: 42 000 FCFA', sub: 'Source la + chère' }].map((c, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, flex: '1 1 180px' }}>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#7b1fa2' }}>{c.val}</Typography>
                <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* Conformité résumé — DRH only */}
      {show.conformite && (
        <Paper sx={{ p: 2, mb: 2, borderLeft: '4px solid #d32f2f' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Conformité & Risques</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[{ label: 'Taux conformité', val: '92%', ok: true }, { label: 'Documents manquants', val: '3', ok: false }, { label: 'Contrats expirant < 30j', val: '1', ok: false }].map((c, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, flex: '1 1 150px', borderLeft: `3px solid ${c.ok ? '#2e7d32' : '#ef5350'}` }}>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: c.ok ? '#2e7d32' : '#ef5350' }}>{c.val}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* Tables */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: (show.demandes && show.candidats) ? '1fr 1fr' : '1fr' }, gap: 2 }}>
        {show.demandes && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Demandes ({filteredDemandes.length})</Typography>
              <Badge badgeContent={filteredDemandes.filter(d => d.alerte).length} color="error"><Warning sx={{ color: '#ef5350' }} /></Badge>
            </Box>
            <TableContainer sx={{ maxHeight: 340 }}><Table size="small" stickyHeader><TableHead><TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>N°</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Poste</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Action</TableCell>
            </TableRow></TableHead><TableBody>
              {filteredDemandes.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun résultat</TableCell></TableRow>}
              {filteredDemandes.map(d => (
                <TableRow key={d.numero} hover sx={{ bgcolor: d.alerte ? 'rgba(239,83,80,0.04)' : 'inherit' }}>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{d.numero}</TableCell>
                  <TableCell><Box><Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{d.poste}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{d.departement}</Typography></Box></TableCell>
                  <TableCell><Chip label={d.statut} size="small" color={statutColor[d.statut]} /></TableCell>
                  <TableCell>
                    {d.alerte && <Tooltip title={`${d.joursAttente}j d'attente`}><Chip icon={<Schedule sx={{ fontSize: '0.9rem !important' }} />} label={`${d.joursAttente}j`} size="small" color="error" variant="outlined" sx={{ mr: 0.5 }} /></Tooltip>}
                    {d.statut === 'En attente' && <Tooltip title="Valider"><IconButton size="small" color="success" onClick={() => handleValider(d)}><CheckCircle sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                    <Tooltip title="Détails"><IconButton size="small"><Visibility sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table></TableContainer>
          </Paper>
        )}
        {show.candidats && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Candidats ({filteredCandidats.length})</Typography>
              <Badge badgeContent={filteredCandidats.filter(c => c.enAttente).length} color="warning"><Schedule sx={{ color: '#ffa726' }} /></Badge>
            </Box>
            <TableContainer sx={{ maxHeight: 340 }}><Table size="small" stickyHeader><TableHead><TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Étape</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Action</TableCell>
            </TableRow></TableHead><TableBody>
              {filteredCandidats.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun résultat</TableCell></TableRow>}
              {filteredCandidats.map(c => (
                <TableRow key={c.numero} hover sx={{ bgcolor: c.enAttente ? 'rgba(255,167,38,0.04)' : 'inherit' }}>
                  <TableCell><Box><Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{c.nom}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{c.departement} · {c.experience} ans</Typography></Box></TableCell>
                  <TableCell><Chip label={c.source} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={c.etape} size="small" color={c.etape === 'Offre envoyée' ? 'success' : c.enAttente ? 'warning' : 'default'} /></TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.score !== null ? `${c.score}/20` : '—'}</TableCell>
                  <TableCell>
                    {c.enAttente && <Tooltip title="Relancer"><IconButton size="small" color="primary" onClick={() => handleRelancer(c)}><Send sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
                    <Tooltip title="Fiche"><IconButton size="small"><Visibility sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table></TableContainer>
          </Paper>
        )}
      </Box>

      {/* Faceted Search Drawer */}
      <FacetedSearchDrawer open={facetDrawer} onClose={() => setFacetDrawer(false)} facets={facets} onChange={handleFacetChange} />

      {/* FAB for quick faceted search */}
      <Fab color="primary" size="small" sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: currentRole.color }} onClick={() => setFacetDrawer(true)}>
        <Badge badgeContent={activeFacetCount} color="warning"><Tune /></Badge>
      </Fab>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}