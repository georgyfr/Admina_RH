"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import {
  containerVariants,
  itemVariants,
} from "@/components/admina-rh/animations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Indicator data                                                     */
/* ------------------------------------------------------------------ */

interface IndicateurCard {
  id: string;
  nom: string;
  valeur: number;
  unite: string;
  objectif: number;
  tendance: "en_hausse" | "en_baisse" | "stable";
  statut: "on_track" | "at_risk" | "off_track";
  description: string;
}

const indicateurs: IndicateurCard[] = [
  {
    id: "1",
    nom: "Taux de turn-over",
    valeur: 8.2,
    unite: "%",
    objectif: 10,
    tendance: "en_baisse",
    statut: "on_track",
    description:
      "Proportion de départs et entrées par rapport à l'effectif moyen sur 12 mois.",
  },
  {
    id: "2",
    nom: "Taux d'absentéisme",
    valeur: 4.1,
    unite: "%",
    objectif: 3,
    tendance: "en_hausse",
    statut: "off_track",
    description:
      "Jours d'absence non planifiés rapportés aux jours théoriques travaillés.",
  },
  {
    id: "3",
    nom: "Âge moyen",
    valeur: 38,
    unite: "ans",
    objectif: 40,
    tendance: "en_hausse",
    statut: "on_track",
    description:
      "Moyenne d'âge de l'ensemble des agents en activité.",
  },
  {
    id: "4",
    nom: "Ancienneté moyenne",
    valeur: 6.3,
    unite: "ans",
    objectif: 7,
    tendance: "en_hausse",
    statut: "on_track",
    description:
      "Durée moyenne de présence dans l'organisation.",
  },
  {
    id: "5",
    nom: "Ratio d'encadrement",
    valeur: 8.5,
    unite: ":1",
    objectif: 10,
    tendance: "en_hausse",
    statut: "at_risk",
    description:
      "Nombre moyen de collaborateurs par encadrant.",
  },
  {
    id: "6",
    nom: "Taux de formation",
    valeur: 72,
    unite: "%",
    objectif: 80,
    tendance: "en_hausse",
    statut: "at_risk",
    description:
      "Proportion d'agents ayant suivi au moins une formation sur l'année.",
  },
  {
    id: "7",
    nom: "Coût moyen / employé",
    valeur: 485000,
    unite: "FCFA",
    objectif: 500000,
    tendance: "en_hausse",
    statut: "on_track",
    description:
      "Coût salarial total divisé par l'effectif.",
  },
  {
    id: "8",
    nom: "Satisfaction",
    valeur: 76,
    unite: "%",
    objectif: 85,
    tendance: "en_hausse",
    statut: "at_risk",
    description:
      "Score de satisfaction interne mesuré par enquête annuelle.",
  },
];

/* ------------------------------------------------------------------ */
/*  Status / Trend helpers                                             */
/* ------------------------------------------------------------------ */

const STATUT_CONFIG = {
  on_track: {
    label: "Sur la bonne voie",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400 dark:bg-emerald-500",
  },
  at_risk: {
    label: "À surveiller",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-400 dark:bg-amber-500",
  },
  off_track: {
    label: "Hors objectif",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-400 dark:bg-red-500",
  },
} as const;

type StatutKey = keyof typeof STATUT_CONFIG;

const TENDANCE_CONFIG = {
  en_hausse: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
  en_baisse: { icon: TrendingDown, color: "text-red-600 dark:text-red-400" },
  stable: { icon: Minus, color: "text-muted-foreground" },
} as const;

/* ------------------------------------------------------------------ */
/*  Format value with unit                                             */
/* ------------------------------------------------------------------ */

function formatValue(v: number, unite: string): string {
  if (unite === "FCFA") {
    return `${v.toLocaleString("fr-FR")} ${unite}`;
  }
  if (unite === ":1") {
    return `${v}:1`;
  }
  return `${v}${unite}`;
}

/* ------------------------------------------------------------------ */
/*  Progress bar (value vs objective)                                  */
/* ------------------------------------------------------------------ */

function ProgressBar({
  value,
  objectif,
  statut,
}: {
  value: number;
  objectif: number;
  statut: StatutKey;
}) {
  const pct = Math.min(100, (value / objectif) * 100);
  const cfg = STATUT_CONFIG[statut];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>Actuel</span>
        <span>Objectif</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", cfg.bar)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Indicator Card                                              */
/* ------------------------------------------------------------------ */

function IndicateurRow({ indicateur }: { indicateur: IndicateurCard }) {
  const [expanded, setExpanded] = useState(false);
  const sConf = STATUT_CONFIG[indicateur.statut];
  const tConf = TENDANCE_CONFIG[indicateur.tendance];
  const TIcon = tConf.icon;

  /* Simulated historical data */
  const history = [6, 5, 4, 3, 2, 1].map((_, i) => ({
    mois: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"][i],
    valeur: Math.round(indicateur.valeur * (0.9 + Math.random() * 0.2)),
  }));
  const maxHist = Math.max(
    ...history.map((h) => h.valeur),
    indicateur.valeur
  );

  return (
    <div>
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className={cn("cursor-pointer transition-all hover:shadow-md border", sConf.border)}
          onClick={() => setExpanded(!expanded)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{indicateur.nom}</h3>
                  <div className="flex items-center gap-1">
                    <div className={cn("size-1.5 rounded-full", sConf.dot)} />
                    <span className={cn("text-[10px] font-medium", sConf.text)}>
                      {sConf.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold tracking-tight">
                  {formatValue(indicateur.valeur, indicateur.unite)}
                </p>
                <div className={cn("flex items-center justify-end gap-1", tConf.color)}>
                  <TIcon className="size-3" />
                  <span className="text-[10px] font-medium">
                    {indicateur.tendance === "en_hausse"
                      ? "Hausse"
                      : indicateur.tendance === "en_baisse"
                        ? "Baisse"
                        : "Stable"}
                  </span>
                </div>
              </div>
            </div>
            <ProgressBar
              value={indicateur.valeur}
              objectif={indicateur.objectif}
              statut={indicateur.statut}
            />
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className={cn("mt-3 border-2", sConf.bg, sConf.border)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold">
                      Historique — {indicateur.nom}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {indicateur.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="flex items-end gap-2 h-24">
                  {history.map((h) => (
                    <div
                      key={h.mois}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {h.valeur}
                      </span>
                      <div className="w-full bg-muted rounded-sm overflow-hidden flex-1 flex items-end">
                        <div
                          className={cn("w-full rounded-sm", sConf.bar)}
                          style={{ height: `${(h.valeur / maxHist) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {h.mois}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Objectif :</span>
                    <span className="font-semibold">
                      {formatValue(indicateur.objectif, indicateur.unite)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Statut :</span>
                    <span className={cn("font-semibold", sConf.text)}>
                      {sConf.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function IndicateursPage() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Indicateurs d'Effectifs"
        description="KPI de suivi RH : turn-over, absentéisme, ancienneté, encadrement, formation et satisfaction."
        icon={Activity}
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
          { label: "Indicateurs Effectifs" },
        ]}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {indicateurs.map((ind) => (
          <IndicateurRow key={ind.id} indicateur={ind} />
        ))}
      </motion.div>
    </div>
  );
}
