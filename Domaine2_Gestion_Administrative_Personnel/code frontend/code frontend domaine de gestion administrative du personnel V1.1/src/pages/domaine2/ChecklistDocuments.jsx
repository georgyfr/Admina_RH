// ============================================================
// ChecklistDocuments.jsx — Checklist documentaire dynamique
// Liste les documents obligatoires selon Type_Contrat + Département
// Équivalent Excel : =FILTER(_Liste_Docs_Obligatoires; Type_Contrat=...)
// + RECHERCHEX pour les dates de validité + mise en forme conditionnelle
// ============================================================
import { useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Grid, Divider, Alert,
  LinearProgress, Tooltip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { DOCUMENTS, findEmployee, formatDate, LABELS } from './data';
import { calculerJoursRestants } from './seuils';

const NAVY = '#0b2a4a';
const VIOLET = '#7e3ff2';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const GRIS = '#6b7a8a';

// ============================================================
// _Liste_Docs_Obligatoires : documents requis par type de contrat
// Équivalent feuille de référence Excel
// ============================================================
export const DOCS_OBLIGATOIRES = {
  CDI: [
    { code: 'CNI', label: 'Carte Nationale d\'Identité', duree_validite: 10, obligatoire: true, source: 'D2-5' },
    { code: 'CNPS', label: 'Attestation CNPS', duree_validite: 6, obligatoire: true, source: 'D2-5' },
    { code: 'CASIER', label: 'Casier Judiciaire', duree_validite: 3, obligatoire: true, source: 'D2-5' },
    { code: 'MEDICAL', label: 'Certificat Médical d\'Aptitude', duree_validite: 2, obligatoire: true, source: 'D2-21' },
    { code: 'DIPLOME', label: 'Diplôme le plus élevé', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'RIB', label: 'RIB Bancaire', duree_validite: null, obligatoire: true, source: 'D2-6' },
    { code: 'PHOTO', label: 'Photos d\'identité', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'DOMICILE', label: 'Certificat de Domicile', duree_validite: 1, obligatoire: false, source: 'D2-5' },
  ],
  CDD: [
    { code: 'CNI', label: 'Carte Nationale d\'Identité', duree_validite: 10, obligatoire: true, source: 'D2-5' },
    { code: 'CNPS', label: 'Attestation CNPS', duree_validite: 6, obligatoire: true, source: 'D2-5' },
    { code: 'CASIER', label: 'Casier Judiciaire', duree_validite: 3, obligatoire: true, source: 'D2-5' },
    { code: 'MEDICAL', label: 'Certificat Médical d\'Aptitude', duree_validite: 2, obligatoire: true, source: 'D2-21' },
    { code: 'DIPLOME', label: 'Diplôme', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'RIB', label: 'RIB Bancaire', duree_validite: null, obligatoire: true, source: 'D2-6' },
    { code: 'PHOTO', label: 'Photos d\'identité', duree_validite: null, obligatoire: true, source: 'D2-5' },
  ],
  Stage: [
    { code: 'CNI', label: 'Carte Nationale d\'Identité', duree_validite: 10, obligatoire: true, source: 'D2-5' },
    { code: 'MEDICAL', label: 'Certificat Médical d\'Aptitude', duree_validite: 2, obligatoire: true, source: 'D2-21' },
    { code: 'DIPLOME', label: 'Diplôme / Attestation scolaire', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'PHOTO', label: 'Photos d\'identité', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'CONVENTION', label: 'Convention de stage signée', duree_validite: null, obligatoire: true, source: 'D2-5' },
  ],
  Interim: [
    { code: 'CNI', label: 'Carte Nationale d\'Identité', duree_validite: 10, obligatoire: true, source: 'D2-5' },
    { code: 'CNPS', label: 'Attestation CNPS', duree_validite: 6, obligatoire: true, source: 'D2-5' },
    { code: 'MEDICAL', label: 'Certificat Médical d\'Aptitude', duree_validite: 2, obligatoire: true, source: 'D2-21' },
    { code: 'RIB', label: 'RIB Bancaire', duree_validite: null, obligatoire: true, source: 'D2-6' },
    { code: 'PHOTO', label: 'Photos d\'identité', duree_validite: null, obligatoire: true, source: 'D2-5' },
  ],
  Apprentissage: [
    { code: 'CNI', label: 'Carte Nationale d\'Identité', duree_validite: 10, obligatoire: true, source: 'D2-5' },
    { code: 'MEDICAL', label: 'Certificat Médical d\'Aptitude', duree_validite: 2, obligatoire: true, source: 'D2-21' },
    { code: 'DIPLOME', label: 'Diplôme / Attestation scolaire', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'CONTRAT_APPR', label: 'Contrat d\'apprentissage signé', duree_validite: null, obligatoire: true, source: 'D2-5' },
    { code: 'PHOTO', label: 'Photos d\'identité', duree_validite: null, obligatoire: true, source: 'D2-5' },
  ],
};

// Mapping entre codes de docs et les types_document dans DOCUMENTS (data.js)
const DOC_MAPPING = {
  CNI: ['CNI', 'Carte Nationale d\'Identité'],
  CNPS: ['Attestation CNPS', 'CNPS'],
  CASIER: ['Casier judiciaire', 'Casier'],
  MEDICAL: ['Certificat medical', 'Certificat Médical', 'Visite médicale'],
  DIPLOME: ['Diplome', 'Diplôme'],
  RIB: ['RIB bancaire', 'RIB'],
  PHOTO: ['Photo identite', 'Photo identité'],
  DOMICILE: ['Certificat domicile', 'Certificat de Domicile'],
  CONVENTION: ['Convention de stage'],
  CONTRAT_APPR: ['Contrat apprentissage'],
};

// ============================================================
// Calcul du statut d'un document
// Équivalent mise en forme conditionnelle :
//   Vert si date > AUJOURDHUI()+30
//   Orange si entre AUJOURDHUI() et AUJOURDHUI()+30
//   Rouge si date < AUJOURDHUI() ou "Non fourni"
// ============================================================
function calculerStatutDoc(docObligatoire, docsEmployee) {
  // Chercher le document correspondant dans les données de l'employé
  const aliases = DOC_MAPPING[docObligatoire.code] || [docObligatoire.code];
  const docFound = docsEmployee.find(d => {
    const typeDoc = d.type_document || '';
    return aliases.some(a => typeDoc.toLowerCase().includes(a.toLowerCase()));
  });

  if (!docFound) {
    return { statut: 'Manquant', color: ROUGE, icon: <CancelIcon fontSize='small' />, jours: null, date: null, doc: null };
  }

  // Document sans date d'expiration (permanent)
  if (!docFound.date_expiration) {
    return { statut: 'OK', color: VERT, icon: <CheckCircleIcon fontSize='small' />, jours: null, date: null, doc: docFound };
  }

  const jours = calculerJoursRestants(docFound.date_expiration);
  if (jours === null) {
    return { statut: 'OK', color: VERT, icon: <CheckCircleIcon fontSize='small' />, jours: null, date: docFound.date_expiration, doc: docFound };
  }

  if (jours < 0) {
    return { statut: 'Expiré', color: ROUGE, icon: <ErrorIcon fontSize='small' />, jours, date: docFound.date_expiration, doc: docFound };
  }
  if (jours <= 30) {
    return { statut: 'À renouveler (<30j)', color: ORANGE, icon: <WarningAmberIcon fontSize='small' />, jours, date: docFound.date_expiration, doc: docFound };
  }
  return { statut: 'OK', color: VERT, icon: <CheckCircleIcon fontSize='small' />, jours, date: docFound.date_expiration, doc: docFound };
}

// --- Ligne de checklist ---
function ChecklistRow({ docObligatoire, statutInfo, isLast }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1.5, borderBottom: isLast ? 'none' : '1px solid #f0f0f0', bgcolor: statutInfo.statut === 'Expiré' ? 'rgba(179,58,74,0.03)' : statutInfo.statut === 'Manquant' ? 'rgba(179,58,74,0.03)' : statutInfo.statut === 'À renouveler (<30j)' ? 'rgba(184,106,42,0.03)' : 'transparent' }}>
      {/* Icône statut */}
      <Box sx={{ color: statutInfo.color, display: 'flex', alignItems: 'center' }}>
        {statutInfo.icon}
      </Box>
      {/* Nom du document */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='body2' sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2a3a' }}>
          {docObligatoire.label}
          {!docObligatoire.obligatoire && (
            <Chip label='Optionnel' size='small' sx={{ ml: 0.5, fontSize: '0.55rem', height: 14, bgcolor: '#eef3f9', color: GRIS }} />
          )}
        </Typography>
        <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a' }}>
          {docObligatoire.source} · {docObligatoire.duree_validite ? `Validité: ${docObligatoire.duree_validite} ans` : 'Permanent'}
        </Typography>
      </Box>
      {/* Date d'expiration */}
      {statutInfo.date && (
        <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', minWidth: 80, textAlign: 'right' }}>
          {formatDate(statutInfo.date)}
        </Typography>
      )}
      {/* Badge statut */}
      <Chip
        label={statutInfo.statut}
        size='small'
        sx={{
          bgcolor: statutInfo.color,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.62rem',
          height: 20,
          minWidth: 90,
        }}
      />
    </Box>
  );
}

