import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { ToggleManager } from '../../src/core/toggle-manager';
import { AssetsManager } from '../../src/core/assets-manager';

// Set up DOM for testing
let dom: JSDOM;
let document: Document;
let root: HTMLElement;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
  document = dom.window.document;
  root = document.getElementById('root')!;
  global.document = document as any;
  global.window = dom.window as any;
});

afterEach(() => {
  // Clean up
  document.body.innerHTML = '';
});

describe('ToggleManager.initializeToggles', () => {
  it('should render toggle content only once', () => {
    // 1. Setup
    const toggleEl = document.createElement('div');
    toggleEl.dataset.cvToggle = 'my-toggle';
    toggleEl.dataset.cvId = 'my-asset';
    root.appendChild(toggleEl);

    const assetsManager = new AssetsManager({ 'my-asset': { content: 'Hello, Toggle!' } });

    // 2. First call - should render
    ToggleManager.initializeToggles(root, ['my-toggle'], assetsManager);

    // 3. Assert first call
    expect(toggleEl.textContent).toBe('Hello, Toggle!');
    expect(toggleEl.dataset.cvRendered).toBe('true');

    // 4. Second call - should not render again
    // Let's change the asset content to see if it gets updated
    assetsManager.loadAdditionalAssets({ 'my-asset': { content: 'New Content!' } });
    ToggleManager.initializeToggles(root, ['my-toggle'], assetsManager);

    // 5. Assert second call
    // The content should NOT have changed
    expect(toggleEl.textContent).toBe('Hello, Toggle!');
  });

  it('should not render content if toggle is not active', () => {
    const toggleEl = document.createElement('div');
    toggleEl.dataset.cvToggle = 'my-toggle';
    toggleEl.dataset.cvId = 'my-asset';
    root.appendChild(toggleEl);

    const assetsManager = new AssetsManager({ 'my-asset': { content: 'Hello, Toggle!' } });

    ToggleManager.initializeToggles(root, ['another-toggle'], assetsManager);

    expect(toggleEl.textContent).toBe('');
    expect(toggleEl.dataset.cvRendered).toBeUndefined();
  });

  it('should render content when toggle becomes active', () => {
    const toggleEl = document.createElement('div');
    toggleEl.dataset.cvToggle = 'my-toggle';
    toggleEl.dataset.cvId = 'my-asset';
    root.appendChild(toggleEl);

    const assetsManager = new AssetsManager({ 'my-asset': { content: 'Hello, Toggle!' } });

    // Initially not active
    ToggleManager.initializeToggles(root, ['another-toggle'], assetsManager);
    expect(toggleEl.textContent).toBe('');
    expect(toggleEl.dataset.cvRendered).toBeUndefined();

    // Now it becomes active
    ToggleManager.initializeToggles(root, ['my-toggle'], assetsManager);
    expect(toggleEl.textContent).toBe('Hello, Toggle!');
    expect(toggleEl.dataset.cvRendered).toBe('true');
  });
});
