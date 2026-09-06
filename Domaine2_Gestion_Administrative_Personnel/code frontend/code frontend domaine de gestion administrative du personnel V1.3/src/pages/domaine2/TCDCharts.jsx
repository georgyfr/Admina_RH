// ============================================================
// TCDCharts.jsx — Graphiques basés sur Tableaux Croisés Dynamiques
//   • TCD_Effectifs : barres empilées (Lignes=Département, Colonnes=Type_Contrat, Valeurs=Nb)
//   • TCD_Présence : courbe par mois (Lignes=Mois, Valeurs=Moyenne Taux_Présence)
// Les TCD se recalculent automatiquement quand les Slicers changent
// (car alimentés par data.employees et data.pointage qui sont déjà filtrés par useScopedData)
// ============================================================
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Legend, LineChart, Line, Cell,
} from 'recharts';
import { Box, Typography, Chip, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ChartCard } from './DashboardSections';

const NAVY = '#0b2a4a';
const NAVY_LIGHT = '#1a4a7a';
const GOLD = '#f9c74f';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const VIOLET = '#7e3ff2';

// Couleurs par type de contrat (cohérentes avec le reste du dashboard)
const COULEURS_CONTRAT = {
  CDI: NAVY,
  CDD: GOLD,
  Stage: VERT,
  Interim: ORANGE,
  Alternance: VIOLET,
  Freelance: '#6b7a8a',
};

// ============================================================
// TCD 1 : Effectifs par Département (barres empilées par Type_Contrat)
// ============================================================
export function TCDEffectifs({ data }) {
  const tcdData = useMemo(() => {
    // Lignes : Département
    // Colonnes : Type_Contrat (CDI, CDD, Stage, Interim)
    // Valeurs : Nb employés
    const typesContrat = ['CDI', 'CDD', 'Stage', 'Interim', 'Alternance', 'Freelance'];

    // Construction de la matrice
    const parDept = {};
    data.employees.forEach(e => {
      if (!parDept[e.departement]) {
        parDept[e.departement] = { departement: e.departement };
        typesContrat.forEach(t => { parDept[e.departement][t] = 0; });
        parDept[e.departement].total = 0;
      }
      if (parDept[e.departement][e.type_contrat] !== undefined) {
        parDept[e.departement][e.type_contrat]++;
      }
      parDept[e.departement].total++;
    });

    // Convertir en tableau trié par total décroissant
    return Object.values(parDept).sort((a, b) => b.total - a.total);
  }, [data.employees]);

  const typesPresents = useMemo(() => {
    const types = ['CDI', 'CDD', 'Stage', 'Interim', 'Alternance', 'Freelance'];
    return types.filter(t => tcdData.some(d => d[t] > 0));
  }, [tcdData]);

  return (
    <ChartCard
      title='TCD Effectifs par Département'
      badge='Barres empilées'
      icon={<PeopleIcon fontSize='small' />}
      height={300}
      action={
        <Chip
          size='small'
          label={`${tcdData.length} départements · ${data.employees.length} employés`}
          sx={{ bgcolor: '#eef3f9', color: NAVY, fontSize: '0.65rem', fontWeight: 600 }}
        />
      }
    >
      <BarChart data={tcdData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' vertical={false} />
        <XAxis dataKey='departement' tick={{ fontSize: 10, fill: '#6b7a8a' }} angle={-20} textAnchor='end' height={60} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7a8a' }} />
        <RTooltip
          contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }}
          formatter={(value, name) => [value, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType='circle' />
        {typesPresents.map(t => (
          <Bar
            key={t}
            dataKey={t}
            stackId='effectifs'
            fill={COULEURS_CONTRAT[t] || '#6b7a8a'}
            radius={t === typesPresents[typesPresents.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            name={t}
          />
        ))}
      </BarChart>
    </ChartCard>
  );
}

// ============================================================
// TCD 2 : Présence moyenne par Mois (courbe)
// ============================================================
export function TCDPresence({ data }) {
  const tcdData = useMemo(() => {
    // Agréger les données de pointage par mois
    // data.pointage contient des entrées avec semaine (ex: 'S37-2025') et taux_presence
    // On extrait le mois depuis la semaine ou on regroupe par période
    const parMois = {};

    // D'abord, regrouper par employé pour calculer la moyenne mensuelle
    const employeMois = {};
    data.pointage.forEach(p => {
      const emp = data.employees.find(e => e.id === p.employee_id);
      if (!emp) return;

      // Extraire le mois de la semaine (format 'S37-2025' -> approximer le mois)
      // Pour le mock, on utilise une date simulée basée sur l'index
      const match = p.semaine.match(/S(\d+)-(\d+)/);
      if (!match) return;
      const semaineNum = parseInt(match[1]);
      const annee = parseInt(match[2]);
      // Approximation : semaine -> mois (1 semaine = ~0.23 mois)
      const moisNum = Math.min(12, Math.max(1, Math.ceil(semaineNum / 4.33)));
      const moisCle = `${annee}-${String(moisNum).padStart(2, '0')}`;
      const moisLabel = new Date(annee, moisNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

      if (!parMois[moisCle]) {
        parMois[moisCle] = { mois: moisLabel, totalPresence: 0, count: 0 };
      }
      parMois[moisCle].totalPresence += p.taux_presence;
      parMois[moisCle].count++;
    });

    // Convertir en tableau trié par mois
    return Object.entries(parMois)
      .map(([cle, val]) => ({
        mois: val.mois,
        tauxMoyen: Math.round(val.totalPresence / val.count),
      }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }, [data.pointage, data.employees]);

  // Si pas assez de données réelles, générer un historique 12 mois à partir du taux actuel
  const chartData = useMemo(() => {
    if (tcdData.length >= 3) return tcdData;
    // Données simulées 12 mois pour démonstration
    const moisLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const base = data.k.tauxPresenceMoyen || 89;
    const variation = [94, 92, 96, 93, 95, 97, 94, 96, 98, 95, 93, base];
    return moisLabels.map((m, i) => ({ mois: m, tauxMoyen: variation[i] }));
  }, [tcdData, data.k.tauxPresenceMoyen]);

  return (
    <ChartCard
      title='TCD Présence moyenne par Mois'
      badge='Courbe'
      icon={<TrendingUpIcon fontSize='small' />}
      height={300}
      action={
        <Chip
          size='small'
          label={`Moyenne: ${data.k.tauxPresenceMoyen}%`}
          sx={{ bgcolor: '#eef3f9', color: NAVY, fontSize: '0.65rem', fontWeight: 600 }}
        />
      }
    >
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
        <XAxis dataKey='mois' tick={{ fontSize: 11, fill: '#6b7a8a' }} />
        <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#6b7a8a' }} />
        <RTooltip
          contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }}
          formatter={(v) => [`${v}%`, 'Taux présence']}
        />
        <Line
          type='monotone'
          dataKey='tauxMoyen'
          stroke={NAVY}
          strokeWidth={2.5}
          dot={{ fill: GOLD, r: 3 }}
          activeDot={{ r: 5 }}
          name='Taux présence moyen'
        />
      </LineChart>
    </ChartCard>
  );
}

// ============================================================
// Composant combiné : les 2 TCD côte à côte
// ============================================================
export default function TCDCharts({ data }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
      <TCDEffectifs data={data} />
      <TCDPresence data={data} />
    </Box>
  );
}
