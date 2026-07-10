// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Cast to any: tsPlugin.configs uses the legacy ClassicConfig shape (parser: string | null)
// which is incompatible with the flat-config Plugin type (parser: string | undefined).
// This is a known upstream type mismatch — runtime behaviour is unaffected.
const tsPluginAny = /** @type {any} */ (tsPlugin);

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ─── Ignored paths ─────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // ─── Base JS rules ─────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── Application source (src/) ─────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'jest.config.ts', 'jest.setup.ts'],
    plugins: {
      '@typescript-eslint': tsPluginAny,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...tsPluginAny.configs.recommended.rules,

      // ── Strictness ──────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            // process.on() accepts async callbacks — suppress false positives
            arguments: false,
          },
        },
      ],

      // ── Style ───────────────────────────────────────────────────────────────
      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ─── Test files (tests/) ───────────────────────────────────────────────────
  {
    files: ['tests/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPluginAny,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...tsPluginAny.configs.recommended.rules,

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false } },
      ],
      // Return types are noisy in test files
      '@typescript-eslint/explicit-function-return-type': 'off',

      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ─── Disable formatting rules that conflict with Prettier (must be last) ───
  prettier,
];
