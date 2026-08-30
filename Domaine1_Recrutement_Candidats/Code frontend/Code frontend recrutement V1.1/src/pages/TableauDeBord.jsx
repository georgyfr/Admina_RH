import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RTooltip } from 'recharts';
import KPICard from '../components/KPICard';

const COLORS = ['#1976d2', '#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26c6da', '#8d6e63'];

const kpiData = [
  { titre: 'Total Demandes', valeur: 10, sousTexte: '5 demandes ouvertes' },
  { titre: 'Total Candidats', valeur: 10, sousTexte: '9 candidats actifs' },
  { titre: 'Taux de Conversion', valeur: '20.0%', sousTexte: '2 retenus / 10 candidats' },
  { titre: 'Délai Moyen', valeur: '27 j', sousTexte: 'jours ouvrés' },
];

const evolutionData = [
  { mois: 'Oct 2024', demandes: 3, pourvues: 1 },
  { mois: 'Nov 2024', demandes: 5, pourvues: 2 },
  { mois: 'Dec 2024', demandes: 4, pourvues: 3 },
  { mois: 'Jan 2025', demandes: 8, pourvues: 4 },
  { mois: 'Fev 2025', demandes: 10, pourvues: 5 },
];

const sourcesData = [
  { source: 'Site web', valeur: 32 },
  { source: 'Cooptation', valeur: 28 },
  { source: 'LinkedIn', valeur: 25 },
  { source: 'Indeed', valeur: 18 },
  { source: 'Cabinet', valeur: 22 },
  { source: 'Autres', valeur: 27 },
];

const departData = [
  { name: 'Restauration', value: 18 },
  { name: 'Hébergement', value: 15 },
  { name: 'Finance', value: 12 },
  { name: 'Informatique', value: 10 },
  { name: 'Sécurité', value: 9 },
  { name: 'Service Client', value: 13 },
  { name: 'Marketing', value: 11 },
  { name: 'Logistique', value: 12 },
];

const statutsData = [
  { statut: 'Brouillon', valeur: 1 },
  { statut: 'En attente', valeur: 2 },
  { statut: 'Validée', valeur: 2 },
  { statut: 'Publiée', valeur: 1 },
  { statut: 'Pourvue', valeur: 3 },
  { statut: 'Clôturée', valeur: 1 },
];

const demandesRecentes = [
  { numero: 'DR-2025-008', poste: 'Chef Approvisionnement', departement: 'Logistique', statut: 'Validée', date: '20/02/2025' },
  { numero: 'DR-2025-006', poste: 'Développeur Full Stack', departement: 'Informatique', statut: 'En attente', date: '10/02/2025' },
  { numero: 'DR-2025-003', poste: 'Comptable Senior', departement: 'Finance', statut: 'Validée', date: '25/01/2025' },
  { numero: 'DR-2025-004', poste: 'Agent Accueil', departement: 'Service Client', statut: 'Pourvue', date: '01/02/2025' },
  { numero: 'DR-2025-002', poste: 'Réceptionniste Nuit', departement: 'Hébergement', statut: 'En cours', date: '20/01/2025' },
];

const candidatsRecents = [
  { nom: 'Eyenga Clarisse', numero: 'CAN-006', source: 'Cooptation', etape: 'CV recu', score: null },
  { nom: 'Bikay Jean-Pierre', numero: 'CAN-004', source: 'LinkedIn', etape: 'Entretien HR', score: 14 },
  { nom: 'Nkoulou Brandon', numero: 'CAN-003', source: 'Site web', etape: 'Test technique', score: 10 },
  { nom: 'Kamga Blaise', numero: 'CAN-005', source: 'Cabinet', etape: 'Entretien HR', score: null },
  { nom: 'Mebara Nadège', numero: 'CAN-007', source: 'Site web', etape: 'Offre envoyee', score: 17 },
];

const statutColor = { 'Pourvue': 'success', 'En cours': 'warning', 'Validée': 'info', 'En attente': 'default', 'Annulee': 'error', 'Brouillon': 'default', 'Publiée': 'info', 'Clôturée': 'default' };

export default function TableauDeBord() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExport = () => {
    const csvRows = ['N°,Poste,Département,Statut,Date'];
    demandesRecentes.forEach(r => csvRows.push(`${r.numero},${r.poste},${r.departement},${r.statut},${r.date}`));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dashboard_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Tableau de Bord</Typography>
          <Typography variant="body2" color="text.secondary">Vue d'ensemble de votre activité de recrutement</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download fontSize="small" />} onClick={handleExport}>Exporter CSV</Button>
          <IconButton onClick={() => setRefreshKey(k => k + 1)}><Refresh fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {kpiData.map(k => <KPICard key={k.titre} titre={k.titre} valeur={k.valeur} sousTexte={k.sousTexte} />)}
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Évolution du Recrutement</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="demandes" stroke="#1976d2" name="Demandes créées" strokeWidth={2} />
              <Line type="monotone" dataKey="pourvues" stroke="#66bb6a" name="Demandes pourvues" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Sources de Recrutement</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourcesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={80} />
              <RTooltip />
              <Bar dataKey="valeur" fill="#1976d2" radius={[0, 4, 4, 0]} name="Candidats" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Charts Row 2 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Répartition par Département</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={departData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                {departData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Statuts des Demandes</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statutsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="statut" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="valeur" fill="#42a5f5" radius={[4, 4, 0, 0]} name="Demandes" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Recent Lists */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Demandes Récentes</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>N°</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Poste</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Département</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Date</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {demandesRecentes.map(d => (
                  <TableRow key={d.numero} hover>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{d.numero}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{d.poste}</TableCell>
                    <TableCell><Chip label={d.departement} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={d.statut} size="small" color={statutColor[d.statut]} /></TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{d.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Candidats Récents</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Nom complet</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>N° CAN</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Étape</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Score</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {candidatsRecents.map(c => (
                  <TableRow key={c.numero} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{c.nom}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{c.numero}</TableCell>
                    <TableCell><Chip label={c.source} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={c.etape} size="small" /></TableCell>
                    <TableCell>{c.score !== null ? c.score + '/20' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
