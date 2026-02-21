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
    calculatePlaceholderFromTabSelected: vi.fn(),
  },
}));

import { placeholderManager } from '../../../src/lib/features/placeholder/placeholder-manager';


import { ActiveStateStore } from '../../../src/lib/stores/active-state-store.svelte';

describe('ActiveStateStore', () => {
  let store: ActiveStateStore;

  beforeEach(() => {
    vi.clearAllMocks();
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

      // Assert
      store.setPinnedTab('group1', 't2');

// Logic moved to PlaceholderManager. We just test that the manager called.
      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalledWith(
        'group1',
        't2',
        expect.any(Object)
      );
    });

    it('should delegate update to PlaceholderManager even if placeholderId is missing (validation in manager)', () => {
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
      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
    });

    it('should delegate update to PlaceholderManager even if placeholder is not in registry (validation in manager)', () => {
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
      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
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

      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
    });
  });

  describe('applyState', () => {
    it('should handle undefined tabs in newState gracefully', () => {
      store.applyState({ shownToggles: [], peekToggles: [] }); // tabs is undefined
      expect(store.state.tabs).toBeDefined();
    });
  });

  describe('applyDifferenceInState (Sparse URL Delta)', () => {
    beforeEach(() => {
      store.state.shownToggles = ['ON_BY_PERSISTENCE'];
      store.state.peekToggles = ['PEEK_BY_PERSISTENCE'];
      store.state.tabs = { g1: 'tabA' };
    });

    it('merges shown/peek/hide deltas on top of current state', () => {
      // Delta says: show NEW, hide ON_BY_PERSISTENCE
      store.applyDifferenceInState({
        shownToggles: ['NEW'],
        hiddenToggles: ['ON_BY_PERSISTENCE'],
      });

      expect(store.state.shownToggles).toContain('NEW');
      expect(store.state.shownToggles).not.toContain('ON_BY_PERSISTENCE');
      // Unmentioned peek should remain
      expect(store.state.peekToggles).toContain('PEEK_BY_PERSISTENCE');
    });

    it('merges tabs and placeholders', () => {
      store.applyDifferenceInState({
        tabs: { g2: 'tabB' },
        placeholders: { p1: 'val1' },
      });

      expect(store.state.tabs).toEqual({ g1: 'tabA', g2: 'tabB' });
      expect(store.state.placeholders).toEqual({ p1: 'val1' });
    });

    it('completely overwrites a toggle if it switches from shown to peek', () => {
      store.applyDifferenceInState({
        peekToggles: ['ON_BY_PERSISTENCE'],
      });

      expect(store.state.peekToggles).toContain('ON_BY_PERSISTENCE');
      expect(store.state.shownToggles).not.toContain('ON_BY_PERSISTENCE');
    });
  });
});
