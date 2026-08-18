"use client";

import { motion } from "framer-motion";
import { UserCheck, Briefcase, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { DataTable, type Column } from "@/components/admina-rh/domain/DataTable";
import { StatusBadge } from "@/components/admina-rh/domain/StatusBadge";
import { containerVariants, itemVariants } from "@/components/admina-rh/animations";
import { mockD23, type D23Affectation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Type affectation badge                                             */
/* ------------------------------------------------------------------ */

const TYPE_AFFECT_STYLES: Record<string, string> = {
  titulaire:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  interim:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  delegation:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
};

const TYPE_AFFECT_LABELS: Record<string, string> = {
  titulaire: "Titulaire",
  interim: "Intérim",
  delegation: "Délégation",
};

function TypeAffectationBadge({ type }: { type: string }) {
  const style = TYPE_AFFECT_STYLES[type] ?? "";
  const label =
    TYPE_AFFECT_LABELS[type] ??
    type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        style
      )}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI Calculations                                                   */
/* ------------------------------------------------------------------ */

const affectationsEnCours = mockD23.affectations.filter(
  (a) => a.statut === "en_cours"
).length;

const totalPostesBudg = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.nombre_postes,
  0
);
const totalPourvus = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.postes_pourvus,
  0
);
const postesVacants = totalPostesBudg - totalPourvus;
const tauxRemplissage =
  totalPostesBudg > 0
    ? ((totalPourvus / totalPostesBudg) * 100).toFixed(1)
    : "0";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D23Affectation>[] = [
  {
    key: "employe",
    label: "Employé",
    render: (row) => <span className="font-medium">{row.employe}</span>,
  },
  {
    key: "poste",
    label: "Poste",
    render: (row) => <span className="text-xs">{row.poste}</span>,
  },
  {
    key: "structure",
    label: "Structure",
    render: (row) => (
      <span className="text-xs text-muted-foreground">{row.structure}</span>
    ),
  },
  {
    key: "date_debut",
    label: "Date Début",
  },
  {
    key: "date_fin",
    label: "Date Fin",
  },
  {
    key: "type_affectation",
    label: "Type",
    render: (row) => (
      <TypeAffectationBadge type={row.type_affectation} />
    ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (row) => <StatusBadge status={row.statut} size="sm" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AffectationsPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Affectations"
        description="Affectations des employés aux structures (titulaire, intérim, délégation) avec suivi des dates et statuts."
        icon={UserCheck}
        color="red"
        breadcrumbs={[
          {
            label: "Département 1",
            href: "/departements/administration-et-gestion-des-carrieres",
          },
          {
            label: "D23",
            href: "/departements/administration-et-gestion-des-carrieres/d23",
          },
          { label: "Affectations" },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <KpiCard
          title="Affectations actives"
          value={affectationsEnCours}
          icon={UserCheck}
          trend={{ value: 1, label: "ce mois" }}
          color="green"
        />
        <KpiCard
          title="Postes vacants"
          value={postesVacants}
          icon={Briefcase}
          trend={{ value: -5, label: "vs mois dernier" }}
          color="red"
        />
        <KpiCard
          title="Taux de remplissage"
          value={`${tauxRemplissage}%`}
          icon={Gauge}
          trend={{ value: 1.5, label: "vs mois dernier" }}
          color="orange"
        />
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={
          mockD23.affectations as unknown as Record<
            string,
            unknown
          >[]
        }
        searchable
        searchPlaceholder="Rechercher une affectation..."
        title="Liste des affectations"
        pageSize={10}
      />
    </div>
  );
}
