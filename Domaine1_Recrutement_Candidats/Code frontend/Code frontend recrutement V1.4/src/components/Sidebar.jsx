import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const sections = [
  { title: 'VUE D\'ENSEMBLE', items: [{ label: 'Tableau de Bord', path: '/' }] },
  { title: 'GESTION DES OFFRES', items: [
    { label: 'Offres d\'Emploi', path: '/offres' },
    { label: 'Demandes', path: '/demandes' },
    { label: 'Prévisions Postes', path: '/previsions' },
    { label: 'Sources Recrutement', path: '/sources' },
    { label: 'Analyse des Coûts', path: '/couts' },
  ]},
  { title: 'GESTION DES CANDIDATS', items: [
    { label: 'Base Candidats', path: '/candidats' },
    { label: 'Pipeline Candidatures', path: '/pipeline' },
    { label: 'Types de Contrats', path: '/types-contrats' },
    { label: 'Départements', path: '/departements' },
  ]},
  { title: 'PROCESSUS DE RECRUTEMENT', items: [
    { label: 'Planning Entretiens', path: '/entretiens' },
    { label: 'Grille Évaluation', path: '/evaluations' },
    { label: 'Vérification Références', path: '/verifications' },
    { label: 'Sélections', path: '/selections' },
    { label: 'Gestion Cabinets', path: '/cabinets' },
    { label: 'Suivi Contrats', path: '/contrats' },
  ]},
  { title: 'INTÉGRATION & SUIVI', items: [
    { label: 'Intégration Employé', path: '/integration' },
    { label: 'Checklist Intégration', path: '/checklist' },
    { label: 'Période d\'Essai', path: '/periode-essai' },
    { label: 'Plan Accueil Formation', path: '/formation' },
    { label: 'Suivi Post-Embauche', path: '/post-embauche' },
  ]},
  { title: 'STAGIAIRES & SAISONNIERS', items: [
    { label: 'Stagiaires', path: '/stagiaires' },
    { label: 'Saisonniers & Temporaires', path: '/saisonniers' },
  ]},
  { title: 'PLUS', items: [
    { label: 'Sources & ROI', path: '/sources-roi' },
    { label: 'Expériences', path: '/experiences' },
    { label: 'Formations Candidats', path: '/formations' },
    { label: 'Compétences', path: '/competences' },
  ]},
  { title: 'ANALYTICS & CONFIGURATION', items: [
    { label: 'KPIs & Objectifs RH', path: '/kpi-objectifs' },
    { label: 'Documents', path: '/documents' },
    { label: 'Conformité', path: '/conformite' },
    { label: 'Paramètres', path: '/parametres' },
    { label: 'Audit', path: '/audit' },
    { label: 'Statuts', path: '/statuts' },
  ]},
];

export default function Sidebar({ drawerWidth }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer variant='permanent' sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#1a1a2e', color: '#fff' } }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#0D7C66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>AR</Box>
        <Box>
          <Typography variant='subtitle2' fontWeight='bold' sx={{ lineHeight: 1.2 }}>Admina-RH</Typography>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>Domaine 1 — Recrutement</Typography>
        </Box>
      </Box>
      {sections.map((section, i) => (
        <Box key={i}>
          <Typography variant='caption' sx={{ px: 2, pt: 1.5, display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>{section.title}</Typography>
          <List dense>
            {section.items.map((item) => (
              <ListItemButton key={item.path} selected={location.pathname === item.path} onClick={() => navigate(item.path)} sx={{ borderRadius: 1, mx: 1, mb: 0.25, '&.Mui-selected': { bgcolor: 'rgba(13,124,102,0.3)' }, '&.Mui-selected:hover': { bgcolor: 'rgba(13,124,102,0.4)' } }}>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Drawer>
  );
}