import { ResponsiveGridLayout } from 'react-grid-layout';
import './dashboard-grid.css';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Badge, Alert, Snackbar, TextField,
  InputAdornment, Divider, Fab, Drawer, Slider, Switch, FormControlLabel,
} from '@mui/material';
import {
  Download, FilterListOff, Send, CheckCircle, Visibility,
  Schedule, Warning, TrendingUp, TrendingDown,
  Search, Tune, Close,
  ArrowForward, Lightbulb, Campaign, ReportProblem, Speed, PlayArrow,
  DragIndicator, ViewModule,
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
  { numero: 'DR-2025-008', poste: 'Chef Approvisionnement', departement: 'Logistique', statut: 'Validée', date: '2025-02-20', site: 'Siège', joursAttente: 0, alerte: false, priorite: 'haute', manager: 'M. Nkoulou Paul' },
  { numero: 'DR-2025-006', poste: 'Développeur Full Stack', departement: 'Informatique', statut: 'En attente', date: '2025-02-10', site: 'Siège', joursAttente: 20, alerte: true, priorite: 'haute', manager: 'M. Kamga Blaise' },
  { numero: 'DR-2025-003', poste: 'Comptable Senior', departement: 'Finance', statut: 'Validée', date: '2025-01-25', site: 'Annexe', joursAttente: 0, alerte: false, priorite: 'moyenne', manager: 'M. Tchouankou Jean' },
  { numero: 'DR-2025-004', poste: 'Agent Accueil', departement: 'Service Client', statut: 'Pourvue', date: '2025-02-01', site: 'Hôtel Sawa', joursAttente: 0, alerte: false, priorite: 'basse', manager: 'Mme. Eyenga Clarisse' },
  { numero: 'DR-2025-002', poste: 'Réceptionniste Nuit', departement: 'Hébergement', statut: 'En cours', date: '2025-01-20', site: 'Hôtel Sawa', joursAttente: 41, alerte: true, priorite: 'moyenne', manager: 'Mme. Fotso Marie' },
  { numero: 'DR-2025-001', poste: 'Chef Cuisinier', departement: 'Restauration', statut: 'En attente', date: '2025-01-15', site: 'Hôtel Sawa', joursAttente: 46, alerte: true, priorite: 'haute', manager: 'M. Ndiaye Moussa' },
  { numero: 'DR-2024-012', poste: 'Agent Sécurité', departement: 'Sécurité', statut: 'Clôturée', date: '2024-12-10', site: 'Siège', joursAttente: 0, alerte: false, priorite: 'basse', manager: 'M. Nganou André' },
  { numero: 'DR-2025-009', poste: 'Community Manager', departement: 'Marketing', statut: 'En attente', date: '2025-02-25', site: 'Siège', joursAttente: 5, alerte: false, priorite: 'moyenne', manager: 'Mme. Mebara Nadège' },
  { numero: 'DR-2025-010', poste: 'Serveur', departement: 'Restauration', statut: 'Validée', date: '2025-02-28', site: 'Hôtel Sawa', joursAttente: 0, alerte: false, priorite: 'basse', manager: 'M. Ndiaye Moussa' },
  { numero: 'DR-2025-011', poste: 'Commercial Senior', departement: 'Commercial', statut: 'En attente', date: '2025-02-18', site: 'Annexe', joursAttente: 12, alerte: false, priorite: 'haute', manager: 'M. Tabi Arnaud' },
];

const allCandidats = [
  { nom: 'Eyenga Clarisse', numero: 'CAN-006', source: 'Cooptation', etape: 'CV reçu', score: null, departement: 'Marketing', date: '2025-02-22', site: 'Siège', enAttente: false, experience: 3, joursEnAttente: 0 },
  { nom: 'Bikay Jean-Pierre', numero: 'CAN-004', source: 'LinkedIn', etape: 'Entretien HR', score: 14, departement: 'Informatique', date: '2025-02-05', site: 'Siège', enAttente: true, experience: 6, joursEnAttente: 15 },
  { nom: 'Nkoulou Brandon', numero: 'CAN-003', source: 'Site web', etape: 'Test technique', score: 10, departement: 'Informatique', date: '2025-01-28', site: 'Siège', enAttente: false, experience: 1, joursEnAttente: 0 },
  { nom: 'Kamga Blaise', numero: 'CAN-005', source: 'Cabinet', etape: 'Entretien HR', score: null, departement: 'Finance', date: '2025-02-12', site: 'Annexe', enAttente: true, experience: 4, joursEnAttente: 12 },
  { nom: 'Mebara Nadège', numero: 'CAN-007', source: 'Site web', etape: 'Offre envoyée', score: 17, departement: 'Service Client', date: '2025-01-20', site: 'Hôtel Sawa', enAttente: false, experience: 8, joursEnAttente: 0 },
  { nom: 'Ndiaye Moussa', numero: 'CAN-001', source: 'Cooptation', etape: 'Sélectionné', score: 18, departement: 'Restauration', date: '2025-01-10', site: 'Hôtel Sawa', enAttente: false, experience: 9, joursEnAttente: 0 },
  { nom: 'Nganou André', numero: 'CAN-002', source: 'Indeed', etape: 'Entretien technique', score: 12, departement: 'Sécurité', date: '2025-01-18', site: 'Siège', enAttente: false, experience: 5, joursEnAttente: 0 },
  { nom: 'Fotso Amandine', numero: 'CAN-008', source: 'LinkedIn', etape: 'CV reçu', score: null, departement: 'Hébergement', date: '2025-02-26', site: 'Hôtel Sawa', enAttente: false, experience: 2, joursEnAttente: 0 },
  { nom: 'Tabi Sandrine', numero: 'CAN-009', source: 'Site web', etape: 'Entretien HR', score: 15, departement: 'Restauration', date: '2025-02-15', site: 'Hôtel Sawa', enAttente: true, experience: 3, joursEnAttente: 18 },
  { nom: 'Ateba Chantal', numero: 'CAN-010', source: 'Cabinet', etape: 'Vérification refs', score: 16, departement: 'Hébergement', date: '2025-01-30', site: 'Annexe', enAttente: false, experience: 7, joursEnAttente: 0 },
];

