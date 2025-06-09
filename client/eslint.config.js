import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
// import prettierPlugin from "eslint-plugin-prettier"; // Only if you want prettier rules in ESLint

export default tseslint.config(
  {
    // Global ignores
    ignores: ['node_modules/', 'dist/', 'coverage/', '*.config.js', '*.config.cjs'],
  },
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript specific configurations
  ...tseslint.configs.recommendedTypeChecked, // Or .recommended if you don\'t want type-checked linting

  // React specific configurations
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest, // If you use Jest
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules, // For the new JSX transform
      'react/react-in-jsx-scope': 'off', // Covered by jsx-runtime
      // Add other React specific rule overrides here if needed
    },
  },

  // TypeScript overrides and project-specific rules (applied after recommended)
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser, // Already part of tseslint.configs... but explicit can be fine
      parserOptions: {
        project: ['./tsconfig.app.json'], // Point to the correct tsconfig for app source
        tsconfigRootDir: import.meta.dirname, // Or specific path to tsconfig
      },
    },
    rules: {
      // Your existing TypeScript rule overrides
      '@typescript-eslint/no-unused-vars': 'warn',
      // Add other TypeScript rule overrides here if needed
    },
  },

  // Prettier configuration (must be last)
  eslintConfigPrettier,

  // If you want to use eslint-plugin-prettier to run Prettier as a rule
  // {
  //   files: ["src/**/*.{ts,tsx,js,jsx}"],
  //   plugins: {
  //     prettier: prettierPlugin,
  //   },
  //   rules: {
  //     'prettier/prettier': 'error',
  //   },
  // }
);
