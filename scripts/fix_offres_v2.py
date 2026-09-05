#!/usr/bin/env python3
"""Part 2: sticky body Actions cell + DnD column reorder in Offres.jsx"""
import re

FILE = '/home/z/my-project/Domaine1_Recrutement_Candidats/Code frontend/Code frontend recrutement V1.2/src/pages/Offres.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    c = f.read()

# 1) Make body Actions cell sticky
old_body_act = '''                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>'''
new_body_act = '''                <TableCell sx={{ position: 'sticky', right: 0, zIndex: 3, bgcolor: '#fff', boxShadow: '-4px 0 8px rgba(0,0,0,0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>'''
c = c.replace(old_body_act, new_body_act)

# 2) Convert tableCols from const to a state-driven approach
# Replace the const with an initial array, and add state + DnD inside the component

# 2a) Replace the const declaration
old_cols = """const tableCols = [
  { key: 'numero', label: 'N° Offre', width: 110 },
  { key: 'datePublication', label: 'Publication', width: 95 },
  { key: 'departement', label: 'Département', width: 145, chip: true },
  { key: 'intitule', label: 'Intitulé du Poste', width: 200 },
  { key: 'canalDiffusion', label: 'Canal', width: 110 },
  { key: 'nbCandidaturesRecues', label: 'Candidatures', width: 90 },
  { key: 'responsable', label: 'Responsable', width: 150 },
];"""

new_cols = """const INITIAL_TABLE_COLS = [
  { key: 'numero', label: 'N° Offre', width: 110 },
  { key: 'datePublication', label: 'Publication', width: 95 },
  { key: 'departement', label: 'Département', width: 145, chip: true },
  { key: 'intitule', label: 'Intitulé du Poste', width: 200 },
  { key: 'canalDiffusion', label: 'Canal', width: 110 },
  { key: 'nbCandidaturesRecues', label: 'Candidatures', width: 90 },
  { key: 'responsable', label: 'Responsable', width: 150 },
];"""

c = c.replace(old_cols, new_cols)

# 2b) Add state for cols after existing useState hooks (find a good anchor)
# Look for the first useState in the component and add after it
# Let's find the state declarations area

# Find the component function
comp_start = c.find('export default function Offres()')
if comp_start == -1:
    comp_start = c.find('export default function Offres ')
if comp_start == -1:
    print('ERROR: Cannot find component')
    exit(1)

# Find the first block of useState calls - add cols state after them
# We'll add after the last useState before the first useEffect
first_use_effect = c.find('useEffect', comp_start)
if first_use_effect == -1:
    print('ERROR: Cannot find useEffect')
    exit(1)

# Find the line before useEffect that has a useState
# Insert the cols state + DnD imports and setup

dnd_import = """import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';"""

# Check if dnd-kit is already imported
if 'DndContext' not in c[:comp_start]:
    # Add import before the component or after last import
    last_import_end = c.rfind(';', 0, comp_start) + 1
    c = c[:last_import_end] + '\n' + dnd_import + c[last_import_end:]
    print('Added DnD imports')
else:
    print('DnD imports already exist')

# Add cols state - find a good insertion point after existing states
# Insert before the first useEffect
insert_point = c.rfind('\n', comp_start, first_use_effect) + 1

state_addition = """  const [cols, setCols] = useState(INITIAL_TABLE_COLS);
  const colSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleColDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = cols.findIndex((c) => c.key === active.id);
      const newIdx = cols.findIndex((c) => c.key === over.id);
      setCols((items) => arrayMove(items, oldIdx, newIdx));
    }
  };

"""
c = c[:insert_point] + state_addition + c[insert_point:]

# 3) Replace tableCols references with cols in JSX
# In the TableHead
old_head = '{tableCols.map(c => ('
new_head = '{cols.map(c => ('
c = c.replace(old_head, new_head)

# In the TableBody  
# There are two references to tableCols
old_body = 'tableCols.map(c => ('
new_body = 'cols.map(c => ('
c = c.replace(old_body, new_body)

# Replace tableCols.length with cols.length
c = c.replace('tableCols.length', 'cols.length')

# 4) Wrap TableHead cells with DndContext for column drag
# Replace the header row
old_header_row = """            {cols.map(c => (
              <TableCell key={c.key} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: c.width }}>{c.label}</TableCell>
            ))}"""

new_header_row = """            <DndContext sensors={colSensors} collisionDetection={closestCenter} onDragEnd={handleColDragEnd}>
            <SortableContext items={cols.map(c => c.key)} strategy={verticalListSortingStrategy}>
            {cols.map(c => (
              <SortableColHeader key={c.key} col={c} />
            ))}
            </SortableContext>
            </DndContext>"""

c = c.replace(old_header_row, new_header_row)

# 5) Add SortableColHeader component before INITIAL_TABLE_COLS
sortable_col = '''
/* Columnne de tableau draggable */
function SortableColHeader({ col }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <TableCell ref={setNodeRef} style={style} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: col.width, cursor: 'grab' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} {...attributes} {...listeners}>
        <DragIndicator sx={{ fontSize: 14, color: 'grey.500' }} />
        {col.label}
      </Box>
    </TableCell>
  );
}
'''

c = c.replace('const INITIAL_TABLE_COLS', sortable_col + 'const INITIAL_TABLE_COLS')

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done - sticky body + DnD columns applied')
