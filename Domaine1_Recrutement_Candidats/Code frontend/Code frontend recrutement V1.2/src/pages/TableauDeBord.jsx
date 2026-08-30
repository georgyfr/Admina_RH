import { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Badge, Fade, Zoom, Alert, Divider, Snackbar,
} from '@mui/material';
import {
  Download, Refresh, FilterListOff, Send, CheckCircle, Visibility,
  Schedule, Warning, TrendingUp, TrendingDown, FiberManualRecord,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend, Tooltip as RTooltip,
} from 'recharts';
import { useDashboardFilters } from '../context/DashboardFilterContext';
import { useApp } from '../context/AppContext';

const COLORS = ['#1976d2', '#42a5f5', '#0D7C66', '#ffa726', '#ef5350', '#ab47bc', '#26c6da', '#8d6e63'];

/* ─── Enriched data with department, site, date, alert fields ─── */

const allDemandes = [
  { numero: 'DR-2025-008', poste: 'Chef Approvisionnement', departement: 'Logistique', statut: 'Validée', date: '2025-02-20', site: 'Siège', joursAttente: 0, alerte: false },
  { numero: 'DR-2025-006', poste: 'Développeur Full Stack', departement: 'Informatique', statut: 'En attente', date: '2025-02-10', site: 'Siège', joursAttente: 20, alerte: true },
  { numero: 'DR-2025-003', poste: 'Comptable Senior', departement: 'Finance', statut: 'Validée', date: '2025-01-25', site: 'Annexe', joursAttente: 0, alerte: false },
  { numero: 'DR-2025-004', poste: 'Agent Accueil', departement: 'Service Client', statut: 'Pourvue', date: '2025-02-01', site: 'Hôtel Sawa', joursAttente: 0, alerte: false },
  { numero: 'DR-2025-002', poste: 'Réceptionniste Nuit', departement: 'Hébergement', statut: 'En cours', date: '2025-01-20', site: 'Hôtel Sawa', joursAttente: 41, alerte: true },
  { numero: 'DR-2025-001', poste: 'Chef Cuisinier', departement: 'Restauration', statut: 'En attente', date: '2025-01-15', site: 'Hôtel Sawa', joursAttente: 46, alerte: true },
  { numero: 'DR-2024-012', poste: 'Agent Sécurité', departement: 'Sécurité', statut: 'Clôturée', date: '2024-12-10', site: 'Siège', joursAttente: 0, alerte: false },
  { numero: 'DR-2025-009', poste: 'Community Manager', departement: 'Marketing', statut: 'En attente', date: '2025-02-25', site: 'Siège', joursAttente: 5, alerte: false },
  { numero: 'DR-2025-010', poste: 'Serveur', departement: 'Restauration', statut: 'Validée', date: '2025-02-28', site: 'Hôtel Sawa', joursAttente: 0, alerte: false },
  { numero: 'DR-2025-011', poste: 'Commercial Senior', departement: 'Commercial', statut: 'En attente', date: '2025-02-18', site: 'Annexe', joursAttente: 12, alerte: false },
];

