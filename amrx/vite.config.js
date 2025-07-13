import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ 
    tailwindcss(),
    react()
  ],
  
  // Performance optimizations
  server: {
    port: 5173,
    host: true,
    // Faster file watching
    watch: {
      usePolling: false,
      interval: 1000,
    },
  },
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  
  // Development optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  
  // Optimize for production
  define: {
    __DEV__: false,
  },
})
