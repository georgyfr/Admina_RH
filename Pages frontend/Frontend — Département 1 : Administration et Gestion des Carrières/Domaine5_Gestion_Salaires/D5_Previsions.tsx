'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05PrevisionPaie } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Custom badge pour écart                                            */
/* ------------------------------------------------------------------ */

function EcartBadge({ ecart }: { ecart: number | null }) {
  if (ecart === null) {
    return (
      <span className="inline-flex items-center rounded-full border bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800">
        —
      </span>
    );
  }
  const isPositive = ecart > 0;
  const formatted = `${isPositive ? '+' : ''}${ecart.toLocaleString('fr-FR')} FCFA`;
  const style = isPositive
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {formatted}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom badge pour statut prévision                                 */
/* ------------------------------------------------------------------ */

const STATUT_PREVISION_MAP: Record<string, string> = {
  realise:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  prevision:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
};

function StatutPrevisionBadge({ statut }: { statut: string }) {
  const style = STATUT_PREVISION_MAP[statut] ?? '';
  const label = statut.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFcfa(value: number | null): string {
  if (value === null) return '—';
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

function formatDate(value: string): string {
  if (value === '—') return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D05PrevisionPaie>[] = [
  { key: 'structure', label: 'Structure' },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  {
    key: 'masse_salariale_prevue',
    label: 'Masse Prévue',
    render: (row) => <span className="font-medium">{formatFcfa(row.masse_salariale_prevue)}</span>,
  },
  {
    key: 'masse_salariale_reelle',
    label: 'Masse Réelle',
    render: (row) => <span>{formatFcfa(row.masse_salariale_reelle)}</span>,
  },
  {
    key: 'ecart',
    label: 'Écart',
    render: (row) => <EcartBadge ecart={row.ecart} />,
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <StatutPrevisionBadge statut={row.statut} />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PrevisionsPage() {
  const data = mockD05.previsions_paie;

  const kpis = useMemo(() => {
    const masseTotalePrevue = data.reduce((s, p) => s + p.masse_salariale_prevue, 0);
    const ecartsPositifs = data.filter((p) => p.ecart !== null && p.ecart > 0).length;
    const enAttente = data.filter((p) => p.statut === 'prevision').length;
    return [
      {
        title: 'Masse totale prévue',
        value: masseTotalePrevue,
        icon: TrendingUp,
        trend: { value: 4.2, label: 'vs trimestre dernier' },
        color: 'orange' as const,
        subtitle: 'montant masse salariale',
      },
      {
        title: 'Écarts positifs',
        value: ecartsPositifs,
        icon: TrendingUp,
        trend: { value: 1, label: 'nouveau' },
        color: 'green' as const,
      },
      {
        title: 'Prévisions en attente',
        value: enAttente,
        icon: TrendingUp,
        trend: { value: -3, label: 'vs mois dernier' },
        color: 'blue' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Prévisions de Masse Salariale"
        description="Suivi budgétaire des masses salariales prévisionnelles par structure avec analyse des écarts."
        icon={TrendingUp}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Prévisions de Paie' },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            color={kpi.color}
            subtitle={kpi.subtitle}
          />
        ))}
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher une prévision..."
        title="Liste des prévisions de masse salariale"
        pageSize={10}
      />
    </div>
  );
}
