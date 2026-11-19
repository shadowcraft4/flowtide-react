import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Inlining everything into dist/index.html keeps the old workflow: the build
// opens straight from disk (file://), which split ES-module builds cannot.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    // Aceternity components import helpers as "@/lib/utils".
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
