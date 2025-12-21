import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  // Determine if we're in development mode
  const isDevelopment = mode === 'development'
  
  // For development: use localhost:5002
  // For production: use the VITE_API_BASE_URL from environment or a default
  const apiBaseUrl = env.VITE_API_BASE_URL || (isDevelopment ? 'http://localhost:5002/api' : '/api')
  const apiTarget = isDevelopment ? 'http://localhost:5002' : apiBaseUrl.replace('/api', '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Remove the define block - Vite automatically exposes VITE_* env variables
    // build: {
    //   outDir: 'dist',
    //   sourcemap: isDevelopment,
    // },
    server: isDevelopment ? {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    } : undefined,
  }
})