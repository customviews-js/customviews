/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill Svelte Runes BEFORE import
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;
// @ts-expect-error - Polyfill for testing
globalThis.$derived = (fn) => (typeof fn === 'function' ? fn() : fn);
globalThis.$derived.by = (fn) => fn();

// Mock dependencies
vi.mock('../../../src/lib/features/placeholder/stores/placeholder-value-store.svelte', () => ({
  placeholderValueStore: {
    set: vi.fn(),
    values: {},
  },
}));

vi.mock('../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn(),
    register: vi.fn(),
    get: vi.fn(),
    definitions: [],
  },
}));

import { placeholderRegistryStore } from '../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

describe('DataStore (Facade)', () => {
  let initStore: any;
  let store: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Dynamic import to ensure globals are set
    const module = await import('../../../src/lib/stores/main-store.svelte');
    initStore = module.initStore;
    store = module.store;

    store.reset();
    store.clearRegistry();
  });

  // Tests for global initialization that spans across stores (Facade responsibility)
  describe('Initialization', () => {
    it('should register placeholders from config (Delegation to PlaceholderRegistry)', () => {
      const config = {
        placeholders: [{ name: 'p1', defaultValue: 'default' }],
      };

      initStore({ config });

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'config',
        }),
      );
    });
  });

  // Smoke tests to ensure delegation works
  describe('Delegation Smoke Tests', () => {
    it('should delegate registerToggle to ElementStore', () => {
      store.registerToggle('t1');
      expect(store.detectedToggles.has('t1')).toBe(true);
    });

    it('should delegate setUIOptions to UIStore', () => {
      store.setUIOptions({ showTabGroups: false });
      expect(store.uiOptions.showTabGroups).toBe(false);
    });

    it('should delegate setPinnedTab to ActiveStateStore', () => {
       // We rely on ActiveStateStore logic, here we just check if it doesn't crash
       // and updates local state if possible
       const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'val1' }],
          },
        ],
      };
      
      initStore({ config });
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);
      
      store.setPinnedTab('group1', 't1');
      // Verify side effect
      expect(store.state.tabs['group1']).toBe('t1');
    });
  });
});
