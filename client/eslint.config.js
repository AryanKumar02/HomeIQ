export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', '*.config.js', '*.config.cjs'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    plugins: ['react', '@typescript-eslint', 'prettier'],
    env: {
      browser: true,
      es2021: true,
      jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
