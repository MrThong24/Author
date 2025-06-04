import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const PORT = `${env.VITE_PORT ?? '3000'}`;
  return {
    plugins: [react()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src')
      }
    },
    server: {
      port: Number(PORT) || 8888,
      host: '0.0.0.0',
      strictPort: true
    }
  };
});
