// ============================================================
// Domaine 2 — TableauDeBordD2.jsx (réécriture Task 6)
// Tableau de Bord — Gestion Administrative du Personnel
//   • Header gradient bleu marine (#0b2a4a → #1a4a7a) + accent doré #f9c74f
//   • Simulated login (avatar "DR" + sélecteur de rôle DRH/Manager/Employé)
//   • Navigation Tabs MUI (6 onglets)
//   • 6 sections stratégiques (déléguées à DashboardSections.jsx)
//   • Réutilise computeKPIsExcel() et toutes les données de data.js
// ============================================================
import { useMemo, useState } from 'react';
import { Box, Tabs, Tab, Stack, Typography, Avatar, MenuItem, Select, Chip } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import FlagIcon from '@mui/icons-material/Flag';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SyncIcon from '@mui/icons-material/Sync';

import { computeKPIsExcel, EMPLOYEES } from './data';
import FilterBar from './FilterBar';
import AlertesCritiques from './AlertesCritiques';
import {
  useScopedData, NAVY, GOLD,
  Section1VueEnsemble, Section2DonneesContrats, Section3PresenceConges,
  Section4FinancesConformite, Section5PilotageQualite, Section6Rapports,
} from './DashboardSections';
import QualiteRecrutement from './QualiteRecrutement';

// ------------------------------------------------------------
// Rôles simulés (login)
// ------------------------------------------------------------
const ROLES = [
  { value: 'DRH', label: 'DRH — Vue globale' },
  { value: 'Manager', label: 'Manager — Vue équipe' },
  { value: 'Employé', label: 'Employé — Vue personnelle' },
];

// ------------------------------------------------------------
// Onglets (MUI Tabs avec icônes)
// ------------------------------------------------------------
const TABS = [
  { label: 'Vue d\'ensemble', icon: <DashboardIcon fontSize='small' /> },
  { label: 'Données & Contrats', icon: <PeopleIcon fontSize='small' /> },
  { label: 'Présence & Congés', icon: <CalendarMonthIcon fontSize='small' /> },
  { label: 'Finances & Conformité', icon: <PaymentsIcon fontSize='small' /> },
  { label: 'Pilotage & Qualité', icon: <FlagIcon fontSize='small' /> },
  { label: 'Rapports', icon: <DescriptionIcon fontSize='small' /> },
  { label: 'Qualité Recrutement D1', icon: <SyncIcon fontSize='small' /> },
];

