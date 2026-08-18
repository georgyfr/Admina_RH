'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status mapping for autorisations                                   */
/* ------------------------------------------------------------------ */

const AUTORISATION_STATUS_STYLES: Record<string, string> = {
  demandee:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  validee:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  rejetee:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
};

const AUTORISATION_STATUS_LABELS: Record<string, string> = {
  demandee: 'Demandée',
  validee: 'Validée',
  rejetee: 'Rejetée',
};

const TYPE_AUTORISATION_LABELS: Record<string, string> = {
  depart_anticipe: 'Départ anticipé',
  permission: 'Permission',
  autorisation_speciale: 'Autorisation spéciale',
};

/* ------------------------------------------------------------------ */
/*  Custom badge                                                       */
/* ------------------------------------------------------------------ */

function AutorisationStatusBadge({ status }: { status: string }) {
  const style =
    AUTORISATION_STATUS_STYLES[status] ??
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  const label = AUTORISATION_STATUS_LABELS[status] ?? status;
  return (
    <Badge variant="outline" className={style + ' text-[10px] px-1.5 py-0'}>
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

function calcDureeJours(debut: string, fin: string | null): string {
  if (!fin) return '—';
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return `${Math.max(1, diff)} jrs`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AutorisationsPage() {
  const data = mockD12.autorisations;

  const kpis = useMemo(() => {
    const total = data.length;
    const enAttente = data.filter((a) => a.statut === 'demandee').length;
    const validees = data.filter((a) => a.statut === 'validee').length;

    return [
      {
        title: 'Total autorisations',
        value: total,
        icon: FileCheck,
        color: 'purple' as const,
      },
      {
        title: 'En attente',
        value: enAttente,
        icon: Clock,
        color: 'orange' as const,
      },
      {
        title: 'Validées',
        value: validees,
        icon: CheckCircle2,
        color: 'green' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'type_autorisation',
      label: "Type d'Autorisation",
      render: (row) => (
        <span className="text-xs">{TYPE_AUTORISATION_LABELS[String(row.type_autorisation)] ?? String(row.type_autorisation)}</span>
      ),
    },
    {
      key: 'date_debut',
      label: 'Date Début',
      render: (row) => formatDateFr(String(row.date_debut)),
    },
    {
      key: 'date_fin',
      label: 'Date Fin',
      render: (row) =>
        row.date_fin ? formatDateFr(String(row.date_fin)) : '—',
    },
    {
      key: 'duree',
      label: 'Durée',
      render: (row) =>
        calcDureeJours(String(row.date_debut), row.date_fin as string | null),
    },
    { key: 'motif', label: 'Motif' },
    {
      key: 'valide_par',
      label: 'Validé par',
      render: (row) =>
        row.valide_par ? (
          <span className="text-xs">{String(row.valide_par)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <AutorisationStatusBadge status={String(row.statut)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Autorisations d'Absence"
        description="Gestion des autorisations d'absence : départs anticipés, permissions et autorisations spéciales."
        icon={ShieldCheck}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Autorisations' },
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
        searchPlaceholder="Rechercher une autorisation..."
        title="Registre des autorisations d'absence"
      />
    </div>
  );
}
