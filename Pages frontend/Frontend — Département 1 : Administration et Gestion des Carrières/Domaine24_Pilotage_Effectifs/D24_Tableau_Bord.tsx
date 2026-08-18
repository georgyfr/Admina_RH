"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  CalendarClock,
  Hourglass,
  Clock,
  Palmtree,
  UserPlus,
  UserMinus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import {
  containerVariants,
  itemVariants,
} from "@/components/admina-rh/animations";
import {
  mockD23,
  mockD24,
  mockD12,
  mockD02,
} from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Computed data                                                      */
/* ------------------------------------------------------------------ */

const totalEffectif = mockD23.structures.reduce(
  (sum, s) => sum + s.effectif_reel,
  0
);

const departures = mockD24.mouvements.filter(
  (m) => m.type_mouvement === "depart"
).length;
const tauxRotation = totalEffectif > 0
  ? ((departures / totalEffectif) * 100).toFixed(1)
  : "0.0";

/* ------------------------------------------------------------------ */
/*  Section 2 — Répartition par contrat                                */
/* ------------------------------------------------------------------ */

const CONTRAT_COLORS: Record<string, { bg: string; label: string }> = {
  CDI: { bg: "bg-teal-500 dark:bg-teal-400", label: "CDI" },
  CDD: { bg: "bg-blue-500 dark:bg-blue-400", label: "CDD" },
  Stage: { bg: "bg-orange-500 dark:bg-orange-400", label: "Stage" },
  Interim: { bg: "bg-purple-500 dark:bg-purple-400", label: "Intérim" },
};

