// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock main store
vi.mock('../../src/core/stores/main-store.svelte', () => {
    return {
        store: {
            registerPlaceholder: vi.fn()
        }
    };
});

// Mock the store BEFORE importing the subject under test
vi.mock('../../src/core/stores/placeholder-registry-store.svelte', () => {
    return {
        placeholderRegistryStore: {
            definitions: [],
            register: vi.fn(),
            get: vi.fn(),
            has: vi.fn()
        }
    };
});

import { PlaceholderBinder } from '../../src/core/services/placeholder-binder';
// Import the mocked store if we need to manipulate it
import { placeholderRegistryStore } from '../../src/core/stores/placeholder-registry-store.svelte';

// Fix for Svelte modules if needed, but we are importing logic not components.

describe('PlaceholderBinder', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.restoreAllMocks();
    });

    describe('scanAndHydrate', () => {
        it('should hydrate text nodes with placeholders', () => {
            container.innerHTML = '<p>Hello [[name]]!</p>';
            PlaceholderBinder.scanAndHydrate(container);

            const el = container.querySelector('cv-placeholder') as HTMLElement;
            expect(el).not.toBeNull();
            expect(el.getAttribute('name')).toBe('name');
        });

        it('should handle fallback values', () => {
            container.innerHTML = '<p>Value: [[key : default]]</p>';
            PlaceholderBinder.scanAndHydrate(container);
            
            const el = container.querySelector('cv-placeholder') as HTMLElement;
            expect(el.getAttribute('name')).toBe('key');
            expect(el.getAttribute('fallback')).toBe('default');
        });

        it('should identify attribute bindings via .cv-bind class', () => {
            container.innerHTML = '<a href="https://example.com?q=[[query]]" class="cv-bind">Link</a>';
            PlaceholderBinder.scanAndHydrate(container);
            
            const a = container.querySelector('a')!;
            expect(a.dataset.cvAttrTemplates).toBeDefined();
            const templates = JSON.parse(a.dataset.cvAttrTemplates!);
            expect(templates.href).toBe('https://example.com?q=[[query]]');
        });
        
        it('should identify attribute bindings via data-cv-bind attribute', () => {
             container.innerHTML = '<img src="img/[[id]].png" data-cv-bind>';
             PlaceholderBinder.scanAndHydrate(container);
             
             const img = container.querySelector('img')!;
             expect(img.dataset.cvAttrTemplates).toBeDefined();
        });

        it('should NOT identify attributes on elements without marker', () => {
            container.innerHTML = '<a href="https://example.com/[[id]]">Ignored</a>';
            PlaceholderBinder.scanAndHydrate(container);
            
            const a = container.querySelector('a')!;
            expect(a.dataset.cvAttrTemplates).toBeUndefined();
        });
    });

    describe('updateAll', () => {
        // Note: updateAll no longer updates text nodes directly.
        // Therefore there is no test here for text update.

        it('should update attributes with URI encoding for href', () => {
            container.innerHTML = '<a href="https://search.com?q=[[term]]" class="cv-bind">Search</a>';
            PlaceholderBinder.scanAndHydrate(container); // Setup templates
            
            // "hello world" -> "hello%20world"
            PlaceholderBinder.updateAll({ term: 'hello world' });
            
            const a = container.querySelector('a')!;
            expect(a.getAttribute('href')).toBe('https://search.com?q=hello%20world');
        });
        
        it('should update attributes WITHOUT encoding for non-url attributes', () => {
             container.innerHTML = '<div data-value="[[val]]" class="cv-bind"></div>';
             PlaceholderBinder.scanAndHydrate(container);
             
             // "foo bar" -> "foo bar" (no encoding expected for general attrs?)
             // Wait, the code only checks 'href' and 'src' for encoding.
             PlaceholderBinder.updateAll({ val: 'foo bar' });
             
             const div = container.querySelector('div')!;
             expect(div.getAttribute('data-value')).toBe('foo bar');
        });


    });
});