const allEvolution = [
  { mois: 'Oct 2024', demandes: 3, pourvues: 1 },
  { mois: 'Nov 2024', demandes: 5, pourvues: 2 },
  { mois: 'Dec 2024', demandes: 4, pourvues: 3 },
  { mois: 'Jan 2025', demandes: 8, pourvues: 4 },
  { mois: 'Fev 2025', demandes: 10, pourvues: 5 },
];

const SOURCES = ['Site web', 'Cooptation', 'LinkedIn', 'Indeed', 'Cabinet', 'Autres'];
const ETAPES = ['CV reçu', 'Entretien HR', 'Test technique', 'Entretien technique', 'Vérification refs', 'Offre envoyée', 'Sélectionné', 'Rejeté'];
const KPI_KEYS = ['totalD', 'totalC', 'conversion', 'delai', 'enAttente', 'alertes'];
const statutColor = { 'Pourvue': 'success', 'En cours': 'warning', 'Validée': 'info', 'En attente': 'warning', 'Annulee': 'error', 'Brouillon': 'default', 'Publiée': 'info', 'Clôturée': 'default' };
const statutSeverity = { 'En attente': 'warning', 'En cours': 'error' };

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

/* ═══ FACETED SEARCH DRAWER ═══ */
function FacetedSearchDrawer({ open, onClose, facets, onChange }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 320, p: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" fontSize="1rem">Recherche avancée</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <TextField fullWidth size="small" placeholder="Rechercher..." value={facets.text || ''}
        onChange={e => onChange('text', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }} sx={{ mb: 2.5 }} />
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Statut</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {[...new Set(allDemandes.map(d => d.statut))].map(s => (
          <Chip key={s} label={s} size="small" variant={facets.statut === s ? 'filled' : 'outlined'}
            color={facets.statut === s ? 'primary' : 'default'} onClick={() => onChange('statut', facets.statut === s ? null : s)} />
        ))}
      </Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Source candidat</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {SOURCES.map(s => (
          <Chip key={s} label={s} size="small" variant={facets.source === s ? 'filled' : 'outlined'}
            color={facets.source === s ? 'primary' : 'default'} onClick={() => onChange('source', facets.source === s ? null : s)} />
        ))}
      </Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '0.8rem' }}>Étape recrutement</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}>
        {ETAPES.map(e => (
          <Chip key={e} label={e} size="small" variant={facets.etape === e ? 'filled' : 'outlined'}
            color={facets.etape === e ? 'primary' : 'default'} onClick={() => onChange('etape', facets.etape === e ? null : e)} />
        ))}
      </Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Score minimum</Typography>
      <Box sx={{ mb: 2.5 }}><Slider value={facets.minScore || 0} min={0} max={20} step={1} valueLabelDisplay="auto"
        marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
        onChange={(_, v) => onChange('minScore', v)} /></Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Expérience min. (années)</Typography>
      <Box sx={{ mb: 2.5 }}><Slider value={facets.minExp || 0} min={0} max={15} step={1} valueLabelDisplay="auto"
        marks={[{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10+' }]}
        onChange={(_, v) => onChange('minExp', v)} /></Box>
      <FormControlLabel control={<Switch checked={facets.alertesOnly || false} onChange={e => onChange('alertesOnly', e.target.checked)} color="warning" />}
        label={<Typography variant="body2" fontSize="0.8rem">Afficher uniquement les alertes</Typography>} sx={{ mb: 2 }} />
      <Divider sx={{ mb: 2 }} />
      <Button fullWidth variant="outlined" startIcon={<FilterListOff />} onClick={() => { onChange('reset', null); onClose(); }}>Réinitialiser tous les filtres</Button>
    </Drawer>
  );
}

/* ═══ SMART ALERT PANEL ═══ */
function SmartAlertPanel({ recommendations, onRelanceGlobale, hasRetard }) {
  if (!recommendations?.length) return null;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lightbulb sx={{ color: '#f57f17' }} />
          <Typography variant="subtitle2" fontWeight="bold">Recommandations</Typography>
          <Chip label={recommendations.length} size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
        </Box>
        {hasRetard && (
          <Button size="small" variant="outlined" startIcon={<Campaign />} onClick={onRelanceGlobale}
            sx={{ borderColor: '#ef5350', color: '#ef5350', '&:hover': { borderColor: '#c62828', bgcolor: '#ffebee' } }}>
            Relance globale ({hasRetard})
          </Button>
        )}
      </Box>
      {recommendations.map((rec, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: i < recommendations.length - 1 ? 1.5 : 0, p: 1, borderRadius: 1, bgcolor: rec.severity === 'error' ? 'rgba(239,83,80,0.06)' : 'rgba(255,167,38,0.06)' }}>
          <Box sx={{ mt: 0.3, color: rec.severity === 'error' ? '#d32f2f' : '#f57f17', flexShrink: 0 }}>{rec.icon}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{rec.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem', display: 'block', mt: 0.2 }}>{rec.desc}</Typography>
          </Box>
          {rec.action && (
            <Button size="small" variant="text" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={rec.action.onClick} sx={{ flexShrink: 0, mt: -0.5 }}>{rec.action.label}</Button>
          )}
        </Box>
      ))}
    </Box>
  );
}

