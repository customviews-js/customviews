// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { determineHiddenElements, isElementExcluded, calculateDividerGroups } from '$features/focus/focus-logic';

describe('focus-logic', () => {
    describe('determineHiddenElements', () => {
        let root: HTMLElement;
        let container: HTMLElement;
        let target: HTMLElement;
        let sibling1: HTMLElement;
        let sibling2: HTMLElement;
        let unrelated: HTMLElement;

        beforeEach(() => {
            root = document.createElement('div');
            root.id = 'root';
            
            container = document.createElement('div');
            container.id = 'container';
            
            target = document.createElement('p');
            target.id = 'target';
            
            sibling1 = document.createElement('p');
            sibling1.id = 'sibling1';
            
            sibling2 = document.createElement('p');
            sibling2.id = 'sibling2';
            
            unrelated = document.createElement('div'); // Sibling of container
            unrelated.id = 'unrelated';
            
            // Structure:
            // root
            //   - container
            //       - sibling1
            //       - target
            //       - sibling2
            //   - unrelated
            
            container.appendChild(sibling1);
            container.appendChild(target);
            container.appendChild(sibling2);
            root.appendChild(container);
            root.appendChild(unrelated);
        });

        const alwaysFalse = () => false;

        it('should hide siblings of elements on the path', () => {
            const hidden = determineHiddenElements([target], root, alwaysFalse);
            
            // Sibling 1&2 should be hidden (siblings of target)
            // Unrelated should be hidden (sibling of container)
            expect(hidden.has(sibling1)).toBe(true);
            expect(hidden.has(sibling2)).toBe(true);
            expect(hidden.has(unrelated)).toBe(true);
            expect(hidden.has(container)).toBe(false);
            expect(hidden.has(target)).toBe(false);
        });
        
        it('should NOT hide children of a target (Parent Dominance)', () => {
             const hidden = determineHiddenElements([container], root, alwaysFalse);
             
             // Container is target.
             // Unrelated should be hidden (sibling of container).
             expect(hidden.has(unrelated)).toBe(true);
             
             // Children of container should NOT be hidden
             expect(hidden.has(sibling1)).toBe(false);
             expect(hidden.has(target)).toBe(false);
             expect(hidden.has(sibling2)).toBe(false);
        });

        it('should respect excluded callback', () => {
            const isUnrelated = (el: HTMLElement) => el.id === 'unrelated';
            const hidden = determineHiddenElements([target], root, isUnrelated);
            
            expect(hidden.has(unrelated)).toBe(false); // Excluded
            expect(hidden.has(sibling1)).toBe(true);
        });
        
        it('should work with root as body', () => {
             document.body.appendChild(root);
             const hidden = determineHiddenElements([target], document.body, alwaysFalse);
             
             // Since root is child of body, root's siblings (if any in jsdom default) would be hidden.
             // But inside root, logic applies.
             // Note: determineHiddenElements takes 'root' param. If we pass document.body, it expects path up to body.
             // Our path is target -> container -> root -> body.
             
             expect(hidden.has(sibling1)).toBe(true);
             document.body.removeChild(root);
        });
    });

    describe('isElementExcluded', () => {
        const mockOptions = {
            hiddenElements: new Set<HTMLElement>(),
            excludedTags: new Set(['HEADER', 'NAV']),
            excludedIds: new Set(['exclude-me'])
        };

        it('should exclude elements in hiddenElements set', () => {
            const el = document.createElement('div');
            mockOptions.hiddenElements.add(el);
            expect(isElementExcluded(el, mockOptions)).toBe(true);
        });

        it('should exclude elements with excluded tags', () => {
            const el = document.createElement('header');
            expect(isElementExcluded(el, mockOptions)).toBe(true);
        });

        it('should exclude elements with excluded IDs', () => {
            const el = document.createElement('div');
            el.id = 'exclude-me';
            expect(isElementExcluded(el, mockOptions)).toBe(true);
        });

        it('should exclude aria-hidden elements', () => {
            const el = document.createElement('div');
            el.setAttribute('aria-hidden', 'true');
            expect(isElementExcluded(el, mockOptions)).toBe(true);
        });

        it('should exclude Toast containers (by class)', () => {
            const container = document.createElement('div');
            container.classList.add('toast-container');
            const el = document.createElement('div');
            container.appendChild(el);
            expect(isElementExcluded(el, mockOptions)).toBe(true);
        });

        it('should NOT exclude a regular div', () => {
             const el = document.createElement('div');
             expect(isElementExcluded(el, mockOptions)).toBe(false);
        });
    });

    describe('calculateDividerGroups', () => {
        it('should group continuous hidden elements', () => {
             const c1 = document.createElement('div');
             const c2 = document.createElement('div'); // hidden
             const c3 = document.createElement('div'); // hidden
             const c4 = document.createElement('div');
             const children = [c1, c2, c3, c4];
             
             const isHidden = (el: HTMLElement) => el === c2 || el === c3;
             
             const groups = calculateDividerGroups(children, isHidden);
             
             expect(groups.length).toBe(1);
             expect(groups[0]!.count).toBe(2);
             expect(groups[0]!.startNode).toBe(c2);
             expect(groups[0]!.insertBefore).toBe(c4);
        });

        it('should handle hidden elements at the end', () => {
             const c1 = document.createElement('div');
             const c2 = document.createElement('div'); // hidden
             const children = [c1, c2];
             
             const isHidden = (el: HTMLElement) => el === c2;
             
             const groups = calculateDividerGroups(children, isHidden);
             
             expect(groups.length).toBe(1);
             expect(groups[0]!.count).toBe(1);
             expect(groups[0]!.startNode).toBe(c2);
             expect(groups[0]!.insertBefore).toBe(c2); // trailing inserts appear before startNode? logic check
        });

        it('should handle separate groups', () => {
             const c1 = document.createElement('div'); // hidden
             const c2 = document.createElement('div');
             const c3 = document.createElement('div'); // hidden
             const children = [c1, c2, c3];
             
             const isHidden = (el: HTMLElement) => el === c1 || el === c3;
             
             const groups = calculateDividerGroups(children, isHidden);
             
             expect(groups.length).toBe(2);
             
             // First group (start)
             expect(groups[0]!.count).toBe(1);
             expect(groups[0]!.startNode).toBe(c1);
             expect(groups[0]!.insertBefore).toBe(c2);
             
             // Second group (end)
             expect(groups[1]!.count).toBe(1);
             expect(groups[1]!.startNode).toBe(c3);
             expect(groups[1]!.insertBefore).toBe(c3);
        });
    });

    describe('Regression Tests', () => {
        const mockExcluded = (el: HTMLElement) => isElementExcluded(el, {
            hiddenElements: new Set(),
            excludedTags: new Set(['HEADER', 'NAV']),
            excludedIds: new Set(),
        });

        it('should hide a sibling that contains a nav if it is not a structural layout element', () => {
            // Scenario: Root -> [Target, Sibling]. Sibling -> [Nav].
            // Issue: Sibling was being excluded just because it contained a nav.
            
            const root = document.createElement('div');
            const target = document.createElement('div');
            target.id = 'target';
            const sibling = document.createElement('div');
            sibling.id = 'sibling';
            const nav = document.createElement('nav');
            sibling.appendChild(nav);
            
            root.appendChild(target);
            root.appendChild(sibling);
            
            const targets = [target];
            
            const hidden = determineHiddenElements(targets, root, mockExcluded);
            
            expect(hidden.has(sibling)).toBe(true);
        });

        it('should hide non-selected elements in a deep hierarchy', () => {
            // Root -> A -> B -> Target
            // Root -> C (should hide)
            // A -> D (should hide)
            
            const root = document.createElement('div');
            const mkDiv = (id: string) => { const d = document.createElement('div'); d.id = id; return d; };
            
            const A = mkDiv('A');
            const B = mkDiv('B');
            const Target = mkDiv('Target');
            const C = mkDiv('C');
            const D = mkDiv('D');
            
            root.append(A, C);
            A.append(B, D);
            B.append(Target);
            
            const targets = [Target];
            
            const hidden = determineHiddenElements(targets, root, mockExcluded);
            
            expect(hidden.has(C)).toBe(true);
            expect(hidden.has(D)).toBe(true);
            expect(hidden.has(A)).toBe(false);
            expect(hidden.has(B)).toBe(false);
        });

        it('should hide a sibling nav element (sidebar behavior)', () => {
             const root = document.createElement('div');
             const content = document.createElement('div');
             const sidebar = document.createElement('nav');
             root.appendChild(content);
             root.appendChild(sidebar);
             
             // We use the ACTUAL default exclusions for this test to prove the regression
             // But we can't import the constant easily in this scope if we want to rely on the function logic.
             // We will simulate the default options where NAV is passed in excludedTags.
             // However, since we fixed the logic, we want to ensure that even IF it were excluded,
             // our new logic doesn't rely on that? 
             // Actually, the fix was removing NAV from defaults.
             // So we just want to test that a NAV element IS hidden with the NEW default options (simulated).
             
             const optionsWithoutNav = {
                 hiddenElements: new Set<HTMLElement>(),
                 excludedTags: new Set(['HEADER', 'FOOTER']), 
                 excludedIds: new Set<string>(),
             };
             
             const isExcludedFix = (el: HTMLElement) => isElementExcluded(el, optionsWithoutNav);
             const hidden = determineHiddenElements([content], root, isExcludedFix);
             
             expect(hidden.has(sidebar)).toBe(true);
        });
    });
});
