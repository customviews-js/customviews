import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import svelteConfig from './svelte.config.js';

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

// Custom Web Component Elements (only files in components/elements)
const sveltePluginCustomElements = svelte({
  ...svelteConfig,
  include: 'src/components/elements/**/*.svelte',
});

// Regular Svelte components and Svelte 5 modules (e.g. .svelte.ts)
const sveltePluginRegular = svelte({
  ...svelteConfig,
  extensions: ['.svelte', '.svelte.ts', '.svelte.js'],
  include: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
  exclude: 'src/components/elements/**/*.svelte',
  // Regular non-custom components
  compilerOptions: {
    ...svelteConfig.compilerOptions,
    customElement: false
  }
});

// Plugin tools pipeline, build is for browser, dedupe prevents bundling Svelte multiple times
const plugins = [
  resolve({
    browser: true,      // Build is for browser
    dedupe: ['svelte']  // Prevents bundling Svelte multiple times
  }),
  sveltePluginRegular,
  sveltePluginCustomElements,
  typescript({ sourceMap: true, inlineSources: true })
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

// Run build 3 times to create different files
const builds = [
  // ESM build (for bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/custom-views.esm.js',
      format: 'esm',
      banner,
      sourcemap: true
    },
    plugins
  },
  
  // CommonJS build (for Node.js)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/custom-views.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    plugins
  },
  
  // Browser UMD build (minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/custom-views.min.js',
      format: 'umd',
      name: 'CustomViews',
      banner,
      sourcemap: true
    },
    plugins: [
      ...plugins,
      terser()
    ]
  }
];

export default builds.map(config => ({ ...config, onwarn }));