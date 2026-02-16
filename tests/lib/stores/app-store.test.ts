import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppStore } from '$lib/stores/app-store.svelte';
import type { Config } from '$lib/types/index';

const mockConfig: Config = {
  // Minimal config
  tabGroups: [{ groupId: 'g1', tabs: [{ tabId: 't1' }, { tabId: 't2' }], default: 't1' }]
};

describe('AppStore', () => {
    let appStore: AppStore;

    beforeEach(() => {
        appStore = new AppStore(mockConfig);
    });

    it('should initialize all sub-stores', () => {
        expect(appStore.siteConfig).toBeDefined();
        expect(appStore.userPreferences).toBeDefined();
        expect(appStore.registry).toBeDefined();
        expect(appStore.interfaceSettings).toBeDefined();
        expect(appStore.placeholderSync).toBeDefined();
    });

    it('should delegate setPinnedTab to userPreferences and placeholderSync', () => {
        const spyUserPref = vi.spyOn(appStore.userPreferences, 'setPinnedTab');
        const spyPlaceholderSync = vi.spyOn(appStore.placeholderSync, 'onTabChanged');
        
        appStore.setPinnedTab('g1', 't2');
        
        expect(spyUserPref).toHaveBeenCalledWith('g1', 't2');
        expect(spyPlaceholderSync).toHaveBeenCalledWith('g1', 't2');
    });

    it('should delegate reset to all stores', () => {
        const spyUserPref = vi.spyOn(appStore.userPreferences, 'reset');
        const spyInterfaceSettings = vi.spyOn(appStore.interfaceSettings, 'reset');
        
        appStore.reset();
        
        expect(spyUserPref).toHaveBeenCalled();
        expect(spyInterfaceSettings).toHaveBeenCalled();
    });

    it('init() should update configuration', () => {
        const newConfig = { toggles: [] };
        appStore.init({ config: newConfig });
        
        expect(appStore.siteConfig.config).toEqual(newConfig);
    });
});

