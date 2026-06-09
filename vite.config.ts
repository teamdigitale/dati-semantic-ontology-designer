import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { copyFileSync, mkdirSync, cpSync } from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    react(),
    commonjs(),
    {
      name: 'copy-config',
      writeBundle() {
        mkdirSync(path.resolve(__dirname, 'build'), { recursive: true });
        copyFileSync(
          path.resolve(__dirname, 'config.js'),
          path.resolve(__dirname, 'build/config.js')
        );
      },
    },
    {
      name: 'copy-fonts',
      writeBundle() {
        mkdirSync(path.resolve(__dirname, 'build', 'assets', 'assets'), { recursive: true });
        cpSync(
          path.resolve(__dirname, 'assets'),
          path.resolve(__dirname, 'build/assets/assets'),
          { recursive: true }
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