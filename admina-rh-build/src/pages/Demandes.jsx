import { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, FormControl, Select, MenuItem, Tooltip, Paper, Drawer, Divider, IconButton, TextField, Badge, Avatar, List, ListItem, ListItemAvatar, ListItemText, LinearProgress, Alert, Snackbar, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Add, Download, Close, Send, CheckCircle, ArrowForward, Schedule, Business, Person, Edit, NoteAdd, History, TrendingUp, AssignmentTurnedIn, CalendarToday, AccountBalanceWallet, Timer, ViewList, ViewKanban, DragIndicator, People, AccessTime } from '@mui/icons-material';
import KPICard from '../components/KPICard';
import AddDialog from '../components/AddDialog';
import { nomenclatures } from '../data/nomenclatures';
import { useNavigate } from 'react-router-dom';

const formatFCFA = (a) => (!a && a !== 0) ? '—' : a.toLocaleString('fr-FR') + ' FCFA';

const initialData = [
  { id:1, numero:'DR-2025-001', dateDemande:'15/01/2025', departement:'Restauration', posteRecherche:'Chef Cuisinier', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Remplacement', dateBesoin:'01/02/2025', priorite:'Urgente', statut:'Pourvue', datePourvue:'15/03/2025', responsableDemande:'M. Nkoulou Paul', roleResponsable:'DRH', cabinetAgence:'HRC Cameroon', budgetSalaire:350000, coutRecrutement:150000, delai:30, notes:'Candidat interne recommandé', site:'Hôtel Sawa',
    historique:[
      {date:'15/01/2025', evenement:'Demande créée', auteur:'M. Nkoulou Paul', type:'creation'},
      {date:'16/01/2025', evenement:'Validation DRH', auteur:'DRH', type:'validation'},
      {date:'20/01/2025', evenement:'Mandat donné au cabinet HRC Cameroon', auteur:'DRH', type:'cabinet'},
      {date:'10/02/2025', evenement:'3 candidats reçus', auteur:'HRC Cameroon', type:'candidature'},
      {date:'01/03/2025', evenement:'Entretien final réalisé', auteur:'M. Nkoulou Paul', type:'entretien'},
      {date:'15/03/2025', evenement:'Poste pourvu — candidat retenu', auteur:'DRH', type:'pourvoi'},
    ],
    candidatsAssocies:[
      {nom:'Ndiaye Moussa', score:18, etape:'Sélectionné', source:'Cooptation'},
      {nom:'Fotso Amandine', score:14, etape:'Rejeté', source:'Site web'},
      {nom:'Nganou André', score:11, etape:'Rejeté', source:'Indeed'},
    ]
  },
  { id:2, numero:'DR-2025-002', dateDemande:'20/01/2025', departement:'Hebergement', posteRecherche:'Réceptionniste Nuit', typePoste:'Operationnel', typeContrat:'CDD', effectif:2, motif:'Saisonnalite', dateBesoin:'01/03/2025', priorite:'Haute', statut:'En cours', datePourvue:'', responsableDemande:'Mme. Fotso Marie', roleResponsable:'Chef de Departement', cabinetAgence:'', budgetSalaire:180000, coutRecrutement:80000, delai:45, notes:'Recrutement interne en cours', site:'Hôtel Sawa',
    historique:[
      {date:'20/01/2025', evenement:'Demande créée', auteur:'Mme. Fotso Marie', type:'creation'},
      {date:'22/01/2025', evenement:'Validation DRH Adjoint', auteur:'DRH Adjoint', type:'validation'},
      {date:'01/02/2025', evenement:'Offre publiée sur les canaux', auteur:'Service RH', type:'publication'},
      {date:'15/02/2025', evenement:'5 CVs reçus — présélection en cours', auteur:'Service RH', type:'candidature'},
    ],
    candidatsAssocies:[
      {nom:'Mebara Nadège', score:17, etape:'Entretien HR', source:'Site web'},
      {nom:'Tabi Sandrine', score:15, etape:'CV reçu', source:'Site web'},
      {nom:'Bikay Jean-Pierre', score:14, etape:'Test technique', source:'LinkedIn'},
      {nom:'Eyenga Clarisse', score:null, etape:'CV reçu', source:'Cooptation'},
      {nom:'Fotso Amandine', score:null, etape:'CV reçu', source:'LinkedIn'},
    ]
  },
  { id:3, numero:'DR-2025-003', dateDemande:'25/01/2025', departement:'Finance & Comptabilite', posteRecherche:'Comptable Senior', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/04/2025', priorite:'Moyenne', statut:'Validée', datePourvue:'', responsableDemande:'M. Tchouankou Jean', roleResponsable:'DRH Adjoint', cabinetAgence:'Activa RH', budgetSalaire:400000, coutRecrutement:250000, delai:60, notes:'Recherche spécialisée', site:'Annexe (Yaoundé)',
    historique:[
      {date:'25/01/2025', evenement:'Demande créée', auteur:'M. Tchouankou Jean', type:'creation'},
      {date:'28/01/2025', evenement:'Validation DRH', auteur:'DRH', type:'validation'},
      {date:'05/02/2025', evenement:'Cabinet Activa RH mandaté', auteur:'DRH', type:'cabinet'},
    ],
    candidatsAssocies:[
      {nom:'Kamga Blaise', score:null, etape:'En attente cabinet', source:'Cabinet'},
    ]
  },
  { id:4, numero:'DR-2025-004', dateDemande:'01/02/2025', departement:'Service Client', posteRecherche:'Agent Accueil', typePoste:'Operationnel', typeContrat:'CDD', effectif:1, motif:'Surcharge', dateBesoin:'15/02/2025', priorite:'Haute', statut:'Pourvue', datePourvue:'10/03/2025', responsableDemande:'Mme. Eyenga Clarisse', roleResponsable:'Chef de Service', cabinetAgence:'Interne (sans cabinet)', budgetSalaire:150000, coutRecrutement:25000, delai:15, notes:'Recrutement rapide réussi', site:'Hôtel Sawa',
    historique:[
      {date:'01/02/2025', evenement:'Demande créée', auteur:'Mme. Eyenga Clarisse', type:'creation'},
      {date:'02/02/2025', evenement:'Validation rapide — urgence', auteur:'DRH', type:'validation'},
      {date:'15/02/2025', evenement:'Candidat identifié en interne', auteur:'Service RH', type:'candidature'},
      {date:'10/03/2025', evenement:'Poste pourvu', auteur:'DRH', type:'pourvoi'},
    ],
    candidatsAssocies:[
      {nom:'Ateba Chantal', score:16, etape:'Sélectionné', source:'Interne'},
    ]
  },
  { id:5, numero:'DR-2025-005', dateDemande:'05/02/2025', departement:'Securite', posteRecherche:'Agent de Sécurité', typePoste:'Operationnel', typeContrat:'CDD', effectif:3, motif:'Remplacement', dateBesoin:'01/03/2025', priorite:'Moyenne', statut:'En attente', datePourvue:'', responsableDemande:'M. Nganou André', roleResponsable:'Responsable de Pole', cabinetAgence:'', budgetSalaire:120000, coutRecrutement:45000, delai:30, notes:'', site:'Siège (Douala)',
    historique:[
      {date:'05/02/2025', evenement:'Demande créée', auteur:'M. Nganou André', type:'creation'},
    ],
    candidatsAssocies:[]
  },
  { id:6, numero:'DR-2025-006', dateDemande:'10/02/2025', departement:'Informatique', posteRecherche:'Développeur Full Stack', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/05/2025', priorite:'Basse', statut:'En attente', datePourvue:'', responsableDemande:'M. Kamga Blaise', roleResponsable:'Directeur Adjoint', cabinetAgence:'Skillmatch Africa', budgetSalaire:500000, coutRecrutement:300000, delai:90, notes:'Profil rare, cabinet mandaté', site:'Siège (Douala)',
    historique:[
      {date:'10/02/2025', evenement:'Demande créée', auteur:'M. Kamga Blaise', type:'creation'},
      {date:'12/02/2025', evenement:'En attente validation direction', auteur:'Directeur Adjoint', type:'validation'},
    ],
    candidatsAssocies:[
      {nom:'Nkoulou Brandon', score:10, etape:'Test technique', source:'Site web'},
    ]
  },
  { id:7, numero:'DR-2025-007', dateDemande:'15/02/2025', departement:'Marketing & Communication', posteRecherche:'Community Manager', typePoste:'Agent de maitrise', typeContrat:'CDI', effectif:1, motif:'Surcharge', dateBesoin:'01/03/2025', priorite:'Haute', statut:'En cours', datePourvue:'', responsableDemande:'Mme. Mebara Nadège', roleResponsable:'Chef de Departement', cabinetAgence:'', budgetSalaire:250000, coutRecrutement:60000, delai:20, notes:'', site:'Siège (Douala)',
    historique:[
      {date:'15/02/2025', evenement:'Demande créée', auteur:'Mme. Mebara Nadège', type:'creation'},
      {date:'16/02/2025', evenement:'Validée par DRH', auteur:'DRH', type:'validation'},
      {date:'20/02/2025', evenement:'Offre publiée — LinkedIn + Site web', auteur:'Service RH', type:'publication'},
      {date:'25/02/2025', evenement:'12 CVs reçus', auteur:'Service RH', type:'candidature'},
    ],
    candidatsAssocies:[
      {nom:'Eyenga Clarisse', score:null, etape:'CV reçu', source:'Cooptation'},
      {nom:'Tabi Sandrine', score:15, etape:'Entretien HR', source:'Site web'},
    ]
  },
  { id:8, numero:'DR-2025-008', dateDemande:'20/02/2025', departement:'Logistique & Approvisionnement', posteRecherche:'Chef Approvisionnement', typePoste:'Cadre', typeContrat:'CDI', effectif:1, motif:'Creation de poste', dateBesoin:'01/06/2025', priorite:'Moyenne', statut:'Validée', datePourvue:'', responsableDemande:'M. Ngo Ndobo Alain', roleResponsable:'DRH', cabinetAgence:'Michael Page Cameroon', budgetSalaire:450000, coutRecrutement:200000, delai:75, notes:'Processus en cours avec cabinet', site:'Siège (Douala)',
    historique:[
      {date:'20/02/2025', evenement:'Demande créée', auteur:'M. Ngo Ndobo Alain', type:'creation'},
      {date:'22/02/2025', evenement:'Validation DRH', auteur:'DRH', type:'validation'},
      {date:'01/03/2025', evenement:'Cabinet Michael Page mandaté', auteur:'DRH', type:'cabinet'},
    ],
    candidatsAssocies:[]
  },
  { id:9, numero:'DR-2025-009', dateDemande:'01/03/2025', departement:'Audiovisuel', posteRecherche:'Technicien Audiovisuel', typePoste:'Agent de maitrise', typeContrat:'CDD', effectif:1, motif:'', dateBesoin:'15/03/2025', priorite:'Urgente', statut:'Annulee', datePourvue:'', responsableDemande:'M. Tabe Arnaud', roleResponsable:'Superviseur', cabinetAgence:'', budgetSalaire:200000, coutRecrutement:0, delai:30, notes:'Poste annulé faute de budget', site:'Campus Formation',
    historique:[
      {date:'01/03/2025', evenement:'Demande créée', auteur:'M. Tabe Arnaud', type:'creation'},
      {date:'05/03/2025', evenement:'Demande annulée — budget insuffisant', auteur:'Direction', type:'annulation'},
    ],
    candidatsAssocies:[]
  },
  { id:10, numero:'DR-2025-010', dateDemande:'05/03/2025', departement:'Lingerie', posteRecherche:'Agent de Blanchisserie', typePoste:'Operationnel', typeContrat:'CDD', effectif:2, motif:'Saisonnalite', dateBesoin:'01/04/2025', priorite:'Basse', statut:'En attente', datePourvue:'', responsableDemande:'Mme. Ateba Chantal', roleResponsable:'Chef de Service', cabinetAgence:'', budgetSalaire:100000, coutRecrutement:30000, delai:30, notes:'', site:'Hôtel Sawa',
    historique:[
      {date:'05/03/2025', evenement:'Demande créée', auteur:'Mme. Ateba Chantal', type:'creation'},
    ],
    candidatsAssocies:[]
  },
];

