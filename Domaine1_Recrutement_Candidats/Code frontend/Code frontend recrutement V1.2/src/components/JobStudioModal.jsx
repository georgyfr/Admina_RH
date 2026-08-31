import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, IconButton, Typography,
  Chip, FormControlLabel, Checkbox, Switch, Divider, Tooltip,
  Paper, Alert, InputAdornment, FormControl, Select, InputLabel, CircularProgress,
} from '@mui/material';
import {
  Close, AutoAwesome, PictureAsPdf, Description as DescIcon,
  Add, DragIndicator, Rocket, Save, Publish, Cancel,
} from '@mui/icons-material';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TagInput from './TagInput';
import { nomenclatures } from '../data/nomenclatures';
import { exportPosteAsPdf } from '../utils/exportPdf';
import { exportPosteAsDocx } from '../utils/exportDocx';

/* ═══ HELPERS ═══ */
const fmtFCFA = (n) => (n ? n.toLocaleString('fr-FR') + ' FCFA' : '—');
const todayISO = () => new Date().toISOString().split('T')[0];
const addDays = (iso, n) => { if (!iso) return ''; const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
const toFrDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const stripHtml = (h) => { if (!h) return ''; const t = document.createElement('div'); t.innerHTML = h; return t.textContent || ''; };




/* ═══ RESIZABLE FIELD WRAPPER ═══ */
function ResizableField({ children, fieldKey, onResize, sx = {}, ...props }) {
  const ref = useRef(null);
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const el = ref.current;
    if (!el) return;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;
    const onMove = (ev) => {
      const newW = Math.max(100, startW + (ev.clientX - startX));
      const newH = Math.max(28, startH + (ev.clientY - startY));
      el.style.width = newW + 'px';
      el.style.height = newH + 'px';
      el.style.flex = '0 0 auto';
      onResize?.(fieldKey, newW, newH);
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [fieldKey, onResize]);

  return (
    <Box ref={ref} sx={{ position: 'relative', ...sx }} {...props}>
      <Box sx={{
        height: '100%', width: '100%',
        display: 'flex', flexDirection: 'column',
        '& .MuiFormControl-root': { flex: 1, display: 'flex', flexDirection: 'column' },
        '& .MuiTextField-root': { flex: 1, display: 'flex', flexDirection: 'column' },
        '& .MuiInputBase-root': { flex: 1, alignItems: 'stretch' },
        '& textarea': { height: '100% !important', resize: 'none' },
      }}>
        {children}
      </Box>
      <Box onMouseDown={handleMouseDown} sx={{
        position: 'absolute', bottom: 0, right: 0, width: 16, height: 16,
        cursor: 'nwse-resize', zIndex: 10,
        '&::after': {
          content: '""', position: 'absolute', bottom: 2, right: 2,
          width: 8, height: 8,
          borderRight: '2px solid', borderBottom: '2px solid',
          borderColor: 'grey.400', borderRadius: '0 0 2px 0',
          opacity: 0, transition: 'opacity 0.15s',
        },
        '&:hover::after': { opacity: 1, borderColor: 'primary.main' },
      }} />
    </Box>
  );
}

const INITIAL_FORM = {
  intitule: '', departement: '', typePoste: '', typeContrat: '', priorite: '', site: 'Siege (Douala)',
  salaireMin: '', salaireMax: '', budgetAlloue: '', responsable: '', roleResponsable: '', dateRequise: '',
  /* Studio */
  contexte: '', missions: [{ id: 'm-1', text: '' }],
  niveauEtude: '', experience: '',
  hardSkills: [], softSkills: [],
  langues: [],
  avantages: [],
  canaux: { siteCarriere: true, linkedIn: false, jobboards: false, cabinets: false },
};

/* ═══ SORTABLE MISSION ═══ */
function SortableMission({ mission, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mission.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <Box ref={setNodeRef} style={style} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: 'grab', color: 'action.disabled' }}>
        <DragIndicator sx={{ fontSize: 18 }} />
      </IconButton>
      <TextField
        size="small" fullWidth placeholder="Decrire la mission..."
        value={mission.text}
        onChange={(e) => onUpdate(mission.id, e.target.value)}
        sx={{ '& input': { fontSize: '0.85rem' } }}
      />
      <IconButton size="small" onClick={() => onRemove(mission.id)} sx={{ color: '#d32f2f' }}>
        <Cancel sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

/* ═══ SECTION HEADER ═══ */
function SectionHeader({ children, icon }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 3, '&:first-of-type': { mt: 0 } }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'primary.main', fontSize: '0.92rem' }}>
        {children}
      </Typography>
    </Box>
  );
}

