'use client';

import { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD02, type D02Contrat } from '@/lib/mock-data';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';

/* ------------------------------------------------------------------ */
/*  Status color override for contrat statut                           */
/* ------------------------------------------------------------------ */

const CUSTOM_STATUS_MAP: Record<string, string> = {
  actif: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  termine: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  suspendu: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
  en_negociation: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
};

function ContratStatusBadge({ status }: { status: string }) {
  const style = CUSTOM_STATUS_MAP[status] ?? '';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<D02Contrat>[] = [
  { key: 'id', label: 'N° Contrat', render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8).toUpperCase()}</span> },
  { key: 'employe', label: 'Employé' },
  { key: 'type_contrat', label: 'Type' },
  { key: 'date_debut', label: 'Date Début' },
  { key: 'date_fin', label: 'Date Fin' },
  { key: 'salaire_base', label: 'Salaire Base' },
  { key: 'statut', label: 'Statut', render: (row) => <ContratStatusBadge status={row.statut} /> },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContratsPage() {
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    let data = mockD02.contrats as unknown as Record<string, unknown>[];
    if (filterStatut !== 'all') {
      data = data.filter((r) => r.statut === filterStatut);
    }
    if (filterType !== 'all') {
      data = data.filter((r) => r.type_contrat === filterType);
    }
    return data;
  }, [filterStatut, filterType]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Contrats de Travail"
        description="Gestion des contrats CDI, CDD, Stage, Intérim et Consultant."
        icon={FileText}
        color="teal"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2', href: '/departements/administration-et-gestion-des-carrieres/d2' },
          { label: 'Contrats' },
        ]}
      />

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="en_negociation">En négociation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type Contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
            <SelectItem value="Stage">Stage</SelectItem>
            <SelectItem value="Interim">Intérim</SelectItem>
            <SelectItem value="Consultant">Consultant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={filtered}
        searchable
        searchPlaceholder="Rechercher un contrat..."
        title="Liste des contrats"
        pageSize={10}
      />
    </div>
  );
}
