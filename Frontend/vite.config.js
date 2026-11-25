import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  // VITE_BACKEND = where the API lives. In docker-compose it is http://backend:3000
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = { '/api': { target: env.VITE_BACKEND || 'http://localhost:8000', changeOrigin: true } };
  return {
    base: command === 'serve' ? (env.VITE_BASE || '/' ) : '/',
    plugins: [react()],
    server: { port: 5173, host: true, proxy, allowedHosts: true },
    preview: { proxy, allowedHosts: true }, // used by the single-stage (baseline) image
  };
});
