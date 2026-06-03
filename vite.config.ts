import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { copyFileSync, mkdirSync } from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    react(),
    commonjs(),
    {
      name: 'inject-config-script',
      transformIndexHtml(html) {
        // Replace the dev src import with the standalone config.js import
        return html.replace(
          '<script src="/src/config.js"></script>',
          '<script src="./config.js"></script>'
        );
      },
    },
    {
      name: 'copy-config',
      writeBundle() {
        mkdirSync(path.resolve(__dirname, 'build'), { recursive: true });
        copyFileSync(
          path.resolve(__dirname, 'src/config.js'),
          path.resolve(__dirname, 'build/config.js')
        );
      },
    },
  ],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  build: {
    outDir: 'build',
  }
})