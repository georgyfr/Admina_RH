// ============================================================
// HistoriqueAvenants.jsx — Zone "Historique Avenants" dans la Fiche Employé
// ÉTAPE 6 : Affichage automatique de tous les avenants d'un employé
//
// Excel équivalent :
//   =TRIER(
//     FILTRE(
//       CHOISIRCOLS('Avenants'!A:O; 13; 6; 7; 4; 5; 11; 10; 9);
//       'Avenants'!C:C = $B$2
//     );
//     6; -1
//   )
//
//   - FILTRE : sur employee_id (équivalent colonne C = employé)
//   - CHOISIRCOLS : 8 colonnes sélectionnées
//       13 (M=Statut), 6 (F=Salaire ancien), 7 (G=Nouveau salaire),
//       4 (D=Poste actuel), 5 (E=Nouveau poste), 11 (K=Date effet/signature),
//       10 (J=Motif), 9 (I=Nouveau temps)
//   - TRIER : sur colonne 6 (Date effet) ordre décroissant (-1)
//
// + Graphique en courbes (Date effet → Nouveau salaire) pour évolution rémunération
// ============================================================
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Grid, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Tooltip, Link, Button,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import HistoryIcon from '@mui/icons-material/History';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { AVENANTS, findEmployee, employeeFullName, formatNumber, formatDate } from './data';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const GRIS = '#6b7a8a';

// --- Couleurs statuts avenant (cohérent avec AvenantsModule) ---
const STATUT_STYLES = {
  'Archivé':           { color: VERT,   bg: 'rgba(26,122,74,0.1)',   label: '🟢 Archivé' },
  'Signé':             { color: ORANGE, bg: 'rgba(184,106,42,0.1)',  label: '🟠 Signé' },
  'Envoyé au salarié':  { color: BLEU,   bg: 'rgba(42,106,154,0.1)',  label: '🔵 Envoyé' },
  'Projet':            { color: GRIS,   bg: 'rgba(107,122,138,0.1)', label: '⚪ Projet' },
  'Refusé':            { color: ROUGE,  bg: 'rgba(179,58,74,0.1)',   label: '🔴 Refusé' },
};

// --- Mapping Excel colonnes → champ avenant (structure A-O du module) ---
// A=1 N°Avenant, B=2 N°Contrat, C=3 Employé, D=4 Poste actuel, E=5 Nouveau poste,
// F=6 Salaire ancien, G=7 Nouveau salaire, H=8 Temps ancien, I=9 Nouveau temps,
// J=10 Motif, K=11 Date signature, L=12 Date effet, M=13 Statut, N=14 Lien doc, O=15 Notes
const CHOISIRCOLS = [
  { pos: 1, col: 13, field: 'statut',         label: 'Statut',           align: 'center' },
  { pos: 2, col: 6,  field: 'salaire_ancien', label: 'Salaire ancien',   align: 'right',  monospace: true },
  { pos: 3, col: 7,  field: 'nouveau_salaire', label: 'Nouveau salaire',  align: 'right',  monospace: true, bold: true },
  { pos: 4, col: 4,  field: 'poste_actuel',    label: 'Poste actuel' },
  { pos: 5, col: 5,  field: 'nouveau_poste',   label: 'Nouveau poste' },
  { pos: 6, col: 11, field: 'date_effet',      label: 'Date effet',      bold: true },
  { pos: 7, col: 10, field: 'motif',          label: 'Motif' },
  { pos: 8, col: 9,  field: 'nouveau_temps',   label: 'Nouveau temps' },
];

// --- Formatage cellule selon le champ ---
function formatCell(avenant, field) {
  const val = avenant[field];
  if (val === undefined || val === null || val === '') return '—';
  if (field === 'salaire_ancien' || field === 'nouveau_salaire') {
    return `${formatNumber(val)} FCFA`;
  }
  if (field === 'date_effet' || field === 'date_signature') {
    return formatDate(val);
  }
  if (field === 'statut') {
    const style = STATUT_STYLES[val] || STATUT_STYLES['Projet'];
    return style.label;
  }
  return String(val);
}

