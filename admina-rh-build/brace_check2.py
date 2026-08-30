import re, os
os.chdir('/home/z/my-project/admina-rh-build')
with open('src/pages/TableauDeBord.jsx') as f:
    lines = f.readlines()

code = ''.join(lines)
# Remove template literals
while '`' in code:
    i = code.index('`')
    j = code.index('`', i+1)
    code = code[:i] + 'TSTR' + code[j+1:]
# Remove double-quoted strings
while '"' in code:
    i = code.index('"')
    j = code.index('"', i+1)
    code = code[:i] + 'DSTR' + code[j+1:]
# Remove single-quoted strings
while "'" in code:
    i = code.index("'")
    j = code.index("'", i+1)
    code = code[:i] + 'SSTR' + code[j+1:]
# Remove block comments
while '/*' in code:
    i = code.index('/*')
    j = code.index('*/', i+2)
    code = code[:i] + 'BCMT' + code[j+2:]
# Remove line comments
while '//' in code:
    i = code.index('//')
    j = code.index('\n', i)
    code = code[:i] + code[j+1:]
# Now count
clean = code.split('\n')
for idx, line in enumerate(clean):
    d = line.count('{') - line.count('}')
    if d > 0 or (435 <= idx+1 <= 445) or (610 <= idx+1 <= 625) or idx+1 >= len(clean)-5:
        print(f'L{idx+1} net={d:+d} total={line.count(chr(123))-line.count(chr(125))}: {lines[idx].rstrip()[:100]}')
