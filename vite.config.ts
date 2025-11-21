import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    // This port is only for development
    port: 5173,
    // host binding
    host: true,
    // Proxy API requests to backend server
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // This helps with routing issues
  preview: {
    port: 3000
  }
})