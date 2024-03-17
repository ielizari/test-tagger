import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import process from 'node:process'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(),
  ],
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
      '@stores': path.resolve(process.cwd(), 'src/view/src/stores'),
      '@components': path.resolve(process.cwd(), 'src/view/src/components'),
      '@composables': path.resolve(process.cwd(), 'src/view/src/composables'),
      '@utils': path.resolve(process.cwd(), 'src/view/src/utils'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true
      },
    },
  }
})
