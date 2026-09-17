// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'docs']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // ✅ automatic JSX runtime — React import لازم نیست
        jsxPragma: null,
        jsxFragment: null,
      },
    },
    rules: {
      // ✅ اجازه بده فایل‌هایی که هم component و هم helper export می‌کنند
      // (فعلاً موقت؛ در Patch 1.8 حل می‌شود)
      'react-refresh/only-export-components': 'warn',
    },
  },
])