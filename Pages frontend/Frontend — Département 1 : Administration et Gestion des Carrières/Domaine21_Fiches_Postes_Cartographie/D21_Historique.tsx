'use client';

import { History, FileBadge2, CalendarClock } from 'lucide-react';
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

const data = mockD21.historique_revisions as unknown as Record<string, unknown>[];

/* ------------------------------------------------------------------ */
/*  Date formatter                                                     */
/* ------------------------------------------------------------------ */

function fmtShortDate(v: unknown): string {
  if (!v) return '—';
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(v);
  }
}

/* ------------------------------------------------------------------ */
/*  Entité type badge                                                  */
/* ------------------------------------------------------------------ */

const ENTITE_TYPE_MAP: Record<string, { label: string; style: string }> = {
  fiche_poste: {
    label: 'Fiche de poste',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  referentiel_metier: {
    label: 'Référentiel métier',
    style:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
  },
  competence: {
    label: 'Compétence',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  passerelle: {
    label: 'Passerelle',
    style:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  },
  mapping_externe: {
    label: 'Mapping externe',
    style:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  },
};

function EntiteTypeBadge({ type }: { type: string }) {
  const entry = ENTITE_TYPE_MAP[type];
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
/*  Type modification badge                                            */
/* ------------------------------------------------------------------ */

const TYPE_MODIF_MAP: Record<string, { label: string; style: string }> = {
  creation: {
    label: 'Création',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  mise_a_jour: {
    label: 'Mise à jour',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  validation: {
    label: 'Validation',
    style:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  },
  suppression: {
    label: 'Suppression',
    style:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  },
};

function TypeModifBadge({ type }: { type: string }) {
  const entry = TYPE_MODIF_MAP[type];
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
    key: 'entite_type',
    label: 'Entité',
    render: (row) => <EntiteTypeBadge type={String(row.entite_type)} />,
  },
  {
    key: 'entite_nom',
    label: 'Nom',
    render: (row) => <span className="font-medium">{String(row.entite_nom)}</span>,
  },
  {
    key: 'type_modification',
    label: 'Modification',
    render: (row) => <TypeModifBadge type={String(row.type_modification)} />,
  },
  {
    key: 'version_avant',
    label: 'Version Avant',
    render: (row) => <span className="font-mono text-xs text-muted-foreground">{String(row.version_avant)}</span>,
  },
  {
    key: 'version_apres',
    label: 'Version Après',
    render: (row) => <span className="font-mono text-xs font-medium">{String(row.version_apres)}</span>,
  },
  { key: 'modifie_par', label: 'Modifié par' },
  {
    key: 'date_modification',
    label: 'Date',
    render: (row) => <span className="text-xs">{fmtShortDate(row.date_modification)}</span>,
  },
  {
    key: 'motif',
    label: 'Motif',
    render: (row) => (
      <span className="max-w-[200px] truncate text-xs text-muted-foreground" title={String(row.motif)}>
        {String(row.motif)}
      </span>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  KPI stats                                                          */
/* ------------------------------------------------------------------ */

const totalRevisions = mockD21.historique_revisions.length;
const fichesModifiees = mockD21.historique_revisions.filter(
  (r) => r.entite_type === 'fiche_poste',
).length;
const sortedByDate = [...mockD21.historique_revisions].sort(
  (a, b) => new Date(b.date_modification).getTime() - new Date(a.date_modification).getTime(),
);
const derniereRevision = fmtShortDate(sortedByDate[0]?.date_modification);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HistoriquePage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Historique des Révisions"
        description="Journal de toutes les modifications apportées aux fiches de poste, référentiels, compétences et mappings avec traçabilité complète."
        icon={History}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Historique des Révisions' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard title="Total révisions" value={totalRevisions} icon={History} color="purple" />
        <KpiCard title="Fiches de poste modifiées" value={fichesModifiees} icon={FileBadge2} color="blue" />
        <KpiCard title="Dernière révision" value={derniereRevision} icon={CalendarClock} color="teal" />
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Rechercher une révision..."
        title="Journal des révisions"
        pageSize={10}
      />
    </div>
  );
}