const prioriteColor = { 'Urgente':'error', 'Haute':'warning', 'Moyenne':'info', 'Basse':'default' };
const statutColor = { 'Pourvue':'success', 'En cours':'warning', 'Annulee':'error', 'Validée':'info', 'En attente':'default' };
const histIcon = { creation:'Add', validation:'CheckCircle', cabinet:'Business', publication:'Send', candidature:'Person', entretien:'AssignmentTurnedIn', pourvoi:'CheckCircle', annulation:'Close' };
const histColor = { creation:'#1976d2', validation:'#2e7d32', cabinet:'#7b1fa2', publication:'#0D7C66', candidature:'#f57f17', entretien:'#1565c0', pourvoi:'#2e7d32', annulation:'#d32f2f' };

/* ═══ KANBAN CONFIG ═══ */
const KANBAN_COLS = [
  { id: 'En attente', label: 'En attente', color: '#9e9e9e', bgcolor: '#f5f5f5' },
  { id: 'Validée',   label: 'Validée',   color: '#1976d2', bgcolor: '#e3f2fd' },
  { id: 'En cours',  label: 'En cours',  color: '#f57f17', bgcolor: '#fff8e1' },
  { id: 'Pourvue',   label: 'Pourvue',   color: '#2e7d32', bgcolor: '#e8f5e9' },
  { id: 'Annulee',   label: 'Annulée',   color: '#d32f2f', bgcolor: '#ffebee' },
];

