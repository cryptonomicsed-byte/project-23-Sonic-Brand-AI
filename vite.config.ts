import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './src/lib'),
      '$components': path.resolve(__dirname, './src/components'),
      '$pages': path.resolve(__dirname, './src/pages'),
      '$types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 1111,
  },
})
