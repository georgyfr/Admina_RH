'use client';

import { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockD04, type D04Planning } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateFr(val: string): string {
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

const TYPE_LABELS: Record<string, string> = {
  hebdomadaire: 'Hebdomadaire',
  mensuel: 'Mensuel',
  rotation: 'Rotation',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PlanningsPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  const filtered = useMemo(() => {
    let data = mockD04.plannings;
    if (filterType !== 'all') {
      data = data.filter((p) => p.type_planning === filterType);
    }
    if (filterStatut !== 'all') {
      data = data.filter((p) => p.statut === filterStatut);
    }
    return data;
  }, [filterType, filterStatut]);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'employe',
      label: 'Employé',
    },
    {
      key: 'type_planning',
      label: 'Type Planning',
      render: (row) => TYPE_LABELS[String(row.type_planning)] ?? String(row.type_planning),
    },
    {
      key: 'date_debut',
      label: 'Date Début',
      render: (row) => formatDateFr(String(row.date_debut)),
    },
    {
      key: 'date_fin',
      label: 'Date Fin',
      render: (row) => formatDateFr(String(row.date_fin)),
    },
    {
      key: 'horaire_debut',
      label: 'Horaire Début',
      render: () => '07:30',
    },
    {
      key: 'horaire_fin',
      label: 'Horaire Fin',
      render: () => '16:30',
    },
    {
      key: 'nb_heures_prevues',
      label: 'Nb Heures Prévues',
      render: (row) => `${Number(row.nb_heures_prevues).toFixed(1)} h`,
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <StatusBadge status={String(row.statut)} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Plannings"
        description="Plannings hebdomadaires, mensuels et par rotation avec horaires par défaut."
        icon={CalendarDays}
        color="blue"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D4 - Gestion du Temps', href: '/departements/administration-et-gestion-des-carrieres/d4' },
          { label: 'Plannings' },
        ]}
      />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue placeholder="Type planning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
            <SelectItem value="mensuel">Mensuel</SelectItem>
            <SelectItem value="rotation">Rotation</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="publie">Publié</SelectItem>
            <SelectItem value="archive">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un planning..."
        title="Liste des plannings"
      />
    </div>
  );
}
