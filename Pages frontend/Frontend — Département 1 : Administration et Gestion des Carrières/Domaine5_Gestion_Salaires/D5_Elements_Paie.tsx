'use client';

import { useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05ElementPaie } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Custom badge pour type d'élément de paie                           */
/* ------------------------------------------------------------------ */

const TYPE_ELEMENT_MAP: Record<string, string> = {
  salaire_base:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  prime:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  indemnite:
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  retenue:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  cotisation:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
};

function TypeElementBadge({ type }: { type: string }) {
  const style = TYPE_ELEMENT_MAP[type] ?? '';
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

const columns: Column<D05ElementPaie>[] = [
  { key: 'employe', label: 'Employé' },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  {
    key: 'type_element',
    label: 'Type Élément',
    render: (row) => <TypeElementBadge type={row.type_element} />,
  },
  { key: 'libelle', label: 'Libellé' },
  { key: 'montant', label: 'Montant' },
  { key: 'base_calcul', label: 'Base de Calcul' },
  { key: 'taux', label: 'Taux' },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <StatusBadge status={row.statut} size="sm" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ElementsPaiePage() {
  const data = mockD05.elementsPaie;

  const kpis = useMemo(() => {
    const totalElements = data.length;
    const montantTotalBrut = data.reduce((s, e) => s + e.montant, 0);
    const enAttente = data.filter((e) => e.statut === 'provisionnel').length;
    return [
      {
        title: 'Total éléments',
        value: totalElements,
        icon: Calculator,
        trend: { value: 12, label: 'ce mois' },
        color: 'orange' as const,
      },
      {
        title: 'Montant total brut',
        value: montantTotalBrut,
        icon: Calculator,
        trend: { value: 3.5, label: 'vs mois dernier' },
        color: 'green' as const,
        subtitle: 'montant total',
      },
      {
        title: 'Éléments en attente',
        value: enAttente,
        icon: Calculator,
        trend: { value: -8, label: 'vs mois dernier' },
        color: 'red' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Éléments de Paie"
        description="Consultation et suivi des éléments constitutifs de la paie : salaires de base, primes, indemnités, retenues et cotisations."
        icon={Calculator}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Éléments de Paie' },
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
        searchPlaceholder="Rechercher un élément de paie..."
        title="Liste des éléments de paie"
        pageSize={10}
      />
    </div>
  );
}
