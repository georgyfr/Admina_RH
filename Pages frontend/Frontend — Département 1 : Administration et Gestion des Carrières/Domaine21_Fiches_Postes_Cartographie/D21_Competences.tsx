'use client';

import { useState, useMemo } from 'react';
import { Award } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD21, type D21Competence } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Type badge mapping                                                 */
/* ------------------------------------------------------------------ */

const TYPE_MAP: Record<string, { label: string; style: string }> = {
  technique: {
    label: 'Savoir',
    style:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  },
  comportementale: {
    label: 'Savoir-être',
    style:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  },
  transversale: {
    label: 'Savoir-faire',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
};

function TypeBadge({ type }: { type: string }) {
  const entry = TYPE_MAP[type];
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
/*  Niveau color                                                       */
/* ------------------------------------------------------------------ */

const NIVEAU_COMP: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  2: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  4: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
};

function NiveauCircle({ niveau }: { niveau: number }) {
  const bg = NIVEAU_COMP[niveau] ?? NIVEAU_COMP[1];
  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full text-[10px] font-bold',
        bg,
      )}
    >
      {niveau}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Description helper for competence (simulate from libelle)          */
/* ------------------------------------------------------------------ */

function getDescription(comp: D21Competence): string {
  const descs: Record<string, string> = {
    'COMP-T01': 'Maîtrise des frameworks JavaScript/TypeScript (React, Node.js), architecture MVC, tests unitaires et intégration continue.',
    'COMP-T02': 'Administration, optimisation et sécurisation de bases de données relationnelles et NoSQL (PostgreSQL, MongoDB).',
    'COMP-C01': 'Capacité à inspirer, motiver et guider une équipe vers l\'atteinte des objectifs stratégiques.',
    'COMP-C02': 'Aptitude à communiquer clairement, écouter activement et adapter son discours aux différents interlocuteurs.',
    'COMP-TR01': 'Planification, suivi et clôture de projets selon les méthodologies agiles et traditionnelles.',
    'COMP-T03': 'Connaissances approfondies de la législation sociale, calcul de la paie et déclarations obligatoires.',
    'COMP-T04': 'Analyse des coûts, élaboration de budgets et tableau de bord financier pour la prise de décision.',
    'COMP-C03': 'Capacité à identifier, analyser et résoudre des problèmes complexes de manière créative et structurée.',
  };
  return descs[comp.code] ?? `Compétence ${comp.libelle.toLowerCase()} du domaine ${comp.famille}.`;
}

/* ------------------------------------------------------------------ */
/*  Data with simulated niveau                                         */
/* ------------------------------------------------------------------ */

const competencesEnriched = mockD21.competences.map((c, i) => ({
  ...c,
  niveau: ((i % 4) + 1) as 1 | 2 | 3 | 4,
  description: getDescription(c as D21Competence),
}));

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
  { key: 'libelle', label: 'Libellé', render: (row) => <span className="font-medium">{String(row.libelle)}</span> },
  { key: 'famille', label: 'Famille' },
  { key: 'type', label: 'Type', render: (row) => <TypeBadge type={String(row.type)} /> },
  { key: 'niveau', label: 'Niveau', render: (row) => <NiveauCircle niveau={Number(row.niveau)} /> },
  {
    key: 'description',
    label: 'Description',
    render: (row) => (
      <span className="max-w-xs truncate text-xs text-muted-foreground" title={String(row.description)}>
        {String(row.description)}
      </span>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Unique families                                                    */
/* ------------------------------------------------------------------ */

const familles = Array.from(new Set(mockD21.competences.map((c) => c.famille as string)));

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CompetencesPage() {
  const [filterFamille, setFilterFamille] = useState('all');
  const [filterNiveau, setFilterNiveau] = useState('all');

  const filtered = useMemo(() => {
    let data = competencesEnriched as unknown as Record<string, unknown>[];
    if (filterFamille !== 'all') {
      data = data.filter((r) => r.famille === filterFamille);
    }
    if (filterNiveau !== 'all') {
      data = data.filter((r) => Number(r.niveau) >= Number(filterNiveau));
    }
    return data;
  }, [filterFamille, filterNiveau]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Catalogue de Compétences"
        description="Référentiel des compétences techniques, comportementales et transversales avec niveaux d'évaluation."
        icon={Award}
        color="green"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Compétences' },
        ]}
      />

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select value={filterFamille} onValueChange={setFilterFamille}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Famille" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les familles</SelectItem>
            {familles.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterNiveau} onValueChange={setFilterNiveau}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Niveau minimum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="2">Niveau 2 et plus</SelectItem>
            <SelectItem value="3">Niveau 3 et plus</SelectItem>
            <SelectItem value="4">Niveau 4 uniquement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchable
        searchPlaceholder="Rechercher une compétence..."
        title="Compétences cataloguées"
        pageSize={10}
      />
    </div>
  );
}
