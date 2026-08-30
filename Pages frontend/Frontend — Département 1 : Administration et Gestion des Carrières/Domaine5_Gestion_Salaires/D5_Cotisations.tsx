'use client';

import { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { containerVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05CotisationSocialeExt } from '@/lib/mock-data';

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
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  } catch {
    return value;
  }
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D05CotisationSocialeExt>[] = [
  { key: 'employe', label: 'Employé' },
  { key: 'organisme', label: 'Organisme' },
  { key: 'type_cotisation', label: 'Type Cotisation' },
  {
    key: 'base_calcul',
    label: 'Base Calcul (FCFA)',
    render: (row) => <span className='font-medium'>{formatFcfa(row.base_calcul)}</span>,
  },
  {
    key: 'taux',
    label: 'Taux (%)',
    render: (row) => <span>{row.taux.toFixed(2)}%</span>,
  },
  {
    key: 'montant',
    label: 'Montant (FCFA)',
    render: (row) => <span className='font-medium'>{formatFcfa(row.montant)}</span>,
  },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  { key: 'statut', label: 'Statut' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CotisationsPage() {
  const data = mockD05.cotisations_sociales;

  const kpis = useMemo(() => {
    const totalCotisations = data.reduce((s, c) => s + c.montant, 0);
    const cnps = data
      .filter((c) => c.organisme === 'CNPS')
      .reduce((s, c) => s + c.montant, 0);
    const impots = data
      .filter((c) => c.organisme === 'IR')
      .reduce((s, c) => s + c.montant, 0);
    return [
      {
        title: 'Total cotisations',
        value: totalCotisations,
        icon: Landmark,
        trend: { value: 2, label: 'vs mois dernier' },
        color: 'purple' as const,
        subtitle: 'montant cotisations',
      },
      {
        title: 'CNPS',
        value: cnps,
        icon: Landmark,
        trend: { value: 1.5, label: 'vs mois dernier' },
        color: 'teal' as const,
        subtitle: 'montant cotisations',
      },
      {
        title: 'Impôts',
        value: impots,
        icon: Landmark,
        trend: { value: -3, label: 'vs mois dernier' },
        color: 'red' as const,
        subtitle: 'montant impôts',
      },
    ];
  }, [data]);

  return (
    <div className='space-y-6'>
      <DomainHeader
        title="Cotisations Sociales"
        description="Taux et calcul des cotisations sociales (CNPS, CNSS, régime fiscal camerounais)."
        icon={Landmark}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Cotisations Sociales' },
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
        searchPlaceholder="Rechercher une cotisation..."
        title="Liste des cotisations sociales"
        pageSize={10}
      />
    </div>
  );
}