function ContratRepartition() {
  const contratCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of mockD02.contrats) {
      const type = c.type_contrat;
      if (type in CONTRAT_COLORS) {
        counts[type] = (counts[type] ?? 0) + 1;
      }
    }
    return counts;
  }, []);

  const totalContrats = Object.values(contratCounts).reduce(
    (s, v) => s + v,
    0
  );

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Répartition par type de contrat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          {Object.entries(CONTRAT_COLORS).map(([key, { bg, label }]) => {
            const count = contratCounts[key] ?? 0;
            const pct =
              totalContrats > 0 ? (count / totalContrats) * 100 : 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={"h-full rounded-full " + bg}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {Object.entries(CONTRAT_COLORS).map(([key, { bg, label }]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={"size-2.5 rounded-sm " + bg} />
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Mouvements mensuels                                    */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function MouvementsMensuels() {
  const monthlyData = useMemo(() => {
    const grouped: Record<
      string,
      { month: number; embauches: number; departs: number }
    > = {};

    for (const m of mockD24.mouvements) {
      const d = new Date(m.date_mouvement);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: d.getMonth(),
          embauches: 0,
          departs: 0,
        };
      }
      if (m.type_mouvement === "embauche") {
        grouped[monthKey].embauches += 1;
      } else if (m.type_mouvement === "depart") {
        grouped[monthKey].departs += 1;
      }
    }

    // Sort by key (year-month) descending, take last 6
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .reverse();

    return sorted.map(([key, val]) => ({
      label: MONTH_LABELS[val.month] ?? key,
      ...val,
    }));
  }, []);

  const maxVal = Math.max(
    1,
    ...monthlyData.flatMap((d) => [d.embauches, d.departs])
  );

  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Mouvements mensuels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="flex h-52 items-end gap-3 sm:gap-5">
            {monthlyData.map((d, i) => (
              <div
                key={d.label + i}
                className="flex flex-1 flex-col items-center gap-1"
              >
                {/* Paired bars */}
                <div className="flex w-full items-end justify-center gap-1">
                  {/* Embauche bar */}
                  <motion.div
                    className="w-full max-w-[20px] rounded-t-sm bg-emerald-500 dark:bg-emerald-400"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(d.embauches / maxVal) * 160}px`,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                      delay: i * 0.1,
                    }}
                    title={`Embauches: ${d.embauches}`}
                  />
                  {/* Depart bar */}
                  <motion.div
                    className="w-full max-w-[20px] rounded-t-sm bg-red-500 dark:bg-red-400"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(d.departs / maxVal) * 160}px`,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                      delay: i * 0.1 + 0.05,
                    }}
                    title={`Départs: ${d.departs}`}
                  />
                </div>
                {/* Month label */}
                <span className="text-[11px] font-medium text-muted-foreground">
                  {d.label}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-[11px] text-muted-foreground">
                Embauches
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-red-500 dark:bg-red-400" />
              <span className="text-[11px] text-muted-foreground">
                Départs
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Indicateurs clés                                       */
/* ------------------------------------------------------------------ */

interface IndicatorCard {
  title: string;
  value: string;
  icon: LucideIcon;
  trendValue: number;
  description: string;
  color: "green" | "red" | "blue" | "orange";
}

function useIndicators(): IndicatorCard[] {
  return useMemo(() => {
    // 1. Taux d'absentéisme
    const absenceCount = mockD12.absences.length;
    const tauxAbsent =
      totalEffectif > 0
        ? ((absenceCount / totalEffectif) * 100).toFixed(1)
        : "0.0";

    // 2. Congés pris ce mois
    const congesApproved = mockD12.conges.filter((c) =>
      c.statut.startsWith("approuve")
    ).length;

    // 3. Nouvelles embauches
    const embauches = mockD24.mouvements.filter(
      (m) => m.type_mouvement === "embauche"
    ).length;

    // 4. Départs ce trimestre
    const departsTrim = mockD24.mouvements.filter(
      (m) => m.type_mouvement === "depart"
    ).length;

    return [
      {
        title: "Taux d'absentéisme",
        value: `${tauxAbsent}%`,
        icon: Clock,
        trendValue: -12,
        description: "vs mois précédent",
        color: "green",
      },
      {
        title: "Congés pris ce mois",
        value: String(congesApproved),
        icon: Palmtree,
        trendValue: 8,
        description: "vs mois précédent",
        color: "blue",
      },
      {
        title: "Nouvelles embauches",
        value: String(embauches),
        icon: UserPlus,
        trendValue: 15,
        description: "ce trimestre",
        color: "orange",
      },
      {
        title: "Départs ce trimestre",
        value: String(departsTrim),
        icon: UserMinus,
        trendValue: -10,
        description: "vs trimestre préc.",
        color: "red",
      },
    ];
  }, []);
}

function IndicateurClesCards() {
  const indicators = useIndicators();

  const colorStyles: Record<
    string,
    { bg: string; icon: string; ring: string }
  > = {
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-200 dark:ring-emerald-800",
    },
    blue: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      icon: "text-sky-600 dark:text-sky-400",
      ring: "ring-sky-200 dark:ring-sky-800",
    },
    orange: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      icon: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-200 dark:ring-amber-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/40",
      icon: "text-red-600 dark:text-red-400",
      ring: "ring-red-200 dark:ring-red-800",
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {indicators.map((ind, i) => {
        const Icon = ind.icon;
        const isPositive = ind.trendValue >= 0;
        const palette = colorStyles[ind.color];
        return (
          <motion.div
            key={ind.title}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={
                      "flex size-10 shrink-0 items-center justify-center rounded-full ring-2 " +
                      palette.bg +
                      " " +
                      palette.ring
                    }
                  >
                    <Icon className={"size-5 " + palette.icon} />
                  </div>

                  {/* Trend badge */}
                  <div
                    className={
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
                      (isPositive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400")
                    }
                  >
                    {isPositive ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingUp className="size-3.5 rotate-180" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {ind.trendValue}%
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium text-muted-foreground sm:text-sm">
                  {ind.title}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {ind.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ind.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D24TableauBord() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Tableau de Bord Social"
        description="Vue d'ensemble des indicateurs sociaux : effectifs, contrats, mouvements et tendances clés du département."
        icon={ShieldCheck}
        color="green"
        breadcrumbs={[
          {
            label: "Département 1",
            href: "/departements/administration-et-gestion-des-carrieres",
          },
          {
            label: "D24",
            href: "/departements/administration-et-gestion-des-carrieres/d24",
          },
          { label: "Tableau de Bord Social" },
        ]}
      />

      {/* Section 1 — KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          title="Effectif total"
          value={totalEffectif}
          icon={Users}
          trend={{ value: 3.2, label: "vs mois dernier" }}
          color="green"
        />
        <KpiCard
          title="Taux de rotation"
          value={`${tauxRotation}%`}
          icon={TrendingUp}
          trend={{ value: -1.4, label: "vs mois dernier" }}
          color="green"
        />
        <KpiCard
          title="Âge moyen"
          value="34.2 ans"
          icon={CalendarClock}
          trend={{ value: 0.3, label: "vs année préc." }}
          color="green"
        />
        <KpiCard
          title="Ancienneté moyenne"
          value="4.8 ans"
          icon={Hourglass}
          trend={{ value: 0.2, label: "vs année préc." }}
          color="green"
        />
      </motion.div>

      {/* Sections 2 & 3 — Charts side by side */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 lg:grid-cols-2"
      >
        <ContratRepartition />
        <MouvementsMensuels />
      </motion.div>

      {/* Section 4 — Indicateurs clés */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mb-4 text-lg font-semibold">Indicateurs clés</h2>
        <IndicateurClesCards />
      </motion.div>
    </div>
  );
}