// ------------------------------------------------------------
// Header gradient marine + accent doré
// ------------------------------------------------------------
function DashboardHeader() {
  const maj = useMemo(() => {
    const d = new Date();
    return d.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0b2a4a 0%, #1a4a7a 100%)',
        borderRadius: '20px',
        p: { xs: 2, md: '24px 32px' },
        mb: 3,
        color: '#fff',
        boxShadow: '0 12px 30px rgba(10, 40, 80, 0.25)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Box
            sx={{
              fontSize: 28, color: GOLD, bgcolor: 'rgba(255,255,255,0.10)',
              width: { xs: 44, md: 56 }, height: { xs: 44, md: 56 }, borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BadgeIcon sx={{ fontSize: { xs: 22, md: 28 } }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.5rem' }, letterSpacing: '-0.3px' }}>
              TABLEAU DE BORD — GESTION ADMINISTRATIVE DU PERSONNEL
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', opacity: 0.75, mt: 0.3, letterSpacing: 0.2 }}>
              Domaine 2 · Tableau de Bord RH · Mise à jour automatique
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems='center'>
          <Chip
            icon={<DescriptionIcon sx={{ fontSize: '14px !important', color: `${GOLD} !important` }} />}
            label='ISO 30401:2018 · ISO 9001:2015'
            sx={{
              bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)', fontWeight: 500,
              fontSize: '0.72rem', letterSpacing: 0.3, height: 28,
            }}
          />
          <Stack direction='row' spacing={0.5} alignItems='center' sx={{ opacity: 0.85 }}>
            <ScheduleIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: '0.78rem' }}>Dernière MAJ : {maj}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

// ------------------------------------------------------------
// Simulated login banner (avatar DR + sélecteur de rôle)
// ------------------------------------------------------------
function SimulatedLogin({ role, setRole }) {
  return (
    <Box
      sx={{
        bgcolor: '#e8edf5',
        border: '1px solid #d5dee8',
        borderRadius: '14px',
        p: { xs: 1.5, md: '12px 20px' },
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Stack direction='row' spacing={1.2} alignItems='center'>
        <Avatar sx={{ width: 32, height: 32, bgcolor: NAVY, fontSize: '0.8rem', fontWeight: 700 }}>DR</Avatar>
        <Typography sx={{ fontSize: '0.82rem', color: '#1a2a3a' }}>
          <strong>Connexion simulée</strong> · <span style={{ color: '#3a5a7a', fontWeight: 600 }}>{role}</span>
        </Typography>
      </Stack>
      <Stack direction='row' spacing={1.5} alignItems='center'>
        <Select
          size='small' value={role} onChange={(e) => setRole(e.target.value)}
          sx={{
            bgcolor: '#fff', borderRadius: '30px', fontSize: '0.78rem', height: 32,
            '& .MuiSelect-select': { py: 0.5, pl: 1.5, pr: 3 },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c5d0de' },
          }}
        >
          {ROLES.map((r) => <MenuItem key={r.value} value={r.value} sx={{ fontSize: '0.78rem' }}>{r.label}</MenuItem>)}
        </Select>
        <Stack direction='row' spacing={0.5} alignItems='center' sx={{ color: '#5a6a7a', fontSize: '0.72rem' }}>
          <LockOpenIcon sx={{ fontSize: 13 }} />
          <span>Simulation</span>
        </Stack>
      </Stack>
    </Box>
  );
}

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------
export default function TableauDeBordD2() {
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState('DRH');
  // État des filtres interactifs (Slicers + Timeline) — équivalent Tableaux Structurés Excel
  const [filters, setFilters] = useState({ departements: [], typesContrat: [], statuts: [], dateFrom: null, dateTo: null });

  // KPIs Excel complets (toutes données) — affichés dans le footer
  const ex = useMemo(() => computeKPIsExcel(), []);

  // Données filtrées selon le rôle simulé + filtres utilisateur (Slicers)
  const scopedData = useScopedData(role, filters);

  // Total employés (sans filtres user, pour le compteur "X / Y")
  const totalEmployees = useMemo(() => {
    if (role === 'Manager') return EMPLOYEES.slice(0, 7).length;
    if (role === 'Employé') return 1;
    return EMPLOYEES.length;
  }, [role]);

  return (
    <Box sx={{ bgcolor: '#f4f7fc', minHeight: 'calc(100vh - 80px)', p: { xs: 1.5, md: 2 } }}>
      <DashboardHeader />
      <SimulatedLogin role={role} setRole={setRole} />

      {/* Barre de filtres interactifs (Slicers + Timeline) */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalEmployees={totalEmployees}
        filteredCount={scopedData.employees.length}
      />

      {/* Zone d'alertes intelligentes (feux tricolores + détection échéances) */}
      <AlertesCritiques data={scopedData} />

      {/* Navigation par onglets (MUI Tabs) */}
      <Box
        sx={{
          bgcolor: '#fff', borderRadius: '16px', p: 0.75, mb: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #e9edf2',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)} variant='scrollable' scrollButtons='auto'
          sx={{
            minHeight: 44, '& .MuiTab-root': {
              textTransform: 'none', fontSize: '0.82rem', fontWeight: 500, color: '#4a5a6a',
              minHeight: 38, borderRadius: '12px', mr: 0.5, gap: 1,
              '&.Mui-selected': { bgcolor: NAVY, color: '#fff', boxShadow: '0 4px 12px rgba(11,42,74,0.20)' },
              '& .MuiTab-iconWrapper': { marginBottom: '0 !important' },
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} label={t.label} icon={t.icon} iconPosition='start' />
          ))}
        </Tabs>
      </Box>

      {/* Sections (switch selon l'onglet actif) */}
      <Box>
        {tab === 0 && <Section1VueEnsemble data={scopedData} />}
        {tab === 1 && <Section2DonneesContrats data={scopedData} />}
        {tab === 2 && <Section3PresenceConges data={scopedData} />}
        {tab === 3 && <Section4FinancesConformite data={scopedData} />}
        {tab === 4 && <Section5PilotageQualite data={scopedData} />}
        {tab === 5 && <Section6Rapports data={scopedData} role={role} />}
        {tab === 6 && <QualiteRecrutement data={scopedData} />}
      </Box>

      {/* Footer ISO discret */}
      <Box sx={{ mt: 4, textAlign: 'center', color: '#6b7a8a', fontSize: '0.7rem' }}>
        Conforme ISO 30401:2018 · ISO 9001:2015 · ISO 22400-3:2022 — Données mock (fichier Excel de référence transposé en React + MUI + Recharts)
        {' · '}
        Effectif global : <strong style={{ color: NAVY }}>{ex.bloc1.effectifTotal}</strong> ·
        Contrats en vigueur : <strong style={{ color: NAVY }}>{ex.bloc2.contratsEnVigueur}</strong> ·
        Masse salariale : <strong style={{ color: NAVY }}>{Math.round(ex.bloc2.masseSalarialeBrute / 1000)}k FCFA</strong>
      </Box>
    </Box>
  );
}
