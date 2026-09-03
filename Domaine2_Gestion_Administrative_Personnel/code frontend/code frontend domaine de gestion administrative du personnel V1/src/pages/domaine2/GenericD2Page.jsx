import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Stack, Button, Chip, Typography, LinearProgress, Tooltip, IconButton, Alert, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DOCUMENTS, RAPPELS, HEURES_SUPP, DECLARATIONS, SANCTIONS, VISITES_MEDICALES, PRETS, DEPARTS, findEmployee, employeeFullName, formatFCFA, formatDate, joursRestants, LABELS, NOMENCLATURES, SOLDES_CONGES } from './data';
import { StatusBadge, SectionHeader, MontantCell, ProgressCell, JoursRestantsCell } from './components';

// --- Configuration des écrans ---
const SCREENS = {
  avenants: {
    title: 'Avenants de contrat',
    subtitle: 'Modifications contractuelles (salaire, poste, temps partiel) — traçabilité audit',
    columns: [
      { key: 'amendment_number', label: 'N° Avenant', width: 100 },
      { key: 'contract_id', label: 'Contrat', width: 100 },
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'date_avenant', label: 'Date', render: (r) => formatDate(r.date_avenant) },
      { key: 'type_modification', label: 'Type', render: (r) => <Chip label={r.type_modification} size='small' variant='outlined' /> },
      { key: 'ancienne_valeur', label: 'Ancienne valeur' },
      { key: 'nouvelle_valeur', label: 'Nouvelle valeur' },
      { key: 'motif', label: 'Motif' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: [], // pas de mock avenants
  },
  documents: {
    title: 'Suivi des documents',
    subtitle: 'Alertes expiration · déclenche rappels auto si < 15 jours',
    alert: (d) => { const exp = d.filter(x => x.statut === 'Expire' || x.statut === 'A renouveler'); return exp.length > 0 ? `${exp.length} document(s) à renouveler ou expiré(s)` : null; },
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_document', label: 'Type', render: (r) => <Chip label={r.type_document} size='small' variant='outlined' /> },
      { key: 'numero_document', label: 'N° Document', render: (r) => <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>{r.numero_document}</Typography> },
      { key: 'date_emission', label: 'Émission', render: (r) => formatDate(r.date_emission) },
      { key: 'date_expiration', label: 'Expiration', render: (r) => formatDate(r.date_expiration) },
      { key: 'jours', label: 'Jours restants', render: (r) => <JoursRestantsCell date={r.date_expiration} /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_document[r.statut]} /> },
      { key: 'lieu_depot', label: 'Lieu dépôt' },
    ],
    data: DOCUMENTS,
  },
  bancaires: {
    title: 'Données bancaires',
    subtitle: 'RIB masqué partiellement (****1234) — sécurité RGPD',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'banque', label: 'Banque' },
      { key: 'agence', label: 'Agence' },
      { key: 'rib', label: 'RIB', render: (r) => <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>****{r.rib?.slice(-4) || '****'}</Typography> },
      { key: 'is_principal', label: 'Principal', render: (r) => <Chip label={r.is_principal ? 'Oui' : 'Non'} size='small' color={r.is_principal ? 'success' : 'default'} variant='outlined' /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: [{ id: 'b1', employee_id: 'emp-001', banque: 'Afriland First Bank', agence: 'Bonanjo', rib: '3000100001203456789012', is_principal: true, statut: 'Actif' }, { id: 'b2', employee_id: 'emp-002', banque: 'BICEC', agence: 'Bastos', rib: '3000200002301456789012', is_principal: true, statut: 'Actif' }, { id: 'b3', employee_id: 'emp-003', banque: 'SGBC', agence: 'Akwa', rib: '3000300003402567890123', is_principal: true, statut: 'Actif' }, { id: 'b4', employee_id: 'emp-004', banque: 'UBA', agence: 'Bonapriso', rib: '3000400004503678901234', is_principal: true, statut: 'A verifier' }],
  },
  mutuelle: {
    title: 'Mutuelle & prévoyance',
    subtitle: 'Adhésions, couverture, cotisations',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'organisme', label: 'Organisme' },
      { key: 'numero_adherent', label: 'N° Adhérent', render: (r) => <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>{r.numero_adherent}</Typography> },
      { key: 'date_adhesion', label: 'Adhésion', render: (r) => formatDate(r.date_adhesion) },
      { key: 'couverture', label: 'Couverture', render: (r) => <Chip label={r.couverture} size='small' variant='outlined' /> },
      { key: 'cotisation_mensuelle', label: 'Cotis. mensuelle', align: 'right', render: (r) => <MontantCell value={r.cotisation_mensuelle} /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_adhesion?.[r.statut] || r.statut} /> },
    ],
    data: [{ id: 'm1', employee_id: 'emp-001', organisme: 'ACTIVA Assurances', numero_adherent: 'ACT-001', date_adhesion: '2019-01-20', couverture: 'Familiale', cotisation_mensuelle: 15000, statut: 'Active' }, { id: 'm2', employee_id: 'emp-002', organisme: 'SUNU Vie', numero_adherent: 'SUN-002', date_adhesion: '2020-03-10', couverture: 'Individuelle', cotisation_mensuelle: 8000, statut: 'Active' }, { id: 'm3', employee_id: 'emp-003', organisme: 'Saham Assurance', numero_adherent: 'SAH-003', date_adhesion: '2018-06-15', couverture: 'Familiale', cotisation_mensuelle: 18000, statut: 'Active' }, { id: 'm4', employee_id: 'emp-008', organisme: 'AXA Cameroun', numero_adherent: 'AXA-008', date_adhesion: '2024-02-05', couverture: 'Individuelle', cotisation_mensuelle: 10000, statut: 'Active' }],
  },
  permis: {
    title: 'Autorisations & permis',
    subtitle: 'Permis travail, carte séjour, visa — alertes expiration',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_permit', label: 'Type', render: (r) => <Chip label={r.type_permit} size='small' variant='outlined' /> },
      { key: 'numero_permit', label: 'N° Permis', render: (r) => <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>{r.numero_permit}</Typography> },
      { key: 'date_delivrance', label: 'Délivrance', render: (r) => formatDate(r.date_delivrance) },
      { key: 'date_expiration', label: 'Expiration', render: (r) => formatDate(r.date_expiration) },
      { key: 'jours', label: 'Jours restants', render: (r) => <JoursRestantsCell date={r.date_expiration} /> },
      { key: 'autorite', label: 'Autorité' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_permit[r.statut]} /> },
    ],
    data: [{ id: 'p1', employee_id: 'emp-008', type_permit: 'Carte sejour', numero_permit: 'CS-2024-008', date_delivrance: '2024-01-10', date_expiration: '2025-10-10', autorite: 'DGSN', statut: 'A renouveler' }, { id: 'p2', employee_id: 'emp-015', type_permit: 'Permis travail', numero_permit: 'PT-2021-015', date_delivrance: '2021-01-20', date_expiration: '2026-01-20', autorite: 'MINTSS', statut: 'Valide' }],
  },
  soldes: {
    title: 'Soldes de congés 2025',
    subtitle: '218 VLOOKUP + 648 COUNTIF Excel → SQL JOIN + SUM FILTER',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'droit_annuel_jours', label: 'Droit annuel', align: 'right', render: (r) => `${r.droit_annuel_jours} j` },
      { key: 'conges_pris_jours', label: 'Pris', align: 'right', render: (r) => `${r.conges_pris_jours} j` },
      { key: 'conges_en_cours', label: 'En cours', align: 'right', render: (r) => `${r.conges_en_cours} j` },
      { key: 'solde_disponible', label: 'Solde disponible', align: 'right', render: (r) => <Typography variant='body2' fontWeight={700} sx={{ color: r.solde_disponible < 5 ? 'error.main' : 'success.main' }}>{r.solde_disponible} j</Typography> },
      { key: 'taux_utilisation', label: 'Taux utilisation', render: (r) => <ProgressCell value={r.taux_utilisation} max={100} label={`${r.taux_utilisation}%`} /> },
    ],
    data: SOLDES_CONGES,
  },
  absences: {
    title: 'Absences maladie',
    subtitle: 'Workflow: déclaration → upload justificatif → validation manager → visite reprise si > 3j',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_absence', label: 'Type', render: (r) => <Chip label={LABELS.type_absence?.[r.type_absence] || r.type_absence} size='small' variant='outlined' /> },
      { key: 'date_debut', label: 'Du', render: (r) => formatDate(r.date_debut) },
      { key: 'date_fin', label: 'Au', render: (r) => formatDate(r.date_fin) },
      { key: 'duree_jours', label: 'Durée', align: 'right', render: (r) => `${r.duree_jours} j` },
      { key: 'motif', label: 'Motif' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_absence?.[r.statut]} /> },
    ],
    data: [{ id: 'a1', employee_id: 'emp-003', type_absence: 'maladie', date_debut: '2025-09-15', date_fin: '2025-09-20', duree_jours: 6, motif: 'Paludisme', statut: 'justifiee' }, { id: 'a2', employee_id: 'emp-010', type_absence: 'absence_non_justifiee', date_debut: '2025-08-20', date_fin: '2025-08-21', duree_jours: 2, motif: 'Non signalé', statut: 'non_justifiee' }, { id: 'a3', employee_id: 'emp-017', type_absence: 'accident_travail', date_debut: '2025-07-10', date_fin: '2025-07-25', duree_jours: 16, motif: 'Brûlure main', statut: 'justifiee' }],
  },
  'heures-supp': {
    title: 'Heures supplémentaires',
    subtitle: 'Validation manager OBLIGATOIRE avant intégration paie · Taux: 100% / 125% / 150%',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'semaine', label: 'Semaine' },
      { key: 'heures_normales', label: 'Heures normales', align: 'right', render: (r) => `${r.heures_normales}h` },
      { key: 'heures_supp', label: 'Heures supp.', align: 'right', render: (r) => <Chip label={`${r.heures_supp}h`} size='small' color='primary' variant='outlined' /> },
      { key: 'taux_majoration', label: 'Taux', render: (r) => <Chip label={r.taux_majoration} size='small' variant='outlined' /> },
      { key: 'montant_calcule', label: 'Montant calculé', align: 'right', render: (r) => <MontantCell value={r.montant_calcule} /> },
      { key: 'valide_par', label: 'Validé par', render: (r) => r.valide_par ? employeeFullName(findEmployee(r.valide_par)) : '—' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_heures[r.statut]} /> },
    ],
    data: HEURES_SUPP,
  },
  pointage: {
    title: 'Pointage de présence',
    subtitle: 'Saisie quotidienne → validation hebdo manager → export planning + paie',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'semaine', label: 'Semaine' },
      { key: 'jours_presents', label: 'Présents', align: 'right' },
      { key: 'jours_absents', label: 'Absents', align: 'right' },
      { key: 'retards_minutes', label: 'Retards (min)', align: 'right' },
      { key: 'taux_presence', label: 'Taux présence', render: (r) => <ProgressCell value={r.taux_presence} max={100} label={`${r.taux_presence}%`} /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: [{ id: 'pt1', employee_id: 'emp-001', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 0, taux_presence: 100, statut: 'valide' }, { id: 'pt2', employee_id: 'emp-003', semaine: 'S37-2025', jours_presents: 4, jours_absents: 1, retards_minutes: 30, taux_presence: 80, statut: 'valide' }, { id: 'pt3', employee_id: 'emp-008', semaine: 'S37-2025', jours_presents: 3, jours_absents: 2, retards_minutes: 0, taux_presence: 60, statut: 'brouillon' }, { id: 'pt4', employee_id: 'emp-014', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 15, taux_presence: 100, statut: 'valide' }],
  },
  planning: {
    title: 'Planning mensuel',
    subtitle: 'Génération auto depuis pointage → validation manager → clôture mensuelle',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'mois', label: 'Mois' },
      { key: 'jours_ouvrables', label: 'Ouvrables', align: 'right' },
      { key: 'jours_presents', label: 'Présents', align: 'right' },
      { key: 'jours_absents', label: 'Absents', align: 'right' },
      { key: 'heures_supp', label: 'Heures supp.', align: 'right', render: (r) => `${r.heures_supp}h` },
      { key: 'taux_presence', label: 'Taux', render: (r) => <ProgressCell value={r.taux_presence} max={100} label={`${r.taux_presence}%`} /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: [{ id: 'pl1', employee_id: 'emp-001', mois: '2025-09', jours_ouvrables: 22, jours_presents: 22, jours_absents: 0, heures_supp: 0, taux_presence: 100, statut: 'valide' }, { id: 'pl2', employee_id: 'emp-003', mois: '2025-09', jours_ouvrables: 22, jours_presents: 18, jours_absents: 4, heures_supp: 8, taux_presence: 82, statut: 'brouillon' }, { id: 'pl3', employee_id: 'emp-014', mois: '2025-09', jours_ouvrables: 22, jours_presents: 20, jours_absents: 2, heures_supp: 10, taux_presence: 91, statut: 'brouillon' }],
  },
  paie: {
    title: 'Fiches de paie',
    subtitle: 'KPI Obj. 3: 100% générées avant le 5 du mois · Génération: presence + congés + HS - prêts',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'mois', label: 'Mois' },
      { key: 'salaire_brut', label: 'Brut', align: 'right', render: (r) => <MontantCell value={r.salaire_brut} /> },
      { key: 'cotisations', label: 'Cotisations', align: 'right', render: (r) => <MontantCell value={r.cotisations} /> },
      { key: 'taux_charges', label: 'Taux', align: 'right', render: (r) => `${r.taux_charges}%` },
      { key: 'net_a_payer', label: 'Net à payer', align: 'right', render: (r) => <Typography variant='body2' fontWeight={700} sx={{ fontFamily: 'monospace' }}><MontantCell value={r.net_a_payer} /></Typography> },
      { key: 'mode_paie', label: 'Mode', render: (r) => <Chip label={r.mode_paie} size='small' variant='outlined' /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: [{ id: 'fp1', employee_id: 'emp-001', mois: '2025-08', salaire_brut: 1250000, cotisations: 312500, taux_charges: 25, net_a_payer: 937500, mode_paie: 'Virement', statut: 'payee' }, { id: 'fp2', employee_id: 'emp-002', mois: '2025-08', salaire_brut: 980000, cotisations: 245000, taux_charges: 25, net_a_payer: 735000, mode_paie: 'Virement', statut: 'payee' }, { id: 'fp3', employee_id: 'emp-008', mois: '2025-08', salaire_brut: 450000, cotisations: 112500, taux_charges: 25, net_a_payer: 337500, mode_paie: 'Cheque', statut: 'validee' }, { id: 'fp4', employee_id: 'emp-013', mois: '2025-08', salaire_brut: 80000, cotisations: 12000, taux_charges: 15, net_a_payer: 68000, mode_paie: 'Especes', statut: 'generee' }],
  },
  declarations: {
    title: 'Déclarations sociales',
    subtitle: 'KPI Obj. 5: 0 déclaration en retard · CNPS, Impôts, MINTSS',
    alert: (d) => { const r = d.filter(x => x.statut === 'en_retard'); return r.length > 0 ? `${r.length} déclaration(s) en retard — action urgente` : null; },
    columns: [
      { key: 'organisme', label: 'Organisme', render: (r) => <Chip label={r.organisme} size='small' color='primary' variant='outlined' /> },
      { key: 'type_declaration', label: 'Type' },
      { key: 'periode', label: 'Période' },
      { key: 'montant', label: 'Montant', align: 'right', render: (r) => <MontantCell value={r.montant} /> },
      { key: 'date_soumission', label: 'Soumise le', render: (r) => r.date_soumission ? formatDate(r.date_soumission) : '—' },
      { key: 'date_echeance', label: 'Échéance', render: (r) => formatDate(r.date_echeance) },
      { key: 'nombre_salaries', label: 'Salariés', align: 'right' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_declaration[r.statut]} /> },
    ],
    data: DECLARATIONS,
  },
  prets: {
    title: 'Prêts & avances',
    subtitle: 'Calculateur mensualité: M = (P × r/12) / (1 - (1+r/12)^-n) · Déductions auto en paie',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_pret', label: 'Type', render: (r) => <Chip label={LABELS.type_pret[r.type_pret]} size='small' variant='outlined' /> },
      { key: 'montant_accorde', label: 'Montant', align: 'right', render: (r) => <MontantCell value={r.montant_accorde} /> },
      { key: 'taux_interet', label: 'Taux', align: 'right', render: (r) => `${r.taux_interet}%` },
      { key: 'mensualite', label: 'Mensualité', align: 'right', render: (r) => <MontantCell value={r.mensualite} /> },
      { key: 'duree_mois', label: 'Durée', align: 'right', render: (r) => `${r.duree_mois} mois` },
      { key: 'solde_restant', label: 'Solde restant', render: (r) => <ProgressCell value={r.montant_accorde - r.solde_restant} max={r.montant_accorde} label={<MontantCell value={r.solde_restant} />} /> },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_pret[r.statut]} /> },
    ],
    data: PRETS,
  },
  sanctions: {
    title: 'Sanctions disciplinaires',
    subtitle: '4 niveaux: oral → écrit → blâme → suspension · Procédure légale (convocation 5j min)',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_sanction', label: 'Type', render: (r) => { const c = r.type_sanction === 'avertissement_oral' ? 'warning' : r.type_sanction === 'avertissement_ecrit' ? 'warning' : r.type_sanction === 'blame' ? 'error' : 'error'; return <Chip label={LABELS.type_sanction[r.type_sanction]} size='small' color={c} variant='outlined' />; } },
      { key: 'faute_commise', label: 'Faute' },
      { key: 'date_faute', label: 'Date faute', render: (r) => formatDate(r.date_faute) },
      { key: 'date_notification', label: 'Notification', render: (r) => formatDate(r.date_notification) },
      { key: 'duree_suspension_jours', label: 'Suspension', align: 'right', render: (r) => r.duree_suspension_jours ? `${r.duree_suspension_jours} j` : '—' },
      { key: 'valide_par', label: 'Validé par', render: (r) => employeeFullName(findEmployee(r.valide_par)) },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} /> },
    ],
    data: SANCTIONS,
  },
  'visites-medicales': {
    title: 'Visites médicales',
    subtitle: '4 types: embauche, périodique, reprise, demandée · 4 niveaux aptitude',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_visite', label: 'Type', render: (r) => <Chip label={LABELS.type_visite[r.type_visite]} size='small' variant='outlined' /> },
      { key: 'medecin_structure', label: 'Médecin/Structure' },
      { key: 'date_visite', label: 'Visite', render: (r) => formatDate(r.date_visite) },
      { key: 'date_prochaine_visite', label: 'Prochaine', render: (r) => <JoursRestantsCell date={r.date_prochaine_visite} /> },
      { key: 'aptitude', label: 'Aptitude', render: (r) => <StatusBadge status={r.aptitude} label={LABELS.aptitude[r.aptitude]} /> },
      { key: 'cout', label: 'Coût', align: 'right', render: (r) => <MontantCell value={r.cout} /> },
    ],
    data: VISITES_MEDICALES,
  },
  departs: {
    title: 'Dossiers de départs',
    subtitle: 'Checklist complète: attestation, certificat, solde tout compte, restitution matériel',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'date_depart', label: 'Date départ', render: (r) => formatDate(r.date_depart) },
      { key: 'motif_depart', label: 'Motif', render: (r) => <Chip label={LABELS.motif_depart[r.motif_depart]} size='small' color={r.motif_depart === 'licenciement' ? 'error' : 'default'} variant='outlined' /> },
      { key: 'solde_conges_jours', label: 'Solde congés', align: 'right', render: (r) => `${r.solde_conges_jours} j` },
      { key: 'dernier_salaire', label: 'Dernier salaire', align: 'right', render: (r) => <MontantCell value={r.dernier_salaire} /> },
      { key: 'indemnite', label: 'Indemnité', align: 'right', render: (r) => <MontantCell value={r.indemnite} /> },
      { key: 'documents_remis', label: 'Documents', render: (r) => <Typography variant='caption'>{r.documents_remis?.length || 0}/4</Typography> },
      { key: 'statut_dossier', label: 'Statut', render: (r) => <StatusBadge status={r.statut_dossier} label={LABELS.statut_dossier[r.statut_dossier]} /> },
    ],
    data: DEPARTS,
  },
  archivage: {
    title: 'Archivage documents',
    subtitle: 'Durées de conservation: 1 an / 3 ans / 5 ans (selon nature) — verrouillage en lecture seule',
    columns: [
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'type_document', label: 'Type' },
      { key: 'date_archive', label: 'Date archive', render: (r) => formatDate(r.date_archive) },
      { key: 'lieu_stockage', label: 'Lieu' },
      { key: 'duree_conservation', label: 'Durée conservation' },
      { key: 'responsable', label: 'Responsable' },
    ],
    data: [{ id: 'ar1', employee_id: 'emp-020', type_document: 'Dossier complet départ', date_archive: '2025-08-15', lieu_stockage: 'Coffre fort', duree_conservation: '5 ans', responsable: 'emp-004' }],
  },
  rappels: {
    title: 'Rappels administratifs',
    subtitle: 'Auto-génération quand document expire < 30j · tri par échéance',
    columns: [
      { key: 'type_rappel', label: 'Type', render: (r) => <Chip label={LABELS.type_rappel[r.type_rappel]} size='small' variant='outlined' /> },
      { key: 'description', label: 'Description' },
      { key: 'employee', label: 'Employé', render: (r) => employeeFullName(findEmployee(r.employee_id)) },
      { key: 'date_echeance', label: 'Échéance', render: (r) => formatDate(r.date_echeance) },
      { key: 'jours', label: 'Statut échéance', render: (r) => <JoursRestantsCell date={r.date_echeance} /> },
      { key: 'responsable', label: 'Responsable', render: (r) => employeeFullName(findEmployee(r.responsable_suivi)) },
      { key: 'action_requise', label: 'Action requise' },
      { key: 'statut', label: 'Statut', render: (r) => <StatusBadge status={r.statut} label={LABELS.statut_rappel[r.statut]} /> },
    ],
    data: RAPPELS,
  },
};

