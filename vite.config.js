import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import process from 'node:process'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(),
  ],
  root: 'src/view/vue',
  resolve: {
    alias: {
      '@report': path.resolve(process.cwd(), 'report'),
      '@stores': path.resolve(process.cwd(), 'src/view/vue/src/stores'),
      '@components': path.resolve(process.cwd(), 'src/view/vue/src/components'),
      '@composables': path.resolve(process.cwd(), 'src/view/vue/src/composables'),
      '@utils': path.resolve(process.cwd(), 'src/view/vue/src/utils'),
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
