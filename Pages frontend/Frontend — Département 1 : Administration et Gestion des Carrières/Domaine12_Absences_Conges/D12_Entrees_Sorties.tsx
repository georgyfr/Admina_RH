'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  LogIn,
  LogOut,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status mapping                                                     */
/* ------------------------------------------------------------------ */

const TRAITEMENT_STYLES: Record<string, string> = {
  effectue:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  en_cours:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  planifie:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
};

const TRAITEMENT_LABELS: Record<string, string> = {
  effectue: 'Effectué',
  en_cours: 'En cours',
  planifie: 'Planifié',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateFr(val: string): string {
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EntreesSortiesPage() {
  const data = mockD12.entreesSorties;

  const kpis = useMemo(() => {
    const entrees = data.filter((e) => e.type_mouvement === 'entree').length;
    const sorties = data.filter((e) => e.type_mouvement === 'sortie').length;

    return [
      {
        title: 'Entrées ce mois',
        value: entrees,
        icon: LogIn,
        color: 'green' as const,
      },
      {
        title: 'Sorties ce mois',
        value: sorties,
        icon: LogOut,
        color: 'red' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'type_mouvement',
      label: 'Type Mouvement',
      render: (row) => {
        const type = String(row.type_mouvement);
        const isEntree = type === 'entree';
        return (
          <Badge
            variant="outline"
            className={
              isEntree
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 text-[10px] px-1.5 py-0'
            }
          >
            {isEntree ? 'Entrée' : 'Sortie'}
          </Badge>
        );
      },
    },
    {
      key: 'date_mouvement',
      label: 'Date',
      render: (row) => formatDateFr(String(row.date_mouvement)),
    },
    { key: 'motif', label: 'Motif' },
    { key: 'poste', label: 'Poste' },
    { key: 'departement', label: 'Département' },
    {
      key: 'traitement',
      label: 'Traitement',
      render: (row) => {
        const st = String(row.traitement);
        const style =
          TRAITEMENT_STYLES[st] ??
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        const label = TRAITEMENT_LABELS[st] ?? st;
        return (
          <Badge variant="outline" className={style + ' text-[10px] px-1.5 py-0'}>
            {label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Entrées / Sorties"
        description="Mouvements d'entrée et de sortie des employés avec check-list et suivi du solde de congés résiduel."
        icon={ArrowRightLeft}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Admin. du Personnel', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Entrées / Sorties' },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2"
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
        searchPlaceholder="Rechercher un mouvement..."
        title="Registre des entrées / sorties"
      />
    </div>
  );
}
