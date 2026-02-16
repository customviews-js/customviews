import { describe, it, expect, beforeEach } from 'vitest';
import { AppStore } from '$lib/stores/app-store.svelte';
import { SettingsStore } from '$features/settings/stores/settings-store.svelte';
import type { Config } from '$lib/types/index';

const mockConfig: Config = {
  toggles: [
    { toggleId: 'test-toggle', default: 'show' },
    { toggleId: 'hidden-toggle', default: 'hide' },
  ],
  tabGroups: [
    { groupId: 'test-group', tabs: [{ tabId: 'tab-1' }, { tabId: 'tab-2' }], default: 'tab-1' },
  ],
};

describe('SettingsStore', () => {
    let appStore: AppStore;
    let settingsStore: SettingsStore;

    beforeEach(() => {
        appStore = new AppStore(mockConfig);
        settingsStore = new SettingsStore(appStore);
    });

    it('should derive menu toggles correctly', () => {
        // Initially, global toggles (not isLocal) should be in menu
        // In this mock, isLocal is undefined -> falsy -> !isLocal is true.
        // So all toggles should be visible.
        expect(settingsStore.menuToggles.length).toBe(2);

        // Add a local toggle to config
        const localToggle = { toggleId: 'local-1', isLocal: true } as any;
        appStore.siteConfig.setConfig({
            ...mockConfig,
            toggles: [...(mockConfig.toggles || []), localToggle]
        });
        
        // As a derived store, we might need to recreate settingsStore if appStore ref changes? 
        // No, appStore reference is const. siteConfig internal state changes.
        // But SettingsStore derived depends on appStore.siteConfig.config.toggles.
        
        // Before detection: local-1 should NOT be in menu
        expect(settingsStore.menuToggles.find(t => t.toggleId === 'local-1')).toBeUndefined();
        
        // Register detection
        appStore.registry.registerToggle('local-1');
        
        // After detection: local-1 SHOULD be in menu
        expect(settingsStore.menuToggles.find(t => t.toggleId === 'local-1')).toBeDefined();
    });

    it('should derive hasPageElements correctly', () => {
        expect(settingsStore.hasPageElements).toBe(false);
        appStore.registry.registerToggle('t1');
        expect(settingsStore.hasPageElements).toBe(true);
    });
});
