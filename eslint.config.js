// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Supabase functions run on Deno (npm: imports, Deno globals); `deno check` covers them.
    ignores: ['dist/*', 'supabase/functions/*/index.ts'],
  },
  {
    // Tests import modules after jest.mock(...) on purpose.
    files: ['**/__tests__/**'],
    rules: { 'import/first': 'off', '@typescript-eslint/no-require-imports': 'off' },
  },
]);
