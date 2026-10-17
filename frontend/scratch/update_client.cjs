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
  const regex = /const handleImageError\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\};/g;
  const replacement = `const handleImageError = (e) => { 
  let fallback = '/Sora-placeholder.png';
  try {
      const store = useSettingsStore();
      if (store && store.settings && store.settings.placeholder_client_active) {
          fallback = \`\${import.meta.env.VITE_URL}/storage/\${store.settings.placeholder_client_active}\`;
      }
  } catch (err) {}
  if (e.target.src !== fallback) {
      e.target.src = fallback; 
  }
};`;

  if (content.match(regex)) {
    content = content.replace(regex, replacement);
    if (!content.includes("import { useSettingsStore }")) {
      content = content.replace("<script setup>", "<script setup>\nimport { useSettingsStore } from '@/stores/settingsStore';");
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
