import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: false,
      host: '0.0.0.0',
      // HMR will auto-detect the correct hostname for the browser
      // No need to specify host/port - Vite uses the request origin
      watch: {
        usePolling: true,
      },
      open: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-intersection-observer',
        'framer-motion',
      ]
    },
    build: {
      sourcemap: command === 'serve',
      target: 'es2015',
      minify: command === 'build' ? 'terser' : false,
      terserOptions: command === 'build' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': './src',
      }
    }
  };
});