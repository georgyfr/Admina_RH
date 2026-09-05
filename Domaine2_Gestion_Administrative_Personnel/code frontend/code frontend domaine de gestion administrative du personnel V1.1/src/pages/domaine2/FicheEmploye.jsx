// ============================================================
// FicheEmploye.jsx — Centre de contrôle individuel employé
// Sélecteur universel (Autocomplete) + affichage automatique
// Équivalent Excel : RECHERCHEX / INDEX-EQUIV sur tous les onglets D2
// ============================================================
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Avatar, Grid, Divider, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert,
  Autocomplete, TextField, Button, IconButton, Tooltip, LinearProgress, Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  EMPLOYEES, CONTRATS, AVENANTS, DOCUMENTS, BANCAIRES, MUTUELLES,
  CONGES, SOLDES_CONGES, ABSENCES, HEURES_SUPP, FICHES_PAIE, POINTAGE,
  SANCTIONS, VISITES_MEDICALES, PRETS, DEPARTS, RAPPELS, PERMIS,
  findEmployee, employeeFullName, formatFCFA, formatNumber, formatDate,
  calculerAnciennete, joursRestants, LABELS,
} from './data';
import { calculerJoursRestants, evaluerEcheance, FEUX } from './seuils';
import ParcoursProfessionnel from './ParcoursProfessionnel';
import PerformanceIntegration from './PerformanceIntegration';
import ChecklistDocuments from './ChecklistDocuments';
import SimulateurConges from './SimulateurConges';
import NavigationIntelligente from './NavigationIntelligente';
import VisualiseurContrat from './VisualiseurContrat';
import HistoriqueAvenants from './HistoriqueAvenants';

