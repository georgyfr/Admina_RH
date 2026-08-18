'use client';

import { useState, useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { mockD02, type D02Document } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status color override for document statut                         */
/* ------------------------------------------------------------------ */

const CUSTOM_STATUS_MAP: Record<string, string> = {
  actif: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  expire: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  en_cours: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
};

function DocumentStatusBadge({ status }: { status: string }) {
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

const columns: Column<D02Document>[] = [
  { key: 'type_document', label: 'Type Document' },
  { key: 'id', label: 'N° Document', render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8).toUpperCase()}</span> },
  { key: 'date_emission', label: 'Date Émission' },
  { key: 'date_expiration', label: 'Date Expiration' },
  { key: 'statut', label: 'Validité', render: (row) => <DocumentStatusBadge status={row.statut} /> },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocumentsPage() {
  const [filterStatut, setFilterStatut] = useState('all');

  const filtered = useMemo(() => {
    let data = mockD02.documents as unknown as Record<string, unknown>[];
    if (filterStatut !== 'all') {
      data = data.filter((r) => r.statut === filterStatut);
    }
    return data;
  }, [filterStatut]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Documents Administratifs"
        description="Documents des employés : CNI, passeport, diplômes, certificats, attestations."
        icon={FolderOpen}
        color="teal"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2', href: '/departements/administration-et-gestion-des-carrieres/d2' },
          { label: 'Documents' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Validité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les validités</SelectItem>
            <SelectItem value="actif">Valide</SelectItem>
            <SelectItem value="expire">Expiré</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={filtered}
        searchable
        searchPlaceholder="Rechercher un document..."
        title="Liste des documents"
        pageSize={10}
      />
    </div>
  );
}
