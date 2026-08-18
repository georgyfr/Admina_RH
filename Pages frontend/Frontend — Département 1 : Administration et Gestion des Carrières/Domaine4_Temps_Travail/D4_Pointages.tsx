'use client';

import { useMemo } from 'react';
import { Fingerprint, Users, UserX, Clock } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { motion } from 'framer-motion';
import { mockD04 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status mapping                                                     */
/* ------------------------------------------------------------------ */

const STATUS_DISPLAY: Record<string, string> = {
  valide: 'Présent',
  en_attente: 'Absent',
  en_retard: 'Retard',
  mission: 'Mission',
};

const STATUS_BADGE: Record<string, string> = {
  valide: 'present',
  en_attente: 'absent',
  en_retard: 'retard',
  mission: 'mission',
};

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

function getAnomalie(row: Record<string, unknown>): string | null {
  if (row.heure_depart === null || row.heure_depart === undefined) {
    return 'Sortie manquante';
  }
  if (row.statut === 'en_retard') {
    return 'Retard détecté';
  }
  const heures = Number(row.nb_heures);
  if (heures < 7) {
    return 'Journée incomplète';
  }
  if (heures > 9) {
    return 'Dépassement horaire';
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PointagesPage() {
  const data = mockD04.pointages;

  const kpis = useMemo(() => {
    const total = data.length;
    const presents = data.filter((p) => p.statut === 'valide').length;
    const absents = data.filter((p) => p.statut === 'en_attente').length;
    const retards = data.filter((p) => p.statut === 'en_retard').length;
    return [
      { title: 'Total pointages', value: total, icon: Fingerprint, color: 'blue' as const },
      { title: 'Présents', value: presents, icon: Users, color: 'green' as const },
      { title: 'Absents', value: absents, icon: UserX, color: 'red' as const },
      { title: 'Retards', value: retards, icon: Clock, color: 'orange' as const },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'date_pointage',
      label: 'Date',
      render: (row) => formatDateFr(String(row.date_pointage)),
    },
    { key: 'heure_arrivee', label: 'Heure Entrée' },
    {
      key: 'heure_depart',
      label: 'Heure Sortie',
      render: (row) =>
        row.heure_depart ? String(row.heure_depart) : '--',
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => (
        <StatusBadge
          status={STATUS_BADGE[String(row.statut)] ?? String(row.statut)}
          size="sm"
        />
      ),
    },
    {
      key: 'anomalie',
      label: 'Anomalie',
      render: (row) => {
        const anomaly = getAnomalie(row);
        if (!anomaly) return <span className="text-muted-foreground">--</span>;
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-[10px]"
          >
            {anomaly}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Pointages"
        description="Enregistrements de pointage (badge, manuel, import) avec détection automatique d'anomalies."
        icon={Fingerprint}
        color="blue"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D4 - Gestion du Temps', href: '/departements/administration-et-gestion-des-carrieres/d4' },
          { label: 'Pointages' },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
        searchPlaceholder="Rechercher un pointage..."
        title="Registre des pointages"
      />
    </div>
  );
}
