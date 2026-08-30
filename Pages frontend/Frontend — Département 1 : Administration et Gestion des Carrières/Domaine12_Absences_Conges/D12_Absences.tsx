'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status mapping for absences                                        */
/* ------------------------------------------------------------------ */

const ABSENCE_STATUS_STYLES: Record<string, string> = {
  en_attente:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  justifiee:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  non_justifiee:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  rejetee:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const ABSENCE_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  justifiee: 'Justifiée',
  non_justifiee: 'Non justifiée',
  rejetee: 'Rejetée',
};

const TYPE_ABSENCE_LABELS: Record<string, string> = {
  maladie: 'Maladie',
  personnelle: 'Personnelle',
  familiale: 'Familiale',
  force_majeure: 'Force majeure',
};

/* ------------------------------------------------------------------ */
/*  Custom badge                                                       */
/* ------------------------------------------------------------------ */

function AbsenceStatusBadge({ status }: { status: string }) {
  const style =
    ABSENCE_STATUS_STYLES[status] ??
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  const label = ABSENCE_STATUS_LABELS[status] ?? status;
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

export default function AbsencesPage() {
  const data = mockD12.absences;

  const kpis = useMemo(() => {
    const total = data.length;
    const justifiees = data.filter((a) => a.justifiee).length;
    const nonJustifiees = data.filter((a) => !a.justifiee).length;

    return [
      {
        title: 'Total absences mois',
        value: total,
        icon: Clock,
        color: 'blue' as const,
      },
      {
        title: 'Justifiées',
        value: justifiees,
        icon: CheckCircle2,
        color: 'green' as const,
      },
      {
        title: 'Non justifiées',
        value: nonJustifiees,
        icon: XCircle,
        color: 'red' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'type_absence',
      label: 'Type Absence',
      render: (row) => (
        <span className="text-xs">{TYPE_ABSENCE_LABELS[String(row.type_absence)] ?? String(row.type_absence)}</span>
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
      render: (row) => (row.date_fin ? formatDateFr(String(row.date_fin)) : '—'),
    },
    {
      key: 'duree',
      label: 'Durée',
      render: (row) =>
        calcDureeJours(String(row.date_debut), row.date_fin as string | null),
    },
    {
      key: 'justifiee',
      label: 'Justificatif',
      render: (row) =>
        row.justifiee ? (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0"
          >
            Oui
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 text-[10px] px-1.5 py-0"
          >
            Non
          </Badge>
        ),
    },
    { key: 'motif', label: 'Motif' },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <AbsenceStatusBadge status={String(row.statut)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Absences"
        description="Enregistrement et suivi des absences avec justification et pièces justificatives."
        icon={UserX}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Admin. du Personnel', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Absences' },
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
        searchPlaceholder="Rechercher une absence..."
        title="Registre des absences"
      />
    </div>
  );
}
