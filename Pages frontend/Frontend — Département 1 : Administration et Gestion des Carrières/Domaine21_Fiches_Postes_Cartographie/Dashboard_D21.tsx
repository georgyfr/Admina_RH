'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPinned,
  Briefcase,
  FileBadge2,
  Award,
  Route,
  Network,
  GitCompareArrows,
  History,
  AlertTriangle,
  ArrowRight,
  Layers,
  Link2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD21 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const BASE = '/departements/administration-et-gestion-des-carrieres/d21';

const MODULE_CARDS = [
  {
    title: 'Référentiel Métiers',
    icon: Briefcase,
    href: `${BASE}/referentiel`,
    count: mockD21.referentielMetiers.length,
    color: '#059669',
  },
  {
    title: 'Fiches de Poste',
    icon: FileBadge2,
    href: `${BASE}/fiches-poste`,
    count: mockD21.fichesPoste.length,
    color: '#0D9488',
  },
  {
    title: 'Compétences',
    icon: Award,
    href: `${BASE}/competences`,
    count: mockD21.competences.length,
    color: '#059669',
  },
  {
    title: 'Poste-Compétence',
    icon: Link2,
    href: `${BASE}/poste-competences`,
    count: mockD21.fiche_poste_competences.length,
    color: '#0D9488',
  },
  {
    title: 'Passerelles',
    icon: Route,
    href: `${BASE}/passerelles`,
    count: mockD21.passerelles.length,
    color: '#059669',
  },
  {
    title: 'Référentiel Mapping',
    icon: Network,
    href: `${BASE}/mapping`,
    count: mockD21.mapping_externe.length,
    color: '#0D9488',
  },
  {
    title: 'Historique Révisions',
    icon: History,
    href: `${BASE}/historique`,
    count: mockD21.historique_revisions.length,
    color: '#059669',
  },
  {
    title: 'Écarts Compétences',
    icon: AlertTriangle,
    href: `${BASE}/ecarts`,
    count: mockD21.ecartsCompetences.length,
    color: '#0D9488',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function D21Dashboard() {
  const ecartsCount = mockD21.ecartsCompetences.length;

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Classification et Cartographie des Emplois"
        description="Référentiel des métiers (4 niveaux, ROME/ESCO), fiches de poste versionnées, catalogue de compétences, passerelles de mobilité et analyse d'écarts."
        icon={MapPinned}
        color="green"
        breadcrumbs={[
          {
            label: 'Département 1',
            href: '/departements/administration-et-gestion-des-carrieres',
          },
          { label: 'D21 — Classification et Cartographie des Emplois' },
        ]}
      />

      {/* KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <KpiCard
          title="Métiers référencés"
          value={mockD21.referentielMetiers.length}
          icon={Briefcase}
          trend={{ value: 12, label: 'ce semestre' }}
          color="teal"
        />
        <KpiCard
          title="Fiches de poste actives"
          value={mockD21.fichesPoste.filter((f) => f.statut === 'valide').length}
          icon={FileBadge2}
          trend={{ value: 5, label: 'ce trimestre' }}
          color="green"
        />
        <KpiCard
          title="Compétences cataloguées"
          value={mockD21.competences.length}
          icon={Award}
          trend={{ value: 8, label: 'ce semestre' }}
          color="blue"
        />
        <KpiCard
          title="Passerelles définies"
          value={mockD21.passerelles.filter((p) => p.statut === 'active').length}
          icon={Route}
          trend={{ value: 0, label: 'stable' }}
          color="purple"
        />
        <KpiCard
          title="Écarts identifiés"
          value={ecartsCount}
          icon={AlertTriangle}
          trend={{ value: 15, label: 'ce mois' }}
          color="orange"
        />
      </motion.div>

      {/* Module cards grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {MODULE_CARDS.map((card) => {
          const Icon = card.icon;
          const content = (
            <motion.div
              key={card.title}
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
                          {card.count} enregistrement{card.count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    {card.href !== '#' && (
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );

          if (card.href === '#') return content;
          return (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
