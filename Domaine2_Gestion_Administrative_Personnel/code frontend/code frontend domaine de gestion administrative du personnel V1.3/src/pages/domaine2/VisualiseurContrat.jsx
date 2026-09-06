// ============================================================
// VisualiseurContrat.jsx — Visualiseur de contrat + Export PDF
// Affiche tous les détails du contrat (FILTER) + modèle pré-rempli
// + bouton export PDF (impression navigateur) + relance
// ============================================================
import { useState, useMemo, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailIcon from '@mui/icons-material/Mail';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CONTRATS, AVENANTS, findEmployee, employeeFullName, formatFCFA, formatNumber, formatDate, calculerAnciennete, LABELS, NOMENCLATURES } from './data';

const NAVY = '#0b2a4a';
const VIOLET = '#7e3ff2';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';

// --- InfosRow ---
function InfoRow({ label, value, bold }) {
  return (
    <Stack direction='row' justifyContent='space-between' sx={{ py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>{label}</Typography>
      <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: bold ? 700 : 500, color: '#1a2a3a', textAlign: 'right' }}>{value || '—'}</Typography>
    </Stack>
  );
}

// --- Clause ---
function Clause({ num, titre, contenu }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, display: 'block', mb: 0.3 }}>
        Article {num} — {titre}
      </Typography>
      <Typography variant='body2' sx={{ fontSize: '0.72rem', color: '#4a5a6a', lineHeight: 1.4, textAlign: 'justify' }}>
        {contenu}
      </Typography>
    </Box>
  );
}

