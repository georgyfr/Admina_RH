import { Paper, Typography, Box } from '@mui/material';

export default function KPICard({ titre, valeur, sousTexte }) {
  return (
    <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{titre}</Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ my: 0.5 }}>{valeur}</Typography>
      <Typography variant="body2" color="text.secondary">{sousTexte}</Typography>
    </Paper>
  );
}