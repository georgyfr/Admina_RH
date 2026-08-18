'use client';

import { useMemo } from 'react';
import { Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { WorkflowTimeline } from '@/components/admina-rh/domain/WorkflowTimeline';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants } from '@/components/admina-rh/animations';
import { mockD05, type D05BulletinPaieExt } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* ------------------------------------------------------------------ */
/*  Status badge custom pour bulletin                                   */
/* ------------------------------------------------------------------ */

const BULLETIN_STATUS_MAP: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800',
  genere: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  envoye: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  archive: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
};

function BulletinStatusBadge({ status }: { status: string }) {
  const style = BULLETIN_STATUS_MAP[status] ?? '';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

function formatDate(value: string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  } catch {
    return value;
  }
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D05BulletinPaieExt>[] = [
  { key: 'employe', label: 'Employé' },
  {
    key: 'periode',
    label: 'Période',
    render: (row) => <span>{formatDate(row.periode)}</span>,
  },
  {
    key: 'salaire_brut',
    label: 'Salaire Brut (FCFA)',
    render: (row) => <span className="font-medium">{formatFcfa(row.salaire_brut)}</span>,
  },
  {
    key: 'total_cotisations',
    label: 'Total Cotisations (FCFA)',
    render: (row) => <span className="text-red-600 dark:text-red-400">{formatFcfa(row.total_cotisations)}</span>,
  },
  {
    key: 'salaire_net',
    label: 'Salaire Net (FCFA)',
    render: (row) => <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatFcfa(row.salaire_net)}</span>,
  },
  {
    key: 'nb_heures_travaillees',
    label: 'Nb Heures',
    render: (row) => <span>{row.nb_heures_travaillees.toFixed(1)} h</span>,
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <BulletinStatusBadge status={row.statut} />,
  },
];

/* ------------------------------------------------------------------ */
/*  Workflow                                                           */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = [
  { label: 'Saisie données', status: 'completed' as const, description: 'Import heures, absences et éléments variables' },
  { label: 'Calcul automatique', status: 'completed' as const, description: 'Application des grilles et taux conventionnels' },
  { label: 'Validation DRH', status: 'current' as const, description: 'Vérification et approbation par la DRH' },
  { label: 'Envoi employé', status: 'pending' as const, description: 'Distribution des bulletins et archivage PDF' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BulletinsPage() {
  const data = mockD05.bulletins_paie;

  const kpis = useMemo(() => {
    const totalBulletins = data.length;
    const masseNette = data.reduce((s, b) => s + b.salaire_net, 0);
    const enAttente = data.filter((b) => b.statut === 'brouillon' || b.statut === 'genere').length;
    return [
      {
        title: 'Total bulletins mois',
        value: totalBulletins,
        icon: Receipt,
        trend: { value: 8, label: 'ce mois' },
        color: 'teal' as const,
      },
      {
        title: 'Masse salariale nette',
        value: masseNette,
        icon: Receipt,
        trend: { value: 1.8, label: 'vs mois dernier' },
        color: 'green' as const,
        subtitle: 'montant salaire',
      },
      {
        title: 'En attente validation',
        value: enAttente,
        icon: Receipt,
        trend: { value: -5, label: 'vs mois dernier' },
        color: 'orange' as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Bulletins de Paie"
        description="Génération, consultation et suivi des bulletins de paie mensuels avec workflow de validation."
        icon={Receipt}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5', href: '/departements/administration-et-gestion-des-carrieres/d5' },
          { label: 'Bulletins de Paie' },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            color={kpi.color}
            subtitle={kpi.subtitle}
          />
        ))}
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un bulletin..."
        title="Liste des bulletins de paie"
        pageSize={10}
      />

      {/* Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Workflow de génération</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTimeline steps={WORKFLOW_STEPS} />
        </CardContent>
      </Card>
    </div>
  );
}
