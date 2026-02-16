import { SvelteSet } from 'svelte/reactivity';

/**
 * Detected Components Registry Store
 * Registry of component IDs that are currently present in the DOM.
 */
export class DetectedComponentsRegistryStore {
  detectedToggles = $state<SvelteSet<string>>(new SvelteSet());
  detectedTabGroups = $state<SvelteSet<string>>(new SvelteSet());
  detectedPlaceholders = $state<SvelteSet<string>>(new SvelteSet());

  registerToggle(id: string) {
    this.detectedToggles.add(id);
    // Force reactivity update for Svelte 5 in some contexts or if Set mutation isn't picked up by deep proxy 
    this.detectedToggles = new SvelteSet(this.detectedToggles);
  }

  registerTabGroup(id: string) {
    this.detectedTabGroups.add(id);
  }

  registerPlaceholder(name: string) {
    this.detectedPlaceholders.add(name);
  }

  clear() {
    this.detectedToggles.clear();
    this.detectedTabGroups.clear();
    this.detectedPlaceholders.clear();
  }

  clearPlaceholders() {
    this.detectedPlaceholders.clear();
  }
}
