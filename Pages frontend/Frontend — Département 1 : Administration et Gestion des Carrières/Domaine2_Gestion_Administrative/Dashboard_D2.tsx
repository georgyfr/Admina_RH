'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  FileSignature,
  FolderOpen,
  CreditCard,
  HeartPulse,
  CalendarDays,
  Clock,
  Timer,
  CalendarRange,
  Wallet,
  Receipt,
  Landmark,
  Gavel,
  Stethoscope,
  LogOut,
  Archive,
  Bell,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  TrendingUp,
  IdCard,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { PhaseTabs } from '@/components/admina-rh/domain/PhaseTabs';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';

/* ------------------------------------------------------------------ */
/*  Phase definitions                                                 */
/* ------------------------------------------------------------------ */

const PHASES = [
  { id: 'identification', label: 'Identification', icon: IdCard, color: '#1B4F72', count: 62 },
  { id: 'contractualisation', label: 'Contractualisation', icon: FileText, color: '#2E86C1', count: 27 },
  { id: 'presence', label: 'Présence', icon: UserCheck, color: '#27AE60', count: 24 },
  { id: 'paie', label: 'Paie', icon: Wallet, color: '#F39C12', count: 22 },
  { id: 'archivage', label: 'Archivage', icon: Archive, color: '#8E44AD', count: 15 },
];

/* ------------------------------------------------------------------ */
/*  Phase card definitions                                             */
/* ------------------------------------------------------------------ */

interface PhaseCardDef {
  code: string;
  label: string;
  icon: typeof Users;
  href: string;
  tableCount: number;
  recordCount: number;
  color: string;
}

const BASE_D2 = '/departements/administration-et-gestion-des-carrieres/d2';

