/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { URLStateManager } from '../../../../src/lib/features/url/url-state-manager';
import type { State } from '../../../../src/lib/types/index';

// --- Test Helpers ---

function setLocation(search: string) {
  (window as any).location.search = search;
  (window as any).location.href = 'http://localhost/' + (search.startsWith('?') ? '' : '?') + search;
}

function freshLocation() {
  delete (window as any).location;
  (window as any).location = {
    href: 'http://localhost/',
    search: '',
    pathname: '/',
    hash: '',
    origin: 'http://localhost',
  };
}

describe('URLStateManager', () => {
  // ==========================================================================
  // parseURL
  // ==========================================================================
  describe('parseURL', () => {
    beforeEach(freshLocation);

    it('returns null when no managed params are present', () => {
      expect(URLStateManager.parseURL()).toBeNull();
    });

    it('returns null when only focus params are present', () => {
      setLocation('?cv-show=elem1&cv-hide=elem2');
      expect(URLStateManager.parseURL()).toBeNull();
    });

    it('parses ?t-show=A,B into shownToggles', () => {
      setLocation('?t-show=advanced,expert');
      const result = URLStateManager.parseURL();
      expect(result).not.toBeNull();
      expect(result!.shownToggles).toEqual(['advanced', 'expert']);
    });

    it('parses ?t-peek=C into peekToggles', () => {
      setLocation('?t-peek=intermediate');
      const result = URLStateManager.parseURL();
      expect(result!.peekToggles).toEqual(['intermediate']);
    });

    it('parses ?t-hide=D into hiddenToggles', () => {
      setLocation('?t-hide=secret');
      const result = URLStateManager.parseURL();
      expect(result!.hiddenToggles).toEqual(['secret']);
    });

    it('parses ?tabs=g1:t1,g2:t2 into tabs record', () => {
      setLocation('?tabs=os:linux,lang:python');
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ os: 'linux', lang: 'python' });
    });

    it('splits tabs on first colon only', () => {
      setLocation('?tabs=grp:tab:with:colons');
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ grp: 'tab:with:colons' });
    });

    it('parses ?ph=key:value and decodes encoded values', () => {
      setLocation('?ph=language:Python%20Docs');
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ language: 'Python Docs' });
    });

    it('splits ph on first colon only', () => {
      setLocation('?ph=key:val%3Awith%3Acolons');
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ key: 'val:with:colons' });
    });

    it('parses all params together', () => {
      setLocation('?t-show=t1&t-peek=p1&t-hide=h1&tabs=g1:tab1&ph=myKey:Hello%20World');
      const result = URLStateManager.parseURL();
      expect(result).not.toBeNull();
      expect(result!.shownToggles).toEqual(['t1']);
      expect(result!.peekToggles).toEqual(['p1']);
      expect(result!.hiddenToggles).toEqual(['h1']);
      expect(result!.tabs).toEqual({ g1: 'tab1' });
      expect(result!.placeholders).toEqual({ myKey: 'Hello World' });
    });

    it('ignores malformed tab entries without a colon', () => {
      setLocation('?tabs=malformed,g1:tab1');
      const result = URLStateManager.parseURL();
      expect(result!.tabs).toEqual({ g1: 'tab1' });
    });

    it('ignores malformed ph entries without a colon', () => {
      setLocation('?ph=noColon,key:value');
      const result = URLStateManager.parseURL();
      expect(result!.placeholders).toEqual({ key: 'value' });
    });
  });

  // ==========================================================================
  // round-trip: generateShareableURL + parseURL
  // ==========================================================================
  describe('round-trip (generateShareableURL → parseURL)', () => {
    beforeEach(freshLocation);

    it('encodes and then parses back to equivalent state', () => {
      const current: State = {
        shownToggles: ['A', 'B'],
        peekToggles: ['P1'],
        tabs: { os: 'linux' },
        placeholders: { myKey: 'Hello World' },
      };
      const allIds = {
        toggles: ['A', 'B', 'P1', 'HIDDEN'],
        tabGroups: ['os'],
        placeholders: ['myKey'],
      };

      const shareUrl = URLStateManager.generateShareableURL(current, allIds);
      (window as any).location.search = new URL(shareUrl).search;
      const parsed = URLStateManager.parseURL();

      expect(parsed).not.toBeNull();
      expect(parsed!.shownToggles).toContain('A');
      expect(parsed!.shownToggles).toContain('B');
      expect(parsed!.peekToggles).toEqual(['P1']);
      expect(parsed!.hiddenToggles).toContain('HIDDEN');
      expect(parsed!.tabs).toEqual({ os: 'linux' });
      expect(parsed!.placeholders).toEqual({ myKey: 'Hello World' });
    });

    it('handles complex placeholder values with commas and colons', () => {
      const current: State = {
        placeholders: {
          key1: 'value,with,commas',
          key2: 'value:with:colons',
        },
      };

      const shareUrl = URLStateManager.generateShareableURL(current, {
        toggles: [],
        tabGroups: [],
        placeholders: ['key1', 'key2'],
      });
      expect(shareUrl).toContain('key1:value%2Cwith%2Ccommas');
      expect(shareUrl).toContain('key2:value%3Awith%3Acolons');

      (window as any).location.search = new URL(shareUrl).search;
      const parsed = URLStateManager.parseURL();
      expect(parsed!.placeholders).toEqual(current.placeholders);
    });
  });

  // ==========================================================================
  // generateShareableURL  (absolute encoding)
  // ==========================================================================
  describe('generateShareableURL', () => {
    beforeEach(freshLocation);

    it('encodes all active toggles and explicitly hides the rest', () => {
      const url = URLStateManager.generateShareableURL(
        { shownToggles: ['A', 'NEW'], peekToggles: [], tabs: { g1: 'tabA' } },
        { toggles: ['A', 'NEW', 'HIDDEN_DEFAULT'], tabGroups: ['g1'], placeholders: [] },
      );
      expect(url).toContain('t-show=A,NEW');
      expect(url).toContain('tabs=g1:tabA');
      expect(url).toContain('t-hide=HIDDEN_DEFAULT');
    });

    it('returns clean URL for null state', () => {
      setLocation('?t-show=t1');
      const url = URLStateManager.generateShareableURL(null);
      expect(url).not.toContain('t-show=');
    });

    it('preserves cv-show / cv-hide params', () => {
      setLocation('?cv-show=el1');
      const url = URLStateManager.generateShareableURL(
        { shownToggles: ['t1'] },
        { toggles: ['t1', 'other'], tabGroups: [], placeholders: [] },
      );
      expect(url).toContain('cv-show=el1');
    });

    it('encodes t-hide for all toggles not shown or peeked', () => {
      const url = URLStateManager.generateShareableURL(
        { shownToggles: [], peekToggles: [] },
        { toggles: ['A', 'B'], tabGroups: [], placeholders: [] },
      );
      expect(url).toContain('t-hide=A,B');
      expect(url).not.toContain('t-show=');
    });
  });
});

