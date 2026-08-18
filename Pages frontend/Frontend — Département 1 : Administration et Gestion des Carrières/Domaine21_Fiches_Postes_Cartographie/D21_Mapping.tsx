'use client';

import { GitBranch, Globe, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD21 } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { containerVariants } from '@/components/admina-rh/animations';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const data = mockD21.mapping_externe as unknown as Record<string, unknown>[];

/* ------------------------------------------------------------------ */
/*  Référentiel badge                                                  */
/* ------------------------------------------------------------------ */

const REF_MAP: Record<string, { label: string; style: string }> = {
  ROME: {
    label: 'ROME',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  ESCO: {
    label: 'ESCO',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  ONET: {
    label: 'O*NET',
    style:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  },
  CITP: {
    label: 'CITP',
    style:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  },
};

function ReferentielBadge({ referentiel }: { referentiel: string }) {
  const refKey = Object.keys(REF_MAP).find((k) => referentiel.toUpperCase().startsWith(k));
  const entry = refKey ? REF_MAP[refKey] : {
    label: referentiel,
    style:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        entry.style,
      )}
    >
      {entry.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Taux de correspondance bar                                         */
/* ------------------------------------------------------------------ */

function TauxCorrespondanceBar({ taux }: { taux: number }) {
  const pct = Math.min(Math.max(taux, 0), 100);
  const barColor =
    pct > 85
      ? 'bg-emerald-500'
      : pct > 70
        ? 'bg-orange-500'
        : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'referentiel',
    label: 'Référentiel',
    render: (row) => <ReferentielBadge referentiel={String(row.referentiel)} />,
  },
  {
    key: 'code_externe',
    label: 'Code Externe',
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{String(row.code_externe)}</span>
    ),
  },
  {
    key: 'libelle_externe',
    label: 'Libellé Externe',
    render: (row) => <span className="font-medium">{String(row.libelle_externe)}</span>,
  },
  {
    key: 'metier_interne',
    label: 'Métier Interne',
  },
  {
    key: 'taux_correspondance',
    label: 'Taux Correspondance',
    render: (row) => <TauxCorrespondanceBar taux={Number(row.taux_correspondance)} />,
  },
];

/* ------------------------------------------------------------------ */
/*  KPI stats                                                          */
/* ------------------------------------------------------------------ */

const totalMappings = mockD21.mapping_externe.length;
const referentielsCouverts = new Set(mockD21.mapping_externe.map((m) => m.referentiel)).size;
const tauxMoyen = Math.round(
  mockD21.mapping_externe.reduce((sum, m) => sum + m.taux_correspondance, 0) / totalMappings,
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MappingPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Référentiel de Mapping Externe"
        description="Correspondances entre les métiers internes et les référentiels externes (ROME, ESCO, O*NET, CITP) avec taux de correspondance."
        icon={Globe}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Mapping Externe' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard title="Total mappings" value={totalMappings} icon={GitBranch} color="purple" />
        <KpiCard title="Référentiels couverts" value={referentielsCouverts} icon={Globe} color="blue" />
        <KpiCard title="Taux moyen correspondance" value={`${tauxMoyen}%`} icon={Percent} color="green" />
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Rechercher un mapping..."
        title="Mappings externes"
        pageSize={10}
      />
    </div>
  );
}
