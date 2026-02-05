// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { FocusStore } from '$features/focus/stores/focus-store.svelte';

describe('FocusStore', () => {
    let store: FocusStore;

    beforeEach(() => {
        store = new FocusStore();
    });

    it('should initialize inactive', () => {
        expect(store.isActive).toBe(false);
    });

    it('should set active state', () => {
        store.setIsActive(true);
        expect(store.isActive).toBe(true);
    });

    it('should exit (deactivate)', () => {
        store.setIsActive(true);
        store.exit();
        expect(store.isActive).toBe(false);
    });
});
