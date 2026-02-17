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



describe('DataStore (Facade)', () => {
  let initStore: any;
  let store: any;
  let placeholderRegistryStore: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const registryModule = await import('../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte');
    placeholderRegistryStore = registryModule.placeholderRegistryStore;

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

    it('should prioritize config placeholders over tabGroup placeholders (Precedence)', () => {
      // Logic: If config defines 'p1', and tabGroup uses 'p1',
      // The config definition should be registered first.
      // Then when tabGroup tries to register, it detects existing 'config' source and yields.
      
      const config = {
        placeholders: [{ name: 'p1', defaultValue: 'config-def' }],
        tabGroups: [
            {
                groupId: 'g1',
                placeholderId: 'p1', // Collision
                tabs: []
            }
        ]
      };

      // Use a stateful mock to simulate registry behavior
      const registryMap = new Map();
      vi.mocked(placeholderRegistryStore.register).mockImplementation((def: any) => {
          registryMap.set(def.name, def);
      });
      vi.mocked(placeholderRegistryStore.get).mockImplementation((name: any) => {
          return registryMap.get(name);
      });
      vi.mocked(placeholderRegistryStore.has).mockImplementation((name: any) => {
          return registryMap.has(name);
      });

      initStore({ config });

      // Expectation: The registered placeholder should have source: 'config'
      const calls = vi.mocked(placeholderRegistryStore.register).mock.calls;
      const p1Calls = calls.filter((args: any) => args[0].name === 'p1');
      
      // We expect the first call to be source: 'config'
      expect(p1Calls.length).toBeGreaterThan(0);
      expect(p1Calls[0]?.[0].source).toBe('config');
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
       // Verify that calls are correctly delegated to ActiveStateStore
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
