import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsxFactory: 'createElement', jsxFragment: 'createFragment' },
  optimizeDeps: { entries: ['index.html'] },
});
