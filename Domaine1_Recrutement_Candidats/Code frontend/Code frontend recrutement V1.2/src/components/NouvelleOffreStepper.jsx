import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Stepper, Step, StepLabel,
  IconButton, Alert, InputAdornment, Typography, Fade, Divider,
  Tooltip,
} from '@mui/material';
import {
  Close, Work, AccountBalanceWallet, Campaign,
  ArrowForward, ArrowBack, Save, Publish, CheckCircle, Info,
} from '@mui/icons-material';
import { nomenclatures } from '../data/nomenclatures';

/* ═══ HELPERS ═══ */
const todayISO = () => new Date().toISOString().split('T')[0];
const addDays = (iso, n) => {
  if (!iso) return '';
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const toFrDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const fmtFCFA = (n) => (n ? n.toLocaleString('fr-FR') + ' FCFA' : '\u2014');

const INITIAL_FORM = {
  intitule: '',
  departement: '',
  typePoste: '',
  typeContrat: '',
  priorite: '',
  site: 'Siege (Douala)',
  salaireMin: '',
  salaireMax: '',
  budgetAlloue: '',
  responsable: '',
  roleResponsable: '',
  dateRequise: '',
  canalDiffusion: '',
  datePublication: '',
  dateCloture: '',
  _budgetManuel: false,
  _clotureManuel: false,
};

/* ═══ COMPOSANT PRINCIPAL ═══ */
export default function NouvelleOffreStepper({ open, onClose, onSubmit, responsablesList = [] }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  /* ═══ RESET À L'OUVERTURE ═══ */
  useEffect(() => {
    if (open) {
      setStep(0);
      setErrors({});
      setForm({ ...INITIAL_FORM, datePublication: todayISO() });
    }
  }, [open]);

  /* ═══ AUTO-CALCUL BUDGET (salaireMax × 3) ═══ */
  const budgetSuggere = useMemo(() => {
    const max = Number(form.salaireMax) || 0;
    return max * 3;
  }, [form.salaireMax]);

  useEffect(() => {
    if (budgetSuggere > 0 && !form._budgetManuel) {
      setForm(prev => ({ ...prev, budgetAlloue: budgetSuggere }));
    }
  }, [budgetSuggere, form._budgetManuel]);

  /* ═══ AUTO-DATE CLÔTURE (+30 jours après publication) ═══ */
  useEffect(() => {
    if (form.datePublication && !form._clotureManuel) {
      setForm(prev => ({ ...prev, dateCloture: addDays(form.datePublication, 30) }));
    }
  }, [form.datePublication, form._clotureManuel]);

  /* ═══ AUTO-RÔLE RESPONSABLE ═══ */
  useEffect(() => {
    if (form.responsable && responsablesList.length) {
      const r = responsablesList.find(x => x.nom === form.responsable);
      if (r) setForm(prev => ({ ...prev, roleResponsable: r.role }));
    }
  }, [form.responsable, responsablesList]);

  /* ═══ VALIDATION PAR ÉTAPE ═══ */
  const validate = useCallback(
    (s) => {
      const e = {};
      if (s === 0) {
        if (!form.intitule?.trim()) e.intitule = 'Champ requis';
        if (!form.departement) e.departement = 'Champ requis';
        if (!form.typePoste) e.typePoste = 'Champ requis';
        if (!form.typeContrat) e.typeContrat = 'Champ requis';
        if (!form.priorite) e.priorite = 'Champ requis';
      } else if (s === 1) {
        if (!form.salaireMin) e.salaireMin = 'Champ requis';
        if (!form.salaireMax) e.salaireMax = 'Champ requis';
        if (form.salaireMin && form.salaireMax && Number(form.salaireMax) < Number(form.salaireMin)) {
          e.salaireMax = 'Doit être >= au salaire min';
        }
        if (!form.responsable) e.responsable = 'Champ requis';
        if (!form.dateRequise) e.dateRequise = 'Champ requis';
      } else if (s === 2) {
        if (!form.canalDiffusion) e.canalDiffusion = 'Champ requis';
      }
      return e;
    },
    [form],
  );

  const currentStepValid = useMemo(() => Object.keys(validate(step)).length === 0, [step, validate]);

  /* ═══ HANDLERS ═══ */
  const handleChange = useCallback(
    (key, val) => {
      setForm(prev => ({ ...prev, [key]: val }));
      if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
      if (key === 'budgetAlloue') setForm(prev => ({ ...prev, _budgetManuel: true, budgetAlloue: val }));
      if (key === 'dateCloture') setForm(prev => ({ ...prev, _clotureManuel: true, dateCloture: val }));
    },
    [errors],
  );

  const handleNext = () => {
    const e = validate(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep(prev => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setErrors({});
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = (asDraft) => {
    const { _budgetManuel, _clotureManuel, ...cleanForm } = form;
    const result = {
      ...cleanForm,
      datePublication: asDraft ? '' : toFrDate(form.datePublication || todayISO()),
      dateCloture: toFrDate(form.dateCloture),
      dateRequise: toFrDate(form.dateRequise),
      statutOffre: asDraft ? 'A creer' : 'Publiee',
    };
    if (onSubmit) onSubmit(result, asDraft ? 'Brouillon enregistré avec succès' : 'Offre publiée avec succès');
  };

  /* ═══ CUSTOM STEP ICON ═══ */
  const stepIcons = [
    <Work sx={{ fontSize: 20 }} />,
    <AccountBalanceWallet sx={{ fontSize: 20 }} />,
    <Campaign sx={{ fontSize: 20 }} />,
  ];

  const renderStepIcon = (stepIndex) => {
    const isCompleted = stepIndex < step;
    const isActive = stepIndex === step;
    return (
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isCompleted ? '#0D7C66' : isActive ? '#1565c0' : '#e0e0e0',
          color: isCompleted || isActive ? '#fff' : '#9e9e9e',
          transition: 'all 0.3s ease',
          boxShadow: isActive ? '0 0 0 4px rgba(21,101,192,0.15)' : 'none',
        }}
      >
        {isCompleted ? <CheckCircle sx={{ fontSize: 20 }} /> : stepIcons[stepIndex]}
      </Box>
    );
  };

  /* ═══ FIELD RENDERER ═══ */
  const renderField = (key, label, opts = {}) => {
    const isSelect = !!opts.options;
    const base = {
      label,
      size: 'small',
      fullWidth: true,
      value: form[key] ?? '',
      onChange: (e) => {
        const v = opts.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value;
        handleChange(key, v);
      },
      required: opts.required || false,
      error: !!errors[key],
      helperText: errors[key] || opts.helperText || ' ',
      ...(!isSelect && opts.type === 'number'
        ? {
            type: 'number',
            InputProps: {
              inputProps: { min: 0 },
              ...(opts.endAdornment
                ? { endAdornment: <InputAdornment position="end" style={{ fontSize: '0.8rem' }}>{opts.endAdornment}</InputAdornment> }
                : {}),
            },
          }
        : {}),
      ...(!isSelect && opts.type === 'date' ? { type: 'date', InputLabelProps: { shrink: true } } : {}),
      ...(opts.multiline ? { multiline: true, rows: opts.rows || 3 } : {}),
    };

    if (isSelect) {
      return (
        <TextField {...base} select SelectProps={{ MenuProps: { sx: { maxHeight: 300 } } }}>
          {opts.options.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    return <TextField {...base} />;
  };

  /* ═══ STEPS CONFIG ═══ */
  const stepLabels = ['Généralités', 'Budget & Rémunération', 'Diffusion & Détails'];

  /* ═══ RENDU ═══ */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={Fade}
    >
      {/* ── HEADER ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          pt: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Work sx={{ fontSize: 22, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Nouvelle Offre d'Emploi
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* ── STEPPER ── */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={step} alternativeLabel>
          {stepLabels.map((label, i) => (
            <Step key={label} completed={i < step}>
              <StepLabel StepIconComponent={() => renderStepIcon(i)}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      {/* ── CONTENT ── */}
      <DialogContent sx={{ flex: 1, overflow: 'auto', pt: 2.5, px: 3 }}>
        <Fade in key={step} timeout={350}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            {/* ─── ÉTAPE 1 : GÉNÉRALITÉS ─── */}
            {step === 0 && (
              <>
                {renderField('intitule', 'Intitulé du Poste', { required: true })}
                {renderField('departement', 'Département', { required: true, options: nomenclatures.departement })}
                {renderField('typePoste', 'Type de Poste', { required: true, options: nomenclatures.type_poste })}
                {renderField('typeContrat', 'Type de Contrat', { required: true, options: nomenclatures.type_contrat })}
                {renderField('priorite', 'Priorité', { required: true, options: nomenclatures.priorite })}
                {renderField('site', 'Site', { options: nomenclatures.site })}
              </>
            )}

            {/* ─── ÉTAPE 2 : BUDGET & RÉMUNÉRATION ─── */}
            {step === 1 && (
              <>
                {renderField('salaireMin', 'Salaire Min', { required: true, type: 'number', endAdornment: 'FCFA' })}
                {renderField('salaireMax', 'Salaire Max', { required: true, type: 'number', endAdornment: 'FCFA' })}
                {renderField('budgetAlloue', 'Budget Alloué', {
                  type: 'number',
                  endAdornment: 'FCFA',
                  helperText:
                    budgetSuggere > 0
                      ? `Suggestion : ${fmtFCFA(budgetSuggere)} (3× le salaire max)${form._budgetManuel ? ' — valeur personnalisée' : ''}`
                      : ' ',
                })}
                {renderField('dateRequise', 'Date Requise', { required: true, type: 'date' })}
                {renderField('responsable', 'Responsable', { required: true, options: responsablesList.map((r) => r.nom) })}
                {renderField('roleResponsable', 'Rôle du Responsable', { options: nomenclatures.role_responsable })}
                {/* Encadré info budget */}
                {budgetSuggere > 0 && Number(form.salaireMin) > 0 && (
                  <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                    <Alert
                      severity={form._budgetManuel ? 'info' : 'success'}
                      variant="outlined"
                      icon={<Info sx={{ fontSize: 18 }} />}
                      sx={{ borderRadius: 2, py: 0.5 }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                        Budget prévisionnel suggéré : <strong>{fmtFCFA(budgetSuggere)}</strong>
                        {form._budgetManuel
                          ? ' (valeur personnalisée modifiée)'
                          : ' (calculé automatiquement : 3× le salaire max)'}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </>
            )}

            {/* ─── ÉTAPE 3 : DIFFUSION & DÉTAILS ─── */}
            {step === 2 && (
              <>
                {renderField('canalDiffusion', 'Canal de Diffusion', { required: true, options: nomenclatures.canal_diffusion })}
                {renderField('datePublication', 'Date de Publication', { type: 'date' })}
                {renderField('dateCloture', 'Date de Clôture', {
                  type: 'date',
                  helperText:
                    form.datePublication && !form._clotureManuel
                      ? `Suggestion automatique : ${toFrDate(addDays(form.datePublication, 30))} (+30 jours)`
                      : form._clotureManuel
                        ? 'Date modifiée manuellement'
                        : ' ',
                })}
              </>
            )}
          </Box>
        </Fade>
      </DialogContent>

      <Divider />

      {/* ── FOOTER DYNAMIQUE ── */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', flexShrink: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Annuler
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Navigation étapes */}
          {step > 0 && (
            <Button onClick={handleBack} startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={{ textTransform: 'none' }}>
              Précédent
            </Button>
          )}
          {step < 2 && (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              disabled={!currentStepValid}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Suivant
            </Button>
          )}
          {/* Boutons de soumission (étape 3) */}
          {step === 2 && (
            <>
              <Tooltip title="Enregistrer avec le statut 'A créer'">
                <Button
                  onClick={() => handleSubmit(true)}
                  startIcon={<Save sx={{ fontSize: 18 }} />}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  Sauvegarder en Brouillon
                </Button>
              </Tooltip>
              <Tooltip title="Publier immédiatement l'offre">
                <Button
                  onClick={() => handleSubmit(false)}
                  variant="contained"
                  startIcon={<Publish sx={{ fontSize: 18 }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#0D7C66',
                    '&:hover': { bgcolor: '#0a5c4a' },
                  }}
                >
                  Enregistrer & Publier
                </Button>
              </Tooltip>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
