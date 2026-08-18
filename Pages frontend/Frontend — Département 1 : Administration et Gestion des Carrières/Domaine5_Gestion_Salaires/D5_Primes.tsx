'use client';

import { useMemo } from 'react';
import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05Prime } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status badge custom pour prime                                     */
/* ------------------------------------------------------------------ */

const PRIME_STATUS_MAP: Record<string, string> = {
  demandee: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  validee: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  rejetee: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  payee: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
};

function PrimeStatusBadge({ status }: { status: string }) {
  const style = PRIME_STATUS_MAP[status] ?? '';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFcfa(value: number): string {
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

const columns: Column<D05Prime>[] = [
  { key: 'employe', label: 'Employé' },
  { key: 'type_prime', label: 'Type Prime' },
  {
    key: 'montant',
    label: 'Montant (FCFA)',
    render: (row) => <span className="font-medium">{formatFcfa(row.montant)}</span>,
  },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  { key: 'motif', label: 'Motif' },
  { key: 'valide_par', label: 'Validé Par' },
  {
    key: 'date_validation',
    label: 'Date Validation',
    render: (row) => <span>{formatDate(row.date_validation)}</span>,
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <PrimeStatusBadge status={row.statut} />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PrimesPage() {
  const data = mockD05.primes;

  const kpis = useMemo(() => {
    const totalPrimes = data.reduce((s, p) => s + p.montant, 0);
    const enAttente = data.filter((p) => p.statut === 'demandee').length;
    const validees = data.filter((p) => p.statut === 'validee' || p.statut === 'payee').length;
    return [
      {
        title: 'Total primes mois',
        value: totalPrimes,
        icon: Gift,
        trend: { value: 5.2, label: 'vs mois dernier' },
        color: 'orange' as const,
        subtitle: 'montant primes',
      },
      {
        title: 'En attente validation',
        value: enAttente,
        icon: Gift,
        trend: { value: -10, label: 'vs mois dernier' },
        color: 'red' as const,
      },
      {
        title: 'Validées',
        value: validees,
        icon: Gift,
        trend: { value: 12, label: 'ce mois' },
        color: 'green' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Primes et Indemnités"
        description="Gestion des primes, indemnités et avantages avec circuit de validation N+1."
        icon={Gift}
        color="green"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Primes' },
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
        searchPlaceholder="Rechercher une prime..."
        title="Liste des primes"
        pageSize={10}
      />
    </div>
  );
}
