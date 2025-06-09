import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/', 'coverage/', '*.config.js', '*.config.cjs'],
  },
  {
    files: ['**/*.js'],
    plugins: {
      import: pluginImport,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    rules: {
      // Start with eslint recommended rules
      ...js.configs.recommended.rules,
      // Add prettier rules (runs prettier as an eslint rule)
      ...prettierPlugin.configs.recommended.rules,
      // Add eslint-config-prettier rules (disables eslint rules that conflict with prettier)
      ...eslintConfigPrettier.rules,

      // Your custom rules and airbnb-base inspired rules:
      // Note: Full airbnb-base is extensive. These are key ones from your previous setup + common airbnb patterns.
      // For a fuller airbnb-base experience in flat config, more detailed setup might be needed.
      'prettier/prettier': 'error',
      'no-console': 'off', // Your custom rule

      // Import plugin rules (subset from airbnb-base)
      'import/no-extraneous-dependencies': 'off', // Your custom rule
      'import/extensions': [
        // Your custom rule, adjusted for ESM
        'error',
        'ignorePackages',
        { js: 'always' }, // Changed from 'never' to 'always'
      ],
      'import/order': ['error', { 'newlines-between': 'always' }],
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'import/prefer-default-export': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Common Airbnb-base rules (JavaScript)
      'no-unused-vars': ['warn', { argsIgnorePattern: 'next' }], // Usually an error in airbnb
      'no-undef': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      strict: ['error', 'global'],
      curly: 'error',
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      // Add more rules here if needed to match airbnb-base more closely
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
  },
];
