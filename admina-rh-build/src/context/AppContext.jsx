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

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [user] = useState({ name: 'Georgy F.', role: 'Responsable RH', initials: 'GF' });

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

  const value = useMemo(() => ({
    user,
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    markRead,
    search,
    searchIndex,
  }), [user, notifications, unreadCount, addNotification, markAllRead, markRead, search]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
