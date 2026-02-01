// @vitest-environment jsdom
import * as DomElementLocator from '../../src/core/utils/dom-element-locator';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock DOM environment is assumed (jsdom)

describe('DomElementLocator', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('createDescriptor', () => {
        it('should create a correct descriptor for a simple paragraph', () => {
            container.innerHTML = `
                <p>First paragraph</p>
                <p id="target">Target paragraph with specific text content.</p>
                <p>Third paragraph</p>
            `;
            const target = document.getElementById('target')!;
            const descriptor = DomElementLocator.createDescriptor(target);

            expect(descriptor.tag).toBe('P');
            expect(descriptor.index).toBe(1); // 0-indexed, so 2nd p is index 1
            expect(descriptor.parentId).toBe('test-container');
            // Check starts with because textSnippet is truncated
            expect(descriptor.textSnippet).toBe('Target paragraph with specific t'); // 32 chars
            expect(descriptor.textHash).not.toBe(0);
        });

        it('should correctly identify parent with ID', () => {
            container.innerHTML = `
                <div id="wrapper">
                    <section>
                        <p id="target">Nested paragraph</p>
                    </section>
                </div>
            `;
            const target = document.getElementById('target')!;
            const descriptor = DomElementLocator.createDescriptor(target);

            expect(descriptor.parentId).toBe('wrapper');
        });

        it('should normalize text content', () => {
            container.innerHTML = `
                <p id="target">  Lots   of    spaces   </p>
            `;
            const target = document.getElementById('target')!;
            const descriptor = DomElementLocator.createDescriptor(target);

            expect(descriptor.textSnippet).toBe('Lots of spaces');
        });
    });

    describe('serialization', () => {
        it('should serialize and deserialize correctly', () => {
            const original = {
                tag: 'DIV',
                index: 5,
                parentId: 'main-content',
                textSnippet: 'Some content snippet here',
                textHash: 123456
            };

            const serialized = DomElementLocator.serialize([original]);
            const deserializedList = DomElementLocator.deserialize(serialized);

            expect(deserializedList).toHaveLength(1);
            expect(deserializedList[0]).toEqual(original);
        });

        it('should handle unicode characters', () => {
            const original = {
                tag: 'P',
                index: 0,
                parentId: 'test',
                textSnippet: 'Hello 🌍', // Unicode!
                textHash: 123
            };

            const serialized = DomElementLocator.serialize([original]);
            const deserializedList = DomElementLocator.deserialize(serialized);

            expect(deserializedList[0].textSnippet).toBe('Hello 🌍');
        });
    });

    describe('resolve', () => {
        it('should resolve exact match with high score', () => {
            container.innerHTML = `
                <p>Wrong One</p>
                <p>Correct One</p>
                <p>Another Wrong One</p>
            `;
            const targetEl = container.querySelectorAll('p')[1] as HTMLElement;
            // Manually creating descriptor to simulate "previous state"
            const descriptor = DomElementLocator.createDescriptor(targetEl);

            const resolved = DomElementLocator.resolve(container, descriptor);
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toBe(targetEl);
        });

        it('should resolve even if index changes (Robustness)', () => {
            container.innerHTML = `
                <p>New Inserted Paragraph</p>
                <p>Wrong One</p>
                <p>Correct One</p>
            `;
            // Original descriptor was index 1, "Correct One"
            // Now "Correct One" is index 2.
            
            // We create a temporary element to get a valid hash/snippet
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = '<p>Correct One</p>';
            const baseDescriptor = DomElementLocator.createDescriptor(tempDiv.querySelector('p')!);
            
            const descriptor = {
                ...baseDescriptor,
                index: 1, // Old index (where "Wrong One" is now)
                parentId: 'test-container',
            };

            const resolved = DomElementLocator.resolve(container, descriptor);

            // Should still find it because content match
            expect(resolved).toHaveLength(1);
            expect(resolved[0]?.textContent).toBe('Correct One');
        });

        it('should return null if score is too low', () => {
            container.innerHTML = `<p>Completely different content</p>`;
            const descriptor = {
                tag: 'P',
                index: 5,
                parentId: 'test-container',
                textSnippet: 'Missing content',
                textHash: 99999
            };
            const resolved = DomElementLocator.resolve(container, descriptor);
            expect(resolved).toHaveLength(0);
        });
    });
});
