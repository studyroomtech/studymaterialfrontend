// ESLint flat config for the Study Materials Platform frontend.
//
// The frontend is an independent project (no monorepo/workspaces). This config
// applies the shared convention rules (see `eslint.config.base.mjs`) across the
// frontend source.

import { conventionConfig } from './eslint.config.base.mjs';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // Only source (`.ts` / `.tsx`) is authored by the Platform; generated output,
  // dependencies, and build artifacts are excluded from linting (Req 1.14).
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
  ...conventionConfig,
];
