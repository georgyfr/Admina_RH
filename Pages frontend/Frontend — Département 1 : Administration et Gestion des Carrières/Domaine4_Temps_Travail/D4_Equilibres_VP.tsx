'use client';

import { useMemo } from 'react';
import { HeartHandshake, AlertTriangle, Scale } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { motion } from 'framer-motion';
import { mockD04 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const QUOTA_HEBDO = 40; // heures/semaine

/* ------------------------------------------------------------------ */
/*  Compute derived status                                             */
/* ------------------------------------------------------------------ */

function computeEquilibreStatus(
  heuresEffectives: number,
): { statut: string; depassement: number } {
  const depassement = Math.max(0, heuresEffectives - QUOTA_HEBDO);
  const ratio = heuresEffectives / QUOTA_HEBDO;

  if (ratio <= 1) {
    return { statut: 'equilibre', depassement: 0 };
  }
  if (ratio <= 1.15) {
    return { statut: 'depassement', depassement: parseFloat(depassement.toFixed(1)) };
  }
  return { statut: 'risque', depassement: parseFloat(depassement.toFixed(1)) };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EquilibresVPPage() {
  const enrichedData = useMemo(() => {
    return mockD04.equilibresVP.map((eq) => {
      // Heures effectives mensuelles → hebdomadaire
      const heuresHebdo = parseFloat((eq.heures_effectives / 4.33).toFixed(1));
      const { statut, depassement } = computeEquilibreStatus(heuresHebdo);
      return {
        ...eq,
        heures_hebdo: heuresHebdo,
        quota: QUOTA_HEBDO,
        depassement,
        vp_statut: statut,
      };
    });
  }, []);

  const summaryKpis = useMemo(() => {
    const equilibre = enrichedData.filter((d) => d.vp_statut === 'equilibre').length;
    const depassement = enrichedData.filter((d) => d.vp_statut === 'depassement').length;
    const risque = enrichedData.filter((d) => d.vp_statut === 'risque').length;
    return [
      {
        title: 'Employés en équilibre',
        value: equilibre,
        icon: Scale,
        color: 'green' as const,
      },
      {
        title: 'Hors quota',
        value: depassement,
        icon: HeartHandshake,
        color: 'orange' as const,
      },
      {
        title: 'Risque burnout',
        value: risque,
        icon: AlertTriangle,
        color: 'red' as const,
      },
    ];
  }, [enrichedData]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'heures_hebdo',
      label: 'Heures Travail / Semaine',
      render: (row) => `${Number(row.heures_hebdo).toFixed(1)} h`,
    },
    {
      key: 'quota',
      label: 'Quota Autorisé',
      render: (row) => `${Number(row.quota)} h`,
    },
    {
      key: 'depassement',
      label: 'Dépassement (h)',
      render: (row) => {
        const dep = Number(row.depassement);
        if (dep === 0) return <span className="text-muted-foreground">0 h</span>;
        return (
          <span className={cn(
            'font-semibold',
            dep > 5
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400',
          )}>
            +{dep} h
          </span>
        );
      },
    },
    {
      key: 'bar',
      label: 'Heures vs Quota',
      render: (row) => {
        const heures = Number(row.heures_hebdo);
        const quota = Number(row.quota);
        const pct = Math.min(120, (heures / quota) * 100);
        const overPct = Math.max(0, ((heures - quota) / quota) * 100);
        return (
          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="h-3 w-full max-w-[120px] rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  pct <= 100
                    ? 'bg-emerald-500'
                    : pct <= 115
                      ? 'bg-amber-500'
                      : 'bg-red-500',
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground w-10 text-right">
              {pct.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'vp_statut',
      label: 'Statut',
      render: (row) => <StatusBadge status={String(row.vp_statut)} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Équilibres Vie Pro / Perso"
        description="Suivi de l'équilibre vie professionnelle et personnelle : heures hebdomadaires, quota, détection des risques burnout."
        icon={HeartHandshake}
        color="blue"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D4 - Gestion du Temps', href: '/departements/administration-et-gestion-des-carrieres/d4' },
          { label: 'Équilibres VP' },
        ]}
      />

      {/* Summary cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {summaryKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={enrichedData as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un employé..."
        title="Suivi des équilibres vie pro/perso"
      />
    </div>
  );
}
