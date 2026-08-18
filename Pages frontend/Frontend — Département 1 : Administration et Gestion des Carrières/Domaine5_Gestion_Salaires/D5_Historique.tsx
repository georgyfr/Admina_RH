'use client';

import { History } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD05, type D05HistoriqueSalaire } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

function formatDate(value: string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

/* ------------------------------------------------------------------ */
/*  Variation badge                                                    */
/* ------------------------------------------------------------------ */

function VariationBadge({ variation }: { variation: number }) {
  const isPositive = variation >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        isPositive
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
      }`}
    >
      {isPositive ? '+' : ''}{variation.toFixed(2)}%
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D05HistoriqueSalaire>[] = [
  { key: 'employe', label: 'Employé' },
  {
    key: 'date_effet',
    label: 'Date Effet',
    render: (row) => <span>{formatDate(row.date_effet)}</span>,
  },
  {
    key: 'ancien_salaire',
    label: 'Ancien Salaire (FCFA)',
    render: (row) => <span className='text-muted-foreground'>{formatFcfa(row.ancien_salaire)}</span>,
  },
  {
    key: 'nouveau_salaire',
    label: 'Nouveau Salaire (FCFA)',
    render: (row) => <span className='font-semibold'>{formatFcfa(row.nouveau_salaire)}</span>,
  },
  {
    key: 'variation',
    label: 'Variation (%)',
    render: (row) => <VariationBadge variation={row.variation} />,
  },
  { key: 'motif', label: 'Motif' },
  { key: 'type_modification', label: 'Type Modification' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HistoriquePage() {
  const data = mockD05.historique_salaires;

  return (
    <div className='space-y-6'>
      <DomainHeader
        title="Historique Salarial"
        description="Historique immuable des évolutions salariales par employé avec motifs et pourcentages de variation."
        icon={History}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Historique Salaires' },
        ]}
      />

      {/* DataTable */}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un historique..."
        title="Historique des évolutions salariales"
        pageSize={10}
      />
    </div>
  );
}
