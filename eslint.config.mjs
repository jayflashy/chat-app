/* ESLint v9+ Flat Config */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'eslint.config.mjs',
      'uploads/**',
      '**/*.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier,
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'prettier/prettier': 'warn',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
  },
  eslintConfigPrettier,
];
