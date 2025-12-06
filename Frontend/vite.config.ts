import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // Enable JavaScript in LESS
        math: 'always',          // Enable math operations
      },
    },
  },
});