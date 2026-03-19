import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // react libraries vendor chunk එකට දාන්න
          if (id.includes('node_modules/react')) {
            return 'vendor';
          }
          // ui libraries ui chunk එකට දාන්න
          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui';
          }
          // node_modules වලින් එන අනිත් ඔක්කොම common vendor chunk එකට
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})