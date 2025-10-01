import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      'obsidian': resolve(__dirname, './test/__mock__/obsidian.ts'),
    },
  },
});