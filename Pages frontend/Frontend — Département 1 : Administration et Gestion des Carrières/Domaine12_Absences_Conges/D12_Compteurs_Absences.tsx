'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Taux justification badge                                           */
/* ------------------------------------------------------------------ */

function TauxJustificationBadge({ taux }: { taux: number }) {
  const pct = taux.toFixed(0);
  let colorClass = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
  if (taux > 80) {
    colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  } else if (taux > 50) {
    colorClass = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }
  return (
    <Badge variant="outline" className={cn(colorClass, 'text-[10px] px-1.5 py-0 font-semibold')}>
      {pct}%
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CompteursAbsencesPage() {
  const data = mockD12.compteursAbsences;

  const kpis = useMemo(() => {
    const totalHeures = data.reduce((s, c) => s + (c.total_heures ?? 0), 0);
    const justifiees = data.reduce((s, c) => s + (c.justifiees ?? 0), 0);
    const tauxJustification = totalHeures > 0 ? (justifiees / totalHeures) * 100 : 0;

    return [
      {
        title: "Total heures absence",
        value: `${totalHeures.toFixed(1)}h`,
        icon: Clock,
        color: 'purple' as const,
      },
      {
        title: "Heures justifiées",
        value: `${justifiees.toFixed(1)}h`,
        icon: CheckCircle2,
        color: 'green' as const,
      },
      {
        title: "Taux justification",
        value: `${tauxJustification.toFixed(0)}%`,
        icon: Percent,
        color: 'orange' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    { key: 'periode', label: 'Période' },
    {
      key: 'total_heures',
      label: 'Total Heures',
      render: (row) => <span className="font-medium">{Number(row.total_heures).toFixed(1)}h</span>,
    },
    {
      key: 'justifiees',
      label: 'Justifiées',
      render: (row) => <span className="text-emerald-700 dark:text-emerald-400 font-medium">{Number(row.justifiees).toFixed(1)}h</span>,
    },
    {
      key: 'non_justifiees',
      label: 'Non Justifiées',
      render: (row) => <span className="text-red-700 dark:text-red-400 font-medium">{Number(row.non_justifiees).toFixed(1)}h</span>,
    },
    {
      key: 'taux_justification',
      label: 'Taux Justification',
      render: (row) => {
        const total = Number(row.total_heures) || 0;
        const just = Number(row.justifiees) || 0;
        const taux = total > 0 ? (just / total) * 100 : 0;
        return <TauxJustificationBadge taux={taux} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Compteurs d'Absences"
        description="Suivi des compteurs d'heures d'absence par employé et par période avec taux de justification."
        icon={Clock}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Compteurs d\'Absences' },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </motion.div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un compteur..."
        title="Compteurs d'absences"
      />
    </div>
  );
}
