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
    filterValidPlaceholders: vi.fn((placeholders) => placeholders ?? {}),
  },
}));

// Mock PlaceholderRegistryStore
vi.mock('../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    register: vi.fn(),
  },
}));

import { placeholderManager } from '../../../src/lib/features/placeholder/placeholder-manager';
import { ActiveStateStore } from '../../../src/lib/stores/active-state-store.svelte';

describe('ActiveStateStore', () => {
  let store: ActiveStateStore;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: filterValidPlaceholders is a passthrough
    vi.mocked(placeholderManager.filterValidPlaceholders).mockImplementation((ph) => ph ?? {});
    store = new ActiveStateStore();
  });

  // ---------------------------------------------------------------------------
  // setPinnedTab
  // ---------------------------------------------------------------------------

  describe('setPinnedTab', () => {
    it('should update placeholder value when tab is pinned', () => {
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

      store.init(config);
      store.setPinnedTab('group1', 't2');

      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalledWith(
        'group1',
        't2',
        expect.any(Object)
      );
    });

    it('should delegate to PlaceholderManager even if placeholderId is missing (manager handles validation)', () => {
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

      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
    });

    it('should delegate to PlaceholderManager even if placeholder is not in registry (manager handles validation)', () => {
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

      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
    });

    it('should handle undefined placeholderValue in tab config', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'group1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1' }],
          },
        ],
      };

      store.init(config);
      store.setPinnedTab('group1', 't1');

      expect(placeholderManager.calculatePlaceholderFromTabSelected).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // applyState
  // ---------------------------------------------------------------------------

  describe('applyState', () => {
    it('should handle undefined tabs in newState gracefully', () => {
      store.applyState({ shownToggles: [], peekToggles: [] });
      expect(store.state.tabs).toBeDefined();
    });

    it('should filter out invalid toggle IDs', () => {
      const config = {
        toggles: [{ toggleId: 'known' }],
      };
      store.init(config);

      store.applyState({ shownToggles: ['known', 'ghost-show'], peekToggles: ['ghost-peek'] });

      expect(store.state.shownToggles).toContain('known');
      expect(store.state.shownToggles).not.toContain('ghost-show');
      expect(store.state.peekToggles).not.toContain('ghost-peek');
    });

    it('should filter out invalid tab group IDs', () => {
      const config = {
        tabGroups: [{ groupId: 'known', tabs: [{ tabId: 't1' }] }],
      };
      store.init(config);

      store.applyState({ tabs: { known: 't1', ghost: 'tabB' } });

      expect(store.state.tabs?.known).toBe('t1');
      expect(store.state.tabs?.ghost).toBeUndefined();
    });

    it('should filter out invalid tab IDs within a known group', () => {
      const config = {
        tabGroups: [{ groupId: 'g1', tabs: [{ tabId: 'valid' }] }],
      };
      store.init(config);

      store.applyState({ tabs: { g1: 'nonexistent' } });

      // Falls back to default (first tab)
      expect(store.state.tabs?.g1).toBe('valid');
    });

    it('should sanitize incoming placeholders via filterValidPlaceholders', () => {
      vi.mocked(placeholderManager.filterValidPlaceholders).mockReturnValue({ safe: 'ok' });

      store.applyState({ placeholders: { safe: 'ok', evil: 'injected' } });

      expect(placeholderManager.filterValidPlaceholders).toHaveBeenCalledWith({ safe: 'ok', evil: 'injected' });
      expect(store.state.placeholders?.evil).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // applyDifferenceInState (Sparse URL Delta)
  // ---------------------------------------------------------------------------

  describe('applyDifferenceInState (Sparse URL Delta)', () => {
    beforeEach(() => {
      store.init({
        toggles: [
          { toggleId: 'ON_BY_PERSISTENCE' },
          { toggleId: 'PEEK_BY_PERSISTENCE' },
          { toggleId: 'NEW' },
        ],
      });
      store.state.shownToggles = ['ON_BY_PERSISTENCE'];
      store.state.peekToggles = ['PEEK_BY_PERSISTENCE'];
      store.state.tabs = { g1: 'tabA' };
    });

    it('merges shown/peek/hide deltas on top of current state', () => {
      store.applyDifferenceInState({
        shownToggles: ['NEW'],
        hiddenToggles: ['ON_BY_PERSISTENCE'],
      });

      expect(store.state.shownToggles).toContain('NEW');
      expect(store.state.shownToggles).not.toContain('ON_BY_PERSISTENCE');
      // Unmentioned peek should remain
      expect(store.state.peekToggles).toContain('PEEK_BY_PERSISTENCE');
    });

    it('completely overwrites a toggle if it switches from shown to peek', () => {
      store.applyDifferenceInState({
        peekToggles: ['ON_BY_PERSISTENCE'],
      });

      expect(store.state.peekToggles).toContain('ON_BY_PERSISTENCE');
      expect(store.state.shownToggles).not.toContain('ON_BY_PERSISTENCE');
    });

    it('merges valid tabs and preserves existing tabs', () => {
      const config = {
        toggles: [
          { toggleId: 'ON_BY_PERSISTENCE' },
          { toggleId: 'PEEK_BY_PERSISTENCE' },
          { toggleId: 'NEW' },
        ],
        tabGroups: [
          { groupId: 'g1', tabs: [{ tabId: 'tabA' }] },
          { groupId: 'g2', tabs: [{ tabId: 'tabB' }] },
        ],
      };
      store.init(config);
      store.state.tabs = { g1: 'tabA' };

      store.applyDifferenceInState({ tabs: { g2: 'tabB' } });

      expect(store.state.tabs).toMatchObject({ g1: 'tabA', g2: 'tabB' });
    });

    it('drops nonexistent tab group IDs from the delta', () => {
      const config = {
        tabGroups: [{ groupId: 'real', tabs: [{ tabId: 't1' }] }],
      };
      store.init(config);

      store.applyDifferenceInState({ tabs: { ghost: 'tabX' } });

      expect(store.state.tabs?.ghost).toBeUndefined();
    });

    it('drops nonexistent tab IDs within a known group', () => {
      const config = {
        tabGroups: [{ groupId: 'g1', tabs: [{ tabId: 'valid' }] }],
      };
      store.init(config);
      store.state.tabs = { g1: 'valid' };

      store.applyDifferenceInState({ tabs: { g1: 'fakeTab' } });

      // Should not have accepted the invalid tab
      expect(store.state.tabs?.g1).toBe('valid');
    });

    it('only accepts registered placeholder keys (explicit override wins)', () => {
      vi.mocked(placeholderManager.filterValidPlaceholders).mockReturnValue({ p1: 'explicit' });

      store.applyDifferenceInState({ placeholders: { p1: 'explicit', evil: 'injected' } });

      expect(placeholderManager.filterValidPlaceholders).toHaveBeenCalledWith({ p1: 'explicit', evil: 'injected' });
      expect(store.state.placeholders?.evil).toBeUndefined();
    });

    it('drops nonexistent toggle IDs from the delta', () => {
      const config = {
        toggles: [{ toggleId: 'real' }],
      };
      store.init(config);

      store.applyDifferenceInState({ shownToggles: ['real', 'fakeShow'], peekToggles: ['fakePeek'], hiddenToggles: ['fakeHide'] });

      expect(store.state.shownToggles).toContain('real');
      expect(store.state.shownToggles).not.toContain('fakeShow');
      expect(store.state.peekToggles).not.toContain('fakePeek');
    });
  });
});