const PHASE_CARDS: Record<string, PhaseCardDef[]> = {
  identification: [],
  contractualisation: [
    { code: 'D2.1', label: 'Contrats', icon: FileText, href: `${BASE_D2}/contrats`, tableCount: 1, recordCount: 8, color: '#2E86C1' },
    { code: 'D2.2', label: 'Avenants', icon: FileSignature, href: '#', tableCount: 1, recordCount: 5, color: '#2E86C1' },
    { code: 'D2.3', label: 'Documents', icon: FolderOpen, href: `${BASE_D2}/documents`, tableCount: 1, recordCount: 6, color: '#2E86C1' },
    { code: 'D2.4', label: 'Bancaires', icon: CreditCard, href: '#', tableCount: 1, recordCount: 4, color: '#2E86C1' },
    { code: 'D2.5', label: 'Mutuelle', icon: HeartPulse, href: '#', tableCount: 1, recordCount: 3, color: '#2E86C1' },
    { code: 'D2.6', label: 'Permis', icon: ShieldCheck, href: '#', tableCount: 1, recordCount: 2, color: '#2E86C1' },
  ],
  presence: [
    { code: 'D2.7', label: 'Congés', icon: CalendarDays, href: `${BASE_D2}/conges`, tableCount: 1, recordCount: 8, color: '#27AE60' },
    { code: 'D2.8', label: 'Absences', icon: Clock, href: '#', tableCount: 1, recordCount: 6, color: '#27AE60' },
    { code: 'D2.9', label: 'Heures Supplémentaires', icon: Timer, href: '#', tableCount: 1, recordCount: 12, color: '#27AE60' },
    { code: 'D2.10', label: 'Pointage', icon: CalendarRange, href: '#', tableCount: 1, recordCount: 10, color: '#27AE60' },
    { code: 'D2.11', label: 'Planning', icon: CalendarRange, href: '#', tableCount: 1, recordCount: 6, color: '#27AE60' },
  ],
  paie: [
    { code: 'D2.12', label: 'Paie', icon: Receipt, href: '#', tableCount: 1, recordCount: 8, color: '#F39C12' },
    { code: 'D2.13', label: 'Déclarations', icon: Landmark, href: '#', tableCount: 1, recordCount: 6, color: '#F39C12' },
    { code: 'D2.14', label: 'Prêts & Avances', icon: Wallet, href: '#', tableCount: 1, recordCount: 6, color: '#F39C12' },
    { code: 'D2.15', label: 'Sanctions', icon: Gavel, href: '#', tableCount: 1, recordCount: 4, color: '#F39C12' },
    { code: 'D2.16', label: 'Visites Médicales', icon: Stethoscope, href: '#', tableCount: 1, recordCount: 3, color: '#F39C12' },
  ],
  archivage: [
    { code: 'D2.17', label: 'Départs', icon: LogOut, href: '#', tableCount: 1, recordCount: 3, color: '#8E44AD' },
    { code: 'D2.18', label: 'Archivage', icon: Archive, href: '#', tableCount: 1, recordCount: 15, color: '#8E44AD' },
    { code: 'D2.19', label: 'Rappels', icon: Bell, href: '#', tableCount: 1, recordCount: 3, color: '#8E44AD' },
    { code: 'D2.20', label: 'PDCA', icon: RotateCcw, href: '#', tableCount: 1, recordCount: 2, color: '#8E44AD' },
    { code: 'D2.21', label: 'Non-Conformités', icon: AlertCircle, href: '#', tableCount: 1, recordCount: 1, color: '#8E44AD' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Identification phase KPIs                                          */
/* ------------------------------------------------------------------ */

const ID_KPI_DATA = [
  { title: 'Employés actifs', value: 62, icon: Users, trend: { value: 3.2, label: 'vs mois dernier' }, color: 'teal' as const },
  { title: 'CDI en cours', value: 38, icon: ShieldCheck, trend: { value: 2, label: 'vs T-1' }, color: 'green' as const },
  { title: 'CDD en cours', value: 12, icon: FileText, trend: { value: -8, label: 'vs T-1' }, color: 'orange' as const },
  { title: 'Nouveaux ce mois', value: 4, icon: UserPlus, trend: { value: 15, label: 'vs mois dernier' }, color: 'blue' as const },
];

/* ------------------------------------------------------------------ */
/*  Phase content renderer                                             */
/* ------------------------------------------------------------------ */

function PhaseContent({ phaseId }: { phaseId: string }) {
  if (phaseId === 'identification') {
    return (
      <div className="space-y-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ID_KPI_DATA.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              trend={kpi.trend}
              color={kpi.color}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href={`${BASE_D2}/employes`}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#1B4F72]/10 ring-2 ring-[#1B4F72]/20">
                    <Users className="size-6 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Liste des employés</h3>
                    <p className="text-sm text-muted-foreground">
                      Consulter et gérer le registre complet du personnel
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    );
  }

  const cards = PHASE_CARDS[phaseId] ?? [];
  if (cards.length === 0) return null;

  const phaseColor = PHASES.find((p) => p.id === phaseId)?.color ?? '#0F766E';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const content = (
          <motion.div
            key={card.code}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
                    <Icon className="size-5" style={{ color: card.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold" style={{ borderColor: `${card.color}40`, color: card.color }}>
                        {card.code}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{card.label}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {card.tableCount} table
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        {card.recordCount} enregistrements
                      </span>
                    </div>
                  </div>
                  {card.href !== '#' && (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

        if (card.href === '#') return content;
        return <Link key={card.code} href={card.href}>{content}</Link>;
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function D2Dashboard() {
  const [activePhase, setActivePhase] = useState('identification');

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Gestion Administrative du Personnel"
        description="Coeur du registre du personnel : données de base, contrats, documents, coordonnées bancaires, mutuelle, prêts et visites médicales."
        icon={Users}
        color="teal"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2 — Gestion Administrative du Personnel' },
        ]}
      />

      <PhaseTabs
        phases={PHASES}
        activePhase={activePhase}
        onPhaseChange={setActivePhase}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <PhaseContent phaseId={activePhase} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
