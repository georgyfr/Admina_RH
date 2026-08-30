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
  HourglassTop, Work, KeyboardCommandKey, FileDownload,
  NavigateNext, Warning as WarningIcon, Translate
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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
  { icon: <ManageAccounts />, label: 'Gestion des Comptes', desc: 'Utilisateurs et rôles', path: '/parametres' },
  { icon: <BusinessIcon />, label: 'Départements', desc: 'Structure organisationnelle', path: '/departements' },
  { icon: <SettingsIcon />, label: 'Paramètres', desc: 'Configuration du système', path: '/parametres' },
];

export default function Header({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    user, notifications, unreadCount, search, markAllRead, markRead,
    darkMode, toggleDark, lang, toggleLang, t,
    deadlines, quickActions, recrutementStats, getBreadcrumb,
  } = useApp();

  // Recherche
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Popovers
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [deadlineAnchor, setDeadlineAnchor] = useState(null);

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
    setNotifAnchor(null); setAccountAnchor(null); setActionsAnchor(null); setDeadlineAnchor(null);
  };

  const headerBg = isDark ? '#141428' : '#fff';
  const headerColor = isDark ? '#e8e8e8' : '#333';
  const statsBarBg = isDark ? '#0f0f22' : '#f0f2f8';
  const paperBg = isDark ? '#1e1e3a' : '#fff';
  const hoverBg = isDark ? 'rgba(14,166,133,0.12)' : 'rgba(13,124,102,0.08)';
  const borderClr = isDark ? '#2a2a4a' : '#e0e0e0';
  const chipBg = isDark ? '#1a1a3a' : '#f5f6fa';

  return (
    <Box>
      {/* ===== MAIN TOOLBAR ===== */}
      <AppBar position="fixed" sx={{ ml: '260px', width: 'calc(100% - 260px)', bgcolor: headerBg, color: headerColor, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)', zIndex: 1200 }} elevation={0}>
        <Toolbar sx={{ gap: 0.5, minHeight: '48px !important' }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, minWidth: 0, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: isDark ? '#888' : '#999', cursor: 'pointer', '&:hover': { color: '#0D7C66' } }} onClick={() => navigate('/')}>Accueil</Typography>
            {breadcrumb.map((crumb, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                <NavigateNext sx={{ fontSize: 14, color: isDark ? '#555' : '#ccc', mx: 0.3 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: idx === breadcrumb.length - 1 ? (isDark ? '#e8e8e8' : '#1a1a2e') : (isDark ? '#888' : '#999'),
                    fontWeight: idx === breadcrumb.length - 1 ? 600 : 400,
                    cursor: 'pointer', '&:hover': { color: '#0D7C66' },
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => { if (idx === 0 && location.pathname !== '/') navigate('/'); }}
                >{crumb}</Typography>
              </Box>
            ))}
          </Box>

          {/* Search */}
          <Box ref={searchRef} sx={{ position: 'relative', flexGrow: 1, maxWidth: 380 }}>
            <TextField
              size="small"
              placeholder={t.search}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => { if (query.length >= 2) setSearchOpen(true); }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: isDark ? '#1a1a3a' : '#f5f6fa', fontSize: '0.8rem', color: headerColor },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0D7C66' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0D7C66' },
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999', fontSize: 18 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip
                      label="Ctrl+K" size="small"
                      sx={{ fontSize: '0.6rem', height: 20, bgcolor: isDark ? '#252545' : '#e8e8e8', color: isDark ? '#888' : '#999', fontWeight: 600 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Search Results Dropdown */}
            {searchOpen && query.length >= 2 && (
              <Paper elevation={8} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1400, mt: 0.5, maxHeight: 380, overflow: 'auto', borderRadius: 2, border: `1px solid ${borderClr}`, bgcolor: paperBg }}>
                {results.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center', color: '#999' }}>
                    <Typography variant="body2">{t.noResult} « {query} »</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: chipBg }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{results.length} {t.result}</Typography>
                    </Box>
                    <List dense sx={{ py: 0.5 }}>
                      {results.map((item) => {
                        const parts = item.label.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                        return (
                          <ListItemButton key={item.id} onClick={() => { setSearchOpen(false); setQuery(''); navigate(item.path); }} sx={{ borderRadius: 1, mx: 0.5, '&:hover': { bgcolor: hoverBg } }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                                    {parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <Box key={i} component="span" sx={{ bgcolor: '#ffeb3b', borderRadius: 0.5, px: 0.3, py: 0 }}>{part}</Box> : part)}
                                  </Typography>
                                  <Chip label={item.cat} size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                </Box>
                              }
                              secondary={item.sub}
                              secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#777' : '#888' } }}
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

          {/* Quick Actions */}
          <Tooltip title={t.actions}>
            <IconButton onClick={(e) => setActionsAnchor(e.currentTarget)}><AddCircle sx={{ color: '#0D7C66', fontSize: 22 }} /></IconButton>
          </Tooltip>
          <Popover open={Boolean(actionsAnchor)} anchorEl={actionsAnchor} onClose={handleCloseAll} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableAutoFocus disableEnforceFocus sx={{ mt: 0.5 }}>
            <Paper sx={{ width: 300, bgcolor: paperBg }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
                <Typography variant="subtitle2" fontWeight="bold">{t.actions}</Typography>
              </Box>
              <List dense sx={{ py: 0.5 }}>
                {quickActions.map((a, idx) => (
                  <ListItemButton key={idx} onClick={() => { handleCloseAll(); navigate(a.path); }} sx={{ borderRadius: 1, mx: 1, my: 0.25, '&:hover': { bgcolor: hoverBg } }}>
                    <ListItemIcon sx={{ minWidth: 40, color: a.color }}>{actionIconMap[a.icon]}</ListItemIcon>
                    <ListItemText primary={a.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} secondary={a.desc} secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#777' : '#888' } }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popover>

          {/* Export */}
          <Tooltip title={t.export}>
            <IconButton onClick={() => {
              const tables = document.querySelectorAll('table');
              if (tables.length > 0) {
                const rows = Array.from(tables[0].querySelectorAll('tr'));
                const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim().replace(/\s+/g, ' ')).join(';')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'export_admina_rh.csv'; a.click(); URL.revokeObjectURL(url);
              }
            }}><FileDownload sx={{ color: headerColor, fontSize: 20 }} /></IconButton>
          </Tooltip>

          {/* Deadlines */}
          <Tooltip title={t.deadlines}>
            <IconButton onClick={(e) => setDeadlineAnchor(e.currentTarget)}>
              <Badge badgeContent={deadlines.filter(d => d.urgent).length} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16, bgcolor: '#e65100' } }}>
                <Event sx={{ color: headerColor, fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Popover open={Boolean(deadlineAnchor)} anchorEl={deadlineAnchor} onClose={handleCloseAll} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableAutoFocus disableEnforceFocus sx={{ mt: 0.5 }}>
            <Paper sx={{ width: 320, bgcolor: paperBg }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderClr}` }}>
                <Typography variant="subtitle2" fontWeight="bold">{t.deadlines}</Typography>
              </Box>
              <List dense sx={{ py: 0.5 }}>
                {deadlines.map((dl) => (
                  <ListItemButton key={dl.id} onClick={() => { handleCloseAll(); navigate(dl.path); }} sx={{ borderRadius: 1, mx: 1, my: 0.25, '&:hover': { bgcolor: hoverBg } }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dl.urgent ? '#d32f2f' : '#ffb300' }} />
                    </ListItemIcon>
                    <ListItemText primary={dl.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondary={dl.sub} secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#777' : '#888' } }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popover>

          {/* Dark Mode */}
          <Tooltip title={darkMode ? t.lightHint : t.darkHint}>
            <IconButton onClick={toggleDark}>{darkMode ? <LightModeIcon sx={{ fontSize: 20, color: '#ffb300' }} /> : <DarkModeIcon sx={{ fontSize: 20, color: '#555' }} />}</IconButton>
          </Tooltip>

          {/* Language */}
          <Tooltip title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}>
            <IconButton onClick={toggleLang}>
              <Translate sx={{ fontSize: 20, color: headerColor }} />
            </IconButton>
          </Tooltip>
          <Chip label={lang.toUpperCase()} size="small" sx={{ fontSize: '0.6rem', height: 20, fontWeight: 700, bgcolor: isDark ? '#252545' : '#e8e8e8', color: isDark ? '#aaa' : '#555' }} />

          {/* Notifications */}
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 18, height: 18 } }}>
              <NotifIcon sx={{ color: headerColor }} />
            </Badge>
          </IconButton>
          <Popover open={Boolean(notifAnchor)} anchorEl={notifAnchor} onClose={handleCloseAll} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableAutoFocus disableEnforceFocus sx={{ mt: 0.5 }}>
            <Paper sx={{ width: 380, maxHeight: 420, overflow: 'auto', bgcolor: paperBg }}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderClr}` }}>
                <Typography variant="subtitle2" fontWeight="bold">{t.notifications}</Typography>
                {unreadCount > 0 && (
                  <Typography variant="caption" sx={{ color: '#0D7C66', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={(e) => { e.stopPropagation(); markAllRead(); }}>{t.allRead}</Typography>
                )}
              </Box>
              <List dense sx={{ py: 0 }}>
                {notifications.slice(0, 8).map((notif) => (
                  <ListItemButton key={notif.id} onClick={() => { markRead(notif.id); handleCloseAll(); if (notif.path) navigate(notif.path); }} sx={{ py: 1.2, px: 2, bgcolor: notif.read ? 'transparent' : 'rgba(13,124,102,0.04)', borderLeft: notif.read ? '3px solid transparent' : '3px solid #0D7C66', '&:hover': { bgcolor: hoverBg } }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: notif.read ? chipBg : (notif.color + '15'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: notif.color }}>
                        {notifIconMap[notif.icon] || <NotifIcon sx={{ fontSize: 16 }} />}
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: notif.read ? 400 : 600, fontSize: '0.8rem', lineHeight: 1.3 }}>{notif.msg}</Typography>} secondary={notif.time} secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.3 } }} />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#0D7C66', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }} onClick={() => { handleCloseAll(); navigate('/audit'); }}>{t.seeAll}</Typography>
              </Box>
            </Paper>
          </Popover>

          {/* Account */}
          <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)} sx={{ p: 0, ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0D7C66', fontSize: '0.75rem', fontWeight: 'bold', border: `2px solid ${borderClr}` }}>{user.initials}</Avatar>
          </IconButton>
          <Popover open={Boolean(accountAnchor)} anchorEl={accountAnchor} onClose={handleCloseAll} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableAutoFocus disableEnforceFocus sx={{ mt: 0.5 }}>
            <Paper sx={{ width: 280, bgcolor: paperBg }}>
              <Box sx={{ px: 2.5, py: 2, background: 'linear-gradient(135deg, #0D7C66 0%, #095e4d 100%)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 42, height: 42, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.95rem', fontWeight: 'bold' }}>{user.initials}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff' }}>{user.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{user.role}</Typography>
                  </Box>
                </Box>
              </Box>
              <List dense sx={{ py: 0.5 }}>
                {accountMenuItems.map((item, idx) => (
                  <ListItemButton key={idx} onClick={() => { handleCloseAll(); navigate(item.path); }} sx={{ borderRadius: 1, mx: 1, my: 0.25, '&:hover': { bgcolor: hoverBg } }}>
                    <ListItemIcon sx={{ minWidth: 36, color: headerColor }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} secondary={item.desc} secondaryTypographyProps={{ variant: 'caption', sx: { color: isDark ? '#777' : '#999' } }} />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ px: 1.5, py: 0.5 }}>
                <ListItemButton sx={{ borderRadius: 1, '&:hover': { bgcolor: '#ffebee' } }} onClick={handleCloseAll}>
                  <ListItemIcon sx={{ minWidth: 36, color: '#d32f2f' }}><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Déconnexion" primaryTypographyProps={{ variant: 'body2', color: '#d32f2f', fontWeight: 500 }} />
                </ListItemButton>
              </Box>
            </Paper>
          </Popover>
        </Toolbar>
      </AppBar>

      {/* ===== STATS BAR ===== */}
      <Box sx={{ position: 'fixed', top: 48, left: '260px', right: 0, height: 36, bgcolor: statsBarBg, borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', px: 2, gap: 1, zIndex: 1199, overflowX: 'auto' }}>
        {recrutementStats.map((stat) => (
          <Chip
            key={stat.key}
            icon={statIconMap[stat.icon]}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: stat.color }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#888' : '#777' }}>{stat.label}</Typography>
            </Box>}
            onClick={() => navigate(stat.path)}
            size="small"
            sx={{
              cursor: 'pointer', bgcolor: 'transparent', border: `1px solid ${borderClr}`,
              '&:hover': { bgcolor: hoverBg, borderColor: '#0D7C66' },
              '& .MuiChip-icon': { color: stat.color },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
