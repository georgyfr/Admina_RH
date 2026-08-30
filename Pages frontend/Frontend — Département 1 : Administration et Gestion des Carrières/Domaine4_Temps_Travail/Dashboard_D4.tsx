'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  CalendarDays,
  Timer,
  Fingerprint,
  Calculator,
  UserX,
  CalendarOff,
  HeartHandshake,
  FileText,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD04 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_D4 = '/departements/administration-et-gestion-des-carrieres/d4';

const SUB_CARDS = [
  {
    label: 'Plannings',
    icon: CalendarDays,
    href: `${BASE_D4}/plannings`,
    tableCount: 1,
    dataKey: 'plannings' as const,
    color: '#2563EB',
  },
  {
    label: 'Horaires',
    icon: Clock,
    href: '#',
    tableCount: 1,
    dataKey: 'horaires' as const,
    color: '#2563EB',
  },
  {
    label: 'Pointages',
    icon: Fingerprint,
    href: `${BASE_D4}/pointages`,
    tableCount: 1,
    dataKey: 'pointages' as const,
    color: '#2563EB',
  },
  {
    label: 'Comptes d\'heures',
    icon: Calculator,
    href: `${BASE_D4}/heures-supplementaires`,
    tableCount: 1,
    dataKey: 'comptesHeures' as const,
    color: '#2563EB',
  },
  {
    label: 'Absences',
    icon: UserX,
    href: '#',
    tableCount: 1,
    dataKey: 'absences' as const,
    color: '#2563EB',
  },
  {
    label: 'Jours ouvrables',
    icon: CalendarOff,
    href: '#',
    tableCount: 1,
    dataKey: 'joursOuvrables' as const,
    color: '#2563EB',
  },
  {
    label: 'Équilibres VP',
    icon: HeartHandshake,
    href: `${BASE_D4}/equilibres-vp`,
    tableCount: 1,
    dataKey: 'equilibresVP' as const,
    color: '#2563EB',
  },
];

/* ------------------------------------------------------------------ */
/*  KPI data                                                           */
/* ------------------------------------------------------------------ */

function buildKpis(data: typeof mockD04) {
  const totalPointages = data.pointages.length;
  const presents = data.pointages.filter((p) => p.statut === 'valide').length;
  const tauxPresence = totalPointages > 0
    ? Math.round((presents / totalPointages) * 100)
    : 0;

  const heuresSupTotal = data.equilibresVP.reduce(
    (s, e) => s + e.heures_supplementaires,
    0,
  );

  const anomalies = data.pointages.filter(
    (p) => p.statut === 'en_retard' || p.heure_depart === null,
  ).length;

  const planningsPublies = data.plannings.filter(
    (p) => p.statut === 'publie',
  ).length;

  return [
    {
      title: 'Taux de présence moyen',
      value: `${tauxPresence}%`,
      icon: TrendingUp,
      trend: { value: 2.4, label: 'vs mois dernier' },
      color: 'green' as const,
    },
    {
      title: 'Heures supp ce mois',
      value: `${heuresSupTotal.toFixed(1)} h`,
      icon: Timer,
      trend: { value: -15, label: 'vs mois dernier' },
      color: 'orange' as const,
    },
    {
      title: 'Anomalies détectées',
      value: anomalies,
      icon: AlertTriangle,
      trend: { value: -20, label: 'vs mois dernier' },
      color: 'red' as const,
    },
    {
      title: 'Plannings publiés',
      value: planningsPublies,
      icon: CalendarDays,
      trend: { value: 0, label: 'stable' },
      color: 'blue' as const,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D4Dashboard() {
  const kpis = buildKpis(mockD04);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Gestion du Temps"
        description="Pointages, plannings, horaires, comptes d'heures, heures supplémentaires (+25%/+50%), équilibre vie pro/perso et détection d'anomalies."
        icon={Clock}
        color="blue"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D4 - Gestion du Temps' },
        ]}
      />

      {/* KPI Cards */}
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
            trend={kpi.trend}
            color={kpi.color}
          />
        ))}
      </motion.div>

      {/* Sub-page cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {SUB_CARDS.map((card) => {
          const Icon = card.icon;
          const recordCount =
            (mockD04 as Record<string, unknown[]>)[card.dataKey]?.length ?? 0;

          const content = (
            <motion.div
              key={card.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className="cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${card.color}10`,
                        boxShadow: `0 0 0 2px ${card.color}33`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: card.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{card.label}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3" />
                          {card.tableCount} table
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold px-1.5 py-0"
                        >
                          {recordCount} enreg.
                        </Badge>
                      </div>
                    </div>
                    {card.href !== '#' && (
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );

          if (card.href === '#') return <div key={card.label}>{content}</div>;
          return (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