export default function GenericD2Page({ screen }) {
  const config = SCREENS[screen];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const data = config?.data || [];
  const pageRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const alertMsg = config?.alert ? config.alert(data) : null;

  if (!config) {
    return <Box sx={{ p: 3 }}><Typography>Écran non configuré: {screen}</Typography></Box>;
  }

  return (
    <Box>
      {alertMsg && (
        <Alert severity='error' icon={<WarningAmberIcon />} sx={{ mb: 2, fontWeight: 600 }}>
          {alertMsg}
        </Alert>
      )}
      <Card>
        <CardContent>
          <SectionHeader
            title={config.title}
            subtitle={config.subtitle}
            action={<Button variant='contained' size='small' startIcon={<AddIcon />}>Nouveau</Button>}
          />
          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {config.columns.map(c => (
                    <TableCell key={c.key} align={c.align || 'left'} sx={{ fontWeight: 700 }}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row, i) => (
                  <TableRow key={row.id || i} hover>
                    {config.columns.map(c => (
                      <TableCell key={c.key} align={c.align || 'left'}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={config.columns.length} align='center' sx={{ py: 4, color: 'text.secondary' }}>Aucun enregistrement</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 0 && (
            <TablePagination
              component='div' count={data.length} page={page} onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage='Lignes:' labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
