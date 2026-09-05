#!/usr/bin/env python3
"""Fix: remove CSS import from @dnd-kit/utilities (rolldown can't handle it), inline transform instead"""

FILE = '/home/z/my-project/Domaine1_Recrutement_Candidats/Code frontend/Code frontend recrutement V1.2/src/pages/Offres.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the problematic import
c = c.replace("import { CSS } from '@dnd-kit/utilities';\n", '')

# Replace CSS.Transform.toString(transform) with inline equivalent in SortableColHeader
c = c.replace(
    "CSS.Transform.toString(transform)",
    "transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined"
)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(c)

print('Fixed: removed CSS import, inlined transform')
