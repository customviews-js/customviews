// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getScrollTopOffset, scrollToElement } from '../../../src/lib/utils/scroll-utils';

describe('scroll-utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('getScrollTopOffset', () => {
    it('returns 0 when no header or custom elements exist', () => {
      expect(getScrollTopOffset()).toBe(0);
    });

    it('returns header height when header is fixed', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'fixed' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 50,
        top: 0, bottom: 50, left: 0, right: 100, width: 100, x: 0, y: 0,
        toJSON: () => {}
      });

      expect(getScrollTopOffset()).toBe(50);
      getComputedStyleSpy.mockRestore();
    });

    it('returns header height when header is sticky', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'sticky' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 60,
        top: 0, bottom: 60, left: 0, right: 100, width: 100, x: 0, y: 0,
        toJSON: () => {}
      });

      expect(getScrollTopOffset()).toBe(60);
      getComputedStyleSpy.mockRestore();
    });

    it('returns 0 when header is static', () => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) {
          return { position: 'static' } as CSSStyleDeclaration;
        }
        return {} as CSSStyleDeclaration;
      });

      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 60,
        top: 0, bottom: 60, left: 0, right: 100, width: 100, x: 0, y: 0,
        toJSON: () => {}
      });

      expect(getScrollTopOffset()).toBe(0);
      getComputedStyleSpy.mockRestore();
    });

    it('returns sum of custom elements scrollHeight', () => {
      const el1 = document.createElement('div');
      el1.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el1, 'scrollHeight', { configurable: true, value: 30 });
      document.body.appendChild(el1);

      const el2 = document.createElement('div');
      el2.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el2, 'scrollHeight', { configurable: true, value: 20 });
      document.body.appendChild(el2);

      expect(getScrollTopOffset()).toBe(50);
    });

    it('returns max of header height and custom offset (overlap logic)', () => {
      // Header: 100px
      const header = document.createElement('header');
      document.body.appendChild(header);
      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) { return { position: 'fixed' } as CSSStyleDeclaration; }
        return {} as CSSStyleDeclaration;
      });
      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 100,
        top: 0, bottom: 100, left: 0, right: 100, width: 100, x: 0, y: 0,
        toJSON: () => {}
      });

      // Custom: 50px
      const el1 = document.createElement('div');
      el1.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el1, 'scrollHeight', { configurable: true, value: 50 });
      document.body.appendChild(el1);

      // Should be Math.max(100, 50) = 100
      expect(getScrollTopOffset()).toBe(100);

      // Now add another custom element to make total custom = 120
      const el2 = document.createElement('div');
      el2.setAttribute('data-cv-scroll-offset', '');
      Object.defineProperty(el2, 'scrollHeight', { configurable: true, value: 70 });
      document.body.appendChild(el2);

      // Should be Math.max(100, 120) = 120
      expect(getScrollTopOffset()).toBe(120);
      
      getComputedStyleSpy.mockRestore();
    });
  });

  describe('scrollToElement', () => {
    it('scrolls to element minus header offset and padding', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const element = document.createElement('div');
      document.body.appendChild(element);

      // Mock element position: 500px down
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        top: 500, bottom: 550, left: 0, right: 100, width: 100, height: 50, x: 0, y: 0,
        toJSON: () => {}
      });

      // Mock window scrollY: 100
      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

      // Mock header offset: 60
      const header = document.createElement('header');
      document.body.appendChild(header);
      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === header) { return { position: 'fixed' } as CSSStyleDeclaration; }
        return {} as CSSStyleDeclaration;
      });
      vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
        height: 60,
        top: 0, bottom: 60, left: 0, right: 100, width: 100, x: 0, y: 0,
        toJSON: () => {}
      });

      scrollToElement(element);

      // Math:
      // Target Y = element.top (500) + scrollY (100) = 600
      // Offset = header (60)
      // Padding = 20
      // Final = 600 - 60 - 20 = 520
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 520,
        behavior: 'smooth'
      });

      scrollToSpy.mockRestore();
      getComputedStyleSpy.mockRestore();
    });
  });
});
