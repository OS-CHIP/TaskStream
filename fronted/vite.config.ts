import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://172.28.2.95:10086',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (_err, _req, _res) => {
            // console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, _req, _res) => {
            // 透传前端请求头，避免覆盖 multipart/form-data 的 boundary
            
            // console.log('Sending Request to the Target:', req.method, req.url);
            // console.log('Request Headers:', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (_proxyRes, _req, _res) => {
            // console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // console.log('Response Headers:', proxyRes.headers);
          });
        },
      },
      '/ws': {
        target: 'http://172.28.2.95:10086',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
})
