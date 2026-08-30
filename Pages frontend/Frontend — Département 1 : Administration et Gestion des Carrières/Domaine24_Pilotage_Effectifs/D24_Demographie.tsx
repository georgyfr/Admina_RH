"use client";

import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import {
  containerVariants,
  itemVariants,
} from "@/components/admina-rh/animations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mock demographic data                                             */
/* ------------------------------------------------------------------ */

const AGE_PYRAMID = [
  { tranche: ">55", hommes: 4, femmes: 2 },
  { tranche: "45-54", hommes: 10, femmes: 7 },
  { tranche: "35-44", hommes: 16, femmes: 12 },
  { tranche: "25-34", hommes: 14, femmes: 11 },
  { tranche: "<25", hommes: 5, femmes: 3 },
];

const ANCIENNETE = [
  { tranche: ">10 ans", effectif: 14, pct: 27 },
  { tranche: "5-10 ans", effectif: 12, pct: 23 },
  { tranche: "3-5 ans", effectif: 10, pct: 19 },
  { tranche: "1-3 ans", effectif: 9, pct: 17 },
  { tranche: "<1 an", effectif: 7, pct: 14 },
];

const GENDER = { hommes: 49, femmes: 28, pctH: 63.6, pctF: 36.4 };

const DEPT_DISTRIBUTION = [
  { nom: "Direction Technique", effectif: 18, pct: 35 },
  { nom: "Direction Admin. et RH", effectif: 12, pct: 24 },
  { nom: "Pôle Logistique", effectif: 8, pct: 16 },
  { nom: "Direction Générale", effectif: 6, pct: 12 },
  { nom: "Service Informatique", effectif: 5, pct: 10 },
  { nom: "Service Comptabilité", effectif: 2, pct: 3 },
];

/* ------------------------------------------------------------------ */
/*  Age Pyramid Component                                             */
/* ------------------------------------------------------------------ */

function AgePyramidSection() {
  const maxVal = Math.max(
    ...AGE_PYRAMID.flatMap((d) => [d.hommes, d.femmes])
  );
  const total = AGE_PYRAMID.reduce(
    (s, d) => s + d.hommes + d.femmes,
    0
  );

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Pyramide des âges
          </h3>
          <p className="text-xs text-muted-foreground">
            Répartition par tranche d&#39;âge et sexe ({total} agents)
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          {/* Header labels */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:gap-8">
            <span className="text-orange-600 dark:text-orange-400">
              Hommes ({AGE_PYRAMID.reduce((s, d) => s + d.hommes, 0)})
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-teal-600 dark:text-teal-400">
              Femmes ({AGE_PYRAMID.reduce((s, d) => s + d.femmes, 0)})
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {AGE_PYRAMID.map((row) => {
              const sum = row.hommes + row.femmes;
              return (
                <div
                  key={row.tranche}
                  className="flex items-center gap-2"
                >
                  {/* Label */}
                  <span className="w-14 shrink-0 text-right text-xs font-medium text-muted-foreground">
                    {row.tranche}
                  </span>

                  {/* Bars container */}
                  <div className="flex flex-1 items-center gap-0.5">
                    {/* Hommes bar (right-aligned) */}
                    <div className="flex-1 flex justify-end">
                      <motion.div
                        className="h-6 rounded-l-md bg-orange-400 dark:bg-orange-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(row.hommes / maxVal) * 100}%`,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      >
                        <span className="flex items-center justify-end h-full pr-1.5 text-[10px] font-bold text-white">
                          {row.hommes}
                        </span>
                      </motion.div>
                    </div>

                    {/* Center divider */}
                    <div className="w-px h-6 bg-border" />

                    {/* Femmes bar (left-aligned) */}
                    <div className="flex-1">
                      <motion.div
                        className="h-6 rounded-r-md bg-teal-500 dark:bg-teal-400"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(row.femmes / maxVal) * 100}%`,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      >
                        <span className="flex items-center h-full pl-1.5 text-[10px] font-bold text-white">
                          {row.femmes}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Total */}
                  <span className="w-10 shrink-0 text-center text-xs font-semibold">
                    {sum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-sm bg-orange-400 dark:bg-orange-500" />
              <span className="text-xs text-muted-foreground">Hommes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-sm bg-teal-500 dark:bg-teal-400" />
              <span className="text-xs text-muted-foreground">Femmes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seniority Distribution Component                                  */
/* ------------------------------------------------------------------ */

function AncienneteSection() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Distribution de l&#39;ancienneté
          </h3>
          <p className="text-xs text-muted-foreground">
            Répartition par durée d&#39;ancienneté dans le poste
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {ANCIENNETE.map((row) => (
              <div key={row.tranche}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {row.tranche}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {row.effectif} agents
                    </span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                      {row.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: 0.1,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gender Distribution (donut-like)                                  */
/* ------------------------------------------------------------------ */

function GenderSection() {
  const total = GENDER.hommes + GENDER.femmes;
  /* SVG donut: circumference = 2 * PI * r */
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const hommesLen = (GENDER.pctH / 100) * circumference;
  const femmesLen = (GENDER.pctF / 100) * circumference;

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Répartition par genre
          </h3>
          <p className="text-xs text-muted-foreground">
            {total} agents au total
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {/* SVG Donut */}
            <div className="relative size-36 shrink-0">
              <svg
                viewBox="0 0 120 120"
                className="size-full -rotate-90"
              >
                {/* Femmes (background) */}
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  className="text-teal-200 dark:text-teal-800"
                  strokeDasharray={`${femmesLen} ${circumference}`}
                />
                {/* Hommes (foreground) */}
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  className="text-orange-400 dark:text-orange-500"
                  strokeDasharray={`${hommesLen} ${circumference}`}
                  strokeDashoffset="0"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{total}</span>
                <span className="text-[10px] text-muted-foreground">
                  agents
                </span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-4 rounded-full bg-orange-400 dark:bg-orange-500" />
                <div>
                  <p className="text-sm font-semibold">Hommes</p>
                  <p className="text-xs text-muted-foreground">
                    {GENDER.hommes} agents · {GENDER.pctH}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-4 rounded-full bg-teal-500 dark:bg-teal-400" />
                <div>
                  <p className="text-sm font-semibold">Femmes</p>
                  <p className="text-xs text-muted-foreground">
                    {GENDER.femmes} agents · {GENDER.pctF}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Department Distribution Component                                 */
/* ------------------------------------------------------------------ */

function DeptDistributionSection() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Effectifs par structure
          </h3>
          <p className="text-xs text-muted-foreground">
            Répartition des agents par département
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {DEPT_DISTRIBUTION.map((row) => (
              <div key={row.nom}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {row.nom}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {row.effectif}
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {row.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 dark:from-teal-600 dark:to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DemographiePage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Démographie RH"
        description="Pyramide des âges, ancienneté, répartition par genre et par département. Analyse de la structure démographique des effectifs."
        icon={PieChart}
        color="orange"
        breadcrumbs={[
          {
            label: "Département 1",
            href: "/departements/administration-et-gestion-des-carrieres",
          },
          {
            label: "D24",
            href: "/departements/administration-et-gestion-des-carrieres/d24",
          },
          { label: "Démographie RH" },
        ]}
      />

      {/* Top row: Age Pyramid + Gender Donut */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 lg:grid-cols-2"
      >
        <AgePyramidSection />
        <div className="space-y-4">
          <GenderSection />
        </div>
      </motion.div>

      {/* Bottom row: Seniority + Dept Distribution */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 lg:grid-cols-2"
      >
        <AncienneteSection />
        <DeptDistributionSection />
      </motion.div>
    </div>
  );
}
