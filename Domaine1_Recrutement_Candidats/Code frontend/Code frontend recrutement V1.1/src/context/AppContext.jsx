import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AppContext = createContext(null);

const searchIndex = [
  { id:'c1', label:'Ndiaye Moussa', sub:'Chef Cuisinier', path:'/candidats', cat:'Candidats' },
  { id:'c2', label:'Tchouankou Claire', sub:'Comptable', path:'/candidats', cat:'Candidats' },
  { id:'c3', label:'Nganou André', sub:'Agent de Sécurité', path:'/candidats', cat:'Candidats' },
  { id:'c4', label:'Mebara Nadège', sub:'Réceptionniste', path:'/candidats', cat:'Candidats' },
  { id:'c5', label:'Kamga Blaise', sub:'Développeur Full Stack', path:'/candidats', cat:'Candidats' },
  { id:'c6', label:'Eyenga Clarisse', sub:'Community Manager', path:'/candidats', cat:'Candidats' },
  { id:'c7', label:'Nkoulou Brandon', sub:'Stagiaire', path:'/candidats', cat:'Candidats' },
  { id:'c8', label:'Fotso Amandine', sub:'Gouvernante', path:'/candidats', cat:'Candidats' },
  { id:'c9', label:'Tabi Sandrine', sub:'Serveuse', path:'/candidats', cat:'Candidats' },
  { id:'c10', label:'Ateba Chantal', sub:'Chef Lingère', path:'/candidats', cat:'Candidats' },
  { id:'d1', label:'Direction Générale', sub:'M. Ngo Ndobo Alain', path:'/departements', cat:'Départements' },
  { id:'d2', label:'Ressources Humaines', sub:'M. Nkoulou Paul', path:'/departements', cat:'Départements' },
  { id:'d3', label:'Finance & Comptabilité', sub:'M. Tchouankou Jean', path:'/departements', cat:'Départements' },
  { id:'d4', label:'Marketing & Communication', sub:'Mme. Mebara Nadège', path:'/departements', cat:'Départements' },
  { id:'d5', label:'Informatique', sub:'M. Kamga Blaise', path:'/departements', cat:'Départements' },
  { id:'d6', label:'Commercial', sub:'M. Tabi Arnaud', path:'/departements', cat:'Départements' },
  { id:'d7', label:'Production', sub:'Mme. Fotso Marie', path:'/departements', cat:'Départements' },
  { id:'d8', label:'Service Client', sub:'Mme. Eyenga Clarisse', path:'/departements', cat:'Départements' },
  { id:'d9', label:'Sécurité', sub:'M. Nganou André', path:'/departements', cat:'Départements' },
  { id:'d10', label:'Restauration', sub:'M. Ndiaye Moussa', path:'/departements', cat:'Départements' },
  { id:'d11', label:'Hébergement', sub:'Mme. Fotso Marie', path:'/departements', cat:'Départements' },
  { id:'d12', label:'Maintenance', sub:'M. Kamga Blaise', path:'/departements', cat:'Départements' },
  { id:'d13', label:'Juridique', sub:'M. Tchouankou Jean', path:'/departements', cat:'Départements' },
  { id:'tc1', label:'CDI', sub:'Contrat à Durée Indéterminée', path:'/types-contrats', cat:'Contrats' },
  { id:'tc2', label:'CDD', sub:'Contrat à Durée Déterminée', path:'/types-contrats', cat:'Contrats' },
  { id:'tc3', label:'Stage', sub:'Convention de stage', path:'/types-contrats', cat:'Contrats' },
  { id:'tc4', label:'Intérim', sub:'Contrat temporaire', path:'/types-contrats', cat:'Contrats' },
  { id:'tc5', label:'Alternance', sub:'Contrat d\'alternance', path:'/types-contrats', cat:'Contrats' },
  { id:'dm1', label:'Chef Cuisinier', sub:'Département Restauration', path:'/offres', cat:'Offres' },
  { id:'dm2', label:'Développeur Full Stack', sub:'Département Informatique', path:'/offres', cat:'Offres' },
  { id:'dm3', label:'Agent de Sécurité', sub:'Département Sécurité', path:'/offres', cat:'Offres' },
  { id:'s1', label:'LinkedIn', sub:'45 candidats', path:'/sources', cat:'Sources' },
  { id:'s2', label:'Indeed', sub:'32 candidats', path:'/sources', cat:'Sources' },
  { id:'s3', label:'Recommandation', sub:'28 candidats', path:'/sources', cat:'Sources' },
  { id:'e1', label:'Ndiaye Moussa — Hôtel Sawa', sub:'Chef Cuisinier, 9 ans', path:'/experiences', cat:'Expériences' },
  { id:'e2', label:'Kamga Blaise — Activa', sub:'Développeur Junior, 4 ans', path:'/experiences', cat:'Expériences' },
  { id:'f1', label:'Ndiaye Moussa — École Hôtelière', sub:'Master Hôtellerie', path:'/formations', cat:'Formations' },
  { id:'f2', label:'Kamga Blaise — IFRI Yaoundé', sub:'Master Informatique', path:'/formations', cat:'Formations' },
  { id:'p1', label:'Tableau de Bord', sub:'Vue d\'ensemble et KPI', path:'/', cat:'Navigation' },
  { id:'p2', label:'Pipeline Candidatures', sub:'Suivi du recrutement', path:'/pipeline', cat:'Navigation' },
  { id:'p3', label:'Planning Entretiens', sub:'Planification', path:'/entretiens', cat:'Navigation' },
  { id:'p4', label:'Suivi Contrats', sub:'Contrats actifs', path:'/contrats', cat:'Navigation' },
  { id:'p5', label:'Paramètres', sub:'Configuration', path:'/parametres', cat:'Navigation' },
  { id:'p6', label:'Audit', sub:'Historique des actions', path:'/audit', cat:'Navigation' },
];

