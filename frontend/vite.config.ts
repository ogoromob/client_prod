import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('lucide-react') || id.includes('sonner')) {
            return 'ui-vendor';
          }
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          // Charts and visualizations
          if (id.includes('recharts') || id.includes('d3')) {
            return 'charts-vendor';
          }
          // State management and data fetching
          if (id.includes('zustand') || id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'state-vendor';
          }
        },
      },
    },
  },
})
