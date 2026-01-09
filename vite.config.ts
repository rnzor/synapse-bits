import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Validate critical environment variables in production
    if (mode === 'production') {
      if (!env.GEMINI_API_KEY) {
        console.warn('⚠️  WARNING: GEMINI_API_KEY not found. API features will not work.');
      }
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Only expose API key in development (should be moved to backend)
        'process.env.API_KEY': mode === 'development' ? JSON.stringify(env.GEMINI_API_KEY) : JSON.stringify(''),
        'process.env.GEMINI_API_KEY': mode === 'development' ? JSON.stringify(env.GEMINI_API_KEY) : JSON.stringify(''),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production', // Remove console.log in production
            drop_debugger: mode === 'production'
          }
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['react-helmet-async']
            }
          }
        }
      }
    };
});
