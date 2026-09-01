#!/usr/bin/env python3
import re

FILE = '/home/z/my-project/Domaine1_Recrutement_Candidats/Code frontend/Code frontend recrutement V1.2/src/pages/Offres.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    c = f.read()

# 1) FIX UNICODE ESCAPES
unicode_map = {
    r'\u00b0': '°',
    r'\u00e9': 'é',
    r'\u00c9': 'É',
    r'\u00f4': 'ô',
    r'\u00e8': 'è',
    r'\u00e7': 'ç',
    r'\u2192': '→',
    r'\u00ea': 'ê',
    r'\u00e0': 'à',
    r'\u00fb': 'û',
    r'\u00ee': 'î',
    r'\u00f9': 'ù',
}

for esc, char in unicode_map.items():
    c = c.replace(esc, char)

remaining = re.findall(r'\\u[0-9a-fA-F]{4}', c)
if remaining:
    print(f'WARNING: {len(remaining)} unicode escapes remaining: {set(remaining)}')
else:
    print('OK - All unicode escapes fixed')

# 2) TABLE CONTAINER - horizontal scroll + sticky header
old_tc = '<TableContainer><Table size="small">'
new_tc = '<TableContainer sx={{ maxHeight: 700 }}><Table size="small" stickyHeader>'
c = c.replace(old_tc, new_tc)

# 3) Make Actions header sticky
old_act_hdr = '<TableCell sx={{ fontWeight: \'bold\', bgcolor: \'#f5f5f5\', width: 230, textAlign: \'center\' }}>Actions</TableCell>'
new_act_hdr = '<TableCell sx={{ fontWeight: \'bold\', bgcolor: \'#f5f5f5\', width: 230, textAlign: \'center\', position: \'sticky\', right: 0, zIndex: 3, boxShadow: \'-4px 0 8px rgba(0,0,0,0.05)\' }}>Actions</TableCell>'
c = c.replace(old_act_hdr, new_act_hdr)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done - scroll + sticky applied')
