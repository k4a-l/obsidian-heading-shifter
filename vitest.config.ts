import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      'obsidian': resolve(__dirname, './test/__mock__/obsidian.ts'),
    },
  },
});