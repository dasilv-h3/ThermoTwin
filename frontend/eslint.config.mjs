import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'babel.config.js'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      // jsx-a11y targets the DOM (alt, htmlFor, onClick/role pairing, ...).
      // On React Native we rely on accessibilityRole / accessibilityLabel instead,
      // so we disable the purely DOM-targeted rules that don't map cleanly to RN.
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/html-has-lang': 'off',
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/media-has-caption': 'off',
      'jsx-a11y/no-autofocus': 'warn',
      'prettier/prettier': 'error',
      ...prettierConfig.rules,
    },
  },
];
