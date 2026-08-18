'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarOff,
  CalendarDays,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_JOUR_STYLES: Record<string, string> = {
  ferie:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  pont:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  jonglage:
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
};

const TYPE_JOUR_LABELS: Record<string, string> = {
  ferie: 'Férié',
  pont: 'Pont',
  jonglage: 'Jongage',
};

const YEARS = [2025, 2026];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getJourCourt(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function JoursFeriesPage() {
  const allData = mockD12.calendrierJoursFeries;
  const [selectedYear, setSelectedYear] = useState(2025);

  const filteredData = useMemo(
    () => allData.filter((j) => j.annee === selectedYear),
    [allData, selectedYear],
  );

  const totalJoursFeries = useMemo(
    () => filteredData.filter((j) => j.type_jour === 'ferie').length,
    [filteredData],
  );

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'date_jour',
      label: 'Date',
      render: (row) => {
        const d = String(row.date_jour);
        return (
          <div>
            <span className="font-medium">{d}</span>
          </div>
        );
      },
    },
    {
      key: 'jour',
      label: 'Jour',
      render: (row) => {
        const jour = getJourCourt(String(row.date_jour));
        return <span className="text-xs capitalize">{jour}</span>;
      },
    },
    { key: 'libelle', label: 'Nom Fête' },
    {
      key: 'type_jour',
      label: 'Type',
      render: (row) => {
        const type = String(row.type_jour);
        const style =
          TYPE_JOUR_STYLES[type] ??
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        const label = TYPE_JOUR_LABELS[type] ?? type;
        return (
          <Badge variant="outline" className={style + ' text-[10px] px-1.5 py-0'}>
            {label}
          </Badge>
        );
      },
    },
    {
      key: 'jours_ouvrables_restants',
      label: 'Jours Ouvrables Restants',
      render: (row) => (
        <span className="font-medium">{row.jours_ouvrables_restants}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Calendrier des Jours Fériés"
        description="Configuration des jours fériés, ponts et jongages par année pour le calcul des jours ouvrables."
        icon={CalendarOff}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Admin. du Personnel', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Jours Fériés' },
        ]}
      />

      {/* Year selector + summary */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="size-5 text-[#7C3AED]" />
                <div>
                  <p className="text-sm font-semibold">
                    Année {selectedYear}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalJoursFeries} jour{totalJoursFeries > 1 ? 's' : ''} férié{totalJoursFeries > 1 ? 's' : ''} configuré{totalJoursFeries > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {YEARS.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      selectedYear === year &&
                        'bg-[#7C3AED] hover:bg-[#6D28D9] text-white',
                    )}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DataTable
        columns={columns}
        data={filteredData as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher un jour férié..."
        title="Calendrier des jours fériés"
      />
    </div>
  );
}
