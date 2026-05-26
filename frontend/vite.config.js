import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 自定义插件：排除reference文件夹
const excludeReferencesPlugin = {
  name: 'exclude-references',
  apply: 'build',
  enforce: 'post',
  generateBundle(options, bundle) {
    // 删除bundle中的reference文件
    const keysToDelete = []
    for (const key in bundle) {
      if (key.includes('references/')) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => {
      delete bundle[key]
    })
  },
  writeBundle() {
    // 在写入文件后，删除dist中的references文件夹
    const distDir = path.resolve(__dirname, 'dist')
    const referencesDir = path.join(distDir, 'modules', 'haironghuiqi', 'references')
    if (fs.existsSync(referencesDir)) {
      fs.rmSync(referencesDir, { recursive: true, force: true })
      console.log('✓ 已删除 references 文件夹')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/app-portfolio/' : '/',
  plugins: [react(), excludeReferencesPlugin],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'antd-mobile': ['antd-mobile'],
        },
      },
    },
  },
  // 优化依赖
  optimizeDeps: {
    include: ['antd-mobile'],
  },
})