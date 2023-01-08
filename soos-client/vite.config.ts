import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Requests to the Vite devserver under the /api path to the SOOS server on port 3000
      '/api': 'http://localhost:3000'
    }
  }
})
