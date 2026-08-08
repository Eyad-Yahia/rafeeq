import { defineConfig } from 'tsup';
// @ts-expect-error Node types are not installed but this is a build script
import { cpSync } from 'fs';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  async onSuccess() {
    cpSync('docs/fonts', 'dist/fonts', { recursive: true, force: true });
  },
});