// ============================================================
// Composant principal
// ============================================================
export default function ChecklistDocuments({ employeeId }) {
  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);
  const docsEmployee = useMemo(() => DOCUMENTS.filter(d => d.employee_id === employeeId), [employeeId]);

  // Liste des docs obligatoires selon le type de contrat (FILTER)
  const docsRequis = useMemo(() => {
    if (!emp) return [];
    return DOCS_OBLIGATOIRES[emp.type_contrat] || DOCS_OBLIGATOIRES.CDI;
  }, [emp]);

  // Calculer le statut de chaque document
  const checklist = useMemo(() => {
    return docsRequis.map(doc => ({
      doc,
      statut: calculerStatutDoc(doc, docsEmployee),
    }));
  }, [docsRequis, docsEmployee]);

  // Compteurs
  const stats = useMemo(() => {
    const ok = checklist.filter(c => c.statut.statut === 'OK').length;
    const renouveler = checklist.filter(c => c.statut.statut === 'À renouveler (<30j)').length;
    const expire = checklist.filter(c => c.statut.statut === 'Expiré').length;
    const manquant = checklist.filter(c => c.statut.statut === 'Manquant').length;
    const total = checklist.length;
    const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
    return { ok, renouveler, expire, manquant, total, pct };
  }, [checklist]);

  // Alerte globale
  const hasCritique = stats.expire > 0 || stats.manquant > 0;
  const hasAttention = stats.renouveler > 0;

  if (!emp) return null;

  return (
    <Card sx={{ mt: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {/* En-tête */}
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AssignmentTurnedInIcon fontSize='small' />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
              Checklist Documentaire Dynamique
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.7rem' }}>
              Documents obligatoires pour {emp.type_contrat} · {checklist.length} documents requis
            </Typography>
          </Box>
          {/* Compteur principal */}
          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: stats.pct === 100 ? 'rgba(26,122,74,0.1)' : stats.pct >= 70 ? 'rgba(184,106,42,0.1)' : 'rgba(179,58,74,0.1)', minWidth: 80 }}>
            <Typography variant='h6' fontWeight={800} sx={{ color: stats.pct === 100 ? VERT : stats.pct >= 70 ? ORANGE : ROUGE, fontSize: '1.2rem', lineHeight: 1 }}>
              {stats.ok}/{stats.total}
            </Typography>
            <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block' }}>à jour</Typography>
          </Box>
        </Stack>

        {/* Barre de progression */}
        <LinearProgress
          variant='determinate'
          value={stats.pct}
          sx={{
            height: 10, borderRadius: 5, mb: 2, bgcolor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              bgcolor: stats.pct === 100 ? VERT : stats.pct >= 70 ? ORANGE : ROUGE,
              borderRadius: 5,
            },
          }}
        />

        {/* Alertes */}
        {hasCritique && (
          <Alert severity='error' icon={<ErrorIcon />} sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.78rem' }}>
            <strong>{stats.expire + stats.manquant} document(s) critique(s) :</strong>
            {' '}{stats.expire} expiré(s) · {stats.manquant} manquant(s). Action requise pour conformité.
          </Alert>
        )}
        {hasAttention && (
          <Alert severity='warning' icon={<WarningAmberIcon />} sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.78rem' }}>
            <strong>{stats.renouveler} document(s) à renouveler</strong> dans les 30 prochains jours. Anticipez le renouvellement.
          </Alert>
        )}
        {stats.pct === 100 && (
          <Alert severity='success' icon={<CheckCircleIcon />} sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.78rem' }}>
            <strong>Tous les documents sont à jour.</strong> Dossier administratif conforme.
          </Alert>
        )}

        {/* Compteurs détaillés */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Box sx={{ p: 1, bgcolor: 'rgba(26,122,74,0.06)', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant='h6' fontWeight={700} sx={{ color: VERT, fontSize: '0.95rem' }}>{stats.ok}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>OK</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ p: 1, bgcolor: 'rgba(184,106,42,0.06)', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant='h6' fontWeight={700} sx={{ color: ORANGE, fontSize: '0.95rem' }}>{stats.renouveler}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>À renouveler</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ p: 1, bgcolor: 'rgba(179,58,74,0.06)', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant='h6' fontWeight={700} sx={{ color: ROUGE, fontSize: '0.95rem' }}>{stats.expire}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Expiré</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ p: 1, bgcolor: 'rgba(179,58,74,0.06)', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant='h6' fontWeight={700} sx={{ color: ROUGE, fontSize: '0.95rem' }}>{stats.manquant}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a' }}>Manquant</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Liste checklist */}
        <Box sx={{ border: '1px solid #e9edf2', borderRadius: 1.5, overflow: 'hidden' }}>
          {checklist.map((item, i) => (
            <ChecklistRow
              key={i}
              docObligatoire={item.doc}
              statutInfo={item.statut}
              isLast={i === checklist.length - 1}
            />
          ))}
        </Box>

        {/* Note bas de checklist */}
        <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#9aa8b8', display: 'block', mt: 1.5, textAlign: 'center' }}>
          Liste générée automatiquement selon le type de contrat ({emp.type_contrat}).
          Les statuts se mettent à jour à chaque consultation (dates recalculées vs AUJOURDHUI()).
        </Typography>
      </CardContent>
    </Card>
  );
}
