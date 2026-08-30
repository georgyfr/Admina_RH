"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  CalendarClock,
  Hourglass,
  ArrowRight,
  ClipboardList,
  ArrowLeftRight,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import {
  containerVariants,
  itemVariants,
} from "@/components/admina-rh/animations";
import { mockD24, mockD23 } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE =
  "/departements/administration-et-gestion-des-carrieres/d24";

/* ------------------------------------------------------------------ */
/*  KPI Calculations                                                   */
/* ------------------------------------------------------------------ */

const totalEffectifActuel = mockD23.structures.reduce(
  (s, st) => s + st.effectif_reel,
  0
);
const totalEffectifPrevu = mockD23.structures.reduce(
  (s, st) => s + st.effectif_prevu,
  0
);
const tauxTurnover = "8.2";
const ageMoyen = 38;
const ancienneteMoyenne = 6.3;

/* ------------------------------------------------------------------ */
/*  Module Cards                                                       */
/* ------------------------------------------------------------------ */

const MODULE_CARDS = [
  {
    title: "Prévisions Effectifs",
    description: "Planification et projections d'effectifs N+1",
    icon: Target,
    href: `${BASE}/previsions`,
    count: mockD23.structures.length,
    color: "#EA580C",
  },
  {
    title: "Mouvements Effectifs",
    description: "Entrées, sorties, mutations et promotions",
    icon: ArrowLeftRight,
    href: `${BASE}/mouvements`,
    count: mockD24.mouvements.length,
    color: "#0F766E",
  },
  {
    title: "Tableau de Bord Social",
    description: "Agrégats mensuels et indicateurs sociaux",
    icon: ClipboardList,
    href: `${BASE}/tableau-bord`,
    count: 12,
    color: "#EA580C",
  },
  {
    title: "Démographie RH",
    description: "Pyramide des âges, ancienneté, répartition",
    icon: PieChart,
    href: `${BASE}/demographie`,
    count: 5,
    color: "#0F766E",
  },
  {
    title: "Indicateurs Effectifs",
    description: "KPI turn-over, absentéisme, stabilité",
    icon: Activity,
    href: `${BASE}/indicateurs`,
    count: mockD24.indicateurs.length,
    color: "#EA580C",
  },
];

/* ------------------------------------------------------------------ */
/*  Mini Age Pyramid                                                   */
/* ------------------------------------------------------------------ */

const AGE_DATA = [
  { tranche: "50-60", hommes: 8, femmes: 5 },
  { tranche: "40-50", hommes: 14, femmes: 9 },
  { tranche: "30-40", hommes: 12, femmes: 10 },
  { tranche: "20-30", hommes: 6, femmes: 4 },
];

const MAX_BAR = Math.max(
  ...AGE_DATA.flatMap((d) => [d.hommes, d.femmes])
);

function AgePyramidMini() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Pyramide des âges (simplifiée)
          </h3>
          <p className="text-xs text-muted-foreground">
            Répartition par tranche d'âge et sexe
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-muted-foreground sm:gap-6 sm:text-xs">
            <span>Hommes</span>
            <span>Femmes</span>
          </div>
          <div className="mt-2 space-y-2">
            {AGE_DATA.map((row) => (
              <div key={row.tranche} className="flex items-center gap-2">
                {/* Label */}
                <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">
                  {row.tranche}
                </span>
                {/* Bar hommes (right-aligned) */}
                <div className="flex flex-1 items-center gap-1">
                  <div className="flex-1 flex justify-end">
                    <div
                      className="h-5 rounded-l-sm bg-orange-400 dark:bg-orange-500 transition-all"
                      style={{
                        width: `${(row.hommes / MAX_BAR) * 100}%`,
                      }}
                    />
                  </div>
                  {/* Center line */}
                  <div className="w-px h-5 bg-border" />
                  {/* Bar femmes (left-aligned) */}
                  <div className="flex-1">
                    <div
                      className="h-5 rounded-r-sm bg-teal-500 dark:bg-teal-400 transition-all"
                      style={{
                        width: `${(row.femmes / MAX_BAR) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                {/* Count */}
                <span className="w-12 shrink-0 text-xs text-muted-foreground">
                  {row.hommes + row.femmes}
                </span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-orange-400 dark:bg-orange-500" />
              <span className="text-[10px] text-muted-foreground">
                Hommes ({AGE_DATA.reduce((s, d) => s + d.hommes, 0)})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-teal-500 dark:bg-teal-400" />
              <span className="text-[10px] text-muted-foreground">
                Femmes ({AGE_DATA.reduce((s, d) => s + d.femmes, 0)})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D24Dashboard() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Effectifs"
        description="Prévisions et mouvements d'effectifs, tableau de bord social, démographie RH (pyramide des âges, ancienneté, turn-over) et indicateurs clés."
        icon={BarChart3}
        color="orange"
        breadcrumbs={[
          {
            label: "Département 1",
            href: "/departements/administration-et-gestion-des-carrieres",
          },
          { label: "D24 — Effectifs" },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <KpiCard
          title="Effectif actuel"
          value={totalEffectifActuel}
          icon={Users}
          trend={{ value: 3.2, label: "vs mois dernier" }}
          color="orange"
        />
        <KpiCard
          title="Prévisions N+1"
          value={totalEffectifPrevu}
          icon={Target}
          trend={{ value: 5, label: "ce trimestre" }}
          color="teal"
        />
        <KpiCard
          title="Taux de turn-over"
          value={`${tauxTurnover}%`}
          icon={TrendingUp}
          trend={{ value: -0.5, label: "vs mois dernier" }}
          color="green"
        />
        <KpiCard
          title="Âge moyen"
          value={`${ageMoyen} ans`}
          icon={CalendarClock}
          trend={{ value: 0.3, label: "vs année préc." }}
          color="blue"
        />
        <KpiCard
          title="Ancienneté moyenne"
          value={`${ancienneteMoyenne} ans`}
          icon={Hourglass}
          trend={{ value: 0.2, label: "vs année préc." }}
          color="purple"
        />
      </motion.div>

      {/* Module Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MODULE_CARDS.map((card) => {
          const Icon = card.icon;
          const content = (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl ring-2"
                      style={{
                        backgroundColor: `${card.color}10`,
                        ringColor: `${card.color}33`,
                      }}
                    >
                      <Icon
                        className="size-5"
                        style={{ color: card.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {card.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {card.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold"
                          style={{
                            borderColor: `${card.color}40`,
                            color: card.color,
                          }}
                        >
                          {card.count} enregistrement
                          {card.count > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    {card.href !== "#" && (
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );

          if (card.href === "#") return content;
          return (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          );
        })}
      </motion.div>

      {/* Mini Age Pyramid */}
      <AgePyramidMini />
    </div>
  );
}
