import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const TableauDeBord = lazy(() => import('./pages/TableauDeBord'));
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

const titles = { '/': 'Tableau de Bord', '/offres': 'Demandes', '/candidats': 'Base Candidats', '/pipeline': 'Pipeline Candidatures', '/entretiens': 'Planning Entretiens', '/evaluations': 'Grille Evaluation', '/verifications': 'Verification References', '/selections': 'Selections', '/cabinets': 'Gestion Cabinets', '/contrats': 'Suivi Contrats', '/integration': 'Integration Employe', '/checklist': 'Checklist Integration', '/periode-essai': 'Periodes d\'Essai', '/formation': "Plan d\'Accueil & Formations", '/post-embauche': 'Suivi Post-Embauche', '/stagiaires': 'Stagiaires', '/saisonniers': 'Saisonniers & Temporaires', '/previsions': 'Previsions', '/sources': 'Sources de Recrutement', '/couts': 'Analyse des Couts', '/documents': 'Gestion des Documents', '/conformite': 'Conformite', '/parametres': 'Parametres du Systeme', '/audit': 'Journal d\'Audit', '/types-contrats': 'Types de Contrats', '/departements': 'Departements', '/sources-roi': 'Sources & ROI', '/experiences': 'Experiences des Candidats', '/formations': 'Formations des Candidats', '/competences': 'Competences des Candidats', '/statuts': 'Gestion des Statuts' };

const dw = 260;

function AppContent() {
  const loc = useLocation();
  const [title, setTitle] = useState('Admina-RH');
  useEffect(() => { setTitle(titles[loc.pathname] || 'Admina-RH'); }, [loc]);
  return (
    <>
      <Sidebar drawerWidth={dw} />
      <Header title={title} />
      <Box sx={{ ml: `${dw}px`, mt: '64px', p: 3, width: `calc(100% - ${dw}px)` }}>
        <Suspense fallback={<Box p={3}>Chargement...</Box>}>
          <Routes>
            <Route path='/' element={<TableauDeBord />} />
            <Route path='/offres' element={<Demandes />} />
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
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}