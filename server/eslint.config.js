export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', '*.config.js', '*.config.cjs'],
    extends: ['airbnb-base', 'prettier'],
    plugins: ['import', 'prettier'],
    env: {
      node: true,
      es2021: true,
      jest: true,
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
        },
      ],
    },
  },
];
