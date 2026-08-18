'use client';

import { useMemo } from 'react';
import { ShieldMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05Retenue } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Custom badge pour type de retenue                                  */
/* ------------------------------------------------------------------ */

const RETENUE_TYPE_MAP: Record<string, string> = {
  impot_sur_revenu:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  pension_alimentaire:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  avance_remboursable:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  saisie_arret:
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
};

function RetenueTypeBadge({ type }: { type: string }) {
  const style = RETENUE_TYPE_MAP[type] ?? '';
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

const columns: Column<D05Retenue>[] = [
  { key: 'employe', label: 'Employé' },
  {
    key: 'type_retenue',
    label: 'Type de Retenue',
    render: (row) => <RetenueTypeBadge type={row.type_retenue} />,
  },
  { key: 'montant', label: 'Montant' },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  { key: 'motif', label: 'Motif' },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <StatusBadge status={row.statut} size="sm" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RetenuesPage() {
  const data = mockD05.retenues;

  const kpis = useMemo(() => {
    const totalRetenues = data.length;
    const montantTotal = data.reduce((s, r) => s + r.montant, 0);
    const typesDistincts = new Set(data.map((r) => r.type_retenue)).size;
    return [
      {
        title: 'Total retenues',
        value: totalRetenues,
        icon: ShieldMinus,
        trend: { value: 5, label: 'ce mois' },
        color: 'orange' as const,
      },
      {
        title: 'Montant total',
        value: montantTotal,
        icon: ShieldMinus,
        trend: { value: 2.1, label: 'vs mois dernier' },
        color: 'red' as const,
        subtitle: 'montant total',
      },
      {
        title: 'Types distincts',
        value: typesDistincts,
        icon: ShieldMinus,
        trend: { value: 0, label: 'stable' },
        color: 'blue' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Retenues sur Salaire"
        description="Gestion des retenues légales et diverses : impôt sur le revenu, pensions alimentaires, avances remboursables et saisies-arrêts."
        icon={ShieldMinus}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Retenues' },
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
        searchPlaceholder="Rechercher une retenue..."
        title="Liste des retenues sur salaire"
        pageSize={10}
      />
    </div>
  );
}
