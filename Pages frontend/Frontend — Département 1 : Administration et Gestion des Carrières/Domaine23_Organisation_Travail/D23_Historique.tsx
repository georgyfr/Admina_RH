'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD23 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Type modification badge                                            */
/* ------------------------------------------------------------------ */

const TYPE_MODIF_STYLES: Record<string, string> = {
  creation:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  mise_a_jour:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  suppression:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  renommage:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  fusion:
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  reorganisation:
    'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800',
};

const TYPE_MODIF_LABELS: Record<string, string> = {
  creation: 'Création',
  mise_a_jour: 'Mise à jour',
  suppression: 'Suppression',
  renommage: 'Renommage',
  fusion: 'Fusion',
  reorganisation: 'Réorganisation',
};

function TypeModifBadge({ type }: { type: string }) {
  const style =
    TYPE_MODIF_STYLES[type] ??
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  const label = TYPE_MODIF_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <Badge variant='outline' className={cn(style, 'text-[10px] px-1.5 py-0 font-semibold')}>
      {label}
    </Badge>
  );
}

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

export default function HistoriquePage() {
  const data = mockD23.historiqueStructures;

  const kpis = useMemo(() => {
    const total = data.length;
    const creations = data.filter((h) => h.type_modification === 'creation').length;
    const misesAJour = data.filter((h) => h.type_modification === 'mise_a_jour').length;

    return [
      {
        title: 'Total modifications',
        value: total,
        icon: History,
        color: 'teal' as const,
      },
      {
        title: 'Créations',
        value: creations,
        icon: Plus,
        color: 'green' as const,
      },
      {
        title: 'Mises à jour',
        value: misesAJour,
        icon: RefreshCw,
        color: 'purple' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'structure',
      label: 'Structure',
      render: (row) => <span className='font-medium'>{String(row.structure)}</span>,
    },
    {
      key: 'type_modification',
      label: 'Type Modification',
      render: (row) => <TypeModifBadge type={String(row.type_modification)} />,
    },
    {
      key: 'ancien_libelle',
      label: 'Ancien Libellé',
      render: (row) =>
        row.ancien_libelle ? (
          <span className='text-xs text-muted-foreground line-through'>{String(row.ancien_libelle)}</span>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        ),
    },
    {
      key: 'nouveau_libelle',
      label: 'Nouveau Libellé',
      render: (row) =>
        row.nouveau_libelle ? (
          <span className='text-xs font-medium text-emerald-700 dark:text-emerald-400'>{String(row.nouveau_libelle)}</span>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        ),
    },
    { key: 'modifie_par', label: 'Modifié par' },
    {
      key: 'date_modification',
      label: 'Date Modification',
      render: (row) => formatDateFr(String(row.date_modification)),
    },
  ];

  return (
    <div className='space-y-6'>
      <DomainHeader
        title="Historique des Structures"
        description="Journal de toutes les modifications apportées aux structures organisationnelles (créations, renommages, fusions)."
        icon={History}
        color='teal'
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D23', href: '/departements/administration-et-gestion-des-carrieres/d23' },
          { label: 'Historique' },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
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
        searchPlaceholder='Rechercher une modification...'
        title="Historique des modifications"
      />
    </div>
  );
}
