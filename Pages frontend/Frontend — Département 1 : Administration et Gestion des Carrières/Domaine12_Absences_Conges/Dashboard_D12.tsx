'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserCheck,
  CalendarDays,
  Wallet,
  UserX,
  ArrowRightLeft,
  ShieldCheck,
  BarChart3,
  CalendarOff,
  FileText,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_D12 = '/departements/administration-et-gestion-des-carrieres/d12';

const SUB_CARDS = [
  {
    label: 'Congés',
    icon: CalendarDays,
    href: `${BASE_D12}/conges`,
    dataKey: 'conges' as const,
    color: '#7C3AED',
  },
  {
    label: 'Soldes de Congés',
    icon: Wallet,
    href: `${BASE_D12}/soldes-conges`,
    dataKey: 'soldeConges' as const,
    color: '#7C3AED',
  },
  {
    label: 'Absences',
    icon: UserX,
    href: `${BASE_D12}/absences`,
    dataKey: 'absences' as const,
    color: '#7C3AED',
  },
  {
    label: 'Entrées / Sorties',
    icon: ArrowRightLeft,
    href: `${BASE_D12}/entrees-sorties`,
    dataKey: 'entreesSorties' as const,
    color: '#7C3AED',
  },
  {
    label: 'Autorisations',
    icon: ShieldCheck,
    href: `${BASE_D12}/autorisations`,
    dataKey: 'autorisations' as const,
    color: '#7C3AED',
  },
  {
    label: 'Compteurs Absences',
    icon: BarChart3,
    href: `${BASE_D12}/compteurs-absences`,
    dataKey: 'compteursAbsences' as const,
    color: '#7C3AED',
  },
  {
    label: 'Calendrier Jours Fériés',
    icon: CalendarOff,
    href: `${BASE_D12}/jours-feries`,
    dataKey: 'calendrierJoursFeries' as const,
    color: '#7C3AED',
  },
];

/* ------------------------------------------------------------------ */
/*  KPI data                                                           */
/* ------------------------------------------------------------------ */

function buildKpis(data: typeof mockD12) {
  const congesEnAttente = data.conges.filter(
    (c) => c.statut === 'en_attente',
  ).length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const entreesCeMois = data.entreesSorties.filter((e) => {
    const d = new Date(e.date_mouvement);
    return (
      e.type_mouvement === 'entree' &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  }).length;

  const sortiesCeMois = data.entreesSorties.filter((e) => {
    const d = new Date(e.date_mouvement);
    return (
      e.type_mouvement === 'sortie' &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  }).length;

  const totalAbsences = data.absences.length;
  const tauxAbsentisme = totalAbsences > 0
    ? Math.round((totalAbsences / 20) * 100)
    : 0;

  const autorisationsEnCours = data.autorisations.filter(
    (a) => a.statut === 'demandee' || a.statut === 'validee',
  ).length;

  return [
    {
      title: 'Demandes congés en attente',
      value: congesEnAttente,
      icon: CalendarDays,
      trend: { value: 12, label: 'vs mois dernier' },
      color: 'orange' as const,
    },
    {
      title: 'Entrées ce mois',
      value: entreesCeMois,
      icon: TrendingUp,
      color: 'green' as const,
    },
    {
      title: 'Sorties ce mois',
      value: sortiesCeMois,
      icon: UserX,
      color: 'red' as const,
    },
    {
      title: "Taux d'absentéisme",
      value: `${tauxAbsentisme}%`,
      icon: BarChart3,
      trend: { value: -3, label: 'vs mois dernier' },
      color: 'purple' as const,
    },
    {
      title: 'Autorisations en cours',
      value: autorisationsEnCours,
      icon: ShieldCheck,
      color: 'blue' as const,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D12Dashboard() {
  const kpis = buildKpis(mockD12);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Administration du Personnel"
        description="Entrées/sorties, congés, absences, autorisations et discipline. Validation multi-niveaux (N+1, N+2) et suivi des soldes de congés."
        icon={UserCheck}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Administration du Personnel' },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
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
            (mockD12 as Record<string, unknown[]>)[card.dataKey]?.length ?? 0;

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
                          1 table
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
