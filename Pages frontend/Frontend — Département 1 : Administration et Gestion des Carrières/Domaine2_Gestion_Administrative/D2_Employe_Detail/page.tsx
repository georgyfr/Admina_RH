'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  FileText,
  FolderOpen,
  CreditCard,
  HeartPulse,
  CalendarDays,
  Wallet,
  Gavel,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  UserCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DomainHeader } from '@/components/admina-rh/domain/DomainHeader';
import { DataTable, type Column } from '@/components/admina-rh/domain/DataTable';
import { StatusBadge } from '@/components/admina-rh/domain/StatusBadge';

/* ------------------------------------------------------------------ */
/*  Mock employee data (indexed 0-4)                                   */
/* ------------------------------------------------------------------ */

interface EmployeData {
  id: string;
  matricule: string;
  civilite: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  poste: string;
  departement: string;
  type_contrat: string;
  date_embauche: string;
  statut: string;
  telephone: string;
  email: string;
  adresse: string;
  date_naissance: string;
  nationalite: string;
  salaire_base: number;
}

const EMPLOYES: EmployeData[] = [
  { id: '0', matricule: 'EMP-2024-001', civilite: 'M', nom: 'Fotso', prenom: 'Alain', nom_complet: 'Alain Fotso', poste: 'Directeur Général', departement: 'Direction Générale', type_contrat: 'CDI', date_embauche: '2020-03-15', statut: 'actif', telephone: '+237 699 123 456', email: 'a.fotso@entreprise.cm', adresse: 'Douala, Bonapriso', date_naissance: '1978-05-12', nationalite: 'Camerounaise', salaire_base: 1500000 },
  { id: '1', matricule: 'EMP-2024-002', civilite: 'Mme', nom: 'Nkoulou', prenom: 'Marie-Claire', nom_complet: 'Marie-Claire Nkoulou', poste: 'Chef de Service RH', departement: 'Service RH', type_contrat: 'CDI', date_embauche: '2021-06-01', statut: 'actif', telephone: '+237 677 234 567', email: 'mc.nkoulou@entreprise.cm', adresse: 'Yaoundé, Bastos', date_naissance: '1985-09-23', nationalite: 'Camerounaise', salaire_base: 850000 },
  { id: '2', matricule: 'EMP-2024-003', civilite: 'Mme', nom: 'Nganou', prenom: 'Béatrice', nom_complet: 'Béatrice Nganou', poste: 'Chargée de Recrutement', departement: 'Service RH', type_contrat: 'CDD', date_embauche: '2024-09-01', statut: 'actif', telephone: '+237 690 345 678', email: 'b.nganou@entreprise.cm', adresse: 'Douala, Makepé', date_naissance: '1992-02-14', nationalite: 'Camerounaise', salaire_base: 450000 },
  { id: '3', matricule: 'EMP-2024-004', civilite: 'M', nom: 'Moukouri', prenom: 'Ibrahim', nom_complet: 'Ibrahim Moukouri', poste: 'Développeur Full Stack', departement: 'Département Informatique', type_contrat: 'CDI', date_embauche: '2022-01-10', statut: 'actif', telephone: '+237 676 456 789', email: 'i.moukouri@entreprise.cm', adresse: 'Yaoundé, Nlongkak', date_naissance: '1990-11-30', nationalite: 'Camerounaise', salaire_base: 750000 },
  { id: '4', matricule: 'EMP-2024-005', civilite: 'M', nom: 'Atangana', prenom: 'Emmanuel', nom_complet: 'Emmanuel Atangana', poste: 'Comptable Senior', departement: 'Service Comptabilité', type_contrat: 'CDI', date_embauche: '2023-04-20', statut: 'actif', telephone: '+237 691 567 890', email: 'e.atangana@entreprise.cm', adresse: 'Douala, Akwa', date_naissance: '1988-07-08', nationalite: 'Camerounaise', salaire_base: 650000 },
];

/* ------------------------------------------------------------------ */
/*  Mock related data per employee                                     */
/* ------------------------------------------------------------------ */

interface MockContrat {
  [key: string]: unknown;
  id: string;
  type_contrat: string;
  date_debut: string;
  date_fin: string | null;
  salaire_base: number;
  statut: string;
}

interface MockDocument {
  [key: string]: unknown;
  id: string;
  type_document: string;
  date_emission: string;
  date_expiration: string | null;
  statut: string;
}

interface MockBancaire {
  [key: string]: unknown;
  id: string;
  nom_banque: string;
  rib: string;
  iban: string;
  bic: string;
  est_principal: boolean;
}

interface MockMutuelle {
  [key: string]: unknown;
  id: string;
  organisme: string;
  type_couverture: string;
  numero_adhesion: string;
  montant_cotisation: number;
  statut: string;
}

interface MockConge {
  [key: string]: unknown;
  id: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nb_jours: number;
  statut: string;
}

