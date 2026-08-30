import { AppBar, Toolbar, Typography, TextField, IconButton, Badge, Avatar, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
export default function Header({ title }) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <AppBar position="fixed" sx={{ ml: '260px', width: 'calc(100% - 260px)', bgcolor: '#fff', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} elevation={0}>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: '#1a1a2e' }}>{title}</Typography>
        <TextField size="small" placeholder="Rechercher..." sx={{ mr: 2, width: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>{today}</Typography>
        <IconButton><Badge badgeContent={3} color="error"><NotificationsIcon /></Badge></IconButton>
        <Box sx={{ ml: 1, cursor: 'pointer' }}><Avatar sx={{ width: 30, height: 30, bgcolor: '#0D7C66', fontSize: '0.75rem' }}>RH</Avatar></Box>
      </Toolbar>
    </AppBar>
  );
}
