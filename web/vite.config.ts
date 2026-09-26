import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // fixtures/ (feature flags) lives outside web/.
  server: { port: 5173, fs: { allow: ['..'] } },
  preview: { port: 5173 },
})
