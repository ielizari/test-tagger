import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: 'src/view',
  publicDir: 'src/view/public',
  build: {
    outDir: 'src/view/dist',
    rollupOptions: {
      input: {
        app: 'src/index.html',
      }
    }
  },
  resolve: {
    alias: {
      '/src': path.resolve(process.cwd(), 'src'),
      '@report': path.resolve(process.cwd(), 'report'),
    }
  }
})