/* ═══ WIDGET TITLE BAR (drag handle) ═══ */
function WidgetBar({ title, badge }) {
  return (
    <Box className="drag-handle" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, pt: 1.5, pb: 0.5, cursor: 'move', userSelect: 'none' }}>
      <DragIndicator sx={{ fontSize: 15, color: 'text.disabled', opacity: 0.5 }} />
      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem', flex: 1 }}>{title}</Typography>
      {badge}
    </Box>
  );
}

/* ═══ DEFAULT LAYOUTS PER ROLE ═══ */
const DEFAULT_LAYOUTS = {
  recruteur: [
    { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4, minW: 8, minH: 3 },
    { i: 'entretiens-jour', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'pipeline-resume', x: 0, y: 8, w: 12, h: 3, minW: 6, minH: 2 },
    { i: 'smart-alerts', x: 0, y: 11, w: 12, h: 5, minW: 6, minH: 2 },
    { i: 'table-candidats', x: 0, y: 16, w: 12, h: 10, minW: 6, minH: 5 },
  ],
  manager: [
    { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4, minW: 8, minH: 3 },
    { i: 'smart-alerts', x: 0, y: 4, w: 12, h: 5, minW: 6, minH: 2 },
    { i: 'chart-evolution', x: 0, y: 9, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'chart-sources', x: 6, y: 9, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'chart-statuts', x: 0, y: 16, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'chart-depart', x: 6, y: 16, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'couts-resume', x: 0, y: 23, w: 12, h: 3, minW: 6, minH: 2 },
    { i: 'table-demandes', x: 0, y: 26, w: 6, h: 10, minW: 4, minH: 5 },
    { i: 'table-candidats', x: 6, y: 26, w: 6, h: 10, minW: 4, minH: 5 },
  ],
  drh: [
    { i: 'kpi-cards', x: 0, y: 0, w: 12, h: 4, minW: 8, minH: 3 },
    { i: 'smart-alerts', x: 0, y: 4, w: 12, h: 5, minW: 6, minH: 2 },
    { i: 'chart-evolution', x: 0, y: 9, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'chart-depart', x: 6, y: 9, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'couts-resume', x: 0, y: 16, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'conformite-resume', x: 6, y: 16, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'chart-statuts', x: 0, y: 19, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'table-demandes', x: 6, y: 19, w: 6, h: 10, minW: 4, minH: 5 },
  ],
};

