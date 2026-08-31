#!/usr/bin/env python3
"""Apply resizable fields + column splitter to JobStudioModal.jsx"""
import re

FILE = '/home/z/my-project/Domaine1_Recrutement_Candidats/Code frontend/Code frontend recrutement V1.2/src/components/JobStudioModal.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    c = f.read()

# ──────────────────────────────────────────────
# 1) Insert ResizableField component before INITIAL_FORM
# ──────────────────────────────────────────────
RESIZABLE = r'''

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

'''

c = c.replace('\nconst INITIAL_FORM = {', RESIZABLE + 'const INITIAL_FORM = {')

# ──────────────────────────────────────────────
# 2) Add splitPercent state after existing states
# ──────────────────────────────────────────────
c = c.replace(
    "const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));",
    "const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));\n  const [splitPercent, setSplitPercent] = useState(58);\n  const splitterRef = useRef(null);"
)

# ──────────────────────────────────────────────
# 3) Add splitter handler before RENDER
# ──────────────────────────────────────────────
SPLITTER_HANDLER = r'''
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

'''

c = c.replace('  /* ═══ RENDER ═══ */', SPLITTER_HANDLER + '  /* ═══ RENDER ═══ */')

# ──────────────────────────────────────────────
# 4) Replace grid container with flex + splitter
# ──────────────────────────────────────────────
OLD_CONTAINER = """<Box sx={{ display: 'grid', gridTemplateColumns: '7fr 5fr', flex: 1, overflow: 'hidden', gap: 0 }}>
        <Box sx={{ overflow: 'auto', p: 3, borderRight: '1px solid', borderColor: 'divider' }}>"""

NEW_CONTAINER = """<Box ref={splitterRef} sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: splitPercent + '%', minWidth: 350, overflow: 'auto', p: 3 }}>"""

c = c.replace(OLD_CONTAINER, NEW_CONTAINER)

# ──────────────────────────────────────────────
# 4b) Replace right column Box
# ──────────────────────────────────────────────
c = c.replace(
    "<Box sx={{ overflow: 'auto', p: 4, bgcolor: '#f8f9fa' }}>",
    """<Box
          onMouseDown={handleSplitterDown}
          sx={{ width: 8, cursor: 'col-resize', bgcolor: 'transparent', flexShrink: 0,
            borderLeft: '1px solid', borderColor: 'divider',
            transition: 'bgcolor 0.2s',
            '&:hover': { bgcolor: 'rgba(25,118,210,0.12)' },
            '&:active': { bgcolor: 'rgba(25,118,210,0.25)' },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 300, overflow: 'auto', p: 4, bgcolor: '#f8f9fa' }}>"""
)

# ──────────────────────────────────────────────
# 5) Wrap Section 1 fields (Informations de base)
#    Replace the grid Box with flex-wrap + ResizableField wrappers
# ──────────────────────────────────────────────
SEC1_OLD = """<SectionHeader icon={<Typography variant="body2">1.</Typography>}>Informations de base</SectionHeader>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Intitule du Poste" size="small" fullWidth value={form.intitule} onChange={(e) => h('intitule', e.target.value)} error={!!errors.intitule} helperText={errors.intitule || ' '} />
            <FormControl size="small" fullWidth>
              <InputLabel>Departement</InputLabel>
              <Select value={form.departement} label="Departement" onChange={(e) => h('departement', e.target.value)}>
                {nomenclatures.departement.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: '0.85rem' }}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Type de Poste</InputLabel>
              <Select value={form.typePoste} label="Type de Poste" onChange={(e) => h('typePoste', e.target.value)}>
                {nomenclatures.type_poste.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: '0.85rem' }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Type de Contrat</InputLabel>
              <Select value={form.typeContrat} label="Type de Contrat" onChange={(e) => h('typeContrat', e.target.value)}>
                {nomenclatures.type_contrat.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: '0.85rem' }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Priorite</InputLabel>
              <Select value={form.priorite} label="Priorite" onChange={(e) => h('priorite', e.target.value)}>
                {nomenclatures.priorite.map((p) => <MenuItem key={p} value={p} sx={{ fontSize: '0.85rem' }}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Site</InputLabel>
              <Select value={form.site} label="Site" onChange={(e) => h('site', e.target.value)}>
                {nomenclatures.site.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Responsable</InputLabel>
              <Select value={form.responsable} label="Responsable" onChange={(e) => h('responsable', e.target.value)}>
                {responsablesList.map((r) => <MenuItem key={r.nom} value={r.nom} sx={{ fontSize: '0.85rem' }}>{r.nom}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Role du Responsable</InputLabel>
              <Select value={form.roleResponsable} label="Role du Responsable" onChange={(e) => h('roleResponsable', e.target.value)}>
                {nomenclatures.role_responsable.map((r) => <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>"""

SEC1_NEW = """<SectionHeader icon={<Typography variant="body2">1.</Typography>}>Informations de base</SectionHeader>
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
          </Box>"""

c = c.replace(SEC1_OLD, SEC1_NEW)

