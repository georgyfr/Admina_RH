#!/usr/bin/env python3
"""Patch Admina-RH pages: add AddDialog to every page with an Add button."""
import re, os, json

DIR = '/home/z/my-project/admina-rh-build/src/pages'
SKIP = {'Candidats.jsx','Demandes.jsx','Pipeline.jsx','Sources.jsx',
        'TableauDeBord.jsx','Conformite.jsx','Parametres.jsx','Statuts.jsx','SourcesROI.jsx'}

CONFIGS = json.loads(open('/home/z/my-project/scripts/dialog_configs.json').read())

def make_fields_js(cfg):
    parts = []
    for f in cfg['f']:
        items = ['key: "' + f["k"] + '"', 'label: "' + f["l"] + '"']
        if 't' in f: items.append('type: "' + f['t'] + '"')
        if 'o' in f: items.append('options: ' + json.dumps(f['o']))
        if f.get('r'): items.append('required: true')
        if f.get('m'): items.append('multiline: true')
        parts.append('{' + ', '.join(items) + '}')
    return '[' + ','.join(parts) + ']'

def make_defaults_js(d):
    parts = []
    for k, v in d.items():
        if v is None: parts.append(k + ': null')
        elif isinstance(v, str): parts.append(k + ': "' + v + '"')
        elif isinstance(v, bool): parts.append(k + ': ' + str(v).lower())
        else: parts.append(k + ': ' + str(v))
    return '{' + ', '.join(parts) + '}'

def patch(fname, cfg):
    path = os.path.join(DIR, fname)
    with open(path, 'r') as f:
        c = f.read()
    if 'import AddDialog' in c:
        print(f'  SKIP {fname} (already patched)')
        return

    # 1. Import
    if 'import KPICard' in c:
        c = c.replace(
            "import KPICard from '../components/KPICard';",
            "import KPICard from '../components/KPICard';\nimport AddDialog from '../components/AddDialog';"
        )
    elif 'import {' in c:
        pos = c.index('import {')
        c = c[:pos] + "import AddDialog from '../components/AddDialog';\n" + c[pos:]
    else:
        print(f'  WARN {fname}: no import hook')
        return

    # 2. data setState
    c = c.replace('const [data] = useState(initialData)', 'const [data, setData] = useState(initialData)')

    # 3. Add dlg state
    if 'const [dlg, setDlg]' not in c:
        m = re.search(r'const \[rpp, setRpp\] = useState\(\d+\);', c)
        if m:
            ins = m.end()
            c = c[:ins] + '\n  const [dlg, setDlg] = useState(false);' + c[ins:]
        else:
            m = re.search(r'const \[data, setData\] = useState\(initialData\);', c)
            if m:
                ins = m.end()
                c = c[:ins] + '\n  const [dlg, setDlg] = useState(false);' + c[ins:]

    # 4. Wire onClick into button opening tag
    # Match opening tag: <Button variant="contained" startIcon={<Add .../>}>
    # Key: use [^/]*? to avoid matching the /> inside the Add component
    def add_onclick(m):
        tag = m.group(0)
        # Insert onClick before the final >
        return tag[:-1] + ' onClick={() => setDlg(true)}>'

    c = re.sub(
        r'<Button variant="contained" startIcon=\{<Add [^/]*?/>\}>',
        add_onclick, c, count=1
    )

    # 5. Insert AddDialog before last </Box>
    fields_js = make_fields_js(cfg)
    defaults_js = make_defaults_js(cfg.get('d', {}))
    title = cfg['t']
    prefix = cfg['p']
    dialog_js = '\n      <AddDialog open={dlg} onClose={() => setDlg(false)} title="' + title + '"' + '\n        fields={' + fields_js + '}' + '\n        onSubmit={(vals) => { const nid = data.length + 1; setData(prev => [...prev, { id: nid, numero: "' + prefix + '" + String(nid).padStart(3, \'0\'), ...' + defaults_js + ', ...vals }]); }}' + '\n      />'
    last_box = c.rfind('</Box>')
    if last_box > 0:
        c = c[:last_box] + dialog_js + '\n    ' + c[last_box:]

    with open(path, 'w') as f:
        f.write(c)
    print(f'  OK {fname}')

for fname in sorted(os.listdir(DIR)):
    if not fname.endswith('.jsx') or fname in SKIP:
        continue
    if fname in CONFIGS:
        patch(fname, CONFIGS[fname])
    else:
        print(f'  SKIP {fname} (no config)')
