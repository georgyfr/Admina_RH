'use client';

import { Briefcase, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD21 } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { containerVariants } from '@/components/admina-rh/animations';

/* ------------------------------------------------------------------ */
/*  Enriched data: add niveau, parent, description                      */
/* ------------------------------------------------------------------ */

const DESCRIPTIONS: Record<string, string> = {
  'FAM-01': 'Regroupe l\'ensemble des métiers liés à la direction, au pilotage stratégique et au management d\'équipes.',
  'DOM-01': 'Domaine couvrant les fonctions de direction générale et de gouvernance organisationnelle.',
  'MET-01': 'Responsable de la stratégie globale, de la gouvernance et de la représentation de l\'organisation.',
  'EMP-01': 'Supplée le Directeur Général, coordonne les directions opérationnelles et pilote les projets transversaux.',
  'FAM-02': 'Regroupe les métiers de l\'administration, de la gestion des RH, de la comptabilité et des fonctions support.',
  'DOM-02': 'Domaine dédié au recrutement, à la gestion des talents, à la paie et au développement des compétences.',
  'MET-02': 'Gère le processus de recrutement de bout en bout : sourcing, entretiens, intégration et suivi.',
  'FAM-03': 'Regroupe les métiers du développement logiciel, de l\'infrastructure, des télécoms et de la cybersécurité.',
  'DOM-03': 'Domaine dédié au développement, à la maintenance et à l\'évolution des applications informatiques.',
  'MET-03': 'Conçoit, développe et maintient des applications web et mobiles full stack (front-end et back-end).',
};

const PARENT_MAP: Record<string, string> = {
  'FAM-01': '—',
  'DOM-01': 'Famille Management et Gestion',
  'MET-01': 'Direction Générale',
  'EMP-01': 'Directeur Général',
  'FAM-02': '—',
  'DOM-02': 'Famille Admin. et Fonctions Support',
  'MET-02': 'Gestion des Ressources Humaines',
  'FAM-03': '—',
  'DOM-03': 'Famille Informatique et Télécoms',
  'MET-03': 'Développement Informatique',
};

const referentielEnriched = mockD21.referentielMetiers.map((r) => ({
  ...r,
  niveau: r.niveau_hierarchique,
  parent: PARENT_MAP[r.code] ?? '—',
  description: DESCRIPTIONS[r.code] ?? `Métier ${r.libelle.toLowerCase()} du référentiel interne.`,
}));

const data = referentielEnriched as unknown as Record<string, unknown>[];

/* ------------------------------------------------------------------ */
/*  Niveau badge                                                       */
/* ------------------------------------------------------------------ */

const NIVEAU_MAP: Record<number, { label: string; style: string }> = {
  1: {
    label: 'Famille',
    style:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
  },
  2: {
    label: 'Domaine',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  3: {
    label: 'Fonction',
    style:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  },
  4: {
    label: 'Métier',
    style:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  },
};

function NiveauBadge({ niveau }: { niveau: number }) {
  const entry = NIVEAU_MAP[niveau] ?? NIVEAU_MAP[4];
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
    key: 'code',
    label: 'Code',
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{String(row.code)}</span>
    ),
  },
  {
    key: 'libelle',
    label: 'Libellé',
    render: (row) => <span className="font-medium">{String(row.libelle)}</span>,
  },
  {
    key: 'niveau',
    label: 'Niveau',
    render: (row) => <NiveauBadge niveau={Number(row.niveau)} />,
  },
  { key: 'parent', label: 'Parent' },
  {
    key: 'description',
    label: 'Description',
    render: (row) => (
      <span
        className="max-w-xs line-clamp-2 text-xs text-muted-foreground"
        title={String(row.description)}
      >
        {String(row.description)}
      </span>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  KPI stats                                                          */
/* ------------------------------------------------------------------ */

const totalMetiers = referentielEnriched.length;
const familles = referentielEnriched.filter((r) => r.niveau === 1).length;
const actifs = referentielEnriched.filter((r) => r.statut === 'actif').length;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReferentielMetiersPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Référentiel des Métiers"
        description="Classification hiérarchique des métiers : familles, domaines, fonctions et emplois avec statuts de gestion."
        icon={Briefcase}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Référentiel des Métiers' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard title="Total métiers" value={totalMetiers} icon={Briefcase} color="purple" />
        <KpiCard title="Familles" value={familles} icon={Layers} color="teal" />
        <KpiCard title="Actifs" value={actifs} icon={CheckCircle2} color="green" />
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Rechercher un métier..."
        title="Métiers référencés"
        pageSize={10}
      />
    </div>
  );
}
