import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  // https://github.com/sveltejs/svelte-preprocess
  // Preprocess allows using other languages with Svelte (e.g. SCSS, TypeScript)
  preprocess: sveltePreprocess(),
  // emitCss moved to rollup config
  compilerOptions: {
    // Use <svelte:options customElement="tag-name" /> to wrap components (opt-in individual files).
    // Placed in svelte.config.js to address linter warnings.
    customElement: true
  }
};

export default config;
