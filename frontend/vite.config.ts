import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dns from 'dns';

// 禁用重新排序行為，這樣 vite 就不會解析成 '位址' 了，而是列印為 'localhost'
// https://stackoverflow.com/questions/76074040/vite-server-is-running-on-127-0-0-1-by-default-instead-of-localhost
// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  server: {
    host: 'localhost',
    port: 4000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'components'),
    },
  },
});
