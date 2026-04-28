/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const persoApiTarget = (
    env.PERSO_API_BASE_URL || 'https://api.perso.ai'
  ).replace(/\/+$/, '');
  const persoApiKey = env.XP_API_KEY || env.VITE_PERSO_API_KEY;
  const koedubApiTarget = env.VITE_KOEDUB_API_URL || 'https://koedub.vercel.app';

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api/perso': {
          target: persoApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/perso/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              if (persoApiKey) {
                proxyReq.setHeader('XP-API-KEY', persoApiKey);
              }
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('authorization');
              console.log(`[proxy] ${req.method} ${req.url} → ${persoApiTarget}${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log(`[proxy] ${proxyRes.statusCode} ← ${req.method} ${req.url}`);
            });
            proxy.on('error', (err, req) => {
              console.error(`[proxy] ERROR ${req.method} ${req.url}:`, err.message);
            });
          },
        },
        '/api': {
          target: koedubApiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      proxy: {
        '/api/perso': {
          target: persoApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/perso/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (persoApiKey) {
                proxyReq.setHeader('XP-API-KEY', persoApiKey);
              }
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('authorization');
            });
          },
        },
      },
    },
  };
});
