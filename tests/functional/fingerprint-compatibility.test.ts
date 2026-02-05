/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as DomElementLocator from '../../src/lib/utils/dom-element-locator';

/**
 * Fingerprint Regression Test
 *
 * This test file ensures that the element fingerprinting (descriptor generation and resolution)
 * remains backward compatible. It verifies that a fixed, static HTML structure produces
 * specific descriptors, AND that specific legacy descriptors can resolve back to the correct elements.
 *
 * If these tests fail, it means we have broken existing share links (e.g. pinned tabs, deep links).
 */
describe('Fingerprint Regression', () => {
  let container: HTMLElement;

  // 1. Define a Static HTML Fixture
  // This represents a "snapshot" of a real application state.
  // It should contain various edge cases: nested elements, IDs, repeated tags, unicode.
  const STATIC_HTML = `
        <div id="app-root">
            <header>
                <h1>Welcome to CustomViews</h1>
            </header>
            <main>
                <div id="content-area">
                    <section class="intro">
                        <p>Intro paragraph one.</p>
                        <p>Intro paragraph two with <strong>bold</strong> text.</p>
                    </section>
                    <section id="features">
                        <h2>Features</h2>
                        <ul>
                            <li>Feature A</li>
                            <li>Feature B</li>
                            <li>Feature C (with unicode 🚀)</li>
                        </ul>
                        <p>Feature summary.</p>
                    </section>
                </div>
                <aside>
                    <div id="sidebar">
                        <p>Sidebar content</p>
                    </div>
                </aside>
            </main>
        </div>
    `;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = STATIC_HTML;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // 2. Define Hardcoded Legacy Descriptors
  // These represent descriptors that might have been generated in the past and stored in URLs.
  // KEY RULE: Do NOT update these values just to make tests pass.
  // If you have to update them, you are breaking backward compatibility.
  const LEGACY_DESCRIPTORS = {
    introPara2: {
      desc: {
        tag: 'P',
        index: 1, // 2nd P in intro
        parentId: 'content-area',
        textSnippet: 'Intro paragraph two with bold te', // text is normalized
        textHash: -461415290,
        elementId: undefined,
      },
      expectedText: 'Intro paragraph two with bold text.',
    },
    featureC: {
      desc: {
        tag: 'LI',
        index: 2,
        parentId: 'features',
        textSnippet: 'Feature C (with unicode 🚀)',
        textHash: -127466550,
        elementId: undefined,
      },
      expectedText: 'Feature C (with unicode 🚀)',
    },
    sidebarPara: {
      desc: {
        tag: 'P',
        index: 0,
        parentId: 'sidebar',
        textSnippet: 'Sidebar content',
        textHash: -988383339,
        elementId: undefined,
      },
      expectedText: 'Sidebar content',
    },
  };

  /**
   * Helper to compute hash manually if needed for debugging
   * (We don't use the library's hash function in the test data to ensure the ALGORITHM
   * itself hasn't changed in a way that produces different hashes for the same text).
   *
   * Located in @dom-element-locator.ts
   */
  function manualHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }

  it('should calculate expected hashes (Sanity Check)', () => {
    // This test ensures our manual hash function in the test file matches the one used
    // to generate the LEGACY_DESCRIPTORS, confirming the test data itself is valid.

    // P2: "Intro paragraph two with bold text." (normalized spaces)
    expect(manualHash('Intro paragraph two with bold text.')).toBe(-461415290);

    // Feature C
    expect(manualHash('Feature C (with unicode 🚀)')).toBe(-127466550);

    // Sidebar
    expect(manualHash('Sidebar content')).toBe(-988383339);
  });

  it('should resolve Intro Paragraph 2 from legacy descriptor', () => {
    const { desc, expectedText } = LEGACY_DESCRIPTORS.introPara2;
    const resolved = DomElementLocator.resolve(container, desc as any);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.textContent).toBe(expectedText);
  });

  it('should resolve Feature C (Unicode) from legacy descriptor', () => {
    const { desc, expectedText } = LEGACY_DESCRIPTORS.featureC;
    const resolved = DomElementLocator.resolve(container, desc as any);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.textContent).toBe(expectedText);
  });

  it('should resolve Sidebar Paragraph from legacy descriptor', () => {
    const { desc, expectedText } = LEGACY_DESCRIPTORS.sidebarPara;
    const resolved = DomElementLocator.resolve(container, desc as any);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.textContent).toBe(expectedText);
  });

  it('should fail gracefully if content changes significantly', () => {
    // Change both Hash and Snippet to ensure score drops low enough
    const changedDesc = {
      ...LEGACY_DESCRIPTORS.introPara2.desc,
      textHash: 12345,
      textSnippet: 'Different snippet content here',
    };
    const resolved = DomElementLocator.resolve(container, changedDesc as any);
    // Score: Index(10) + Hash(0) + Snippet(0) = 10.
    // 10 <= threshold(30). Expect no results.
    expect(resolved).toHaveLength(0);
  });

  it('should still resolve if index changes but content remains (Robustness Check)', () => {
    // Mutate DOM: Insert a P before the target
    const introSection = container.querySelector('.intro')!;
    const prePara = document.createElement('p');
    prePara.textContent = 'New inserted paragraph.';
    introSection.insertBefore(prePara, introSection.firstChild);

    // Now "Intro paragraph two..." is at index 2, but descriptor says index 1.

    const { desc, expectedText } = LEGACY_DESCRIPTORS.introPara2;
    const resolved = DomElementLocator.resolve(container, desc as any);

    // Should succeed based on High Score from Hash Match (50) + Snippet (30) = 80 > 60 (Perfect)
    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.textContent).toBe(expectedText);
  });
});
