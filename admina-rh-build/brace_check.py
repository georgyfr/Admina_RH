import re
with open('src/pages/TableauDeBord.jsx') as f:
    lines = f.readlines()
code = ''.join(lines)
code2 = re.sub(r'""".*?"""', '', code, flags=re.DOTALL)
code2 = re.sub(r"''''.*?'''", '', code2, flags=re.DOTALL)
code2 = re.sub(r'"[^"]*?"', 'STR', code2)
code2 = re.sub(r"'[^']*?'", 'STR', code2)
code2 = re.sub(r'/\*.*?\*/', '', code2, flags=re.DOTALL)
code2 = re.sub(r'//.*', '', code2)
depth = 0
clean = code2.split('\n')
for i, line in enumerate(clean):
    for ch in line:
        if ch == '{': depth += 1
        elif ch == '}': depth -= 1
    if (610 <= i+1 <= 630) or (660 <= i+1 <= 690):
        print(f'L{i+1} d={depth}: {lines[i].rstrip()[:90]}')
print(f'Final depth: {depth}')
