// Shared ESLint convention rules for the Study Materials Platform frontend.
//
// This flat-config array is consumed by the frontend `eslint.config.mjs` and
// enforces the same code-organization conventions used across the project.
//
// Enforced conventions (Requirements 1.14–1.20):
//   - Req 1.14: TypeScript only; source files use `.ts` / `.tsx` extensions.
//   - Req 1.15/1.17: `interface` and `type` declarations live only in `*.types.ts`.
//   - Req 1.16/1.17: constant-literal exports live only in `*.constant.ts`.
//   - Req 1.18/1.20: styling is authored in `*.scss` files (no other stylesheet imports).
//   - Req 1.19/1.20: no inline CSS via the `style` prop on DOM elements or components.

import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

// Selectors that flag `interface` / `type` alias declarations (Req 1.15, 1.17).
const typeDeclarationSelectors = [
  {
    selector: 'TSInterfaceDeclaration',
    message:
      'Declare interfaces only in a *.types.ts file (Requirements 1.15, 1.17).',
  },
  {
    selector: 'TSTypeAliasDeclaration',
    message:
      'Declare type aliases only in a *.types.ts file (Requirements 1.15, 1.17).',
  },
];

// Selectors that flag exported constant *literal* values (Req 1.16, 1.17).
// Only literal-like initializers are flagged so that exported functions,
// arrow-function components, and hooks are not incorrectly reported.
const constantExportInitTypes = [
  'Literal',
  'TemplateLiteral',
  'ObjectExpression',
  'ArrayExpression',
  'TSAsExpression',
];

/**
 * Build `no-restricted-syntax` selectors for exported constant-literal values.
 * @param {string} [exemptNameRegex] optional regex of exported names to allow
 *   (used to permit framework-reserved exports in route files).
 * @returns {{ selector: string, message: string }[]}
 */
const makeConstantExportSelectors = (exemptNameRegex) => {
  const nameFilter = exemptNameRegex ? `:not([id.name=/${exemptNameRegex}/])` : '';
  return constantExportInitTypes.map((initType) => ({
    selector: `ExportNamedDeclaration > VariableDeclaration[kind="const"] > VariableDeclarator[init.type="${initType}"]${nameFilter}`,
    message:
      'Define constant values only in a *.constant.ts file (Requirements 1.16, 1.17).',
  }));
};

const constantExportSelectors = makeConstantExportSelectors();

// Next.js App Router / Pages Router reserve specific named `const` exports from
// route files (layout/page/route/image files). These are framework-mandated
// exports, not application constants, so they are exempt from Req 1.16 when they
// appear in route files under an `app/` or `pages/` directory.
const nextReservedExportNames = [
  'metadata',
  'viewport',
  'dynamic',
  'dynamicParams',
  'revalidate',
  'fetchCache',
  'runtime',
  'preferredRegion',
  'maxDuration',
  'config',
  'alt',
  'size',
  'contentType',
].join('|');

const routeFileConstantExportSelectors = makeConstantExportSelectors(
  `^(${nextReservedExportNames})$`,
);

// Forbid importing non-SCSS stylesheets so that all styling is authored in
// `*.scss` files (Req 1.18, 1.20).
const forbiddenStyleImportPatterns = [
  {
    group: ['**/*.css', '*.css'],
    message: 'Author styling in *.scss files only (Requirements 1.18, 1.20).',
  },
  {
    group: ['**/*.less', '*.less'],
    message: 'Author styling in *.scss files only (Requirements 1.18, 1.20).',
  },
  {
    group: ['**/*.sass', '*.sass'],
    message: 'Author styling in *.scss files only (Requirements 1.18, 1.20).',
  },
  {
    group: ['**/*.styl', '*.styl'],
    message: 'Author styling in *.scss files only (Requirements 1.18, 1.20).',
  },
];

/**
 * Shared convention config as a flat-config array.
 * @type {import('eslint').Linter.Config[]}
 */
export const conventionConfig = [
  // Parser + plugin registration for all TypeScript source files (Req 1.14).
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // No non-SCSS stylesheet imports anywhere (Req 1.18, 1.20).
      'no-restricted-imports': ['error', { patterns: forbiddenStyleImportPatterns }],
    },
  },

  // Group A — ordinary source files (neither *.types.ts nor *.constant.ts):
  // forbid both type declarations and constant-literal exports.
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.types.ts', '**/*.constant.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...typeDeclarationSelectors,
        ...constantExportSelectors,
      ],
    },
  },

  // Group A' — Next.js route files (under `app/` or `pages/`): same as Group A
  // but permits framework-reserved const exports (e.g. `metadata`, `viewport`,
  // route-segment config). Placed after Group A so it wins for matching files.
  {
    files: [
      '**/app/**/*.ts',
      '**/app/**/*.tsx',
      '**/pages/**/*.ts',
      '**/pages/**/*.tsx',
    ],
    ignores: ['**/*.types.ts', '**/*.constant.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...typeDeclarationSelectors,
        ...routeFileConstantExportSelectors,
      ],
    },
  },

  // Group B — *.types.ts files: type declarations are allowed here, but
  // constant-literal exports still belong in *.constant.ts.
  {
    files: ['**/*.types.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...constantExportSelectors],
    },
  },

  // Group C — *.constant.ts files: constant-literal exports are allowed here,
  // but type/interface declarations still belong in *.types.ts.
  {
    files: ['**/*.constant.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...typeDeclarationSelectors],
    },
  },

  // React components (*.tsx): forbid inline CSS via the `style` prop on both
  // DOM elements and custom components (Req 1.19, 1.20).
  {
    files: ['**/*.tsx'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],
      'react/forbid-component-props': ['error', { forbid: ['style'] }],
    },
  },
];

export default conventionConfig;
