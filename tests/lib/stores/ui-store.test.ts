import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill Svelte Runes
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;
// @ts-expect-error - Polyfill for testing
globalThis.$derived = (fn) => (typeof fn === 'function' ? fn() : fn);
globalThis.$derived.by = (fn) => fn();

import { UIStore } from '../../../src/lib/stores/ui-store.svelte';

describe('UIStore', () => {
    let store: UIStore;

    beforeEach(() => {
        store = new UIStore();
    });

    it('should update uiOptions', () => {
      store.setUIOptions({ showTabGroups: false });
      expect(store.uiOptions.showTabGroups).toBe(false);
      // Check other options remain default
      expect(store.uiOptions.showReset).toBe(true);
    });

    it('should reset uiOptions', () => {
      store.setUIOptions({ showTabGroups: false });
      store.reset();
      expect(store.uiOptions.showTabGroups).toBe(true);
    });
});
