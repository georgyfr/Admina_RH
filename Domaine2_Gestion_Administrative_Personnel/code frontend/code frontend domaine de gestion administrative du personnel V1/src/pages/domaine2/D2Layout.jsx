import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemText, Typography, Divider, IconButton, Tooltip, Chip, Avatar, AppBar, Toolbar, InputBase, Badge, Menu, MenuItem, ListItemIcon, Breadcrumbs, Link } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import ArchiveIcon from '@mui/icons-material/Archive';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GavelIcon from '@mui/icons-material/Gavel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VerifiedIcon from '@mui/icons-material/Verified';
import TuneIcon from '@mui/icons-material/Tune';

const BASE = '/domaine2_Gestion_Administrative_Personnel';

const PHASES = [
  {
    title: 'PHASE 1 — IDENTIFICATION', color: '#1B4F72',
    items: [
      { label: 'Tableau de Bord', path: '', icon: <DashboardIcon fontSize='small' /> },
      { label: 'Fiche Employé', path: '/employes', icon: <PeopleIcon fontSize='small' /> },
    ],
  },
  {
    title: 'PHASE 2 — CONTRACTUALISATION', color: '#2E86C1',
    items: [
      { label: 'Contrats Travail', path: '/contrats', icon: <DescriptionIcon fontSize='small' /> },
      { label: 'Avenants', path: '/avenants', icon: <EditNoteIcon fontSize='small' /> },
      { label: 'Suivi Documents', path: '/documents', icon: <DescriptionIcon fontSize='small' /> },
      { label: 'Données Bancaires', path: '/bancaires', icon: <AccountBalanceIcon fontSize='small' /> },
      { label: 'Mutuelle Prévoyance', path: '/mutuelle', icon: <HealthAndSafetyIcon fontSize='small' /> },
      { label: 'Autorisations Permis', path: '/permis', icon: <VerifiedIcon fontSize='small' /> },
    ],
  },
  {
    title: 'PHASE 3 — PRÉSENCE & CONGÉS', color: '#27AE60',
    items: [
      { label: 'Congés Annuels', path: '/conges', icon: <EventAvailableIcon fontSize='small' /> },
      { label: 'Soldes Congés', path: '/soldes', icon: <CalendarMonthIcon fontSize='small' /> },
      { label: 'Absences Maladie', path: '/absences', icon: <HealthAndSafetyIcon fontSize='small' /> },
      { label: 'Heures Supp.', path: '/heures-supp', icon: <TuneIcon fontSize='small' /> },
      { label: 'Pointage', path: '/pointage', icon: <VerifiedIcon fontSize='small' /> },
      { label: 'Planning Mensuel', path: '/planning', icon: <CalendarMonthIcon fontSize='small' /> },
    ],
  },
  {
    title: 'PHASE 4 — PAIE & CONFORMITÉ', color: '#F39C12',
    items: [
      { label: 'Fiches de Paie', path: '/paie', icon: <PaymentsIcon fontSize='small' /> },
      { label: 'Déclarations Sociales', path: '/declarations', icon: <ReceiptLongIcon fontSize='small' /> },
      { label: 'Prêts & Avances', path: '/prets', icon: <AccountBalanceIcon fontSize='small' /> },
      { label: 'Sanctions', path: '/sanctions', icon: <GavelIcon fontSize='small' /> },
      { label: 'Visites Médicales', path: '/visites-medicales', icon: <MedicalServicesIcon fontSize='small' /> },
    ],
  },
  {
    title: 'PHASE 5 — SORTIE & PILOTAGE', color: '#8E44AD',
    items: [
      { label: 'Dossiers Départs', path: '/departs', icon: <LogoutIcon fontSize='small' /> },
      { label: 'Archivage', path: '/archivage', icon: <ArchiveIcon fontSize='small' /> },
      { label: 'Rappels Admin', path: '/rappels', icon: <NotificationsActiveIcon fontSize='small' /> },
    ],
  },
];

const TITLES = {
  '': 'Tableau de Bord — Gestion Administrative du Personnel',
  '/employes': 'Fiche Employé',
  '/contrats': 'Contrats de Travail',
  '/avenants': 'Avenants de Contrat',
  '/documents': 'Suivi des Documents',
  '/bancaires': 'Données Bancaires',
  '/mutuelle': 'Mutuelle & Prévoyance',
  '/permis': 'Autorisations & Permis',
  '/conges': 'Congés Annuels',
  '/soldes': 'Soldes de Congés',
  '/absences': 'Absences Maladie',
  '/heures-supp': 'Heures Supplémentaires',
  '/pointage': 'Pointage de Présence',
  '/planning': 'Planning Mensuel',
  '/paie': 'Fiches de Paie',
  '/declarations': 'Déclarations Sociales',
  '/prets': 'Prêts & Avances',
  '/sanctions': 'Sanctions Disciplinaires',
  '/visites-medicales': 'Visites Médicales',
  '/departs': 'Dossiers de Départs',
  '/archivage': 'Archivage Documents',
  '/rappels': 'Rappels Administratifs',
  '/phase0': 'Phase 0 — Documentation & Stratégie',
};

const dw = 270;
const headerH = 80;

