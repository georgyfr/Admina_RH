'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Banknote,
  Receipt,
  Gift,
  Calculator,
  Landmark,
  ArrowDownToLine,
  BookOpen,
  History,
  TrendingUp,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD05 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_D5 = '/departements/administration-et-gestion-des-carrieres/d5';

const SUB_CARDS = [
  {
    label: 'Bulletins de Paie',
    icon: Receipt,
    href: `${BASE_D5}/bulletins`,
    dataKey: 'bulletins_paie' as const,
    color: '#F59E0B',
  },
  {
    label: 'Primes',
    icon: Gift,
    href: `${BASE_D5}/primes`,
    dataKey: 'primes' as const,
    color: '#10B981',
  },
  {
    label: 'Éléments de Paie',
    icon: Calculator,
    href: `${BASE_D5}/elements-paie`,
    dataKey: 'elementsPaie' as const,
    color: '#3B82F6',
  },
  {
    label: 'Cotisations Sociales',
    icon: Landmark,
    href: `${BASE_D5}/cotisations`,
    dataKey: 'cotisations_sociales' as const,
    color: '#8B5CF6',
  },
  {
    label: 'Retenues',
    icon: ArrowDownToLine,
    href: `${BASE_D5}/retenues`,
    dataKey: 'retenues' as const,
    color: '#EF4444',
  },
  {
    label: 'Conventions Collectives',
    icon: BookOpen,
    href: `${BASE_D5}/conventions`,
    dataKey: 'conventions_collectives' as const,
    color: '#0EA5E9',
  },
  {
    label: 'Historique Salaires',
    icon: History,
    href: `${BASE_D5}/historique`,
    dataKey: 'historique_salaires' as const,
    color: '#EC4899',
  },
  {
    label: 'Prévisions Paie',
    icon: TrendingUp,
    href: `${BASE_D5}/previsions`,
    dataKey: 'previsions_paie' as const,
    color: '#F97316',
  },
];

/* ------------------------------------------------------------------ */
/*  KPI data                                                           */
/* ------------------------------------------------------------------ */

function buildKpis() {
  const masseBrute = mockD05.bulletins_paie.reduce((s, b) => s + b.salaire_brut, 0);
  const totalCotisations = mockD05.cotisations_sociales.reduce((s, c) => s + c.montant, 0);
  const bulletinsGeneres = mockD05.bulletins_paie.filter(
    (b) => b.statut === 'genere' || b.statut === 'envoye',
  ).length;
  const primesValidees = mockD05.primes.filter((p) => p.statut === 'validee').length;
  const retenuesEnCours = mockD05.elementsPaie.filter(
    (e) => e.type_element === 'retenue' && e.statut === 'en_attente',
  ).length;

  return [
    {
      title: 'Masse salariale brute',
      value: masseBrute,
      icon: Banknote,
      trend: { value: 2.1, label: 'vs mois dernier' },
      color: 'orange' as const,
      subtitle: 'montant salaire',
    },
    {
      title: 'Total cotisations',
      value: totalCotisations,
      icon: Landmark,
      trend: { value: 1.5, label: 'vs mois dernier' },
      color: 'purple' as const,
      subtitle: 'montant cotisations',
    },
    {
      title: 'Bulletins générés ce mois',
      value: bulletinsGeneres,
      icon: Receipt,
      trend: { value: 12, label: 'ce mois' },
      color: 'green' as const,
    },
    {
      title: 'Primes validées',
      value: primesValidees,
      icon: Gift,
      trend: { value: 8, label: 'ce mois' },
      color: 'teal' as const,
    },
    {
      title: 'Retenues en cours',
      value: retenuesEnCours,
      icon: ArrowDownToLine,
      trend: { value: -10, label: 'vs mois dernier' },
      color: 'red' as const,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D5Dashboard() {
  const kpis = buildKpis();

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Gestion des Salaires"
        description="Éléments de rémunération, primes, indemnités, cotisations sociales, bulletins de paie, conventions collectives et historique salarial."
        icon={Banknote}
        color="orange"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D5 — Gestion des Salaires' },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
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
            (mockD05 as unknown as Record<string, unknown[]>)[card.dataKey]?.length ?? 0;

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
