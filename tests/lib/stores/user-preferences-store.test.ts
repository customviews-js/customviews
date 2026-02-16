import { describe, it, expect, beforeEach } from 'vitest';
import { UserPreferencesStore } from '$lib/stores/user-preferences-store.svelte';
import { SiteConfigStore } from '$lib/stores/site-config-store.svelte';
import type { Config } from '$lib/types/index';

const mockConfig: Config = {
  toggles: [
    { toggleId: 'shown-default', default: 'show' },
    { toggleId: 'peek-default', default: 'peek' },
    { toggleId: 'hidden-default', default: 'hide' },
  ],
  tabGroups: [
    { groupId: 'g1', tabs: [{ tabId: 't1' }, { tabId: 't2' }], default: 't1' },
    { groupId: 'g2', tabs: [{ tabId: 't3' }, { tabId: 't4' }] }, // No default, should pick first
  ],
};

describe('UserPreferencesStore', () => {
  let configStore: SiteConfigStore;
  let store: UserPreferencesStore;

  beforeEach(() => {
    configStore = new SiteConfigStore(mockConfig);
    store = new UserPreferencesStore(() => configStore.config);
  });

  describe('Default State Computation', () => {
    it('should compute default toggles correctly', () => {
        expect(store.state.shownToggles).toContain('shown-default');
        expect(store.state.shownToggles).not.toContain('peek-default');
        expect(store.state.shownToggles).not.toContain('hidden-default');

        expect(store.state.peekToggles).toContain('peek-default');
    });

    it('should compute default tabs correctly', () => {
        expect(store.state.tabs?.['g1']).toBe('t1');
        
        // Should fallback to first tab if no default
        expect(store.state.tabs?.['g2']).toBe('t3');
    });
  });

  describe('Actions', () => {
    it('should update pinned tab', () => {
        store.setPinnedTab('g1', 't2');
        expect(store.state.tabs?.['g1']).toBe('t2');
    });

    it('should set toggles explicitly', () => {
        store.setToggles(['hidden-default'], []);
        expect(store.state.shownToggles).toEqual(['hidden-default']);
        expect(store.state.peekToggles).toEqual([]);
    });

    it('should apply external state (merging with defaults)', () => {
        // State that only overrides g1 tab
        store.applyState({ tabs: { g1: 't2' } });

        // Should keep defaults for others
        expect(store.state.tabs?.['g2']).toBe('t3');
        expect(store.state.shownToggles).toContain('shown-default');
        
        // Should have updated g1
        expect(store.state.tabs?.['g1']).toBe('t2');
    });

    it('should reset to defaults', () => {
        store.setPinnedTab('g1', 't2');
        store.setToggles([], []);
        
        store.reset();
        
        expect(store.state.tabs?.['g1']).toBe('t1');
        expect(store.state.shownToggles).toContain('shown-default');
    });
  });
});
