import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AppProvider } from './context/AppContext';
import { DashboardFilterProvider } from './context/DashboardFilterContext';
import { RoleProvider } from './context/RoleContext';
import { lightTheme, darkTheme } from './theme';

const TableauDeBord = lazy(() => import('./pages/TableauDeBord'));
const Offres = lazy(() => import('./pages/Offres'));
const Demandes = lazy(() => import('./pages/Demandes'));
const Candidats = lazy(() => import('./pages/Candidats'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const Entretiens = lazy(() => import('./pages/Entretiens'));
const Evaluations = lazy(() => import('./pages/Evaluations'));
const Verifications = lazy(() => import('./pages/Verifications'));
const Selections = lazy(() => import('./pages/Selections'));
const Cabinets = lazy(() => import('./pages/Cabinets'));
const Contrats = lazy(() => import('./pages/Contrats'));
const Integration = lazy(() => import('./pages/Integration'));
const Checklist = lazy(() => import('./pages/Checklist'));
const PeriodeEssai = lazy(() => import('./pages/PeriodeEssai'));
const Formation = lazy(() => import('./pages/Formation'));
const PostEmbauche = lazy(() => import('./pages/PostEmbauche'));
const Stagiaires = lazy(() => import('./pages/Stagiaires'));
const Saisonniers = lazy(() => import('./pages/Saisonniers'));
const Previsions = lazy(() => import('./pages/Previsions'));
const Sources = lazy(() => import('./pages/Sources'));
const Couts = lazy(() => import('./pages/Couts'));
const Documents = lazy(() => import('./pages/Documents'));
const Conformite = lazy(() => import('./pages/Conformite'));
const Parametres = lazy(() => import('./pages/Parametres'));
const Audit = lazy(() => import('./pages/Audit'));
const TypesContrats = lazy(() => import('./pages/TypesContrats'));
const Departements = lazy(() => import('./pages/Departements'));
const SourcesROI = lazy(() => import('./pages/SourcesROI'));
const Experiences = lazy(() => import('./pages/Experiences'));
const FormationsCandidats = lazy(() => import('./pages/FormationsCandidats'));
const Competences = lazy(() => import('./pages/Competences'));
const Statuts = lazy(() => import('./pages/Statuts'));
const KPIObjectifsRH = lazy(() => import('./pages/KPIObjectifsRH'));

// --- Domaine 2 — Gestion Administrative du Personnel ---
const D2Layout = lazy(() => import('./pages/domaine2/D2Layout'));
const TableauDeBordD2 = lazy(() => import('./pages/domaine2/TableauDeBordD2'));
const EmployesD2 = lazy(() => import('./pages/domaine2/EmployesD2'));
const ContratsD2 = lazy(() => import('./pages/domaine2/ContratsD2'));
const CongesD2 = lazy(() => import('./pages/domaine2/CongesD2'));
const GenericD2Page = lazy(() => import('./pages/domaine2/GenericD2Page'));
const Phase0Docs = lazy(() => import('./pages/domaine2/Phase0Docs'));
const ErrorBoundary = lazy(() => import('./pages/domaine2/ErrorBoundary'));

const D2_BASE = '/domaine2_Gestion_Administrative_Personnel';

const titles = { '/': 'Tableau de Bord', '/offres': 'Offres d\'Emploi', '/demandes': 'Demandes', '/candidats': 'Base Candidats', '/pipeline': 'Pipeline Candidatures', '/entretiens': 'Planning Entretiens', '/evaluations': 'Grille Evaluation', '/verifications': 'Verification References', '/selections': 'Selections', '/cabinets': 'Gestion Cabinets', '/contrats': 'Suivi Contrats', '/integration': 'Integration Employe', '/checklist': 'Checklist Integration', '/periode-essai': "Periodes d'Essai", '/formation': "Plan d'Accueil & Formations", '/post-embauche': 'Suivi Post-Embauche', '/stagiaires': 'Stagiaires', '/saisonniers': 'Saisonniers & Temporaires', '/previsions': 'Previsions', '/sources': 'Sources de Recrutement', '/couts': 'Analyse des Couts', '/documents': 'Gestion des Documents', '/conformite': 'Conformite', '/parametres': 'Parametres du Systeme', '/audit': 'Journal d\'Audit', '/types-contrats': 'Types de Contrats', '/departements': 'Departements', '/sources-roi': 'Sources & ROI', '/experiences': 'Experiences des Candidats', '/formations': 'Formations des Candidats', '/competences': 'Competences des Candidats', '/statuts': 'Gestion des Statuts', '/kpi-objectifs': 'KPIs & Objectifs RH' };

const dw = 260;
const headerH = 86;

function AppContent() {
  const loc = useLocation();
  const [title, setTitle] = useState('Admina-RH');
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('admina-dark') === 'true'; } catch { return false; }
  });

  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('admina-dark', String(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => { setTitle(titles[loc.pathname] || 'Admina-RH'); }, [loc]);

  const theme = darkMode ? darkTheme : lightTheme;
  const isD2 = loc.pathname.startsWith(D2_BASE);

  // --- Domaine 2 : layout dédié (sidebar 5 phases + 22 écrans) ---
  if (isD2) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider darkMode={darkMode} toggleDark={toggleDark}>
          <RoleProvider>
            <Suspense fallback={<Box p={3}>Chargement Domaine 2...</Box>}>
              <Routes>
                <Route path={D2_BASE} element={<D2Layout darkMode={darkMode} toggleDark={toggleDark} />}>
                  <Route index element={<TableauDeBordD2 />} />
                  <Route path='employes' element={<EmployesD2 />} />
                  <Route path='contrats' element={<ContratsD2 />} />
                  <Route path='conges' element={<CongesD2 />} />
                  <Route path='avenants' element={<GenericD2Page screen='avenants' />} />
                  <Route path='documents' element={<GenericD2Page screen='documents' />} />
                  <Route path='bancaires' element={<GenericD2Page screen='bancaires' />} />
                  <Route path='mutuelle' element={<GenericD2Page screen='mutuelle' />} />
                  <Route path='permis' element={<GenericD2Page screen='permis' />} />
                  <Route path='soldes' element={<GenericD2Page screen='soldes' />} />
                  <Route path='absences' element={<GenericD2Page screen='absences' />} />
                  <Route path='heures-supp' element={<GenericD2Page screen='heures-supp' />} />
                  <Route path='pointage' element={<GenericD2Page screen='pointage' />} />
                  <Route path='planning' element={<GenericD2Page screen='planning' />} />
                  <Route path='paie' element={<GenericD2Page screen='paie' />} />
                  <Route path='declarations' element={<GenericD2Page screen='declarations' />} />
                  <Route path='prets' element={<GenericD2Page screen='prets' />} />
                  <Route path='sanctions' element={<GenericD2Page screen='sanctions' />} />
                  <Route path='visites-medicales' element={<GenericD2Page screen='visites-medicales' />} />
                  <Route path='departs' element={<GenericD2Page screen='departs' />} />
                  <Route path='archivage' element={<GenericD2Page screen='archivage' />} />
                  <Route path='rappels' element={<GenericD2Page screen='rappels' />} />
                  <Route path='phase0' element={<ErrorBoundary><Phase0Docs /></ErrorBoundary>} />
                </Route>
              </Routes>
            </Suspense>
          </RoleProvider>
        </AppProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider darkMode={darkMode} toggleDark={toggleDark}>
        <RoleProvider>
        <Sidebar drawerWidth={dw} />
        <Header title={title} />
        <Box sx={{ ml: `${dw}px`, mt: `${headerH}px`, p: 3, width: `calc(100% - ${dw}px)`, minHeight: `calc(100vh - ${headerH}px)` }}>
          <Suspense fallback={<Box p={3}>Chargement...</Box>}>
            <Routes>
              <Route path='/' element={<DashboardFilterProvider><TableauDeBord /></DashboardFilterProvider>} />
              <Route path='/offres' element={<Offres />} />
              <Route path='/demandes' element={<Demandes />} />
              <Route path='/candidats' element={<Candidats />} />
              <Route path='/pipeline' element={<Pipeline />} />
              <Route path='/entretiens' element={<Entretiens />} />
              <Route path='/evaluations' element={<Evaluations />} />
              <Route path='/verifications' element={<Verifications />} />
              <Route path='/selections' element={<Selections />} />
              <Route path='/cabinets' element={<Cabinets />} />
              <Route path='/contrats' element={<Contrats />} />
              <Route path='/integration' element={<Integration />} />
              <Route path='/checklist' element={<Checklist />} />
              <Route path='/periode-essai' element={<PeriodeEssai />} />
              <Route path='/formation' element={<Formation />} />
              <Route path='/post-embauche' element={<PostEmbauche />} />
              <Route path='/stagiaires' element={<Stagiaires />} />
              <Route path='/saisonniers' element={<Saisonniers />} />
              <Route path='/previsions' element={<Previsions />} />
              <Route path='/sources' element={<Sources />} />
              <Route path='/couts' element={<Couts />} />
              <Route path='/documents' element={<Documents />} />
              <Route path='/conformite' element={<Conformite />} />
              <Route path='/parametres' element={<Parametres />} />
              <Route path='/audit' element={<Audit />} />
              <Route path='/types-contrats' element={<TypesContrats />} />
              <Route path='/departements' element={<Departements />} />
              <Route path='/sources-roi' element={<SourcesROI />} />
              <Route path='/experiences' element={<Experiences />} />
              <Route path='/formations' element={<FormationsCandidats />} />
              <Route path='/competences' element={<Competences />} />
              <Route path='/statuts' element={<Statuts />} />
              <Route path='/kpi-objectifs' element={<KPIObjectifsRH />} />
            </Routes>
          </Suspense>
        </Box>
        </RoleProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