export default function VisualiseurContrat({ employeeId }) {
  const [showModel, setShowModel] = useState(false);
  const [snack, setSnack] = useState(null);
  const [relanceDate, setRelanceDate] = useState(null);
  const modelRef = useRef(null);

  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);
  const contrats = useMemo(() => CONTRATS.filter(c => c.employee_id === employeeId), [employeeId]);
  const contratActif = useMemo(() => contrats.find(c => c.statut === 'En vigueur') || contrats[0], [contrats]);
  const avenants = useMemo(() => AVENANTS.filter(a => a.employee_id === employeeId).sort((a, b) => new Date(b.date_avenant) - new Date(a.date_avenant)), [employeeId]);

  if (!emp || !contratActif) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
        <Typography variant='body2' color='text.secondary'>Aucun contrat trouvé pour cet employé</Typography>
      </Box>
    );
  }

  const handleExportPDF = () => {
    setShowModel(true);
    setTimeout(() => {
      if (modelRef.current) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html><head><title>Contrat ${contratActif.contract_number} - ${employeeFullName(emp)}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a2a3a; max-width: 800px; margin: 0 auto; }
            h1 { color: #0b2a4a; font-size: 1.4rem; text-align: center; margin-bottom: 5px; }
            h2 { color: #0b2a4a; font-size: 1rem; margin-top: 20px; }
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
          </style>
          </head><body>
          <div class="header">
            <h1>CONTRAT DE TRAVAIL</h1>
            <p style="font-size: 0.8rem; color: #6b7a8a;">N° ${contratActif.contract_number} · ${contratActif.type_contrat}</p>
          </div>
          <table class="info-table">
            <tr><td>Employé</td><td>${emp.civilite} ${employeeFullName(emp)}</td></tr>
            <tr><td>Matricule</td><td>${emp.matricule}</td></tr>
            <tr><td>Poste</td><td>${emp.poste}</td></tr>
            <tr><td>Département</td><td>${emp.departement}</td></tr>
            <tr><td>Type de contrat</td><td>${contratActif.type_contrat}</td></tr>
            <tr><td>Date de début</td><td>${formatDate(contratActif.date_debut)}</td></tr>
            <tr><td>Date de fin</td><td>${contratActif.date_fin ? formatDate(contratActif.date_fin) : 'Indéterminée (CDI)'}</td></tr>
            <tr><td>Salaire brut mensuel</td><td>${formatNumber(contratActif.salaire_brut)} FCFA</td></tr>
            <tr><td>Régime de travail</td><td>${contratActif.regime_travail || emp.regime_travail}</td></tr>
            <tr><td>Lieu de travail</td><td>${contratActif.lieu_travail || emp.lieu_travail}</td></tr>
          </table>
          <div class="clauses">
            <div class="clause"><h3>Article 1 — Engagement</h3><p>L'employeur engage l'employé ci-dessus désigné, qui accepte, pour exercer les fonctions de ${emp.poste} au sein du département ${emp.departement}.</p></div>
            <div class="clause"><h3>Article 2 — Période d'essai</h3><p>Le présent contrat est conclu avec une période d'essai de ${contratActif.type_contrat === 'CDI' ? 'trois (3) mois' : 'un (1) mois'}, durant laquelle chacune des parties peut rompre le contrat sans préavis ni indemnité.</p></div>
            <div class="clause"><h3>Article 3 — Rémunération</h3><p>L'employé percevra un salaire brut mensuel de ${formatNumber(contratActif.salaire_brut)} FCFA, payable mensuellement à terme échu, sous déduction des cotisations sociales légales.</p></div>
            <div class="clause"><h3>Article 4 — Lieu et horaires de travail</h3><p>L'employé exercera ses fonctions à ${contratActif.lieu_travail || emp.lieu_travail}. Le régime de travail est ${contratActif.regime_travail || emp.regime_travail}, conformément à la réglementation du travail en vigueur.</p></div>
            <div class="clause"><h3>Article 5 — Obligations</h3><p>L'employé s'engage à exécuter ses fonctions avec loyauté et diligence, à respecter le règlement intérieur de l'entreprise et à observer la plus stricte discrétion professionnelle.</p></div>
            <div class="clause"><h3>Article 6 — Rupture</h3><p>${contratActif.type_contrat === 'CDI' ? 'Le présent contrat pourra être rompu par l\'une ou l\'autre des parties dans les conditions prévues par le Code du Travail.' : 'Le présent contrat prendra fin automatiquement à l\'expiration de la période stipulée, sans formalité particulière.'}</p></div>
          </div>
          <div class="signatures">
            <div class="sig-block">
              <p>Employeur (signature)</p>
              <div class="sig-line">Date et lieu</div>
            </div>
            <div class="sig-block">
              <p>Employé (signature)</p>
              <div class="sig-line">Date et lieu</div>
            </div>
          </div>
          <div class="footer">
            Conforme ISO 30401:2018 · Code du Travail camerounais (Loi n° 92/007 du 14/08/1992)<br/>
            Document généré automatiquement par Admina-RH · ${new Date().toLocaleDateString('fr-FR')}
          </div>
          </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }, 500);
  };

  const handleRelance = () => {
    const now = new Date().toISOString().slice(0, 10);
    setRelanceDate(now);
    setSnack({ msg: `Relance envoyée à ${emp.email} le ${formatDate(now)}`, severity: 'success' });
  };

  return (
    <Box>
      {/* === BARRE D'ACTIONS === */}
      <Stack direction='row' spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button variant='contained' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ bgcolor: ROUGE, textTransform: 'none', fontSize: '0.75rem' }}>
          Exporter en PDF
        </Button>
        <Button variant='outlined' size='small' startIcon={<VisibilityIcon />} onClick={() => setShowModel(true)} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
          Aperçu du contrat
        </Button>
        <Button variant='outlined' size='small' startIcon={<MailIcon />} onClick={handleRelance} sx={{ textTransform: 'none', fontSize: '0.75rem', color: ORANGE, borderColor: ORANGE }}>
          Envoyer relance
        </Button>
        {relanceDate && (
          <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label={`Dernière relance: ${formatDate(relanceDate)}`} size='small' sx={{ bgcolor: 'rgba(26,122,74,0.1)', color: VERT, fontWeight: 600, fontSize: '0.68rem' }} />
        )}
      </Stack>

      {/* === INFORMATIONS CONTRAT (FILTER) === */}
      <Card sx={{ mb: 2, border: `2px solid ${VIOLET}20`, borderRadius: '16px' }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
            <DescriptionIcon sx={{ color: VIOLET }} />
            <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
              Contrat actif — {contratActif.contract_number}
            </Typography>
            <Chip label={contratActif.type_contrat} size='small' color={contratActif.type_contrat === 'CDI' ? 'success' : 'warning'} variant='outlined' sx={{ fontSize: '0.62rem' }} />
            <Chip label={LABELS.statut_contrat[contratActif.statut] || contratActif.statut} size='small' color={contratActif.statut === 'En vigueur' ? 'success' : 'default'} sx={{ fontSize: '0.62rem' }} />
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow label='Employé' value={`${emp.civilite} ${employeeFullName(emp)}`} bold />
              <InfoRow label='Matricule' value={emp.matricule} />
              <InfoRow label='Poste' value={emp.poste} />
              <InfoRow label='Département' value={emp.departement} />
              <InfoRow label='Catégorie' value={emp.categorie} />
              <InfoRow label='Régime de travail' value={contratActif.regime_travail || emp.regime_travail} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label='Date de début' value={formatDate(contratActif.date_debut)} bold />
              <InfoRow label='Date de fin' value={contratActif.date_fin ? formatDate(contratActif.date_fin) : 'Indéterminée (CDI)'} />
              <InfoRow label='Salaire brut mensuel' value={`${formatNumber(contratActif.salaire_brut)} FCFA`} bold />
              <InfoRow label='Lieu de travail' value={contratActif.lieu_travail || emp.lieu_travail} />
              <InfoRow label='Observations' value={contratActif.observations || '—'} />
              <InfoRow label='Ancienneté' value={calculerAnciennete(emp.date_embauche)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* === HISTORIQUE DES AVENANTS === */}
      {avenants.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY, mb: 1 }}>
              Historique des avenants ({avenants.length})
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>N°</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Ancienne valeur</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Nouvelle valeur</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Motif</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avenants.map((a, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{a.amendment_number}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem' }}>{formatDate(a.date_avenant)}</TableCell>
                      <TableCell><Chip label={a.type_modification} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.type_modification === 'Salaire' ? 'success' : 'primary'} variant='outlined' /></TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', color: '#6b7a8a' }}>{a.ancienne_valeur}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: VERT }}>{a.nouvelle_valeur}</TableCell>
                      <TableCell sx={{ fontSize: '0.68rem' }}>{a.motif}</TableCell>
                      <TableCell><Chip label={a.statut} size='small' sx={{ fontSize: '0.58rem', height: 16 }} color={a.statut === 'Active' ? 'success' : 'warning'} variant='outlined' /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* === DIALOG APERÇU MODÈLE CONTRAT === */}
      <Dialog open={showModel} onClose={() => setShowModel(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <DescriptionIcon color='primary' /> Aperçu du contrat — {contratActif.contract_number}
          </Stack>
          <Button variant='contained' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ bgcolor: ROUGE, textTransform: 'none', fontSize: '0.72rem' }}>
            Imprimer / PDF
          </Button>
        </DialogTitle>
        <DialogContent>
          <div ref={modelRef} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* En-tête */}
            <Box sx={{ textAlign: 'center', borderBottom: `2px solid ${NAVY}`, pb: 2, mb: 3 }}>
              <Typography variant='h5' fontWeight={800} sx={{ color: NAVY, fontSize: '1.3rem' }}>CONTRAT DE TRAVAIL</Typography>
              <Typography variant='caption' sx={{ color: '#6b7a8a' }}>N° {contratActif.contract_number} · {contratActif.type_contrat}</Typography>
            </Box>
            {/* Informations */}
            <Table size='small'>
              <TableBody>
                <TableRow><TableCell sx={{ color: '#6b7a8a', width: '40%', fontSize: '0.8rem' }}>Employé</TableCell><TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{emp.civilite} {employeeFullName(emp)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Matricule</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{emp.matricule}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Poste</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{emp.poste}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Département</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{emp.departement}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Date de début</TableCell><TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{formatDate(contratActif.date_debut)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Date de fin</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{contratActif.date_fin ? formatDate(contratActif.date_fin) : 'Indéterminée (CDI)'}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Salaire brut mensuel</TableCell><TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{formatNumber(contratActif.salaire_brut)} FCFA</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Régime de travail</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{contratActif.regime_travail || emp.regime_travail}</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: '#6b7a8a', fontSize: '0.8rem' }}>Lieu de travail</TableCell><TableCell sx={{ fontSize: '0.8rem' }}>{contratActif.lieu_travail || emp.lieu_travail}</TableCell></TableRow>
              </TableBody>
            </Table>
            {/* Clauses */}
            <Box sx={{ mt: 3 }}>
              <Clause num='1' titre='Engagement' contenu={`L'employeur engage l'employé ci-dessus désigné, qui accepte, pour exercer les fonctions de ${emp.poste} au sein du département ${emp.departement}.`} />
              <Clause num='2' titre="Période d'essai" contenu={`Le présent contrat est conclu avec une période d'essai de ${contratActif.type_contrat === 'CDI' ? 'trois (3) mois' : 'un (1) mois'}, durant laquelle chacune des parties peut rompre le contrat sans préavis ni indemnité.`} />
              <Clause num='3' titre='Rémunération' contenu={`L'employé percevra un salaire brut mensuel de ${formatNumber(contratActif.salaire_brut)} FCFA, payable mensuellement à terme échu, sous déduction des cotisations sociales légales.`} />
              <Clause num='4' titre='Lieu et horaires de travail' contenu={`L'employé exercera ses fonctions à ${contratActif.lieu_travail || emp.lieu_travail}. Le régime de travail est ${contratActif.regime_travail || emp.regime_travail}.`} />
              <Clause num='5' titre='Obligations' contenu={`L'employé s'engage à exécuter ses fonctions avec loyauté et diligence, à respecter le règlement intérieur et à observer la plus stricte discrétion professionnelle.`} />
              <Clause num='6' titre='Rupture' contenu={contratActif.type_contrat === 'CDI' ? `Le présent contrat pourra être rompu par l'une ou l'autre des parties dans les conditions prévues par le Code du Travail.` : `Le présent contrat prendra fin automatiquement à l'expiration de la période stipulée.`} />
            </Box>
            {/* Signatures */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
              <Box sx={{ textAlign: 'center', width: '45%' }}>
                <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.75rem' }}>Employeur (signature)</Typography>
                <Box sx={{ borderTop: '1px solid #333', mt: 4, pt: 1 }}><Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#999' }}>Date et lieu</Typography></Box>
              </Box>
              <Box sx={{ textAlign: 'center', width: '45%' }}>
                <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.75rem' }}>Employé (signature)</Typography>
                <Box sx={{ borderTop: '1px solid #333', mt: 4, pt: 1 }}><Typography variant='caption' sx={{ fontSize: '0.7rem', color: '#999' }}>Date et lieu</Typography></Box>
              </Box>
            </Box>
            {/* Footer */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e9edf2', textAlign: 'center' }}>
              <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#9aa8b8' }}>
                Conforme ISO 30401:2018 · Code du Travail camerounais (Loi n° 92/007 du 14/08/1992)<br/>
                Document généré par Admina-RH · {formatDate(new Date().toISOString())}
              </Typography>
            </Box>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowModel(false)}>Fermer</Button>
          <Button variant='contained' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ bgcolor: ROUGE }}>Exporter en PDF</Button>
        </DialogActions>
      </Dialog>

      {/* === SNACKBAR === */}
      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snack?.msg} />
    </Box>
  );
}
