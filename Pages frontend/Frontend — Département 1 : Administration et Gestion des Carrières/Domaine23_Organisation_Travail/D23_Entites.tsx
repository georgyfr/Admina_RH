'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Layers,
  Users,
} from 'lucide-react';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD23 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EntitesOrganisationnellesPage() {
  const data = mockD23.entitesOrganisationnelles;

  const kpis = useMemo(() => {
    const total = data.length;
    const niveaux = data
      .map((e) => Number((e as Record<string, unknown>).niveau) || 0)
      .filter((n) => n > 0);
    const niveauMoyen = niveaux.length > 0 ? niveaux.reduce((s, n) => s + n, 0) / niveaux.length : 0;
    const effectifTotal = data.reduce((s, e) => s + (Number((e as Record<string, unknown>).effectif_prevu) || 0), 0);

    return [
      {
        title: 'Total entités',
        value: total,
        icon: Building2,
        color: 'teal' as const,
      },
      {
        title: 'Niveau moyen',
        value: niveauMoyen > 0 ? niveauMoyen.toFixed(1) : '—',
        icon: Layers,
        color: 'purple' as const,
      },
      {
        title: 'Effectif total prévu',
        value: effectifTotal > 0 ? effectifTotal : '—',
        icon: Users,
        color: 'green' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
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
      key: 'nom',
      label: 'Nom',
      render: (row) => <span className='font-medium'>{String(row.nom)}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className='text-xs capitalize'>{String(row.type)}</span>
      ),
    },
    {
      key: 'niveau',
      label: 'Niveau',
      render: (row) => {
        const niv = row.niveau;
        return niv != null ? <span className='font-medium'>{String(niv)}</span> : <span className='text-muted-foreground'>—</span>;
      },
    },
    {
      key: 'parent',
      label: 'Parent',
      render: (row) => {
        const parent = row.parent;
        return parent ? <span className='text-xs text-muted-foreground'>{String(parent)}</span> : <span className='text-xs text-muted-foreground'>—</span>;
      },
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row) => {
        const resp = row.responsable;
        return resp ? <span className='text-xs'>{String(resp)}</span> : <span className='text-xs text-muted-foreground'>—</span>;
      },
    },
    {
      key: 'effectif_prevu',
      label: 'Effectif Prévu',
      render: (row) => {
        const eff = row.effectif_prevu;
        return eff != null ? <span className='font-medium text-center block'>{String(eff)}</span> : <span className='text-muted-foreground text-center block'>—</span>;
      },
    },
  ];

  return (
    <div className='space-y-6'>
      <DomainHeader
        title='Entités Organisationnelles'
        description='Répertoire des entités organisationnelles : sièges, agences, filiales et antennes avec leur hiérarchie.'
        icon={Building2}
        color='teal'
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D23', href: '/departements/administration-et-gestion-des-carrieres/d23' },
          { label: 'Entités Organisationnelles' },
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
        searchPlaceholder='Rechercher une entité...'
        title='Liste des entités organisationnelles'
      />
    </div>
  );
}
