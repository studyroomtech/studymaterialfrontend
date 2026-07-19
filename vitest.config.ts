import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Vitest configuration for the frontend.
//
// Resolves the `@/*` path alias to `./src/*` so tests can import modules using
// the same alias the app and tsconfig use. The pure helpers under test are
// React-free, so the default (node) environment is sufficient.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