const initialNotifications = [
  { id:'n1', icon:'person_add', color:'#1976d2', msg:'Nouveau candidat : Fotso Amandine — Gouvernante', time:'Il y a 5 min', read:false, path:'/candidats' },
  { id:'n2', icon:'event', color:'#e65100', msg:'Entretien prévu : Kamga Blaise demain à 10h', time:'Il y a 20 min', read:false, path:'/entretiens' },
  { id:'n3', icon:'warning', color:'#d32f2f', msg:'Contrat CDD de Nganou André expire dans 15 jours', time:'Il y a 1h', read:false, path:'/contrats' },
  { id:'n4', icon:'business', color:'#0D7C66', msg:'Département Commercial : 5 postes vacants', time:'Il y a 2h', read:false, path:'/departements' },
  { id:'n5', icon:'description', color:'#7b1fa2', msg:'Demande #DE-003 en attente de validation', time:'Il y a 3h', read:false, path:'/offres' },
  { id:'n6', icon:'check_circle', color:'#2e7d32', msg:'Vérification références validée pour Ndiaye Moussa', time:'Il y a 4h', read:true, path:'/verifications' },
  { id:'n7', icon:'school', color:'#0288d1', msg:'Formation Master Informatique de Kamga Blaise en cours', time:'Il y a 5h', read:true, path:'/formations' },
];

const deadlines = [
  { id:'dl1', label:'Entretien Kamga Blaise', sub:'Demain 10:00 — Informatique', urgent: true, path:'/entretiens' },
  { id:'dl2', label:'Contrat CDD Nganou André', sub:'Expire dans 15 jours', urgent: true, path:'/contrats' },
  { id:'dl3', label:'Période essai Eyenga Clarisse', sub:'Expire dans 30 jours', urgent: false, path:'/periode-essai' },
  { id:'dl4', label:'Fin de stage Nkoulou Brandon', sub:'Dans 2 mois', urgent: false, path:'/stagiaires' },
];

const quickActions = [
  { icon: 'add_circle', label: 'Nouvelle Demande', desc: 'Créer une demande de recrutement', path: '/offres', color: '#1976d2' },
  { icon: 'person_add', label: 'Ajouter un Candidat', desc: 'Enregistrer un nouveau candidat', path: '/candidats', color: '#0D7C66' },
  { icon: 'event', label: 'Planifier Entretien', desc: 'Programmer un entretien', path: '/entretiens', color: '#e65100' },
  { icon: 'description', label: 'Générer un Rapport', desc: 'Exporter les données', path: '/audit', color: '#7b1fa2' },
];

// Stats de recrutement temps réel
const recrutementStats = [
  { key: 'postes', label: 'Postes ouverts', value: 12, icon: 'work', color: '#1976d2', path: '/offres' },
  { key: 'entretiens', label: 'Entretiens / semaine', value: 8, icon: 'event', color: '#e65100', path: '/entretiens' },
  { key: 'contrats', label: 'Contrats à signer', value: 3, icon: 'description', color: '#d32f2f', path: '/contrats' },
  { key: 'attente', label: 'En attente décision', value: 5, icon: 'hourglass_top', color: '#7b1fa2', path: '/pipeline' },
];

