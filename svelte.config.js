import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  // https://github.com/sveltejs/svelte-preprocess
  // Preprocess allows using other languages with Svelte (e.g. SCSS, TypeScript)
  preprocess: sveltePreprocess(),
  // emitCss moved to rollup config
  compilerOptions: {
    // Use <svelte:options customElement="tag-name" /> to wrap components (opt-in individual files).
    // Placed in svelte.config.js to address linter warnings.
    customElement: false,
  
    // Add warning filter to ignore 'options_missing_custom_element'
    // This allows us to have <svelte:options customElement> in component files (for the build, where it is enabled)
    // without the linter complaining that it's set to false globally.
    warningFilter: (warning) => {
      return warning.code !== 'options_missing_custom_element';
    },
  },
};

export default config;