// --- InfoRow : ligne clé/valeur dans la fiche identité ---
function InfoRow({ icon, label, value }) {
  return (
    <Stack direction='row' spacing={1.5} alignItems='center' sx={{ py: 0.8, borderBottom: '1px solid #f0f0f0' }}>
      <Box sx={{ color: '#6b7a8a', width: 20, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
      <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.72rem', minWidth: 110 }}>{label}</Typography>
      <Typography variant='body2' sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1a2a3a', flex: 1 }}>{value || '—'}</Typography>
    </Stack>
  );
}

// --- Statut badge ---
function StatutBadge({ statut }) {
  const color = statut === 'Actif' ? 'success' : statut === 'Inactif' ? 'default' : statut === 'Essai' ? 'warning' : 'error';
  const label = statut === 'Inactif' ? 'Ancien collaborateur' : statut;
  return <Chip label={label} color={color} size='small' sx={{ fontWeight: 700, fontSize: '0.72rem' }} variant={statut === 'Inactif' ? 'outlined' : 'filled'} />;
}

// --- Mini table pour les tabs ---
function MiniTable({ columns, rows, emptyMessage = 'Aucune donnée' }) {
  if (!rows || rows.length === 0) {
    return <Box sx={{ py: 3, textAlign: 'center', color: '#6b7a8a' }}><Typography variant='caption' sx={{ fontSize: '0.8rem' }}>{emptyMessage}</Typography></Box>;
  }
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 320 }}>
      <Table size='small' stickyHeader>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f4f7fc' }}>
            {columns.map(c => <TableCell key={c.key} align={c.align || 'left'} sx={{ fontWeight: 700, fontSize: '0.7rem' }}>{c.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} hover>
              {columns.map(c => (
                <TableCell key={c.key} align={c.align || 'left'} sx={{ fontSize: '0.75rem' }}>
                  {c.render ? c.render(r) : (r[c.key] !== undefined && r[c.key] !== null ? String(r[c.key]) : '—')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ============================================================
// Composant principal
// ============================================================
export default function FicheEmploye() {
  const [searchParams] = useSearchParams();
  const [selectedEmpId, setSelectedEmpId] = useState(searchParams.get('id') || 'emp-001');
  const [tab, setTab] = useState(0);

  const emp = useMemo(() => findEmployee(selectedEmpId), [selectedEmpId]);

  // Données liées à l'employé sélectionné (équivalent RECHERCHEX sur chaque onglet)
  const contrats = useMemo(() => CONTRATS.filter(c => c.employee_id === selectedEmpId), [selectedEmpId]);
  const avenants = useMemo(() => AVENANTS.filter(a => a.employee_id === selectedEmpId), [selectedEmpId]);
  const documents = useMemo(() => DOCUMENTS.filter(d => d.employee_id === selectedEmpId), [selectedEmpId]);
  const bancaires = useMemo(() => BANCAIRES.filter(b => b.employee_id === selectedEmpId), [selectedEmpId]);
  const mutuelles = useMemo(() => MUTUELLES.filter(m => m.employee_id === selectedEmpId), [selectedEmpId]);
  const conges = useMemo(() => CONGES.filter(c => c.employee_id === selectedEmpId), [selectedEmpId]);
  const soldes = useMemo(() => SOLDES_CONGES.filter(s => s.employee_id === selectedEmpId), [selectedEmpId]);
  const absences = useMemo(() => ABSENCES.filter(a => a.employee_id === selectedEmpId), [selectedEmpId]);
  const heuresSupp = useMemo(() => HEURES_SUPP.filter(h => h.employee_id === selectedEmpId), [selectedEmpId]);
  const fichesPaie = useMemo(() => FICHES_PAIE.filter(f => f.employee_id === selectedEmpId), [selectedEmpId]);
  const pointage = useMemo(() => POINTAGE.filter(p => p.employee_id === selectedEmpId), [selectedEmpId]);
  const sanctions = useMemo(() => SANCTIONS.filter(s => s.employee_id === selectedEmpId), [selectedEmpId]);
  const visites = useMemo(() => VISITES_MEDICALES.filter(v => v.employee_id === selectedEmpId), [selectedEmpId]);
  const prets = useMemo(() => PRETS.filter(p => p.employee_id === selectedEmpId), [selectedEmpId]);
  const departs = useMemo(() => DEPARTS.filter(d => d.employee_id === selectedEmpId), [selectedEmpId]);
  const rappels = useMemo(() => RAPPELS.filter(r => r.employee_id === selectedEmpId), [selectedEmpId]);
  const permis = useMemo(() => PERMIS.filter(p => p.employee_id === selectedEmpId), [selectedEmpId]);

  // Options pour l'Autocomplete (tous les employés, actifs + inactifs + essai)
  const options = useMemo(() => EMPLOYEES.map(e => ({
    id: e.id,
    label: `${e.matricule} — ${employeeFullName(e)} (${e.statut})`,
    matricule: e.matricule,
    nom: e.nom,
    prenom: e.prenom,
    statut: e.statut,
  })), []);

  const isAncien = emp?.statut === 'Inactif';
  const contratActif = contrats.find(c => c.statut === 'En vigueur') || contrats[0];

  const TABS = [
    { label: 'Informations', icon: <PersonIcon fontSize='small' /> },
    { label: 'Contrat', icon: <WorkIcon fontSize='small' /> },
    { label: 'Avenants', icon: <HistoryIcon fontSize='small' /> },
    { label: 'Documents', icon: <DescriptionIcon fontSize='small' /> },
    { label: 'Bancaire', icon: <AccountBalanceIcon fontSize='small' /> },
    { label: 'Mutuelle', icon: <HealthAndSafetyIcon fontSize='small' /> },
    { label: 'Congés', icon: <EventAvailableIcon fontSize='small' /> },
    { label: 'Paie', icon: <PaymentsIcon fontSize='small' /> },
    { label: 'Sanctions', icon: <GavelIcon fontSize='small' /> },
    { label: 'Visites', icon: <MedicalServicesIcon fontSize='small' /> },
    { label: 'Départs', icon: <LogoutIcon fontSize='small' /> },
  ];

  if (!emp) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Sélectionnez un employé dans la liste ci-dessus</Typography></Box>;
  }

  return (
    <Box>
      {/* === SÉLECTEUR UNIVERSEL (Autocomplete) === */}
      <Card sx={{ mb: 2.5, border: '2px solid #7e3ff2', borderRadius: '16px', boxShadow: '0 4px 16px rgba(126, 63, 242, 0.12)' }}>
        <CardContent sx={{ py: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems='center'>
            <Stack direction='row' spacing={1.5} alignItems='center' sx={{ flexShrink: 0 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#7e3ff2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchIcon />
              </Box>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.88rem', color: '#0b2a4a' }}>Sélecteur Universel</Typography>
                <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a' }}>Recherche par nom, prénom ou matricule</Typography>
              </Box>
            </Stack>
            <Autocomplete
              value={options.find(o => o.id === selectedEmpId) || null}
              onChange={(_, v) => v && setSelectedEmpId(v.id)}
              options={options}
              renderInput={(params) => (
                <TextField {...params} placeholder='Tapez un nom, prénom ou matricule...' size='small' sx={{ '& .MuiInput-root': { fontSize: '0.82rem' } }} />
              )}
              sx={{ flex: 1, minWidth: 250 }}
              renderOption={(props, option) => (
                <Box component='li' {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: option.statut === 'Actif' ? '#2a7a4a' : option.statut === 'Essai' ? '#b86a2a' : '#6b7a8a' }}>{option.prenom[0]}{option.nom[0]}</Avatar>
                    <Typography variant='caption' sx={{ fontSize: '0.78rem' }}>{option.label}</Typography>
                  </Stack>
                </Box>
              )}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return options.filter(o => o.label.toLowerCase().includes(q) || o.matricule.toLowerCase().includes(q) || o.nom.toLowerCase().includes(q) || o.prenom.toLowerCase().includes(q));
              }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              noOptionsText='Aucun employé trouvé'
            />
            <Chip label={`${EMPLOYEES.length} employés`} size='small' sx={{ bgcolor: 'rgba(126, 63, 242, 0.1)', color: '#7e3ff2', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
        </CardContent>
      </Card>

      {/* === EN-TÊTE FICHE (identité + photo + statut) === */}
      <Card sx={{ mb: 2.5, borderRadius: '16px', border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            {/* Photo / Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: isAncien ? '#6b7a8a' : '#7e3ff2', fontWeight: 700 }}>
                {emp.prenom[0]}{emp.nom[0]}
              </Avatar>
              {isAncien && (
                <Chip label='Ancien' size='small' sx={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', bgcolor: '#6b7a8a', color: '#fff', fontSize: '0.6rem', height: 18 }} />
              )}
            </Box>

            {/* Identité principale */}
            <Box sx={{ flex: 1 }}>
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 0.5 }}>
                <Typography variant='h5' fontWeight={700} sx={{ color: '#0b2a4a', fontSize: { xs: '1.1rem', md: '1.4rem' } }}>
                  {emp.civilite} {employeeFullName(emp)}
                </Typography>
                <StatutBadge statut={emp.statut} />
              </Stack>
              <Typography variant='body2' sx={{ color: '#4a5a6a', fontSize: '0.82rem', mb: 1 }}>
                {emp.poste} · {emp.departement} · {emp.type_contrat}
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <BadgeIcon sx={{ fontSize: 14, color: '#6b7a8a' }} />
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{emp.matricule}</Typography>
                </Stack>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <TrendingUpIcon sx={{ fontSize: 14, color: '#6b7a8a' }} />
                  <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>Ancienneté: {calculerAnciennete(emp.date_embauche)}</Typography>
                </Stack>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <AttachMoneyIcon sx={{ fontSize: 14, color: '#6b7a8a' }} />
                  <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatNumber(emp.salaire_brut)} FCFA</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Alertes échéances employé */}
            <Stack direction='row' spacing={1}>
              {documents.filter(d => d.statut !== 'Valide').map((d, i) => (
                <Tooltip key={i} title={`${d.type_document} — ${d.statut}`}>
                  <Chip icon={<DescriptionIcon sx={{ fontSize: 14 }} />} label={d.type_document} size='small' color='error' variant='outlined' sx={{ fontSize: '0.6rem' }} />
                </Tooltip>
              ))}
              {permis.filter(p => p.statut !== 'Valide').map((p, i) => (
                <Tooltip key={i} title={`${p.type_permit} — ${p.statut}`}>
                  <Chip icon={<BadgeIcon sx={{ fontSize: 14 }} />} label='Permis' size='small' color='warning' variant='outlined' sx={{ fontSize: '0.6rem' }} />
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* === ALERT ANCIEN COLLABORATEUR === */}
      {isAncien && (
        <Alert severity='info' sx={{ mb: 2.5, borderRadius: 2 }}>
          Cet employé est un <strong>ancien collaborateur</strong>. Les données affichées ci-dessous sont conservées à des fins d'archivage et de traçabilité. {departs.length > 0 ? `Motif de départ: ${LABELS.motif_depart[departs[0].motif_depart] || departs[0].motif_depart}.` : ''}
        </Alert>
      )}

      {/* === NAVIGATION INTELLIGENTE (boutons hyperliens contextuels) === */}
      <NavigationIntelligente employeeId={selectedEmpId} />

      {/* === FRISE CHRONOLOGIQUE PARCOURS PROFESSIONNEL === */}
      <ParcoursProfessionnel employeeId={selectedEmpId} />

      {/* === TABLEAU DE BORD INDIVIDUEL DES PERFORMANCES === */}
      <PerformanceIntegration employeeId={selectedEmpId} />

      {/* === CHECKLIST DOCUMENTAIRE DYNAMIQUE === */}
      <ChecklistDocuments employeeId={selectedEmpId} />

      {/* === SIMULATEUR DE CONGÉS & ABSENCES === */}
      <SimulateurConges employeeId={selectedEmpId} />

      {/* === TABS === */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 0.75, mb: 2.5, border: '1px solid #e9edf2', position: 'sticky', top: 0, zIndex: 10 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant='scrollable' scrollButtons='auto'
          sx={{ minHeight: 40, '& .MuiTab-root': { textTransform: 'none', fontSize: '0.78rem', fontWeight: 500, color: '#4a5a6a', minHeight: 36, borderRadius: '10px', mr: 0.3, gap: 0.8, '&.Mui-selected': { bgcolor: '#7e3ff2', color: '#fff' }, '& .MuiTab-iconWrapper': { marginBottom: '0 !important' } }, '& .MuiTabs-indicator': { display: 'none' } }}>
          {TABS.map((t, i) => <Tab key={i} label={t.label} icon={t.icon} iconPosition='start' />)}
        </Tabs>
      </Box>

      {/* === CONTENU DES TABS === */}
      {/* Tab 0 : Informations */}
      {tab === 0 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: '#0b2a4a' }}>Informations personnelles</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Matricule' value={emp.matricule} />
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Civilité' value={emp.civilite} />
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Nom complet' value={employeeFullName(emp)} />
              <InfoRow icon={<CakeIcon fontSize='small' />} label='Date de naissance' value={`${formatDate(emp.date_naissance)} (${emp.lieu_naissance})`} />
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Genre' value={emp.genre} />
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Nationalité' value={emp.nationalite} />
              <InfoRow icon={<PersonIcon fontSize='small' />} label='Situation familiale' value={emp.situation_familiale} />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoRow icon={<PhoneIcon fontSize='small' />} label='Téléphone' value={emp.telephone} />
              <InfoRow icon={<EmailIcon fontSize='small' />} label='Email' value={emp.email} />
              <InfoRow icon={<LocationOnIcon fontSize='small' />} label='Adresse' value={emp.adresse} />
              <Divider sx={{ my: 1 }} />
              <InfoRow icon={<BusinessIcon fontSize='small' />} label='Département' value={emp.departement} />
              <InfoRow icon={<WorkIcon fontSize='small' />} label='Poste' value={emp.poste} />
              <InfoRow icon={<WorkIcon fontSize='small' />} label='Type de contrat' value={emp.type_contrat} />
              <InfoRow icon={<WorkIcon fontSize='small' />} label='Catégorie' value={emp.categorie} />
              <InfoRow icon={<WorkIcon fontSize='small' />} label='Régime de travail' value={emp.regime_travail} />
              <InfoRow icon={<LocationOnIcon fontSize='small' />} label='Lieu de travail' value={emp.lieu_travail} />
              <InfoRow icon={<EventAvailableIcon fontSize='small' />} label="Date d'embauche" value={formatDate(emp.date_embauche)} />
              <InfoRow icon={<AttachMoneyIcon fontSize='small' />} label='Salaire brut' value={formatFCFA(emp.salaire_brut)} />
            </Grid>
          </Grid>
        </CardContent></Card>
      )}

      {/* Tab 1 : Contrat — Visualiseur complet + Export PDF */}
      {tab === 1 && (
        <VisualiseurContrat employeeId={selectedEmpId} />
      )}

      {/* Tab 2 : Avenants — Historique Avenants (FILTRE + CHOISIRCOLS + TRIER + graphique) */}
      {tab === 2 && (
        <HistoriqueAvenants employeeId={selectedEmpId} />
      )}

      {/* Tab 3 : Documents */}
      {tab === 3 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Documents ({documents.length})</Typography>
          <MiniTable
            columns={[
              { key: 'document_number', label: 'N° Document' },
              { key: 'type_document', label: 'Type' },
              { key: 'numero_document', label: 'Numéro' },
              { key: 'date_emission', label: 'Émission', render: r => formatDate(r.date_emission) },
              { key: 'date_expiration', label: 'Expiration', render: r => formatDate(r.date_expiration) },
              { key: 'jours_restants', label: 'Jours restants', render: r => {
                const j = calculerJoursRestants(r.date_expiration);
                if (j === null) return '—';
                const feu = evaluerEcheance('document', j);
                return <Chip label={j < 0 ? 'EXPIRÉ' : j + 'j'} size='small' sx={{ bgcolor: feu.color, color: '#fff', fontSize: '0.6rem', fontWeight: 700 }} />;
              }},
              { key: 'statut', label: 'Statut' },
              { key: 'lieu_depot', label: 'Lieu dépôt' },
            ]}
            rows={documents}
            emptyMessage='Aucun document pour cet employé'
          />
        </CardContent></Card>
      )}

      {/* Tab 4 : Bancaire */}
      {tab === 4 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Coordonnées bancaires ({bancaires.length})</Typography>
          <MiniTable
            columns={[
              { key: 'banque', label: 'Banque' },
              { key: 'agence', label: 'Agence' },
              { key: 'rib', label: 'RIB', render: r => <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>****{r.rib?.slice(-4)}</Typography> },
              { key: 'is_principal', label: 'Principal', render: r => <Chip label={r.is_principal ? 'Oui' : 'Non'} size='small' color={r.is_principal ? 'success' : 'default'} variant='outlined' /> },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={bancaires}
            emptyMessage='Aucune donnée bancaire pour cet employé'
          />
        </CardContent></Card>
      )}

      {/* Tab 5 : Mutuelle */}
      {tab === 5 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Mutuelle & Prévoyance ({mutuelles.length})</Typography>
          <MiniTable
            columns={[
              { key: 'organisme', label: 'Organisme' },
              { key: 'numero_adherent', label: 'N° Adhérent' },
              { key: 'date_adhesion', label: 'Adhésion', render: r => formatDate(r.date_adhesion) },
              { key: 'couverture', label: 'Couverture' },
              { key: 'personnes_a_charge', label: 'Personnes à charge', align: 'right' },
              { key: 'cotisation_mensuelle', label: 'Cotis. mensuelle', align: 'right', render: r => formatFCFA(r.cotisation_mensuelle) },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={mutuelles}
            emptyMessage='Aucune mutuelle pour cet employé'
          />
        </CardContent></Card>
      )}

      {/* Tab 6 : Congés + Soldes + Absences + HS + Pointage */}
      {tab === 6 && (
        <Stack spacing={2.5}>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Demandes de congés ({conges.length})</Typography>
            <MiniTable
              columns={[
                { key: 'leave_number', label: 'N°' },
                { key: 'type_conge', label: 'Type', render: r => LABELS.type_conge[r.type_conge] || r.type_conge },
                { key: 'date_debut', label: 'Du', render: r => formatDate(r.date_debut) },
                { key: 'date_fin', label: 'Au', render: r => formatDate(r.date_fin) },
                { key: 'nombre_jours', label: 'Jours', align: 'right' },
                { key: 'motif', label: 'Motif' },
                { key: 'statut', label: 'Statut', render: r => <Chip label={LABELS.statut_conge[r.statut]} size='small' color={r.statut === 'approuvee' ? 'success' : r.statut === 'en_attente' ? 'warning' : 'error'} variant='outlined' /> },
              ]}
              rows={conges}
              emptyMessage='Aucune demande de congé'
            />
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Solde de congés ({soldes.length})</Typography>
            <MiniTable
              columns={[
                { key: 'annee', label: 'Année' },
                { key: 'droit_annuel_jours', label: 'Droit annuel', align: 'right', render: r => `${r.droit_annuel_jours} j` },
                { key: 'conges_pris_jours', label: 'Pris', align: 'right', render: r => `${r.conges_pris_jours} j` },
                { key: 'conges_en_cours', label: 'En cours', align: 'right', render: r => `${r.conges_en_cours} j` },
                { key: 'solde_disponible', label: 'Solde', align: 'right', render: r => <strong style={{ color: r.solde_disponible < 5 ? '#b33a4a' : '#2a7a4a' }}>{r.solde_disponible} j</strong> },
                { key: 'taux_utilisation', label: 'Utilisation', align: 'right', render: r => `${r.taux_utilisation}%` },
              ]}
              rows={soldes}
              emptyMessage='Aucun solde de congés'
            />
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Absences ({absences.length}) · Heures supp. ({heuresSupp.length}) · Pointage ({pointage.length})</Typography>
            <MiniTable
              columns={[
                { key: 'type', label: 'Type' },
                { key: 'periode', label: 'Période' },
                { key: 'duree', label: 'Durée', align: 'right' },
                { key: 'motif', label: 'Motif' },
                { key: 'statut', label: 'Statut' },
              ]}
              rows={[
                ...absences.map(a => ({ type: LABELS.type_absence?.[a.type_absence] || a.type_absence, periode: `${formatDate(a.date_debut)} → ${formatDate(a.date_fin)}`, duree: `${a.duree_jours} j`, motif: a.motif, statut: LABELS.statut_absence?.[a.statut] || a.statut })),
                ...heuresSupp.map(h => ({ type: 'Heures supp', periode: h.semaine, duree: `${h.heures_supp}h`, motif: h.taux_majoration, statut: LABELS.statut_heures[h.statut] })),
                ...pointage.map(p => ({ type: 'Pointage', periode: p.semaine, duree: `${p.jours_presents}/${p.jours_presents + p.jours_absents}j`, motif: `${p.retards_minutes}min retard`, statut: p.statut })),
              ]}
              emptyMessage='Aucune donnée de présence'
            />
          </CardContent></Card>
        </Stack>
      )}

      {/* Tab 7 : Paie */}
      {tab === 7 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Fiches de paie ({fichesPaie.length})</Typography>
          <MiniTable
            columns={[
              { key: 'mois', label: 'Mois' },
              { key: 'salaire_brut', label: 'Brut', align: 'right', render: r => formatFCFA(r.salaire_brut) },
              { key: 'cotisations', label: 'Cotisations', align: 'right', render: r => formatFCFA(r.cotisations) },
              { key: 'taux_charges', label: 'Taux', align: 'right', render: r => `${r.taux_charges}%` },
              { key: 'net_a_payer', label: 'Net à payer', align: 'right', render: r => <strong>{formatFCFA(r.net_a_payer)}</strong> },
              { key: 'mode_paie', label: 'Mode' },
              { key: 'date_paiement', label: 'Date paiement', render: r => formatDate(r.date_paiement) },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={fichesPaie}
            emptyMessage='Aucune fiche de paie'
          />
        </CardContent></Card>
      )}

      {/* Tab 8 : Sanctions */}
      {tab === 8 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Sanctions disciplinaires ({sanctions.length})</Typography>
          <MiniTable
            columns={[
              { key: 'type_sanction', label: 'Type', render: r => <Chip label={LABELS.type_sanction[r.type_sanction]} size='small' color='error' variant='outlined' /> },
              { key: 'faute_commise', label: 'Faute' },
              { key: 'date_faute', label: 'Date faute', render: r => formatDate(r.date_faute) },
              { key: 'date_notification', label: 'Notification', render: r => formatDate(r.date_notification) },
              { key: 'duree_suspension_jours', label: 'Suspension', align: 'right', render: r => r.duree_suspension_jours ? `${r.duree_suspension_jours} j` : '—' },
              { key: 'statut', label: 'Statut' },
            ]}
            rows={sanctions}
            emptyMessage='Aucune sanction — employé exemplaire'
          />
        </CardContent></Card>
      )}

      {/* Tab 9 : Visites médicales */}
      {tab === 9 && (
        <Card><CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Visites médicales ({visites.length})</Typography>
          <MiniTable
            columns={[
              { key: 'type_visite', label: 'Type', render: r => LABELS.type_visite[r.type_visite] },
              { key: 'medecin_structure', label: 'Médecin/Structure' },
              { key: 'date_visite', label: 'Date visite', render: r => formatDate(r.date_visite) },
              { key: 'date_prochaine_visite', label: 'Prochaine', render: r => {
                if (!r.date_prochaine_visite) return '—';
                const j = calculerJoursRestants(r.date_prochaine_visite);
                const feu = evaluerEcheance('visiteMedicale', j);
                return <Chip label={j < 0 ? 'Expiré' : `${j}j`} size='small' sx={{ bgcolor: feu.color, color: '#fff', fontSize: '0.6rem' }} />;
              }},
              { key: 'aptitude', label: 'Aptitude', render: r => <Chip label={LABELS.aptitude[r.aptitude]} size='small' color={r.aptitude === 'apte' ? 'success' : 'error'} variant='outlined' /> },
              { key: 'cout', label: 'Coût', align: 'right', render: r => formatFCFA(r.cout) },
            ]}
            rows={visites}
            emptyMessage='Aucune visite médicale enregistrée'
          />
        </CardContent></Card>
      )}

      {/* Tab 10 : Départs + Prêts + Permis + Rappels */}
      {tab === 10 && (
        <Stack spacing={2.5}>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Dossier de départ ({departs.length})</Typography>
            <MiniTable
              columns={[
                { key: 'date_depart', label: 'Date départ', render: r => formatDate(r.date_depart) },
                { key: 'motif_depart', label: 'Motif', render: r => LABELS.motif_depart[r.motif_depart] },
                { key: 'solde_conges_jours', label: 'Solde congés', align: 'right', render: r => `${r.solde_conges_jours} j` },
                { key: 'dernier_salaire', label: 'Dernier salaire', align: 'right', render: r => formatFCFA(r.dernier_salaire) },
                { key: 'indemnite', label: 'Indemnité', align: 'right', render: r => formatFCFA(r.indemnite) },
                { key: 'statut_dossier', label: 'Statut', render: r => <Chip label={LABELS.statut_dossier[r.statut_dossier]} size='small' color={r.statut_dossier === 'clos' ? 'success' : 'warning'} /> },
              ]}
              rows={departs}
              emptyMessage={isAncien ? 'Dossier de départ non retrouvé' : 'Employé toujours en activité'}
            />
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Prêts & Avances ({prets.length})</Typography>
            <MiniTable
              columns={[
                { key: 'type_pret', label: 'Type', render: r => LABELS.type_pret[r.type_pret] },
                { key: 'montant_accorde', label: 'Montant', align: 'right', render: r => formatFCFA(r.montant_accorde) },
                { key: 'mensualite', label: 'Mensualité', align: 'right', render: r => formatFCFA(r.mensualite) },
                { key: 'duree_mois', label: 'Durée', align: 'right', render: r => `${r.duree_mois} mois` },
                { key: 'solde_restant', label: 'Solde restant', align: 'right', render: r => formatFCFA(r.solde_restant) },
                { key: 'statut', label: 'Statut', render: r => <Chip label={LABELS.statut_pret[r.statut]} size='small' color={r.statut === 'solde' ? 'success' : 'warning'} variant='outlined' /> },
              ]}
              rows={prets}
              emptyMessage='Aucun prêt en cours'
            />
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5, color: '#0b2a4a' }}>Permis & Autorisations ({permis.length}) · Rappels ({rappels.length})</Typography>
            <MiniTable
              columns={[
                { key: 'type', label: 'Type' },
                { key: 'numero', label: 'Numéro' },
                { key: 'date', label: 'Date' },
                { key: 'expiration', label: 'Expiration' },
                { key: 'statut', label: 'Statut' },
              ]}
              rows={[
                ...permis.map(p => ({ type: p.type_permit, numero: p.numero_permit, date: formatDate(p.date_delivrance), expiration: formatDate(p.date_expiration), statut: p.statut })),
                ...rappels.map(r => ({ type: LABELS.type_rappel[r.type_rappel], numero: '—', date: formatDate(r.date_echeance), expiration: '—', statut: LABELS.statut_rappel[r.statut] })),
              ]}
              emptyMessage='Aucun permis ni rappel'
            />
          </CardContent></Card>
        </Stack>
      )}
    </Box>
  );
}
