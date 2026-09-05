import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Stack, Divider, LinearProgress, Accordion, AccordionSummary, AccordionDetails, Alert, IconButton, Tooltip, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import SchemaIcon from '@mui/icons-material/Schema';
import FunctionsIcon from '@mui/icons-material/Functions';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import { SectionHeader, StatusBadge } from './components';

const BASE_URL = '/phase0';

const LIVRABLES = [
  { id: 'regles_metier', name: 'regles_metier.json', title: 'Règles Métier', icon: <DescriptionIcon />, color: 'primary', count: 22, countLabel: 'modules · 164 règles', description: 'Toutes les règles métier extraites des manuels, classées par module (Employés, Contrats, Congés, Paie...)' },
  { id: 'workflows', name: 'workflows.json', title: 'Workflows', icon: <SchemaIcon />, color: 'success', count: 15, countLabel: 'workflows · 95 steps', description: 'Processus formalisés avec acteurs RACI, étapes, statuts et diagrammes Mermaid (demande congé 2-niveaux, sanctions, départs...)' },
  { id: 'interconnexions', name: 'interconnexions.json', title: 'Interconnexions', icon: <SchemaIcon />, color: 'info', count: 32, countLabel: 'interconnexions · 11 triggers SQL', description: '5 points IC-D1-D2 + 18 Master-Satellite (VLOOKUP→JOIN) + 9 D2 internes avec triggers PostgreSQL' },
  { id: 'regles_calcul', name: 'regles_calcul.json', title: 'Règles de Calcul', icon: <FunctionsIcon />, color: 'warning', count: 20, countLabel: 'règles · 20 fonctions TypeScript', description: 'Formules mathématiques (solde congés, mensualité prêts, net paie, indemnité départ) avec fonctions TS implémentées' },
  { id: 'specifications_techniques', name: 'specifications_techniques.md', title: 'Spécifications Techniques', icon: <CodeIcon />, color: 'secondary', count: 898, countLabel: 'lignes · 11 sections', description: 'Stack réelle (React 19 + Vite + MUI 9), architecture déployée, design system, 22 écrans, cible Supabase, écarts vs V2' },
  { id: 'roadmap', name: 'roadmap.md', title: 'Roadmap', icon: <TimelineIcon />, color: 'error', count: 663, countLabel: 'lignes · 8 phases restantes', description: 'Diagramme de Gantt Mermaid, phases 3-10 détaillées, 10 risques, critères de validation, estimation 47.5 j-homme' },
];

const PHASES = [
  { phase: 'Phase 1 — Setup & Fondations', statut: 'Fait', color: 'success', detail: 'Layout D2 + sidebar 5 phases + composants réutilisables + data mock 20 employés' },
  { phase: 'Phase 2 — Tableau de Bord', statut: 'Fait', color: 'success', detail: 'KPI cards + BarChart + PieChart + listes rappels/congés + 7 objectifs ISO' },
  { phase: 'Phase 3-7 — 22 écrans métier', statut: 'Partiel', color: 'warning', detail: 'Squelette DataTable créé pour les 22 écrans, formulaires détaillés à approfondir' },
  { phase: 'Phase 8 — Tests E2E', statut: 'À faire', color: 'default', detail: 'Tests Playwright à coder (basés sur les 15 workflows formalisés)' },
  { phase: 'Phase 9 — Déploiement', statut: 'Fait', color: 'success', detail: 'Wrangler automatisé + _redirects SPA + déploiement direct upload Cloudflare Pages' },
  { phase: 'Phase 0 — Doc & Stratégie', statut: 'Fait', color: 'success', detail: '6 livrables produits (cette page) : règles, workflows, interconnexions, calculs, spec, roadmap' },
];

const STATS = [
  { label: 'Modules couverts', value: '22', sublabel: 'Employés → Tableau de Bord' },
  { label: 'Règles métier', value: '164', sublabel: 'Toutes sourcées V2' },
  { label: 'Workflows formalisés', value: '15', sublabel: '95 steps · 15 Mermaid' },
  { label: 'Interconnexions', value: '32', sublabel: '5 D1-D2 + 18 MS + 9 D2' },
  { label: 'Règles de calcul', value: '20', sublabel: 'Avec fonctions TypeScript' },
  { label: 'Triggers SQL', value: '11', sublabel: 'PostgreSQL documentés' },
];

const CONFORMITE = [
  { norme: 'ISO 30401:2018', desc: 'Système de Management RH' },
  { norme: 'ISO 9001:2015', desc: 'Management de la Qualité (PDCA, audits, NC)' },
  { norme: 'ISO 10667:2011', desc: 'Services de conseil en recrutement (lien D1-D2)' },
  { norme: 'ISO 22400-3:2022', desc: 'Indicateurs de performance RH (KPIs)' },
];

