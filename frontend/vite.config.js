import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const readEnvValue = (fileName, key) => {
  const filePath = fileURLToPath(new URL(fileName, import.meta.url))
  if (!existsSync(filePath)) return undefined

  const line = readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`))

  if (!line) return undefined

  return line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2') || undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const recaptchaSiteKey = env.VITE_RECAPTCHA_SITE_KEY
    || readEnvValue('.env-deploy', 'VITE_RECAPTCHA_SITE_KEY')

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    define: recaptchaSiteKey
      ? { 'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(recaptchaSiteKey) }
      : {},
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