const allCandidats = [
  { nom: 'Eyenga Clarisse', numero: 'CAN-006', source: 'Cooptation', etape: 'CV reçu', score: null, departement: 'Marketing', date: '2025-02-22', site: 'Siège', enAttente: false },
  { nom: 'Bikay Jean-Pierre', numero: 'CAN-004', source: 'LinkedIn', etape: 'Entretien HR', score: 14, departement: 'Informatique', date: '2025-02-05', site: 'Siège', enAttente: true },
  { nom: 'Nkoulou Brandon', numero: 'CAN-003', source: 'Site web', etape: 'Test technique', score: 10, departement: 'Informatique', date: '2025-01-28', site: 'Siège', enAttente: false },
  { nom: 'Kamga Blaise', numero: 'CAN-005', source: 'Cabinet', etape: 'Entretien HR', score: null, departement: 'Finance', date: '2025-02-12', site: 'Annexe', enAttente: true },
  { nom: 'Mebara Nadège', numero: 'CAN-007', source: 'Site web', etape: 'Offre envoyée', score: 17, departement: 'Service Client', date: '2025-01-20', site: 'Hôtel Sawa', enAttente: false },
  { nom: 'Ndiaye Moussa', numero: 'CAN-001', source: 'Cooptation', etape: 'Sélectionné', score: 18, departement: 'Restauration', date: '2025-01-10', site: 'Hôtel Sawa', enAttente: false },
  { nom: 'Nganou André', numero: 'CAN-002', source: 'Indeed', etape: 'Entretien technique', score: 12, departement: 'Sécurité', date: '2025-01-18', site: 'Siège', enAttente: false },
  { nom: 'Fotso Amandine', numero: 'CAN-008', source: 'LinkedIn', etape: 'CV reçu', score: null, departement: 'Hébergement', date: '2025-02-26', site: 'Hôtel Sawa', enAttente: false },
  { nom: 'Tabi Sandrine', numero: 'CAN-009', source: 'Site web', etape: 'Entretien HR', score: 15, departement: 'Restauration', date: '2025-02-15', site: 'Hôtel Sawa', enAttente: true },
  { nom: 'Ateba Chantal', numero: 'CAN-010', source: 'Cabinet', etape: 'Vérification refs', score: 16, departement: 'Hébergement', date: '2025-01-30', site: 'Annexe', enAttente: false },
];

const allEvolution = [
  { mois: 'Oct 2024', demandes: 3, pourvues: 1, departement: null },
  { mois: 'Nov 2024', demandes: 5, pourvues: 2, departement: null },
  { mois: 'Dec 2024', demandes: 4, pourvues: 3, departement: null },
  { mois: 'Jan 2025', demandes: 8, pourvues: 4, departement: null },
  { mois: 'Fev 2025', demandes: 10, pourvues: 5, departement: null },
];

const allSources = [
  { source: 'Site web', valeur: 32 },
  { source: 'Cooptation', valeur: 28 },
  { source: 'LinkedIn', valeur: 25 },
  { source: 'Indeed', valeur: 18 },
  { source: 'Cabinet', valeur: 22 },
  { source: 'Autres', valeur: 27 },
];

const allDepart = [
  { name: 'Restauration', value: 18 },
  { name: 'Hébergement', value: 15 },
  { name: 'Finance', value: 12 },
  { name: 'Informatique', value: 10 },
  { name: 'Sécurité', value: 9 },
  { name: 'Service Client', value: 13 },
  { name: 'Marketing', value: 11 },
  { name: 'Logistique', value: 12 },
];

const allStatuts = [
  { statut: 'Brouillon', valeur: 1 },
  { statut: 'En attente', valeur: 3 },
  { statut: 'Validée', valeur: 3 },
  { statut: 'Publiée', valeur: 1 },
  { statut: 'Pourvue', valeur: 1 },
  { statut: 'En cours', valeur: 1 },
  { statut: 'Clôturée', valeur: 1 },
];

const statutColor = {
  'Pourvue': 'success', 'En cours': 'warning', 'Validée': 'info',
  'En attente': 'warning', 'Annulee': 'error', 'Brouillon': 'default',
  'Publiée': 'info', 'Clôturée': 'default',
};

const statutSeverity = {
  'En attente': 'warning', 'En cours': 'error',
};

/* ─── Period filter helper ─── */
function filterByPeriod(items, periode) {
  if (periode === 'tout') return items;
  const now = new Date('2025-03-01');
  let cutoff;
  if (periode === 'mois') cutoff = new Date('2025-02-01');
  else if (periode === 'trimestre') cutoff = new Date('2025-01-01');
  else cutoff = new Date('2025-01-01');
  return items.filter(i => new Date(i.date) >= cutoff);
}

