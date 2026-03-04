import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ⭐ /templates 요청을 백엔드로 프록시
      '/templates': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 기존 API 요청도 프록시 (혹시 없다면 추가)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})