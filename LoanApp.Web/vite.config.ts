import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()],
  server: {
    port: 3001, // Development server port
    host: true, // Listen on all addresses
  },
  preview: {
    port: 4173, // Preview server port
  }
})
