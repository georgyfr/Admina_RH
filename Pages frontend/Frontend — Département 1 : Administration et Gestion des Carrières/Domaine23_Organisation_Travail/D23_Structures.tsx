"use client";

import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { DataTable, type Column } from "@/components/admina-rh/domain/DataTable";
import { StatusBadge } from "@/components/admina-rh/domain/StatusBadge";
import { mockD23, type D23Structure } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Niveau Badge (gradient 1-5)                                       */
/* ------------------------------------------------------------------ */

const NIVEAU_STYLES: Record<number, string> = {
  1: "bg-gray-800 text-white border-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-200",
  2: "bg-gray-600 text-white border-gray-500 dark:bg-gray-300 dark:text-gray-900 dark:border-gray-400",
  3: "bg-gray-400 text-gray-900 border-gray-300 dark:bg-gray-500 dark:text-white dark:border-gray-600",
  4: "bg-gray-200 text-gray-800 border-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
  5: "bg-gray-100 text-gray-700 border-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

function NiveauBadge({ niveau }: { niveau: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
        NIVEAU_STYLES[niveau] ?? NIVEAU_STYLES[3]
      )}
    >
      Niv. {niveau}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Type Badge (direction/service/department/unite/pole)               */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<string, string> = {
  direction:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  service:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  departement:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  equipe:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
  pole:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

function TypeBadge({ type }: { type: string }) {
  const style =
    TYPE_STYLES[type] ?? TYPE_STYLES.service;
  const label =
    type === "departement"
      ? "Département"
      : type.charAt(0).toUpperCase() + type.slice(1);
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
/*  Parent mapping (from structures data)                             */
/* ------------------------------------------------------------------ */

const PARENT_MAP: Record<string, string> = {
  DA: "Direction Générale",
  DT: "Direction Générale",
  SRH: "Direction Administrative et RH",
  SCO: "Direction Administrative et RH",
  SIT: "Direction Technique",
  EQD: "Service Informatique",
  PLG: "Direction Administrative et RH",
};

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D23Structure>[] = [
  {
    key: "code",
    label: "Code",
    render: (row) => (
      <span className="font-mono text-xs font-bold text-muted-foreground">
        {row.code}
      </span>
    ),
  },
  {
    key: "nom",
    label: "Libellé",
    render: (row) => <span className="font-medium">{row.nom}</span>,
  },
  {
    key: "niveau",
    label: "Niveau",
    render: (row) => <NiveauBadge niveau={row.niveau} />,
  },
  {
    key: "parent",
    label: "Structure Parent",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {PARENT_MAP[row.code as string] ?? "—"}
      </span>
    ),
  },
  {
    key: "type",
    label: "Type",
    render: (row) => <TypeBadge type={row.type} />,
  },
  {
    key: "responsable",
    label: "Responsable",
    render: (row) => <span className="text-xs">{row.responsable}</span>,
  },
  {
    key: "effectif_reel",
    label: "Effectif",
    render: (row) => (
      <div className="text-center">
        <span className="text-xs font-semibold">
          {row.effectif_reel}
        </span>
        <span className="text-[10px] text-muted-foreground">
          /{row.effectif_prevu}
        </span>
      </div>
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

export default function StructuresPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Structures Organisationnelles"
        description="Unités organisationnelles hiérarchiques (direction, département, service, équipe, pôle) avec 5 niveaux max."
        icon={Network}
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
          { label: "Structures" },
        ]}
      />

      <DataTable
        columns={columns}
        data={
          mockD23.structures as unknown as Record<
            string,
            unknown
          >[]
        }
        searchable
        searchPlaceholder="Rechercher une structure..."
        title="Liste des structures"
        pageSize={10}
      />
    </div>
  );
}
