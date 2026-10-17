const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.vue')) {
      files.push(name);
    }
  }
  return files;
}

const files = [
  ...getFiles('D:/laragon/www/datn-SORA-ThinkHub/frontend/src/pages/user'),
  ...getFiles('D:/laragon/www/datn-SORA-ThinkHub/frontend/src/components/user')
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Notice that previous replacement used:
  // fallback = \`\${import.meta.env.VITE_URL}/storage/\${store.settings.placeholder_client_active}\`;
  
  // We want to replace the whole handleImageError function:
  const regex = /const handleImageError\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?if\s*\(e\.target\.src\s*!==\s*fallback\)\s*\{[\s\S]*?\}\s*\};/g;
  
  const replacement = `const handleImageError = (e) => { 
  if (e.target.dataset.errorHandled) return;
  e.target.dataset.errorHandled = 'true';
  let fallback = '/Sora-placeholder.png';
  try {
      const store = useSettingsStore();
      if (store && store.settings && store.settings.placeholder_client_active) {
          fallback = getStorageUrl(store.settings.placeholder_client_active);
      }
  } catch (err) {}
  e.target.src = fallback;
};`;

  if (content.match(regex)) {
    content = content.replace(regex, replacement);
    
    // Make sure getStorageUrl is imported if we just added it
    if (!content.includes("import { getStorageUrl }")) {
      content = content.replace("<script setup>", "<script setup>\nimport { getStorageUrl } from '@/utils/env';");
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
