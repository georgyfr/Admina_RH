import { useState, useRef, useEffect, useMemo } from 'react';
import {
  AppBar, Toolbar, Typography, TextField, IconButton, Badge, Avatar,
  Box, Paper, Popover, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Chip, InputAdornment, Tooltip, useTheme
} from '@mui/material';
import {
  Notifications as NotifIcon, Search as SearchIcon, Person as PersonIcon,
  Settings as SettingsIcon, Business as BusinessIcon, Logout as LogoutIcon,
  CheckCircle, ManageAccounts, Dashboard, DarkMode as DarkModeIcon,
  LightMode as LightModeIcon, AddCircle, Event, Description as DescIcon,
  HourglassTop, Work, FileDownload,
  NavigateNext, Warning as WarningIcon, KeyboardArrowDown
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useRole, ROLES } from '../context/RoleContext';
import { Person, BusinessCenter, AdminPanelSettings } from '@mui/icons-material';

const notifIconMap = {
  person_add: <PersonIcon sx={{ fontSize: 18 }} />,
  event: <Dashboard sx={{ fontSize: 18 }} />,
  warning: <WarningIcon sx={{ fontSize: 18 }} />,
  business: <BusinessIcon sx={{ fontSize: 18 }} />,
  description: <DescIcon sx={{ fontSize: 18 }} />,
  check_circle: <CheckCircle sx={{ fontSize: 18 }} />,
  school: <Dashboard sx={{ fontSize: 18 }} />,
};

const actionIconMap = {
  add_circle: <AddCircle />,
  person_add: <PersonIcon />,
  event: <Event />,
  description: <DescIcon />,
};

const statIconMap = {
  work: <Work sx={{ fontSize: 16 }} />,
  event: <Event sx={{ fontSize: 16 }} />,
  description: <DescIcon sx={{ fontSize: 16 }} />,
  hourglass_top: <HourglassTop sx={{ fontSize: 16 }} />,
};

const accountMenuItems = [
  { icon: <PersonIcon />, label: 'Mon Profil', desc: 'Voir mes informations', path: '/parametres' },
  { icon: <ManageAccounts />, label: 'Gestion des Comptes', desc: 'Utilisateurs et r\u00f4les', path: '/parametres' },
  { icon: <BusinessIcon />, label: 'D\u00e9partements', desc: 'Structure organisationnelle', path: '/departements' },
  { icon: <SettingsIcon />, label: 'Param\u00e8tres', desc: 'Configuration du syst\u00e8me', path: '/parametres' },
];

