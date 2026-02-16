import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill Svelte Runes
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

import { placeholderValueStore } from '../../../src/lib/features/placeholder/stores/placeholder-value-store.svelte';
import { placeholderRegistryStore } from '../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';
import { ActiveStateStore } from '../../../src/lib/stores/active-state-store.svelte';

describe('ActiveStateStore', () => {
  let store: ActiveStateStore;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(placeholderRegistryStore.has).mockReset();
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

      // Mock Registry to say placeholder exists
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      // Action: Pin Tab 2
      store.setPinnedTab('group1', 't2');

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

      store.init(config);
      store.setPinnedTab('group1', 't1');

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

      store.init(config);

      // Mock Registry to say placeholder does NOT exist
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(false);

      store.setPinnedTab('group1', 't1');

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

      store.init(config);
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      store.setPinnedTab('group1', 't1');

      expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', '');
    });
  });

  describe('Initialization', () => {
    // Note: ActiveStateStore registers placeholders via registerPlaceholderFromTabGroup
    // but global placeholders are handled by main-store initStore currently?
    // Let's check ActiveStateStore.init() code.
    // It calls registerPlaceholderFromTabGroup for tab groups.
    // It does NOT iterate config.placeholders. That was in main-store.ts initStore().
    
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
