'use client';

import { CalendarDays, Clock, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { WorkflowTimeline } from '@/components/admina-rh/domain/WorkflowTimeline';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12, type D12Conge } from '@/lib/mock-data';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  KPI data                                                           */
/* ------------------------------------------------------------------ */

const conges = mockD12.conges;
const enAttente = conges.filter((c) => c.statut === 'en_attente').length;
const approuvees = conges.filter((c) => c.statut === 'approuve').length;
const rejetees = conges.filter((c) => c.statut === 'rejete').length;
const soldeMoyen = Math.round(conges.reduce((s, c) => s + c.solde_apres, 0) / conges.length);

const KPI_DATA = [
  { title: 'Demandes en attente', value: enAttente, icon: Clock, trend: { value: -12, label: 'vs mois dernier' }, color: 'orange' as const },
  { title: 'Approuvées ce mois', value: approuvees, icon: CheckCircle2, trend: { value: 8, label: 'vs mois dernier' }, color: 'green' as const },
  { title: 'Rejetées', value: rejetees, icon: XCircle, trend: { value: -5, label: 'vs mois dernier' }, color: 'red' as const },
  { title: 'Solde moyen restant', value: `${soldeMoyen} j`, icon: BarChart3, trend: { value: 2, label: 'vs mois dernier' }, color: 'teal' as const },
];

/* ------------------------------------------------------------------ */
/*  Table columns                                                      */
/* ------------------------------------------------------------------ */

const APPROBATEURS = ['Mme Nkoulou M.C.', 'M. Fotso A.', 'M. Tchinda G.'];

const columns: Column<D12Conge>[] = [
  { key: 'employe', label: 'Employé' },
  { key: 'type_conge', label: 'Type Congé' },
  { key: 'date_debut', label: 'Date Début' },
  { key: 'date_fin', label: 'Date Fin' },
  { key: 'nb_jours', label: 'Nb Jours' },
  { key: 'statut', label: 'Statut' },
  { key: 'id', label: 'Approbateur', render: (_, i) => APPROBATEURS[i % APPROBATEURS.length] },
];

/* ------------------------------------------------------------------ */
/*  Workflow steps                                                     */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = [
  { label: 'Demande soumise', status: 'completed' as const, description: 'Le collaborateur remplit la demande de congé.', date: '2025-06-15' },
  { label: 'Validation N+1', status: 'completed' as const, description: 'Le supérieur hiérarchique valide la demande.', date: '2025-06-16' },
  { label: 'Validation RH', status: 'current' as const, description: 'Le service RH vérifie le solde et la conformité.' },
  { label: 'Notification employé', status: 'pending' as const, description: 'L\'employé reçoit la confirmation par email.' },
  { label: 'Mise à jour planning', status: 'pending' as const, description: 'Le planning et le pointage sont mis à jour.' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CongesPage() {
  return (
    <div className='space-y-6'>
      <DomainHeader
        title='Gestion des Congés'
        description="Suivi des demandes de congés, validation hiérarchique et gestion des soldes."
        icon={CalendarDays}
        color='teal'
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2', href: '/departements/administration-et-gestion-des-carrieres/d2' },
          { label: 'Congés' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
      >
        {KPI_DATA.map((kpi) => (
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

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Tableau principal */}
        <div className='lg:col-span-2'>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={conges as unknown as Record<string, unknown>[]}
            searchable
            searchPlaceholder='Rechercher un congé...'
            title='Liste des demandes de congé'
            pageSize={10}
          />
        </div>

        {/* Workflow de validation */}
        <div>
          <div className='rounded-xl border bg-card p-6'>
            <h3 className='mb-4 text-sm font-semibold'>Workflow de validation</h3>
            <WorkflowTimeline steps={WORKFLOW_STEPS} />
          </div>
        </div>
      </div>
    </div>
  );
}