/* ─── Custom Recharts tooltip with click hint ─── */
function ChartTooltip({ active, payload, label, clickable }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, boxShadow: 3, maxWidth: 220 }}>
      <Typography variant="caption" fontWeight="bold">{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" sx={{ color: p.color, mt: 0.3 }}>
          {p.name}: <strong>{p.value}</strong>
        </Typography>
      ))}
      {clickable && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontStyle: 'italic' }}>
          Cliquer pour filtrer
        </Typography>
      )}
    </Paper>
  );
}

/* ─── Active filter chip ─── */
function FilterChip({ label, onRemove }) {
  return (
    <Chip
      label={label}
      size="small"
      onDelete={onRemove}
      sx={{ ml: 1, bgcolor: 'rgba(13,124,102,0.1)', borderColor: '#0D7C66', '& .MuiChip-deleteIcon': { color: '#0D7C66' } }}
      variant="outlined"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function TableauDeBord() {
  const {
    periode, setPeriode, departement, setDepartement, site, setSite,
    activeSource, setActiveSource, activeStatut, setActiveStatut,
    resetFilters, hasActiveFilters,
    PERIODES, DEPARTEMENTS, SITES,
  } = useDashboardFilters();
  const { addNotification } = useApp();
  const [snack, setSnack] = useState(null);

  /* ─── Filtered data ─── */
  const filteredDemandes = useMemo(() => {
    let data = filterByPeriod(allDemandes, periode);
    if (departement !== 'tout') data = data.filter(d => d.departement === departement);
    if (site !== 'tout') data = data.filter(d => d.site === site);
    if (activeStatut) data = data.filter(d => d.statut === activeStatut);
    return data;
  }, [periode, departement, site, activeStatut]);

  const filteredCandidats = useMemo(() => {
    let data = filterByPeriod(allCandidats, periode);
    if (departement !== 'tout') data = data.filter(c => c.departement === departement);
    if (site !== 'tout') data = data.filter(c => c.site === site);
    if (activeSource) data = data.filter(c => c.source === activeSource);
    return data;
  }, [periode, departement, site, activeSource]);

  /* ─── Computed KPIs ─── */
  const kpis = useMemo(() => {
    const totalDemandes = filteredDemandes.length;
    const demandesOuvertes = filteredDemandes.filter(d => ['En attente', 'En cours', 'Validée', 'Publiée'].includes(d.statut)).length;
    const totalCandidats = filteredCandidats.length;
    const candidatsActifs = filteredCandidats.filter(c => !['Sélectionné', 'Rejeté'].includes(c.etape)).length;
    const pourvues = filteredDemandes.filter(d => d.statut === 'Pourvue').length;
    const tauxConversion = totalCandidats > 0 ? ((pourvues / totalCandidats) * 100).toFixed(1) : '0.0';
    const enRetard = filteredDemandes.filter(d => d.alerte).length;
    const enAttenteDecision = filteredCandidats.filter(c => c.enAttente).length;
    const delaiMoyen = totalDemandes > 0
      ? Math.round(filteredDemandes.reduce((s, d) => s + (d.joursAttente || 0), 0) / totalDemandes) || 27
      : 0;

    return [
      { titre: 'Total Demandes', valeur: totalDemandes, sousTexte: `${demandesOuvertes} ouvertes`, tendance: '+12%', up: true, alerte: enRetard > 0, alerteMsg: `${enRetard} en retard` },
      { titre: 'Total Candidats', valeur: totalCandidats, sousTexte: `${candidatsActifs} actifs`, tendance: '+8%', up: true, alerte: false },
      { titre: 'Taux de Conversion', valeur: `${tauxConversion}%`, sousTexte: `${pourvues} retenus / ${totalCandidats}`, tendance: '+3.2%', up: true, alerte: parseFloat(tauxConversion) < 15, alerteMsg: 'Sous objectif' },
      { titre: 'Délai Moyen', valeur: delaiMoyen ? `${delaiMoyen} j` : '—', sousTexte: 'jours ouvrés', tendance: '-5 j', up: false, alerte: delaiMoyen > 30, alerteMsg: 'Objectif dépassé' },
      { titre: 'En Attente Décision', valeur: enAttenteDecision, sousTexte: 'candidats bloqués', tendance: enAttenteDecision > 3 ? '+2' : '0', up: enAttenteDecision > 3, alerte: enAttenteDecision >= 3, alerteMsg: 'Relance nécessaire' },
      { titre: 'Alertes', valeur: enRetard, sousTexte: 'demandes en retard', tendance: null, up: null, alerte: enRetard > 0, alerteMsg: `${enRetard} action(s) requise(s)` },
    ];
  }, [filteredDemandes, filteredCandidats]);

  /* ─── Filtered chart data ─── */
  const filteredSources = useMemo(() => {
    if (!activeSource) return allSources;
    return allSources.map(s => ({ ...s, valeur: s.source === activeSource ? s.valeur : 0 }));
  }, [activeSource]);

  const filteredDepart = useMemo(() => {
    if (departement === 'tout') return allDepart;
    return allDepart.map(d => ({ ...d, value: d.name === departement ? d.value : 0 }));
  }, [departement]);

  const filteredStatuts = useMemo(() => {
    if (!activeStatut) return allStatuts;
    return allStatuts.map(s => ({ ...s, valeur: s.statut === activeStatut ? s.valeur : 0 }));
  }, [activeStatut]);

  /* ─── Quick actions ─── */
  const handleRelancer = useCallback((candidat) => {
    setSnack({ msg: `Relance envoyée à ${candidat.nom}`, severity: 'success' });
    addNotification({ icon: 'send', color: '#0D7C66', msg: `Relance envoyée : ${candidat.nom}`, path: '/candidats' });
  }, [addNotification]);

  const handleValider = useCallback((demande) => {
    setSnack({ msg: `Demande ${demande.numero} validée`, severity: 'success' });
    addNotification({ icon: 'check_circle', color: '#2e7d32', msg: `Demande ${demande.numero} validée`, path: '/offres' });
  }, [addNotification]);

  const handleExporter = useCallback(() => {
    const rows = ['N°,Poste,Département,Statut,Date,Jours attente,Site'];
    filteredDemandes.forEach(d => rows.push(`${d.numero},${d.poste},${d.departement},${d.statut},${d.date},${d.joursAttente},${d.site}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dashboard_export.csv'; a.click();
    URL.revokeObjectURL(url);
    setSnack({ msg: 'Export CSV téléchargé', severity: 'info' });
  }, [filteredDemandes]);

  /* ─── Click-to-filter handlers ─── */
  const handleSourceClick = useCallback((data) => {
    if (data?.activePayload?.[0]) {
      const src = data.activePayload[0].payload.source;
      setActiveSource(prev => prev === src ? null : src);
    }
  }, [setActiveSource]);

  const handleStatutClick = useCallback((data) => {
    if (data?.activePayload?.[0]) {
      const st = data.activePayload[0].payload.statut;
      setActiveStatut(prev => prev === st ? null : st);
    }
  }, [setActiveStatut]);

  /* ─── Styles ─── */
  const selectSx = { minWidth: 160, '& .MuiSelect-select': { py: 1, fontSize: '0.8rem' } };
  const filterBarSx = {
    display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
    p: 1.5, mb: 2, borderRadius: 2,
    bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
  };

  return (
    <Box>
      {/* ─── Header ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Tableau de Bord</Typography>
          <Typography variant="body2" color="text.secondary">Vue d'ensemble interactif de votre activité de recrutement</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download fontSize="small" />} onClick={handleExporter} size="small">
            Exporter
          </Button>
          <IconButton onClick={() => window.location.reload()}><Refresh fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* ─── Global Filter Bar ─── */}
      <Paper elevation={0} sx={filterBarSx}>
        <FilterListOff sx={{ color: 'text.secondary', fontSize: 20 }} />
        <FormControl size="small" sx={selectSx}>
          <InputLabel>Période</InputLabel>
          <Select value={periode} label="Période" onChange={e => setPeriode(e.target.value)}>
            {PERIODES.map(p => <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={selectSx}>
          <InputLabel>Département</InputLabel>
          <Select value={departement} label="Département" onChange={e => setDepartement(e.target.value)}>
            {DEPARTEMENTS.map(d => <MenuItem key={d.key} value={d.key}>{d.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={selectSx}>
          <InputLabel>Site</InputLabel>
          <Select value={site} label="Site" onChange={e => setSite(e.target.value)}>
            {SITES.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        {/* Active filter chips */}
        {activeSource && <FilterChip label={`Source: ${activeSource}`} onRemove={() => setActiveSource(null)} />}
        {activeStatut && <FilterChip label={`Statut: ${activeStatut}`} onRemove={() => setActiveStatut(null)} />}
        {hasActiveFilters && (
          <Button size="small" variant="text" startIcon={<FilterListOff />} onClick={resetFilters} sx={{ ml: 1, color: '#ef5350' }}>
            Réinitialiser
          </Button>
        )}
      </Paper>

      {/* ─── Insight alert banner ─── */}
      {kpis[5].valeur > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-icon': { alignItems: 'center' } }}
          action={
            <Button size="small" color="inherit" variant="outlined" onClick={() => setDepartement('tout')}>
              Voir les détails
            </Button>
          }
        >
          <strong>{kpis[5].valeur} demande(s) en retard</strong> — Le délai moyen de recrutement dépasse la cible sur certains postes.
          Passez en revue les demandes <strong>"En attente"</strong> et <strong>"En cours"</strong>.
        </Alert>
      )}

      {/* ─── KPI Cards ─── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {kpis.map(k => (
          <Paper
            key={k.titre}
            sx={{
              p: 2, flex: '1 1 160px', minWidth: 155, position: 'relative',
              borderLeft: k.alerte ? '4px solid #ef5350' : '4px solid transparent',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
            }}
          >
            {k.alerte && (
              <Tooltip title={k.alerteMsg}>
                <Warning sx={{ position: 'absolute', top: 8, right: 8, fontSize: 18, color: '#ef5350' }} />
              </Tooltip>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.titre}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 0.5 }}>
              <Typography variant="h5" fontWeight="bold">{k.valeur}</Typography>
              {k.tendance && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  {k.up ? <TrendingUp sx={{ fontSize: 14, color: '#2e7d32' }} /> : <TrendingDown sx={{ fontSize: 14, color: k.alerte ? '#ef5350' : '#2e7d32' }} />}
                  <Typography variant="caption" sx={{ color: k.up ? '#2e7d32' : '#ef5350', fontWeight: 600, fontSize: '0.7rem' }}>{k.tendance}</Typography>
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{k.sousTexte}</Typography>
          </Paper>
        ))}
      </Box>

      {/* ─── Charts Row 1 ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
        <Paper sx={{ p: 2, position: 'relative' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Évolution du Recrutement</Typography>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={allEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="demandes" stroke="#1976d2" name="Demandes créées" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="pourvues" stroke="#0D7C66" name="Demandes pourvues" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Sources — Click to filter */}
        <Paper sx={{ p: 2, position: 'relative', border: activeSource ? '2px solid #0D7C66' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">Sources de Recrutement</Typography>
            {activeSource && <Chip label={activeSource} size="small" color="primary" onDelete={() => setActiveSource(null)} />}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Cliquer sur une barre pour filtrer les candidats</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredSources} layout="vertical" onClick={handleSourceClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={80} />
              <RTooltip content={<ChartTooltip clickable />} />
              <Bar dataKey="valeur" name="Candidats" radius={[0, 4, 4, 0]}>
                {filteredSources.map((s, i) => (
                  <Cell key={i} fill={activeSource && s.source !== activeSource ? '#e0e0e0' : COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* ─── Charts Row 2 ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Répartition par Département</Typography>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={filteredDepart} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                {filteredDepart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Statuts — Click to filter */}
        <Paper sx={{ p: 2, position: 'relative', border: activeStatut ? '2px solid #0D7C66' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">Statuts des Demandes</Typography>
            {activeStatut && <Chip label={activeStatut} size="small" color="primary" onDelete={() => setActiveStatut(null)} />}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Cliquer sur une barre pour filtrer le tableau</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredStatuts} onClick={handleStatutClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="statut" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip content={<ChartTooltip clickable />} />
              <Bar dataKey="valeur" name="Demandes" radius={[4, 4, 0, 0]}>
                {filteredStatuts.map((s, i) => {
                  const sev = statutSeverity[s.statut];
                  const baseColor = sev === 'error' ? '#ef5350' : sev === 'warning' ? '#ffa726' : '#42a5f5';
                  return <Cell key={i} fill={activeStatut && s.statut !== activeStatut ? '#e0e0e0' : baseColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* ─── Tables Row ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Demandes table with alerts + quick actions */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Demandes Récentes</Typography>
            <Badge badgeContent={filteredDemandes.filter(d => d.alerte).length} color="error">
              <Warning sx={{ color: '#ef5350' }} />
            </Badge>
          </Box>
          <TableContainer sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Poste</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Alerte</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDemandes.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucune demande pour les filtres sélectionnés</TableCell></TableRow>
                )}
                {filteredDemandes.map(d => (
                  <TableRow key={d.numero} hover sx={{ bgcolor: d.alerte ? 'rgba(239,83,80,0.04)' : 'inherit' }}>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{d.numero}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{d.poste}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{d.departement} · {d.site}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={d.statut} size="small" color={statutColor[d.statut]} />
                    </TableCell>
                    <TableCell>
                      {d.alerte ? (
                        <Tooltip title={`${d.joursAttente} jours d'attente`}>
                          <Chip icon={<Schedule sx={{ fontSize: '0.9rem !important' }} />} label={`${d.joursAttente}j`} size="small" color="error" variant="outlined" />
                        </Tooltip>
                      ) : (
                        <FiberManualRecord sx={{ fontSize: 12, color: '#2e7d32' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {d.statut === 'En attente' && (
                        <Tooltip title="Valider cette demande">
                          <IconButton size="small" color="success" onClick={() => handleValider(d)}>
                            <CheckCircle sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Voir les détails">
                        <IconButton size="small" onClick={() => {}}>
                          <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Candidats table with alerts + quick actions */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Candidats Récents</Typography>
            <Badge badgeContent={filteredCandidats.filter(c => c.enAttente).length} color="warning">
              <Schedule sx={{ color: '#ffa726' }} />
            </Badge>
          </Box>
          <TableContainer sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Étape</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidats.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun candidat pour les filtres sélectionnés</TableCell></TableRow>
                )}
                {filteredCandidats.map(c => (
                  <TableRow key={c.numero} hover sx={{ bgcolor: c.enAttente ? 'rgba(255,167,38,0.04)' : 'inherit' }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{c.nom}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{c.departement}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={c.source} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      <Chip
                        label={c.etape}
                        size="small"
                        color={c.etape === 'Offre envoyée' ? 'success' : c.enAttente ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{c.score !== null ? `${c.score}/20` : '—'}</TableCell>
                    <TableCell>
                      {c.enAttente && (
                        <Tooltip title="Relancer ce candidat">
                          <IconButton size="small" color="primary" onClick={() => handleRelancer(c)}>
                            <Send sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Voir la fiche">
                        <IconButton size="small" onClick={() => {}}>
                          <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* ─── Snackbar feedback ─── */}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack && <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}
