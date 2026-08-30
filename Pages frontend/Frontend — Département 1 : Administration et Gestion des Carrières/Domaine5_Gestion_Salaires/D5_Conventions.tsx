'use client';

import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05ConventionCollective } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA/h`;
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D05ConventionCollective>[] = [
  { key: 'code', label: 'Code' },
  { key: 'nom', label: 'Convention' },
  {
    key: 'taux_horaire_min',
    label: 'Taux Horaire Min.',
    render: (row) => <span className="font-medium">{formatFcfa(row.taux_horaire_min)}</span>,
  },
  { key: 'categories', label: 'Catégories' },
  { key: 'date_effet', label: 'Date d\'Effet' },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <StatusBadge status={row.statut} size="sm" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ConventionsPage() {
  const data = mockD05.conventions_collectives;

  const kpis = useMemo(() => {
    const actives = data.filter((c) => c.statut === 'active').length;
    const tauxMoyen = data.length > 0
      ? Math.round(data.reduce((s, c) => s + c.taux_horaire_min, 0) / data.length)
      : 0;
    const totalConventions = data.length;
    return [
      {
        title: 'Conventions actives',
        value: actives,
        icon: FileText,
        trend: { value: 10, label: 'en vigueur' },
        color: 'green' as const,
      },
      {
        title: 'Taux horaire moyen',
        value: `${tauxMoyen.toLocaleString('fr-FR')} FCFA/h`,
        icon: FileText,
        trend: { value: 1.5, label: 'vs année dernière' },
        color: 'orange' as const,
      },
      {
        title: 'Total conventions',
        value: totalConventions,
        icon: FileText,
        trend: { value: 2, label: 'ce trimestre' },
        color: 'blue' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Conventions Collectives"
        description="Référentiel des conventions collectives applicables avec taux horaires minimum, catégories et dates d'effet."
        icon={FileText}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Conventions Collectives' },
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
          />
        ))}
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher une convention..."
        title="Liste des conventions collectives"
        pageSize={10}
      />
    </div>
  );
}
