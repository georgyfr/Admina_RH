import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem, Stack, Button, Chip, IconButton, Tooltip, Typography, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CONTRATS, EMPLOYEES, BANCAIRES, MUTUELLES, AVENANTS, findEmployee, employeeFullName, formatFCFA, formatDate, joursRestants, LABELS, NOMENCLATURES, calculerAnciennete, formatNumber, generateAvenantNumber } from './data';
import { StatusBadge, SectionHeader, MontantCell } from './components';
import GenerationContrats from './GenerationContrats';

const NAVY = '#0b2a4a';
const VIOLET = '#7e3ff2';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const GOLD = '#f9c74f';

// --- Calculs temporels automatiques (DATEDIF) ---
function calculerDureeMois(dateDebut, dateFin) {
  if (!dateDebut) return null;
  const fin = dateFin ? new Date(dateFin) : new Date();
  const debut = new Date(dateDebut);
  const mois = Math.round((fin - debut) / (30.44 * 86400000));
  return mois;
}

function calculerAncienneteComplete(dateDebut) {
  if (!dateDebut) return '—';
  const d = new Date(dateDebut);
  const now = new Date();
  let ans = now.getFullYear() - d.getFullYear();
  let mois = now.getMonth() - d.getMonth();
  if (mois < 0) { ans--; mois += 12; }
  if (now.getDate() < d.getDate()) { mois--; if (mois < 0) { ans--; mois += 12; } }
  ans = Math.max(0, ans);
  mois = Math.max(0, mois);
  return { ans, mois, texte: `${ans} an${ans > 1 ? 's' : ''} ${mois} mois` };
}

function calculerFinPeriodeEssai(dateDebut, typeContrat) {
  if (!dateDebut) return null;
  const d = new Date(dateDebut);
  // CDI = 3 mois (90 jours), CDD = 1 mois (30 jours), Stage = 2 mois (60 jours)
  const dureeJours = typeContrat === 'CDI' ? 90 : typeContrat === 'CDD' ? 30 : typeContrat === 'Stage' ? 60 : 90;
  d.setDate(d.getDate() + dureeJours);
  return d.toISOString().slice(0, 10);
}

