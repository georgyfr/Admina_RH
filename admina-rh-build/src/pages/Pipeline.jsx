import { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper, Chip, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import { nomenclatures } from '../data/nomenclatures';

const prioriteColor = { 'Haute': 'error', 'Moyenne': 'warning', 'Basse': 'default' };

const stages = [
  { key: 'CV recu', label: 'CV reçus' },
  { key: 'Pre-selection', label: 'Pré-sélection' },
  { key: 'Entretien HR', label: 'Entretien HR' },
  { key: 'Test technique', label: 'Test technique' },
  { key: 'Entretien final', label: 'Entretien final' },
  { key: 'Offre envoyee', label: 'Offre envoyée' },
  { key: 'Accepte', label: 'Accepté' },
  { key: 'Refuse', label: 'Refusé' },
];

const initialData = [
  { id:1, numero:'PPL-001', nom:'Ndiaye Moussa', poste:'Chef Cuisinier', source:'Cabinet de recrutement', stade:'Accepte', priorite:'Haute', date:'10/01/2025', score:18,
    departement:'Restauration', dateMouvement:'25/02/2025', delai:46, evaluateur:'Mme. Fotso Marie', prochaineAction:'Intégration', notes:'Embauche confirmée' },
  { id:2, numero:'PPL-002', nom:'Tchouankou Claire', poste:'Comptable Senior', source:'LinkedIn', stade:'Entretien final', priorite:'Haute', date:'12/01/2025', score:16,
    departement:'Finance & Comptabilite', dateMouvement:'20/02/2025', delai:39, evaluateur:'M. Nkoulou Paul', prochaineAction:'Décision finale', notes:'En attente de retour candidat' },
  { id:3, numero:'PPL-003', nom:'Nganou André', poste:'Agent de Sécurité', source:'Site web entreprise', stade:'Test technique', priorite:'Moyenne', date:'18/01/2025', score:12,
    departement:'Securite', dateMouvement:'22/02/2025', delai:35, evaluateur:'M. Kamga Blaise', prochaineAction:'Entretien final', notes:'2ème tour prévu' },
  { id:4, numero:'PPL-004', nom:'Mebara Nadège', poste:'Agent Accueil', source:'Cooptation', stade:'Offre envoyee', priorite:'Haute', date:'20/01/2025', score:17,
    departement:'Service Client', dateMouvement:'25/02/2025', delai:36, evaluateur:'M. Nkoulou Paul', prochaineAction:'Réponse candidat', notes:'Offre envoyée, en attente' },
  { id:5, numero:'PPL-005', nom:'Kamga Blaise', poste:'Développeur Full Stack', source:'Cabinet de recrutement', stade:'Entretien HR', priorite:'Haute', date:'25/01/2025', score:null,
    departement:'Informatique', dateMouvement:'28/02/2025', delai:34, evaluateur:'M. Ngo Ndobo Alain', prochaineAction:'Test technique', notes:'Profil rare, cabinet mandaté' },
  { id:6, numero:'PPL-006', nom:'Eyenga Clarisse', poste:'Community Manager', source:'Reseaux sociaux', stade:'CV recu', priorite:'Moyenne', date:'01/02/2025', score:null,
    departement:'Marketing & Communication', dateMouvement:'01/02/2025', delai:0, evaluateur:'', prochaineAction:'Pré-sélection', notes:'CV récemment reçu' },
  { id:7, numero:'PPL-007', nom:'Ateba Chantal', poste:'Agent Accueil', source:'Site web entreprise', stade:'Pre-selection', priorite:'Basse', date:'05/02/2025', score:null,
    departement:'Service Client', dateMouvement:'10/02/2025', delai:5, evaluateur:'', prochaineAction:'Entretien téléphonique', notes:'CV en cours d\'analyse' },
  { id:8, numero:'PPL-008', nom:'Nkoulou Brandon', poste:'Réceptionniste Nuit', source:'Site web entreprise', stade:'Refuse', priorite:'Moyenne', date:'08/02/2025', score:10,
    departement:'Herbergement', dateMouvement:'25/02/2025', delai:17, evaluateur:'Mme. Fotso Marie', prochaineAction:'', notes:'Candidat trop junior' },
  { id:9, numero:'PPL-009', nom:'Tabi Sandrine', poste:'Réceptionniste Nuit', source:'Cabinet de recrutement', stade:'Accepte', priorite:'Haute', date:'10/02/2025', score:16,
    departement:'Herbergement', dateMouvement:'26/02/2025', delai:16, evaluateur:'M. Nkoulou Paul', prochaineAction:'Contrat à signer', notes:'Retenue, processus en cours' },
  { id:10, numero:'PPL-010', nom:'Fomumbod David', poste:'Développeur Full Stack', source:'LinkedIn', stade:'CV recu', priorite:'Haute', date:'15/02/2025', score:null,
    departement:'Informatique', dateMouvement:'15/02/2025', delai:0, evaluateur:'', prochaineAction:'Pré-sélection', notes:'Profil intéressant à analyser' },
];

export default function Pipeline() {
  const [data] = useState(initialData);

  const totalCandidats = data.length;
  const stadesActifs = stages.filter(s => data.some(d => d.stade === s.key)).length;
  const pctActifs = Math.round(stadesActifs / stages.length * 100);

  const stadeCounts = stages.map(s => ({ ...s, count: data.filter(d => d.stade === s.key).length }));

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Pipeline de Recrutement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Glissez-déposez les candidats entre les colonnes</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<Add fontSize="small" />}>Nouvelle candidature</Button>
      </Box>
      {/* Kanban Board */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2 }}>
        {stadeCounts.map(stage => (
          <Paper key={stage.key} variant="outlined" sx={{ minWidth: 200, flex: '1 0 200px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="body2" fontWeight="bold">{stage.label}</Typography>
              <Chip label={stage.count} size="small" sx={{ mt: 0.5 }} />
            </Box>
            <Box sx={{ p: 1, flex: 1, minHeight: 120 }}>
              {data.filter(d => d.stade === stage.key).map(c => (
                <Paper key={c.id} variant="elevation" sx={{ p: 1.5, mb: 1, cursor: 'pointer' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>{c.nom}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.poste}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{c.source}</Typography>
                    <Chip label={c.priorite} size="small" color={prioriteColor[c.priorite]} sx={{ height: 20, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{c.date}</Typography>
                    {c.score !== null && <Typography variant="caption" fontWeight="bold">{c.score}/20</Typography>}
                  </Box>
                  {/* NEW FIELDS ON CARD */}
                  <Box sx={{ mt: 0.5, borderTop: '1px dashed #e0e0e0', pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {c.departement}{c.delai > 0 ? ` · ${c.delai}j` : ''}{c.evaluateur ? ` · ${c.evaluateur.split(' ')[0]}` : ''}
                    </Typography>
                  </Box>
                </Paper>
              ))}
              {stage.count === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4, fontStyle: 'italic' }}>Aucun candidat</Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
      {/* Footer */}
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2"><strong>{totalCandidats} candidats dans le pipeline</strong></Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {stadeCounts.filter(s => s.count > 0).map(s => (
              <Typography key={s.key} variant="caption" color="text.secondary">{s.label}: <strong>{s.count}</strong></Typography>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">Stades actifs : {pctActifs}% du pipeline</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