/* ═══ KANBAN BOARD ═══ */
function KanbanBoard({ data, onStatutChange, onCardClick }) {
  const columns = useMemo(() => {
    const map = {};
    KANBAN_COLS.forEach(c => { map[c.id] = []; });
    data.forEach(d => { if (map[d.statut]) map[d.statut].push(d); });
    return map;
  }, [data]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const id = parseInt(draggableId, 10);
    onStatutChange(id, destination.droppableId);
  }, [onStatutChange]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2, minHeight: 500 }}>
        {KANBAN_COLS.map(col => {
          const items = columns[col.id] || [];
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <Paper ref={provided.innerRef} {...provided.droppableProps}
                  variant="outlined"
                  sx={{
                    minWidth: 280, maxWidth: 320, flex: '1 1 280px',
                    display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 320px)',
                    borderTop: `3px solid ${col.color}`,
                    bgcolor: snapshot.isDraggingOver ? `${col.bgcolor}` : 'background.paper',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {/* Column header */}
                  <Box sx={{ p: 1.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: col.color, flex: 1, fontSize: '0.85rem' }}>{col.label}</Typography>
                    <Badge badgeContent={items.length} sx={{ '& .MuiBadge-badge': { bgcolor: col.color, color: 'white', fontWeight: 700, fontSize: '0.7rem' } }} />
                  </Box>

                  {/* Cards */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {items.map((d, idx) => {
                      const jours = Math.floor((new Date() - new Date(d.dateDemande.split('/').reverse().join('-'))) / 86400000);
                      const delaiPct = d.delai > 0 ? Math.min(100, Math.round((jours / d.delai) * 100)) : 0;
                      const delaiColor = delaiPct >= 100 ? '#d32f2f' : delaiPct >= 75 ? '#f57f17' : '#2e7d32';
                      return (
                        <Draggable key={d.id} draggableId={String(d.id)} index={idx}>
                          {(prov, snap) => (
                            <Paper ref={prov.innerRef} {...prov.draggableProps}
                              onClick={() => onCardClick(d)}
                              sx={{
                                p: 1.5, cursor: snap.isDragging ? 'grabbing' : 'grab',
                                borderLeft: `3px solid ${prioriteColor[d.priorite] === 'error' ? '#d32f2f' : prioriteColor[d.priorite] === 'warning' ? '#f57f17' : prioriteColor[d.priorite] === 'info' ? '#1976d2' : '#bdbdbd'}`,
                                boxShadow: snap.isDragging ? 4 : 1,
                                opacity: snap.isDragging ? 0.9 : 1,
                                transform: snap.isDragging ? 'rotate(2deg)' : 'none',
                                transition: 'box-shadow 0.2s, transform 0.2s, opacity 0.2s',
                                '&:hover': { boxShadow: 3 },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Box {...prov.dragHandleProps} sx={{ mt: 0.3, color: 'text.disabled', '&:hover': { color: 'text.primary' } }}><DragIndicator sx={{ fontSize: 18 }} /></Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{d.numero}</Typography>
                                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem', lineHeight: 1.3, mb: 0.5 }} noWrap>{d.posteRecherche}</Typography>
                                  <Chip label={d.departement} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', mb: 1 }} />
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}><AccessTime sx={{ fontSize: 12, color: delaiColor }} /><Typography variant="caption" sx={{ fontSize: '0.7rem', color: delaiColor, fontWeight: 600 }}>{jours}j/{d.delai}j</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}><People sx={{ fontSize: 12, color: 'text.secondary' }} /><Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{d.candidatsAssocies?.length || 0} candidat(s)</Typography></Box>
                                  </Box>
                                  <Chip label={d.priorite} size="small" color={prioriteColor[d.priorite]} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, ml: 'auto' }} />
                                </Box>
                              </Box>
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{d.responsableDemande}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{d.typeContrat} · {d.effectif}</Typography>
                              </Box>
                              {/* Mini progress bar */}
                              <LinearProgress variant="determinate" value={delaiPct} sx={{ mt: 1, height: 3, borderRadius: 1.5, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: delaiColor, borderRadius: 1.5 } }} />
                            </Paper>
                          )}
                        </Draggable>
                      );
                    })}
                    {items.length === 0 && <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4, fontSize: '0.8rem' }}>Aucune demande</Typography>}
                    {provided.placeholder}
                  </Box>
                </Paper>
              )}
            </Droppable>
          );
        })}
      </Box>
    </DragDropContext>
  );
}

