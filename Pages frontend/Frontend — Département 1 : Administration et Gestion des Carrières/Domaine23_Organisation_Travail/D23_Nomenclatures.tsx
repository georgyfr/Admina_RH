'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  List,
  Tags,
  CheckCircle2,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD23 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NomenclaturesPage() {
  const data = mockD23.nomenclatures;

  const kpis = useMemo(() => {
    const total = data.length;
    const typesDistincts = new Set(data.map((n) => n.type)).size;
    const actives = data.filter((n) => n.statut === 'actif').length;

    return [
      {
        title: 'Total nomenclatures',
        value: total,
        icon: List,
        color: 'teal' as const,
      },
      {
        title: 'Types distincts',
        value: typesDistincts,
        icon: Tags,
        color: 'purple' as const,
      },
      {
        title: 'Actives',
        value: actives,
        icon: CheckCircle2,
        color: 'green' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'type',
      label: 'Type Nomenclature',
      render: (row) => (
        <span className='text-xs font-medium capitalize'>{String(row.type)}</span>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      render: (row) => (
        <span className='font-mono text-xs font-bold text-muted-foreground'>
          {String(row.code)}
        </span>
      ),
    },
    {
      key: 'libelle',
      label: 'Libellé',
      render: (row) => <span className='font-medium'>{String(row.libelle)}</span>,
    },
    { key: 'description', label: 'Description' },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <StatusBadge status={String(row.statut)} size='sm' />,
    },
  ];

  return (
    <div className='space-y-6'>
      <DomainHeader
        title='Nomenclatures'
        description='Référentiels et nomenclatures organisationnelles : types de structures, catégories et classifications.'
        icon={List}
        color='teal'
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D23', href: '/departements/administration-et-gestion-des-carrieres/d23' },
          { label: 'Nomenclatures' },
        ]}
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </motion.div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder='Rechercher une nomenclature...'
        title='Liste des nomenclatures'
      />
    </div>
  );
}
