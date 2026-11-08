import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { spawn } from 'child_process'
import http from 'http'

// Plugin to automatically guarantee backend Node.js (server.js) is always running
const autoBackendPlugin = () => {
  let backendProcess = null;
  return {
    name: 'auto-backend-server',
    configureServer(server) {
      const checkReq = http.get('http://localhost:5001/api/v1/health', () => {
        // Backend is already responding
      });
      checkReq.on('error', () => {
        backendProcess = spawn('node', ['server.js'], {
          stdio: 'inherit',
          shell: true
        });
      });

      server.httpServer?.on('close', () => {
        if (backendProcess) {
          backendProcess.kill();
        }
      });
    }
  };
};

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), autoBackendPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
