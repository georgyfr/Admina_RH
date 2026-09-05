#!/usr/bin/env python3
"""Replace @dnd-kit column DnD with native HTML5 drag-and-drop in Offres.jsx"""

FILE = '/home/z/my-project/Domaine1_Recrutement_Candidats/Code frontend/Code frontend recrutement V1.2/src/pages/Offres.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    c = f.read()

# 1) Remove all 3 @dnd-kit imports
c = c.replace("import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';\n", '')
c = c.replace("import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';\n", '')
c = c.replace("import { CSS } from '@dnd-kit/utilities';\n", '')

# 2) Remove colSensors state and handleColDragEnd (use native approach instead)
old_state = '''  const [cols, setCols] = useState(INITIAL_TABLE_COLS);
  const colSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleColDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = cols.findIndex((c) => c.key === active.id);
      const newIdx = cols.findIndex((c) => c.key === over.id);
      setCols((items) => arrayMove(items, oldIdx, newIdx));
    }
  };'''

new_state = '''  const [cols, setCols] = useState(INITIAL_TABLE_COLS);
  const dragColRef = useRef(null); // key being dragged
  const handleColDragStart = (e, key) => { dragColRef.current = key; e.dataTransfer.effectAllowed = 'move'; };
  const handleColDragOver = (e, key) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleColDrop = (e, targetKey) => {
    e.preventDefault();
    const srcKey = dragColRef.current;
    if (!srcKey || srcKey === targetKey) return;
    setCols(prev => {
      const arr = [...prev];
      const si = arr.findIndex(c => c.key === srcKey);
      const ti = arr.findIndex(c => c.key === targetKey);
      const [moved] = arr.splice(si, 1);
      arr.splice(ti, 0, moved);
      return arr;
    });
    dragColRef.current = null;
  };'''

c = c.replace(old_state, new_state)

# 3) Replace SortableColHeader component with a simple native DnD header
old_sortable = '''/* Columnne de tableau draggable */
function SortableColHeader({ col }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.key });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
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
}'''

new_sortable = ''
c = c.replace(old_sortable, new_sortable)

# 4) Replace the DndContext/SortableContext wrapped header cells with native DnD
old_header = '''<DndContext sensors={colSensors} collisionDetection={closestCenter} onDragEnd={handleColDragEnd}>
            <SortableContext items={cols.map(c => c.key)} strategy={verticalListSortingStrategy}>
            {cols.map(c => (
              <SortableColHeader key={c.key} col={c} />
            ))}
            </SortableContext>
            </DndContext>'''

new_header = '''{cols.map(c => (
              <TableCell key={c.key} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', whiteSpace: 'nowrap', width: c.width }}
                draggable
                onDragStart={e => handleColDragStart(e, c.key)}
                onDragOver={e => handleColDragOver(e, c.key)}
                onDrop={e => handleColDrop(e, c.key)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'grab' }}>
                  <DragIndicator sx={{ fontSize: 14, color: 'grey.500' }} />
                  {c.label}
                </Box>
              </TableCell>
            ))}'''

c = c.replace(old_header, new_header)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done: replaced @dnd-kit with native HTML5 DnD for columns')
