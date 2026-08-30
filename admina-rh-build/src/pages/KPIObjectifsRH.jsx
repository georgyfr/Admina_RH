import React, { useMemo } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip, Divider, Alert, Grid } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import KPICard from '../components/KPICard';

/* ─── helpers ─── */
const fmt = (v, dec = 1) => (v == null || isNaN(v)) ? '—' : Number(v).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtFCFA = (v) => (v == null || isNaN(v)) ? '—' : Number(v).toLocaleString('fr-FR') + ' FCFA';
const months = ['Jan','Fev','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Dec'];

/* ─── objectifs trimestriels (modifiables) ─── */
const objectifs = {
  'Time-to-Hire (jours)':      { t1: 45, t2: 35, t3: 30, t4: 30, unit: 'j', inverse: true  },
  'Cost-per-Hire (FCFA)':      { t1: 200000, t2: 180000, t3: 150000, t4: 150000, unit: 'F', inverse: true },
  'Quality-of-Hire (/20)':     { t1: 13, t2: 14, t3: 15, t4: 16, unit: '/20', inverse: false },
  'Taux acceptation offres (%)':{ t1: 60, t2: 70, t3: 75, t4: 80, unit: '%', inverse: false },
  'Taux de remplissage (%)':   { t1: 50, t2: 60, t3: 70, t4: 75, unit: '%', inverse: false },
  'Taux de recommandation (%)':{ t1: 40, t2: 50, t3: 55, t4: 60, unit: '%', inverse: false },
  'Nb candidats / embauche':   { t1: 15, t2: 12, t3: 10, t4: 10, unit: 'x', inverse: true },
  'Entretiens / embauche':     { t1: 5, t2: 4, t3: 3.5, t4: 3, unit: 'x', inverse: true },
};

/* ─── donnees mensuelles simulees (remplacer par API / Excel) ─── */
const mensuel = {
  'Time-to-Hire (jours)':       [null, null, null, null, null, null, null, null, null, null, null, null],
  'Cost-per-Hire (FCFA)':       [null, null, null, null, null, null, null, null, null, null, null, null],
  'Quality-of-Hire (/20)':      [null, null, null, null, null, null, null, null, null, null, null, null],
  'Taux acceptation offres (%)':[null, null, null, null, null, null, null, null, null, null, null, null],
  'Taux de remplissage (%)':    [null, null, null, null, null, null, null, null, null, null, null, null],
  'Taux de recommandation (%)': [null, null, null, null, null, null, null, null, null, null, null, null],
  'Nb candidats / embauche':    [null, null, null, null, null, null, null, null, null, null, null, null],
  'Entretiens / embauche':      [null, null, null, null, null, null, null, null, null, null, null, null],
};

