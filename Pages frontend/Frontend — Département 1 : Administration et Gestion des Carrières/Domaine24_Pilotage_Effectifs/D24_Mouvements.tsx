"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  UserPlus,
  UserMinus,
  Plus,
  Minus,
} from "lucide-react";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { DataTable, type Column } from "@/components/admina-rh/domain/DataTable";
import { StatusBadge } from "@/components/admina-rh/domain/StatusBadge";
import {
  containerVariants,
  itemVariants,
} from "@/components/admina-rh/animations";
import { mockD24, type D24MouvementEffectif } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  KPI Calculations                                                   */
/* ------------------------------------------------------------------ */

const entrees = mockD24.mouvements.filter(
  (m) => m.type_mouvement === "embauche" || m.type_mouvement === "promotion"
).length;
const sorties = mockD24.mouvements.filter(
  (m) => m.type_mouvement === "depart"
).length;
const soldeNet = entrees - sorties;
const turnover = "8.2";

/* ------------------------------------------------------------------ */
/*  Type Mouvement Badge                                               */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<string, string> = {
  embauche:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  entree:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  depart:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  sortie:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  mutation_interne:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  transfert:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  promotion:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
};

const TYPE_LABELS: Record<string, string> = {
  embauche: "Embauche",
  entree: "Entrée",
  depart: "Départ",
  sortie: "Sortie",
  mutation_interne: "Mutation interne",
  transfert: "Transfert",
  promotion: "Promotion",
};

function TypeMouvementBadge({
  type,
}: {
  type: string;
}) {
  const key = type.toLowerCase();
  const style =
    TYPE_STYLES[key] ?? TYPE_STYLES.transfert;
  const label = TYPE_LABELS[key] ?? type;
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
/*  Extended data (add dept source/dest/poste)                         */
/* ------------------------------------------------------------------ */

const POSTES_POOL = [
  "Chargé de Recrutement",
  "Développeur Full Stack",
  "Comptable Senior",
  "Agent Administratif",
  "Chef de Projet IT",
  "Gestionnaire de Paie",
  "Technicien Réseau",
  "Responsable Logistique",
];

const mouvementsExt = mockD24.mouvements.map((m, i) => ({
  ...m,
  departement_source:
    m.type_mouvement === "mutation_interne"
      ? ["Service RH", "Service Comptabilité", "Service Informatique"][i % 3]
      : m.type_mouvement === "depart"
        ? m.structure
        : "—",
  departement_destination:
    m.type_mouvement === "mutation_interne" || m.type_mouvement === "embauche" || m.type_mouvement === "promotion"
      ? m.structure
      : "—",
  poste: POSTES_POOL[i % POSTES_POOL.length],
}));

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<Record<string, unknown>>[] = [
  {
    key: "employe",
    label: "Employé",
    render: (row) => (
      <span className="font-medium text-xs">
        {row.employe as string}
      </span>
    ),
  },
  {
    key: "type_mouvement",
    label: "Type Mouvement",
    render: (row) => (
      <TypeMouvementBadge type={row.type_mouvement as string} />
    ),
  },
  {
    key: "date_mouvement",
    label: "Date",
  },
  {
    key: "departement_source",
    label: "Dép. Source",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.departement_source as string}
      </span>
    ),
  },
  {
    key: "departement_destination",
    label: "Dép. Destination",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.departement_destination as string}
      </span>
    ),
  },
  {
    key: "motif",
    label: "Motif",
    render: (row) => (
      <span className="text-xs">{row.motif as string}</span>
    ),
  },
  {
    key: "poste",
    label: "Poste",
    render: (row) => (
      <span className="text-xs font-medium">
        {row.poste as string}
      </span>
    ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (row) => (
      <StatusBadge status={row.statut as string} size="sm" />
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MouvementsPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Mouvements d'Effectifs"
        description="Suivi des entrées, sorties, mutations internes et promotions au sein de l'organisation."
        icon={ArrowLeftRight}
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
          { label: "Mouvements Effectifs" },
        ]}
      />

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          title="Entrées période"
          value={entrees}
          icon={UserPlus}
          trend={{ value: 15, label: "vs T-1" }}
          color="green"
        />
        <KpiCard
          title="Sorties période"
          value={sorties}
          icon={UserMinus}
          trend={{ value: -10, label: "vs T-1" }}
          color="red"
        />
        <KpiCard
          title="Solde net"
          value={`${soldeNet >= 0 ? "+" : ""}${soldeNet}`}
          icon={Plus}
          trend={{ value: 5, label: "ce trimestre" }}
          color="teal"
        />
        <KpiCard
          title="Turn-over"
          value={`${turnover}%`}
          icon={Minus}
          trend={{ value: -0.5, label: "vs mois dernier" }}
          color="orange"
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
          data={mouvementsExt as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Rechercher un mouvement..."
          title="Historique des mouvements"
          pageSize={10}
        />
      </motion.div>
    </div>
  );
}
