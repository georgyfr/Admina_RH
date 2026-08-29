#!/usr/bin/env python3
"""Generate ALL Admina-RH source files at once."""
import os

BASE = '/home/z/my-project/admina-rh-build/src'
pages_dir = os.path.join(BASE, 'pages')
os.makedirs(pages_dir, exist_ok=True)

# ======================== DEMANDES.JSX (19 COLUMNS - FULL) ========================
DEMANDES = r'''import { useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper } from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialData = [
  { id:1, numero:'DR-2025-001', dateDemande:'15/01/2025', departement:'Restauration', posteRecherche:'Chef Cuisinier', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Remplacement', dateBesoin:'01/02/2025', priorite:'Urgente', statut:'Pourvue', datePourvue:'15/03/2025', responsableDemande:'M. Nkoulou Paul', roleResponsable:'DRH', cabinetAgence:'HRC Cameroon', budgetSalaire:350000, coutRecrutement:150000, delai:30, notes:'Candidat interne recommandé' },
  { id:2, numero:'DR-2025-002', dateDemande:'20/01/2025', departement:'Herbergement', posteRecherche:'Réceptionniste Nuit', typePoste:'Operationnel', typeContrat:'CDD', effectif:2, motif:'Saisonnalite', dateBesoin:'01/03/2025', priorite:'Haute', statut:'En cours', datePourvue:'', responsableDemande:'Mme. Fotso Marie', roleResponsable:'Chef de Departement', cabinetAgence:'', budgetSalaire:180000, coutRecrutement:80000, delai:45, notes:'' },
  { id:3, numero:'DR-2025-003', dateDemande:'25/01/2025', departement:'Finance & Comptabilite', posteRecherche:'Comptable Senior', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/04/2025', priorite:'Moyenne', statut:'Validée', datePourvue:'', responsableDemande:'M. Tchouankou Jean', roleResponsable:'DRH Adjoint', cabinetAgence:'Activa RH', budgetSalaire:400000, coutRecrutement:250000, delai:60, notes:'Recherche spécialisée' },
  { id:4, numero:'DR-2025-004', dateDemande:'01/02/2025', departement:'Service Client', posteRecherche:'Agent Accueil', typePoste:'Operationnel', typeContrat:'CDD', effectif:1, motif:'Surcharge', dateBesoin:'15/02/2025', priorite:'Haute', statut:'Pourvue', datePourvue:'10/03/2025', responsableDemande:'Mme. Eyenga Clarisse', roleResponsable:'Chef de Service', cabinetAgence:'Interne (sans cabinet)', budgetSalaire:150000, coutRecrutement:25000, delai:15, notes:'Recrutement rapide réussi' },
  { id:5, numero:'DR-2025-005', dateDemande:'05/02/2025', departement:'Securite', posteRecherche:'Agent de Sécurité', typePoste:'Operationnel', typeContrat:'CDD', effectif:3, motif:'Remplacement', dateBesoin:'01/03/2025', priorite:'Moyenne', statut:'En attente', datePourvue:'', responsableDemande:'M. Nganou André', roleResponsable:'Responsable de Pole', cabinetAgence:'', budgetSalaire:120000, coutRecrutement:45000, delai:30, notes:'' },
  { id:6, numero:'DR-2025-006', dateDemande:'10/02/2025', departement:'Informatique', posteRecherche:'Développeur Full Stack', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/05/2025', priorite:'Basse', statut:'En attente', datePourvue:'', responsableDemande:'M. Kamga Blaise', roleResponsable:'Directeur Adjoint', cabinetAgence:'Skillmatch Africa', budgetSalaire:500000, coutRecrutement:300000, delai:90, notes:'Profil rare, cabinet mandaté' },
  { id:7, numero:'DR-2025-007', dateDemande:'15/02/2025', departement:'Marketing & Communication', posteRecherche:'Community Manager', typePoste:'Agent de maitrise', typeContrat:'CDI', effectif:1, motif:'Surcharge', dateBesoin:'01/03/2025', priorite:'Haute', statut:'En cours', datePourvue:'', responsableDemande:'Mme. Mebara Nadège', roleResponsable:'Chef de Departement', cabinetAgence:'', budgetSalaire:250000, coutRecrutement:60000, delai:20, notes:'' },
  { id:8, numero:'DR-2025-008', dateDemande:'20/02/2025', departement:'Logistique & Approvisionnement', posteRecherche:'Chef Approvisionnement', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/06/2025', priorite:'Moyenne', statut:'Validée', datePourvue:'', responsableDemande:'M. Ngo Ndobo Alain', roleResponsable:'DRH', cabinetAgence:'Michael Page Cameroon', budgetSalaire:450000, coutRecrutement:200000, delai:75, notes:'Processus en cours avec cabinet' },
  { id:9, numero:'DR-2025-009', dateDemande:'01/03/2025', departement:'Audiovisuel', posteRecherche:'Technicien Audiovisuel', typePoste:'Agent de maitrise', typeContrat:'CDD', effectif:1, motif:'', dateBesoin:'15/03/2025', priorite:'Urgente', statut:'Annulee', datePourvue:'', responsableDemande:'M. Tabe Arnaud', roleResponsable:'Superviseur', cabinetAgence:'', budgetSalaire:200000, coutRecrutement:0, delai:30, notes:'Poste annulé faute de budget' },
  { id:10, numero:'DR-2025-010', dateDemande:'05/03/2025', departement:'Lingerie', posteRecherche:'Agent de Blanchisserie', typePoste:'Operationnel', typeContrat:'CDD', effectif:2, motif:'Saisonnalite', dateBesoin:'01/04/2025', priorite:'Basse', statut:'En attente', datePourvue:'', responsableDemande:'Mme. Ateba Chantal', roleResponsable:'Chef de Service', cabinetAgence:'', budgetSalaire:100000, coutRecrutement:30000, delai:30, notes:'' },
];

const prioriteColor = { 'Urgente':'error', 'Haute':'warning', 'Moyenne':'info', 'Basse':'default' };
const statutColor = { 'Pourvue':'success', 'En cours':'warning', 'Annulee':'error', 'Validée':'info', 'En attente':'default' };

export default function Demandes() {
  const [data] = useState(initialData);
  const [filterDep, setFilterDep] = useState('Tous');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterPrio, setFilterPrio] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const filtered = useMemo(() => data.filter(d =>
    (filterDep === 'Tous' || d.departement === filterDep) &&
    (filterStatut === 'Tous' || d.statut === filterStatut) &&
    (filterPrio === 'Tous' || d.priorite === filterPrio)
  ), [data, filterDep, filterStatut, filterPrio]);

  const budgetTotal = useMemo(() => filtered.reduce((s, d) => s + (d.budgetSalaire || 0), 0), [filtered]);

  const cols = ['N° Demande','Date Demande','Département','Poste Recherché','Type Poste','Type Contrat','Effectif','Motif','Date Besoin','Priorité','Statut','Date Pourvue','Responsable Demande','Rôle du Responsable','Cabinet / Agence','Budget Salaire (FCFA)','Coût Recrutement (FCFA)','Délai (jours)','Notes'];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Demandes de Recrutement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} demande(s) de recrutement</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle Demande</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL DEMANDES" valeur={filtered.length} sousTexte={`${filtered.length} demande(s) enregistrée(s)`} />
        <KPICard titre="POURVUES" valeur={filtered.filter(d => d.statut === 'Pourvue').length} sousTexte={`${Math.round(filtered.filter(d => d.statut === 'Pourvue').length / Math.max(filtered.length, 1) * 100)}% du total`} />
        <KPICard titre="EN COURS" valeur={filtered.filter(d => ['En cours', 'Validée', 'En attente'].includes(d.statut)).length} sousTexte="demandes actives" />
        <KPICard titre="BUDGET TOTAL" valeur={formatFCFA(budgetTotal)} sousTexte="budget cumulé" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}><Select value={filterDep} onChange={e => setFilterDep(e.target.value)}><MenuItem value="Tous">Tous les départements</MenuItem>{nomenclatures.departement.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}><Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}><MenuItem value="Tous">Tous les statuts</MenuItem>{nomenclatures.statut_demande.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}><Select value={filterPrio} onChange={e => setFilterPrio(e.target.value)}><MenuItem value="Tous">Toutes priorités</MenuItem>{nomenclatures.priorite.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select></FormControl>
      </Box>
      <Paper><TableContainer><Table size="small"><TableHead><TableRow>{cols.map(c => <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap' }}>{c}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.slice(page * rpp, page * rpp + rpp).map(row => (
        <TableRow key={row.id} hover>
          <TableCell>{row.numero}</TableCell>
          <TableCell>{row.dateDemande}</TableCell>
          <TableCell><Chip label={row.departement} size="small" variant="outlined" /></TableCell>
          <TableCell>{row.posteRecherche}</TableCell>
          <TableCell><Chip label={row.typePoste} size="small" /></TableCell>
          <TableCell><Chip label={row.typeContrat} size="small" /></TableCell>
          <TableCell align="center">{row.effectif}</TableCell>
          <TableCell>{row.motif ? <Chip label={row.motif} size="small" variant="outlined" /> : '—'}</TableCell>
          <TableCell>{row.dateBesoin}</TableCell>
          <TableCell><Chip label={row.priorite} size="small" color={prioriteColor[row.priorite]} /></TableCell>
          <TableCell><Chip label={row.statut} size="small" color={statutColor[row.statut]} /></TableCell>
          <TableCell>{row.datePourvue || '—'}</TableCell>
          <TableCell>{row.responsableDemande}</TableCell>
          <TableCell>{row.roleResponsable}</TableCell>
          <TableCell>{row.cabinetAgence || '—'}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.budgetSalaire)}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatFCFA(row.coutRecrutement)}</TableCell>
          <TableCell align="center">{row.delai}</TableCell>
          <TableCell>{row.notes && row.notes.length > 40 ? <Tooltip title={row.notes} arrow><span>{row.notes.substring(0, 40)}...</span></Tooltip> : (row.notes || '—')}</TableCell>
        </TableRow>
      ))}</TableBody></Table></TableContainer>
      <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" labelDisplayedRows={({ from, to, count }) => \`\${from}–\${to} sur \${count}\`} /></Paper>
    </Box>
  );
}''';

print('Writing Demandes.jsx...')
with open(os.path.join(pages_dir, 'Demandes.jsx'), 'w') as f:
    f.write(DEMANDES)

print('Done. Now write Candidats.jsx manually (too complex for template).')
print(f'Total pages dir files will be generated next.')
