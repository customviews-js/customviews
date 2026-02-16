import { describe, it, expect, beforeEach } from 'vitest';
import { InterfaceSettingsStore } from '$lib/stores/interface-settings-store.svelte';

describe('InterfaceSettingsStore', () => {
    let store: InterfaceSettingsStore;

    beforeEach(() => {
        store = new InterfaceSettingsStore();
    });

    it('should have default values', () => {
        expect(store.options.showTabGroups).toBe(true);
        expect(store.options.title).toBe('Customize View');
        expect(store.isTabGroupNavHeadingVisible).toBe(true);
    });

    it('should update options partially', () => {
        store.updateOptions({ title: 'New Title' });
        
        expect(store.options.title).toBe('New Title');
        expect(store.options.showTabGroups).toBe(true); // preserved
    });

    it('should reset options', () => {
        store.updateOptions({ showTabGroups: false, title: 'Changed' });
        store.isTabGroupNavHeadingVisible = false;
        
        store.reset();
        
        expect(store.options.showTabGroups).toBe(true);
        expect(store.options.title).toBe('Customize View');
        expect(store.isTabGroupNavHeadingVisible).toBe(true);
    });
});