/* ═══ TABLEAU SIMPLIFIÉ (colonnes principales) ═══ */
const tableCols = [
  { key: 'numero', label: 'N°', width: 120 },
  { key: 'dateDemande', label: 'Date', width: 100 },
  { key: 'departement', label: 'Département', width: 140, chip: true },
  { key: 'posteRecherche', label: 'Poste', width: 200 },
  { key: 'priorite', label: 'Priorité', width: 100, chipColor: prioriteColor },
  { key: 'statut', label: 'Statut', width: 110, chipColor: statutColor },
  { key: 'responsableDemande', label: 'Responsable', width: 160 },
];

/* ═══ DRAWER DÉTAIL LATÉRAL ═══ */
function DemandeDrawer({ demande, open, onClose, onStatutChange, onAddNote }) {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const navigate = useNavigate();

  if (!demande) return null;

  const d = demande;
  const joursEcoules = Math.floor((new Date() - new Date(d.dateDemande.split('/').reverse().join('-'))) / 86400000);
  const delaiPct = d.delai > 0 ? Math.min(100, Math.round((joursEcoules / d.delai) * 100)) : 0;
  const delaiColor = delaiPct >= 100 ? '#d32f2f' : delaiPct >= 75 ? '#f57f17' : '#2e7d32';
  const isClosed = d.statut === 'Pourvue' || d.statut === 'Annulee';

  const handleSaveNote = () => {
    if (newNote.trim()) { onAddNote(d.id, newNote.trim()); setNewNote(''); setEditingNote(false); }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 0 } }}>
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2, background: 'linear-gradient(135deg, #0D7C66 0%, #1976d2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>{d.numero}</Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.3, lineHeight: 1.2 }}>{d.posteRecherche}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={d.departement} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              <Chip label={d.priorite} size="small" color={prioriteColor[d.priorite]} sx={{ fontWeight: 600 }} />
              <Chip label={d.statut} size="small" color={statutColor[d.statut]} sx={{ fontWeight: 600 }} />
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', height: 'calc(100vh - 180px)', px: 2.5, py: 2 }}>
        {/* Indicateurs clés */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
          <Paper variant="outlined" sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.3 }}><CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">Demandé le</Typography></Box>
            <Typography variant="body2" fontWeight="bold">{d.dateDemande}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.3 }}><Schedule sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">Besoin le</Typography></Box>
            <Typography variant="body2" fontWeight="bold">{d.dateBesoin}</Typography>
          </Paper>
        </Stack>

        {/* Jauge délai */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Timer sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Délai</Typography></Box>
            <Typography variant="caption" sx={{ color: delaiColor, fontWeight: 700 }}>{joursEcoules}j / {d.delai}j</Typography>
          </Box>
          <LinearProgress variant="determinate" value={delaiPct} sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: delaiColor, borderRadius: 4 } }} />
          {delaiPct >= 100 && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>Délai dépassé de {joursEcoules - d.delai} jour(s)</Typography>}
        </Paper>

        {/* Budget */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}><AccountBalanceWallet sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Budget & Coûts</Typography></Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary">Salaire brut</Typography><Typography variant="body2" fontWeight="bold">{formatFCFA(d.budgetSalaire)}</Typography></Box>
            <Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary">Coût recrutement</Typography><Typography variant="body2" fontWeight="bold" color={d.coutRecrutement > 200000 ? 'error' : 'text.primary'}>{formatFCFA(d.coutRecrutement)}</Typography></Box>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Coût total estimé</Typography><Typography variant="subtitle2" fontWeight="bold" color="#0D7C66">{formatFCFA((d.budgetSalaire || 0) + (d.coutRecrutement || 0))}</Typography></Box>
        </Paper>

        {/* Infos poste */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}><TrendingUp sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Détails du poste</Typography></Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {[
              ['Type de poste', d.typePoste],
              ['Type de contrat', d.typeContrat],
              ['Effectif requis', d.effectif + ''],
              ['Motif', d.motif || '—'],
              ['Site', d.site || '—'],
              ['Cabinet', d.cabinetAgence || 'Non assigné'],
            ].map(([label, val]) => (
              <Box key={label}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography><Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{val}</Typography></Box>
            ))}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box><Typography variant="caption" color="text.secondary">Responsable</Typography><Typography variant="body2" fontWeight={500}>{d.responsableDemande} <Typography component="span" variant="caption" color="text.secondary">— {d.roleResponsable}</Typography></Typography></Box>
        </Paper>

        {/* Candidats associés */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Person sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Candidats ({d.candidatsAssocies?.length || 0})</Typography></Box>
            <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => { onClose(); navigate('/candidats'); }} sx={{ fontSize: '0.75rem' }}>Voir tous</Button>
          </Box>
          {d.candidatsAssocies?.length > 0 ? (
            <List dense disablePadding>
              {d.candidatsAssocies.map((c, i) => {
                const scoreColor = c.score === null ? 'default' : c.score >= 16 ? 'success' : c.score >= 12 ? 'warning' : 'error';
                const etapeColor = c.etape === 'Sélectionné' ? 'success' : ['Rejeté', 'Annulé'].includes(c.etape) ? 'error' : 'default';
                return (
                  <ListItem key={i} sx={{ px: 0, py: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, cursor: 'pointer' }} onClick={() => { onClose(); navigate(`/candidats?focus=${c.nom}`); }}>
                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#0D7C66' }}>{c.nom.split(' ').map(n => n[0]).join('')}</Avatar></ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{c.nom}</Typography>} secondary={<Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}><Chip label={c.etape} size="small" color={etapeColor} sx={{ height: 20, fontSize: '0.65rem' }} /><Chip label={c.score !== null ? `${c.score}/20` : '—'} size="small" color={scoreColor} variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} /><Chip label={c.source} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} /></Box>} />
                  </ListItem>
                );
              })}
            </List>
          ) : <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Aucun candidat associé</Typography>}
        </Paper>

        {/* Historique / Timeline */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}><History sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Historique ({d.historique?.length || 0})</Typography></Box>
          {d.historique?.length > 0 ? (
            <Box sx={{ position: 'relative', ml: 1.5, pl: 3, borderLeft: '2px solid #e0e0e0' }}>
              {d.historique.map((h, i) => (
                <Box key={i} sx={{ position: 'relative', pb: i < d.historique.length - 1 ? 2 : 0 }}>
                  <Box sx={{ position: 'absolute', left: -25, top: 2, width: 12, height: 12, borderRadius: '50%', bgcolor: histColor[h.type] || '#9e9e9e', border: '2px solid white', boxShadow: '0 0 0 1px ' + (histColor[h.type] || '#9e9e') }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{h.date}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{h.evenement}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>par {h.auteur}</Typography>
                </Box>
              ))}
            </Box>
          ) : <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Aucun historique</Typography>}
        </Paper>

        {/* Notes */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><NoteAdd sx={{ fontSize: 16 }} /><Typography variant="subtitle2" fontWeight="bold">Notes</Typography></Box>
            {!editingNote && <IconButton size="small" onClick={() => setEditingNote(true)}><Edit sx={{ fontSize: 16 }} /></IconButton>}
          </Box>
          {d.notes ? <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, fontSize: '0.85rem' }}>{d.notes}</Typography> : !editingNote && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Aucune note</Typography>}
          {editingNote && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField fullWidth size="small" placeholder="Ajouter une note..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveNote()} multiline rows={2} sx={{ '& textarea': { fontSize: '0.85rem' } }} />
              <Button variant="contained" size="small" onClick={handleSaveNote} disabled={!newNote.trim()} sx={{ minWidth: 0, px: 2 }}><Send sx={{ fontSize: 16 }} /></Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Footer actions */}
      {!isClosed && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select value={d.statut} onChange={e => onStatutChange(d.id, e.target.value)} sx={{ fontSize: '0.8rem' }}>
              {nomenclatures.statut_demande.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" size="small" startIcon={<CheckCircle sx={{ fontSize: 16 }} />} onClick={() => onStatutChange(d.id, 'Pourvue')} sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>Marquer pourvue</Button>
          <Button variant="outlined" size="small" startIcon={<Business sx={{ fontSize: 16 }} />} onClick={() => { onClose(); navigate('/cabinets'); }}>Cabinet</Button>
        </Box>
      )}
    </Drawer>
  );
}