# ──────────────────────────────────────────────
# 6) Wrap Section 2 - Contexte textarea
# ──────────────────────────────────────────────
SEC2_OLD = """<TextField
            multiline
            rows={6}
            fullWidth
            value={form.contexte}
            onChange={(e) => h('contexte', e.target.value)}
            placeholder="Decrivez l'equipe, les enjeux et les raisons du recrutement..."
            sx={{ '& textarea': { fontSize: '0.9rem' } }}
          />"""

SEC2_NEW = """<ResizableField fieldKey="contexte" onResize={handleFieldResize} sx={{ width: '100%' }}>
            <TextField
              multiline
              rows={6}
              fullWidth
              value={form.contexte}
              onChange={(e) => h('contexte', e.target.value)}
              placeholder="Decrivez l'equipe, les enjeux et les raisons du recrutement..."
              sx={{ '& textarea': { fontSize: '0.9rem' } }}
            />
          </ResizableField>"""

c = c.replace(SEC2_OLD, SEC2_NEW)

# ──────────────────────────────────────────────
# 7) Wrap Section 4 fields (Profil Recherche)
# ──────────────────────────────────────────────
SEC4_OLD = """<SectionHeader icon={<Typography variant="body2">4.</Typography>}>Profil Recherche</SectionHeader>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Niveau d'etudes</InputLabel>
              <Select value={form.niveauEtude} label="Niveau d'etudes" onChange={(e) => h('niveauEtude', e.target.value)}>
                {nomenclatures.niveau_etude_studio.map((n) => <MenuItem key={n} value={n} sx={{ fontSize: '0.85rem' }}>{n}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Experience</InputLabel>
              <Select value={form.experience} label="Experience" onChange={(e) => h('experience', e.target.value)}>
                {nomenclatures.experience_studio.map((e) => <MenuItem key={e} value={e} sx={{ fontSize: '0.85rem' }}>{e}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>"""

SEC4_NEW = """<SectionHeader icon={<Typography variant="body2">4.</Typography>}>Profil Recherche</SectionHeader>
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
          </Box>"""

c = c.replace(SEC4_OLD, SEC4_NEW)

# ──────────────────────────────────────────────
# 8) Wrap Section 5 fields (Conditions & Avantages)
# ──────────────────────────────────────────────
SEC5_OLD = """<SectionHeader icon={<Typography variant="body2">5.</Typography>}>Conditions & Avantages</SectionHeader>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Salaire Min" size="small" type="number" fullWidth value={form.salaireMin} onChange={(e) => h('salaireMin', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
            <TextField label="Salaire Max" size="small" type="number" fullWidth value={form.salaireMax} onChange={(e) => h('salaireMax', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
          </Box>"""

SEC5_NEW = """<SectionHeader icon={<Typography variant="body2">5.</Typography>}>Conditions & Avantages</SectionHeader>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <ResizableField fieldKey="salaireMin" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <TextField label="Salaire Min" size="small" type="number" fullWidth value={form.salaireMin} onChange={(e) => h('salaireMin', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
            </ResizableField>
            <ResizableField fieldKey="salaireMax" onResize={handleFieldResize} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
              <TextField label="Salaire Max" size="small" type="number" fullWidth value={form.salaireMax} onChange={(e) => h('salaireMax', e.target.value ? Number(e.target.value) : '')} InputProps={{ inputProps: { min: 0 }, endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>FCFA</InputAdornment> }} />
            </ResizableField>
          </Box>"""

c = c.replace(SEC5_OLD, SEC5_NEW)

# ──────────────────────────────────────────────
# 9) Wrap Date field
# ──────────────────────────────────────────────
SEC5_DATE_OLD = """<TextField label="Date requise" size="small" type="date" fullWidth value={form.dateRequise} onChange={(e) => h('dateRequise', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 2, '& input[type="date"]': { height: 40, lineHeight: '40px', boxSizing: 'border-box' } }} />"""

SEC5_DATE_NEW = """<ResizableField fieldKey="dateRequise" onResize={handleFieldResize} sx={{ mt: 2, width: '100%' }}>
            <TextField label="Date requise" size="small" type="date" fullWidth value={form.dateRequise} onChange={(e) => h('dateRequise', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& input[type="date"]': { height: 40, lineHeight: '40px', boxSizing: 'border-box' } }} />
          </ResizableField>"""

c = c.replace(SEC5_DATE_OLD, SEC5_DATE_NEW)

# ──────────────────────────────────────────────
# 10) Wrap TagInput (hard skills)
# ──────────────────────────────────────────────
SEC4_TAG_OLD = """<Box sx={{ mt: 2 }}>
            <TagInput label="Hard Skills (Savoir-faire)" value={form.hardSkills} onChange={(v) => h('hardSkills', v)} placeholder="Ex: React, Gestion de projet..." />
          </Box>"""

SEC4_TAG_NEW = """<ResizableField fieldKey="hardSkills" onResize={handleFieldResize} sx={{ mt: 2, width: '100%' }}>
            <TagInput label="Hard Skills (Savoir-faire)" value={form.hardSkills} onChange={(v) => h('hardSkills', v)} placeholder="Ex: React, Gestion de projet..." />
          </ResizableField>"""

c = c.replace(SEC4_TAG_OLD, SEC4_TAG_NEW)

# Write back
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(c)

print('OK - All resizable wrappers applied')
