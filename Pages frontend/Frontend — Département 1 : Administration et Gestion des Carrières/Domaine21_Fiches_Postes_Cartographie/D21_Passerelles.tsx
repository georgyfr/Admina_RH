'use client';

import { useState, useMemo } from 'react';
import { Route, ArrowUpRight, ArrowRightLeft, RefreshCw, GraduationCap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { mockD21, type D21Passerelle } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';

/* ------------------------------------------------------------------ */
/*  Type d'icône et label                                              */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof ArrowUpRight; color: string; bg: string }
> = {
  verticale: {
    label: 'Promotion',
    icon: ArrowUpRight,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-800',
  },
  horizontale: {
    label: 'Transversal',
    icon: ArrowRightLeft,
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-800',
  },
  transversale: {
    label: 'Reconversion',
    icon: RefreshCw,
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-950/40 ring-violet-200 dark:ring-violet-800',
  },
};

/* ------------------------------------------------------------------ */
/*  Enriched passerelle with simulated competence level                */
/* ------------------------------------------------------------------ */

const passerellesEnriched = mockD21.passerelles.map((p) => ({
  ...p,
  niveau_competence_requis: p.type_passerelle === 'verticale' ? 'Expert (3-4)' : 'Intermédiaire (2-3)',
  conditions: [
    'Validation des compétences clés du poste source',
    p.formation_recommandee,
    `${Math.floor(p.probabilite / 10)} ans d'expérience minimum`,
  ],
}));

/* ------------------------------------------------------------------ */
/*  Passerelle Card                                                    */
/* ------------------------------------------------------------------ */

function PasserelleCard({ passerelle }: { passerelle: (typeof passerellesEnriched)[number] }) {
  const cfg = TYPE_CONFIG[passerelle.type_passerelle] ?? TYPE_CONFIG.verticale;
  const Icon = cfg.icon;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Card className="h-full transition-all hover:shadow-md">
        <CardContent className="p-5">
          {/* Header: Type badge */}
          <div className="mb-4 flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn('gap-1.5 font-medium', cfg.bg, cfg.color)}
            >
              <Icon className="size-3.5" />
              {cfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Faisabilité : <span className="font-semibold text-foreground">{passerelle.probabilite}%</span>
            </span>
          </div>

          {/* Source → Target */}
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2 text-center">
              <p className="text-sm font-semibold leading-tight truncate">
                {passerelle.metier_source}
              </p>
              <p className="text-[10px] text-muted-foreground">Poste source</p>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-center">
              <p className="text-sm font-semibold leading-tight truncate">
                {passerelle.metier_cible}
              </p>
              <p className="text-[10px] text-muted-foreground">Poste cible</p>
            </div>
          </div>

          {/* Progress bar (faisabilité) */}
          <div className="mb-4">
            <Progress value={passerelle.probabilite} className="h-1.5" />
          </div>

          {/* Conditions */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GraduationCap className="size-3.5" />
              Conditions & Compétences
            </h4>
            <ul className="space-y-1.5">
              {(passerelle.conditions as string[]).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-600" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Niveau requis */}
          <div className="mt-3 rounded-md bg-muted/40 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Niveau de compétence requis
            </p>
            <p className="mt-0.5 text-sm font-semibold">{passerelle.niveau_competence_requis}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PasserellesPage() {
  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    if (filterType === 'all') return passerellesEnriched;
    return passerellesEnriched.filter((p) => p.type_passerelle === filterType);
  }, [filterType]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Passerelles de Mobilité"
        description="Parcours de mobilité entre métiers : promotions, transitions horizontales et reconversions avec conditions de faisabilité."
        icon={Route}
        color="green"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Passerelles' },
        ]}
      />

      {/* Filtre */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Type de passerelle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="verticale">Promotion (Verticale)</SelectItem>
            <SelectItem value="horizontale">Transversal (Horizontale)</SelectItem>
            <SelectItem value="transversale">Reconversion (Transversale)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((p) => (
          <PasserelleCard key={p.id} passerelle={p} />
        ))}
      </motion.div>
    </div>
  );
}
