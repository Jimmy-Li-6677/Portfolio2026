import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Node server during development
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
