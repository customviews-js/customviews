import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  // https://github.com/sveltejs/svelte-preprocess
  // Preprocess allows using other languages with Svelte (e.g. SCSS, TypeScript)
  preprocess: sveltePreprocess(),
  emitCss: false, // Injects styles into JS strings instead of separate css files
  compilerOptions: {
    // Use <svelte:options customElement="tag-name" /> to wrap components (opt-in individual files).
    // Placed in svelte.config.js to address linter warnings.
    customElement: true
  }
};

export default config;
