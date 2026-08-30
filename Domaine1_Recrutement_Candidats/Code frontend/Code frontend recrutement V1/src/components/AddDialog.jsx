import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Box, Snackbar, Alert, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function AddDialog({ open, onClose, title, fields, onSubmit, defaultValues }) {
  const [form, setForm] = useState({});
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    if (open) {
      const defaults = {};
      (fields || []).forEach(f => {
        defaults[f.key] = (defaultValues && defaultValues[f.key]) || '';
      });
      setForm(defaults);
    }
  }, [open, fields, defaultValues]);

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(form);
      setSnack(true);
      setTimeout(() => onClose(), 400);
    }
  };

  const requiredOk = !(fields || []).some(f => f.required && !form[f.key]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          {title || 'Ajouter'}
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {(fields || []).map(f => (
              f.type === 'select' ? (
                <FormControl key={f.key} size="small" fullWidth>
                  <InputLabel>{f.label}</InputLabel>
                  <Select
                    value={form[f.key] || ''}
                    label={f.label}
                    onChange={e => handleChange(f.key, e.target.value)}
                  >
                    {(f.options || []).map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : f.type === 'number' ? (
                <TextField
                  key={f.key}
                  label={f.label}
                  size="small"
                  fullWidth
                  type="number"
                  value={form[f.key] || ''}
                  onChange={e => handleChange(f.key, e.target.value ? Number(e.target.value) : '')}
                  required={f.required}
                />
              ) : (
                <TextField
                  key={f.key}
                  label={f.label}
                  size="small"
                  fullWidth
                  value={form[f.key] || ''}
                  onChange={e => handleChange(f.key, e.target.value)}
                  required={f.required}
                  multiline={f.multiline}
                  rows={f.rows || 2}
                />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!requiredOk}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snack}
        autoHideDuration={3000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnack(false)}>
          Ajouté avec succès !
        </Alert>
      </Snackbar>
    </>
  );
}
