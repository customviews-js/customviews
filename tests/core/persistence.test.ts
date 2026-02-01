// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PersistenceManager } from '../../src/core/state/persistence';

describe('PersistenceManager', () => {
    
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Constructor & Prefixing', () => {
        it('should use empty prefix by default', () => {
            const manager = new PersistenceManager();
            manager.setItem('key', 'value');
            expect(localStorage.getItem('key')).toBe('value');
        });

        it('should use provided storageKey as prefix', () => {
            const manager = new PersistenceManager('my-app');
            manager.setItem('key', 'value');
            
            // Check raw localStorage to verify prefixing
            expect(localStorage.getItem('my-app-key')).toBe('value');
            expect(localStorage.getItem('key')).toBeNull();
        });

        it('should handle complex storage keys', () => {
            const manager = new PersistenceManager('scope/v1');
            manager.setItem('setting', '123');
            expect(localStorage.getItem('scope/v1-setting')).toBe('123');
        });
    });

    describe('Generic Accessors', () => {
        const manager = new PersistenceManager('test');

        it('should set and get items with prefix', () => {
            manager.setItem('foo', 'bar');
            expect(manager.getItem('foo')).toBe('bar');
            expect(localStorage.getItem('test-foo')).toBe('bar');
        });

        it('should return null for non-existent items', () => {
            expect(manager.getItem('nonexistent')).toBeNull();
        });

        it('should remove items with prefix', () => {
            manager.setItem('removable', 'data');
            manager.removeItem('removable');
            expect(manager.getItem('removable')).toBeNull();
            expect(localStorage.getItem('test-removable')).toBeNull();
        });
    });

    describe('State Accessors', () => {
        it('should persist and retrieve state object', () => {
            const manager = new PersistenceManager('app');
            const mockState: any = { 
                version: 1, 
                tabs: { 'tab1': { id: 'tab1', title: 'Tab 1', items: [] } } 
            };

            manager.persistState(mockState);
            
            const retrieved = manager.getPersistedState();
            expect(retrieved).toEqual(mockState);
            
            // Verify raw storage
            const raw = localStorage.getItem('app-customviews-state');
            expect(JSON.parse(raw!)).toEqual(mockState);
        });

        it('should handle null state', () => {
            const manager = new PersistenceManager();
            expect(manager.getPersistedState()).toBeNull();
            expect(manager.hasPersistedData()).toBe(false);
        });

        it('should correctly identify if persisted data exists', () => {
            const manager = new PersistenceManager();
            manager.persistState({} as any);
            expect(manager.hasPersistedData()).toBe(true);
        });
    });

    describe('Visibility Accessors', () => {
        it('should persist tab nav visibility as string boolean', () => {
            const manager = new PersistenceManager('ui');
            
            manager.persistTabNavVisibility(true);
            expect(manager.getPersistedTabNavVisibility()).toBe(true);
            expect(localStorage.getItem('ui-cv-tab-navs-visible')).toBe('true');

            manager.persistTabNavVisibility(false);
            expect(manager.getPersistedTabNavVisibility()).toBe(false);
            expect(localStorage.getItem('ui-cv-tab-navs-visible')).toBe('false');
        });

        it('should return null when visibility is not set', () => {
            const manager = new PersistenceManager();
            expect(manager.getPersistedTabNavVisibility()).toBeNull();
        });
    });

    describe('Clear All', () => {
        it('should clear only managed keys', () => {
            const manager = new PersistenceManager('clear-test');
            
            // Set managed keys
            manager.persistState({} as any);
            manager.persistTabNavVisibility(true);
            
            // Set unrelated key (simulating same prefix but different key, or different prefix)
            // Note: clearAll only clears specific known keys ('customviews-state', 'cv-tab-navs-visible')
            // It does NOT clear everything with the prefix currently.
            manager.setItem('other-key', 'keep-me');

            manager.clearAll();

            expect(manager.getPersistedState()).toBeNull();
            expect(manager.getPersistedTabNavVisibility()).toBeNull();
            
            // Should still exist because clearAll is hardcoded to specific keys
            expect(manager.getItem('other-key')).toBe('keep-me');
        });
    });
});