function calculerDateFinAuto(dateDebut, typeContrat, dateFinExistante) {
  if (typeContrat === 'CDI' || typeContrat === 'Freelance') return null; // Indéterminée
  if (dateFinExistante) return dateFinExistante;
  if (!dateDebut) return null;
  // CDD par défaut = 1 an
  const d = new Date(dateDebut);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function calculerJoursRestantsPeriodeEssai(dateDebut, typeContrat) {
  const finEssai = calculerFinPeriodeEssai(dateDebut, typeContrat);
  if (!finEssai) return null;
  const now = new Date();
  const fin = new Date(finEssai);
  return Math.ceil((fin - now) / 86400000);
}

// --- RECHERCHEX IBAN (6-Suivi Contrats → Données Bancaires) ---
function rechercherIBAN(employeeId) {
  const bancaire = BANCAIRES.find(b => b.employee_id === employeeId);
  if (!bancaire) return null;
  return { rib: bancaire.rib, banque: bancaire.banque, statut: bancaire.statut };
}

// --- RECHERCHEX Mutuelle (6-Suivi Contrats → Mutuelle Prévoyance) ---
function rechercherMutuelle(employeeId) {
  const mutuelle = MUTUELLES.find(m => m.employee_id === employeeId);
  if (!mutuelle) return null;
  return { organisme: mutuelle.organisme, couverture: mutuelle.couverture, cotisation: mutuelle.cotisation_mensuelle, statut: mutuelle.statut };
}

// --- Indicateur complétude dossier paie ---
function evaluerCompletudePaie(iban, mutuelle) {
  const ibanOk = iban !== null;
  const mutuelleOk = mutuelle !== null;
  if (ibanOk && mutuelleOk) return { statut: 'OK', complet: true, color: VERT, label: 'Dossier paie OK' };
  if (!ibanOk && !mutuelleOk) return { statut: 'Incomplet', complet: false, color: ROUGE, label: 'IBAN + Mutuelle manquants' };
  if (!ibanOk) return { statut: 'Incomplet', complet: false, color: ROUGE, label: 'IBAN manquant' };
  return { statut: 'Incomplet', complet: false, color: ORANGE, label: 'Mutuelle manquante' };
}

// --- Generate Contract PDF (ouvre fenêtre impression) ---
function generateContractPDF(c, emp) {
  const printWindow = window.open('', '_blank');
  const dateFinText = c.date_fin ? formatDate(c.date_fin) : 'Contrat à durée indéterminée';
  const essaiText = c.type_contrat === 'CDI' ? 'trois (3) mois' : 'un (1) mois';
  printWindow.document.write(`
    <html><head><title>Contrat ${c.contract_number} - ${employeeFullName(emp)}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a2a3a; max-width: 800px; margin: 0 auto; }
      h1 { color: #0b2a4a; font-size: 1.4rem; text-align: center; margin-bottom: 5px; }
      .header { text-align: center; border-bottom: 2px solid #0b2a4a; padding-bottom: 15px; margin-bottom: 20px; }
      .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .info-table td { padding: 6px 12px; border-bottom: 1px solid #e9edf2; font-size: 0.82rem; }
      .info-table td:first-child { color: #6b7a8a; width: 40%; }
      .info-table td:last-child { font-weight: 600; }
      .clauses { margin-top: 20px; }
      .clause { margin-bottom: 12px; }
      .clause h3 { font-size: 0.82rem; color: #0b2a4a; margin: 0 0 4px 0; }
      .clause p { font-size: 0.78rem; color: #4a5a6a; text-align: justify; margin: 0; line-height: 1.4; }
      .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
      .sig-block { text-align: center; width: 45%; }
      .sig-block p { font-size: 0.75rem; color: #6b7a8a; margin-bottom: 30px; }
      .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 0.7rem; color: #999; }
      .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e9edf2; font-size: 0.65rem; color: #9aa8b8; text-align: center; }
    </style></head><body>
    <div class="header">
      <h1>CONTRAT DE TRAVAIL</h1>
      <p style="font-size: 0.8rem; color: #6b7a8a;">N° ${c.contract_number} · ${c.type_contrat}</p>
    </div>
    <table class="info-table">
      <tr><td>Employé</td><td>${emp.civilite} ${employeeFullName(emp)}</td></tr>
      <tr><td>Matricule</td><td>${emp.matricule}</td></tr>
      <tr><td>Poste</td><td>${emp.poste}</td></tr>
      <tr><td>Département</td><td>${emp.departement}</td></tr>
      <tr><td>Type de contrat</td><td>${c.type_contrat}</td></tr>
      <tr><td>Date de début</td><td>${formatDate(c.date_debut)}</td></tr>
      <tr><td>Date de fin</td><td>${dateFinText}</td></tr>
      <tr><td>Salaire brut mensuel</td><td>${formatNumber(c.salaire_brut)} FCFA</td></tr>
      <tr><td>Régime de travail</td><td>${c.regime_travail || emp.regime_travail}</td></tr>
      <tr><td>Lieu de travail</td><td>${c.lieu_travail || emp.lieu_travail}</td></tr>
    </table>
    <div class="clauses">
      <div class="clause"><h3>Article 1 — Engagement</h3><p>L'employeur engage l'employé ci-dessus désigné, qui accepte, pour exercer les fonctions de ${emp.poste} au sein du département ${emp.departement}.</p></div>
      <div class="clause"><h3>Article 2 — Période d'essai</h3><p>Le présent contrat est conclu avec une période d'essai de ${essaiText}, durant laquelle chacune des parties peut rompre le contrat sans préavis ni indemnité.</p></div>
      <div class="clause"><h3>Article 3 — Rémunération</h3><p>L'employé percevra un salaire brut mensuel de ${formatNumber(c.salaire_brut)} FCFA, payable mensuellement à terme échu, sous déduction des cotisations sociales légales.</p></div>
      <div class="clause"><h3>Article 4 — Lieu et horaires de travail</h3><p>L'employé exercera ses fonctions à ${c.lieu_travail || emp.lieu_travail}. Le régime de travail est ${c.regime_travail || emp.regime_travail}.</p></div>
      <div class="clause"><h3>Article 5 — Obligations</h3><p>L'employé s'engage à exécuter ses fonctions avec loyauté et diligence, à respecter le règlement intérieur et à observer la plus stricte discrétion professionnelle.</p></div>
      <div class="clause"><h3>Article 6 — Rupture</h3><p>${c.type_contrat === 'CDI' ? "Le présent contrat pourra être rompu par l'une ou l'autre des parties dans les conditions prévues par le Code du Travail." : "Le présent contrat prendra fin automatiquement à l'expiration de la période stipulée."}</p></div>
    </div>
    <div class="signatures">
      <div class="sig-block"><p>Employeur (signature)</p><div class="sig-line">Date et lieu</div></div>
      <div class="sig-block"><p>Employé (signature)</p><div class="sig-line">Date et lieu</div></div>
    </div>
    <div class="footer">
      Conforme ISO 30401:2018 · Code du Travail camerounais (Loi n° 92/007 du 14/08/1992)<br/>
      Document généré par Admina-RH · ${new Date().toLocaleDateString('fr-FR')}
    </div>
    </body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// --- FILTER avenants par contrat (4-Avenants Contrat) ---
function filterAvenantsByContract(contractId) {
  return AVENANTS.filter(a => a.contract_id === contractId).sort((a, b) => new Date(b.date_avenant) - new Date(a.date_avenant));
}

// --- RECHERCHEX dernier avenant SIGNÉ ou ARCHIVÉ (recherche descendante -1) ---
// =RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!G:G; [@Salaire]; 0; -1)
// Le 6e argument -1 = recherche en descendant (du plus récent au plus ancien)
// On ne prend que les avenants "Archivé" ou "Signé" (pas Projet/Envoyé/Refusé)
const STATUTS_VALIDES_BOUCLAGE = ['Archivé', 'Signé'];

function filterAvenantsValides(contractId) {
  return AVENANTS
    .filter(a => a.contract_id === contractId && STATUTS_VALIDES_BOUCLAGE.includes(a.statut))
    .sort((a, b) => {
      // Tri descendant par date_effet (du plus récent au plus ancien) — équivaut à l'argument -1
      const da = a.date_effet ? new Date(a.date_effet).getTime() : 0;
      const db = b.date_effet ? new Date(b.date_effet).getTime() : 0;
      return db - da;
    });
}

// --- RECHERCHEX dernier avenant (salaire le plus récent) ---
// =RECHERCHEX([@[N° Contrat]]; 'Avenants'!A:A; 'Avenants'!C:C; [@SalaireBrut]; 0; -1)
function getDernierAvenant(contractId) {
  const avenants = filterAvenantsByContract(contractId);
  return avenants.length > 0 ? avenants[0] : null;
}

// --- ÉTAPE 7 : RECHERCHEX bouclage (uniquement avenants Signé/Archivé) ---
// Récupère le dernier avenant SIGNÉ ou ARCHIVÉ pour mise à jour auto du contrat principal
function getDernierAvenantValide(contractId) {
  const avenants = filterAvenantsValides(contractId);
  return avenants.length > 0 ? avenants[0] : null;
}

// --- RECHERCHEX Salaire actuel (colonne G) avec SIERREUR ---
// =SIERREUR(RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!G:G; [@Salaire]; 0; -1); [@Salaire])
function getSalaireActuel(contractId, salaireInitial) {
  const dernier = getDernierAvenantValide(contractId);
  if (!dernier) return { value: salaireInitial, source: 'initial', avenant: null };
  return { value: dernier.nouveau_salaire, source: 'avenant', avenant: dernier };
}

// --- RECHERCHEX Poste actuel (colonne E) avec SIERREUR ---
// =SIERREUR(RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!E:E; [@Poste]; 0; -1); [@Poste])
function getPosteActuel(contractId, posteInitial) {
  const dernier = getDernierAvenantValide(contractId);
  if (!dernier || !dernier.nouveau_poste) return { value: posteInitial, source: 'initial', avenant: null };
  return { value: dernier.nouveau_poste, source: 'avenant', avenant: dernier };
}

// --- RECHERCHEX Temps de travail (colonne I) avec SIERREUR ---
// =SIERREUR(RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!I:I; [@Temps]; 0; -1); [@Temps])
function getTempsTravailActuel(contractId, tempsInitial) {
  const dernier = getDernierAvenantValide(contractId);
  if (!dernier || !dernier.nouveau_temps) return { value: tempsInitial, source: 'initial', avenant: null };
  return { value: dernier.nouveau_temps, source: 'avenant', avenant: dernier };
}

// --- RECHERCHEX Dernier avenant (colonne L = date_effet) ---
// =SIERREUR(RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!L:L; "Aucun"; 0; -1); "Aucun")
function getDateDernierAvenant(contractId) {
  const dernier = getDernierAvenantValide(contractId);
  if (!dernier || !dernier.date_effet) return { value: 'Aucun', avenant: null };
  return { value: dernier.date_effet, avenant: dernier };
}

// --- Calcul date prochain avenant (annuel) ---
// =DATE(ANNEE([@DateDébut]) + 1; MOIS([@DateDébut]); JOUR([@DateDébut]))
function getDateProchainAvenant(dateDebut, dernierAvenantDate) {
  const ref = dernierAvenantDate ? new Date(dernierAvenantDate) : new Date(dateDebut);
  const prochain = new Date(ref);
  prochain.setFullYear(prochain.getFullYear() + 1);
  return prochain.toISOString().slice(0, 10);
}

export default function ContratsD2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fStatut, setFStatut] = useState('');
  const [fType, setFType] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGantt, setShowGantt] = useState(false);
  const [histDialog, setHistDialog] = useState(null);
  const [avenantDialog, setAvenantDialog] = useState(null);
  const [newAvenant, setNewAvenant] = useState(null);
  const [snack, setSnack] = useState(null);
  const [editDialog, setEditDialog] = useState(null);
  const [editContrat, setEditContrat] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newContrat, setNewContrat] = useState(null);
  const [showNonEnvoyes, setShowNonEnvoyes] = useState(false);

  const filtered = useMemo(() => CONTRATS.filter(c => {
    if (fStatut && c.statut !== fStatut) return false;
    if (fType && c.type_contrat !== fType) return false;
    return true;
  }), [fStatut, fType, refreshKey]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Données pour le Gantt
  const ganttData = useMemo(() => {
    const now = new Date();
    const dateRef = new Date();
    dateRef.setFullYear(dateRef.getFullYear() - 3); // 3 ans en arrière

    return filtered.map(c => {
      const emp = findEmployee(c.employee_id);
      const debut = new Date(c.date_debut);
      const fin = c.date_fin ? new Date(c.date_fin) : now;
      const offsetMois = Math.round((debut - dateRef) / (30.44 * 86400000));
      const dureeMois = Math.max(1, Math.round((fin - debut) / (30.44 * 86400000)));
      return {
        name: `${emp ? emp.prenom[0] + '. ' + emp.nom : c.contract_number}`,
        full: emp ? employeeFullName(emp) : c.contract_number,
        type: c.type_contrat,
        statut: c.statut,
        offset: Math.max(0, offsetMois),
        duree: dureeMois,
        debut: c.date_debut,
        fin: c.date_fin || 'En cours',
      };
    }).sort((a, b) => a.offset - b.offset);
  }, [filtered, refreshKey]);

  return (
    <Box>
      {/* Génération automatique de contrats depuis le recrutement */}
      <GenerationContrats onContractsGenerated={() => setRefreshKey(k => k + 1)} />

      {/* === RÉCAPITULATIF DES ALERTES ÉCHÉANCES (NB.SI) === */}
      {(() => {
        const stats = filtered.reduce((acc, c) => {
          const dateFin = calculerDateFinAuto(c.date_debut, c.type_contrat, c.date_fin);
          if (!dateFin || c.type_contrat === 'CDI' || c.type_contrat === 'Freelance') { acc.cdi++; return acc; }
          const jrFin = joursRestants(dateFin);
          if (jrFin < 0) acc.expiré++;
          else if (jrFin <= 30) acc.renouveler++;
          else if (jrFin <= 60) acc.surveiller++;
          else acc.ok++;
          return acc;
        }, { expiré: 0, renouveler: 0, surveiller: 0, ok: 0, cdi: 0 });

        const alertes = [
          { label: '🔴 Expiré', count: stats.expiré, color: ROUGE, bg: 'rgba(179,58,74,0.1)' },
          { label: '🟠 À renouveler <30j', count: stats.renouveler, color: ROUGE, bg: 'rgba(179,58,74,0.08)' },
          { label: '🟡 À surveiller <60j', count: stats.surveiller, color: ORANGE, bg: 'rgba(184,106,42,0.08)' },
          { label: '🟢 OK / CDI', count: stats.ok + stats.cdi, color: VERT, bg: 'rgba(26,122,74,0.08)' },
        ];

        return (
          <Card sx={{ mb: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: 2 } }}>
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScheduleIcon fontSize='small' />
                </Box>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>Alertes Échéances Contractuelles</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>=NB.SI(Statut_Échéance; "🔴 Expiré") · Classification automatique</Typography>
                </Box>
              </Stack>
              <Grid container spacing={1}>
                {alertes.map((a, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Box sx={{ p: 1.5, bgcolor: a.bg, borderRadius: 1.5, textAlign: 'center', border: `1px solid ${a.color}20` }}>
                      <Typography variant='h5' fontWeight={800} sx={{ color: a.color, fontSize: '1.2rem', lineHeight: 1 }}>{a.count}</Typography>
                      <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block', mt: 0.3 }}>{a.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        );
      })()}

      {/* === FRISE TEMPORELLE : 10 PROCHAINES ÉCHÉANCES (TRIER+FILTER) === */}
      {(() => {
        const prochains = filtered
          .filter(c => {
            const dateFin = calculerDateFinAuto(c.date_debut, c.type_contrat, c.date_fin);
            if (!dateFin || c.type_contrat === 'CDI' || c.type_contrat === 'Freelance') return false;
            return joursRestants(dateFin) >= 0;
          })
          .map(c => {
            const dateFin = calculerDateFinAuto(c.date_debut, c.type_contrat, c.date_fin);
            const emp = findEmployee(c.employee_id);
            const jr = joursRestants(dateFin);
            return { ...c, dateFinCalculee: dateFin, jr, emp };
          })
          .sort((a, b) => a.jr - b.jr)
          .slice(0, 10);

        if (prochains.length === 0) return null;

        return (
          <Card sx={{ mb: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: 2 } }}>
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryIcon fontSize='small' />
                </Box>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>10 Prochaines Échéances</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>{'=TRIER(FILTER(Contrats; DateFin>AUJOURDHUI()); par jours restants)'}</Typography>
                </Box>
              </Stack>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Employé</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Date fin</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Jours restants</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Niveau urgence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prochains.map((c, i) => {
                      const couleur = c.jr <= 30 ? ROUGE : c.jr <= 60 ? ORANGE : VERT;
                      const niveau = c.jr <= 30 ? '🔴 Critique' : c.jr <= 60 ? '🟡 Attention' : '🟢 OK';
                      return (
                        <TableRow key={i} hover sx={{ bgcolor: c.jr <= 30 ? 'rgba(179,58,74,0.03)' : 'transparent' }}>
                          <TableCell>
                            <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{employeeFullName(c.emp)}</Typography>
                            <Typography variant='caption' sx={{ fontSize: '0.58rem', color: '#6b7a8a', display: 'block' }}>{c.contract_number}</Typography>
                          </TableCell>
                          <TableCell><Chip label={c.type_contrat} size='small' sx={{ fontSize: '0.55rem', height: 14 }} color={c.type_contrat === 'CDI' ? 'success' : 'warning'} variant='outlined' /></TableCell>
                          <TableCell><Typography variant='caption' sx={{ fontSize: '0.68rem' }}>{formatDate(c.dateFinCalculee)}</Typography></TableCell>
                          <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: couleur, fontFamily: 'monospace' }}>{c.jr}j</Typography></TableCell>
                          <TableCell><Chip label={niveau} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: `${couleur}15`, color: couleur, fontWeight: 600 }} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
      })()}

      {/* === ÉTAPE 7 : BOUCLAGE AUTO CONTRAT ↔ AVENANTS === */}
      <Card sx={{ mb: 2, border: `2px solid ${VIOLET}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(126,63,242,0.05) 0%, rgba(11,42,74,0.02) 100%)` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                🔄
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                  Bouclage automatique Contrat ↔ Avenants
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block' }}>
                  Les colonnes <strong>Salaire</strong>, <strong>Poste</strong>, <strong>Temps travail</strong> et <strong>Dernier avenant</strong> se mettent à jour automatiquement depuis le dernier avenant <strong>Signé</strong> ou <strong>Archivé</strong>.
                </Typography>
              </Box>
            </Stack>
            <Tooltip title='Formules Excel utilisées pour le bouclage'>
              <Box sx={{ bgcolor: 'rgba(126,63,242,0.08)', borderRadius: 1, p: 1, fontFamily: 'monospace', fontSize: '0.58rem', color: VIOLET, maxWidth: { xs: '100%', md: 480 } }}>
                <div>=SIERREUR(RECHERCHEX([@[N° Contrat]]; 'Avenants'!B:B; 'Avenants'!G:G; [@Salaire]; 0; -1); [@Salaire])</div>
                <div style={{ marginTop: 2 }}>↑ arg <strong>-1</strong> = recherche descendante (dernier avenant le plus récent)</div>
              </Box>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeader
            title='Contrats de travail'
            subtitle={`${filtered.length} contrat(s) · Calculs auto : durée, ancienneté, période d'essai · ÉTAPE 7 : bouclage auto Salaire/Poste/Temps/Dernier avenant`}
            action={<Stack direction='row' spacing={1}>
              <Button
                variant={showGantt ? 'contained' : 'outlined'} size='small'
                startIcon={<ScheduleIcon />}
                onClick={() => setShowGantt(!showGantt)}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                {showGantt ? 'Masquer Gantt' : 'Voir Gantt'}
              </Button>
              <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => { setNewContrat({ employee_id: '', type_contrat: 'CDI', date_debut: new Date().toISOString().slice(0, 10), date_fin: '', salaire_brut: 0, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' }); setCreateDialog(true); }}>Nouveau contrat</Button>
              <Button variant={showNonEnvoyes ? 'contained' : 'outlined'} size='small' sx={{ textTransform: 'none', fontSize: '0.75rem', color: ROUGE, borderColor: `${ROUGE}40` }} onClick={() => setShowNonEnvoyes(!showNonEnvoyes)}>
                {showNonEnvoyes ? 'Masquer non envoyés' : `Contrats non envoyés (${filtered.filter(c => !c.date_envoi).length})`}
              </Button>
            </Stack>}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField select size='small' label='Statut' value={fStatut} onChange={(e) => { setFStatut(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.statut_contrat.map(s => <MenuItem key={s} value={s}>{LABELS.statut_contrat[s] || s}</MenuItem>)}
            </TextField>
            <TextField select size='small' label='Type contrat' value={fType} onChange={(e) => { setFType(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
              <MenuItem value=''>Tous</MenuItem>
              {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Stack>

          {/* === ZONE CONTRATS NON ENVOYÉS === */}
          {showNonEnvoyes && (() => {
            const nonEnvoyes = filtered.filter(c => !c.date_envoi);
            return (
              <Alert
                severity={nonEnvoyes.length > 0 ? 'warning' : 'success'}
                icon={<MailIcon />}
                sx={{ mb: 2, borderRadius: 2, border: `1px solid ${nonEnvoyes.length > 0 ? ORANGE : VERT}30` }}
                action={
                  nonEnvoyes.length > 0 ? (
                    <Button
                      size='small'
                      onClick={() => {
                        nonEnvoyes.forEach(c => {
                          const idx = CONTRATS.findIndex(ct => ct.id === c.id);
                          if (idx !== -1) CONTRATS[idx].date_envoi = new Date().toISOString().slice(0, 10);
                        });
                        setRefreshKey(k => k + 1);
                        setSnack({ msg: `${nonEnvoyes.length} contrat(s) marqué(s) comme envoyé(s)`, severity: 'success' });
                      }}
                      sx={{ textTransform: 'none', fontSize: '0.7rem' }}
                    >
                      Tout marquer envoyé
                    </Button>
                  ) : null
                }
              >
                {nonEnvoyes.length > 0 ? (
                  <>
                    <strong>{nonEnvoyes.length} contrat(s) non envoyé(s)</strong> sur {filtered.length} total :
                    <Box component='div' sx={{ mt: 1 }}>
                      {nonEnvoyes.slice(0, 8).map((c, i) => {
                        const emp = findEmployee(c.employee_id);
                        return (
                          <Chip
                            key={i}
                            label={`${c.contract_number} — ${employeeFullName(emp)}`}
                            size='small'
                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem', bgcolor: 'rgba(184,106,42,0.1)', color: ORANGE }}
                          />
                        );
                      })}
                      {nonEnvoyes.length > 8 && <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}> +{nonEnvoyes.length - 8} autres</Typography>}
                    </Box>
                  </>
                ) : (
                  <strong>Tous les contrats ont été envoyés.</strong>
                )}
              </Alert>
            );
          })()}

          {/* === ALERTE AVENANTS À VENIR (30/60/90j) === */}
          {(() => {
        const avenantsAlerte = filtered.map(c => {
          // =SI([@[Type Contrat]]="CDI"; [@[Date Début]]+365; [@[Date Début]]+180)
          const dernierAvn = AVENANTS.filter(a => a.contract_id === c.id).sort((a,b) => new Date(b.date_effet) - new Date(a.date_effet))[0];
          const refDate = dernierAvn?.date_effet || c.date_debut;
          const prochainAvenant = new Date(refDate);
          prochainAvenant.setFullYear(prochainAvenant.getFullYear() + 1); // Annuel par défaut
          const jr = Math.ceil((prochainAvenant - new Date()) / 86400000);
          let alerte, couleur, bg;
          if (jr < 0) { alerte = '🔴 Expiré'; couleur = ROUGE; bg = 'rgba(179,58,74,0.08)'; }
          else if (jr <= 30) { alerte = '🟠 <30j'; couleur = ROUGE; bg = 'rgba(179,58,74,0.06)'; }
          else if (jr <= 60) { alerte = '🟡 <60j'; couleur = ORANGE; bg = 'rgba(184,106,42,0.06)'; }
          else { alerte = '🟢 OK'; couleur = VERT; bg = 'rgba(26,122,74,0.04)'; }
          return { c, prochainAvenant, jr, alerte, couleur, bg, emp: findEmployee(c.employee_id) };
        }).filter(a => a.jr <= 90); // Seulement ceux à venir dans 90j ou expirés

        if (avenantsAlerte.length === 0) return null;

        const counts = {
          expire: avenantsAlerte.filter(a => a.jr < 0).length,
          moins30: avenantsAlerte.filter(a => a.jr >= 0 && a.jr <= 30).length,
          moins60: avenantsAlerte.filter(a => a.jr > 30 && a.jr <= 60).length,
        };

        return (
          <Card sx={{ mb: 2.5, border: `1px solid ${ORANGE}20`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: 2 } }}>
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScheduleIcon fontSize='small' />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>Alertes Avenants à Venir (Anticipation 30/60/90j)</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>{'=SI(TypeContrat="CDI"; DateDébut+365; DateDébut+180) · =NB.SI(AA:AA; "🟠 <30j")'}</Typography>
                </Box>
                <Stack direction='row' spacing={0.5}>
                  <Chip label={`🔴 ${counts.expire}`} size='small' sx={{ fontSize: '0.6rem', bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 700 }} />
                  <Chip label={`🟠 ${counts.moins30}`} size='small' sx={{ fontSize: '0.6rem', bgcolor: 'rgba(179,58,74,0.08)', color: ROUGE, fontWeight: 700 }} />
                  <Chip label={`🟡 ${counts.moins60}`} size='small' sx={{ fontSize: '0.6rem', bgcolor: 'rgba(184,106,42,0.08)', color: ORANGE, fontWeight: 700 }} />
                </Stack>
              </Stack>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 220 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Employé</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Contrat</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Dernier avenant</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Prochain avenant</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Jours restants</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Alerte</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {avenantsAlerte.sort((a, b) => a.jr - b.jr).slice(0, 10).map((a, i) => (
                      <TableRow key={i} hover sx={{ bgcolor: a.bg }}>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{employeeFullName(a.emp)}</Typography></TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>{a.c.contract_number}</Typography></TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.65rem' }}>{formatDate(a.refDate)}</Typography></TableCell>
                        <TableCell><Typography variant='caption' sx={{ fontSize: '0.68rem' }}>{formatDate(a.prochainAvenant.toISOString().slice(0,10))}</Typography></TableCell>
                        <TableCell align='right'><Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: a.couleur, fontFamily: 'monospace' }}>{a.jr < 0 ? 'Expiré' : a.jr+'j'}</Typography></TableCell>
                        <TableCell><Chip label={a.alerte} size='small' sx={{ fontSize: '0.58rem', height: 16, bgcolor: a.bg, color: a.couleur, fontWeight: 700, border: `1px solid ${a.couleur}30` }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
          })()}

          {/* === GANTT DES CONTRATS === */}
          {showGantt && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fafcfe', borderRadius: 2, border: '1px solid #e9edf2' }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY, mb: 1 }}>
                Diagramme de Gantt — Chevauchements de contrats
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', mb: 1, display: 'block' }}>
                Visualise les périodes d'activité · Utile pour les remplacements · Axe = mois depuis 3 ans
              </Typography>
              <ResponsiveContainer width='100%' height={Math.max(200, ganttData.length * 28 + 40)}>
                <BarChart data={ganttData} layout='vertical' margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' horizontal={false} />
                  <XAxis
                    type='number'
                    domain={[0, 'dataMax']}
                    tick={{ fontSize: 10, fill: '#6b7a8a' }}
                    tickFormatter={(v) => v % 12 === 0 ? `${Math.floor(v / 12)}an` : `${v}m`}
                    label={{ value: 'Mois', position: 'insideBottom', fontSize: 10, fill: '#6b7a8a' }}
                  />
                  <YAxis type='category' dataKey='name' width={80} tick={{ fontSize: 10, fill: '#3a4a5a' }} />
                  <RTooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }}
                    formatter={(value, name, props) => {
                      if (name === 'offset') return [null, null];
                      const d = props.payload;
                      return [`${d.duree} mois · ${d.type} · ${d.fin === 'En cours' ? 'En cours' : formatDate(d.fin)}`, d.full];
                    }}
                  />
                  <ReferenceLine x={36} stroke={GOLD} strokeDasharray='4 2' label={{ value: 'Auj.', fontSize: 10, fill: ORANGE, position: 'top' }} />
                  <Bar dataKey='offset' stackId='gantt' fill='transparent' name='offset' />
                  <Bar dataKey='duree' stackId='gantt' radius={[0, 4, 4, 0]} name='Durée'>
                    {ganttData.map((d, i) => {
                      const color = d.statut === 'En vigueur' ? VERT : d.statut === 'Echu' ? '#9aa8b8' : d.statut === 'Resilie' ? ROUGE : ORANGE;
                      return <Cell key={i} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Stack direction='row' spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
                <Chip label='En vigueur' size='small' sx={{ bgcolor: VERT, color: '#fff', fontSize: '0.6rem' }} />
                <Chip label='Échu' size='small' sx={{ bgcolor: '#9aa8b8', color: '#fff', fontSize: '0.6rem' }} />
                <Chip label='Résilié' size='small' sx={{ bgcolor: ROUGE, color: '#fff', fontSize: '0.6rem' }} />
                <Chip label="Aujourd'hui" size='small' sx={{ bgcolor: GOLD, color: NAVY, fontSize: '0.6rem' }} />
              </Stack>
            </Box>
          )}

          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>N° Contrat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employé</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date début</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date fin <Chip label='auto' size='small' sx={{ fontSize: '0.5rem', height: 12, ml: 0.3 }} /></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Durée (mois) <Chip label='DATEDIF' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ancienneté <Chip label='DATEDIF' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fin essai <Chip label='auto' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IBAN <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mutuelle <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dossier Paie <Chip label='auto' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Avenants <Chip label='FILTER' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Salaire actuel <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Poste actuel <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Temps travail <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dernier avenant <Chip label='RECHERCHEX' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Prochain avenant <Chip label='auto' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Jours restants</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut Échéance <Chip label='SI' size='small' sx={{ fontSize: '0.5rem', height: 12 }} /></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>Salaire brut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>Actions</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>🔗 Fiche Employé</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>📄 Contrat PDF</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date envoi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map(c => {
                  const emp = findEmployee(c.employee_id);
                  const jr = c.date_fin ? joursRestants(c.date_fin) : null;
                  // Calculs automatiques
                  const dateFinAuto = calculerDateFinAuto(c.date_debut, c.type_contrat, c.date_fin);
                  const dureeMois = calculerDureeMois(c.date_debut, dateFinAuto);
                  const anciennete = calculerAncienneteComplete(c.date_debut);
                  const finEssai = calculerFinPeriodeEssai(c.date_debut, c.type_contrat);
                  const jrEssai = calculerJoursRestantsPeriodeEssai(c.date_debut, c.type_contrat);
                  // RECHERCHEX IBAN + Mutuelle
                  const ibanInfo = rechercherIBAN(c.employee_id);
                  const mutuelleInfo = rechercherMutuelle(c.employee_id);
                  const completude = evaluerCompletudePaie(ibanInfo, mutuelleInfo);
                  return (
                    <TableRow key={c.id} hover sx={{
                      bgcolor: !completude.complet ? 'rgba(179,58,74,0.04)' : 'transparent',
                      '&:hover': { bgcolor: !completude.complet ? 'rgba(179,58,74,0.08)' : 'action.hover' },
                    }}>
                      <TableCell><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.contract_number}</Typography></TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.8rem' }}>{employeeFullName(emp)}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>{emp?.departement}</Typography>
                      </TableCell>
                      <TableCell><Chip label={c.type_contrat} size='small' color={c.type_contrat === 'CDI' ? 'success' : 'warning'} variant='outlined' sx={{ fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(c.date_debut)}</Typography></TableCell>
                      <TableCell>
                        {dateFinAuto ? (
                          <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(dateFinAuto)}</Typography>
                        ) : (
                          <Chip label='Indéterminée' size='small' sx={{ fontSize: '0.6rem', height: 16, bgcolor: '#eef3f9', color: '#6b7a8a' }} />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 600, fontFamily: 'monospace' }}>
                          {dureeMois !== null ? `${dureeMois}` : '∞'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Depuis le ${formatDate(c.date_debut)} · ${anciennete.ans * 12 + anciennete.mois} mois total`}>
                          <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 600, color: NAVY }}>
                            {anciennete.texte}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {finEssai && (
                          <Stack direction='column' spacing={0.3}>
                            <Typography variant='caption' sx={{ fontSize: '0.68rem' }}>{formatDate(finEssai)}</Typography>
                            {jrEssai !== null && (
                              <Chip
                                label={jrEssai < 0 ? 'Essai fini' : `${jrEssai}j`}
                                size='small'
                                sx={{
                                  fontSize: '0.55rem', height: 14,
                                  bgcolor: jrEssai < 0 ? '#eef3f9' : jrEssai <= 15 ? ROUGE : jrEssai <= 30 ? ORANGE : VERT,
                                  color: jrEssai < 0 ? '#6b7a8a' : '#fff',
                                }}
                              />
                            )}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {ibanInfo ? (
                          <Tooltip title={`${ibanInfo.banque} · Statut: ${ibanInfo.statut}`}>
                            <Stack direction='column' spacing={0.2}>
                              <Typography variant='caption' sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>****{ibanInfo.rib?.slice(-4)}</Typography>
                              <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#6b7a8a' }}>{ibanInfo.banque}</Typography>
                            </Stack>
                          </Tooltip>
                        ) : (
                          <Chip label='⚠️ IBAN manquant' size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: 'rgba(179,58,74,0.1)', color: ROUGE, fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {mutuelleInfo ? (
                          <Tooltip title={`${mutuelleInfo.organisme} · ${mutuelleInfo.couverture} · ${mutuelleInfo.cotisation} FCFA/mois`}>
                            <Stack direction='column' spacing={0.2}>
                              <Typography variant='caption' sx={{ fontSize: '0.62rem', fontWeight: 600 }}>{mutuelleInfo.organisme}</Typography>
                              <Chip label={mutuelleInfo.couverture} size='small' sx={{ fontSize: '0.5rem', height: 12 }} color='success' variant='outlined' />
                            </Stack>
                          </Tooltip>
                        ) : (
                          <Chip label='Non souscrit' size='small' sx={{ fontSize: '0.55rem', height: 16, bgcolor: 'rgba(184,106,42,0.1)', color: ORANGE, fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={completude.label}>
                          <Chip
                            label={completude.complet ? '✅ OK' : '❌ Incomplet'}
                            size='small'
                            sx={{
                              fontSize: '0.6rem', height: 18, fontWeight: 700,
                              bgcolor: completude.color, color: '#fff',
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {/* Avenants (FILTER) */}
                        {(() => {
                          const avenantsList = filterAvenantsByContract(c.id);
                          return (
                            <Stack direction='row' spacing={0.5} alignItems='center'>
                              <Chip
                                label={avenantsList.length}
                                size='small'
                                sx={{
                                  fontSize: '0.6rem', height: 18, fontWeight: 700,
                                  bgcolor: avenantsList.length > 0 ? 'rgba(126, 63, 242, 0.15)' : '#eef3f9',
                                  color: avenantsList.length > 0 ? VIOLET : '#6b7a8a',
                                  cursor: 'pointer',
                                }}
                                onClick={() => setHistDialog(c)}
                              />
                              {avenantsList.length > 0 && (
                                <Tooltip title='Voir historique des avenants'>
                                  <IconButton size='small' onClick={() => setHistDialog(c)} sx={{ color: VIOLET, p: 0.2 }}>
                                    <HistoryIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell align='right'>
                        {/* ÉTAPE 7 : Salaire actuel (RECHERCHEX dernier avenant Signé/Archivé) */}
                        {(() => {
                          const salaireInfo = getSalaireActuel(c.id, c.salaire_brut);
                          const hasAvenant = salaireInfo.source === 'avenant';
                          return (
                            <Stack direction='column' alignItems='flex-end' spacing={0}>
                              <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: hasAvenant ? VIOLET : NAVY }}>
                                {formatNumber(salaireInfo.value)}
                              </Typography>
                              {hasAvenant && (
                                <Tooltip title={`Bouclage auto depuis ${salaireInfo.avenant.amendment_number} (statut: ${salaireInfo.avenant.statut})`}>
                                  <Typography variant='caption' sx={{ fontSize: '0.55rem', color: VIOLET }}>
                                    via avenant {salaireInfo.avenant.amendment_number}
                                  </Typography>
                                </Tooltip>
                              )}
                              {!hasAvenant && (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>salaire initial</Typography>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {/* ÉTAPE 7 : Poste actuel (RECHERCHEX col E dernier avenant) */}
                        {(() => {
                          const posteInfo = getPosteActuel(c.id, emp?.poste || '—');
                          const hasAvenant = posteInfo.source === 'avenant';
                          return (
                            <Stack direction='column' spacing={0}>
                              <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: hasAvenant ? 700 : 500, color: hasAvenant ? VIOLET : '#1a2a3a' }}>
                                {posteInfo.value}
                              </Typography>
                              {hasAvenant && (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: VIOLET }}>
                                  via avenant {posteInfo.avenant.amendment_number}
                                </Typography>
                              )}
                              {!hasAvenant && (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>poste initial</Typography>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {/* ÉTAPE 7 : Temps travail (RECHERCHEX col I dernier avenant) */}
                        {(() => {
                          const tempsInfo = getTempsTravailActuel(c.id, c.regime_travail || emp?.regime_travail || 'Temps plein');
                          const hasAvenant = tempsInfo.source === 'avenant';
                          return (
                            <Stack direction='column' spacing={0}>
                              <Chip
                                label={tempsInfo.value}
                                size='small'
                                variant={hasAvenant ? 'filled' : 'outlined'}
                                sx={{
                                  fontSize: '0.6rem', height: 18,
                                  bgcolor: hasAvenant ? 'rgba(184,106,42,0.15)' : 'transparent',
                                  color: hasAvenant ? ORANGE : '#4a5a6a',
                                  fontWeight: hasAvenant ? 700 : 500,
                                  border: hasAvenant ? `1px solid ${ORANGE}40` : '1px solid #d6dde6',
                                }}
                              />
                              {hasAvenant && (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: ORANGE, mt: 0.3 }}>
                                  via avenant {tempsInfo.avenant.amendment_number}
                                </Typography>
                              )}
                              {!hasAvenant && (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', mt: 0.3 }}>régime initial</Typography>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {/* ÉTAPE 7 : Dernier avenant (RECHERCHEX col L = date_effet) */}
                        {(() => {
                          const dernierInfo = getDateDernierAvenant(c.id);
                          const hasAvenant = dernierInfo.avenant !== null;
                          if (!hasAvenant) {
                            return (
                              <Stack direction='column' spacing={0}>
                                <Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#9aa8b8' }}>Aucun</Typography>
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#bbb' }}>=SIERREUR(RECHERCHEX...)</Typography>
                              </Stack>
                            );
                          }
                          return (
                            <Stack direction='column' spacing={0}>
                              <Typography variant='caption' sx={{ fontSize: '0.72rem', fontWeight: 700, color: VIOLET }}>
                                {formatDate(dernierInfo.value)}
                              </Typography>
                              <Typography variant='caption' sx={{ fontSize: '0.55rem', color: VIOLET }}>
                                {dernierInfo.avenant.amendment_number} · {dernierInfo.avenant.statut}
                              </Typography>
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {/* Prochain avenant (auto + alerte <30j) */}
                        {(() => {
                          const dernier = getDernierAvenant(c.id);
                          const prochain = getDateProchainAvenant(c.date_debut, dernier?.date_avenant);
                          const jr = joursRestants(prochain);
                          const isAlerte = jr !== null && jr <= 30 && jr >= 0;
                          return (
                            <Stack direction='column' spacing={0.2}>
                              <Typography variant='caption' sx={{ fontSize: '0.68rem' }}>{formatDate(prochain)}</Typography>
                              {isAlerte ? (
                                <Chip label={`⚠️ ${jr}j`} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: ROUGE, color: '#fff', fontWeight: 700 }} />
                              ) : jr !== null && jr <= 60 ? (
                                <Chip label={`${jr}j`} size='small' sx={{ fontSize: '0.55rem', height: 14, bgcolor: ORANGE, color: '#fff', fontWeight: 600 }} />
                              ) : (
                                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8' }}>{jr}j</Typography>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {jr !== null ? (
                          <Chip label={jr < 0 ? 'Expiré' : `${jr} j`} size='small' color={jr < 0 ? 'error' : jr < 30 ? 'error' : jr < 60 ? 'warning' : 'success'} variant='outlined' sx={{ fontSize: '0.65rem' }} />
                        ) : <Typography color='text.disabled'>—</Typography>}
                      </TableCell>
                      <TableCell>
                        {/* Statut Échéance (SI imbriquée) */}
                        {(() => {
                          const dateFin = calculerDateFinAuto(c.date_debut, c.type_contrat, c.date_fin);
                          if (!dateFin || c.type_contrat === 'CDI' || c.type_contrat === 'Freelance') {
                            return <Chip label='🟢 CDI' size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(26,122,74,0.1)', color: VERT, fontWeight: 600 }} />;
                          }
                          const jrFin = joursRestants(dateFin);
                          let statut, couleur, bg;
                          if (jrFin < 0) { statut = '🔴 Expiré'; couleur = ROUGE; bg = 'rgba(179,58,74,0.1)'; }
                          else if (jrFin <= 30) { statut = '🟠 <30j'; couleur = ROUGE; bg = 'rgba(179,58,74,0.1)'; }
                          else if (jrFin <= 60) { statut = '🟡 <60j'; couleur = ORANGE; bg = 'rgba(184,106,42,0.1)'; }
                          else { statut = '🟢 OK'; couleur = VERT; bg = 'rgba(26,122,74,0.1)'; }
                          return <Chip label={statut} size='small' sx={{ fontSize: '0.6rem', height: 18, bgcolor: bg, color: couleur, fontWeight: 700 }} />;
                        })()}
                      </TableCell>
                      <TableCell align='right'><MontantCell value={c.salaire_brut} /></TableCell>
                      <TableCell><StatusBadge status={c.statut} label={LABELS.statut_contrat[c.statut]} /></TableCell>
                      <TableCell align='center'>
                        <Stack direction='row' spacing={0.5} justifyContent='center'>
                          <Tooltip title='Voir la fiche employé'>
                            <IconButton size='small' color='primary' onClick={() => navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${c.employee_id}`)}>
                              <VisibilityIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Modifier le contrat'>
                            <IconButton size='small' color='info' onClick={() => { setEditContrat({ ...c }); setEditDialog(true); }}>
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='📄 Créer un avenant depuis ce contrat'>
                            <Button
                              size='small'
                              startIcon={<NoteAltIcon sx={{ fontSize: 14 }} />}
                              onClick={() => {
                                const emp = findEmployee(c.employee_id);
                                const num = generateAvenantNumber();
                                AVENANTS.push({
                                  id: `avn-${Date.now()}`,
                                  amendment_number: num,
                                  contract_id: c.id,
                                  employee_id: c.employee_id,
                                  poste_actuel: emp?.poste || '',
                                  nouveau_poste: '',
                                  salaire_ancien: c.salaire_brut,
                                  nouveau_salaire: c.salaire_brut,
                                  temps_ancien: emp?.regime_travail || 'Temps plein',
                                  nouveau_temps: '',
                                  motif: 'Augmentation',
                                  date_signature: '',
                                  date_effet: new Date().toISOString().slice(0, 10),
                                  statut: 'Projet',
                                  lien_document: '',
                                  notes: `Créé depuis contrat ${c.contract_number}`,
                                  date_avenant: new Date().toISOString().slice(0, 10),
                                  type_modification: 'Salaire',
                                  ancienne_valeur: `${formatNumber(c.salaire_brut)} FCFA`,
                                  nouvelle_valeur: '',
                                });
                                setSnack({ msg: `Avenant ${num} créé depuis le contrat ${c.contract_number} — Redirection vers la feuille Avenants...`, severity: 'success' });
                                setTimeout(() => navigate('/domaine2_Gestion_Administrative_Personnel/avenants'), 1500);
                              }}
                              sx={{
                                textTransform: 'none', fontSize: '0.65rem', p: '2px 6px', minWidth: 'auto',
                                bgcolor: 'rgba(126, 63, 242, 0.1)', color: VIOLET,
                                border: `1px solid ${VIOLET}30`,
                                '&:hover': { bgcolor: 'rgba(126, 63, 242, 0.2)' },
                              }}
                            >
                              📄 Avenant
                            </Button>
                          </Tooltip>
                          <Tooltip title='Dupliquer le contrat'>
                            <IconButton size='small' onClick={() => {
                              const num = `CTR-2026-${String(CONTRATS.length + 1).padStart(3, '0')}`;
                              CONTRATS.push({ ...c, id: `ctr-${Date.now()}`, contract_number: num, statut: 'En vigueur', observations: 'Copie du contrat ' + c.contract_number });
                              setRefreshKey(k => k + 1);
                              setSnack({ msg: `Contrat ${num} dupliqué avec succès`, severity: 'success' });
                            }}>
                              <ContentCopyIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      {/* 🔗 Fiche Employé (HYPERLINK contextuel) */}
                      <TableCell>
                        <Button
                          size='small'
                          startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                          onClick={() => navigate(`/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${c.employee_id}`)}
                          sx={{ textTransform: 'none', fontSize: '0.65rem', color: VIOLET, p: 0.3, minWidth: 'auto' }}
                        >
                          📂 Voir la fiche
                        </Button>
                      </TableCell>
                      {/* 📄 Contrat PDF (Export + modèle pré-rempli) */}
                      <TableCell align='center'>
                        <Tooltip title='Générer le contrat PDF'>
                          <IconButton
                            size='small'
                            sx={{ color: ROUGE }}
                            onClick={() => generateContractPDF(c, emp)}
                          >
                            <PictureAsPdfIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      {/* Date envoi contrat (mise à jour auto) */}
                      <TableCell>
                        {c.date_envoi ? (
                          <Stack direction='column' spacing={0.2}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                              label={formatDate(c.date_envoi)}
                              size='small'
                              sx={{ fontSize: '0.58rem', height: 16, bgcolor: 'rgba(26,122,74,0.1)', color: VERT, fontWeight: 600 }}
                            />
                          </Stack>
                        ) : (
                          <Tooltip title='Marquer comme envoyé'>
                            <Chip
                              icon={<MailIcon sx={{ fontSize: 12 }} />}
                              label='Non envoyé'
                              size='small'
                              variant='outlined'
                              onClick={() => {
                                const idx = CONTRATS.findIndex(ct => ct.id === c.id);
                                if (idx !== -1) {
                                  CONTRATS[idx].date_envoi = new Date().toISOString().slice(0, 10);
                                  setRefreshKey(k => k + 1);
                                  setSnack({ msg: `Contrat ${c.contract_number} marqué comme envoyé`, severity: 'success' });
                                }
                              }}
                              sx={{ fontSize: '0.58rem', height: 16, cursor: 'pointer', color: ORANGE, borderColor: `${ORANGE}40` }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div' count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage='Lignes:' labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* === DIALOG HISTORIQUE AVENANTS === */}
      <Dialog open={Boolean(histDialog)} onClose={() => setHistDialog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color='primary' /> Historique des avenants — {histDialog?.contract_number}
        </DialogTitle>
        <DialogContent>
          {histDialog && (() => {
            const avenants = filterAvenantsByContract(histDialog.id);
            const emp = findEmployee(histDialog.employee_id);
            return (
              <Box>
                <Alert severity='info' sx={{ mb: 2, fontSize: '0.78rem' }}>
                  {avenants.length} avenant(s) pour {employeeFullName(emp)} · Contrat {histDialog.contract_number} ({histDialog.type_contrat})
                </Alert>
                {avenants.length === 0 ? (
                  <Typography variant='body2' sx={{ py: 3, textAlign: 'center', color: '#6b7a8a' }}>Aucun avenant enregistré pour ce contrat.</Typography>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>N° Avenant</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Ancienne valeur</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Nouvelle valeur</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Motif</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Date effet</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {avenants.map((a, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{a.amendment_number}</TableCell>
                            <TableCell sx={{ fontSize: '0.72rem' }}>{formatDate(a.date_avenant)}</TableCell>
                            <TableCell><Chip label={a.type_modification} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.type_modification === 'Salaire' ? 'success' : a.type_modification === 'Poste' ? 'primary' : 'warning'} variant='outlined' /></TableCell>
                            <TableCell sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>{a.ancienne_valeur}</TableCell>
                            <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600, color: a.type_modification === 'Salaire' ? VERT : NAVY }}>{a.nouvelle_valeur}</TableCell>
                            <TableCell sx={{ fontSize: '0.68rem' }}>{a.motif}</TableCell>
                            <TableCell sx={{ fontSize: '0.72rem' }}>{formatDate(a.date_effet)}</TableCell>
                            <TableCell><Chip label={a.statut} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.statut === 'Active' ? 'success' : 'warning'} variant='outlined' /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHistDialog(null)}>Fermer</Button>
          {histDialog && (
            <Button variant='contained' startIcon={<NoteAltIcon />} onClick={() => { setAvenantDialog(histDialog); setNewAvenant({ date_avenant: new Date().toISOString().slice(0, 10), type_modification: 'Salaire', ancienne_valeur: '', nouvelle_valeur: '', motif: '', date_effet: new Date().toISOString().slice(0, 10) }); setHistDialog(null); }} sx={{ bgcolor: VIOLET }}>
              Ajouter avenant
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* === DIALOG NOUVEL AVENANT === */}
      <Dialog open={Boolean(avenantDialog)} onClose={() => setAvenantDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color='success' /> Nouvel avenant — {avenantDialog?.contract_number}
        </DialogTitle>
        <DialogContent>
          {avenantDialog && newAvenant && (() => {
            const emp = findEmployee(avenantDialog.employee_id);
            const dernier = getDernierAvenant(avenantDialog.id);
            const salaireInitial = dernier ? dernier.nouvelle_valeur : `${formatNumber(avenantDialog.salaire_brut)} FCFA`;
            return (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
                  Employé : <strong>{employeeFullName(emp)}</strong> · Salaire actuel : <strong>{salaireInitial}</strong>
                </Alert>
                <TextField
                  type='date' size='small' label='Date avenant' fullWidth
                  value={newAvenant.date_avenant}
                  onChange={(e) => setNewAvenant({ ...newAvenant, date_avenant: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select size='small' label='Type de modification' fullWidth
                  value={newAvenant.type_modification}
                  onChange={(e) => setNewAvenant({ ...newAvenant, type_modification: e.target.value })}
                >
                  {NOMENCLATURES.type_avenant.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <Stack direction='row' spacing={1.5}>
                  <TextField size='small' label='Ancienne valeur' fullWidth value={newAvenant.ancienne_valeur || salaireInitial} onChange={(e) => setNewAvenant({ ...newAvenant, ancienne_valeur: e.target.value })} />
                  <TextField size='small' label='Nouvelle valeur' fullWidth value={newAvenant.nouvelle_valeur} onChange={(e) => setNewAvenant({ ...newAvenant, nouvelle_valeur: e.target.value })} placeholder='Ex: 1300000 FCFA' />
                </Stack>
                <TextField size='small' label='Motif' fullWidth value={newAvenant.motif} onChange={(e) => setNewAvenant({ ...newAvenant, motif: e.target.value })} placeholder='Ex: Promotion, révision annuelle' />
                <TextField type='date' size='small' label='Date effet' fullWidth value={newAvenant.date_effet} onChange={(e) => setNewAvenant({ ...newAvenant, date_effet: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAvenantDialog(null)}>Annuler</Button>
          <Button
            variant='contained' startIcon={<SaveIcon />}
            onClick={() => {
              if (avenantDialog && newAvenant) {
                const emp = findEmployee(avenantDialog.employee_id);
                const num = `AVN-2026-${String(AVENANTS.length + 1).padStart(3, '0')}`;
                AVENANTS.push({
                  id: `avn-${Date.now()}`,
                  amendment_number: num,
                  contract_id: avenantDialog.id,
                  employee_id: avenantDialog.employee_id,
                  date_avenant: newAvenant.date_avenant,
                  type_modification: newAvenant.type_modification,
                  ancienne_valeur: newAvenant.ancienne_valeur,
                  nouvelle_valeur: newAvenant.nouvelle_valeur,
                  motif: newAvenant.motif,
                  date_effet: newAvenant.date_effet,
                  statut: 'Active',
                });
                setAvenantDialog(null);
                setRefreshKey(k => k + 1);
                setSnack({ msg: `Avenant ${num} créé pour ${employeeFullName(findEmployee(avenantDialog.employee_id))}`, severity: 'success' });
              }
            }}
            sx={{ bgcolor: VIOLET }}
          >
            Enregistrer l'avenant
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG ÉDITION CONTRAT === */}
      <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color='info' /> Modifier le contrat — {editContrat?.contract_number}
        </DialogTitle>
        <DialogContent>
          {editContrat && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
                Mode simulation : les modifications sont appliquées localement (mock).
              </Alert>
              <TextField type='date' size='small' label='Date début' fullWidth value={(editContrat.date_debut || '').slice(0, 10)} onChange={(e) => setEditContrat({ ...editContrat, date_debut: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField type='date' size='small' label='Date fin (vide = CDI)' fullWidth value={(editContrat.date_fin || '').slice(0, 10)} onChange={(e) => setEditContrat({ ...editContrat, date_fin: e.target.value || null })} InputLabelProps={{ shrink: true }} />
              <TextField select size='small' label='Type contrat' fullWidth value={editContrat.type_contrat} onChange={(e) => setEditContrat({ ...editContrat, type_contrat: e.target.value })}>
                {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField type='number' size='small' label='Salaire brut (FCFA)' fullWidth value={editContrat.salaire_brut} onChange={(e) => setEditContrat({ ...editContrat, salaire_brut: parseInt(e.target.value) || 0 })} />
              <TextField select size='small' label='Statut' fullWidth value={editContrat.statut} onChange={(e) => setEditContrat({ ...editContrat, statut: e.target.value })}>
                {NOMENCLATURES.statut_contrat.map(s => <MenuItem key={s} value={s}>{LABELS.statut_contrat[s] || s}</MenuItem>)}
              </TextField>
              <TextField size='small' label='Lieu de travail' fullWidth value={editContrat.lieu_travail || ''} onChange={(e) => setEditContrat({ ...editContrat, lieu_travail: e.target.value })} />
              <TextField size='small' label='Observations' fullWidth multiline rows={2} value={editContrat.observations || ''} onChange={(e) => setEditContrat({ ...editContrat, observations: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button variant='contained' startIcon={<SaveIcon />} onClick={() => {
            const idx = CONTRATS.findIndex(c => c.id === editContrat.id);
            if (idx !== -1) CONTRATS[idx] = { ...editContrat };
            setEditDialog(false);
            setRefreshKey(k => k + 1);
            setSnack({ msg: `Contrat ${editContrat.contract_number} modifié avec succès`, severity: 'success' });
          }} sx={{ bgcolor: VIOLET }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG NOUVEAU CONTRAT === */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color='success' /> Nouveau contrat de travail
        </DialogTitle>
        <DialogContent>
          {newContrat && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Alert severity='info' sx={{ fontSize: '0.75rem' }}>
                Sélectionnez un employé et remplissez les informations du contrat. Le N° de contrat sera généré automatiquement.
              </Alert>
              <TextField
                select size='small' label='Employé' fullWidth
                value={newContrat.employee_id}
                onChange={(e) => setNewContrat({ ...newContrat, employee_id: e.target.value })}
              >
                {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.matricule} — {employeeFullName(e)} ({e.statut})</MenuItem>)}
              </TextField>
              <Stack direction='row' spacing={1.5}>
                <TextField select size='small' label='Type de contrat' sx={{ flex: 1 }} value={newContrat.type_contrat} onChange={(e) => setNewContrat({ ...newContrat, type_contrat: e.target.value })}>
                  {NOMENCLATURES.type_contrat.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select size='small' label='Statut' sx={{ flex: 1 }} value={newContrat.statut} onChange={(e) => setNewContrat({ ...newContrat, statut: e.target.value })}>
                  {NOMENCLATURES.statut_contrat.map(s => <MenuItem key={s} value={s}>{LABELS.statut_contrat[s] || s}</MenuItem>)}
                </TextField>
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='date' size='small' label='Date début' fullWidth value={newContrat.date_debut} onChange={(e) => setNewContrat({ ...newContrat, date_debut: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField type='date' size='small' label='Date fin (vide=CDI)' fullWidth value={newContrat.date_fin} onChange={(e) => setNewContrat({ ...newContrat, date_fin: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction='row' spacing={1.5}>
                <TextField type='number' size='small' label='Salaire brut (FCFA)' fullWidth value={newContrat.salaire_brut} onChange={(e) => setNewContrat({ ...newContrat, salaire_brut: parseInt(e.target.value) || 0 })} />
                <TextField size='small' label='Lieu de travail' fullWidth value={newContrat.lieu_travail} onChange={(e) => setNewContrat({ ...newContrat, lieu_travail: e.target.value })} />
              </Stack>
              <TextField select size='small' label='Régime de travail' fullWidth value={newContrat.regime_travail} onChange={(e) => setNewContrat({ ...newContrat, regime_travail: e.target.value })}>
                {NOMENCLATURES.regime_travail.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <TextField size='small' label='Observations' fullWidth multiline rows={2} value={newContrat.observations} onChange={(e) => setNewContrat({ ...newContrat, observations: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Annuler</Button>
          <Button
            variant='contained' startIcon={<SaveIcon />}
            disabled={!newContrat?.employee_id}
            onClick={() => {
              const num = `CTR-2026-${String(CONTRATS.length + 1).padStart(3, '0')}`;
              CONTRATS.push({
                id: `ctr-${Date.now()}`,
                contract_number: num,
                employee_id: newContrat.employee_id,
                type_contrat: newContrat.type_contrat,
                date_debut: newContrat.date_debut,
                date_fin: newContrat.date_fin || null,
                salaire_brut: newContrat.salaire_brut,
                regime_travail: newContrat.regime_travail,
                lieu_travail: newContrat.lieu_travail,
                statut: newContrat.statut,
                observations: newContrat.observations,
              });
              setCreateDialog(false);
              setRefreshKey(k => k + 1);
              setSnack({ msg: `Contrat ${num} créé avec succès`, severity: 'success' });
            }}
            sx={{ bgcolor: VIOLET }}
          >
            Créer le contrat
          </Button>
        </DialogActions>
      </Dialog>

      {/* === SNACKBAR === */}
      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
