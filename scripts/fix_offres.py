import re

path = '/home/z/my-project/admina-rh-build/src/pages/Offres.jsx'
with open(path, 'r') as f:
    content = f.read()

old_func_start = '/* ═══ COMPOSANT QUICK STATUS CHIP MENU ═══ */'
old_func_end = '/* ═══ COMPOSANT QUICK ACTION BUTTONS'

start_idx = content.index(old_func_start)
end_idx = content.index(old_func_end)

new_func = '''/* ═══ COMPOSANT QUICK STATUS CHIP MENU ═══ */
function StatusChipMenu({ offre, onStatutChange, loadingId, loadingStatut }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmAnchor, setConfirmAnchor] = useState(null);
  const [pendingStatut, setPendingStatut] = useState(null);
  const open = Boolean(anchorEl);
  const isLoading = loadingId === offre.id;
  const currentColor = statutOffreColor[offre.statutOffre] || 'default';

  const handleClick = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = () => { setAnchorEl(null); setConfirmAnchor(null); setPendingStatut(null); };

  const handleSelect = (e, newStatut) => {
    e.stopPropagation();
    setAnchorEl(null);
    if (newStatut === offre.statutOffre) return;
    if (dangerousStatuses.includes(newStatut)) { setPendingStatut(newStatut); setConfirmAnchor(e.currentTarget); return; }
    onStatutChange(offre.id, newStatut);
  };

  const handleConfirm = (e) => {
    e.stopPropagation(); setConfirmAnchor(null);
    if (pendingStatut) { onStatutChange(offre.id, pendingStatut); setPendingStatut(null); }
  };
  const handleCancelConfirm = (e) => { e.stopPropagation(); setConfirmAnchor(null); setPendingStatut(null); };

  const statusDotColor = { 'A creer': '#9e9e9e', 'Publiee': '#2e7d32', 'Candidatures en cours': '#f57f17', 'Cloturee': '#616161', 'Annulee': '#d32f2f' };

  const chipEl = (
    <Chip
      icon={isLoading ? <CircularProgress size={14} sx={{ color: 'inherit', ml: 0.5 }} /> : undefined}
      label={isLoading && loadingStatut ? loadingStatut : offre.statutOffre}
      color={isLoading ? 'default' : currentColor}
      size="small" onClick={handleClick} onDelete={handleClick}
      deleteIcon={<KeyboardArrowDown sx={{ fontSize: 16, color: 'inherit' }} />}
      sx={{ fontWeight: 600, height: 26, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
      aria-expanded={open} aria-haspopup="true" role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
    />
  );

  const menuEl = (
    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
      PaperProps={{ sx: { minWidth: 200, py: 0.5, borderRadius: 2 } }} transitionDuration={150}
    >
      <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>Changer le statut</Typography>
      {nomenclatures.statut_offre.map(s => {
        const isActive = s === offre.statutOffre;
        const dot = statusDotColor[s] || '#9e9e9e';
        return (
          <MenuItem key={s} value={s} onClick={(e) => handleSelect(e, s)} selected={isActive} disabled={isActive}
            sx={{ py: 0.8, px: 1.5, gap: 1.5, fontSize: '0.85rem' }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
            {s}
            {isActive && <CheckCircle sx={{ fontSize: 16, ml: 'auto', color: '#1976d2' }} />}
          </MenuItem>
        );
      })}
    </Menu>
  );

  const confirmMsg = pendingStatut === 'Annulee' ? 'Etes-vous sur de vouloir annuler cette offre ?' : 'Etes-vous sur de vouloir clore cette offre ?';
  const confirmBtnColor = pendingStatut === 'Annulee' ? '#d32f2f' : '#616161';

  const popoverEl = (
    <Popover anchorEl={confirmAnchor} open={Boolean(confirmAnchor)} onClose={handleCancelConfirm}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      PaperProps={{ sx: { borderRadius: 2, p: 2, maxWidth: 280 } }} disablePortal
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <WarningAmber sx={{ fontSize: 20, color: pendingStatut === 'Annulee' ? '#d32f2f' : '#f57f17' }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>Confirmer le changement</Typography>
      </Box>
      <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>{confirmMsg}</Typography>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={handleCancelConfirm} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Annuler</Button>
        <Button size="small" variant="contained" onClick={handleConfirm} sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, bgcolor: confirmBtnColor }}>Confirmer</Button>
      </Box>
    </Popover>
  );

  return <>{chipEl}{menuEl}{popoverEl}</>;
}

'''

content = content[:start_idx] + new_func + content[end_idx:]

with open(path, 'w') as f:
    f.write(content)

print('Done - StatusChipMenu rewritten successfully')