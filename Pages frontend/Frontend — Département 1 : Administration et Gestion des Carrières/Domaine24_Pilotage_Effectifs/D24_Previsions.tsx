"use client";

import { motion } from "framer-motion";
import { Target, Users, AlertTriangle, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { DataTable, type Column } from "@/components/admina-rh/domain/DataTable";
import { containerVariants, itemVariants } from "@/components/admina-rh/animations";
import { mockD23 } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Inline previsions data (derived from D23 structures + N+1)         */
/* ------------------------------------------------------------------ */

interface PrevisionRow {
  [key: string]: unknown;
  id: string;
  structure: string;
  effectif_actuel: number;
  prevision_n1: number;
  ecart: number;
  postes_a_pourvoir: number;
  priorite: string;
  action_requise: string;
}

const previsionsData: PrevisionRow[] = mockD23.structures
  .filter((s) => s.niveau >= 2)
  .map((s) => {
    const n1 = Math.round(s.effectif_prevu * 1.08);
    const ecart = n1 - s.effectif_reel;
    const postes = Math.max(0, ecart);
    const priorite = postes >= 4 ? "haute" : postes >= 2 ? "moyenne" : "basse";
    const actionRequise =
      postes === 0
        ? "Aucune"
        : priorite === "haute"
          ? "Recrutement urgent"
          : priorite === "moyenne"
            ? "Plan de recrutement"
            : "Suivi en cours";
    return {
      id: s.id,
      structure: s.nom,
      effectif_actuel: s.effectif_reel,
      prevision_n1: n1,
      ecart,
      postes_a_pourvoir: postes,
      priorite,
      action_requise: actionRequise,
    };
  });

/* ------------------------------------------------------------------ */
/*  KPI Calculations                                                   */
/* ------------------------------------------------------------------ */

const totalPrevuN1 = previsionsData.reduce(
  (s, p) => s + p.prevision_n1,
  0
);
const totalEcart = previsionsData.reduce(
  (s, p) => s + p.ecart,
  0
);
const totalPostes = previsionsData.reduce(
  (s, p) => s + p.postes_a_pourvoir,
  0
);

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */

const PRIORITE_STYLES: Record<string, string> = {
  haute: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  moyenne: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  basse: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
};

function PrioriteBadge({ priorite }: { priorite: string }) {
  const label =
    priorite.charAt(0).toUpperCase() + priorite.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        PRIORITE_STYLES[priorite] ?? PRIORITE_STYLES.basse
      )}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison Bar                                                     */
/* ------------------------------------------------------------------ */

function ComparisonBar({
  actuel,
  prevision,
}: {
  actuel: number;
  prevision: number;
}) {
  const max = Math.max(actuel, prevision, 1);
  return (
    <div className="flex items-center gap-1" style={{ minWidth: 120 }}>
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full bg-teal-500 dark:bg-teal-400 rounded-l-full transition-all"
          style={{ width: `${(actuel / max) * 100}%` }}
          title={`Actuel: ${actuel}`}
        />
        <div
          className="h-full bg-orange-400 dark:bg-orange-500 rounded-r-full transition-all"
          style={{ width: `${((prevision - actuel) / max) * 100}%` }}
          title={`N+1: ${prevision}`}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-14 text-right shrink-0">
        {actuel}→{prevision}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<PrevisionRow>[] = [
  {
    key: "structure",
    label: "Département / Structure",
    render: (row) => (
      <span className="font-medium text-xs">{row.structure}</span>
    ),
  },
  {
    key: "effectif_actuel",
    label: "Effectif Actuel",
    render: (row) => (
      <span className="text-xs font-semibold">
        {row.effectif_actuel}
      </span>
    ),
  },
  {
    key: "prevision_n1",
    label: "Prévision N+1",
    render: (row) => (
      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
        {row.prevision_n1}
      </span>
    ),
  },
  {
    key: "ecart",
    label: "Écart",
    render: (row) => {
      const neg = row.ecart < 0;
      return (
        <span
          className={cn(
            "text-xs font-semibold",
            neg
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {neg ? "" : "+"}
          {row.ecart}
        </span>
      );
    },
  },
  {
    key: "postes_a_pourvoir",
    label: "Postes à Pourvoir",
    render: (row) => (
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-bold",
          row.postes_a_pourvoir > 0
            ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
            : "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
        )}
      >
        {row.postes_a_pourvoir}
      </Badge>
    ),
  },
  {
    key: "priorite",
    label: "Priorité",
    render: (row) => <PrioriteBadge priorite={row.priorite} />,
  },
  {
    key: "action_requise",
    label: "Action Requise",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.action_requise}
      </span>
    ),
  },
  {
    key: "_bar",
    label: "Actuel vs N+1",
    render: (row) => (
      <ComparisonBar
        actuel={row.effectif_actuel}
        prevision={row.prevision_n1}
      />
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PrevisionsPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Prévisions d'Effectifs"
        description="Planification des effectifs N+1 par structure avec analyse des écarts et identification des besoins en recrutement."
        icon={Target}
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
          { label: "Prévisions Effectifs" },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard
          title="Effectif prévu N+1"
          value={totalPrevuN1}
          icon={Users}
          trend={{ value: 5, label: "vs actuel" }}
          color="orange"
        />
        <KpiCard
          title="Écart vs actuel"
          value={`+${totalEcart}`}
          icon={AlertTriangle}
          trend={{ value: 8, label: "besoins identifiés" }}
          color="red"
        />
        <KpiCard
          title="Postes à pourvoir"
          value={totalPostes}
          icon={Briefcase}
          trend={{ value: -2, label: "vs trimestre préc." }}
          color="teal"
        />
      </motion.div>

      {/* Data Table */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <DataTable
          columns={columns}
          data={previsionsData as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Rechercher une structure..."
          title="Prévisions d'effectifs par structure"
          pageSize={10}
        />
      </motion.div>
    </div>
  );
}
