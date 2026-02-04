import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [tsconfigPaths(), svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true, // If using globals like describe, it, expect
  },
});
