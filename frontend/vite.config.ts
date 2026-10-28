import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo, las llamadas a /api van al backend (Node + Express).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
