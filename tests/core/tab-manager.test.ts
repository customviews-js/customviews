import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { TabManager } from '../../src/core/tab-manager';

// Set up DOM for testing
let dom: JSDOM;
let document: Document;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  document = dom.window.document;
  global.document = document as any;
  global.window = dom.window as any;
});

afterEach(() => {
  // Clean up
  document.body.innerHTML = '';
});

describe('TabManager.splitTabIds', () => {
  it('splits space-separated IDs', () => {
    const result = TabManager['splitTabIds']('linux mac');
    expect(result).toEqual(['linux', 'mac']);
  });

  it('splits pipe-separated IDs', () => {
    expect(TabManager['splitTabIds']('linux|mac')).toEqual(['linux', 'mac']);
  });

  it('splits mixed space and pipe', () => {
    expect(TabManager['splitTabIds']('linux | mac windows')).toEqual(['linux', 'mac', 'windows']);
  });

  it('trims whitespace', () => {
    expect(TabManager['splitTabIds']('  linux   |  mac  ')).toEqual(['linux', 'mac']);
  });

  it('returns single ID', () => {
    expect(TabManager['splitTabIds']('windows')).toEqual(['windows']);
  });

  it('returns empty array for empty string', () => {
    expect(TabManager['splitTabIds']('')).toEqual([]);
  });
});

describe('TabManager - Alternative Syntax (cv-tab-header & cv-tab-body)', () => {
  
  describe('extractTabContent()', () => {
    it('should extract header content from <cv-tab-header>', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `
        <cv-tab-header>My Header</cv-tab-header>
        <cv-tab-body>My Body</cv-tab-body>
      `;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result).not.toBeNull();
      expect(result?.headerHTML).toBe('My Header');
    });

    it('should return null if <cv-tab-header> not present', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `<div>Some content</div>`;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result).toBeNull();
    });

    it('should handle empty <cv-tab-header>', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `<cv-tab-header></cv-tab-header>`;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result).not.toBeNull();
      expect(result?.headerHTML).toBe('');
    });

    it('should extract <cv-tab-body> element', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `
        <cv-tab-header>Header</cv-tab-header>
        <cv-tab-body>Body Content</cv-tab-body>
      `;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result?.bodyEl).not.toBeNull();
      expect(result?.bodyEl?.textContent).toContain('Body Content');
    });

    it('should handle missing <cv-tab-body>', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `<cv-tab-header>Header</cv-tab-header>`;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result?.bodyEl).toBeNull();
    });

    it('should preserve HTML tags in extracted header', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `
        <cv-tab-header><strong>Bold</strong> Header</cv-tab-header>
        <cv-tab-body>Content</cv-tab-body>
      `;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result?.headerHTML).toContain('<strong>');
      expect(result?.headerHTML).toContain('</strong>');
    });

    it('should handle whitespace trimming in header', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `
        <cv-tab-header>
          Header with spaces
        </cv-tab-header>
      `;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      // trim() should remove leading/trailing whitespace
      expect(result?.headerHTML).toBe('Header with spaces');
    });

    it('should only extract direct child <cv-tab-header>, not nested ones', () => {
      const tabEl = document.createElement('div');
      tabEl.innerHTML = `
        <cv-tab-header>Direct Header</cv-tab-header>
        <div>
          <cv-tab-header>Nested Header (should not be used)</cv-tab-header>
        </div>
      `;
      
      const result = TabManager['extractTabContent'](tabEl);
      
      expect(result?.headerHTML).toBe('Direct Header');
    });
  });
});
