"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderTree,
  Network,
  UserCheck,
  Briefcase,
  BookOpen,
  History,
  Building2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DomainHeader } from "@/components/admina-rh/domain/DomainHeader";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { containerVariants, itemVariants } from "@/components/admina-rh/animations";
import { mockD23 } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE = "/departements/administration-et-gestion-des-carrieres/d23";

/* ------------------------------------------------------------------ */
/*  KPI Calculations                                                   */
/* ------------------------------------------------------------------ */

const structuresActives = mockD23.structures.filter(
  (s) => s.statut === "actif"
).length;

const totalPostesBudgetaires = mockD23.postes_budgetaires.reduce(
  (s, p) => s + p.nombre_postes,
  0
);

const affectationsEnCours = mockD23.affectations.filter(
  (a) => a.statut === "en_cours"
).length;

const totalEffectifPrevu = mockD23.structures.reduce(
  (s, st) => s + st.effectif_prevu,
  0
);
const totalEffectifReel = mockD23.structures.reduce(
  (s, st) => s + st.effectif_reel,
  0
);
const tauxRemplissage =
  totalEffectifPrevu > 0
    ? ((totalEffectifReel / totalEffectifPrevu) * 100).toFixed(1)
    : "0";

/* ------------------------------------------------------------------ */
/*  Module Cards                                                       */
/* ------------------------------------------------------------------ */

const MODULE_CARDS = [
  {
    title: "Structures",
    icon: Network,
    href: `${BASE}/structures`,
    count: mockD23.structures.length,
    color: "#DC2626",
  },
  {
    title: "Affectations",
    icon: UserCheck,
    href: `${BASE}/affectations`,
    count: mockD23.affectations.length,
    color: "#0F766E",
  },
  {
    title: "Nomenclatures",
    icon: BookOpen,
    href: `${BASE}/nomenclatures`,
    count: mockD23.nomenclatures.length,
    color: "#DC2626",
  },
  {
    title: "Historique Structures",
    icon: History,
    href: `${BASE}/historique`,
    count: mockD23.historiqueStructures.length,
    color: "#0F766E",
  },
  {
    title: "Entités Organisationnelles",
    icon: Building2,
    href: `${BASE}/entites`,
    count: mockD23.entitesOrganisationnelles.length,
    color: "#DC2626",
  },
  {
    title: "Postes Budgétaires",
    icon: Wallet,
    href: `${BASE}/postes-budgetaires`,
    count: mockD23.postes_budgetaires.length,
    color: "#0F766E",
  },
];

/* ------------------------------------------------------------------ */
/*  Org Chart — 3-level tree from structures                            */
/* ------------------------------------------------------------------ */

function OrgChartPreview() {
  const root = mockD23.structures.find((s) => s.niveau === 1);
  const children = mockD23.structures.filter(
    (s) => s.type === "direction" && s.niveau === 2
  );
  const grandchildren = mockD23.structures.filter((s) => s.niveau === 3);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">Aperçu de l&#39;organigramme</h3>
          <p className="text-xs text-muted-foreground">
            3 premiers niveaux hiérarchiques
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            {/* Root — Niveau 1 */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-2 text-center dark:border-red-800 dark:bg-red-950/30">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">
                  {root?.code ?? "DG"}
                </p>
                <p className="text-xs font-medium text-red-900 dark:text-red-100">
                  {root?.nom ?? "Direction Générale"}
                </p>
                <p className="text-[10px] text-red-600/70 dark:text-red-400/70">
                  {root?.responsable ?? ""}
                </p>
              </div>

              {/* Vertical line down from root */}
              <div className="h-6 w-px bg-border" />

              {/* Horizontal connector line */}
              <div className="relative h-px w-full max-w-2xl bg-border">
                {/* Vertical lines down to children */}
                {children.map((_, idx) => {
                  const left =
                    children.length > 1
                      ? `${(idx / (children.length - 1)) * 100}%`
                      : "50%";
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 h-4 w-px -translate-x-px bg-border"
                      style={{ left }}
                    />
                  );
                })}
              </div>

              {/* Children — Niveau 2 */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {children.map((child) => {
                  const subs = grandchildren.filter(
                    (g) =>
                      g.nom.includes("RH") ||
                      g.nom.includes("Comptabilité")
                        ? child.code === "DA"
                        : child.code === "DT"
                  );
                  return (
                    <div
                      key={child.id}
                      className="flex flex-col items-center"
                    >
                      <div className="h-4 w-px bg-border" />
                      <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-center dark:border-teal-800 dark:bg-teal-950/30">
                        <p className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                          {child.code}
                        </p>
                        <p className="max-w-[10rem] text-xs font-medium text-teal-900 dark:text-teal-100">
                          {child.nom}
                        </p>
                      </div>

                      {/* Vertical line to grandchildren */}
                      {subs.length > 0 && (
                        <>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex gap-2">
                            {subs.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex flex-col items-center"
                              >
                                <div className="h-3 w-px bg-border" />
                                <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-center dark:border-gray-700 dark:bg-gray-900/40">
                                  <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                    {sub.code}
                                  </p>
                                  <p className="max-w-[7rem] text-[10px] text-gray-600 dark:text-gray-400">
                                    {sub.nom}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
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

export default function D23Dashboard() {
  return (
    <div className="space-y-6">
      <DomainHeader
        title="Organigramme"
        description="Structure hiérarchique (5 niveaux max), nomenclatures, entités organisationnelles, affectations et postes budgétaires."
        icon={FolderTree}
        color="red"
        breadcrumbs={[
          {
            label: "Département 1",
            href: "/departements/administration-et-gestion-des-carrieres",
          },
          { label: "D23 — Organigramme" },
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
          title="Structures actives"
          value={structuresActives}
          icon={Network}
          trend={{ value: 2, label: "ce semestre" }}
          color="red"
        />
        <KpiCard
          title="Postes budgétaires"
          value={totalPostesBudgetaires}
          icon={Wallet}
          trend={{ value: 3, label: "ce trimestre" }}
          color="teal"
        />
        <KpiCard
          title="Affectations en cours"
          value={affectationsEnCours}
          icon={UserCheck}
          trend={{ value: 1, label: "ce mois" }}
          color="green"
        />
        <KpiCard
          title="Taux de remplissage"
          value={`${tauxRemplissage}%`}
          icon={Briefcase}
          trend={{ value: 1.5, label: "vs mois dernier" }}
          color="orange"
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
                      <p className="text-sm font-semibold">{card.title}</p>
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

      {/* Org Chart Preview */}
      <OrgChartPreview />
    </div>
  );
}
