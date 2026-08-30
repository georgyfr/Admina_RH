'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  AlertTriangle,
  BarChart3,
  Percent,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_CONGE_LABELS: Record<string, string> = {
  conges_payes: 'Congés payés',
  conges_maladie: 'Congé maladie',
  rtt: 'RTT',
  conges_exceptionnel: 'Exceptionnel',
};

/* ------------------------------------------------------------------ */
/*  Progress bar component                                             */
/* ------------------------------------------------------------------ */

function SoldeProgressBar({
  solde,
  droit,
}: {
  solde: number;
  droit: number;
}) {
  const pct = droit > 0 ? Math.round((solde / droit) * 100) : 0;
  const colorClass =
    pct > 25
      ? '[&>div]:bg-emerald-500'
      : pct >= 10
        ? '[&>div]:bg-amber-500'
        : '[&>div]:bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={pct}
        className={cn('h-2 w-20', colorClass)}
      />
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SoldesCongesPage() {
  const data = mockD12.soldeConges;

  const kpis = useMemo(() => {
    const soldeFaible = data.filter(
      (s) => s.solde_disponible < 5,
    ).length;
    const soldeMoyen =
      data.length > 0
        ? (data.reduce((s, c) => s + c.solde_disponible, 0) / data.length).toFixed(1)
        : 0;
    const tauxUtilMoyen =
      data.length > 0
        ? Math.round(data.reduce((s, c) => s + c.taux_utilisation, 0) / data.length)
        : 0;

    return [
      {
        title: 'Solde faible (< 5 jours)',
        value: soldeFaible,
        icon: AlertTriangle,
        color: 'red' as const,
      },
      {
        title: 'Solde moyen',
        value: `${soldeMoyen} jrs`,
        icon: Wallet,
        color: 'purple' as const,
      },
      {
        title: "Taux d'utilisation moyen",
        value: `${tauxUtilMoyen}%`,
        icon: Percent,
        color: 'blue' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'annee',
      label: 'Année',
      render: (row) => <span className="font-medium">{row.annee}</span>,
    },
    {
      key: 'type_conge',
      label: 'Type',
      render: (row) => (
        <span className="text-xs">{TYPE_CONGE_LABELS[String(row.type_conge)] ?? String(row.type_conge)}</span>
      ),
    },
    {
      key: 'droit_annuel',
      label: 'Droit Annuel',
      render: (row) => <span>{row.droit_annuel} jrs</span>,
    },
    {
      key: 'conges_pris',
      label: 'Congés Pris',
      render: (row) => <span>{row.conges_pris} jrs</span>,
    },
    {
      key: 'solde_disponible',
      label: 'Solde Disponible',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-semibold">{row.solde_disponible} jrs</span>
          <SoldeProgressBar
            solde={Number(row.solde_disponible)}
            droit={Number(row.droit_annuel)}
          />
        </div>
      ),
    },
    {
      key: 'en_cours',
      label: 'En Cours',
      render: (row) => <span>{row.en_cours} jrs</span>,
    },
    {
      key: 'report_n1',
      label: 'Report N-1',
      render: (row) => <span>{row.report_n1} jrs</span>,
    },
    {
      key: 'taux_utilisation',
      label: 'Taux Util.',
      render: (row) => {
        const taux = Number(row.taux_utilisation);
        return (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0',
              taux > 80
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                : taux > 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
            )}
          >
            {taux}%
          </Badge>
        );
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        const st = String(row.statut);
        if (st === 'solde_faible') {
          return (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 text-[10px] px-1.5 py-0"
            >
              Solde faible
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0"
          >
            Normal
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Soldes de Congés"
        description="Suivi des droits annuels, congés pris, soldes disponibles, reports et taux d'utilisation par employé."
        icon={Wallet}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Admin. du Personnel', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Soldes de Congés' },
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
        searchPlaceholder="Rechercher un employé..."
        title="Soldes de congés par employé"
      />
    </div>
  );
}