/* ═══ PAGE PRINCIPALE ═══ */
export default function Demandes() {
  const [data, setData] = useState(initialData);
  const [dlg, setDlg] = useState(false);
  const [filterDep, setFilterDep] = useState('Tous');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterPrio, setFilterPrio] = useState('Tous');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [drawerDemande, setDrawerDemande] = useState(null);
  const [snack, setSnack] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const filtered = useMemo(() => data.filter(d =>
    (filterDep === 'Tous' || d.departement === filterDep) &&
    (filterStatut === 'Tous' || d.statut === filterStatut) &&
    (filterPrio === 'Tous' || d.priorite === filterPrio)
  ), [data, filterDep, filterStatut, filterPrio]);

  const budgetTotal = useMemo(() => filtered.reduce((s, d) => s + (d.budgetSalaire || 0), 0), [filtered]);

  const handleStatutChange = useCallback((id, newStatut) => {
    setData(prev => prev.map(d => {
      if (d.id !== id) return d;
      const today = new Date().toLocaleDateString('fr-FR');
      const newHist = [...(d.historique || []), { date: today, evenement: `Statut changé : ${d.statut} → ${newStatut}`, auteur: 'Utilisateur', type: newStatut === 'Pourvue' ? 'pourvoi' : 'validation' }];
      return { ...d, statut: newStatut, historique: newHist, ...(newStatut === 'Pourvue' ? { datePourvue: today } : {}) };
    }));
    setDrawerDemande(prev => prev && prev.id === id ? { ...prev, statut: newStatut } : prev);
    setSnack({ msg: `Statut mis à jour : ${newStatut}`, severity: 'success' });
  }, []);

  const handleAddNote = useCallback((id, note) => {
    setData(prev => prev.map(d => {
      if (d.id !== id) return d;
      const today = new Date().toLocaleDateString('fr-FR');
      const newHist = [...(d.historique || []), { date: today, evenement: `Note ajoutée : ${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`, auteur: 'Utilisateur', type: 'creation' }];
      return { ...d, notes: (d.notes ? d.notes + '\n' : '') + `[${today}] ${note}`, historique: newHist };
    }));
    setDrawerDemande(prev => prev && prev.id === id ? { ...prev, notes: (prev.notes ? prev.notes + '\n' : '') + `[${new Date().toLocaleDateString('fr-FR')}] ${note}` } : prev);
    setSnack({ msg: 'Note ajoutée', severity: 'info' });
  }, []);

  const handleExport = useCallback(() => {
    const cols = ['N°','Date','Département','Poste','Type Poste','Type Contrat','Effectif','Motif','Date Besoin','Priorité','Statut','Date Pourvue','Responsable','Rôle','Cabinet','Budget Salaire','Coût Recrutement','Délai (j)','Site','Notes'];
    const rows = [cols.join(';')];
    filtered.forEach(d => rows.push([d.numero,d.dateDemande,d.departement,d.posteRecherche,d.typePoste,d.typeContrat,d.effectif,d.motif,d.dateBesoin,d.priorite,d.statut,d.datePourvue,d.responsableDemande,d.roleResponsable,d.cabinetAgence,d.budgetSalaire,d.coutRecrutement,d.delai,d.site,d.notes].map(v => `"${v}"`).join(';')));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'demandes_recrutement.csv'; a.click(); URL.revokeObjectURL(url);
    setSnack({ msg: 'Export CSV téléchargé', severity: 'info' });
  }, [filtered]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold">Demandes de Recrutement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} demande(s) de recrutement</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <Button variant="outlined" startIcon={<Download fontSize="small" />} onClick={handleExport}>Exporter CSV</Button>
        <Button variant="contained" startIcon={<Add fontSize="small" />} onClick={() => setDlg(true)}>Nouvelle Demande</Button>
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small" sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.5, border: '1px solid', borderColor: 'divider', '&.Mui-selected': { bgcolor: '#0D7C66', color: 'white', '&:hover': { bgcolor: '#0a6b58' } } } }}>
          <ToggleButton value="table" sx={{ gap: 0.5 }}><ViewList sx={{ fontSize: 18 }} /><Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Tableau</Typography></ToggleButton>
          <ToggleButton value="kanban" sx={{ gap: 0.5 }}><ViewKanban sx={{ fontSize: 18 }} /><Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Kanban</Typography></ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KPICard titre="TOTAL DEMANDES" valeur={filtered.length} sousTexte={`${filtered.length} demande(s) enregistrée(s)`} />
        <KPICard titre="POURVUES" valeur={filtered.filter(d => d.statut === 'Pourvue').length} sousTexte={`${Math.round(filtered.filter(d => d.statut === 'Pourvue').length / Math.max(filtered.length, 1) * 100)}% du total`} />
        <KPICard titre="EN COURS" valeur={filtered.filter(d => ['En cours', 'Validée', 'En attente'].includes(d.statut)).length} sousTexte="demandes actives" />
        <KPICard titre="BUDGET TOTAL" valeur={formatFCFA(budgetTotal)} sousTexte="budget cumulé" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}><Select value={filterDep} onChange={e => { setFilterDep(e.target.value); setPage(0); }} displayEmpty><MenuItem value="Tous">Tous les départements</MenuItem>{nomenclatures.departement.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}><Select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }} displayEmpty><MenuItem value="Tous">Tous les statuts</MenuItem>{nomenclatures.statut_demande.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}><Select value={filterPrio} onChange={e => { setFilterPrio(e.target.value); setPage(0); }} displayEmpty><MenuItem value="Tous">Toutes priorités</MenuItem>{nomenclatures.priorite.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select></FormControl>
      </Box>
      {viewMode === 'table' ? (
      <Paper>
        <TableContainer><Table size="small">
          <TableHead><TableRow>
            {tableCols.map(c => <TableCell key={c.key} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: c.width }}>{c.label}</TableCell>)}
            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', width: 60 }}>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.slice(page * rpp, page * rpp + rpp).map(row => (
              <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrawerDemande(row)}>
                {tableCols.map(c => (
                  <TableCell key={c.key} sx={{ whiteSpace: 'nowrap' }}>
                    {c.chip ? <Chip label={row[c.key]} size="small" variant="outlined" /> :
                     c.chipColor ? <Chip label={row[c.key]} size="small" color={c.chipColor[row[c.key]]} /> :
                     row[c.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <Tooltip title="Ouvrir le détail"><IconButton size="small" onClick={e => { e.stopPropagation(); setDrawerDemande(row); }}><ArrowForward sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={tableCols.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucune demande trouvée</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Lignes par page" />
      </Paper>
      ) : (
        <KanbanBoard data={filtered} onStatutChange={handleStatutChange} onCardClick={setDrawerDemande} />
      )}

      {/* Drawer détail */}
      <DemandeDrawer
        demande={drawerDemande}
        open={Boolean(drawerDemande)}
        onClose={() => setDrawerDemande(null)}
        onStatutChange={handleStatutChange}
        onAddNote={handleAddNote}
      />

      <AddDialog open={dlg} onClose={() => setDlg(false)} title="Nouvelle Demande de Recrutement"
        fields={[
          {key: "posteRecherche", label: "Poste Recherché", required: true},
          {key: "departement", label: "Département", type: "select", options: nomenclatures.departement, required: true},
          {key: "typePoste", label: "Type Poste", type: "select", options: nomenclatures.type_poste, required: true},
          {key: "typeContrat", label: "Type Contrat", type: "select", options: nomenclatures.type_contrat, required: true},
          {key: "effectif", label: "Effectif Requis", type: "number"},
          {key: "motif", label: "Motif", type: "select", options: nomenclatures.motif},
          {key: "dateBesoin", label: "Date de Besoin", required: true},
          {key: "priorite", label: "Priorité", type: "select", options: nomenclatures.priorite, required: true},
          {key: "site", label: "Site", type: "select", options: nomenclatures.site},
          {key: "responsableDemande", label: "Responsable Demande", required: true},
          {key: "roleResponsable", label: "Rôle du Responsable", type: "select", options: nomenclatures.role_responsable},
          {key: "cabinetAgence", label: "Cabinet / Agence", type: "select", options: nomenclatures.cabinet_recrutement},
          {key: "budgetSalaire", label: "Budget Salaire (FCFA)", type: "number"},
          {key: "coutRecrutement", label: "Coût Recrutement (FCFA)", type: "number"},
          {key: "delai", label: "Délai (jours)", type: "number"},
          {key: "notes", label: "Notes", multiline: true},
        ]}
        onSubmit={(vals) => {
          const nid = data.length + 1;
          const today = new Date().toLocaleDateString('fr-FR');
          setData(prev => [...prev, {
            id: nid, numero: 'DR-2025-' + String(nid).padStart(3, '0'), dateDemande: today,
            statut: 'En attente', datePourvue: '',
            historique: [{ date: today, evenement: 'Demande créée', auteur: vals.responsableDemande || 'Utilisateur', type: 'creation' }],
            candidatsAssocies: [],
            site: vals.site || 'Non défini',
            ...vals
          }]);
        }}
      />
      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}