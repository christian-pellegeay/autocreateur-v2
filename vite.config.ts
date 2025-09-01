import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add future flags for React Router to eliminate warnings
  define: {
    'process.env.REACT_ROUTER_FUTURE_V7_START_TRANSITION': 'true',
    'process.env.REACT_ROUTER_FUTURE_V7_RELATIVE_SPLAT_PATH': 'true',
  },
});