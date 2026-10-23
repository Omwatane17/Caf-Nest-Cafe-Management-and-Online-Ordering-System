import os
path = r'C:\Users\HP\.gemini\antigravity-ide\brain\28c75d2a-9952-4442-8081-12494f78e204\write_assets.py'
content = open(path, encoding='utf-8').read()
old = 'BASE = os.path.dirname(os.path.abspath(__file__))'
new = 'BASE = r"c:\\Users\\HP\\Desktop\\DBMS_Project"'
fixed = content.replace(old, new)
open(path, 'w', encoding='utf-8').write(fixed)
print('Fixed' if old not in fixed else 'Not fixed')
