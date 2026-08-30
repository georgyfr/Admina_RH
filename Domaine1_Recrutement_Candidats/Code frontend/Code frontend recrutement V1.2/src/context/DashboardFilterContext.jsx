import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DashboardFilterContext = createContext(null);

const PERIODES = [
  { key: 'mois', label: 'Ce mois' },
  { key: 'trimestre', label: 'Ce trimestre' },
  { key: 'annee', label: 'Cette année' },
  { key: 'tout', label: 'Tout' },
];

const DEPARTEMENTS = [
  { key: 'tout', label: 'Tous les départements' },
  { key: 'Restauration', label: 'Restauration' },
  { key: 'Hébergement', label: 'Hébergement' },
  { key: 'Finance', label: 'Finance & Comptabilité' },
  { key: 'Informatique', label: 'Informatique' },
  { key: 'Sécurité', label: 'Sécurité' },
  { key: 'Service Client', label: 'Service Client' },
  { key: 'Marketing', label: 'Marketing' },
  { key: 'Logistique', label: 'Logistique' },
  { key: 'Commercial', label: 'Commercial' },
];

const SITES = [
  { key: 'tout', label: 'Tous les sites' },
  { key: 'Siège', label: 'Siège (Douala)' },
  { key: 'Annexe', label: 'Annexe (Yaoundé)' },
  { key: 'Hôtel Sawa', label: 'Hôtel Sawa' },
  { key: 'Campus', label: 'Campus Formation' },
];

export function DashboardFilterProvider({ children }) {
  const [periode, setPeriode] = useState('trimestre');
  const [departement, setDepartement] = useState('tout');
  const [site, setSite] = useState('tout');
  const [activeSource, setActiveSource] = useState(null);
  const [activeStatut, setActiveStatut] = useState(null);

  const resetFilters = useCallback(() => {
    setPeriode('trimestre');
    setDepartement('tout');
    setSite('tout');
    setActiveSource(null);
    setActiveStatut(null);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return periode !== 'trimestre' || departement !== 'tout' || site !== 'tout' || activeSource !== null || activeStatut !== null;
  }, [periode, departement, site, activeSource, activeStatut]);

  const value = useMemo(() => ({
    periode, setPeriode,
    departement, setDepartement,
    site, setSite,
    activeSource, setActiveSource,
    activeStatut, setActiveStatut,
    resetFilters, hasActiveFilters,
    PERIODES, DEPARTEMENTS, SITES,
  }), [periode, departement, site, activeSource, activeStatut, resetFilters, hasActiveFilters]);

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  return ctx;
}

export { PERIODES, DEPARTEMENTS, SITES };
