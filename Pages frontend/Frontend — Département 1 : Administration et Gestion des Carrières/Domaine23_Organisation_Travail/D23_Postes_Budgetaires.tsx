"use client";

import { motion } from "framer-motion";
import { Wallet, CheckCircle2, XCircle, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { DataTable, type Column } from "@/components/admina-rh/domain/DataTable";
import { containerVariants, itemVariants } from "@/components/admina-rh/animations";
import { mockD23, type D23PosteBudgetaire } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Categorie Badge (A/B/C/D)                                         */
/* ------------------------------------------------------------------ */

const CATEGORIE_STYLES: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  B: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  C: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  D: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
};

function CategorieBadge({ categorie }: { categorie: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
        CATEGORIE_STYLES[categorie] ?? CATEGORIE_STYLES.C
      )}
    >
      Cat. {categorie}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Statut badge (pourvu/vacant/gele)                                  */
/* ------------------------------------------------------------------ */

const STATUT_PB_STYLES: Record<string, string> = {
  pourvu:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  vacant:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  gele:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

const STATUT_PB_LABELS: Record<string, string> = {
  pourvu: "Pourvu",
  vacant: "Vacant",
  gele: "Gelé",
};

function PosteStatutBadge({ statut }: { statut: string }) {
  const style = STATUT_PB_STYLES[statut] ?? "";
  const label = STATUT_PB_LABELS[statut] ?? statut;
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
/*  Summary calculations                                              */
/* ------------------------------------------------------------------ */

const totalPostes = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.nombre_postes,
  0
);
const totalPourvus = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.postes_pourvus,
  0
);
const totalVacants = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.postes_vacants,
  0
);
const tauxRemplissage =
  totalPostes > 0
    ? ((totalPourvus / totalPostes) * 100).toFixed(1)
    : "0";
const pourvusPercent =
  totalPostes > 0 ? (totalPourvus / totalPostes) * 100 : 0;

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D23PosteBudgetaire>[] = [
  {
    key: "code_poste",
    label: "Code Poste",
    render: (row) => (
      <span className="font-mono text-xs font-bold text-muted-foreground">
        {row.code_poste}
      </span>
    ),
  },
  {
    key: "titre_poste",
    label: "Titre",
    render: (row) => <span className="font-medium">{row.titre_poste}</span>,
  },
  {
    key: "structure",
    label: "Structure",
    render: (row) => (
      <span className="max-w-[12rem] truncate text-xs text-muted-foreground">
        {row.structure}
      </span>
    ),
  },
  {
    key: "categorie",
    label: "Catégorie",
    render: (row) => <CategorieBadge categorie={row.categorie} />,
  },
  {
    key: "echelon",
    label: "Échelon",
    render: (row) => (
      <span className="text-center font-mono text-xs">{row.echelon}</span>
    ),
  },
  {
    key: "salaire_reference",
    label: "Salaire Référence",
    render: (row) => (
      <span className="text-xs font-medium">
        {row.salaire_reference.toLocaleString("fr-FR")} FCFA
      </span>
    ),
  },
  {
    key: "occupant",
    label: "Occupant",
    render: (row) => (
      <span className="text-xs">{row.occupant ?? "—"}</span>
    ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (row) => <PosteStatutBadge statut={row.statut} />,
  },
];

/* ------------------------------------------------------------------ */
/*  Visual ratio bar                                                   */
/* ------------------------------------------------------------------ */

function RatioBar() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Répartition des postes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Bar */}
          <div className="flex h-8 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="flex items-center justify-center bg-emerald-500 transition-all"
              style={{ width: `${pourvusPercent}%` }}
            >
              {pourvusPercent > 15 && (
                <span className="text-[10px] font-bold text-white">
                  {totalPourvus}
                </span>
              )}
            </div>
            <div
              className="flex items-center justify-center bg-red-400 transition-all"
              style={{ width: `${100 - pourvusPercent}%` }}
            >
              {100 - pourvusPercent > 15 && (
                <span className="text-[10px] font-bold text-white">
                  {totalVacants}
                </span>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                Pourvus ({totalPourvus})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-400" />
              <span className="text-xs text-muted-foreground">
                Vacants ({totalVacants})
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

export default function PostesBudgetairesPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Postes Budgétaires"
        description="Postes budgétaires par structure avec catégorie, échelon, salaire de référence et suivi de vacance."
        icon={Wallet}
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
          { label: "Postes Budgétaires" },
        ]}
      />

      {/* Summary KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          title="Total postes"
          value={totalPostes}
          icon={Wallet}
          color="teal"
        />
        <KpiCard
          title="Pourvus"
          value={totalPourvus}
          icon={CheckCircle2}
          trend={{ value: 2, label: "ce trimestre" }}
          color="green"
        />
        <KpiCard
          title="Vacants"
          value={totalVacants}
          icon={XCircle}
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

      {/* Visual Ratio Bar */}
      <RatioBar />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={
          mockD23.postes_budgetaires as unknown as Record<
            string,
            unknown
          >[]
        }
        searchable
        searchPlaceholder="Rechercher un poste..."
        title="Liste des postes budgétaires"
        pageSize={10}
      />
    </div>
  );
}