export default function HistoriqueAvenants({ employeeId }) {
  const navigate = useNavigate();
  // --- Étape 1 : FILTRE sur employee_id (équivalent =FILTRE(...; Avenants!C:C=$B$2)) ---
  // $B$2 dans Excel = nom de l'employé (cellule d'identité de la fiche)
  // Ici on filtre directement par employee_id (équivalent sémantique)
  const avenantsEmploye = useMemo(
    () => AVENANTS.filter(a => a.employee_id === employeeId),
    [employeeId]
  );

  // --- Étape 2 : CHOISIRCOLS — sélection des 8 colonnes ---
  // (fait à l'affichage via CHOISIRCOLS ci-dessus)

  // --- Étape 3 : TRIER sur colonne 6 (Date effet), ordre décroissant (-1) ---
  const avenantsTries = useMemo(
    () => [...avenantsEmploye].sort((a, b) => {
      const da = a.date_effet ? new Date(a.date_effet).getTime() : 0;
      const db = b.date_effet ? new Date(b.date_effet).getTime() : 0;
      return db - da; // -1 = décroissant
    }),
    [avenantsEmploye]
  );

  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);

  // --- Données pour le graphique (Date effet → Nouveau salaire) ---
  // Tri ASC pour le graphique (chronologique gauche→droite)
  const chartData = useMemo(() => {
    return [...avenantsEmploye]
      .filter(a => a.date_effet && a.nouveau_salaire)
      .sort((a, b) => new Date(a.date_effet) - new Date(b.date_effet))
      .map(a => ({
        date: formatDate(a.date_effet),
        dateShort: new Date(a.date_effet).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        salaire: a.nouveau_salaire,
        ancien: a.salaire_ancien || null,
        motif: a.motif,
        numero: a.amendment_number,
      }));
  }, [avenantsEmploye]);

  // --- KPIs dérivés ---
  const kpis = useMemo(() => {
    if (avenantsEmploye.length === 0) return null;
    const sorted = [...avenantsEmploye].sort((a, b) => new Date(a.date_effet) - new Date(b.date_effet));
    const premier = sorted[0];
    const dernier = sorted[sorted.length - 1];
    const totalAugmentation = dernier.nouveau_salaire - premier.salaire_ancien;
    const pctAugmentation = premier.salaire_ancien > 0
      ? ((totalAugmentation / premier.salaire_ancien) * 100).toFixed(1)
      : 0;
    return {
      total: avenantsEmploye.length,
      archives: avenantsEmploye.filter(a => a.statut === 'Archivé').length,
      enCours: avenantsEmploye.filter(a => a.statut !== 'Archivé' && a.statut !== 'Refusé').length,
      premierSalaire: premier.salaire_ancien,
      dernierSalaire: dernier.nouveau_salaire,
      totalAugmentation,
      pctAugmentation,
    };
  }, [avenantsEmploye]);

  // --- États empty / pas d'employé ---
  if (!emp) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity='warning'>Aucun employé sélectionné — la zone Historique Avenants ne peut pas être calculée.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* === EN-TÊTE FUSIONNÉ : "📜 Historique des avenants – Mis à jour automatiquement" === */}
      <Card sx={{ mb: 2, background: `linear-gradient(135deg, ${VIOLET} 0%, ${NAVY} 100%)`, color: '#fff', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 }, position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                <HistoryIcon sx={{ color: '#fff', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant='h6' fontWeight={800} sx={{ color: '#fff', fontSize: '1.05rem', lineHeight: 1.1 }}>
                  📜 Historique des avenants
                </Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', display: 'block', mt: 0.2 }}>
                  Mis à jour automatiquement — {emp.civilite} {employeeFullName(emp)}
                </Typography>
              </Box>
            </Stack>
            {kpis && (
              <Stack direction='row' spacing={2} divider={<Divider orientation='vertical' flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h5' fontWeight={800} sx={{ color: '#fff', fontSize: '1.5rem', lineHeight: 1 }}>{kpis.total}</Typography>
                  <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.6rem' }}>Avenants</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h5' fontWeight={800} sx={{ color: '#fff', fontSize: '1.5rem', lineHeight: 1 }}>{kpis.archives}</Typography>
                  <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.6rem' }}>Archivés</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h5' fontWeight={800} sx={{ color: kpis.totalAugmentation >= 0 ? '#a3f7bf' : '#ffb3b8', fontSize: '1.5rem', lineHeight: 1 }}>
                    {kpis.totalAugmentation >= 0 ? '+' : ''}{formatNumber(kpis.totalAugmentation)}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.6rem' }}>FCFA ({kpis.pctAugmentation >= 0 ? '+' : ''}{kpis.pctAugmentation}%)</Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* === FORMULE EXCEL AFFICHÉE (info) === */}
      <Alert severity='info' sx={{ mb: 2, fontSize: '0.72rem', '& .MuiAlert-message': { width: '100%' } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent='space-between'>
          <Box>
            <strong>📌 Zone nommée « Historique_Avenants »</strong> — cellule de départ A50, filtrage automatique sur l'employé actuel ($B$2).
          </Box>
          <Tooltip title='Formule Excel exacte'>
            <Typography variant='caption' component='code' sx={{ fontFamily: 'monospace', fontSize: '0.6rem', bgcolor: 'rgba(126,63,242,0.08)', px: 1, py: 0.3, borderRadius: 0.5, display: 'block' }}>
              =TRIER(FILTRE(CHOISIRCOLS('Avenants'!A:O; 13; 6; 7; 4; 5; 11; 10; 9); 'Avenants'!C:C=$B$2); 6; -1)
            </Typography>
          </Tooltip>
        </Stack>
      </Alert>

      {/* === TABLEAU FILTRÉ + TRIÉ === */}
      <Card sx={{ mb: 2, border: `1px solid ${VIOLET}20`, borderRadius: '12px' }}>
        <CardContent>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.5 }}>
            <HistoryIcon sx={{ color: VIOLET, fontSize: 18 }} />
            <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
              Avenants de {employeeFullName(emp)} — {avenantsTries.length} enregistrement(s)
            </Typography>
            <Chip label='TRIER desc.' size='small' sx={{ bgcolor: 'rgba(184,106,42,0.1)', color: ORANGE, fontWeight: 700, fontSize: '0.58rem', height: 16 }} />
          </Stack>

          {avenantsTries.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography variant='caption' color='text.secondary'>
                Aucun avenant enregistré pour cet employé. La formule =FILTRE(...) retourne #CALC! (vide).
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', width: 40 }}>N°</TableCell>
                    {CHOISIRCOLS.map(c => (
                      <TableCell key={c.pos} align={c.align || 'left'} sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                        <Stack direction='row' spacing={0.3} alignItems='center'>
                          <Box component='span' sx={{ fontSize: '0.5rem', color: '#bbb', fontFamily: 'monospace' }}>col{c.col}</Box>
                          {c.label}
                          {c.pos === 6 && (
                            <Tooltip title='Colonne utilisée pour TRIER(...; 6; -1) — ordre décroissant'>
                              <InfoOutlinedIcon sx={{ fontSize: 11, color: ORANGE, ml: 0.3 }} />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avenantsTries.map((a, idx) => {
                    const statutStyle = STATUT_STYLES[a.statut] || STATUT_STYLES['Projet'];
                    return (
                      <TableRow key={a.id || idx} hover sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(244,247,252,0.4)' },
                      }}>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 700, color: VIOLET }}>
                            {a.amendment_number}
                          </Typography>
                        </TableCell>
                        {CHOISIRCOLS.map(c => {
                          let content = formatCell(a, c.field);
                          // Statut : afficher avec fond coloré
                          if (c.field === 'statut') {
                            return (
                              <TableCell key={c.pos} align='center'>
                                <Chip label={statutStyle.label} size='small' sx={{
                                  fontSize: '0.58rem', height: 18,
                                  bgcolor: statutStyle.bg, color: statutStyle.color,
                                  fontWeight: 700, border: `1px solid ${statutStyle.color}30`,
                                }} />
                              </TableCell>
                            );
                          }
                          // Salaire nouveau : couleur selon augmentation/diminution
                          if (c.field === 'nouveau_salaire') {
                            const isAugmentation = a.nouveau_salaire > a.salaire_ancien;
                            const isDiminution = a.nouveau_salaire < a.salaire_ancien;
                            return (
                              <TableCell key={c.pos} align='right'>
                                <Typography variant='caption' sx={{
                                  fontFamily: c.monospace ? 'monospace' : 'inherit',
                                  fontSize: '0.7rem',
                                  fontWeight: c.bold ? 700 : 500,
                                  color: isAugmentation ? VERT : isDiminution ? ROUGE : NAVY,
                                }}>
                                  {content}
                                </Typography>
                              </TableCell>
                            );
                          }
                          // Salaire ancien : gris
                          if (c.field === 'salaire_ancien') {
                            return (
                              <TableCell key={c.pos} align='right'>
                                <Typography variant='caption' sx={{
                                  fontFamily: c.monospace ? 'monospace' : 'inherit',
                                  fontSize: '0.68rem', color: GRIS,
                                }}>
                                  {content}
                                </Typography>
                              </TableCell>
                            );
                          }
                          // Date effet : gras
                          if (c.field === 'date_effet') {
                            return (
                              <TableCell key={c.pos}>
                                <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: 700, color: NAVY }}>
                                  {content}
                                </Typography>
                              </TableCell>
                            );
                          }
                          // Nouveau poste : chip si valeur
                          if (c.field === 'nouveau_poste' && a.nouveau_poste) {
                            return (
                              <TableCell key={c.pos}>
                                <Chip label={a.nouveau_poste} size='small' color='primary' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} />
                              </TableCell>
                            );
                          }
                          // Motif : chip
                          if (c.field === 'motif' && a.motif) {
                            return (
                              <TableCell key={c.pos}>
                                <Chip label={a.motif} size='small' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} />
                              </TableCell>
                            );
                          }
                          // Nouveau temps : chip warning si valeur
                          if (c.field === 'nouveau_temps' && a.nouveau_temps) {
                            return (
                              <TableCell key={c.pos}>
                                <Chip label={a.nouveau_temps} size='small' color='warning' variant='outlined' sx={{ fontSize: '0.58rem', height: 18 }} />
                              </TableCell>
                            );
                          }
                          // Cas par défaut
                          return (
                            <TableCell key={c.pos} align={c.align || 'left'}>
                              <Typography variant='caption' sx={{
                                fontFamily: c.monospace ? 'monospace' : 'inherit',
                                fontSize: '0.7rem', fontWeight: c.bold ? 700 : 400, color: '#4a5a6a',
                              }}>
                                {content}
                              </Typography>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Légende formule */}
          {avenantsTries.length > 0 && (
            <Typography variant='caption' sx={{ display: 'block', mt: 1, fontSize: '0.62rem', color: GRIS, fontFamily: 'monospace' }}>
              Source : <strong>FILTRE</strong>('Avenants'!A:O ; 'Avenants'!C:C = $B$2) → <strong>CHOISIRCOLS</strong>(8 colonnes) → <strong>TRIER</strong>(col 6 = Date effet, desc)
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* === GRAPHIQUE D'ÉVOLUTION DES RÉMUNÉRATIONS === */}
      {chartData.length > 0 && (
        <Card sx={{ mb: 2, border: `2px solid ${VERT}20`, borderRadius: '12px' }}>
          <CardContent>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.5 }}>
              <AutoGraphIcon sx={{ color: VERT }} />
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>
                Évolution des rémunérations
              </Typography>
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                label={`${kpis.pctAugmentation >= 0 ? '+' : ''}${kpis.pctAugmentation}% sur ${chartData.length} avenant(s)`}
                size='small'
                sx={{ bgcolor: kpis.totalAugmentation >= 0 ? 'rgba(26,122,74,0.1)' : 'rgba(179,58,74,0.1)', color: kpis.totalAugmentation >= 0 ? VERT : ROUGE, fontWeight: 700, fontSize: '0.62rem' }}
              />
            </Stack>

            <Alert severity='info' sx={{ mb: 1.5, fontSize: '0.68rem', py: 0.5 }}>
              Graphique basé sur les colonnes <strong>Date effet</strong> (axe X) et <strong>Nouveau salaire</strong> (axe Y) — met en évidence la progression salariale de l'employé au fil des avenants.
            </Alert>

            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' />
                  <XAxis
                    dataKey='dateShort'
                    tick={{ fontSize: 11, fill: GRIS }}
                    tickLine={{ stroke: '#d6dde6' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: GRIS }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    domain={['dataMin - 50000', 'dataMax + 50000']}
                  />
                  <RTooltip
                    contentStyle={{
                      bgcolor: '#fff', border: `1px solid ${VIOLET}30`, borderRadius: 2,
                      fontSize: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ color: NAVY, fontWeight: 700, mb: 0.5 }}
                    formatter={(value, name) => {
                      if (name === 'salaire') return [`${formatNumber(value)} FCFA`, 'Nouveau salaire'];
                      if (name === 'ancien') return [`${formatNumber(value)} FCFA`, 'Salaire précédent'];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const d = payload[0].payload;
                        return `${d.numero} · ${d.date} · ${d.motif}`;
                      }
                      return label;
                    }}
                  />
                  {/* Ligne salaire ancien (pointillée grise) */}
                  <Line
                    type='monotone'
                    dataKey='ancien'
                    stroke={GRIS}
                    strokeWidth={1.5}
                    strokeDasharray='5 4'
                    dot={{ r: 3, fill: GRIS }}
                    activeDot={{ r: 5 }}
                    connectNulls
                    name='ancien'
                  />
                  {/* Ligne nouveau salaire (pleine verte) */}
                  <Line
                    type='monotone'
                    dataKey='salaire'
                    stroke={VERT}
                    strokeWidth={3}
                    dot={{ r: 5, fill: VERT, stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: VERT, stroke: '#fff', strokeWidth: 2 }}
                    name='salaire'
                  />
                  {/* Reference line pour le salaire initial */}
                  {chartData.length > 0 && (
                    <ReferenceLine
                      y={chartData[0].ancien}
                      stroke={BLEU}
                      strokeDasharray='3 3'
                      label={{ value: 'Salaire initial', position: 'insideTopLeft', fill: BLEU, fontSize: 10 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Légende personnalisée */}
            <Stack direction='row' spacing={3} sx={{ mt: 1, justifyContent: 'center' }}>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <Box sx={{ width: 16, height: 3, bgcolor: VERT, borderRadius: 1 }} />
                <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#4a5a6a' }}>Nouveau salaire (après avenant)</Typography>
              </Stack>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <Box sx={{ width: 16, height: 2, bgcolor: GRIS, opacity: 0.6, borderRadius: 1 }} />
                <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#4a5a6a' }}>Salaire précédent (avant avenant)</Typography>
              </Stack>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <Box sx={{ width: 16, height: 2, bgcolor: BLEU, opacity: 0.5, borderRadius: 1 }} />
                <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#4a5a6a' }}>Salaire initial (référence)</Typography>
              </Stack>
            </Stack>

            {/* Détails des évolutions */}
            {chartData.length >= 2 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(244,247,252,0.6)', borderRadius: 1, border: '1px solid #e9edf2' }}>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.7rem', color: NAVY, display: 'block', mb: 0.5 }}>
                  Détail des évolutions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {chartData.map((d, i) => {
                    if (i === 0) {
                      return (
                        <Typography key={i} variant='caption' sx={{ fontSize: '0.65rem', color: GRIS }}>
                          <strong>{d.numero}</strong> ({d.dateShort}) : Salaire initial {formatNumber(d.ancien)} FCFA → {formatNumber(d.salaire)} FCFA
                        </Typography>
                      );
                    }
                    const diff = d.salaire - chartData[i - 1].salaire;
                    const pct = chartData[i - 1].salaire > 0 ? ((diff / chartData[i - 1].salaire) * 100).toFixed(1) : 0;
                    return (
                      <Typography key={i} variant='caption' sx={{ fontSize: '0.65rem', color: '#4a5a6a' }}>
                        <strong>{d.numero}</strong> ({d.dateShort}) : {formatNumber(chartData[i - 1].salaire)} → {formatNumber(d.salaire)} FCFA
                        <span style={{ color: diff >= 0 ? VERT : ROUGE, fontWeight: 700 }}> ({diff >= 0 ? '+' : ''}{formatNumber(diff)}, {pct >= 0 ? '+' : ''}{pct}%)</span>
                      </Typography>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* === Master Prompt section 8 : hyperlien "Voir le dernier avenant" === */}
      {avenantsTries.length > 0 && (
        <Card sx={{ mb: 2, border: `2px solid ${VIOLET}30`, borderRadius: '12px', background: `linear-gradient(135deg, rgba(126,63,242,0.05) 0%, rgba(11,42,74,0.02) 100%)` }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent='space-between'>
              <Box>
                <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', color: NAVY }}>
                  🔗 Lien dynamique vers le dernier avenant
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.66rem', color: '#6b7a8a', display: 'block' }}>
                  Dernier avenant : <strong>{avenantsTries[0].amendment_number}</strong> · {formatDate(avenantsTries[0].date_effet)} · {avenantsTries[0].statut}
                </Typography>
                <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.3 }}>
                  =HYPERLINK("#"&CELLULE("adresse"; INDEX('Avenants'!A:A; MAX(SI('Avenants'!C:C=$B$2; LIGNE('Avenants'!A:A); 0)))); "📄 Voir le dernier avenant")
                </Typography>
              </Box>
              <Button
                variant='contained' size='small'
                startIcon={<EditNoteIcon />}
                onClick={() => navigate('/domaine2_Gestion_Administrative_Personnel/avenants')}
                sx={{ bgcolor: VIOLET, textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, '&:hover': { bgcolor: '#6a2ed0' } }}
              >
                📄 Voir le dernier avenant
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* === LIEN VERS MODULE AVENANTS COMPLET === */}
      <Alert severity='success' sx={{ mb: 2, fontSize: '0.72rem' }}>
        <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>
          ✅ Cette zone est <strong>automatiquement mise à jour</strong> : tout nouvel avenant créé dans le module Avenants (avec employee_id = {emp.matricule}) apparaîtra ici instantanément, sans intervention manuelle.
        </Typography>
      </Alert>
    </Box>
  );
}