export default function Phase0Docs() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});

  const fetchData = async (livrable) => {
    setLoading(l => ({ ...l, [livrable.id]: true }));
    try {
      const ext = livrable.name.endsWith('.json') ? 'json' : 'md';
      const res = await fetch(`${BASE_URL}/${livrable.name}`);
      const text = await res.text();
      setData(d => ({ ...d, [livrable.id]: ext === 'json' ? JSON.parse(text) : text }));
    } catch (e) {
      setData(d => ({ ...d, [livrable.id]: { error: e.message } }));
    }
    setLoading(l => ({ ...l, [livrable.id]: false }));
  };

  useEffect(() => {
    LIVRABLES.forEach(l => fetchData(l));
  }, []);

  return (
    <Box>
      {/* En-tête Phase 0 */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText', backgroundImage: 'linear-gradient(135deg, #1B4F72 0%, #0D7C66 100%)' }}>
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems='center' gap={2}>
            <Box>
              <Chip label='PHASE 0' size='small' sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1 }} />
              <Typography variant='h5' fontWeight={700}>Préparation & Stratégie — Documentation</Typography>
              <Typography variant='caption' sx={{ opacity: 0.85 }}>
                6 livrables produits à partir des manuels ISO et du prompt V2 · Prêts pour exécution Phases 3-10
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {CONFORMITE.map(c => (
                <Tooltip key={c.norme} title={c.desc}>
                  <Chip label={c.norme} size='small' sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: '0.65rem' }} />
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats globales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STATS.map(s => (
          <Grid item xs={6} md={2} key={s.label}>
            <Card sx={{ textAlign: 'center', py: 1 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant='h4' fontWeight={800} color='primary.main'>{s.value}</Typography>
                <Typography variant='caption' fontWeight={600} sx={{ display: 'block', fontSize: '0.72rem' }}>{s.label}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.62rem' }}>{s.sublabel}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cartes livrables */}
      <SectionHeader title='6 Livrables Phase 0' subtitle='Cliquez pour développer et prévisualiser le contenu' />
      <Grid container spacing={2}>
        {LIVRABLES.map(l => (
          <Grid item xs={12} md={6} key={l.id}>
            <Card>
              <CardContent>
                <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${l.color}.main`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.icon}</Box>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={700}>{l.title}</Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{l.name}</Typography>
                    </Box>
                  </Box>
                  <Chip label={l.countLabel} size='small' color={l.color} variant='outlined' sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem', mb: 1.5, minHeight: 40 }}>{l.description}</Typography>
                <Stack direction='row' spacing={1}>
                  <Button size='small' variant='outlined' startIcon={<DownloadIcon />} href={`${BASE_URL}/${l.name}`} download>Télécharger</Button>
                  <Button size='small' variant='text' href={`${BASE_URL}/${l.name}`} target='_blank'>Voir raw</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Aperçu JSON interactif */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SectionHeader title='Aperçu interactif des livrables' subtitle='Dépliez pour prévisualiser le contenu structuré' />
          {LIVRABLES.filter(l => l.name.endsWith('.json')).map(l => (
            <Accordion key={l.id} sx={{ '&:before': { display: 'none' }, mb: 0.5 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ width: '100%' }}>
                  <VerifiedIcon color={l.color} fontSize='small' />
                  <Typography variant='subtitle2' fontWeight={600} sx={{ fontSize: '0.85rem' }}>{l.title}</Typography>
                  <Chip label={data[l.id] ? (Array.isArray(data[l.id]?.modules || data[l.id]?.workflows || data[l.id]?.interconnexions || data[l.id]?.regles) ? (data[l.id]?.modules || data[l.id]?.workflows || data[l.id]?.interconnexions || data[l.id]?.regles).length : '?') + ' éléments' : 'chargement...'} size='small' color={l.color} variant='outlined' sx={{ ml: 'auto', fontSize: '0.65rem' }} />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {loading[l.id] ? <LinearProgress /> : (
                  data[l.id]?.error ? <Alert severity='error'>{data[l.id].error}</Alert> : (
                    data[l.id] ? (
                      <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'background.default', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        {(() => {
                          const str = JSON.stringify(data[l.id], null, 2);
                          return <pre style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{str.slice(0, 5000)}{str.length > 5000 ? '\n... (tronqué, voir raw)' : ''}</pre>;
                        })()}
                      </Box>
                    ) : <Typography color='text.secondary'>Aucune donnée</Typography>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* État d'avancement global */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SectionHeader title="État d'avancement du projet Domaine 2" subtitle="Synthèse des phases (cf. roadmap.md pour le détail)" />
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Phase</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Détail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PHASES.map(p => (
                  <TableRow key={p.phase} hover>
                    <TableCell><Typography variant='body2' fontWeight={600} sx={{ fontSize: '0.8rem' }}>{p.phase}</Typography></TableCell>
                    <TableCell><StatusBadge status={p.statut === 'Fait' ? 'Valide' : p.statut === 'Partiel' ? 'A renouveler' : 'Echu'} label={p.statut} /></TableCell>
                    <TableCell><Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>{p.detail}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Liens utiles */}
      <Card sx={{ mt: 3, bgcolor: 'action.hover' }}>
        <CardContent>
          <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>Liens utiles</Typography>
          <Stack direction='row' spacing={2} flexWrap='wrap'>
            <Link href={`${BASE_URL}/specifications_techniques.md`} target='_blank' sx={{ fontSize: '0.8rem' }}>Spec techniques</Link>
            <Link href={`${BASE_URL}/roadmap.md`} target='_blank' sx={{ fontSize: '0.8rem' }}>Roadmap complète</Link>
            <Link href='/domaine2_Gestion_Administrative_Personnel' sx={{ fontSize: '0.8rem' }}>← Retour Tableau de Bord D2</Link>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
