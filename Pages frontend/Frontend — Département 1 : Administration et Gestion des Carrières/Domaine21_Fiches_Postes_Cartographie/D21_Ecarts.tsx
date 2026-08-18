'use client';

import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD21 } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Écart badge                                                        */
/* ------------------------------------------------------------------ */

const ECART_MAP: Record<number, { label: string; style: string }> = {
  0: {
    label: 'Aucun',
    style:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  1: {
    label: 'Faible',
    style:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  },
  2: {
    label: 'Modéré',
    style:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  },
  3: {
    label: 'Critique',
    style:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  },
};

function EcartBadge({ ecart }: { ecart: number }) {
  const key = Math.min(Math.max(ecart, 0), 3);
  const entry = ECART_MAP[key] ?? ECART_MAP[2];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        entry.style,
      )}
    >
      {key === 0 ? (
        <CheckCircle2 className="size-3" />
      ) : key >= 2 ? (
        <AlertTriangle className="size-3" />
      ) : null}
      {entry.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Niveau progress bars                                               */
/* ------------------------------------------------------------------ */

function NiveauProgress({ actuel, requis }: { actuel: number; requis: number }) {
  const pct = Math.min((actuel / requis) * 100, 100);
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 66 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">
        {actuel}/{requis}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const ecarts = mockD21.ecartsCompetences;
const data = ecarts as unknown as Record<string, unknown>[];

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'employe',
    label: 'Employé',
    render: (row) => <span className="font-medium">{String(row.employe)}</span>,
  },
  { key: 'poste', label: 'Poste' },
  { key: 'competence', label: 'Compétence Requise' },
  { key: 'niveau_requis', label: 'Niveau Requis', render: (row) => <span className="font-mono text-xs">{String(row.niveau_requis)}</span> },
  { key: 'niveau_actuel', label: 'Niveau Actuel', render: (row) => <span className="font-mono text-xs">{String(row.niveau_actuel)}</span> },
  {
    key: 'ecart',
    label: 'Écart',
    render: (row) => <EcartBadge ecart={Number(row.ecart)} />,
  },
  {
    key: 'plan_action',
    label: 'Plan d\'Action',
    render: (row) => (
      <span className="max-w-[200px] truncate text-xs text-muted-foreground" title={String(row.plan_action)}>
        {String(row.plan_action)}
      </span>
    ),
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => {
      const s = String(row.statut);
      const map: Record<string, string> = {
        detecte: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
        en_cours: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
        resolu: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        depasse: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
      };
      const style = map[s] ?? '';
      const label = s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', style)}>
          {label}
        </span>
      );
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

const critiques = ecarts.filter((e) => e.ecart >= 2 && (e.statut === 'detecte' || e.statut === 'en_cours')).length;
const enFormation = ecarts.filter((e) => e.statut === 'en_cours').length;
const resolus = ecarts.filter((e) => e.statut === 'resolu').length;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EcartsPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Analyse d'Écarts de Compétences"
        description="Comparaison entre le profil réel des employés et les exigences des fiches de poste, avec plans d'action priorisés."
        icon={AlertTriangle}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Écarts Compétences' },
        ]}
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Écarts critiques" value={critiques} icon={AlertTriangle} color="red" />
        <KpiCard title="En formation" value={enFormation} icon={Clock} color="blue" />
        <KpiCard title="Résolus" value={resolus} icon={CheckCircle2} color="green" />
      </div>

      {/* Progress overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {ecarts.map((e) => {
          if (e.ecart === 0) return null;
          const pct = Math.min(Math.round((e.niveau_actuel / e.niveau_requis) * 100), 100);
          return (
            <div key={e.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium truncate mr-2">{e.employe}</span>
                <EcartBadge ecart={e.ecart} />
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{e.competence}</p>
              <NiveauProgress actuel={e.niveau_actuel} requis={e.niveau_requis} />
              <p className="mt-2 text-[10px] text-muted-foreground">{pct}% du niveau requis</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Rechercher un écart..."
        title="Détail des écarts de compétences"
        pageSize={10}
      />
    </div>
  );
}
