// svelte-shims.d.ts

// For Svelte components, tells Typescript that imports ending in .svelte are valid
// and should be treated as Svelte components.
declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}