/* ─── calculs derives ─── */
function avg(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

function trimestriel(kpi, obj, data) {
  const trims = [
    { label: 'T1', start: 0, obj: obj.t1 },
    { label: 'T2', start: 3, obj: obj.t2 },
    { label: 'T3', start: 6, obj: obj.t3 },
    { label: 'T4', start: 9, obj: obj.t4 },
  ];
  return trims.map(t => {
    const slice = data.slice(t.start, t.start + 3);
    const realised = avg(slice);
    const ecart = realised != null && t.obj !== 0
      ? ((realised - t.obj) / Math.abs(t.obj)) * 100
      : null;
    let rag = '—';
    if (ecart != null) {
      if (obj.inverse) {
        rag = ecart <= -10 ? 'OK' : ecart >= 10 ? 'NOK' : 'ATT';
      } else {
        rag = ecart >= 10 ? 'OK' : ecart <= -10 ? 'NOK' : 'ATT';
      }
    }
    return { label: t.label, objectif: t.obj, realised, ecart, rag };
  });
}

const ragColors = { OK: '#4caf50', ATT: '#ff9800', NOK: '#f44336' };
const ragBg = { OK: 'rgba(76,175,80,0.12)', ATT: 'rgba(255,152,0,0.12)', NOK: 'rgba(244,67,54,0.12)' };

export default function KPIObjectifsRH() {
  const kpiNames = Object.keys(objectifs);

  const allTrims = useMemo(() => {
    const m = {};
    kpiNames.forEach(k => { m[k] = trimestriel(k, objectifs[k], mensuel[k]); });
    return m;
  }, []);

  /* ─── graphe mensuel pour 1er KPI ─── */
  const chartData = months.map((m, i) => {
    const row = { mois: m };
    kpiNames.forEach(k => { row[k] = mensuel[k][i]; });
    return row;
  });

  /* ─── KPI summary cards ─── */
  const summaryCards = kpiNames.slice(0, 5).map(k => {
    const a = avg(mensuel[k]);
    let display = '—';
    if (a != null) {
      if (k.includes('FCFA')) display = fmtFCFA(a);
      else if (k.includes('jours')) display = fmt(a, 0) + ' j';
      else if (k.includes('/20')) display = fmt(a) + ' /20';
      else display = fmt(a) + '%';
    }
    return { kpi: k, avg: display };
  });

  return (
    <Box>
      {/* ─── En-tete ─── */}
      <Typography variant="h5" fontWeight="bold">KPIs & Objectifs RH</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Suivi des indicateurs cles de performance — Donnees automatiques depuis les feuilles existantes
      </Typography>

      <Alert severity="info" icon={<InfoOutlined />} sx={{ mb: 3, borderRadius: 2 }}>
        Les valeurs mensuelles et les realiseds trimestriels sont calculees automatiquement via les formules Excel (feuilles 1, 2, 3, 4, 10, 18).
        Connectez le fichier Excel ou une API pour alimenter ces donnees en temps reel.
      </Alert>

      {/* ─── KPI Cards ─── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TIME-TO-HIRE" valeur={summaryCards[0]?.avg || '—'} sousTexte="Moy. annuelle (jours)" />
        <KPICard titre="COST-PER-HIRE" valeur={summaryCards[1]?.avg || '—'} sousTexte="Moy. annuelle (FCFA)" />
        <KPICard titre="QUALITY-OF-HIRE" valeur={summaryCards[2]?.avg || '—'} sousTexte="Score moyen (/20)" />
        <KPICard titre="TAUX D'ACCEPTATION" valeur={summaryCards[3]?.avg || '—'} sousTexte="Moy. annuelle (%)" />
        <KPICard titre="TAUX DE REMPLISSAGE" valeur={summaryCards[4]?.avg || '—'} sousTexte="Moy. annuelle (%)" />
      </Box>

      {/* ─── Tableau KPIs Mensuels ─── */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>KPIs Mensuels</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', position: 'sticky', left: 0, zIndex: 2 }}>KPI</TableCell>
                {months.map(m => (
                  <TableCell key={m} align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 55 }}>{m}</TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#0D7C66', color: '#fff', minWidth: 70 }}>Moy. Ann.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiNames.map(k => {
                const isFCFA = k.includes('FCFA');
                return (
                  <TableRow key={k} hover>
                    <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 1, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{k}</TableCell>
                    {mensuel[k].map((v, i) => (
                      <TableCell key={i} align="center" sx={{ color: v == null ? 'text.disabled' : 'text.primary' }}>
                        {v == null ? '—' : isFCFA ? fmtFCFA(v) : fmt(v, k.includes('jours') ? 0 : 1)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'rgba(13,124,102,0.08)' }}>
                      {(() => { const a = avg(mensuel[k]); return a == null ? '—' : isFCFA ? fmtFCFA(a) : fmt(a, k.includes('jours') ? 0 : 1); })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ─── Objectifs Trimestriels & Variance RAG ─── */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>Objectifs Trimestriels & Variance RAG</Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', position: 'sticky', left: 0, zIndex: 3, borderBottom: '2px solid #ddd' }}>KPI</TableCell>
                {['T1 (Jan-Mar)', 'T2 (Avr-Jun)', 'T3 (Jul-Sep)', 'T4 (Oct-Dec)'].map((t, ti) => (
                  <TableCell key={t} align="center" colSpan={4} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', borderBottom: '2px solid #ddd', fontSize: '0.78rem' }}>{t}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                {[0,1,2,3].flatMap((qi) => [
                  <TableCell key={`obj-${qi}`} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9', fontSize: '0.72rem' }}>Objectif</TableCell>,
                  <TableCell key={`rea-${qi}`} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', fontSize: '0.72rem' }}>Realise</TableCell>,
                  <TableCell key={`eca-${qi}`} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff3e0', fontSize: '0.72rem' }}>Ecart (%)</TableCell>,
                  <TableCell key={`rag-${qi}`} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fce4ec', fontSize: '0.72rem' }}>RAG</TableCell>,
                ])}
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiNames.map(k => {
                const isFCFA = k.includes('FCFA');
                return (
                  <TableRow key={k} hover>
                    <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 1, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{k}</TableCell>
                    {allTrims[k].map((t, ti) => (
                      <React.Fragment key={`${k}-${ti}`}>
                        <TableCell align="center" sx={{ color: '#1565c0', fontWeight: 500, fontSize: '0.78rem' }}>
                          {isFCFA ? fmtFCFA(t.objectif) : fmt(t.objectif, k.includes('jours') ? 0 : 1)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.78rem' }}>
                          {t.realised == null ? '—' : isFCFA ? fmtFCFA(t.realised) : fmt(t.realised, k.includes('jours') ? 0 : 1)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: '0.78rem', color: t.ecart == null ? 'text.disabled' : t.ecart > 0 ? '#2e7d32' : t.ecart < 0 ? '#c62828' : 'text.primary' }}>
                          {t.ecart == null ? '—' : (t.ecart > 0 ? '+' : '') + fmt(t.ecart) + '%'}
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: ragBg[t.rag] || 'transparent' }}>
                          <Chip
                            label={t.rag}
                            size="small"
                            sx={{
                              fontWeight: 'bold', fontSize: '0.7rem', minWidth: 42,
                              bgcolor: ragColors[t.rag] || 'grey.300',
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                      </React.Fragment>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ─── Graphique Tendance ─── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Tendance Time-to-Hire</Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'jours', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <ReferenceLine y={30} stroke="#4caf50" strokeDasharray="5 5" label={{ value: 'Cible T3/T4', fontSize: 10, fill: '#4caf50' }} />
                  <Bar dataKey="Time-to-Hire (jours)" fill="#0D7C66" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Tendance Taux de Remplissage</Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <ReferenceLine y={75} stroke="#f44336" strokeDasharray="5 5" label={{ value: 'Cible T4', fontSize: 10, fill: '#f44336' }} />
                  <Line type="monotone" dataKey="Taux de remplissage (%)" stroke="#0D7C66" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ─── Legende & Methodologie ─── */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Legende & Methodologie</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="OK" size="small" sx={{ fontWeight: 'bold', bgcolor: '#4caf50', color: '#fff' }} />
            <Typography variant="body2">Objectif depasse de plus de 10%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="ATT" size="small" sx={{ fontWeight: 'bold', bgcolor: '#ff9800', color: '#fff' }} />
            <Typography variant="body2">A +/- 10% de l'objectif</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="NOK" size="small" sx={{ fontWeight: 'bold', bgcolor: '#f44336', color: '#fff' }} />
            <Typography variant="body2">En dessous de plus de 10%</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Table size="small">
          <TableBody>
            {[
              ['Time-to-Hire', 'Moy. (Date Pourvue - Date Demande) par mois, feuille 1'],
              ['Cost-per-Hire', 'Somme couts / Nb embauches, feuilles 10 & 2'],
              ['Quality-of-Hire', 'Score moyen evaluations (/25), feuille 4'],
              ['Taux acceptation', 'Pipeline Accepte / (Accepte + Refuse), feuille 18'],
              ['Taux remplissage', 'Demandes Pourvue / Total, feuille 1'],
              ['Taux recommandation', 'Embauche recommandee / Total evalues, feuille 4'],
              ['Candidats / embauche', 'Candidatures / Embauches def., feuille 2'],
              ['Entretiens / embauche', 'Entretiens Realises / Embauches, feuilles 3 & 2'],
            ].map(([kpi, desc], i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem', width: '35%' }}>{kpi}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{desc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#1565c0', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>Objectif (bleu) — Valeurs modifiables</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#1a1a2e', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>Realise (noir) — Formules automatiques</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}