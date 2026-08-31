path = '/home/z/my-project/admina-rh-build/src/pages/Offres.jsx'
with open(path, 'r') as f: c = f.read()
c = c.replace('DeleteOutline', 'Delete')
with open(path, 'w') as f: f.write(c)
print('Fixed DeleteOutline')