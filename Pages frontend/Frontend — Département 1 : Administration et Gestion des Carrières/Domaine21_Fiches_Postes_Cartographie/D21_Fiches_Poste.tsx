'use client';

import { useState, useMemo } from 'react';
import { FileBadge2, ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Plus, CalendarClock, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { KpiCard } from '@/components/admina-rh/domain/KpiCard';
import { mockD21, type D21FichePoste } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Niveau badge                                                       */
/* ------------------------------------------------------------------ */

const NIVEAU_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  B: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  C: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  D: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
};

function NiveauBadge({ niveau }: { niveau: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold',
        NIVEAU_COLORS[niveau] ?? NIVEAU_COLORS.A,
      )}
    >
      Niveau {niveau}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Statut badge                                                       */
/* ------------------------------------------------------------------ */

const STATUT_FP_MAP: Record<string, string> = {
  valide: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  en_revision: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  brouillon: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  en_validation: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
  obsolete: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
};

function FpStatutBadge({ statut }: { statut: string }) {
  const style = STATUT_FP_MAP[statut] ?? '';
  const label = statut.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', style)}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Date formatter                                                     */
/* ------------------------------------------------------------------ */

function fmtDate(v: unknown): string {
  if (!v) return '—';
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(v);
  }
}

/* ------------------------------------------------------------------ */
/*  Expanded row component                                              */
/* ------------------------------------------------------------------ */

function ExpandedRow({ fiche }: { fiche: D21FichePoste }) {
  return (
    <tr>
      <td colSpan={8} className="bg-emerald-50/40 dark:bg-emerald-950/10 px-6 py-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Missions */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Missions principales
            </h4>
            <ul className="space-y-1">
              {(fiche.missions_principales as string[]).map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Activités */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activités principales
            </h4>
            <ul className="space-y-1">
              {(fiche.activites_principales as string[]).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-600" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Conditions */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conditions de travail
            </h4>
            <p className="text-sm leading-relaxed">{fiche.conditions_travail as string}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Expérience :</span>{' '}
                {fiche.experience_requise}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Rémunération :</span>{' '}
                {fiche.remuneration_min.toLocaleString('fr-FR')} – {fiche.remuneration_max.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function FichesPostePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = 10;

  const data = mockD21.fichesPoste as unknown as Record<string, unknown>[];

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((r) =>
      ['titre', 'metier', 'famille_metier', 'departement', 'statut'].some(
        (k) => r[k] != null && String(r[k]).toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const actives = (mockD21.fichesPoste as D21FichePoste[]).filter((f) => f.statut === 'valide').length;
  const enRevision = (mockD21.fichesPoste as D21FichePoste[]).filter((f) => f.statut === 'en_revision').length;
  const lastUpdate = (mockD21.fichesPoste as D21FichePoste[]).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )[0]?.updated_at;

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Fiches de Poste"
        description="Fiches de poste versionnées avec missions, compétences requises et classification hiérarchique."
        icon={FileBadge2}
        color="green"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D21', href: '/departements/administration-et-gestion-des-carrieres/d21' },
          { label: 'Fiches de Poste' },
        ]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Nouvelle fiche
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une fiche de poste</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité en cours de développement. La création de fiches de poste sera disponible prochainement.
              </p>
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Fiches actives" value={actives} icon={FileBadge2} color="green" />
        <KpiCard title="En révision" value={enRevision} icon={CalendarClock} color="orange" />
        <KpiCard title="Dernière mise à jour" value={lastUpdate ? fmtDate(lastUpdate) : '—'} icon={CalendarClock} color="teal" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-semibold">Liste des fiches de poste</CardTitle>
              <span className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher une fiche..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Titre du Poste</TableHead>
                  <TableHead>Famille Métier</TableHead>
                  <TableHead className="hidden md:table-cell">Département</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>V.</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Date Création</TableHead>
                  <TableHead className="hidden lg:table-cell">Dernière MAJ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Aucune fiche de poste trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row) => {
                    const id = String(row.id);
                    const isExpanded = expandedId === id;
                    return (
                      <>
                        <TableRow
                          key={id}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                          onClick={() => setExpandedId(isExpanded ? null : id)}
                        >
                          <TableCell className="w-8">
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{String(row.titre)}</TableCell>
                          <TableCell>{String(row.famille_metier)}</TableCell>
                          <TableCell className="hidden md:table-cell">{String(row.departement)}</TableCell>
                          <TableCell><NiveauBadge niveau={String(row.niveau)} /></TableCell>
                          <TableCell className="text-center font-mono text-xs">{String(row.version)}</TableCell>
                          <TableCell><FpStatutBadge statut={String(row.statut)} /></TableCell>
                          <TableCell className="hidden lg:table-cell">{fmtDate(row.created_at)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{fmtDate(row.updated_at)}</TableCell>
                        </TableRow>
                        {isExpanded && <ExpandedRow fiche={row as unknown as D21FichePoste} />}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {safePage} sur {totalPages}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(1)} disabled={safePage <= 1} aria-label="Première page">
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} aria-label="Page précédente">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} aria-label="Page suivante">
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages} aria-label="Dernière page">
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
