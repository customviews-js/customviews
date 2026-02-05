/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill Svelte Runes BEFORE import
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;
// @ts-expect-error - Polyfill for testing
globalThis.$derived = (fn) => (typeof fn === 'function' ? fn() : fn);
globalThis.$derived.by = (fn) => fn();

// Mock svelte/reactivity
vi.mock('svelte/reactivity', () => ({
  SvelteSet: Set,
}));

// Mock dependencies
vi.mock('../../src/lib/features/placeholder/stores/placeholder-value-store.svelte', () => ({
  placeholderValueStore: {
    set: vi.fn(),
    values: {},
  },
}));

vi.mock('../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn(),
    register: vi.fn(),
    get: vi.fn(),
    definitions: [],
  },
}));

import { placeholderValueStore } from '../../src/lib/features/placeholder/stores/placeholder-value-store.svelte';
import { placeholderRegistryStore } from '../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

describe('DataStore', () => {
  let initStore: any;
  let store: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Dynamic import to ensure globals are set
    const module = await import('../../src/lib/stores/main-store.svelte');
    initStore = module.initStore;
    store = module.store;

    store.reset();
    store.clearRegistry();
  });

  describe('setPinnedTab', () => {
    it('should update placeholder value when tab is pinned', () => {
      // Setup Config with TabGroup and Placeholder
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [
              { tabId: 't1', placeholderValue: 'val1' },
              { tabId: 't2', placeholderValue: 'val2' },
            ],
          },
        ],
      };

      // Setup Store with Config
      const testStore = initStore(config);

      // Mock Registry to say placeholder exists
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      // Action: Pin Tab 2
      testStore.setPinnedTab('group1', 't2');

      // Assert
      expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', 'val2');
    });

    it('should NOT update placeholder if placeholderId is missing in config', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            // No placeholderId
            tabs: [{ tabId: 't1', placeholderValue: 'val1' }],
          },
        ],
      };

      const testStore = initStore(config);
      testStore.setPinnedTab('group1', 't1');

      expect(placeholderValueStore.set).not.toHaveBeenCalled();
    });

    it('should NOT update placeholder if placeholder is not in registry', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'val1' }],
          },
        ],
      };

      const testStore = initStore(config);

      // Clear calls from initStore
      vi.mocked(placeholderValueStore.set).mockClear();

      // Mock Registry to say placeholder does NOT exist
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(false);

      testStore.setPinnedTab('group1', 't1');

      expect(placeholderValueStore.set).not.toHaveBeenCalled();
    });

    it('should handle undefined placeholderValue in tab config', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [
              { tabId: 't1' }, // No placeholderValue
            ],
          },
        ],
      };

      const testStore = initStore(config);
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      testStore.setPinnedTab('group1', 't1');

      // specific implementation detail: usually falls back to empty string or doesn't set?
      // Looking at code: const placeholderValue = tabConfig.placeholderValue ?? "";
      expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', '');
    });
  });

  describe('Initialization', () => {
    it('should register placeholders from config', () => {
      const config = {
        placeholders: [{ name: 'p1', defaultValue: 'default' }],
      };

      initStore(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'config',
        }),
      );
    });

    it('should register placeholders from tabGroups', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'val1' }],
          },
        ],
      };

      initStore(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'tabgroup',
          ownerTabGroupId: 'group1',
        }),
      );
    });
  });
});
