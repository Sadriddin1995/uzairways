import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: { usePolling: true, interval: 120, awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 120 } as any },
    proxy: {
      // Forward frontend /api/* → backend http://localhost:3003/api/*
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

