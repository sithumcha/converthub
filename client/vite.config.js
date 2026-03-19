import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // warning limit එක 1MB දක්වා වැඩි කරන්න
    rollupOptions: {
      output: {
        manualChunks: (id) => {

          if (id.includes('node_modules/react')) {
            return 'vendor';
          }

          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
