from pathlib import Path

root = Path('frontend/src/pages/admin')
storage_const = "const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\\/api\\/?$/, '');"
updated = []
for path in root.rglob('*.vue'):
    text = path.read_text(encoding='utf-8')
    if '${API_URL}/storage/' in text:
        if 'const API_URL = import.meta.env.VITE_API_BASE_URL;' in text and 'const STORAGE_URL = import.meta.env.VITE_STORAGE_URL' not in text:
            text = text.replace('const API_URL = import.meta.env.VITE_API_BASE_URL;', 'const API_URL = import.meta.env.VITE_API_BASE_URL;\n' + storage_const)
        text = text.replace('${API_URL}/storage/', '${STORAGE_URL}/storage/')
        path.write_text(text, encoding='utf-8')
        updated.append(str(path))
print('updated', len(updated), 'files')
for f in updated:
    print(f)