interface MockSanction {
  [key: string]: unknown;
  id: string;
  type_sanction: string;
  date_sanction: string;
  motif: string;
  statut: string;
}

interface MockVisite {
  [key: string]: unknown;
  id: string;
  type_visite: string;
  date_visite: string;
  medecin: string;
  resultat: string;
}

function getMockRelated(id: string) {
  const emp = EMPLOYES[Number(id) % EMPLOYES.length]!;
  return {
    contrats: [
      { id: 'c1', type_contrat: emp.type_contrat, date_debut: emp.date_embauche, date_fin: emp.type_contrat === 'CDI' ? null : '2025-12-31', salaire_base: emp.salaire_base, statut: 'actif' },
      { id: 'c2', type_contrat: 'CDD', date_debut: '2019-01-01', date_fin: '2019-12-31', salaire_base: 400000, statut: 'termine' },
    ] as MockContrat[],
    documents: [
      { id: 'd1', type_document: 'CNI', date_emission: '2022-03-15', date_expiration: '2027-03-15', statut: 'valide' },
      { id: 'd2', type_document: 'Diplome', date_emission: '2018-06-20', date_expiration: null, statut: 'valide' },
      { id: 'd3', type_document: 'Certificat', date_emission: '2024-01-10', date_expiration: '2025-01-10', statut: 'expire' },
    ] as MockDocument[],
    bancaires: [
      { id: 'b1', nom_banque: 'SG Cameroon', rib: '10001 0001 2345 6789 0123', iban: 'CM23 10001 0001 2345 6789 0123', bic: 'SGCOCMCX', est_principal: true },
      { id: 'b2', nom_banque: 'Afriland First Bank', rib: '20002 0002 9876 5432 0123', iban: 'CM23 20002 0002 9876 5432 0123', bic: 'AFBCAMCX', est_principal: false },
    ] as MockBancaire[],
    mutuelle: [
      { id: 'm1', organisme: 'AXA Assurance', type_couverture: 'Santé + Prévoyance', numero_adhesion: 'AXA-2024-0042', montant_cotisation: 25000, statut: 'actif' },
    ] as MockMutuelle[],
    conges: [
      { id: 'cg1', type_conge: 'conges_payes', date_debut: '2025-07-14', date_fin: '2025-08-01', nb_jours: 15, statut: 'approuve' },
      { id: 'cg2', type_conge: 'conges_maladie', date_debut: '2025-03-10', date_fin: '2025-03-12', nb_jours: 3, statut: 'approuve' },
    ] as MockConge[],
    sanctions: [
      { id: 's1', type_sanction: 'avertissement', date_sanction: '2024-11-05', motif: 'Retards fréquents en octobre 2024', statut: 'active' },
    ] as MockSanction[],
    visites: [
      { id: 'v1', type_visite: 'embauche', date_visite: emp.date_embauche, medecin: 'Dr. Mbarga Paul', resultat: 'apte' },
      { id: 'v2', type_visite: 'periodique', date_visite: '2025-01-20', medecin: 'Dr. Ngassam Henri', resultat: 'apte_avec_restrictions' },
    ] as MockVisite[],
  };
}

/* ------------------------------------------------------------------ */
/*  Table column definitions                                           */
/* ------------------------------------------------------------------ */

const contratCols: Column<MockContrat>[] = [
  { key: 'type_contrat', label: 'Type' },
  { key: 'date_debut', label: 'Date Début' },
  { key: 'date_fin', label: 'Date Fin' },
  { key: 'salaire_base', label: 'Salaire Base' },
  { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} size="sm" /> },
];

const docCols: Column<MockDocument>[] = [
  { key: 'type_document', label: 'Type Document' },
  { key: 'date_emission', label: 'Date Émission' },
  { key: 'date_expiration', label: 'Date Expiration' },
  { key: 'statut', label: 'Validité', render: (r) => <StatusBadge status={r.statut} size="sm" /> },
];

const bancaireCols: Column<MockBancaire>[] = [
  { key: 'nom_banque', label: 'Banque' },
  { key: 'rib', label: 'RIB' },
  { key: 'bic', label: 'BIC' },
  { key: 'est_principal', label: 'Principal', render: (r) => <Badge variant={r.est_principal ? 'default' : 'outline'} className="text-[10px]">{r.est_principal ? 'Oui' : 'Non'}</Badge> },
];

const mutuelleCols: Column<MockMutuelle>[] = [
  { key: 'organisme', label: 'Organisme' },
  { key: 'type_couverture', label: 'Couverture' },
  { key: 'numero_adhesion', label: 'N° Adhésion' },
  { key: 'montant_cotisation', label: 'Cotisation' },
  { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} size="sm" /> },
];

const congeCols: Column<MockConge>[] = [
  { key: 'type_conge', label: 'Type' },
  { key: 'date_debut', label: 'Début' },
  { key: 'date_fin', label: 'Fin' },
  { key: 'nb_jours', label: 'Nb Jours' },
  { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} size="sm" /> },
];

