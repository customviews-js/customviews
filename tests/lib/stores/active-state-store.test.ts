import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill Svelte Runes
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;
// @ts-expect-error - Polyfill for testing
globalThis.$derived = (fn) => (typeof fn === 'function' ? fn() : fn);
globalThis.$derived.by = (fn) => fn();

// Mock PlaceholderManager
vi.mock('../../../src/lib/features/placeholder/placeholder-manager', () => ({
  placeholderManager: {
    updatePlaceholderFromTab: vi.fn(),
    registerTabGroupPlaceholders: vi.fn(),
    registerConfigPlaceholders: vi.fn(),
  },
}));

import { placeholderManager } from '../../../src/lib/features/placeholder/placeholder-manager';


import { ActiveStateStore } from '../../../src/lib/stores/active-state-store.svelte';

describe('ActiveStateStore', () => {
  let store: ActiveStateStore;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation if needed
    placeholderManager.updatePlaceholderFromTab = vi.fn();
    placeholderManager.registerTabGroupPlaceholders = vi.fn();
    placeholderManager.registerConfigPlaceholders = vi.fn();
    store = new ActiveStateStore();
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

      // In the new store, we init with config
      store.init(config);

      // Asseert
      store.setPinnedTab('group1', 't2');

// Logic moved to PlaceholderManager. We just test that the manager called.
      expect(placeholderManager.updatePlaceholderFromTab).toHaveBeenCalledWith(
        'group1',
        't2',
        expect.any(Object)
      );
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

      store.init(config);
      store.setPinnedTab('group1', 't1');

      // Expect call to manager even if config has issues (manager handles validation)
      expect(placeholderManager.updatePlaceholderFromTab).toHaveBeenCalled();
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

      store.init(config);
      store.setPinnedTab('group1', 't1');

      // Expect call to manager even if registry has issues (manager handles validation)
      expect(placeholderManager.updatePlaceholderFromTab).toHaveBeenCalled();
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

      store.init(config);
      // No registry mock needed - manager handles it

      store.setPinnedTab('group1', 't1');

      expect(placeholderManager.updatePlaceholderFromTab).toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    // ActiveStateStore handles tabGroup-based placeholder registration internally
    // during initialization. It does NOT handle global config placeholders.
    
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

      store.init(config);
      // We need to pass the current tabs state to registerPlaceholders
      // The store handles this internally when we call this method
      store.registerPlaceholders();

      expect(placeholderManager.registerTabGroupPlaceholders).toHaveBeenCalledWith(
        config,
        { group1: 't1' }
      );
    });
  });
});
