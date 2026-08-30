'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, Plus, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';

/* ------------------------------------------------------------------ */
/*  Mock employees                                                     */
/* ------------------------------------------------------------------ */

const STRUCTURES = [
  'Direction Générale', 'Direction Administrative', 'Service RH',
  'Service Comptabilité', 'Département Informatique', 'Pôle Logistique',
  'Service Commercial', 'Département Technique',
];

const EMPLOYES = [
  { id: '0', matricule: 'EMP-2024-001', nom: 'Fotso', prenom: 'Alain', nom_complet: 'Alain Fotso', poste: 'Directeur Général', departement: 'Direction Générale', type_contrat: 'CDI', date_embauche: '2020-03-15', statut: 'actif' },
  { id: '1', matricule: 'EMP-2024-002', nom: 'Nkoulou', prenom: 'Marie-Claire', nom_complet: 'Marie-Claire Nkoulou', poste: 'Chef de Service RH', departement: 'Service RH', type_contrat: 'CDI', date_embauche: '2021-06-01', statut: 'actif' },
  { id: '2', matricule: 'EMP-2024-003', nom: 'Nganou', prenom: 'Béatrice', nom_complet: 'Béatrice Nganou', poste: 'Chargé de Recrutement', departement: 'Service RH', type_contrat: 'CDD', date_embauche: '2024-09-01', statut: 'actif' },
  { id: '3', matricule: 'EMP-2024-004', nom: 'Moukouri', prenom: 'Ibrahim', nom_complet: 'Ibrahim Moukouri', poste: 'Développeur Full Stack', departement: 'Département Informatique', type_contrat: 'CDI', date_embauche: '2022-01-10', statut: 'actif' },
  { id: '4', matricule: 'EMP-2024-005', nom: 'Atangana', prenom: 'Emmanuel', nom_complet: 'Emmanuel Atangana', poste: 'Comptable Senior', departement: 'Service Comptabilité', type_contrat: 'CDI', date_embauche: '2023-04-20', statut: 'actif' },
  { id: '5', matricule: 'EMP-2024-006', nom: 'Tchinda', prenom: 'Grégoire', nom_complet: 'Grégoire Tchinda', poste: 'Contrôleur de Gestion', departement: 'Service Comptabilité', type_contrat: 'CDI', date_embauche: '2021-11-05', statut: 'suspendu' },
  { id: '6', matricule: 'EMP-2024-007', nom: 'Eyenga', prenom: 'Florence', nom_complet: 'Florence Eyenga', poste: 'Responsable Logistique', departement: 'Pôle Logistique', type_contrat: 'CDI', date_embauche: '2022-07-12', statut: 'actif' },
  { id: '7', matricule: 'EMP-2024-008', nom: 'Kamga', prenom: 'Sylvain', nom_complet: 'Sylvain Kamga', poste: 'Technicien Maintenance', departement: 'Département Technique', type_contrat: 'Stage', date_embauche: '2025-02-01', statut: 'actif' },
  { id: '8', matricule: 'EMP-2024-009', nom: 'Ngo Mbeck', prenom: 'Patricia', nom_complet: 'Patricia Ngo Mbeck', poste: 'Assistante de Direction', departement: 'Direction Générale', type_contrat: 'CDI', date_embauche: '2020-08-22', statut: 'actif' },
  { id: '9', matricule: 'EMP-2024-010', nom: 'Zang', prenom: 'Olivier', nom_complet: 'Olivier Zang', poste: 'Agent de Sécurité', departement: 'Pôle Logistique', type_contrat: 'Interim', date_embauche: '2025-04-01', statut: 'en_attente' },
];

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<(typeof EMPLOYES)[0]>[] = [
  { key: 'matricule', label: 'Matricule' },
  { key: 'nom_complet', label: 'Nom complet' },
  { key: 'poste', label: 'Poste' },
  { key: 'departement', label: 'Département' },
  { key: 'type_contrat', label: 'Type Contrat' },
  { key: 'date_embauche', label: 'Date Embauche' },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => <StatusBadge status={row.statut} size="sm" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmployesPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterContrat, setFilterContrat] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '', civilite: 'M', nom: '', prenom: '', date_naissance: '',
    genre: 'M', nationalite: 'Camerounaise', telephone: '', email: '',
    adresse: '', statut: 'actif',
  });

  const filteredData = useMemo(() => {
    return EMPLOYES.filter((emp) => {
      const q = search.toLowerCase();
      if (q && !emp.nom_complet.toLowerCase().includes(q) && !emp.matricule.toLowerCase().includes(q) && !emp.email?.toLowerCase().includes(q)) return false;
      if (filterDept !== 'all' && emp.departement !== filterDept) return false;
      if (filterStatut !== 'all' && emp.statut !== filterStatut) return false;
      if (filterContrat !== 'all' && emp.type_contrat !== filterContrat) return false;
      return true;
    });
  }, [search, filterDept, filterStatut, filterContrat]);

  return (
    <div className="space-y-6">
      <DomainHeader
        title="Liste des Employés"
        description="Registre complet du personnel — identification, coordonnées et statuts."
        icon={Users}
        color="teal"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2', href: '/departements/administration-et-gestion-des-carrieres/d2' },
          { label: 'Employés' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 size-4" />
              Exporter
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" />
                  Nouvel Employé
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvel Employé</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de base du nouvel employé.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule</Label>
                    <Input id="matricule" placeholder="EMP-2025-XXX" value={formData.matricule} onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="civilite">Civilité</Label>
                    <Select value={formData.civilite} onValueChange={(v) => setFormData({ ...formData, civilite: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Monsieur</SelectItem>
                        <SelectItem value="Mme">Madame</SelectItem>
                        <SelectItem value="Mlle">Mademoiselle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" placeholder="Nom de famille" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" placeholder="Prénom(s)" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance</Label>
                    <Input id="date_naissance" type="date" value={formData.date_naissance} onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalite">Nationalité</Label>
                    <Input id="nationalite" placeholder="Camerounaise" value={formData.nationalite} onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" placeholder="+237 6XX XXX XXX" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="prenom.nom@entreprise.cm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input id="adresse" placeholder="Adresse complète" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button onClick={() => setDialogOpen(false)}>Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule, email..."
            className="pl-8"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {STRUCTURES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterContrat} onValueChange={setFilterContrat}>
          <SelectTrigger className="w-full sm:w-40">
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

      {/* Tableau */}
      <DataTable
        columns={columns.map((col) => ({
          ...col,
          render: col.key === 'nom_complet'
            ? (row: (typeof EMPLOYES)[0]) => (
                <Link
                  href={`/departements/administration-et-gestion-des-carrieres/d2/employes/${row.id}`}
                  className="font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  {row.nom_complet}
                </Link>
              )
            : col.render,
        }))}
        data={filteredData as unknown as Record<string, unknown>[]}
        searchable={false}
        pageSize={10}
      />
    </div>
  );
}
