import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ build: { rollupOptions: { output: { chunkFileNames: 'assets/[name]-[hash:8]', entryFileNames: 'assets/index-[hash]' } } }, plugins: [react()] });
