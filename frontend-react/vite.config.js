console.log('🔥 VITE CONFIG LOADED 🔥')

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok-free.dev'
    ],
    proxy: {
      '/static': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000'
    }
  }
}
)
