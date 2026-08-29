import { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper, Card, CardContent, Chip, Divider, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const initialData = [
  {
    id: 1, numero: 'EVAL-2025-001', candidat: 'Ndiaye Moussa', evaluateur: 'Mme. Fotso Marie', date: '12/02/2025',
    posteVise: 'Chef Cuisinier', salaireSouhaite: 380000, salairePropose: 350000,
    sourceCandidature: 'Cabinet de recrutement', statutCandidat: 'Retenu',
    recommandation: 'Embaucher',
    criteres: [
      { nom: 'Compétences techniques', note: 5, commentaire: 'Excellente maîtrise de la cuisine camerounaise et internationale' },
      { nom: 'Expérience professionnelle', note: 4.5, commentaire: '8 ans dont 3 en position similaire' },
      { nom: 'Qualités humaines', note: 5, commentaire: 'Très bon relationnel, leadership naturel' },
      { nom: 'Motivation', note: 4.8, commentaire: 'Projets cohérents avec le poste' },
      { nom: 'Adéquation au poste', note: 4.5, commentaire: 'Profil parfaitement aligné' },
    ],
    total: 23.8, score20: 19.0,
    commentaireGlobal: 'Candidat exceptionnel, recommandé pour embauche immédiate. Score parmi les plus élevés.',
  },
  {
    id: 2, numero: 'EVAL-2025-002', candidat: 'Tchouankou Claire', evaluateur: 'M. Nkoulou Paul', date: '15/02/2025',
    posteVise: 'Comptable Senior', salaireSouhaite: 420000, salairePropose: 400000,
    sourceCandidature: 'LinkedIn', statutCandidat: 'Retenu',
    recommandation: 'Embaucher',
    criteres: [
      { nom: 'Compétences techniques', note: 4, commentaire: 'Bonne maîtrise des logiciels comptables' },
      { nom: 'Expérience professionnelle', note: 4, commentaire: '5 ans en comptabilité, dont 2 en senior' },
      { nom: 'Qualités humaines', note: 3.5, commentaire: 'Réservée mais professionnelle' },
      { nom: 'Motivation', note: 4, commentaire: 'Motivée par le secteur hôtelier' },
      { nom: 'Adéquation au poste', note: 4.2, commentaire: 'Bon profil pour le poste' },
    ],
    total: 19.7, score20: 15.8,
    commentaireGlobal: 'Bon candidat avec un potentiel certain. Nécessite un accompagnement sur la communication.',
  },
  {
    id: 3, numero: 'EVAL-2025-003', candidat: 'Nkoulou Brandon', evaluateur: 'M. Kamga Blaise', date: '20/02/2025',
    posteVise: 'Réceptionniste Nuit', salaireSouhaite: 180000, salairePropose: 0,
    sourceCandidature: 'Site web entreprise', statutCandidat: 'En cours d\'etude',
    recommandation: 'Ne pas embaucher',
    criteres: [
      { nom: 'Compétences techniques', note: 2.5, commentaire: 'Connaissances de base en accueil' },
      { nom: 'Expérience professionnelle', note: 2, commentaire: 'Expérience limitée à des stages' },
      { nom: 'Qualités humaines', note: 3, commentaire: 'Dynamique mais manque de maturité' },
      { nom: 'Motivation', note: 3, commentaire: 'Motivé mais manque de préparation' },
      { nom: 'Adéquation au poste', note: 2.5, commentaire: 'Profil insuffisant pour un poste de nuit' },
    ],
    total: 13.0, score20: 10.4,
    commentaireGlobal: 'Candidat trop junior pour le poste. À conserver en réserve pour un poste d\'agent d\'accueil junior.',
  },
];

export default function Evaluations() {
  const [data] = useState(initialData);

  const totalEvals = data.length;
  const scoreMoyen = (data.reduce((s, d) => s + d.score20, 0) / totalEvals).toFixed(1);
  const recoEmbauche = data.filter(d => d.recommandation === 'Embaucher').length;
  const recoRefus = data.filter(d => d.recommandation === 'Ne pas embaucher').length;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Évaluations des Candidats</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>3 évaluation(s) enregistrée(s)</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle Évaluation</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL ÉVALUATIONS" valeur={totalEvals} sousTexte={`${totalEvals} évaluation(s)`} />
        <KPICard titre="SCORE MOYEN" valeur={`${scoreMoyen}/20`} sousTexte={`${recoEmbauche} recommandé(s), ${recoRefus} refusé(s)`} />
        <KPICard titre="RECOMMANDATION EMBAUCHE" valeur={recoEmbauche} sousTexte={`${Math.round(recoEmbauche / totalEvals * 100)}% du total`} />
        <KPICard titre="RECOMMANDATION REFUS" valeur={recoRefus} sousTexte={`${Math.round(recoRefus / totalEvals * 100)}% du total`} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map(ev => (
          <Card key={ev.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{ev.candidat}</Typography>
                  <Typography variant="body2" color="text.secondary">Évaluateur : {ev.evaluateur} — {ev.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={ev.recommandation} size="small" color={ev.recommandation === 'Embaucher' ? 'success' : 'error'} />
                </Box>
              </Box>
              {/* NEW COLUMNS AS INFO CHIPS */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`N° : ${ev.numero}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                <Chip label={`Poste : ${ev.posteVise}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                <Chip label={`Souhaité : ${ev.salaireSouhaite?.toLocaleString('fr-FR') || '—'} FCFA`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                <Chip label={`Proposé : ${ev.salairePropose ? ev.salairePropose.toLocaleString('fr-FR') + ' FCFA' : '—'}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                <Chip label={`Source : ${ev.sourceCandidature}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                <Chip label={`Statut : ${ev.statutCandidat}`} size="small" color={ev.statutCandidat === 'Retenu' ? 'success' : 'default'} sx={{ fontSize: '0.75rem' }} />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              {ev.criteres.map((c, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>{c.nom}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Box key={n} sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: n <= Math.round(c.note) ? '#1976d2' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: n <= Math.round(c.note) ? '#fff' : '#999', fontSize: '0.65rem' }}>{n}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>{c.note}/5</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{c.commentaire}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Total : <strong>{ev.total}/25</strong> — Score : <strong>{ev.score20}/20</strong> — soit {ev.total}/25</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary"><strong>Commentaire global :</strong> {ev.commentaireGlobal}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
