'use client';

import { useMemo } from 'react';
import { Timer, Banknote, Hourglass } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { WorkflowTimeline } from '@/components/admina-rh/domain/WorkflowTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { containerVariants } from '@/components/admina-rh/animations';
import { motion } from 'framer-motion';
import { mockD04 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OvertimeRow {
  id: string;
  employe: string;
  semaine: string;
  heures_normales: number;
  heures_sup: number;
  taux_majoration: number;
  montant_brut: number;
  statut: string;
}

/* ------------------------------------------------------------------ */
/*  Synthetic overtime data derived from equilibres                     */
/* ------------------------------------------------------------------ */

const SEMAINES = ['S24', 'S25', 'S26', 'S23', 'S22'];
const EMPLOYES = mockD04.equilibresVP.map((e) => e.employe);

function generateOvertimeData(): OvertimeRow[] {
  const rows: OvertimeRow[] = [];
  const statuts = ['valide', 'en_attente', 'en_attente', 'valide', 'valide'];

  for (let i = 0; i < Math.min(8, EMPLOYES.length); i++) {
    const eq = mockD04.equilibresVP[i];
    const sup = eq.heures_supplementaires;
    if (sup <= 0) continue;

    const taux = sup > 10 ? 50 : 25;
    const salaireHoraire = 3500; // taux horaire moyen FCFA
    rows.push({
      id: eq.id,
      employe: eq.employe,
      semaine: SEMAINES[i % SEMAINES.length],
      heures_normales: 40,
      heures_sup: parseFloat(sup.toFixed(1)),
      taux_majoration: taux,
      montant_brut: Math.round(sup * salaireHoraire * (1 + taux / 100)),
      statut: statuts[i % statuts.length],
    });
  }

  return rows;
}

const overtimeData = generateOvertimeData();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function tauxColor(taux: number): string {
  if (taux >= 100) {
    return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40';
  }
  if (taux >= 50) {
    return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40';
  }
  return 'text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40';
}

function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

/* ------------------------------------------------------------------ */
/*  Workflow steps                                                     */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = [
  {
    label: 'D\u00e9claration',
    description: "L'employ\u00e9 ou le manager d\u00e9clare les heures suppl\u00e9mentaires effectu\u00e9es.",
    status: 'completed' as const,
    date: '30/06/2025',
  },
  {
    label: 'Validation Manager',
    description: 'Le responsable hi\u00e9rarchique valide les heures d\u00e9clar\u00e9es.',
    status: 'current' as const,
  },
  {
    label: 'Int\u00e9gration Paie',
    description: 'Les heures valid\u00e9es sont int\u00e9gr\u00e9es au bulletin de paie du mois.',
    status: 'pending' as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HeuresSupplementairesPage() {
  const kpis = useMemo(() => {
    const totalHS = overtimeData.reduce((s, r) => s + r.heures_sup, 0);
    const montantBrut = overtimeData.reduce((s, r) => s + r.montant_brut, 0);
    const enAttente = overtimeData.filter((r) => r.statut === 'en_attente').length;
    return [
      {
        title: 'Total HS',
        value: `${totalHS.toFixed(1)} h`,
        icon: Timer,
        color: 'blue' as const,
        trend: { value: -15, label: 'vs mois dernier' },
      },
      {
        title: 'Montant brut',
        value: montantBrut,
        icon: Banknote,
        color: 'green' as const,
        subtitle: 'montant des HS',
        trend: { value: 8, label: 'vs mois dernier' },
      },
      {
        title: 'En attente validation',
        value: enAttente,
        icon: Hourglass,
        color: 'orange' as const,
        trend: { value: 5, label: 'vs mois dernier' },
      },
    ];
  }, []);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employ\u00e9' },
    { key: 'semaine', label: 'Semaine' },
    {
      key: 'heures_normales',
      label: 'Heures Normales',
      render: (row) => `${Number(row.heures_normales)} h`,
    },
    {
      key: 'heures_sup',
      label: 'Heures Supp',
      render: (row) => `${Number(row.heures_sup).toFixed(1)} h`,
    },
    {
      key: 'taux_majoration',
      label: 'Taux Majoration',
      render: (row) => {
        const taux = Number(row.taux_majoration);
        return (
          <Badge
            variant="outline"
            className={cn('font-semibold text-[10px]', tauxColor(taux))}
          >
            +{taux}%
          </Badge>
        );
      },
    },
    {
      key: 'montant_brut',
      label: 'Montant Brut',
      render: (row) => (
        <span className="font-medium">
          {formatFcfa(Number(row.montant_brut))}
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <StatusBadge status={String(row.statut)} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Heures Suppl\u00e9mentaires"
        description="Suivi des heures suppl\u00e9mentaires avec majoration +25% (36-43h/sem) et +50% (au-del\u00e0 de 43h/sem)."
        icon={Timer}
        color="blue"
        breadcrumbs={[
          { label: 'D\u00e9partement 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D4 - Gestion du Temps', href: '/departements/administration-et-gestion-des-carrieres/d4' },
          { label: 'Heures Suppl\u00e9mentaires' },
        ]}
      />

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

      <DataTable
        columns={columns}
        data={overtimeData as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un employ\u00e9..."
        title="D\u00e9tail des heures suppl\u00e9mentaires"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Parcours de validation</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTimeline steps={WORKFLOW_STEPS} />
        </CardContent>
      </Card>
    </div>
  );
}
