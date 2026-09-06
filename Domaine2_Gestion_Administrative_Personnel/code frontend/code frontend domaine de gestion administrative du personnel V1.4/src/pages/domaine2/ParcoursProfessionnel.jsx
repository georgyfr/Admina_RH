// ============================================================
// ParcoursProfessionnel.jsx — Frise chronologique interactive
// Affiche tous les événements de carrière (contrats, avenants, promotions)
// Équivalent Excel : =FILTER(6-Suivi Contrats; Nom=$B$2) + Gantt + DATEDIF
// ============================================================
import { useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Divider, Tooltip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import WorkIcon from '@mui/icons-material/Work';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GradeIcon from '@mui/icons-material/Grade';

import {
  CONTRATS, AVENANTS, findEmployee, employeeFullName, formatDate, formatFCFA, formatNumber,
  calculerAnciennete, LABELS,
} from './data';

const NAVY = '#0b2a4a';
const NAVY_LIGHT = '#1a4a7a';
const GOLD = '#f9c74f';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const VIOLET = '#7e3ff2';

// --- Types d'événements parcours ---
const EVENT_TYPES = {
  embauche: { icon: <EventAvailableIcon fontSize='small' />, color: VERT, label: 'Embauche', dot: '🟢' },
  avenant_salaire: { icon: <TrendingUpIcon fontSize='small' />, color: GOLD, label: 'Augmentation', dot: '🟡' },
  avenant_poste: { icon: <WorkIcon fontSize='small' />, color: VIOLET, label: 'Changement de poste', dot: '🟣' },
  avenant_temps: { icon: <ScheduleIcon fontSize='small' />, color: ORANGE, label: 'Changement régime', dot: '🟠' },
  avenant_lieu: { icon: <EditNoteIcon fontSize='small' />, color: NAVY_LIGHT, label: 'Changement lieu', dot: '🔵' },
  fin_contrat: { icon: <EventBusyIcon fontSize='small' />, color: ROUGE, label: 'Fin de contrat', dot: '🔴' },
};

function getEventType(avenant) {
  const t = avenant.type_modification?.toLowerCase() || '';
  if (t.includes('salaire')) return 'avenant_salaire';
  if (t.includes('poste')) return 'avenant_poste';
  if (t.includes('temps') || t.includes('partiel')) return 'avenant_temps';
  if (t.includes('lieu')) return 'avenant_lieu';
  return 'avenant_salaire';
}

// --- Calcul ancienneté détaillée (DATEDIF) ---
function calculerAncienneteDetaillee(dateDebut) {
  if (!dateDebut) return { ans: 0, mois: 0, totalMois: 0, texte: '—' };
  const d = new Date(dateDebut);
  const now = new Date();
  let ans = now.getFullYear() - d.getFullYear();
  let mois = now.getMonth() - d.getMonth();
  if (mois < 0) { ans--; mois += 12; }
  if (now.getDate() < d.getDate()) { mois--; if (mois < 0) { ans--; mois += 12; } }
  const totalMois = ans * 12 + mois;
  return {
    ans: Math.max(0, ans),
    mois: Math.max(0, mois),
    totalMois: Math.max(0, totalMois),
    texte: `${ans} an${ans > 1 ? 's' : ''} et ${mois} mois`,
  };
}

// --- Item timeline ---
function TimelineItem({ event, isLast }) {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.embauche;
  return (
    <Box sx={{ display: 'flex', gap: 1.5, pb: 2, position: 'relative' }}>
      {/* Ligne verticale */}
      {!isLast && (
        <Box sx={{
          position: 'absolute', left: 15, top: 32, bottom: 0, width: 2,
          bgcolor: '#e0e0e0',
        }} />
      )}
      {/* Point */}
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%', bgcolor: type.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 3px ${type.color}25`,
      }}>
        {type.icon}
      </Box>
      {/* Contenu */}
      <Box sx={{ flex: 1, pt: 0.3 }}>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.3 }}>
          <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.75rem', color: type.color }}>
            {type.label}
          </Typography>
          <Chip label={formatDate(event.date)} size='small' sx={{ fontSize: '0.6rem', height: 16, bgcolor: '#f4f7fc', color: '#4a5a6a' }} />
        </Stack>
        <Typography variant='body2' sx={{ fontSize: '0.78rem', color: '#1a2a3a', lineHeight: 1.4 }}>
          {event.description}
        </Typography>
        {event.detail && (
          <Typography variant='caption' sx={{ fontSize: '0.68rem', color: '#6b7a8a', display: 'block', mt: 0.2 }}>
            {event.detail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// --- Jauge ancienneté ---
function JaugeAnciennete({ anciennete }) {
  const pct = Math.min(100, (anciennete.totalMois / (10 * 12)) * 100); // 10 ans = 100%
  const couleur = anciennete.totalMois >= 60 ? VERT : anciennete.totalMois >= 24 ? NAVY : ORANGE;
  return (
    <Card sx={{ border: `2px solid ${couleur}`, borderRadius: '16px', boxShadow: `0 2px 8px ${couleur}20` }}>
      <CardContent sx={{ p: 2, textAlign: 'center' }}>
        <Stack direction='row' spacing={1} alignItems='center' justifyContent='center' sx={{ mb: 1 }}>
          <GradeIcon sx={{ color: couleur, fontSize: 18 }} />
          <Typography variant='caption' fontWeight={700} sx={{ color: couleur, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Ancienneté
          </Typography>
        </Stack>
        <Typography variant='h4' fontWeight={800} sx={{ color: couleur, fontSize: '1.8rem', mb: 0.5 }}>
          {anciennete.ans}<span style={{ fontSize: '0.8rem', fontWeight: 500 }}> ans</span> {anciennete.mois}<span style={{ fontSize: '0.8rem', fontWeight: 500 }}> mois</span>
        </Typography>
        <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', display: 'block', mb: 1.5 }}>
          {anciennete.totalMois} mois au total · depuis le {formatDate(anciennete.dateDebut)}
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant='determinate'
            value={pct}
            sx={{
              height: 10, borderRadius: 5, bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': { bgcolor: couleur, borderRadius: 5 },
            }}
          />
          <Typography variant='caption' sx={{ fontSize: '0.6rem', color: '#6b7a8a', display: 'block', mt: 0.5 }}>
            {Math.round(pct)}% du plafond décennal
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Composant principal
// ============================================================
export default function ParcoursProfessionnel({ employeeId }) {
  const emp = useMemo(() => findEmployee(employeeId), [employeeId]);

  // Récupérer tous les événements de carrière (FILTER sur contrats + avenants)
  const events = useMemo(() => {
    if (!emp) return [];
    const evts = [];

    // 1. Embauche (contrat initial)
    const contratInitial = CONTRATS.find(c => c.employee_id === employeeId && c.date_debut === emp.date_embauche) || CONTRATS.find(c => c.employee_id === employeeId);
    if (contratInitial) {
      evts.push({
        type: 'embauche',
        date: contratInitial.date_debut,
        description: `Embauche en tant que ${emp.poste} — ${emp.type_contrat}`,
        detail: `Département: ${emp.departement} · Salaire: ${formatFCFA(contratInitial.salaire_brut)} · Contrat: ${contratInitial.contract_number}`,
        sortOrder: new Date(contratInitial.date_debut).getTime(),
      });

      // Fin de contrat si CDD/stage
      if (contratInitial.date_fin && new Date(contratInitial.date_fin) < new Date()) {
        evts.push({
          type: 'fin_contrat',
          date: contratInitial.date_fin,
          description: `Fin de contrat ${contratInitial.type_contrat}`,
          detail: `Contrat ${contratInitial.contract_number} · ${contratInitial.observations || ''}`,
          sortOrder: new Date(contratInitial.date_fin).getTime() + 1,
        });
      }
    }

    // 2. Avenants (augmentations, changements de poste, etc.)
    AVENANTS.filter(a => a.employee_id === employeeId).forEach(a => {
      const type = getEventType(a);
      let description = '';
      let detail = '';
      if (type === 'avenant_salaire') {
        description = `Augmentation de salaire: ${a.ancienne_valeur} → ${a.nouvelle_valeur}`;
        detail = `Motif: ${a.motif} · Avenant ${a.amendment_number}`;
      } else if (type === 'avenant_poste') {
        description = `Changement de poste: ${a.ancienne_valeur} → ${a.nouvelle_valeur}`;
        detail = `Motif: ${a.motif} · Avenant ${a.amendment_number}`;
      } else if (type === 'avenant_temps') {
        description = `Changement de régime: ${a.ancienne_valeur} → ${a.nouvelle_valeur}`;
        detail = `Motif: ${a.motif} · Avenant ${a.amendment_number}`;
      } else {
        description = `${a.type_modification}: ${a.ancienne_valeur} → ${a.nouvelle_valeur}`;
        detail = `Motif: ${a.motif} · Avenant ${a.amendment_number}`;
      }
      evts.push({
        type,
        date: a.date_avenant,
        description,
        detail,
        sortOrder: new Date(a.date_avenant).getTime(),
      });
    });

    // 3. Autres contrats (s'il y en a plusieurs)
    CONTRATS.filter(c => c.employee_id === employeeId && c.id !== contratInitial?.id).forEach(c => {
      evts.push({
        type: 'embauche',
        date: c.date_debut,
        description: `Nouveau contrat ${c.type_contrat} — ${c.contract_number}`,
        detail: `Salaire: ${formatFCFA(c.salaire_brut)} · Lieu: ${c.lieu_travail}`,
        sortOrder: new Date(c.date_debut).getTime(),
      });
      if (c.date_fin && new Date(c.date_fin) < new Date()) {
        evts.push({
          type: 'fin_contrat',
          date: c.date_fin,
          description: `Fin de contrat ${c.type_contrat}`,
          detail: `Contrat ${c.contract_number}`,
          sortOrder: new Date(c.date_fin).getTime() + 1,
        });
      }
    });

    // Trier par date
    return evts.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [employeeId, emp]);

  // Ancienneté (DATEDIF)
  const anciennete = useMemo(() => {
    if (!emp) return { ans: 0, mois: 0, totalMois: 0, texte: '—', dateDebut: null };
    const result = calculerAncienneteDetaillee(emp.date_embauche);
    return { ...result, dateDebut: emp.date_embauche };
  }, [emp]);

  // Données pour Gantt (barres horizontales par période de contrat)
  const ganttData = useMemo(() => {
    if (!emp) return [];
    const contratsEmp = CONTRATS.filter(c => c.employee_id === employeeId);
    const maintenant = new Date();
    const dateRef = new Date(emp.date_embauche);
    dateRef.setMonth(dateRef.getMonth() - 2); // 2 mois avant pour contexte

    return contratsEmp.map((c, i) => {
      const debut = new Date(c.date_debut);
      const fin = c.date_fin ? new Date(c.date_fin) : maintenant;
      const offsetMois = Math.round((debut - dateRef) / (30.44 * 86400000));
      const dureeMois = Math.max(1, Math.round((fin - debut) / (30.44 * 86400000)));
      return {
        name: `${c.type_contrat} (${c.contract_number})`,
        offset: offsetMois,
        duree: dureeMois,
        debut: c.date_debut,
        fin: c.date_fin || 'En cours',
        salaire: c.salaire_brut,
        type: c.type_contrat,
        statut: c.statut,
      };
    });
  }, [employeeId, emp]);

  // Tableau récapitulatif parcours
  const parcoursRows = useMemo(() => {
    return CONTRATS.filter(c => c.employee_id === employeeId).map(c => {
      const duree = c.date_fin ?
        Math.round((new Date(c.date_fin) - new Date(c.date_debut)) / (30.44 * 86400000)) :
        Math.round((new Date() - new Date(c.date_debut)) / (30.44 * 86400000));
      return {
        contract_number: c.contract_number,
        type_contrat: c.type_contrat,
        date_debut: c.date_debut,
        date_fin: c.date_fin,
        poste: emp?.poste || '—',
        departement: emp?.departement || '—',
        salaire: c.salaire_brut,
        duree: c.date_fin ? `${duree} mois` : `En cours (${duree} mois)`,
        statut: c.statut,
      };
    });
  }, [employeeId, emp]);

  if (!emp) return null;

  return (
    <Card sx={{ mt: 2.5, border: '1px solid #e9edf2', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {/* En-tête */}
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WorkIcon fontSize='small' />
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: NAVY, fontSize: '0.9rem' }}>
              Parcours Professionnel
            </Typography>
            <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.7rem' }}>
              Frise chronologique · {events.length} événement(s) · Mis à jour automatiquement
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          {/* Colonne gauche : Frise chronologique + Jauge */}
          <Grid item xs={12} md={5}>
            {/* Jauge ancienneté */}
            <Box sx={{ mb: 2 }}>
              <JaugeAnciennete anciennete={anciennete} />
            </Box>

            {/* Frise chronologique (timeline verticale) */}
            <Box sx={{ p: 1.5, bgcolor: '#fafcfe', borderRadius: 2, border: '1px solid #e9edf2' }}>
              <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1.5, display: 'block' }}>
                Frise chronologique ({events.length} événements)
              </Typography>
              {events.length === 0 ? (
                <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.78rem' }}>Aucun événement enregistré</Typography>
              ) : (
                events.map((event, i) => (
                  <TimelineItem key={i} event={event} isLast={i === events.length - 1} />
                ))
              )}
            </Box>
          </Grid>

          {/* Colonne droite : Gantt + Table */}
          <Grid item xs={12} md={7}>
            {/* Gantt simplifié (barres horizontales) */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
                Diagramme de Gantt — Périodes d'activité
              </Typography>
              {ganttData.length > 0 ? (
                <ResponsiveContainer width='100%' height={Math.max(120, ganttData.length * 50 + 40)}>
                  <BarChart data={ganttData} layout='vertical' margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#eaedf2' horizontal={false} />
                    <XAxis
                      type='number'
                      domain={[0, 'dataMax']}
                      tick={{ fontSize: 10, fill: '#6b7a8a' }}
                      tickFormatter={(v) => `${v}m`}
                      label={{ value: 'Mois depuis début', position: 'insideBottom', fontSize: 10, fill: '#6b7a8a' }}
                    />
                    <YAxis type='category' dataKey='name' width={140} tick={{ fontSize: 10, fill: '#3a4a5a' }} />
                    <RTooltip
                      contentStyle={{ borderRadius: 10, border: '1px solid #eaedf2', fontSize: 12 }}
                      formatter={(value, name, props) => {
                        if (name === 'offset') return [null, null];
                        const d = props.payload;
                        return [`${d.duree} mois`, `${formatDate(d.debut)} → ${d.fin === 'En cours' ? "Aujourd'hui" : formatDate(d.fin)}`];
                      }}
                    />
                    {/* Bar offset (transparente) pour décalage */}
                    <Bar dataKey='offset' stackId='gantt' fill='transparent' name='offset' />
                    {/* Bar durée (visible) */}
                    <Bar dataKey='duree' stackId='gantt' radius={[0, 4, 4, 0]} name='Durée'>
                      {ganttData.map((d, i) => {
                        const color = d.statut === 'En vigueur' ? VERT : d.statut === 'Echu' ? '#6b7a8a' : ROUGE;
                        return <Cell key={i} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ py: 3, textAlign: 'center', color: '#6b7a8a' }}>
                  <Typography variant='caption' sx={{ fontSize: '0.78rem' }}>Aucune période de contrat</Typography>
                </Box>
              )}
            </Box>

            {/* Tableau récapitulatif parcours */}
            <Box>
              <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.72rem', color: NAVY, mb: 1, display: 'block' }}>
                Tableau récapitulatif — Contrats et périodes
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1, maxHeight: 280 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>N° Contrat</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Début</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Fin</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Durée</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Salaire</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.68rem' }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcoursRows.map((r, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{r.contract_number}</TableCell>
                        <TableCell><Chip label={r.type_contrat} size='small' sx={{ fontSize: '0.6rem', height: 18 }} color={r.type_contrat === 'CDI' ? 'success' : 'warning'} variant='outlined' /></TableCell>
                        <TableCell sx={{ fontSize: '0.72rem' }}>{formatDate(r.date_debut)}</TableCell>
                        <TableCell sx={{ fontSize: '0.72rem' }}>{r.date_fin ? formatDate(r.date_fin) : 'En cours'}</TableCell>
                        <TableCell align='right' sx={{ fontSize: '0.72rem', fontWeight: 600, fontFamily: 'monospace' }}>{r.duree}</TableCell>
                        <TableCell align='right' sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{formatNumber(r.salaire)}</TableCell>
                        <TableCell><Chip label={LABELS.statut_contrat[r.statut] || r.statut} size='small' sx={{ fontSize: '0.6rem', height: 18 }} color={r.statut === 'En vigueur' ? 'success' : 'default'} variant='outlined' /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Statistiques parcours */}
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(126, 63, 242, 0.06)', borderRadius: 1.5, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Contrats totaux</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: VIOLET, fontSize: '1rem' }}>{parcoursRows.length}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(184, 106, 42, 0.06)', borderRadius: 1.5, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Avenants</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: ORANGE, fontSize: '1rem' }}>{AVENANTS.filter(a => a.employee_id === employeeId).length}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(26, 122, 74, 0.06)', borderRadius: 1.5, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Promotions</Typography>
                <Typography variant='h6' fontWeight={700} sx={{ color: VERT, fontSize: '1rem' }}>{AVENANTS.filter(a => a.employee_id === employeeId && getEventType(a) === 'avenant_poste').length}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