export default function Header({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    user, notifications, unreadCount, search, markAllRead, markRead,
    darkMode, toggleDark, lang, changeLang, t, languages,
    deadlines, quickActions, recrutementStats, getBreadcrumb,
  } = useApp();

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  // Recherche
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Popovers
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [deadlineAnchor, setDeadlineAnchor] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);
  const [roleAnchor, setRoleAnchor] = useState(null);

  const { currentRole, changeRole } = useRole();
  const roleIconMap = { person: <Person sx={{ fontSize: 16 }} />, business: <BusinessCenter sx={{ fontSize: 16 }} />, admin_panel_settings: <AdminPanelSettings sx={{ fontSize: 16 }} /> };

  const results = useMemo(() => search(query), [query, search]);
  const breadcrumb = useMemo(() => getBreadcrumb(location.pathname), [location.pathname, getBreadcrumb]);

  // Ctrl+K pour ouvrir la recherche
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Fermer la recherche si on clique ailleurs
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCloseAll = () => {
    setNotifAnchor(null); setAccountAnchor(null); setActionsAnchor(null); setDeadlineAnchor(null); setLangAnchor(null);
  };

  // Couleurs th\u00e8me
  const headerBg = isDark ? '#141428' : '#ffffff';
  const headerColor = isDark ? '#e0e0e0' : '#374151';
  const statsBarBg = isDark ? '#0d0d1f' : '#f8f9fc';
  const paperBg = isDark ? '#1a1a36' : '#ffffff';
  const hoverBg = isDark ? 'rgba(14,166,133,0.10)' : 'rgba(13,124,102,0.06)';
  const borderClr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const chipBg = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const dividerClr = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // Hauteur du header principal (utilisé pour positionner la stats bar)
  const headerHeight = 52;

  return (
    <Box>
      {/* ===== MAIN TOOLBAR ===== */}
      <AppBar
        position="fixed"
        sx={{
          ml: '260px',
          width: 'calc(100% - 260px)',
          bgcolor: headerBg,
          color: headerColor,
          boxShadow: 'none',
          borderBottom: `1px solid ${borderClr}`,
          zIndex: 1200,
        }}
        elevation={0}
      >
        <Toolbar sx={{ minHeight: `${headerHeight}px !important`, height: headerHeight, px: 2.5 }}>

          {/* ---- LEFT SECTION: Breadcrumb ---- */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              flexShrink: 0,
              maxWidth: '30%',
              mr: 2,
            }}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: isDark ? '#6b7280' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.75rem',
                '&:hover': { color: '#0D7C66' },
                transition: 'color 0.2s',
              }}
              onClick={() => navigate('/')}
            >
              Accueil
            </Typography>
            {breadcrumb.map((crumb, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                <NavigateNext sx={{ fontSize: 12, color: isDark ? '#4b5563' : '#d1d5db', mx: 0.25 }} />
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color: idx === breadcrumb.length - 1
                      ? (isDark ? '#e5e7eb' : '#111827')
                      : (isDark ? '#6b7280' : '#9ca3af'),
                    fontWeight: idx === breadcrumb.length - 1 ? 600 : 400,
                    cursor: idx < breadcrumb.length - 1 ? 'pointer' : 'default',
                    fontSize: '0.75rem',
                    '&:hover': { color: '#0D7C66' },
                    transition: 'color 0.2s',
                  }}
                  onClick={() => {
                    if (idx < breadcrumb.length - 1 && location.pathname !== '/') navigate('/');
                  }}
                >
                  {crumb}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ---- CENTER: Search ---- */}
          <Box
            ref={searchRef}
            sx={{
              position: 'relative',
              flexGrow: 1,
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            <TextField
              size="small"
              placeholder={t.search}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => { if (query.length >= 2) setSearchOpen(true); }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
                  fontSize: '0.8rem',
                  color: headerColor,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.07)' : '#eef0f4' },
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                  boxShadow: isDark
                    ? '0 0 0 2px rgba(13,124,102,0.3)'
                    : '0 0 0 2px rgba(13,124,102,0.2)',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0D7C66',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip
                      label="Ctrl+K"
                      size="small"
                      sx={{
                        fontSize: '0.6rem',
                        height: 18,
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
                        color: isDark ? '#6b7280' : '#9ca3af',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Search Results Dropdown */}
            {searchOpen && query.length >= 2 && (
              <Paper
                elevation={6}
                sx={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 1400,
                  maxHeight: 380,
                  overflow: 'auto',
                  borderRadius: 2,
                  border: `1px solid ${borderClr}`,
                  bgcolor: paperBg,
                }}
              >
                {results.length === 0 ? (
                  <Box sx={{ p: 2.5, textAlign: 'center', color: '#9ca3af' }}>
                    <Typography variant="body2">{t.noResult} \u00ab {query} \u00bb</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ px: 2, py: 1, bgcolor: chipBg, borderBottom: `1px solid ${borderClr}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        {results.length} {t.result}
                      </Typography>
                    </Box>
                    <List dense sx={{ py: 0.5 }}>
                      {results.map((item) => {
                        const parts = item.label.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                        return (
                          <ListItemButton
                            key={item.id}
                            onClick={() => { setSearchOpen(false); setQuery(''); navigate(item.path); }}
                            sx={{
                              borderRadius: 1.5,
                              mx: 1,
                              my: 0.15,
                              py: 0.8,
                              '&:hover': { bgcolor: hoverBg },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography component="span" variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                    {parts.map((part, i) =>
                                      part.toLowerCase() === query.toLowerCase()
                                        ? <Box key={i} component="span" sx={{ bgcolor: '#ffeb3b', borderRadius: 0.5, px: 0.3, py: 0 }}>{part}</Box>
                                        : part
                                    )}
                                  </Typography>
                                  <Chip label={item.cat} size="small" sx={{ fontSize: '0.58rem', height: 17, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 500 }} />
                                </Box>
                              }
                              secondary={item.sub}
                              secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: '0.7rem' } }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </>
                )}
              </Paper>
            )}
          </Box>

          {/* ---- RIGHT SECTION ---- */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, ml: 2 }}>

            {/* === Groupe Utilitaires : Actions + Export + \u00c9ch\u00e9ances === */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Tooltip title={t.actions} arrow>
                <IconButton
                  size="small"
                  onClick={(e) => setActionsAnchor(e.currentTarget)}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg } }}
                >
                  <AddCircle sx={{ fontSize: 20, color: '#0D7C66' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={t.export} arrow>
                <IconButton
                  size="small"
                  onClick={() => {
                    const tables = document.querySelectorAll('table');
                    if (tables.length > 0) {
                      const rows = Array.from(tables[0].querySelectorAll('tr'));
                      const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim().replace(/\s+/g, ' ')).join(';')).join('\n');
                      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'export_admina_rh.csv'; a.click(); URL.revokeObjectURL(url);
                    }
                  }}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg } }}
                >
                  <FileDownload sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={t.deadlines} arrow>
                <IconButton
                  size="small"
                  onClick={(e) => setDeadlineAnchor(e.currentTarget)}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg } }}
                >
                  <Badge
                    badgeContent={deadlines.filter(d => d.urgent).length}
                    color="warning"
                    sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 15, height: 15, bgcolor: '#e65100' } }}
                  >
                    <Event sx={{ fontSize: 19 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>

            {/* S\u00e9parateur vertical */}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 22, borderColor: dividerClr }} />

            {/* === Groupe Pr\u00e9f\u00e9rences : Dark mode + Langue === */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Tooltip title={darkMode ? t.lightHint : t.darkHint} arrow>
                <IconButton
                  size="small"
                  onClick={toggleDark}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg } }}
                >
                  {darkMode
                    ? <LightModeIcon sx={{ fontSize: 19, color: '#fbbf24' }} />
                    : <DarkModeIcon sx={{ fontSize: 19, color: '#6b7280' }} />
                  }
                </IconButton>
              </Tooltip>

              {/* Langue avec drapeau */}
              <Tooltip title={t.langTitle} arrow>
                <IconButton
                  size="small"
                  onClick={(e) => setLangAnchor(e.currentTarget)}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg }, p: 0.5 }}
                >
                  <Box
                    component="img"
                    src={`https://flagcdn.com/w40/${currentLang.cc}.png`}
                    srcSet={`https://flagcdn.com/w80/${currentLang.cc}.png 2x`}
                    alt={currentLang.label}
                    sx={{ width: 22, height: 16, objectFit: 'cover', borderRadius: 0.3, display: 'block' }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            {/* S\u00e9parateur vertical */}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 22, borderColor: dividerClr }} />

            {/* === Role Switcher === */}
            <Tooltip title="Vue par rôle" arrow>
              <Chip
                icon={roleIconMap[currentRole.icon]}
                label={currentRole.label}
                size="small"
                onClick={(e) => setRoleAnchor(e.currentTarget)}
                onDelete={(e) => { e.stopPropagation(); const idx = ROLES.findIndex(r => r.key === currentRole.key); changeRole(ROLES[(idx + 1) % ROLES.length].key); }}
                deleteIcon={<KeyboardArrowDown sx={{ fontSize: 14 }} />}
                sx={{
                  height: 26, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                  bgcolor: `${currentRole.color}18`, color: currentRole.color,
                  border: `1px solid ${currentRole.color}40`,
                  '& .MuiChip-icon': { color: currentRole.color },
                  '& .MuiChip-deleteIcon': { color: currentRole.color },
                  '&:hover': { bgcolor: `${currentRole.color}25` },
                }}
              />
            </Tooltip>

            {/* === Groupe Notifications + Compte === */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Tooltip title={t.notifications} arrow>
                <IconButton
                  size="small"
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                  sx={{ color: headerColor, '&:hover': { bgcolor: hoverBg } }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16 } }}
                  >
                    <NotifIcon sx={{ fontSize: 19 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Mon compte" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => setAccountAnchor(e.currentTarget)}
                  sx={{ p: 0.25, ml: 0.5 }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: '#0D7C66',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      border: `2px solid ${borderClr}`,
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: '#0D7C66' },
                    }}
                  >
                    {user.initials}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ===== STATS BAR ===== */}
      <Box
        sx={{
          position: 'fixed',
          top: headerHeight,
          left: '260px',
          right: 0,
          height: 34,
          bgcolor: statsBarBg,
          borderBottom: `1px solid ${borderClr}`,
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          gap: 0.75,
          zIndex: 1199,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {recrutementStats.map((stat) => (
          <Chip
            key={stat.key}
            icon={statIconMap[stat.icon]}
            label={(
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: stat.color, fontSize: '0.72rem' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: '0.7rem' }}>
                  {stat.label}
                </Typography>
              </Box>
            )}
            onClick={() => navigate(stat.path)}
            size="small"
            sx={{
              cursor: 'pointer',
              bgcolor: 'transparent',
              border: `1px solid ${borderClr}`,
              height: 26,
              fontSize: '0.7rem',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: hoverBg, borderColor: '#0D7C66', transform: 'translateY(-1px)' },
              '& .MuiChip-icon': { color: stat.color },
            }}
          />
        ))}
      </Box>

      {/* ===== POPOVERS ===== */}

      {/* Quick Actions Popover */}
      <Popover
        open={Boolean(actionsAnchor)}
        anchorEl={actionsAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}` } } }}
      >
        <Paper sx={{ width: 300, bgcolor: paperBg, borderRadius: 2 }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.82rem">{t.actions}</Typography>
          </Box>
          <List dense sx={{ py: 0.5 }}>
            {quickActions.map((a, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => { handleCloseAll(); navigate(a.path); }}
                sx={{ borderRadius: 1.5, mx: 1, my: 0.2, py: 0.8, '&:hover': { bgcolor: hoverBg } }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: a.color }}>{actionIconMap[a.icon]}</ListItemIcon>
                <ListItemText
                  primary={a.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500, fontSize: '0.8rem' }}
                  secondary={a.desc}
                  secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: '0.7rem' } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popover>

      {/* Deadlines Popover */}
      <Popover
        open={Boolean(deadlineAnchor)}
        anchorEl={deadlineAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}` } } }}
      >
        <Paper sx={{ width: 320, bgcolor: paperBg, borderRadius: 2 }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.82rem">{t.deadlines}</Typography>
          </Box>
          <List dense sx={{ py: 0.5 }}>
            {deadlines.map((dl) => (
              <ListItemButton
                key={dl.id}
                onClick={() => { handleCloseAll(); navigate(dl.path); }}
                sx={{ borderRadius: 1.5, mx: 1, my: 0.2, py: 0.8, '&:hover': { bgcolor: hoverBg } }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: dl.urgent ? '#d32f2f' : '#ffb300',
                    boxShadow: dl.urgent ? '0 0 6px rgba(211,47,47,0.4)' : 'none',
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary={dl.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600, fontSize: '0.8rem' }}
                  secondary={dl.sub}
                  secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: '0.7rem' } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popover>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}` } } }}
      >
        <Paper sx={{ width: 380, maxHeight: 420, overflow: 'auto', bgcolor: paperBg, borderRadius: 2 }}>
          <Box sx={{
            px: 2, py: 1.5,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: `1px solid ${borderClr}`,
          }}>
            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.82rem">{t.notifications}</Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: '#0D7C66', cursor: 'pointer', fontSize: '0.7rem', '&:hover': { textDecoration: 'underline' } }}
                onClick={(e) => { e.stopPropagation(); markAllRead(); }}
              >
                {t.allRead}
              </Typography>
            )}
          </Box>
          <List dense sx={{ py: 0 }}>
            {notifications.slice(0, 8).map((notif) => (
              <ListItemButton
                key={notif.id}
                onClick={() => { markRead(notif.id); handleCloseAll(); if (notif.path) navigate(notif.path); }}
                sx={{
                  py: 1.1, px: 2,
                  bgcolor: notif.read ? 'transparent' : (isDark ? 'rgba(13,124,102,0.06)' : 'rgba(13,124,102,0.03)'),
                  borderLeft: notif.read ? '3px solid transparent' : '3px solid #0D7C66',
                  '&:hover': { bgcolor: hoverBg },
                  transition: 'background-color 0.2s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box sx={{
                    width: 30, height: 30, borderRadius: '50%',
                    bgcolor: notif.read ? chipBg : (notif.color + '12'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: notif.color,
                  }}>
                    {notifIconMap[notif.icon] || <NotifIcon sx={{ fontSize: 15 }} />}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <Typography variant="body2" sx={{
                      fontWeight: notif.read ? 400 : 600,
                      fontSize: '0.78rem',
                      lineHeight: 1.35,
                      color: notif.read ? (isDark ? '#9ca3af' : '#6b7280') : headerColor,
                    }}>
                      {notif.msg}
                    </Typography>
                  )}
                  secondary={notif.time}
                  secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.3, fontSize: '0.65rem', color: isDark ? '#6b7280' : '#9ca3af' } }}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: '#0D7C66', cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => { handleCloseAll(); navigate('/audit'); }}
            >
              {t.seeAll}
            </Typography>
          </Box>
        </Paper>
      </Popover>

      {/* Account Popover */}
      <Popover
        open={Boolean(accountAnchor)}
        anchorEl={accountAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}`, overflow: 'hidden' } } }}
      >
        <Paper sx={{ width: 280, bgcolor: paperBg }}>
          <Box sx={{
            px: 2.5, py: 2,
            background: 'linear-gradient(135deg, #0D7C66 0%, #095e4d 100%)',
            color: '#fff',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{
                width: 40, height: 40,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '0.9rem', fontWeight: 'bold',
              }}>
                {user.initials}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff', fontSize: '0.85rem' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </Box>
          <List dense sx={{ py: 0.5 }}>
            {accountMenuItems.map((item, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => { handleCloseAll(); navigate(item.path); }}
                sx={{ borderRadius: 1.5, mx: 1, my: 0.2, py: 0.7, '&:hover': { bgcolor: hoverBg } }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: headerColor }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500, fontSize: '0.8rem' }}
                  secondary={item.desc}
                  secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: '0.7rem' } }}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ px: 1.5, py: 0.5 }}>
            <ListItemButton
              sx={{ borderRadius: 1.5, py: 0.7, '&:hover': { bgcolor: '#fef2f2' } }}
              onClick={handleCloseAll}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#d32f2f' }}><LogoutIcon /></ListItemIcon>
              <ListItemText
                primary="D\u00e9connexion"
                primaryTypographyProps={{ variant: 'body2', color: '#d32f2f', fontWeight: 500, fontSize: '0.8rem' }}
              />
            </ListItemButton>
          </Box>
        </Paper>
      </Popover>

      {/* Language Popover */}
      <Popover
        open={Boolean(langAnchor)}
        anchorEl={langAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}`, overflow: 'hidden' } } }}
      >
        <Paper sx={{ width: 220, bgcolor: paperBg }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.82rem">{t.langTitle}</Typography>
          </Box>
          <List dense sx={{ py: 0.5, maxHeight: 320, overflow: 'auto' }}>
            {languages.map((l) => (
              <ListItemButton
                key={l.code}
                onClick={() => { changeLang(l.code); handleCloseAll(); }}
                sx={{
                  borderRadius: 1.5,
                  mx: 1,
                  my: 0.15,
                  py: 0.6,
                  px: 1.5,
                  bgcolor: lang === l.code ? (isDark ? 'rgba(13,124,102,0.12)' : 'rgba(13,124,102,0.08)') : 'transparent',
                  borderLeft: lang === l.code ? '3px solid #0D7C66' : '3px solid transparent',
                  '&:hover': { bgcolor: hoverBg },
                  transition: 'all 0.15s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  <Box
                    component="img"
                    src={`https://flagcdn.com/w40/${l.cc}.png`}
                    srcSet={`https://flagcdn.com/w80/${l.cc}.png 2x`}
                    alt={l.label}
                    sx={{ width: 26, height: 18, objectFit: 'cover', borderRadius: 0.3, flexShrink: 0 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: lang === l.code ? 600 : 400,
                        fontSize: '0.8rem',
                        color: lang === l.code ? '#0D7C66' : headerColor,
                      }}
                    >
                      {l.label}
                    </Typography>
                  </Box>
                  {lang === l.code && (
                    <CheckCircle sx={{ fontSize: 16, color: '#0D7C66', flexShrink: 0 }} />
                  )}
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popover>

      {/* Role Switcher Popover */}
      <Popover
        open={Boolean(roleAnchor)}
        anchorEl={roleAnchor}
        onClose={handleCloseAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, border: `1px solid ${borderClr}`, overflow: 'hidden' } } }}
      >
        <Paper sx={{ width: 260, bgcolor: paperBg }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.82rem">Vue par rôle</Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Adapte le tableau de bord selon votre fonction</Typography>
          </Box>
          <List dense sx={{ py: 0.5 }}>
            {ROLES.map((r) => (
              <ListItemButton
                key={r.key}
                onClick={() => { changeRole(r.key); handleCloseAll(); }}
                sx={{
                  borderRadius: 1.5, mx: 1, my: 0.15, py: 1,
                  bgcolor: currentRole.key === r.key ? `${r.color}12` : 'transparent',
                  borderLeft: currentRole.key === r.key ? `3px solid ${r.color}` : '3px solid transparent',
                  '&:hover': { bgcolor: hoverBg }, transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: r.color }}>{roleIconMap[r.icon]}</ListItemIcon>
                <ListItemText
                  primary={r.label}
                  primaryTypographyProps={{ fontWeight: currentRole.key === r.key ? 600 : 400, fontSize: '0.8rem', color: currentRole.key === r.key ? r.color : headerColor }}
                  secondary={r.desc}
                  secondaryTypographyProps={{ variant: 'caption', fontSize: '0.65rem' }}
                />
                {currentRole.key === r.key && <CheckCircle sx={{ fontSize: 16, color: r.color }} />}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popover>

    </Box>
  );
}
