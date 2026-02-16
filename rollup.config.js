import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import svelteConfig from './svelte.config.js';

import alias from '@rollup/plugin-alias';
import path from 'path';

import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';
// terser is minifier, ts and sv for rollup to compile ts and svelte files
// svelte preprocess is for using TS in svelte files
// resolve is for node modules.

// Read package.json (since we're using ES modules)
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

// Custom Web Component Elements 
const sveltePluginCustomElements = svelte({
  ...svelteConfig,
  include: ['src/lib/components/ui/**/*.svelte', 'src/lib/features/placeholder/**/*.svelte'],
});

// Regular Svelte components and Svelte 5 modules (e.g. .svelte.ts)
const sveltePluginRegular = svelte({
  ...svelteConfig,
  extensions: ['.svelte', '.svelte.ts', '.svelte.js'],
  include: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
  exclude: ['src/lib/components/ui/**/*.svelte', 'src/lib/features/placeholder/**/*.svelte'],
  // Regular non-custom components
  compilerOptions: {
    ...svelteConfig.compilerOptions,
    customElement: false,
  },
  emitCss: false,
});

// Plugin tools pipeline, build is for browser, dedupe prevents bundling Svelte multiple times
const plugins = [
  alias({
    entries: [
      { find: '$lib', replacement: path.resolve('src/lib') },
      { find: '$features', replacement: path.resolve('src/lib/features') },
      { find: '$ui', replacement: path.resolve('src/lib/components/ui') },
    ],
  }),
  resolve({
    browser: true, // Build is for browser
    dedupe: ['svelte'], // Prevents bundling Svelte multiple times
  }),
  sveltePluginRegular,
  sveltePluginCustomElements,
  typescript({ sourceMap: true, inlineSources: true }),
];

const builds = [
  // Node/Bundler builds (ESM/CJS) disabled for now as public API is not exposed.

  // Browser UMD build (non-minified)
  {
    input: 'src/browser.ts',
    output: {
      file: 'dist/custom-views.js',
      format: 'umd',
      name: 'CustomViews',
      banner,
      sourcemap: true,
    },
    plugins,
  },

  // Browser UMD build (minified)
  {
    input: 'src/browser.ts',
    output: {
      file: 'dist/custom-views.min.js',
      format: 'umd',
      name: 'CustomViews',
      banner,
      sourcemap: true,
    },
    plugins: [...plugins, terser()],
  },
];

const onwarn = (warning, warn) => {
  // According to Svelte GitHub Issue #10140
  // Circular Dependency Warnings during compilation (Cause TBD)
  // Warnings clutter compilation logs, but are otherwise harmless.
  // Hide Svelte circular dependency warnings from node_modules
  if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) {
    return;
  }
  warn(warning);
};

export default builds.map((config) => ({ ...config, onwarn }));
