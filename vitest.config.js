import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/backend/**/*.test.js'],
    exclude: ['tests/e2e/**', 'node_modules'],
    globals: false,
    environment: 'node',
  },
});
