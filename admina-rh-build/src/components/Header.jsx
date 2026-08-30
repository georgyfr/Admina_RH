import { useState, useRef, useEffect, useMemo } from 'react';
import {
  AppBar, Toolbar, Typography, TextField, IconButton, Badge, Avatar,
  Box, Paper, Popover, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Chip, InputAdornment
} from '@mui/material';
import {
  Notifications as NotifIcon, Search as SearchIcon, Person as PersonIcon,
  Settings as SettingsIcon, Business as BusinessIcon, Logout as LogoutIcon,
  CheckCircle, ManageAccounts, Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const notifIconMap = {
  person_add: <PersonIcon sx={{ fontSize: 18 }} />,
  event: <Dashboard sx={{ fontSize: 18 }} />,
  warning: <SettingsIcon sx={{ fontSize: 18 }} />,
  business: <BusinessIcon sx={{ fontSize: 18 }} />,
  description: <CheckCircle sx={{ fontSize: 18 }} />,
  check_circle: <CheckCircle sx={{ fontSize: 18 }} />,
  school: <Dashboard sx={{ fontSize: 18 }} />,
};

const accountMenuItems = [
  { icon: <PersonIcon />, label: 'Mon Profil', desc: 'Voir mes informations', path: '/parametres' },
  { icon: <ManageAccounts />, label: 'Gestion des Comptes', desc: 'Utilisateurs et rôles', path: '/parametres' },
  { icon: <BusinessIcon />, label: 'Départements', desc: 'Structure organisationnelle', path: '/departements' },
  { icon: <SettingsIcon />, label: 'Paramètres', desc: 'Configuration du système', path: '/parametres' },
];

export default function Header({ title }) {
  const navigate = useNavigate();
  const { user, notifications, unreadCount, search, markAllRead, markRead } = useApp();

  // Recherche
  const [query, setQuery] = useState('');
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Notifications
  const [notifAnchor, setNotifAnchor] = useState(null);

  // Compte
  const [accountAnchor, setAccountAnchor] = useState(null);

  const results = useMemo(() => search(query), [query, search]);

  // Fermer la recherche si on clique ailleurs
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchClick = (item) => {
 setShowSearch(false);
    setQuery('');
    navigate(item.path);
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifAnchor(null);
    if (notif.path) navigate(notif.path);
  };

  const handleAccountClick = (item) => {
    setAccountAnchor(null);
    if (item.path) navigate(item.path);
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AppBar position="fixed" sx={{ ml: '260px', width: 'calc(100% - 260px)', bgcolor: '#fff', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Titre */}
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 0, color: '#1a1a2e', mr: 2, whiteSpace: 'nowrap' }}>{title}</Typography>

        {/* Champ de recherche intelligent */}
        <Box ref={searchRef} sx={{ position: 'relative', flexGrow: 1, maxWidth: 420 }}>
          <TextField
            size="small"
            placeholder="Rechercher un candidat, département, contrat..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => { if (query.length >= 2) setShowSearch(true); }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f5f6fa', fontSize: '0.85rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0D7C66' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0D7C66' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment>
              ),
            }}
          />

          {/* Résultats de recherche en dropdown */}
          {showSearch && query.length >= 2 && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300,
                mt: 0.5, maxHeight: 380, overflow: 'auto',
                borderRadius: 2, border: '1px solid #e0e0e0',
              }}
            >
              {results.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: '#999' }}>
                  <Typography variant="body2">Aucun résultat pour « {query} »</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#f5f6fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{results.length} résultat(s)</Typography>
                  </Box>
                  <List dense sx={{ py: 0.5 }}>
                    {results.map((item, idx) => {
                      const parts = item.label.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                      return (
                        <ListItemButton
                          key={item.id}
                          onClick={() => handleSearchClick(item)}
                          sx={{ borderRadius: 1, mx: 0.5, '&:hover': { bgcolor: 'rgba(13,124,102,0.08)' } }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                                  {parts.map((part, i) =>
                                    part.toLowerCase() === query.toLowerCase()
                                      ? <Box key={i} component="span" sx={{ bgcolor: '#ffeb3b', borderRadius: 0.5, px: 0.3, py: 0 }}>{part}</Box>
                                      : part
                                  )}
                                </Typography>
                                <Chip label={item.cat} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                              </Box>
                            }
                            secondary={item.sub}
                            secondaryTypographyProps={{ variant: 'caption', sx: { color: '#888' } }}
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

        {/* Date */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, display: { xs: 'none', lg: 'block' }, whiteSpace: 'nowrap' }}>{today}</Typography>

        {/* Notifications */}
        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 18, height: 18 } }}>
            <NotifIcon sx={{ color: '#555' }} />
          </Badge>
        </IconButton>
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          disableAutoFocus
          disableEnforceFocus
          sx={{ mt: 0.5 }}
        >
          <Paper sx={{ width: 380, maxHeight: 420, overflow: 'auto' }}>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle2" fontWeight="bold">Notifications</Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: '#0D7C66', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                >Tout marquer comme lu</Typography>
              )}
            </Box>
            <List dense sx={{ py: 0 }}>
              {notifications.slice(0, 8).map((notif) => (
                <ListItemButton
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  sx={{
                    py: 1.2, px: 2,
                    bgcolor: notif.read ? 'transparent' : 'rgba(13,124,102,0.04)',
                    borderLeft: notif.read ? '3px solid transparent' : '3px solid #0D7C66',
                    '&:hover': { bgcolor: 'rgba(13,124,102,0.08)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: notif.read ? '#f5f5f5' : (notif.color + '15'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: notif.color }}>
                      {notifIconMap[notif.icon] || <NotifIcon sx={{ fontSize: 16 }} />}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notif.read ? 400 : 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                        {notif.msg}
                      </Typography>
                    }
                    secondary={notif.time}
                    secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.3 } }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Divider />
            <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{ color: '#0D7C66', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                onClick={() => { setNotifAnchor(null); navigate('/audit'); }}
              >Voir tout l'historique</Typography>
            </Box>
          </Paper>
        </Popover>

        {/* Avatar + Menu Compte */}
        <Box sx={{ ml: 0.5 }}>
          <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)} sx={{ p: 0 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#0D7C66', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid #e0e0e0' }}>
              {user.initials}
            </Avatar>
          </IconButton>
          <Popover
            open={Boolean(accountAnchor)}
            anchorEl={accountAnchor}
            onClose={() => setAccountAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            disableAutoFocus
            disableEnforceFocus
            sx={{ mt: 0.5 }}
          >
            <Paper sx={{ width: 280, p: 0 }}>
              {/* En-tête du profil */}
              <Box sx={{ px: 2.5, py: 2, bgcolor: 'linear-gradient(135deg, #0D7C66 0%, #0a5c4d 100%)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '1rem', fontWeight: 'bold' }}>{user.initials}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff' }}>{user.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{user.role}</Typography>
                  </Box>
                </Box>
              </Box>
              {/* Items du menu */}
              <List dense sx={{ py: 0.5 }}>
                {accountMenuItems.map((item, idx) => (
                  <ListItemButton
                    key={idx}
                    onClick={() => handleAccountClick(item)}
                    sx={{ borderRadius: 1, mx: 1, my: 0.25, '&:hover': { bgcolor: 'rgba(13,124,102,0.08)' } }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: '#555' }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondary={item.desc}
                      secondaryTypographyProps={{ variant: 'caption', sx: { color: '#999' } }}
                    />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ px: 1.5, py: 0.5 }}>
                <ListItemButton
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: '#ffebee' } }}
                  onClick={() => setAccountAnchor(null)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#d32f2f' }}><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Déconnexion" primaryTypographyProps={{ variant: 'body2', color: '#d32f2f', fontWeight: 500 }} />
                </ListItemButton>
              </Box>
            </Paper>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