const LAYOUT_STORAGE = 'admina-grid-layout';

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function TableauDeBord() {
  const navigate = useNavigate();
  const demandesRef = useRef(null);
  const candidatsRef = useRef(null);

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
  const [drillKpi, setDrillKpi] = useState(null);

  /* ─── Grid layout persistence ─── */
  const [savedLayouts, setSavedLayouts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LAYOUT_STORAGE) || '{}'); } catch { return {}; }
  });

  const handleFacetChange = useCallback((key, val) => {
    if (key === 'reset') { setFacets({ text: '', statut: null, source: null, etape: null, minScore: 0, minExp: 0, alertesOnly: false }); setDrillKpi(null); return; }
    setFacets(prev => ({ ...prev, [key]: val })); setDrillKpi(null);
  }, []);

  /* ─── Filtered data ─── */
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

  /* ─── KPI Drill-Down ─── */
  function handleKpiClick(kpiKey) {
    const isTogglingOff = drillKpi === kpiKey;
    setDrillKpi(isTogglingOff ? null : kpiKey);
    if (isTogglingOff) { setFacets(p => ({ ...p, alertesOnly: false, statut: null })); return; }
    if (kpiKey === 'alertes') { setFacets(p => ({ ...p, alertesOnly: true, statut: null })); setTimeout(() => demandesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }
    else if (kpiKey === 'enAttente') { setFacets(p => ({ ...p, alertesOnly: true, statut: null })); setTimeout(() => candidatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }
    else if (kpiKey === 'pourvues' || kpiKey === 'conversion') { setFacets(p => ({ ...p, statut: 'Pourvue', alertesOnly: false })); setTimeout(() => demandesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }
    else if (kpiKey === 'delai') { setFacets(p => ({ ...p, alertesOnly: false, statut: null })); setTimeout(() => demandesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }
  }

  /* ─── Chart data (Phase 2: filtered by global filters) ─── */
  const chartSources = useMemo(() => {
    let data = filterByPeriod(allCandidats, periode);
    if (departement !== 'tout') data = data.filter(c => c.departement === departement);
    if (site !== 'tout') data = data.filter(c => c.site === site);
    const map = {}; data.forEach(c => { map[c.source] = (map[c.source] || 0) + 1; });
    return SOURCES.map(s => ({ source: s, valeur: map[s] || 0 })).filter(s => s.valeur > 0);
  }, [periode, departement, site]);
  const chartDepart = useMemo(() => {
    let data = filterByPeriod(allDemandes, periode);
    if (site !== 'tout') data = data.filter(d => d.site === site);
    const map = {}; data.forEach(d => { map[d.departement] = (map[d.departement] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periode, site]);
  const chartStatuts = useMemo(() => {
    let data = filterByPeriod(allDemandes, periode);
    if (departement !== 'tout') data = data.filter(d => d.departement === departement);
    if (site !== 'tout') data = data.filter(d => d.site === site);
    const map = {}; data.forEach(d => { map[d.statut] = (map[d.statut] || 0) + 1; });
    return Object.entries(map).map(([statut, valeur]) => ({ statut, valeur }));
  }, [periode, departement, site]);
  const chartEvolution = useMemo(() => {
    if (periode === 'tout') return allEvolution;
    if (periode === 'trimestre') return allEvolution.slice(2);
    return allEvolution.slice(4);
  }, [periode]);
  const displaySources = useMemo(() => activeSource ? chartSources.map(s => ({ ...s, valeur: s.source === activeSource ? s.valeur : 0 })) : chartSources, [chartSources, activeSource]);
  const displayStatuts = useMemo(() => activeStatut ? chartStatuts.map(s => ({ ...s, valeur: s.statut === activeStatut ? s.valeur : 0 })) : chartStatuts, [chartStatuts, activeStatut]);

  /* ─── Smart Recommendations (Phase 4) ─── */
  const recommendations = useMemo(() => {
    const recs = [];
    const deptDelay = {};
    filteredDemandes.forEach(d => {
      if (!deptDelay[d.departement]) deptDelay[d.departement] = { total: 0, alerte: 0, totalJours: 0, managers: new Set() };
      deptDelay[d.departement].total++; deptDelay[d.departement].totalJours += d.joursAttente || 0;
      if (d.alerte) deptDelay[d.departement].alerte++;
      if (d.manager) deptDelay[d.departement].managers.add(d.manager);
    });
    Object.entries(deptDelay).forEach(([dept, data]) => {
      const avg = data.total > 0 ? Math.round(data.totalJours / data.total) : 0;
      if (data.alerte > 0) recs.push({ severity: 'error', icon: <ReportProblem sx={{ fontSize: 20 }} />, title: `${dept} : ${data.alerte} demande(s) en retard`, desc: `Délai moyen ${avg}j — Manager(s): ${[...data.managers].join(', ')}. Suggérer un cabinet.`, action: { label: 'Filtrer', onClick: () => setDepartement(dept) } });
      else if (avg > 15) recs.push({ severity: 'warning', icon: <Speed sx={{ fontSize: 20 }} />, title: `${dept} : délai élevé (${avg}j)`, desc: "Proche de l'objectif de 21j — surveiller.", action: { label: 'Filtrer', onClick: () => setDepartement(dept) } });
    });
    const blockedLong = filteredCandidats.filter(c => c.enAttente && c.joursEnAttente >= 10);
    if (blockedLong.length > 0) recs.push({ severity: 'warning', icon: <Schedule sx={{ fontSize: 20 }} />, title: `${blockedLong.length} candidat(s) bloqué(s) >10j`, desc: blockedLong.map(c => `${c.nom} (${c.etape}, ${c.joursEnAttente}j)`).join(' | '), action: { label: 'Voir', onClick: () => { setFacets(p => ({ ...p, alertesOnly: true, statut: null })); setDrillKpi('enAttente'); setTimeout(() => candidatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); } } });
    const sourceMap = {};
    filteredCandidats.forEach(c => { if (!sourceMap[c.source]) sourceMap[c.source] = { total: 0, selected: 0 }; sourceMap[c.source].total++; if (['Sélectionné', 'Offre envoyée'].includes(c.etape)) sourceMap[c.source].selected++; });
    const worstSource = Object.entries(sourceMap).map(([s, d]) => ({ source: s, rate: d.total > 0 ? (d.selected / d.total * 100) : 0, total: d.total })).filter(s => s.total >= 2).sort((a, b) => a.rate - b.rate)[0];
    if (worstSource && worstSource.rate < 25) recs.push({ severity: 'warning', icon: <TrendingDown sx={{ fontSize: 20 }} />, title: `Source « ${worstSource.source} » sous-performante`, desc: `Conversion: ${worstSource.rate.toFixed(0)}% sur ${worstSource.total} candidats.`, action: { label: 'Voir', onClick: () => setActiveSource(worstSource.source) } });
    const hautesNonPourvues = filteredDemandes.filter(d => d.priorite === 'haute' && !['Pourvue', 'Clôturée'].includes(d.statut));
    if (hautesNonPourvues.length > 0) recs.push({ severity: 'error', icon: <Warning sx={{ fontSize: 20 }} />, title: `${hautesNonPourvues.length} poste(s) haute priorité non pourvu(s)`, desc: hautesNonPourvues.map(d => `${d.poste} (${d.departement})`).join(', '), action: { label: 'Voir', onClick: () => { setFacets(p => ({ ...p, alertesOnly: true, statut: null })); setDrillKpi('alertes'); setTimeout(() => demandesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); } } });
    return recs;
  }, [filteredDemandes, filteredCandidats, setDepartement, setActiveSource]);

  /* ─── Handlers ─── */
  const handleRelancer = useCallback((c) => { setSnack({ msg: `Relance envoyée à ${c.nom}`, severity: 'success' }); addNotification({ icon: 'send', color: '#0D7C66', msg: `Relance envoyée : ${c.nom}`, path: '/candidats' }); }, [addNotification]);
  const handleValider = useCallback((d) => { setSnack({ msg: `Demande ${d.numero} validée`, severity: 'success' }); addNotification({ icon: 'check_circle', color: '#2e7d32', msg: `Demande ${d.numero} validée`, path: '/offres' }); }, [addNotification]);
  const handleRappelerManager = useCallback((d) => { setSnack({ msg: `Rappel envoyé à ${d.manager}`, severity: 'info' }); addNotification({ icon: 'campaign', color: '#e65100', msg: `Rappel manager : ${d.poste}`, path: '/offres' }); }, [addNotification]);
  const handleRelanceGlobale = useCallback(() => { const n = filteredDemandes.filter(d => d.alerte).length; setSnack({ msg: `${n} rappel(s) envoyé(s)`, severity: 'success' }); addNotification({ icon: 'campaign', color: '#d32f2f', msg: `Relance globale : ${n} demandes`, path: '/offres' }); }, [filteredDemandes, addNotification]);
  const handleExporter = useCallback(() => { const rows = ['N°,Poste,Département,Statut,Date,Jours attente,Site,Manager']; filteredDemandes.forEach(d => rows.push(`${d.numero},${d.poste},${d.departement},${d.statut},${d.date},${d.joursAttente},${d.site},${d.manager}`)); const blob = new Blob([rows.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dashboard_export.csv'; a.click(); URL.revokeObjectURL(url); setSnack({ msg: 'Export CSV téléchargé', severity: 'info' }); }, [filteredDemandes]);
  const handleSourceClick = useCallback((data) => { if (data?.activePayload?.[0]) { const src = data.activePayload[0].payload.source; setActiveSource(prev => prev === src ? null : src); } }, [setActiveSource]);
  const handleStatutClick = useCallback((data) => { if (data?.activePayload?.[0]) { const st = data.activePayload[0].payload.statut; setActiveStatut(prev => prev === st ? null : st); } }, [setActiveStatut]);
  const goToCandidat = useCallback((n) => navigate(`/candidats?focus=${n}`), [navigate]);
  const goToFormation = useCallback((nom) => navigate(`/formation?candidat=${encodeURIComponent(nom)}`), [navigate]);
  const goToOffre = useCallback((n) => navigate(`/offres?focus=${n}`), [navigate]);

  const activeFacetCount = useMemo(() => [facets.statut, facets.source, facets.etape, facets.minScore > 0, facets.minExp > 0, facets.alertesOnly].filter(Boolean).length, [facets]);

  /* ─── Role visibility ─── */
  const show = useMemo(() => {
    const s = currentRole.sections;
    return { kpi: true, evolution: s.includes('evolution'), sources: s.includes('sources'), depart: s.includes('departement'), statuts: s.includes('statuts'), demandes: s.includes('demandesRecentes'), candidats: s.includes('candidatsRecents'), couts: s.includes('coutsResume'), conformite: s.includes('conformiteResume'), pipeline: s.includes('pipelineResume'), entretiens: s.includes('entretiensJour') };
  }, [currentRole]);

  /* ─── Grid layout logic (Phase 3) ─── */
  const visibleWidgetIds = useMemo(() => {
    const ids = [];
    if (show.kpi) ids.push('kpi-cards');
    if (recommendations.length > 0) ids.push('smart-alerts');
    if (show.entretiens) ids.push('entretiens-jour');
    if (show.pipeline) ids.push('pipeline-resume');
    if (show.evolution) ids.push('chart-evolution');
    if (show.sources) ids.push('chart-sources');
    if (show.depart) ids.push('chart-depart');
    if (show.statuts) ids.push('chart-statuts');
    if (show.couts) ids.push('couts-resume');
    if (show.conformite) ids.push('conformite-resume');
    if (show.demandes) ids.push('table-demandes');
    if (show.candidats) ids.push('table-candidats');
    return ids;
  }, [show, recommendations.length]);

  const currentLayout = useMemo(() => {
    const saved = savedLayouts[currentRole.key];
    const base = saved || DEFAULT_LAYOUTS[currentRole.key] || DEFAULT_LAYOUTS['manager'];
    return base.filter(item => visibleWidgetIds.includes(item.i));
  }, [currentRole.key, savedLayouts, visibleWidgetIds]);

  const handleLayoutChange = useCallback((layout) => {
    setSavedLayouts(prev => {
      const updated = { ...prev, [currentRole.key]: layout };
      try { localStorage.setItem(LAYOUT_STORAGE, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [currentRole.key]);

  const handleResetLayout = useCallback(() => {
    setSavedLayouts(prev => {
      const updated = { ...prev }; delete updated[currentRole.key];
      try { localStorage.setItem(LAYOUT_STORAGE, JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSnack({ msg: 'Mise en page réinitialisée', severity: 'info' });
  }, [currentRole.key]);

  const enRetardCount = filteredDemandes.filter(d => d.alerte).length;
  const sortedDemandes = useMemo(() => drillKpi === 'delai' ? [...filteredDemandes].sort((a, b) => (b.joursAttente || 0) - (a.joursAttente || 0)) : filteredDemandes, [filteredDemandes, drillKpi]);
  const selectSx = { minWidth: 150, '& .MuiSelect-select': { py: 1, fontSize: '0.8rem' } };
  const entretiensJour = [
    { heure: '09:00', candidat: 'Bikay Jean-Pierre', poste: 'Développeur Full Stack', type: 'HR' },
    { heure: '10:30', candidat: 'Tabi Sandrine', poste: 'Serveuse', type: 'Technique' },
    { heure: '14:00', candidat: 'Kamga Blaise', poste: 'Comptable', type: 'HR' },
  ];


  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">Tableau de Bord</Typography>
            <Chip label={currentRole.label} size="small" sx={{ bgcolor: `${currentRole.color}18`, color: currentRole.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">Vue d'ensemble — {currentRole.desc}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Réinitialiser la mise en page"><IconButton size="small" onClick={handleResetLayout}><ViewModule sx={{ fontSize: 18 }} /></IconButton></Tooltip>
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
        {drillKpi && <FilterChip label={`Drill: ${kpis[KPI_KEYS.indexOf(drillKpi)]?.titre || drillKpi}`} onRemove={() => handleKpiClick(drillKpi)} />}
        {hasActiveFilters && <Button size="small" variant="text" startIcon={<FilterListOff />} onClick={() => { resetFilters(); handleFacetChange('reset', null); setDrillKpi(null); }} sx={{ ml: 1, color: '#ef5350' }}>Réinitialiser</Button>}
      </Paper>

      {/* ═══ PHASE 3: DRAG & DROP GRID ═══ */}
      <ResponsiveGridLayout
        key={currentRole.key}
        layout={currentLayout}
        layouts={{ lg: currentLayout }}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 900, md: 600, sm: 0 }}
        cols={{ lg: 12, md: 6, sm: 1 }}
        rowHeight={38}
        margin={[12, 12]}
        compactType="vertical"
        isDraggable
        isResizable
        draggableHandle=".drag-handle"
        isBounded
      >
        {show.kpi && (
          <div key="kpi-cards" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <WidgetBar title="Indicateurs Clés (KPIs)" />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {kpis.map((k, idx) => {
                    const key = KPI_KEYS[idx]; const isDrilled = drillKpi === key;
                    return (
                      <Paper key={k.titre} onClick={() => handleKpiClick(key)}
                        sx={{ p: 1.5, flex: '1 1 130px', minWidth: 130, position: 'relative', cursor: 'pointer',
                          borderLeft: isDrilled ? '4px solid #0D7C66' : k.alerte ? '4px solid #ef5350' : '4px solid transparent',
                          border: isDrilled ? '2px solid #0D7C66' : undefined, bgcolor: isDrilled ? '#f0fdf4' : undefined,
                          transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' } }}>
                        {isDrilled && <Chip label="Filtré" size="small" sx={{ position: 'absolute', top: 4, right: 4, height: 16, fontSize: '0.55rem', bgcolor: '#0D7C66', color: 'white' }} />}
                        {!isDrilled && k.alerte && <Tooltip title={k.alerteMsg}><Warning sx={{ position: 'absolute', top: 6, right: 6, fontSize: 16, color: '#ef5350' }} /></Tooltip>}
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.titre}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 0.3 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>{k.valeur}</Typography>
                          {k.tendance && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>{k.up ? <TrendingUp sx={{ fontSize: 12, color: '#2e7d32' }} /> : <TrendingDown sx={{ fontSize: 12, color: k.alerte ? '#ef5350' : '#2e7d32' }} />}<Typography variant="caption" sx={{ color: k.up ? '#2e7d32' : '#ef5350', fontWeight: 600, fontSize: '0.65rem' }}>{k.tendance}</Typography></Box>}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{k.sousTexte}</Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            </Paper>
          </div>
        )}
        {recommendations.length > 0 && (
          <div key="smart-alerts" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '4px solid #ffa726', bgcolor: '#fffbeb' }}>
              <WidgetBar title="Recommandations intelligentes" badge={<Chip label={recommendations.length} size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />} />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <SmartAlertPanel recommendations={recommendations} onRelanceGlobale={handleRelanceGlobale} hasRetard={enRetardCount > 0 ? enRetardCount : null} />
              </Box>
            </Paper>
          </div>
        )}
        {show.entretiens && (
          <div key="entretiens-jour" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '4px solid #1976d2' }}>
              <WidgetBar title="Entretiens du jour" badge={<Chip label={`${entretiensJour.length} prévus`} size="small" color="primary" />} />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                  {entretiensJour.map((e, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, minWidth: 200, flexShrink: 0, borderColor: '#e0e0e0' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', fontSize: '1.1rem' }}>{e.heure}</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>{e.candidat}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.poste}</Typography>
                      <Chip label={e.type} size="small" sx={{ mt: 1, bgcolor: e.type === 'HR' ? '#e3f2fd' : '#fff3e0', color: e.type === 'HR' ? '#1976d2' : '#e65100', fontSize: '0.65rem' }} />
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </div>
        )}
        {show.pipeline && (
          <div key="pipeline-resume" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <WidgetBar title="Pipeline candidatures" />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                  {ETAPES.slice(0, 6).map(etape => {
                    const count = allCandidats.filter(c => c.etape === etape).length;
                    return <Paper key={etape} variant="outlined" sx={{ p: 1.5, minWidth: 90, textAlign: 'center', flexShrink: 0, borderColor: '#e0e0e0' }}><Typography variant="h6" fontWeight="bold" color="#1976d2">{count}</Typography><Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{etape}</Typography></Paper>;
                  })}
                </Box>
              </Box>
            </Paper>
          </div>
        )}
        {show.evolution && (
          <div key="chart-evolution" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <WidgetBar title="Évolution du Recrutement" />
              <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartEvolution}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mois" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><RTooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line type="monotone" dataKey="demandes" stroke="#1976d2" name="Demandes" strokeWidth={2} dot={{ r: 4 }} /><Line type="monotone" dataKey="pourvues" stroke="#0D7C66" name="Pourvues" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </div>
        )}
        {show.sources && (
          <div key="chart-sources" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: activeSource ? '2px solid #0D7C66' : 'none' }}>
              <WidgetBar title="Sources de Recrutement" badge={activeSource ? <Chip label={activeSource} size="small" color="primary" onDelete={() => setActiveSource(null)} /> : undefined} />
              <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Cliquer pour filtrer</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displaySources} layout="vertical" onClick={handleSourceClick} style={{ cursor: 'pointer' }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={75} /><RTooltip content={<ChartTooltip clickable />} /><Bar dataKey="valeur" name="Candidats" radius={[0, 4, 4, 0]}>{displaySources.map((s, i) => <Cell key={i} fill={activeSource && s.source !== activeSource ? '#e0e0e0' : COLORS[i % COLORS.length]} />)}</Bar></BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </div>
        )}
        {show.depart && (
          <div key="chart-depart" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <WidgetBar title="Répartition par Département" />
              <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartDepart} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>{chartDepart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><RTooltip /></PieChart></ResponsiveContainer>
              </Box>
            </Paper>
          </div>
        )}
        {show.statuts && (
          <div key="chart-statuts" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: activeStatut ? '2px solid #0D7C66' : 'none' }}>
              <WidgetBar title="Statuts des Demandes" badge={activeStatut ? <Chip label={activeStatut} size="small" color="primary" onDelete={() => setActiveStatut(null)} /> : undefined} />
              <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Cliquer pour filtrer</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayStatuts} onClick={handleStatutClick} style={{ cursor: 'pointer' }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="statut" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={45} /><YAxis tick={{ fontSize: 11 }} /><RTooltip content={<ChartTooltip clickable />} /><Bar dataKey="valeur" name="Demandes" radius={[4, 4, 0, 0]}>{displayStatuts.map((s, i) => { const sev = statutSeverity[s.statut]; return <Cell key={i} fill={activeStatut && s.statut !== activeStatut ? '#e0e0e0' : sev === 'error' ? '#ef5350' : sev === 'warning' ? '#ffa726' : '#42a5f5'} />; })}</Bar></BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </div>
        )}
        {show.couts && (
          <div key="couts-resume" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '4px solid #7b1fa2' }}>
              <WidgetBar title="Résumé des Coûts" />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[{ label: 'Budget annuel', val: '12 500 000 FCFA', sub: 'Prévisionnel 2025' }, { label: 'Coût moyen / embauche', val: '285 000 FCFA', sub: '-8% vs 2024' }, { label: 'Coût par source', val: 'LinkedIn: 42 000 FCFA', sub: 'Source la + chère' }].map((c, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, flex: '1 1 160px' }}><Typography variant="caption" color="text.secondary">{c.label}</Typography><Typography variant="h6" fontWeight="bold" sx={{ color: '#7b1fa2' }}>{c.val}</Typography><Typography variant="caption" color="text.secondary">{c.sub}</Typography></Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </div>
        )}
        {show.conformite && (
          <div key="conformite-resume" style={{ overflow: 'hidden' }}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '4px solid #d32f2f' }}>
              <WidgetBar title="Conformité & Risques" />
              <Box sx={{ flex: 1, px: 2, pb: 2, overflow: 'auto', minHeight: 0 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[{ label: 'Taux conformité', val: '92%', ok: true }, { label: 'Documents manquants', val: '3', ok: false }, { label: 'Contrats < 30j', val: '1', ok: false }].map((c, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, flex: '1 1 130px', borderLeft: `3px solid ${c.ok ? '#2e7d32' : '#ef5350'}` }}><Typography variant="caption" color="text.secondary">{c.label}</Typography><Typography variant="h6" fontWeight="bold" sx={{ color: c.ok ? '#2e7d32' : '#ef5350' }}>{c.val}</Typography></Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </div>
        )}
        {show.demandes && (
          <div key="table-demandes" style={{ overflow: 'hidden' }}>
            <Paper ref={demandesRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'box-shadow 0.3s', boxShadow: drillKpi && ['alertes', 'delai', 'conversion', 'pourvues'].includes(drillKpi) ? '0 0 0 2px #0D7C66' : undefined }}>
              <WidgetBar title={`Demandes (${sortedDemandes.length})`} badge={<Badge badgeContent={sortedDemandes.filter(d => d.alerte).length} color="error"><Warning sx={{ color: '#ef5350' }} /></Badge>} />
              <TableContainer sx={{ flex: 1, overflow: 'auto' }}><Table size="small" stickyHeader><TableHead><TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>N°</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Poste</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Actions</TableCell>
              </TableRow></TableHead><TableBody>
                {sortedDemandes.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun résultat</TableCell></TableRow>}
                {sortedDemandes.map(d => (
                  <TableRow key={d.numero} hover sx={{ bgcolor: d.alerte ? 'rgba(239,83,80,0.04)' : 'inherit' }}>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{d.numero}</TableCell>
                    <TableCell><Box><Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{d.poste}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{d.departement}</Typography></Box></TableCell>
                    <TableCell><Chip label={d.statut} size="small" color={statutColor[d.statut]} /></TableCell>
                    <TableCell>
                      {d.alerte && <Tooltip title={`Rappeler ${d.manager} (${d.joursAttente}j)`}><IconButton size="small" color="warning" onClick={() => handleRappelerManager(d)}><Campaign sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
                      {d.statut === 'En attente' && <Tooltip title="Valider"><IconButton size="small" color="success" onClick={() => handleValider(d)}><CheckCircle sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                      <Tooltip title="Voir la demande"><IconButton size="small" onClick={() => goToOffre(d.numero)}><Visibility sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody></Table></TableContainer>
            </Paper>
          </div>
        )}
        {show.candidats && (
          <div key="table-candidats" style={{ overflow: 'hidden' }}>
            <Paper ref={candidatsRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'box-shadow 0.3s', boxShadow: drillKpi === 'enAttente' ? '0 0 0 2px #0D7C66' : undefined }}>
              <WidgetBar title={`Candidats (${filteredCandidats.length})`} badge={<Badge badgeContent={filteredCandidats.filter(c => c.enAttente).length} color="warning"><Schedule sx={{ color: '#ffa726' }} /></Badge>} />
              <TableContainer sx={{ flex: 1, overflow: 'auto' }}><Table size="small" stickyHeader><TableHead><TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Étape</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Actions</TableCell>
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
                      <Tooltip title="Fiche candidat"><IconButton size="small" onClick={() => goToCandidat(c.numero)}><Visibility sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      <Tooltip title="Formation"><IconButton size="small" onClick={() => goToFormation(c.nom)}><PlayArrow sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody></Table></TableContainer>
            </Paper>
          </div>
        )}
      </ResponsiveGridLayout>

      {/* FAB + Drawer + Snackbar */}
      <Fab color="primary" size="small" sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: currentRole.color }} onClick={() => setFacetDrawer(true)}>
        <Badge badgeContent={activeFacetCount} color="warning"><Tune /></Badge>
      </Fab>
      <FacetedSearchDrawer open={facetDrawer} onClose={() => setFacetDrawer(false)} facets={facets} onChange={handleFacetChange} />
      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}
