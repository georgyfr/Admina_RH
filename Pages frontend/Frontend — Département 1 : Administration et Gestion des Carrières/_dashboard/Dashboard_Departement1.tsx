"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Banknote,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  CalendarClock,
  Clock,
  Network,
  BarChart3,
  Briefcase,
  ArrowRight,
  Layers,
  Table2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/admina-rh/domain/KpiCard";
import { containerVariants, itemVariants } from "@/components/admina-rh/animations";
import { DEPT1_SERVICES } from "@/lib/data/dept1-schema";

/* ------------------------------------------------------------------ */
/*  Domain quick-access mapping                                       */
/* ------------------------------------------------------------------ */

interface DomainLink {
  code: string;
  name: string;
  icon: typeof Users;
  href: string;
  tableCount: number;
  description: string;
}

const BASE = "/departements/administration-et-gestion-des-carrieres";

const DOMAINS: DomainLink[] = [
  { code: "D2", name: "Gestion Administrative du Personnel", icon: Users, href: `${BASE}/d2`, tableCount: 8, description: "Dossier employé, contrats, documents" },
  { code: "D5", name: "Gestion des Salaires", icon: Wallet, href: `${BASE}/d5`, tableCount: 8, description: "Paie, cotisations, bulletins" },
  { code: "D12", name: "Administration du Personnel", icon: CalendarClock, href: `${BASE}/d12`, tableCount: 7, description: "Congés, absences, entrées/sorties" },
  { code: "D4", name: "Gestion du Temps", icon: Clock, href: `${BASE}/d4`, tableCount: 10, description: "Pointage, planning, équilibre VP" },
  { code: "D23", name: "Organigramme", icon: Network, href: `${BASE}/d23`, tableCount: 8, description: "Structures, affectations" },
  { code: "D24", name: "Effectifs", icon: BarChart3, href: `${BASE}/d24`, tableCount: 9, description: "Mouvements, indicateurs sociaux" },
  { code: "D21", name: "Classification et Cartographie des Emplois", icon: Briefcase, href: `${BASE}/d21`, tableCount: 8, description: "Référentiel métiers, fiches de poste" },
];

/* ------------------------------------------------------------------ */
/*  KPI data (statique pour l'instant)                                */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  { title: "Effectif total", value: 62, icon: Users, trend: { value: 3.2, label: "vs mois dernier" }, color: "teal" as const },
  { title: "Contrats en vigueur", value: 54, icon: FileText, trend: { value: 1.5, label: "vs mois dernier" }, color: "green" as const },
  { title: "Masse salariale", value: 48500000, icon: Banknote, trend: { value: 2.1, label: "vs mois dernier" }, color: "teal" as const, subtitle: "montant mensuel" },
  { title: "Taux de présence", value: "94,2%", icon: UserCheck, trend: { value: 0.8, label: "vs mois dernier" }, color: "green" as const },
  { title: "Documents conformes", value: "87%", icon: ShieldCheck, trend: { value: 5, label: "vs mois dernier" }, color: "blue" as const },
  { title: "Rappels en retard", value: 3, icon: AlertTriangle, trend: { value: -25, label: "vs mois dernier" }, color: "red" as const },
];

/* ------------------------------------------------------------------ */
/*  Service summary data                                               */
/* ------------------------------------------------------------------ */

const SERVICE_ICONS: Record<string, typeof Users> = {
  "1.1": Users,
  "1.2": Clock,
  "1.3": Briefcase,
};

const SERVICE_DOMAINS: Record<string, number> = {
  "1.1": 3,
  "1.2": 3,
  "1.3": 1,
};

const SERVICE_TABLES: Record<string, number> = {
  "1.1": 23,
  "1.2": 27,
  "1.3": 8,
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Dept1Dashboard() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Département 1
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Administration et Gestion des Carrières — Tableau de bord
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {KPI_DATA.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            color={kpi.color}
            subtitle={kpi.subtitle}
          />
        ))}
      </motion.div>

      {/* Résumé par service */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Résumé par service</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-3"
        >
          {DEPT1_SERVICES.map((svc) => {
            const Icon = SERVICE_ICONS[svc.code] ?? Layers;
            return (
              <motion.div key={svc.code} variants={itemVariants}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 ring-1 ring-teal-200 dark:bg-teal-950/40 dark:ring-teal-800">
                        <Icon className="size-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          Service {svc.code}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {svc.name}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4 pt-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Layers className="size-3.5" />
                      <span className="font-semibold text-foreground">
                        {SERVICE_DOMAINS[svc.code]}
                      </span>{" "}
                      domaine{SERVICE_DOMAINS[svc.code]! > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Table2 className="size-3.5" />
                      <span className="font-semibold text-foreground">
                        {SERVICE_TABLES[svc.code]}
                      </span>{" "}
                      tables
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Accès rapide aux domaines */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Accès rapide aux domaines</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <motion.div key={domain.code} variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Link href={domain.href}>
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 ring-2 ring-teal-200 dark:bg-teal-950/40 dark:ring-teal-800">
                          <Icon className="size-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold text-teal-700 border-teal-200 dark:text-teal-400 dark:border-teal-800">
                              {domain.code}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {domain.tableCount} tables
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium leading-tight line-clamp-2">
                            {domain.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {domain.description}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
