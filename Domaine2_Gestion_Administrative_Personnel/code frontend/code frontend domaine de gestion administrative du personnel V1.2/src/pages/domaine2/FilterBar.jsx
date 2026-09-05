// ============================================================
// FilterBar.jsx — Barre de filtres interactifs (style Slicers Excel)
// 4 contrôles : Département, Type Contrat, Statut, Timeline Date Embauche
// Tous les filtres se combinent (AND) et alimentent useScopedData
// ============================================================
import { useState } from 'react';
import {
  Box, Chip, Stack, Typography, Popover, Button, Checkbox, FormControlLabel,
  TextField, IconButton, Tooltip, Divider, Badge, Paper, Fade,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Configuration des filtres
const DEPARTEMENTS = ['Administration', 'Finance', 'Comptabilite', 'Restauration', 'Hebergement', 'Maintenance', 'Securite', 'Ressources Humaines', 'Marketing', 'Logistique'];
const TYPES_CONTRAT = ['CDI', 'CDD', 'Stage', 'Interim'];
const STATUTS = ['Actif', 'Inactif', 'Essai', 'Suspendu'];

// Slicer individuel (bouton + popover avec checkboxes)
function SlicerButton({ label, icon, values, options, onToggle, onClear, color = '#7e3ff2' }) {
  const [anchor, setAnchor] = useState(null);
  const activeCount = values.length;
  const allSelected = activeCount === 0; // 0 = tout (pas de filtre)

  return (
    <>
      <Chip
        onClick={(e) => setAnchor(e.currentTarget)}
        onDelete={activeCount > 0 ? () => onClear() : undefined}
        deleteIcon={activeCount > 0 ? <ClearIcon sx={{ fontSize: '15px !important' }} /> : undefined}
        icon={icon}
        label={activeCount === 0 ? `${label} : Tous` : `${label} : ${activeCount}`}
        sx={{
          bgcolor: activeCount > 0 ? `${color}22` : '#fff',
          color: activeCount > 0 ? color : '#4a5a6a',
          border: `1px solid ${activeCount > 0 ? color : '#d5dee8'}`,
          fontWeight: 600, fontSize: '0.72rem', height: 30, pr: 0.5,
          '&:hover': { bgcolor: activeCount > 0 ? `${color}33` : '#f4f7fc' },
          '& .MuiChip-icon': { color: activeCount > 0 ? color : '#6b7a8a', fontSize: 16, ml: 0.5 },
        }}
      />
      <Popover
        open={Boolean(anchor)} anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, minWidth: 220, maxWidth: 300, p: 1, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1, px: 0.5 }}>
          <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: '#0b2a4a' }}>{label}</Typography>
          <Button size='small' onClick={() => onClear()} sx={{ fontSize: '0.68rem', minWidth: 'auto', color: '#6b7a8a', textTransform: 'none' }}>
            Tout (réinit)
          </Button>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: 240, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 2 } }}>
          {options.map((opt) => {
            const checked = values.includes(opt);
            return (
              <FormControlLabel
                key={opt}
                control={<Checkbox checked={checked} size='small' onChange={() => onToggle(opt)} sx={{ py: 0.3 }} />}
                label={<Typography variant='caption' sx={{ fontSize: '0.75rem' }}>{opt}</Typography>}
                sx={{ display: 'flex', m: 0, py: 0.2, px: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#f4f7fc' }, width: '100%' }}
              />
            );
          })}
        </Box>
        {activeCount > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e9edf2' }}>
            <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>
              {activeCount} sélectionné(s) sur {options.length}
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}

// Timeline (date range) — du / au
function TimelineFilter({ dateFrom, dateTo, onChange }) {
  const [anchor, setAnchor] = useState(null);
  const active = dateFrom || dateTo;

  const formatLabel = () => {
    if (!active) return 'Date embauche : Toutes';
    const f = dateFrom ? new Date(dateFrom).toLocaleDateString('fr-FR') : '…';
    const t = dateTo ? new Date(dateTo).toLocaleDateString('fr-FR') : '…';
    return `${f} → ${t}`;
  };

  return (
    <>
      <Chip
        onClick={(e) => setAnchor(e.currentTarget)}
        onDelete={active ? () => onChange({ dateFrom: null, dateTo: null }) : undefined}
        deleteIcon={active ? <ClearIcon sx={{ fontSize: '15px !important' }} /> : undefined}
        icon={<CalendarMonthIcon />}
        label={formatLabel()}
        sx={{
          bgcolor: active ? '#1a4a7a22' : '#fff',
          color: active ? '#1a4a7a' : '#4a5a6a',
          border: `1px solid ${active ? '#1a4a7a' : '#d5dee8'}`,
          fontWeight: 600, fontSize: '0.72rem', height: 30, pr: 0.5,
          '&:hover': { bgcolor: active ? '#1a4a7a33' : '#f4f7fc' },
          '& .MuiChip-icon': { color: active ? '#1a4a7a' : '#6b7a8a', fontSize: 16, ml: 0.5 },
        }}
      />
      <Popover
        open={Boolean(anchor)} anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, p: 2, borderRadius: 2, minWidth: 320, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
      >
        <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: '#0b2a4a', mb: 1.5, display: 'block' }}>
          Filtrer par date d'embauche (Timeline)
        </Typography>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <TextField
            type='date' size='small' label='Du' value={dateFrom || ''}
            onChange={(e) => onChange({ dateFrom: e.target.value || null, dateTo })}
            InputLabelProps={{ shrink: true }} sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.75rem' } }}
          />
          <Typography sx={{ color: '#6b7a8a' }}>→</Typography>
          <TextField
            type='date' size='small' label='Au' value={dateTo || ''}
            onChange={(e) => onChange({ dateFrom, dateTo: e.target.value || null })}
            InputLabelProps={{ shrink: true }} sx={{ flex: 1, '& .MuiInput-root': { fontSize: '0.75rem' } }}
          />
        </Stack>
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Button size='small' onClick={() => onChange({ dateFrom: null, dateTo: null })} sx={{ textTransform: 'none', fontSize: '0.7rem', color: '#6b7a8a' }}>
            Réinitialiser
          </Button>
          <Button size='small' onClick={() => setAnchor(null)} variant='contained' sx={{ textTransform: 'none', fontSize: '0.7rem', bgcolor: '#1a4a7a' }}>
            Appliquer
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ============================================================
// FilterBar — composant principal (barre de filtres globale)
// ============================================================
export default function FilterBar({ filters, setFilters, totalEmployees, filteredCount }) {
  const { departements, typesContrat, statuts, dateFrom, dateTo } = filters;

  const toggleInArray = (arr, value) => arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  const activeFiltersCount = (departements.length > 0 ? 1 : 0) + (typesContrat.length > 0 ? 1 : 0) + (statuts.length > 0 ? 1 : 0) + ((dateFrom || dateTo) ? 1 : 0);

  const resetAll = () => setFilters({ departements: [], typesContrat: [], statuts: [], dateFrom: null, dateTo: null });

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2.5, p: { xs: 1.5, md: '10px 16px' }, borderRadius: 2,
        bgcolor: '#fff', border: '1px solid #e9edf2',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems='center' flexWrap='wrap'>
        {/* Icône + label */}
        <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
          <Badge badgeContent={activeFiltersCount > 0 ? activeFiltersCount : 0} color='secondary'>
            <FilterListIcon sx={{ color: '#0b2a4a', fontSize: 18 }} />
          </Badge>
          <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: '#0b2a4a', whiteSpace: 'nowrap' }}>
            Filtres
          </Typography>
        </Stack>

        <Divider orientation='vertical' flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Slicer Département */}
        <SlicerButton
          label='Département' icon={<BusinessIcon />}
          values={departements} options={DEPARTEMENTS} color='#7e3ff2'
          onToggle={(v) => setFilters({ ...filters, departements: toggleInArray(departements, v) })}
          onClear={() => setFilters({ ...filters, departements: [] })}
        />

        {/* Slicer Type Contrat */}
        <SlicerButton
          label='Type contrat' icon={<WorkIcon />}
          values={typesContrat} options={TYPES_CONTRAT} color='#1a4a7a'
          onToggle={(v) => setFilters({ ...filters, typesContrat: toggleInArray(typesContrat, v) })}
          onClear={() => setFilters({ ...filters, typesContrat: [] })}
        />

        {/* Slicer Statut */}
        <SlicerButton
          label='Statut' icon={<CheckCircleIcon />}
          values={statuts} options={STATUTS} color='#2a7a4a'
          onToggle={(v) => setFilters({ ...filters, statuts: toggleInArray(statuts, v) })}
          onClear={() => setFilters({ ...filters, statuts: [] })}
        />

        {/* Timeline Date Embauche */}
        <TimelineFilter
          dateFrom={dateFrom} dateTo={dateTo}
          onChange={({ dateFrom, dateTo }) => setFilters({ ...filters, dateFrom, dateTo })}
        />

        {/* Compteur résultats + Reset */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={`${filteredCount} employé(s) correspondant aux filtres`}>
            <Chip
              size='small'
              label={`${filteredCount} / ${totalEmployees} employés`}
              sx={{
                bgcolor: activeFiltersCount > 0 ? '#fef3e7' : '#eef3f9',
                color: activeFiltersCount > 0 ? '#b86a2a' : '#3a5a7a',
                fontWeight: 700, fontSize: '0.68rem', border: 'none',
              }}
            />
          </Tooltip>
          {activeFiltersCount > 0 && (
            <Tooltip title='Réinitialiser tous les filtres'>
              <IconButton size='small' onClick={resetAll} sx={{ bgcolor: '#fde8eb', color: '#b33a4a', '&:hover': { bgcolor: '#fbd5da' } }}>
                <ClearIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
