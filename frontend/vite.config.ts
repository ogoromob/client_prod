import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Force single React instance
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    // Deduplicate React packages
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'lucide-react',
      'framer-motion',
      'zustand',
      '@tanstack/react-query'
    ],
    force: true  // Force re-optimization
  },
  build: {
    outDir: 'dist',
    sourcemap: true,  // Enable sourcemaps for debugging
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries (MUST be together)
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
          // Socket.io
          if (id.includes('socket.io')) {
            return 'socket-vendor';
          }
        },
      },
    },
  },
})
