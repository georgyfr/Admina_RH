import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const RoleContext = createContext(null);

const ROLES = [
  {
    key: 'recruteur',
    label: 'Recruteur',
    desc: 'Candidats, entretiens, pipeline',
    icon: 'person',
    color: '#1976d2',
    sections: ['kpiMini', 'entretiensJour', 'pipelineResume', 'candidatsRecents'],
  },
  {
    key: 'manager',
    label: 'Manager RH',
    desc: 'KPIs, coûts, volumes, demandes',
    icon: 'business',
    color: '#0D7C66',
    sections: ['kpiFull', 'evolution', 'sources', 'statuts', 'demandesRecentes', 'coutsResume'],
  },
  {
    key: 'drh',
    label: 'DRH',
    desc: 'Vue stratégique, tendances, conformité',
    icon: 'admin_panel_settings',
    color: '#7b1fa2',
    sections: ['kpiStrat', 'evolution', 'departement', 'conformiteResume', 'coutsResume', 'demandesRecentes'],
  },
];

export function RoleProvider({ children }) {
  const [roleKey, setRoleKey] = useState(() => {
    try { return localStorage.getItem('admina-role') || 'manager'; } catch { return 'manager'; }
  });

  const currentRole = useMemo(() => ROLES.find(r => r.key === roleKey) || ROLES[1], [roleKey]);

  const changeRole = useCallback((key) => {
    setRoleKey(key);
    try { localStorage.setItem('admina-role', key); } catch {}
  }, []);

  const value = useMemo(() => ({
    currentRole, roleKey, changeRole, ROLES,
  }), [currentRole, roleKey, changeRole]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export { ROLES };
