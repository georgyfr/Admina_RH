'use client';

import { Link2, ShieldCheck, Users } from 'lucide-react';
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

const data = mockD21.fiche_poste_competences as unknown as Record<string, unknown>[];

/* ------------------------------------------------------------------ */
/*  Obligatoire badge                                                  */
/* ------------------------------------------------------------------ */

function ObligatoireBadge({ obligatoire }: { obligatoire: boolean }) {
  if (obligatoire) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
          'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        )}
      >
        Oui
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      )}
    >
      Non
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Type compétence badge                                              */
/* ------------------------------------------------------------------ */

const TYPE_COMP_MAP: Record<string, { label: string; style: string }> = {
  technique: {
    label: 'Technique',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  comportementale: {
    label: 'Comportementale',
    style:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  },
  transversale: {
    label: 'Transversale',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
};

function TypeCompetenceInlineBadge({ type }: { type: string }) {
  const entry = TYPE_COMP_MAP[type];
  if (!entry) return <span className="text-xs">{type}</span>;
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
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'fiche_poste',
    label: 'Fiche de Poste',
    render: (row) => <span className="font-medium">{String(row.fiche_poste)}</span>,
  },
  {
    key: 'competence',
    label: 'Compétence',
  },
  {
    key: 'type_competence',
    label: 'Type',
    render: (row) => <TypeCompetenceInlineBadge type={String(row.type_competence)} />,
  },
  {
    key: 'niveau_requis',
    label: 'Niveau Requis',
    render: (row) => <span className="font-mono text-xs">{String(row.niveau_requis)}</span>,
  },
  {
    key: 'niveau_minimal',
    label: 'Niveau Minimal',
    render: (row) => <span className="font-mono text-xs">{String(row.niveau_minimal)}</span>,
  },
  {
    key: 'obligatoire',
    label: 'Obligatoire',
    render: (row) => <ObligatoireBadge obligatoire={Boolean(row.obligatoire)} />,
  },
];

/* ------------------------------------------------------------------ */
/*  KPI stats                                                          */
/* ------------------------------------------------------------------ */

const totalAssociations = mockD21.fiche_poste_competences.length;
const obligatoires = mockD21.fiche_poste_competences.filter((f) => f.obligatoire === true).length;
const postesCouverts = new Set(mockD21.fiche_poste_competences.map((f) => f.fiche_poste)).size;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PosteCompetencesPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Poste-Compétences"
        description="Associations entre fiches de poste et compétences requises, avec niveaux d'exigence et caractère obligatoire."
        icon={Link2}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Poste-Compétences' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard title="Total associations" value={totalAssociations} icon={Link2} color="purple" />
        <KpiCard title="Compétences obligatoires" value={obligatoires} icon={ShieldCheck} color="green" />
        <KpiCard title="Postes couverts" value={postesCouverts} icon={Users} color="blue" />
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Rechercher une association..."
        title="Associations poste-compétences"
        pageSize={10}
      />
    </div>
  );
}
