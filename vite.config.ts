import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const deps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),

    electron({
      main: {
        entry: 'electron/main.ts',

        vite: {
          build: {
            rolldownOptions: {
              external: (id) => {
                if (deps.includes(id)) return true
                if (id.includes('.prisma/client')) return true
                if (id.startsWith('@prisma/')) return true
                return false
              },
            },
          },
        },
      },

      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },

      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})