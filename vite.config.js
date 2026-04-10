import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase source map threshold but keep chunk warning useful
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached forever, rarely changes
          'vendor-react': ['react', 'react-dom'],
          // Router — separate chunk, only changes on react-router upgrades
          'vendor-router': ['react-router-dom'],
          // Supabase SDK — heaviest vendor dep (~200KB), isolate it
          'vendor-supabase': ['@supabase/supabase-js'],
          // Recharts — very heavy (~400KB), only used on Dashboard
          'vendor-recharts': ['recharts'],
          // UI utilities
          'vendor-ui': ['react-hot-toast', 'lucide-react'],
        },
      },
    },
  },
})
