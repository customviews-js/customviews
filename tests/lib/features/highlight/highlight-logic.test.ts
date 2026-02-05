// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { groupSiblings, calculateMergedRects, type SimpleRect } from '$features/highlight/highlight-logic';
import { SvelteMap } from 'svelte/reactivity';

describe('highlight-logic', () => {
    describe('groupSiblings', () => {
        it('should group siblings together', () => {
            const parent = document.createElement('div');
            const child1 = document.createElement('p');
            const child2 = document.createElement('p');
            parent.appendChild(child1);
            parent.appendChild(child2);

            const independent = document.createElement('div');
            
            const groups = groupSiblings([child1, independent, child2]);
            
            expect(groups.size).toBe(2);
            expect(groups.get(parent)?.length).toBe(2);
            expect(groups.get(document.body)?.length).toBe(1); // Default parent for independent
        });
    });

    describe('calculateMergedRects', () => {
        const mockGetRect = (el: HTMLElement): SimpleRect => {
            // Encode rect in dataset for testing
            const data = el.dataset.rect;
            if (data) {
                const [top, left, width, height] = data.split(',').map(Number);
                return { top, left, width, height } as any;
            }
            return { top: 0, left: 0, width: 0, height: 0 };
        };

        const mockGetScroll = () => ({ scrollTop: 0, scrollLeft: 0 });

        it('should merge adjacent siblings', () => {
            const parent = document.createElement('div');
            const el1 = document.createElement('div');
            el1.dataset.rect = "10,10,100,20"; // top 10, left 10, w 100, h 20 -> bottom 30, right 110
            const el2 = document.createElement('div');
            el2.dataset.rect = "40,10,100,20"; // top 40 ... (gap of 10px) - wait, logic merges adjacency in DOM order, not strictly spatial intersection?
            
            // Logic says it scans siblings. If they are adjacent in list AND DOM, it groups them?
            // "if (child instanceof HTMLElement && siblingsSet.has(child))" -> If they are contiguous in DOM children list.
            
            parent.appendChild(el1);
            parent.appendChild(el2);
            
            const groups = new SvelteMap<HTMLElement, HTMLElement[]>();
            groups.set(parent, [el1, el2]);

            const rects = calculateMergedRects(groups, mockGetRect, mockGetScroll);
            
            // Should be 1 merged rect because they are adjacent siblings in DOM order and both in set.
            expect(rects.length).toBe(1);
            
            // Bounds: minTop 10, maxBottom 60 (40+20)
            // But wait, there is padding logic +10.
            // minTop 10 -> -10 padding = 0
            // maxBottom 60 -> +10 padding = 70
            // height = 70 - 0 = 70.
            
            expect(rects[0]).toBeDefined();
            expect(rects[0]!.top).toBe(0); // 10 - 10
            expect(rects[0]!.height).toBe(70); // (60+10) - (10-10) = 70
        });

        it('should separate non-contiguous siblings', () => {
            const parent = document.createElement('div');
            const el1 = document.createElement('div');
            const gap = document.createElement('div'); // Not selected
            const el2 = document.createElement('div');
            
            parent.appendChild(el1);
            parent.appendChild(gap);
            parent.appendChild(el2);
            
            const groups = new SvelteMap<HTMLElement, HTMLElement[]>();
            groups.set(parent, [el1, el2]);

            const rects = calculateMergedRects(groups, mockGetRect, mockGetScroll);
            
            expect(rects.length).toBe(2);
        });
    });
});
