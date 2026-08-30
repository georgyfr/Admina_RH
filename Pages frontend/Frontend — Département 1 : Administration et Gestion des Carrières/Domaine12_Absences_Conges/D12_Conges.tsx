'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { WorkflowTimeline } from '@/components/admina-rh/domain/WorkflowTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { containerVariants, itemVariants } from '@/components/admina-rh/animations';
import { mockD12 } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Status mapping for congés                                          */
/* ------------------------------------------------------------------ */

const CONGE_STATUS_STYLES: Record<string, string> = {
  en_attente:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  approuve_n1:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  approuve_n2:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  rejete:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  annule:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const CONGE_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  approuve_n1: 'Approuvé N+1',
  approuve_n2: 'Approuvé N+2',
  rejete: 'Rejeté',
  annule: 'Annulé',
};

const TYPE_CONGE_LABELS: Record<string, string> = {
  conges_payes: 'Congés payés',
  conges_maladie: 'Congé maladie',
  conges_maternite: 'Congé maternité',
  conges_paternite: 'Congé paternité',
  conges_sans_solde: 'Sans solde',
  rtt: 'RTT',
  conges_exceptionnel: 'Exceptionnel',
};

/* ------------------------------------------------------------------ */
/*  Custom badge                                                       */
/* ------------------------------------------------------------------ */

function CongeStatusBadge({ status }: { status: string }) {
  const style =
    CONGE_STATUS_STYLES[status] ??
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  const label = CONGE_STATUS_LABELS[status] ?? status;
  return (
    <Badge variant="outline" className={style + ' text-[10px] px-1.5 py-0'}>
      {label}
    </Badge>
  );
}

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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CongesPage() {
  const data = mockD12.conges;
  const [dialogOpen, setDialogOpen] = useState(false);

  const kpis = useMemo(() => {
    const enAttente = data.filter((c) => c.statut === 'en_attente').length;
    const approuvees = data.filter(
      (c) => c.statut === 'approuve_n1' || c.statut === 'approuve_n2',
    ).length;
    const rejetees = data.filter((c) => c.statut === 'rejete').length;
    const soldeMoyen =
      data.length > 0
        ? (
            data.reduce((s, c) => s + c.solde_avant, 0) / data.length
          ).toFixed(1)
        : 0;

    return [
      {
        title: 'En attente',
        value: enAttente,
        icon: Clock,
        color: 'orange' as const,
      },
      {
        title: 'Approuvées ce mois',
        value: approuvees,
        icon: CheckCircle2,
        color: 'green' as const,
      },
      {
        title: 'Rejetées',
        value: rejetees,
        icon: XCircle,
        color: 'red' as const,
      },
      {
        title: 'Solde moyen disponible',
        value: `${soldeMoyen} jrs`,
        icon: Wallet,
        color: 'purple' as const,
      },
    ];
  }, [data]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'employe', label: 'Employé' },
    {
      key: 'type_conge',
      label: 'Type Congé',
      render: (row) => (
        <span className="text-xs">{TYPE_CONGE_LABELS[String(row.type_conge)] ?? String(row.type_conge)}</span>
      ),
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
      key: 'nb_jours',
      label: 'Nb Jours',
      render: (row) => <span className="font-medium">{row.nb_jours}</span>,
    },
    { key: 'motif', label: 'Motif' },
    {
      key: 'solde_avant',
      label: 'Solde Avant',
      render: (row) => <span>{row.solde_avant} jrs</span>,
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <CongeStatusBadge status={String(row.statut)} />,
    },
    {
      key: 'niveau_validation',
      label: 'Niveau Validation',
      render: (row) => {
        const niv = String(row.niveau_validation);
        if (!niv) return <span className="text-muted-foreground">—</span>;
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800">
            {niv}
          </Badge>
        );
      },
    },
    { key: 'approbateur', label: 'Approbateur' },
  ];

  /* Workflow steps */
  const workflowSteps = [
    {
      label: 'Déclaration Employé',
      status: 'completed' as const,
      description: 'Soumission de la demande de congé',
    },
    {
      label: 'Validation N+1 (Manager)',
      status: 'completed' as const,
      description: 'Approbation par le responsable hiérarchique direct',
    },
    {
      label: 'Validation N+2 (DRH si > 5j)',
      status: 'current' as const,
      description: 'Approbation supplémentaire pour congés > 5 jours',
    },
    {
      label: 'Mise à jour solde',
      status: 'pending' as const,
      description: 'Déduction du solde de congés après validation finale',
    },
  ];

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Congés"
        description="Gestion des demandes de congés avec validation multi-niveaux (N+1, N+2) et suivi des soldes."
        icon={CalendarDays}
        color="purple"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D12 - Admin. du Personnel', href: '/departements/administration-et-gestion-des-carrieres/d12' },
          { label: 'Congés' },
        ]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              >
                <Plus className="size-4 mr-1.5" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Nouvelle demande de congé</DialogTitle>
                <DialogDescription>
                  Remplissez le formulaire ci-dessous pour soumettre une demande de congé.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type_conge">Type de congé</Label>
                  <Select>
                    <SelectTrigger id="type_conge">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conges_payes">Congés payés</SelectItem>
                      <SelectItem value="conges_maladie">Congé maladie</SelectItem>
                      <SelectItem value="conges_maternite">Congé maternité</SelectItem>
                      <SelectItem value="conges_paternite">Congé paternité</SelectItem>
                      <SelectItem value="conges_sans_solde">Sans solde</SelectItem>
                      <SelectItem value="rtt">RTT</SelectItem>
                      <SelectItem value="conges_exceptionnel">Exceptionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date_debut">Date début</Label>
                    <Input id="date_debut" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date_fin">Date fin</Label>
                    <Input id="date_fin" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="motif">Motif</Label>
                  <Textarea
                    id="motif"
                    placeholder="Motif de la demande..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  onClick={() => setDialogOpen(false)}
                >
                  Soumettre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPI row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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

      {/* Workflow timeline */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Circuit de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowTimeline steps={workflowSteps} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Rechercher une demande de congé..."
        title="Demandes de congés"
      />
    </div>
  );
}