// Breadcrumb mapping
const breadcrumbMap = {
  '/': ['Tableau de Bord'],
  '/offres': ['Recrutement', 'Demandes'],
  '/candidats': ['Recrutement', 'Base Candidats'],
  '/pipeline': ['Recrutement', 'Pipeline Candidatures'],
  '/entretiens': ['Processus', 'Planning Entretiens'],
  '/evaluations': ['Processus', 'Grille Évaluation'],
  '/verifications': ['Processus', 'Vérification Références'],
  '/selections': ['Processus', 'Sélections'],
  '/cabinets': ['Processus', 'Gestion Cabinets'],
  '/contrats': ['Processus', 'Suivi Contrats'],
  '/integration': ['Intégration', 'Intégration Employé'],
  '/checklist': ['Intégration', 'Checklist'],
  '/periode-essai': ['Intégration', 'Période d\'Essai'],
  '/formation': ['Intégration', 'Plan Accueil & Formations'],
  '/post-embauche': ['Intégration', 'Suivi Post-Embauche'],
  '/stagiaires': ['Stagiaires & Saisonniers', 'Stagiaires'],
  '/saisonniers': ['Stagiaires & Saisonniers', 'Saisonniers'],
  '/previsions': ['Recrutement', 'Prévisions Postes'],
  '/sources': ['Recrutement', 'Sources'],
  '/couts': ['Recrutement', 'Analyse des Coûts'],
  '/documents': ['Analytics', 'Documents'],
  '/conformite': ['Analytics', 'Conformité'],
  '/parametres': ['Analytics', 'Paramètres'],
  '/audit': ['Analytics', 'Journal d\'Audit'],
  '/types-contrats': ['Recrutement', 'Types de Contrats'],
  '/departements': ['Organisation', 'Départements'],
  '/sources-roi': ['Recrutement', 'Sources & ROI'],
  '/experiences': ['Candidats', 'Expériences'],
  '/formations': ['Candidats', 'Formations'],
  '/competences': ['Candidats', 'Compétences'],
  '/statuts': ['Organisation', 'Statuts'],
};

const languages = [
  { code: 'fr', cc: 'fr', label: 'Français' },
  { code: 'en', cc: 'gb', label: 'English' },
  { code: 'es', cc: 'es', label: 'Español' },
  { code: 'de', cc: 'de', label: 'Deutsch' },
  { code: 'pt', cc: 'br', label: 'Português' },
  { code: 'it', cc: 'it', label: 'Italiano' },
  { code: 'ar', cc: 'sa', label: 'العربية' },
  { code: 'zh', cc: 'cn', label: '中文' },
  { code: 'ja', cc: 'jp', label: '日本語' },
  { code: 'ko', cc: 'kr', label: '한국어' },
  { code: 'ru', cc: 'ru', label: 'Русский' },
  { code: 'tr', cc: 'tr', label: 'Türkçe' },
];

const labels = {
  fr: { search: 'Rechercher un candidat, département, contrat...', noResult: 'Aucun résultat pour', result: 'résultat(s)', allRead: 'Tout marquer comme lu', seeAll: 'Voir tout l\'historique', notifications: 'Notifications', deadlines: 'Échéances', actions: 'Actions rapides', export: 'Exporter', darkHint: 'Mode sombre', lightHint: 'Mode clair', langTitle: 'Langue' },
  en: { search: 'Search candidate, department, contract...', noResult: 'No results for', result: 'result(s)', allRead: 'Mark all as read', seeAll: 'See full history', notifications: 'Notifications', deadlines: 'Deadlines', actions: 'Quick actions', export: 'Export', darkHint: 'Dark mode', lightHint: 'Light mode', langTitle: 'Language' },
};

export function AppProvider({ children, darkMode, toggleDark }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [langState, setLangState] = useState(() => {
    try { return localStorage.getItem('admina-lang') || 'fr'; } catch { return 'fr'; }
  });
  const [user] = useState({ name: 'Georgy F.', role: 'Responsable RH', initials: 'GF' });

  const lang = langState;
  const changeLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem('admina-lang', code); } catch {}
  }, []);

  const t = useMemo(() => labels[lang] || labels.fr, [lang]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: 'n' + Date.now(), read: false, time: 'À l\'instant', ...notif }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const search = useCallback((query) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return searchIndex.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.cat.toLowerCase().includes(q)
    ).slice(0, 12);
  }, []);

  const getBreadcrumb = useCallback((path) => {
    return breadcrumbMap[path] || ['Admina-RH'];
  }, []);

  const value = useMemo(() => ({
    user, notifications, unreadCount, addNotification, markAllRead, markRead, search, searchIndex,
    darkMode, toggleDark, lang, changeLang, t, languages,
    deadlines, quickActions, recrutementStats, getBreadcrumb,
  }), [user, notifications, unreadCount, addNotification, markAllRead, markRead, search, darkMode, toggleDark, lang, changeLang, t, getBreadcrumb]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
