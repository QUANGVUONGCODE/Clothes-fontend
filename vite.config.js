import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
    '/shopclothes': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log('Proxying request:', req.method, options.path);
        });
        proxy.on('error', (err, req, res) => {
          console.error('Proxy error:', err);
        });
      },
    }
  }
}})