export default function D2Layout({ darkMode, toggleDark }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [notifAnchor, setNotifAnchor] = useState(null);

  // sous-path relatif à BASE
  const relPath = loc.pathname.replace(BASE, '') || '';
  const currentTitle = TITLES[relPath] || 'Gestion Administrative du Personnel';

  const go = (sub) => navigate(sub ? `${BASE}${sub}` : BASE);

  // breadcrumbs
  const crumbs = [{ label: 'Admina-RH', path: '/' }, { label: 'Domaine 2', path: BASE }];
  if (relPath) {
    const matched = PHASES.flatMap(p => p.items).find(i => i.path === relPath);
    if (matched) crumbs.push({ label: matched.label, path: `${BASE}${relPath}` });
  }

  return (
    <Box sx={{ display: 'block', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar D2 — charte graphique propre au Domaine 2 (violet profond) */}
      <Drawer
        variant='permanent'
        sx={{
          width: dw,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: dw,
            boxSizing: 'border-box',
            bgcolor: '#2d1b4e',
            color: '#fff',
            borderRight: 'none',
            backgroundImage: 'linear-gradient(180deg, #2d1b4e 0%, #1f0f38 100%)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Brand — fixe en haut */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#7e3ff2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 13 }}>AR</Box>
          <Box>
            <Typography variant='subtitle2' fontWeight='bold' sx={{ lineHeight: 1.2 }}>Admina-RH</Typography>
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.62rem' }}>Domaine 2 — Admin. Personnel</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Retour Domaine 1 — fixe en haut */}
        <List dense sx={{ flexShrink: 0 }}>
          <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: 1, mx: 1, mt: 0.5, color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}><HomeIcon fontSize='small' /></ListItemIcon>
            <ListItemText primary='Retour Domaine 1' primaryTypographyProps={{ fontSize: '0.78rem' }} />
          </ListItemButton>
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Phases — zone défilable (overflow-y: auto) */}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent',
            '&::-webkit-scrollbar': { width: 6, webkitAppearance: 'none' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.18)', borderRadius: 3, border: 'none' },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(255,255,255,0.32)' },
          }}
        >
          {PHASES.map((phase, i) => (
            <Box key={i}>
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: phase.color }} />
                <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                  {phase.title}
                </Typography>
              </Box>
              <List dense>
                {phase.items.map((item) => {
                  const selected = relPath === item.path;
                  return (
                    <ListItemButton
                      key={item.path}
                      selected={selected}
                      onClick={() => go(item.path)}
                      sx={{
                        borderRadius: 1, mx: 1, mb: 0.2, py: 0.5,
                        color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
                        '&.Mui-selected': { bgcolor: 'rgba(126, 63, 242, 0.35)', borderLeft: `3px solid ${phase.color}` },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(126, 63, 242, 0.45)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: selected ? phase.color : 'rgba(255,255,255,0.5)' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.76rem', fontWeight: selected ? 600 : 400 }} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>

        {/* Footer ISO — fixe en bas */}
        <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', display: 'block', textAlign: 'center' }}>
            ISO 30401:2018 · ISO 9001:2015
          </Typography>
        </Box>
      </Drawer>

      {/* Header */}
      <AppBar position='fixed' elevation={0} sx={{ width: `calc(100% - ${dw}px)`, ml: `${dw}px`, height: headerH, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
        <Toolbar sx={{ minHeight: `${headerH}px !important`, gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs separator='/' sx={{ '& .MuiBreadcrumbs-separator': { fontSize: '0.7rem', color: 'text.secondary' } }}>
              {crumbs.map((c, i) => (
                <Link key={i} component='button' onClick={() => navigate(c.path)} sx={{ fontSize: '0.72rem', color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary', textDecoration: 'none', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>
                  {c.label}
                </Link>
              ))}
            </Breadcrumbs>
            <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>{currentTitle}</Typography>
          </Box>

          {/* Search */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: 'action.hover', borderRadius: 2, px: 1.5, py: 0.7, width: 260 }}>
            <SearchIcon fontSize='small' sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase placeholder='Rechercher employé, contrat...' sx={{ fontSize: '0.8rem', flex: 1 }} />
          </Box>

          <Tooltip title='Mode sombre'>
            <IconButton onClick={toggleDark} size='small'>
              {darkMode ? <LightModeIcon fontSize='small' /> : <DarkModeIcon fontSize='small' />}
            </IconButton>
          </Tooltip>

          <Tooltip title='Notifications'>
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} size='small'>
              <Badge badgeContent={3} color='error'>
                <NotificationsIcon fontSize='small' />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)} PaperProps={{ sx: { width: 340, mt: 1 } }}>
            <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}><WarningAmberIcon color='error' fontSize='small' /><Typography variant='caption' fontWeight={600}>Passeport expiré — C. Atangana</Typography></Box>
              <Typography variant='caption' color='text.secondary'>Échéance dépassée le 01/10/2025</Typography>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}><WarningAmberIcon color='warning' fontSize='small' /><Typography variant='caption' fontWeight={600}>Déclaration Impôts en retard</Typography></Box>
              <Typography variant='caption' color='text.secondary'>Échéance: 15/09/2025</Typography>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}><EventAvailableIcon color='info' fontSize='small' /><Typography variant='caption' fontWeight={600}>2 demandes de congés en attente</Typography></Box>
              <Typography variant='caption' color='text.secondary'>A. Tchinda · E. Talla</Typography>
            </MenuItem>
          </Menu>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 600 }}>DA</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant='caption' fontWeight={600} sx={{ display: 'block', lineHeight: 1.2 }}>Directeur RH</Typography>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.68rem' }}>Administrateur</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content — pleine largeur */}
      <Box component='main' sx={{ ml: `${dw}px`, mt: `${headerH}px`, p: { xs: 1.5, md: 2 }, minHeight: `calc(100vh - ${headerH}px)`, width: `calc(100vw - ${dw}px)`, maxWidth: `calc(100vw - ${dw}px)`, boxSizing: 'border-box' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
