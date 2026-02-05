/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { URLStateManager } from '../../src/lib/state/url-state-manager';
import type { State } from '../../src/lib/types/index';

describe('URLStateManager', () => {
  describe('State Encoding/Decoding', () => {
    // Access private methods using type assertion for testing
    const encodeState = (URLStateManager as any).encodeState.bind(URLStateManager);
    const decodeState = (URLStateManager as any).decodeState.bind(URLStateManager);

    it('should encode and decode a complex state correctly', () => {
      const originalState: State = {
        shownToggles: ['t1', 't2'],
        peekToggles: ['p1'],
        tabs: { g1: 'tabA', g2: 'tabB' },
        focus: ['some-element-id'],
      };

      const encoded = encodeState(originalState);
      expect(typeof encoded).toBe('string');

      // Check URL safety (no +, /, =)
      expect(encoded).not.toMatch(/[+/=]/);

      const decoded = decodeState(encoded);
      expect(decoded).toEqual(originalState);
    });

    it('should return null for malformed encoded string', () => {
      const malformed = 'not-valid-base64-json%';
      expect(decodeState(malformed)).toBeNull();
    });

    it('should handle empty state', () => {
      const emptyState: State = {
        shownToggles: [],
        peekToggles: [],
        tabs: {},
      };

      // It might return a string representing empty JSON or similar
      const encoded = encodeState(emptyState);
      const decoded = decodeState(encoded);

      // Our decode reconstruction might not be exactly equal due to empty arrays vs undefined
      // let's check basic structure
      expect(decoded).toBeDefined();
      if (decoded) {
        expect(decoded.shownToggles).toEqual([]);
        expect(decoded.peekToggles).toEqual([]);
        expect(decoded.tabs).toBeUndefined(); // Compact format omits empty objects
      }
    });
  });

  describe('URL Manipulation', () => {
    let originalLocation: Location;

    beforeEach(() => {
      // Backup window.location
      originalLocation = window.location;

      // Mock window.location
      delete (window as any).location;
      (window as any).location = {
        href: 'http://localhost/',
        search: '',
        pathname: '/',
        hash: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
        // URLSearchParams needs the full object to work sometimes?
        // But we construct new URL(window.location.href) so this is fine.
      };

      // Mock History
      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore
      window.location = originalLocation as any;
      vi.restoreAllMocks();
    });

    it('updateURL should set view param', () => {
      const state: State = { shownToggles: ['test'] };
      URLStateManager.updateURL(state);

      expect(window.history.replaceState).toHaveBeenCalled();
      const call = vi.mocked(window.history.replaceState).mock.calls[0];
      if (!call) throw new Error('Call 1 failed');
      const url = call[2] as string; // 3rd arg is URL

      expect(url).toContain('view=');
    });

    it('updateURL should clear view param if state is null', () => {
      // Setup existing view param
      window.location.href = 'http://localhost/?view=something';

      URLStateManager.updateURL(null);

      expect(window.history.replaceState).toHaveBeenCalled();
      const call = vi.mocked(window.history.replaceState).mock.calls[0];
      if (!call) throw new Error('Call 2 failed');
      const url = call[2] as string;

      expect(url).not.toContain('view=');
    });

    it('parseURL should return null if no view param', () => {
      window.location.search = '';
      expect(URLStateManager.parseURL()).toBeNull();
    });

    it('parseURL should return state from valid view param', () => {
      // Manually enable a state to get a valid string
      const state: State = { shownToggles: ['foo'] };
      const encoded = (URLStateManager as any).encodeState(state);

      window.location.search = `?view=${encoded}`;

      const result = URLStateManager.parseURL();
      expect(result).toEqual(
        expect.objectContaining({
          shownToggles: ['foo'],
        }),
      );
    });
  });
});
