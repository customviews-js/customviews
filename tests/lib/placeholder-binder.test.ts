// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaceholderBinder } from '../../src/lib/services/placeholder-binder';
import { store } from '../../src/lib/stores/main-store.svelte';

// Mock main store
vi.mock('../../src/lib/stores/main-store.svelte', () => {
  return {
    store: {
      registerPlaceholder: vi.fn(),
    },
  };
});

// Mock the store BEFORE importing the subject under test
vi.mock('../../src/lib/stores/placeholder-registry-store.svelte', () => {
  return {
    placeholderRegistryStore: {
      definitions: [],
      register: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
    },
  };
});

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

    it('should treat escaped placeholders as literal text', () => {
      container.innerHTML = '<p>This is \\[[escaped]] value</p>';
      PlaceholderBinder.scanAndHydrate(container);

      const el = container.querySelector('cv-placeholder');
      expect(el).toBeNull();
      expect(container.textContent).toBe('This is [[escaped]] value');
    });

    it('should NOT register escaped placeholders', () => {
      container.innerHTML = '<p>Raw: \\[[variable]]</p>';

      // Mock store register to verify it's NOT called
      vi.clearAllMocks();

      PlaceholderBinder.scanAndHydrate(container);

      expect(store.registerPlaceholder).not.toHaveBeenCalled();
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

  describe('Context-Aware URL Encoding', () => {
    it('should NOT encode full HTTP URLs', () => {
      container.innerHTML = '<a href="[[url]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ url: 'https://example.com/path?query=value' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://example.com/path?query=value');
    });

    it('should NOT encode full HTTPS URLs', () => {
      container.innerHTML = '<a href="[[website]]" class="cv-bind">Visit</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ website: 'https://example.com' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://example.com');
    });

    it('should NOT encode data URLs', () => {
      container.innerHTML = '<img src="[[dataurl]]" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ dataurl: 'data:image/png;base64,iVBORw0KGgo=' });

      const img = container.querySelector('img')!;
      expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
    });

    it('should NOT encode relative URLs starting with /', () => {
      container.innerHTML = '<a href="[[path]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ path: '/assets/images/logo.png' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('/assets/images/logo.png');
    });

    it('should NOT encode relative URLs starting with ./', () => {
      container.innerHTML = '<a href="[[relpath]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ relpath: './docs/guide.html' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('./docs/guide.html');
    });

    it('should NOT encode relative URLs starting with ../', () => {
      container.innerHTML = '<a href="[[uppath]]" class="cv-bind">Link</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ uppath: '../parent/file.html' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('../parent/file.html');
    });

    it('should encode URL components (query parameters)', () => {
      container.innerHTML = '<a href="https://search.com?q=[[query]]" class="cv-bind">Search</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ query: 'hello world' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://search.com?q=hello%20world');
    });

    it('should encode URL components (path segments)', () => {
      container.innerHTML = '<img src="/assets/[[theme]]/logo.png" class="cv-bind" />';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ theme: 'dark mode' });

      const img = container.querySelector('img')!;
      expect(img.getAttribute('src')).toBe('/assets/dark%20mode/logo.png');
    });

    it('should handle FTP URLs', () => {
      container.innerHTML = '<a href="[[ftpurl]]" class="cv-bind">Download</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ ftpurl: 'ftp://files.example.com/downloads/file.zip' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('ftp://files.example.com/downloads/file.zip');
    });

    it('should handle mailto URLs', () => {
      container.innerHTML = '<a href="[[email]]" class="cv-bind">Email</a>';
      PlaceholderBinder.scanAndHydrate(container);

      PlaceholderBinder.updateAll({ email: 'mailto:support@example.com' });

      const a = container.querySelector('a')!;
      expect(a.getAttribute('href')).toBe('mailto:support@example.com');
    });
  });
});
