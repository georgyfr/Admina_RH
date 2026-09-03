// ============================================================
// DrillDownDetail.jsx — Zone "Détail dynamique" (drill-down KPI)
// Équivalent Excel : =FILTER(T_Employes; condition) + menu déroulant + export
// Quand l'utilisateur sélectionne/clique sur un KPI, affiche la liste filtrée
// ============================================================
import { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, IconButton, Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import { employeeFullName, formatDate, calculerAnciennete, formatNumber, findEmployee } from './data';
import { calculerJoursRestants } from './seuils';

// ============================================================
// Définition des drill-downs disponibles (un par KPI cliquable)
// Équivalent Excel : =FILTER(T_Employes; T_Employes[Colonne]=valeur)
// ============================================================
export const DRILL_DOWNS = {
  effectifTotal: {
    label: 'Effectif Total',
    filter: (data) => data.employees,
    columns: ['matricule', 'nom', 'departement', 'poste', 'type_contrat', 'date_embauche', 'salaire_brut', 'statut'],
  },
  employesActifs: {
    label: 'Employés Actifs',
    filter: (data) => data.employees.filter(e => e.statut === 'Actif'),
    columns: ['matricule', 'nom', 'departement', 'poste', 'date_embauche', 'salaire_brut'],
  },
  cadres: {
    label: 'Cadres',
    filter: (data) => data.employees.filter(e => e.categorie === 'Cadre'),
    columns: ['matricule', 'nom', 'departement', 'poste', 'salaire_brut', 'date_embauche'],
  },
  cdi: {
    label: 'CDI',
    filter: (data) => data.employees.filter(e => e.type_contrat === 'CDI'),
    columns: ['matricule', 'nom', 'departement', 'poste', 'date_embauche', 'salaire_brut', 'statut'],
  },
  cddInterim: {
    label: 'CDD / Intérim',
    filter: (data) => data.employees.filter(e => e.type_contrat === 'CDD' || e.type_contrat === 'Interim'),
    columns: ['matricule', 'nom', 'departement', 'poste', 'date_embauche', 'salaire_brut'],
  },
  contratsEnVigueur: {
    label: 'Contrats en Vigueur',
    filter: (data) => data.contrats.filter(c => c.statut === 'En vigueur').map(c => {
      const e = findEmployee(c.employee_id);
      return { ...c, employee: e };
    }),
    columns: ['contract_number', 'employee_name', 'type_contrat', 'date_debut', 'date_fin', 'salaire_brut'],
  },
  documentsValides: {
    label: 'Documents Valides',
    filter: (data) => data.documents.filter(d => d.statut === 'Valide').map(d => {
      const e = findEmployee(d.employee_id);
      return { ...d, employee: e };
    }),
    columns: ['document_number', 'employee_name', 'type_document', 'date_emission', 'date_expiration', 'lieu_depot'],
  },
  documentsARenouveler: {
    label: 'Documents à Renouveler',
    filter: (data) => data.documents.filter(d => d.statut === 'A renouveler' || d.statut === 'Expire').map(d => {
      const e = findEmployee(d.employee_id);
      const j = calculerJoursRestants(d.date_expiration);
      return { ...d, employee: e, jours_restants: j };
    }),
    columns: ['employee_name', 'type_document', 'date_expiration', 'jours_restants', 'statut'],
  },
  tauxPresenceMoyen: {
    label: 'Présence < 90% (employés à risque)',
    filter: (data) => data.pointage.filter(p => p.taux_presence < 90).map(p => {
      const e = findEmployee(p.employee_id);
      return { ...p, employee: e };
    }),
    columns: ['employee_name', 'semaine', 'jours_presents', 'jours_absents', 'retards_minutes', 'taux_presence'],
  },
  rappelsEnRetard: {
    label: 'Rappels en Retard',
    filter: (data) => data.rappels.filter(r => r.statut === 'en_retard').map(r => {
      const e = findEmployee(r.employee_id);
      return { ...r, employee: e };
    }),
    columns: ['description', 'employee_name', 'date_echeance', 'action_requise', 'statut'],
  },
};

// Rendu d'une cellule selon le type de colonne
function CellRenderer({ row, col }) {
  const val = row[col];

  // Colonnes spéciales calculées
  if (col === 'employee_name') {
    const e = row.employee;
    if (!e) return <TableCell>—</TableCell>;
    return (
      <TableCell>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Avatar sx={{ width: 26, height: 26, fontSize: '0.65rem', bgcolor: '#7e3ff2' }}>{e.prenom?.[0]}{e.nom?.[0]}</Avatar>
          <Typography variant='caption' sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{employeeFullName(e)}</Typography>
        </Stack>
      </TableCell>
    );
  }
  if (col === 'salaire_brut') {
    return <TableCell align='right'><Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>{formatNumber(val)} FCFA</Typography></TableCell>;
  }
  if (col === 'date_embauche' || col === 'date_debut' || col === 'date_fin' || col === 'date_expiration' || col === 'date_echeance' || col === 'date_emission' || col === 'date_avenant' || col === 'date_visite' || col === 'date_prochaine_visite') {
    return <TableCell><Typography variant='caption' sx={{ fontSize: '0.72rem' }}>{formatDate(val)}</Typography></TableCell>;
  }
  if (col === 'statut') {
    const color = val === 'Actif' || val === 'Valide' || val === 'En vigueur' ? 'success' : val === 'Expire' || val === 'en_retard' ? 'error' : 'warning';
    return <TableCell><Chip label={val} size='small' color={color} variant='outlined' sx={{ fontSize: '0.62rem' }} /></TableCell>;
  }
  if (col === 'jours_restants') {
    const color = val < 0 ? 'error' : val < 15 ? 'error' : val < 30 ? 'warning' : 'success';
    return <TableCell><Chip label={val < 0 ? 'EXPIRÉ' : val + ' j'} size='small' color={color} variant='outlined' sx={{ fontSize: '0.62rem' }} /></TableCell>;
  }
  if (col === 'taux_presence') {
    const color = val >= 95 ? 'success' : val >= 80 ? 'warning' : 'error';
    return <TableCell><Chip label={val + '%'} size='small' color={color} variant='outlined' sx={{ fontSize: '0.62rem' }} /></TableCell>;
  }
  if (col === 'type_contrat' || col === 'type_document' || col === 'couverture') {
    return <TableCell><Chip label={val} size='small' variant='outlined' sx={{ fontSize: '0.62rem' }} /></TableCell>;
  }
  return <TableCell><Typography variant='caption' sx={{ fontSize: '0.75rem' }}>{val || '—'}</Typography></TableCell>;
}

// Libellés des colonnes
const COLUMN_LABELS = {
  matricule: 'Matricule',
  nom: 'Nom',
  prenom: 'Prénom',
  departement: 'Département',
  poste: 'Poste',
  type_contrat: 'Type',
  date_embauche: 'Embauche',
  salaire_brut: 'Salaire brut',
  statut: 'Statut',
  contract_number: 'N° Contrat',
  employee_name: 'Employé',
  date_debut: 'Début',
  date_fin: 'Fin',
  document_number: 'N° Document',
  type_document: 'Type doc.',
  date_emission: 'Émission',
  date_expiration: 'Expiration',
  lieu_depot: 'Lieu dépôt',
  jours_restants: 'Jours restants',
  description: 'Description',
  date_echeance: 'Échéance',
  action_requise: 'Action requise',
  semaine: 'Semaine',
  jours_presents: 'Présents',
  jours_absents: 'Absents',
  retards_minutes: 'Retards (min)',
  taux_presence: 'Taux présence',
};

// Export CSV
function exportCSV(rows, columns, filename) {
  const header = columns.map(c => COLUMN_LABELS[c] || c).join(';');
  const lines = rows.map(row => {
    return columns.map(c => {
      let val = row[c];
      if (c === 'employee_name' && row.employee) val = employeeFullName(row.employee);
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';');
  });
  const csv = '\uFEFF' + header + '\n' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// Composant principal
// ============================================================
export default function DrillDownDetail({ data, selectedKpi, setSelectedKpi }) {
  const drillConfig = selectedKpi ? DRILL_DOWNS[selectedKpi] : null;
  const rows = useMemo(() => {
    if (!drillConfig) return [];
    return drillConfig.filter(data);
  }, [drillConfig, data]);

  return (
    <Card sx={{ mt: 2.5, border: selectedKpi ? '2px solid #7e3ff2' : '1px solid #e9edf2', boxShadow: selectedKpi ? '0 4px 16px rgba(126, 63, 242, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        {/* En-tête */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ flex: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: selectedKpi ? '#7e3ff2' : '#6b7a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FilterAltIcon fontSize='small' />
            </Box>
            <Box>
              <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.88rem', color: '#0b2a4a' }}>
                Détail dynamique {selectedKpi ? `— ${drillConfig.label}` : ''}
              </Typography>
              <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#6b7a8a' }}>
                {selectedKpi ? `${rows.length} enregistrement(s) — Cliquez sur un KPI ci-dessus ou sélectionnez ci-dessous` : 'Cliquez sur un KPI ci-dessus ou sélectionnez-en un pour voir le détail'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1.5} alignItems='center'>
            {/* Menu déroulant des KPIs */}
            <FormControl size='small' sx={{ minWidth: 220 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Sélectionner un KPI</InputLabel>
              <Select
                value={selectedKpi || ''}
                onChange={(e) => setSelectedKpi(e.target.value || null)}
                label='Sélectionner un KPI'
                sx={{ fontSize: '0.78rem', height: 34, bgcolor: '#fff' }}
              >
                <MenuItem value=''><em>Aucun (masquer)</em></MenuItem>
                {Object.entries(DRILL_DOWNS).map(([key, cfg]) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: '0.78rem' }}>{cfg.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Bouton Export CSV */}
            {selectedKpi && rows.length > 0 && (
              <Tooltip title='Exporter la liste en CSV (ouvre dans Excel)'>
                <Button
                  size='small' variant='outlined' startIcon={<DownloadIcon />}
                  onClick={() => exportCSV(rows, drillConfig.columns, `drill-down-${selectedKpi}-${new Date().toISOString().slice(0, 10)}.csv`)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', borderColor: '#7e3ff2', color: '#7e3ff2', '&:hover': { bgcolor: '#7e3ff215', borderColor: '#7e3ff2' } }}
                >
                  Exporter la liste
                </Button>
              </Tooltip>
            )}

            {/* Bouton fermer */}
            {selectedKpi && (
              <Tooltip title='Fermer le détail'>
                <IconButton size='small' onClick={() => setSelectedKpi(null)} sx={{ color: '#6b7a8a' }}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Table filtrée */}
        {selectedKpi && (
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 360, border: '1px solid #e9edf2', borderRadius: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#b0c4de', borderRadius: 3 } }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                  {drillConfig.columns.map(col => (
                    <TableCell key={col} sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#0b2a4a', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {COLUMN_LABELS[col] || col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={drillConfig.columns.length} align='center' sx={{ py: 4, color: '#6b7a8a' }}>
                      Aucun enregistrement correspondant à ce filtre
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.slice(0, 100).map((row, i) => (
                    <TableRow key={i} hover sx={{ '&:hover': { bgcolor: '#f4f7fc' } }}>
                      {drillConfig.columns.map(col => <CellRenderer key={col} row={row} col={col} />)}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {rows.length > 100 && (
              <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#fef3e7', fontSize: '0.72rem', color: '#b86a2a' }}>
                Affichage des 100 premiers enregistrements sur {rows.length}. Exportez pour tout voir.
              </Box>
            )}
          </TableContainer>
        )}

        {/* Hint si aucun KPI sélectionné */}
        {!selectedKpi && (
          <Box sx={{ py: 3, textAlign: 'center', color: '#6b7a8a' }}>
            <PersonIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
            <Typography variant='caption' sx={{ display: 'block', fontSize: '0.8rem' }}>
              Cliquez sur un KPI ci-dessus (Effectif Total, CDI, Documents Valides…) ou utilisez le menu déroulant pour afficher la liste détaillée des employés concernés.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
