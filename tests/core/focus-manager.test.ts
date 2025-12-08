
// @vitest-environment jsdom
import { FocusManager } from '../../src/core/focus-manager';
import { AnchorEngine } from '../../src/core/anchor-engine';
import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from '../../src/core/config';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FocusManager', () => {
    let container: HTMLElement;
    let focusManager: FocusManager;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-root';
        document.body.appendChild(container);

        // Setup basic DOM structure
        container.innerHTML = `
      <div id="section-1" class="section">
        <p id="p1">Paragraph 1 (Visible)</p>
        <p id="p2">Paragraph 2 (Hidden)</p>
        <p id="p3">Paragraph 3 (Visible)</p>
        <div id="p4-wrapper">
             <p id="p4">Paragraph 4 (Visible / Nested)</p>
        </div>
      </div>
      <div id="section-2" class="section">
         <p>Irrelevant</p>
      </div>
      <header id="page-header">My Header</header>
      <nav id="page-nav">My Nav</nav>
    `;

        focusManager = new FocusManager(document.body, {
            excludedTags: DEFAULT_EXCLUDED_TAGS,
            excludedIds: DEFAULT_EXCLUDED_IDS
        });
    });

    afterEach(() => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        focusManager.exitFocusMode();
    });

    it('should apply focus mode and hide irrelevant siblings', () => {
        // We want p1 and p3 visible. p2 should be hidden.
        // p1 descriptor
        const p1 = document.getElementById('p1')!;
        const p3 = document.getElementById('p3')!;

        // descriptors
        const descriptors = [
            AnchorEngine.createDescriptor(p1),
            AnchorEngine.createDescriptor(p3)
        ];

        const encoded = AnchorEngine.serialize(descriptors);

        // Simulate
        focusManager.applyFocusMode(encoded);

        const p2 = document.getElementById('p2')!;
        expect(p2.classList.contains('cv-focus-hidden')).toBe(true);
        expect(p1.classList.contains('cv-focused-element')).toBe(true);
        expect(p3.classList.contains('cv-focused-element')).toBe(true);
    });

    it('should insert dividers for hidden sections', () => {
        const p1 = document.getElementById('p1')!;
        const p3 = document.getElementById('p3')!;

        const descriptors = [
            AnchorEngine.createDescriptor(p1),
            AnchorEngine.createDescriptor(p3)
        ];
        focusManager.applyFocusMode(AnchorEngine.serialize(descriptors));

        const dividers = document.querySelectorAll('.cv-context-divider');
        expect(dividers.length).toBeGreaterThan(0);
        expect(dividers[0].textContent).toContain('1 section hidden');
    });

    it('should handle nested targets correctly', () => {
        // p4 is inside a wrapper.
        // If we focus p4, p4-wrapper should remain visible.
        // Siblings of p4-wrapper (if any) should be processing.

        const p4 = document.getElementById('p4')!;
        focusManager.applyFocusMode(AnchorEngine.serialize([AnchorEngine.createDescriptor(p4)]));

        const wrapper = document.getElementById('p4-wrapper')!;
        expect(wrapper.classList.contains('cv-focus-hidden')).toBe(false);

        // Check section-1 siblings? 
        // section-1 has children: p1, p2, p3, p4-wrapper.
        // p1, p2, p3 are siblings of p4-wrapper. They should be hidden?
        // Yes, because p4 is the target. p4-wrapper is an ancestor (keep visible).
        // Siblings of p4-wrapper (p1, p2, p3) are NOT targets and NOT ancestors.

        const p1 = document.getElementById('p1')!;
        expect(p1.classList.contains('cv-focus-hidden')).toBe(true);

        // Header and Nav should NOT be hidden
        const nav = document.getElementById('page-nav')!;
        expect(nav.classList.contains('cv-focus-hidden')).toBe(false);
    });

    it('should exit focus mode cleanly', () => {
        const p1 = document.getElementById('p1')!;
        focusManager.applyFocusMode(AnchorEngine.serialize([AnchorEngine.createDescriptor(p1)]));

        expect(document.body.classList.contains('cv-focus-mode')).toBe(true);

        focusManager.exitFocusMode();

        expect(document.body.classList.contains('cv-focus-mode')).toBe(false);
        const p2 = document.getElementById('p2')!;
        expect(p2.classList.contains('cv-focus-hidden')).toBe(false);
    });

    it('should not hide siblings of a child target if the parent is also a target', () => {
        // Scenario: User selects section-1 (parent) AND p1 (child).
        // Since section-1 is selected, we expect ALL its children to be visible.
        // Even though p1 is a target, logic shouldn't hide p1's siblings because section-1 is also a target.

        const section1 = document.getElementById('section-1')!;
        const p1 = document.getElementById('p1')!;

        const descriptors = [
            AnchorEngine.createDescriptor(section1),
            AnchorEngine.createDescriptor(p1)
        ];

        focusManager.applyFocusMode(AnchorEngine.serialize(descriptors));

        const p2 = document.getElementById('p2')!; // Sibling of p1
        const p3 = document.getElementById('p3')!; // Sibling of p1

        // p2 and p3 should NOT be hidden
        expect(p2.classList.contains('cv-focus-hidden')).toBe(false);
        expect(p3.classList.contains('cv-focus-hidden')).toBe(false);
    });
});
