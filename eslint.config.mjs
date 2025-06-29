// eslint.config.js
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'prettier/prettier': 'error', // Treat Prettier formatting issues as ESLint errors
      'no-unused-vars': 'warn', // Warn about unused variables
      'no-console': 'off', // Allow console logs
      'no-unused-expressions': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
    },
  },
  eslintConfigPrettier,
  {
    plugins: {
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
      jest: eslintPluginJest,
      'testing-library': eslintPluginTestingLibrary,
    },
    rules: {
      'prettier/prettier': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'testing-library/await-async-query': 'error',
      'testing-library/no-await-sync-query': 'error',
      'testing-library/no-debugging-utils': 'warn',
      'testing-library/no-dom-import': 'error',
    },
  },
  {
    // Jest environment for test files
    files: ['**/*.test.js', '**/*.spec.js'],
    env: {
      'jest/globals': true,
    },
  },
];