const sanctionCols: Column<MockSanction>[] = [
  { key: 'type_sanction', label: 'Type' },
  { key: 'date_sanction', label: 'Date' },
  { key: 'motif', label: 'Motif' },
  { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} size="sm" /> },
];

const visiteCols: Column<MockVisite>[] = [
  { key: 'type_visite', label: 'Type' },
  { key: 'date_visite', label: 'Date' },
  { key: 'medecin', label: 'Médecin' },
  { key: 'resultat', label: 'Résultat', render: (r) => <StatusBadge status={r.resultat} size="sm" /> },
];

/* ------------------------------------------------------------------ */
/*  Sidebar info card                                                  */
/* ------------------------------------------------------------------ */

function EmployeeSidebar({ emp }: { emp: EmployeData }) {
  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        {/* Photo placeholder */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
            <UserCircle className="size-14 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="mt-3 text-lg font-bold">{emp.nom_complet}</h3>
          <p className="text-sm text-muted-foreground">{emp.poste}</p>
          <StatusBadge status={emp.statut} size="md" className="mt-2" />
        </div>

        <Separator className="my-4" />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="size-4 shrink-0" />
            <span>{emp.departement}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="size-4 shrink-0" />
            <span>{emp.type_contrat}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{emp.telephone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span>{emp.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{emp.adresse}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Salaire</p>
            <p className="text-sm font-bold">{emp.salaire_base.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Embauche</p>
            <p className="text-sm font-bold">{new Date(emp.date_embauche).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmployeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const empIdx = Number(id) % EMPLOYES.length;
  const emp = EMPLOYES[empIdx]!;
  const data = getMockRelated(id);

  return (
    <div className="space-y-6">
      <DomainHeader
        title={emp.nom_complet}
        description={`Fiche employé — ${emp.matricule}`}
        icon={Users}
        color="teal"
        breadcrumbs={[
          { label: 'Département 1', href: '/departements/administration-et-gestion-des-carrieres' },
          { label: 'D2', href: '/departements/administration-et-gestion-des-carrieres/d2' },
          { label: 'Employés', href: '/departements/administration-et-gestion-des-carrieres/d2/employes' },
          { label: emp.nom_complet },
        ]}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <EmployeeSidebar emp={emp} />
        </aside>

        {/* Onglets principaux */}
        <div className="min-w-0 flex-1">
          <Tabs defaultValue="informations">
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="informations">Informations</TabsTrigger>
              <TabsTrigger value="contrat">Contrat</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="bancaire">Bancaire</TabsTrigger>
              <TabsTrigger value="mutuelle">Mutuelle</TabsTrigger>
              <TabsTrigger value="conges">Congés</TabsTrigger>
              <TabsTrigger value="paie">Paie</TabsTrigger>
              <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
              <TabsTrigger value="visites">Visites</TabsTrigger>
            </TabsList>

            <TabsContent value="informations" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Informations personnelles</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoField label="Matricule" value={emp.matricule} />
                    <InfoField label="Civilité" value={emp.civilite === 'M' ? 'Monsieur' : emp.civilite === 'Mme' ? 'Madame' : 'Mademoiselle'} />
                    <InfoField label="Nom" value={emp.nom} />
                    <InfoField label="Prénom" value={emp.prenom} />
                    <InfoField label="Date de naissance" value={new Date(emp.date_naissance).toLocaleDateString('fr-FR')} />
                    <InfoField label="Nationalité" value={emp.nationalite} />
                    <InfoField label="Téléphone" value={emp.telephone} />
                    <InfoField label="Email" value={emp.email} />
                    <div className="sm:col-span-2"><InfoField label="Adresse" value={emp.adresse} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contrat" className="mt-4">
              <DataTable columns={contratCols} data={data.contrats as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DataTable columns={docCols} data={data.documents as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="bancaire" className="mt-4">
              <DataTable columns={bancaireCols} data={data.bancaires as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="mutuelle" className="mt-4">
              <DataTable columns={mutuelleCols} data={data.mutuelle as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="conges" className="mt-4">
              <DataTable columns={congeCols} data={data.conges as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="paie" className="mt-4">
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Wallet className="mx-auto mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm">Les données de paie seront disponibles dans le domaine D5.</p>
                  <Link href="/departements/administration-et-gestion-des-carrieres/d5" className="mt-2 inline-block text-sm text-teal-600 hover:underline dark:text-teal-400">
                    Voir D5 — Gestion des Salaires →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sanctions" className="mt-4">
              <DataTable columns={sanctionCols} data={data.sanctions as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>

            <TabsContent value="visites" className="mt-4">
              <DataTable columns={visiteCols} data={data.visites as unknown as Record<string, unknown>[]} searchable={false} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Info field helper                                                  */
/* ------------------------------------------------------------------ */

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value || '—'}</p>
    </div>
  );
}
