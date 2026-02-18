import { SvelteSet } from 'svelte/reactivity';

/**
 * Store for converting DOM presence into reactive state.
 * Tracks which custom elements are currently in the DOM.
 */
export class ElementStore {
  /**
   * Registry of toggle IDs that are currently present in the DOM.
   * Used to filter the `menuToggles` list.
   */
  detectedToggles = $state<SvelteSet<string>>(new SvelteSet());

  /**
   * Registry of tab group IDs that are currently present in the DOM.
   * Used to filter the `menuTabGroups` list.
   */
  detectedTabGroups = $state<SvelteSet<string>>(new SvelteSet());

  /**
   * Registry of placeholder names that are currently present in the DOM.
   * Used to filter `isLocal` placeholders in settings.
   */
  detectedPlaceholders = $state<SvelteSet<string>>(new SvelteSet());

  /**
   * Returns true if there are any active components (toggles or tab groups) actually present in the DOM.
   */
  hasPageElements = $derived(this.detectedToggles.size > 0 || this.detectedTabGroups.size > 0);

  // --- Registry Actions ---

  /**
   * Registers a toggle as active on the current page.
   * @param id The ID of the toggle found in the DOM.
   */
  registerToggle(id: string) {
    this.detectedToggles.add(id);
  }

  /**
   * Registers a tab group as active on the current page.
   * @param id The ID of the tab group found in the DOM.
   */
  registerTabGroup(id: string) {
    this.detectedTabGroups.add(id);
  }

  /**
   * Registers a placeholder variable as active on the current page.
   * @param name The name of the placeholder found in the DOM.
   */
  registerPlaceholder(name: string) {
    this.detectedPlaceholders.add(name);
  }

  /**
   * Clears the component registry.
   * Should be called when scanning a fresh part of the DOM or resetting.
   */
  clearRegistry() {
    this.detectedToggles.clear();
    this.detectedTabGroups.clear();
    this.detectedPlaceholders.clear();
  }

  clearDetectedPlaceholders() {
    this.detectedPlaceholders.clear();
  }
}

export const elementStore = new ElementStore();