/* ═══ COMPOSANT PRINCIPAL ═══ */
export default function JobStudioModal({ open, onClose, onSubmit, responsablesList = [] }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [exporting, setExporting] = useState(null); // 'pdf' | 'docx' | null
  const previewRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [splitPercent, setSplitPercent] = useState(58);
  const splitterRef = useRef(null);

  /* Reset */
  useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_FORM, missions: [{ id: 'm-1', text: '' }] });
      setErrors({});
      setExporting(null);
    }
  }, [open]);

  /* Budget auto */
  const budgetSuggere = useMemo(() => (Number(form.salaireMax) || 0) * 3, [form.salaireMax]);
  useEffect(() => {
    if (budgetSuggere > 0 && !form._budgetManuel) setForm((p) => ({ ...p, budgetAlloue: budgetSuggere }));
  }, [budgetSuggere, form._budgetManuel]);

  /* Auto role */
  useEffect(() => {
    if (form.responsable && responsablesList.length) {
      const r = responsablesList.find((x) => x.nom === form.responsable);
      if (r) setForm((p) => ({ ...p, roleResponsable: r.role }));
    }
  }, [form.responsable, responsablesList]);

  /* Handlers */
  const h = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }, [errors]);

  const addMission = () => setForm((p) => ({ ...p, missions: [...p.missions, { id: `m-${Date.now()}`, text: '' }] }));
  const updateMission = (id, text) => setForm((p) => ({ ...p, missions: p.missions.map((m) => (m.id === id ? { ...m, text } : m)) }));
  const removeMission = (id) => setForm((p) => ({ ...p, missions: p.missions.length > 1 ? p.missions.filter((m) => m.id !== id) : p.missions }));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setForm((p) => {
        const old = p.missions.findIndex((m) => m.id === active.id);
        const nw = p.missions.findIndex((m) => m.id === over.id);
        return { ...p, missions: arrayMove(p.missions, old, nw) };
      });
    }
  };

  const toggleCanal = (key) => setForm((p) => ({ ...p, canaux: { ...p.canaux, [key]: !p.canaux[key] } }));
  const toggleAvantage = (av) => setForm((p) => ({ ...p, avantages: p.avantages.includes(av) ? p.avantages.filter((a) => a !== av) : [...p.avantages, av] }));
  const toggleSoftSkill = (sk) => setForm((p) => ({ ...p, softSkills: p.softSkills.includes(sk) ? p.softSkills.filter((s) => s !== sk) : [...p.softSkills, sk] }));
  const addLangue = () => setForm((p) => ({ ...p, langues: [...p.langues, { id: `l-${Date.now()}`, langue: '', niveau: '' }] }));
  const updateLangue = (id, field, val) => setForm((p) => ({ ...p, langues: p.langues.map((l) => (l.id === id ? { ...l, [field]: val } : l)) }));
  const removeLangue = (id) => setForm((p) => ({ ...p, langues: p.langues.filter((l) => l.id !== id) }));

  /* Exports */
  const handlePdf = async () => {
    setExporting('pdf');
    try { await exportPosteAsPdf(previewRef.current, form.intitule); } catch (e) { console.error(e); }
    setExporting(null);
  };
  const handleDocx = async () => {
    setExporting('docx');
    try { await exportPosteAsDocx(form); } catch (e) { console.error(e); }
    setExporting(null);
  };

  /* Submit */
  const handleSubmit = (asDraft) => {
    if (!asDraft && !form.intitule?.trim()) { setErrors({ intitule: 'Requis pour publier' }); return; }
    const activeCanaux = Object.entries(form.canaux).filter(([, v]) => v).map(([k]) => k);
    if (!asDraft && activeCanaux.length === 0) { setErrors({ canaux: 'Selectionnez au moins un canal' }); return; }
    const canalLabels = { siteCarriere: 'Site Carriere', linkedIn: 'LinkedIn', jobboards: 'Jobboards', cabinets: 'Cabinets' };
    const canalStr = activeCanaux.map((k) => canalLabels[k]).join(', ');
    const today = new Date().toLocaleDateString('fr-FR');
    const { _budgetManuel, canaux, ...clean } = form;
    const result = {
      ...clean,
      canalDiffusion: asDraft ? '' : canalStr,
      datePublication: asDraft ? '' : today,
      dateRequise: toFrDate(form.dateRequise),
      statutOffre: asDraft ? 'A creer' : 'Publiee',
      _studioData: { canaux: activeCanaux, missions: form.missions.filter((m) => m.text?.trim()), source: 'studio' },
    };
    const toastMsg = asDraft ? 'Brouillon Studio enregistre' : `Offre publiee sur ${activeCanaux.length} canal(aux) via Studio`;
    if (onSubmit) onSubmit(result, toastMsg);
  };

  /* Preview data */
  const preview = useMemo(() => ({
    intitule: form.intitule || 'Poste a definir',
    departement: form.departement, typePoste: form.typePoste, typeContrat: form.typeContrat,
    contexteHtml: '',
    contexteText: form.contexte || '',
    missions: form.missions.filter((m) => m.text?.trim()),
    niveauEtude: form.niveauEtude, experience: form.experience,
    hardSkills: form.hardSkills, softSkills: form.softSkills, langues: form.langues,
    salaireMin: form.salaireMin, salaireMax: form.salaireMax,
    avantages: form.avantages,
  }), [form]);


  /* Column splitter drag */
  const handleSplitterDown = useCallback((e) => {
    e.preventDefault();
    const container = splitterRef.current?.parentElement;
    if (!container) return;
    const startX = e.clientX;
    const startPct = splitPercent;
    const onMove = (ev) => {
      const rect = container.getBoundingClientRect();
      const dp = ((ev.clientX - startX) / rect.width) * 100;
      setSplitPercent(Math.min(80, Math.max(30, startPct + dp)));
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [splitPercent]);

  const handleFieldResize = useCallback((key, w, h) => {
    /* future: persist sizes to localStorage */
  }, []);

  /* ═══ RENDER ═══ */
  return (
    <Dialog open={open} onClose={onClose}
      PaperProps={{ sx: { width: '97vw', maxWidth: 1700, height: '92vh', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, pt: 2, px: 3, background: 'linear-gradient(135deg, #1565c0 0%, #7c3aed 100%)', color: '#fff', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesome sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>Studio d'Analyse & Publication</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.78rem' }}>
              {form.intitule || 'Nouvelle offre en cours de redaction...'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}><Close /></IconButton>
      </DialogTitle>

      <Box ref={splitterRef} sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: splitPercent + '%', minWidth: 350, overflow: 'auto', p: 3 }}>

          <SectionHeader icon={<Typography variant="body2">1.</Typography>}>Informations de base</SectionHeader>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <ResizableField fieldKey="intitule" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <TextField label="Intitule du Poste" size="small" fullWidth value={form.intitule} onChange={(e) => h('intitule', e.target.value)} error={!!errors.intitule} helperText={errors.intitule || ' '} />
            </ResizableField>
            <ResizableField fieldKey="departement" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Departement</InputLabel>
                <Select value={form.departement} label="Departement" onChange={(e) => h('departement', e.target.value)}>
                  {nomenclatures.departement.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: '0.85rem' }}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="typePoste" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type de Poste</InputLabel>
                <Select value={form.typePoste} label="Type de Poste" onChange={(e) => h('typePoste', e.target.value)}>
                  {nomenclatures.type_poste.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: '0.85rem' }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="typeContrat" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type de Contrat</InputLabel>
                <Select value={form.typeContrat} label="Type de Contrat" onChange={(e) => h('typeContrat', e.target.value)}>
                  {nomenclatures.type_contrat.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: '0.85rem' }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="priorite" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Priorite</InputLabel>
                <Select value={form.priorite} label="Priorite" onChange={(e) => h('priorite', e.target.value)}>
                  {nomenclatures.priorite.map((p) => <MenuItem key={p} value={p} sx={{ fontSize: '0.85rem' }}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="site" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Site</InputLabel>
                <Select value={form.site} label="Site" onChange={(e) => h('site', e.target.value)}>
                  {nomenclatures.site.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="responsable" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Responsable</InputLabel>
                <Select value={form.responsable} label="Responsable" onChange={(e) => h('responsable', e.target.value)}>
                  {responsablesList.map((r) => <MenuItem key={r.nom} value={r.nom} sx={{ fontSize: '0.85rem' }}>{r.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="roleResponsable" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role du Responsable</InputLabel>
                <Select value={form.roleResponsable} label="Role du Responsable" onChange={(e) => h('roleResponsable', e.target.value)}>
                  {nomenclatures.role_responsable.map((r) => <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
          </Box>

          <SectionHeader icon={<Typography variant="body2">2.</Typography>}>Contexte & Analyse du Besoin</SectionHeader>
          <ResizableField fieldKey="contexte" onResize={handleFieldResize} sx={{ width: '100%' }}>
            <TextField
              multiline
              rows={6}
              fullWidth
              value={form.contexte}
              onChange={(e) => h('contexte', e.target.value)}
              placeholder="Decrivez l'equipe, les enjeux et les raisons du recrutement..."
              sx={{ '& textarea': { fontSize: '0.9rem' } }}
            />
          </ResizableField>

          <SectionHeader icon={<Typography variant="body2">3.</Typography>}>Missions & Responsabilites Principales</SectionHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={form.missions.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              {form.missions.map((m) => (
                <SortableMission key={m.id} mission={m} onUpdate={updateMission} onRemove={removeMission} />
              ))}
            </SortableContext>
          </DndContext>
          <Button size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={addMission} sx={{ textTransform: 'none', mt: 0.5 }}>
            Ajouter une mission
          </Button>

          <SectionHeader icon={<Typography variant="body2">4.</Typography>}>Profil Recherche</SectionHeader>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <ResizableField fieldKey="niveauEtude" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Niveau d'etudes</InputLabel>
                <Select value={form.niveauEtude} label="Niveau d'etudes" onChange={(e) => h('niveauEtude', e.target.value)}>
                  {nomenclatures.niveau_etude_studio.map((n) => <MenuItem key={n} value={n} sx={{ fontSize: '0.85rem' }}>{n}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
            <ResizableField fieldKey="experience" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select value={form.experience} label="Experience" onChange={(e) => h('experience', e.target.value)}>
                  {nomenclatures.experience_studio.map((e) => <MenuItem key={e} value={e} sx={{ fontSize: '0.85rem' }}>{e}</MenuItem>)}
                </Select>
              </FormControl>
            </ResizableField>
          </Box>

          <ResizableField fieldKey="hardSkills" onResize={handleFieldResize} sx={{ mt: 2, width: '100%' }}>
            <TagInput label="Hard Skills (Savoir-faire)" value={form.hardSkills} onChange={(v) => h('hardSkills', v)} placeholder="Ex: React, Gestion de projet..." />
          </ResizableField>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>Soft Skills (Savoir-etre)</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {nomenclatures.soft_skills.map((sk) => {
                const active = form.softSkills.includes(sk);
                return (
                  <Chip
                    key={sk} label={sk} size="small" variant={active ? 'filled' : 'outlined'}
                    color={active ? 'success' : 'default'}
                    onClick={() => toggleSoftSkill(sk)}
                    sx={{ cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Langues requises</Typography>
              <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={addLangue} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Ajouter</Button>
            </Box>
            {form.langues.map((l) => (
              <Box key={l.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select value={l.langue} onChange={(e) => updateLangue(l.id, 'langue', e.target.value)} displayEmpty>
                    <MenuItem value="" sx={{ color: 'text.disabled' }}>Langue...</MenuItem>
                    {nomenclatures.langues_studio.map((lng) => <MenuItem key={lng} value={lng} sx={{ fontSize: '0.85rem' }}>{lng}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select value={l.niveau} onChange={(e) => updateLangue(l.id, 'niveau', e.target.value)} displayEmpty>
                    <MenuItem value="" sx={{ color: 'text.disabled' }}>Niveau...</MenuItem>
                    {nomenclatures.niveau_langue_studio.map((n) => <MenuItem key={n} value={n} sx={{ fontSize: '0.85rem' }}>{n}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => removeLangue(l.id)} sx={{ color: '#d32f2f' }}><Close sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            ))}
          </Box>

          <SectionHeader icon={<Typography variant="body2">5.</Typography>}>Conditions & Avantages</SectionHeader>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <ResizableField fieldKey="salaireMin" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <TextField label="Salaire Min" size="small" type="number" fullWidth value={form.salaireMin} onChange={(e) => h('salaireMin', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
            </ResizableField>
            <ResizableField fieldKey="salaireMax" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <TextField label="Salaire Max" size="small" type="number" fullWidth value={form.salaireMax} onChange={(e) => h('salaireMax', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
            </ResizableField>
          </Box>
          {budgetSuggere > 0 && (
            <Alert severity="info" variant="outlined" sx={{ mt: 1.5, borderRadius: 2, py: 0.3 }} icon={<span />}>Budget suggere : <strong>{fmtFCFA(budgetSuggere)}</strong> (3x salaire max)</Alert>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {nomenclatures.avantages_sociaux.map((av) => (
              <FormControlLabel key={av} control={<Checkbox size="small" checked={form.avantages.includes(av)} onChange={() => toggleAvantage(av)} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />} label={av} sx={{ '& .MuiTypography-body1': { fontSize: '0.85rem' } }} />
            ))}
          </Box>
          <ResizableField fieldKey="dateRequise" onResize={handleFieldResize} sx={{ mt: 2, width: '100%' }}>
            <TextField label="Date requise" size="small" type="date" fullWidth value={form.dateRequise} onChange={(e) => h('dateRequise', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& input[type="date"]': { height: 40, lineHeight: '40px', boxSizing: 'border-box' } }} />
          </ResizableField>

          <Box sx={{ height: 40 }} />
        </Box>

        <Box
          onMouseDown={handleSplitterDown}
          sx={{ width: 8, cursor: 'col-resize', bgcolor: 'transparent', flexShrink: 0,
            borderLeft: '1px solid', borderColor: 'divider',
            transition: 'bgcolor 0.2s',
            '&:hover': { bgcolor: 'rgba(25,118,210,0.12)' },
            '&:active': { bgcolor: 'rgba(25,118,210,0.25)' },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 300, overflow: 'auto', p: 4, bgcolor: '#f8f9fa' }}>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Apercu en direct</Typography>
          <Paper ref={previewRef} variant="outlined" sx={{ p: 2.5, mt: 0.5, mb: 3, bgcolor: '#fff', borderRadius: 2 }}>
            <Box sx={{ borderBottom: '3px solid #0D7C66', pb: 1.5, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.05rem', color: '#1565c0' }}>{preview.intitule}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[preview.departement, preview.typePoste, preview.typeContrat].filter(Boolean).join(' | ')}
              </Typography>
            </Box>
            {preview.contexteText && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem', color: '#0D7C66', mb: 0.5 }}>Contexte</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{preview.contexteText}</Typography>
              </Box>
            )}
            {preview.missions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem', color: '#0D7C66', mb: 0.5 }}>Missions principales</Typography>
                <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
                  {preview.missions.map((m, i) => (
                    <Typography key={m.id || i} component="li" variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 0.3 }}>{m.text}</Typography>
                  ))}
                </Box>
              </Box>
            )}
            {(preview.niveauEtude || preview.experience) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem', color: '#0D7C66', mb: 0.5 }}>Profil</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {preview.niveauEtude && <Chip label={preview.niveauEtude} size="small" variant="outlined" />}
                  {preview.experience && <Chip label={preview.experience} size="small" variant="outlined" />}
                </Box>
              </Box>
            )}
            {preview.hardSkills.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary' }}>Savoir-faire</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.3 }}>
                  {preview.hardSkills.map((s) => <Chip key={s} label={s} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500, fontSize: '0.75rem' }} />)}
                </Box>
              </Box>
            )}
            {preview.softSkills.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary' }}>Savoir-etre</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.3 }}>
                  {preview.softSkills.map((s) => <Chip key={s} label={s} size="small" color="success" variant="outlined" sx={{ fontWeight: 500, fontSize: '0.75rem' }} />)}
                </Box>
              </Box>
            )}
            {preview.langues.filter((l) => l.langue).length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary' }}>Langues</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.3 }}>
                  {preview.langues.filter((l) => l.langue).map((l) => <Chip key={l.id} label={`${l.langue} - ${l.niveau}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />)}
                </Box>
              </Box>
            )}
            {(preview.salaireMin || preview.salaireMax || preview.avantages.length > 0) && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                {(preview.salaireMin || preview.salaireMax) && (
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                    Remuneration : <strong>{fmtFCFA(preview.salaireMin)}</strong> - <strong>{fmtFCFA(preview.salaireMax)}</strong>
                  </Typography>
                )}
                {preview.avantages.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {preview.avantages.map((a) => <Chip key={a} label={a} size="small" color="success" sx={{ fontSize: '0.72rem', height: 22 }} />)}
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Canaux de diffusion</Typography>
          {errors.canaux && <Alert severity="error" sx={{ mt: 0.5, borderRadius: 2, py: 0.3, fontSize: '0.82rem' }}>{errors.canaux}</Alert>}
          <Paper variant="outlined" sx={{ p: 2, mt: 0.5, mb: 3, bgcolor: '#fff', borderRadius: 2 }}>
            {nomenclatures.canaux_studio.map((c) => (
              <Box key={c.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.8, '& + &': { borderTop: '1px solid', borderColor: 'divider' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{c.label}</Typography>
                </Box>
                <Switch size="small" checked={form.canaux[c.key]} onChange={() => toggleCanal(c.key)} />
              </Box>
            ))}
          </Paper>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Telechargements</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
            <Button
              variant="outlined" startIcon={exporting === 'pdf' ? <CircularProgress size={16} /> : <PictureAsPdf />}
              onClick={handlePdf} disabled={!!exporting}
              sx={{ textTransform: 'none', borderColor: '#d32f2f', color: '#d32f2f', '&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211,47,47,0.04)' } }}
            >
              Telecharger PDF
            </Button>
            <Button
              variant="outlined" startIcon={exporting === 'docx' ? <CircularProgress size={16} /> : <DescIcon />}
              onClick={handleDocx} disabled={!!exporting}
              sx={{ textTransform: 'none', borderColor: '#1565c0', color: '#1565c0', '&:hover': { borderColor: '#0d47a1', bgcolor: 'rgba(21,101,192,0.04)' } }}
            >
              Exporter Word (.docx)
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', flexShrink: 0, bgcolor: '#fff' }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Annuler</Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={() => handleSubmit(true)} startIcon={<Save sx={{ fontSize: 18 }} />} variant="outlined" sx={{ textTransform: 'none' }}>
            Enregistrer le brouillon
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            startIcon={<Rocket sx={{ fontSize: 18 }} />}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#0D7C66', '&:hover': { bgcolor: '#0a5c4a' } }}
          >
            Lancer & Publier
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
