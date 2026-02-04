// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { UrlActionHandler } from '../src/lib/state/url-action-handler';

describe('UrlActionHandler', () => {
  // Helper to create a location-like object
  function mockLocation(search: string, hash: string) {
    return {
      search,
      hash,
      href: `http://localhost/${search}${hash}`,
    };
  }

  it('should detect OPEN_MODAL for ?cv-open', () => {
    const loc = mockLocation('?cv-open', '');
    const action = UrlActionHandler.detectAction(loc);
    expect(action).toEqual({ type: 'OPEN_MODAL', triggerKey: 'cv-open', triggerSource: 'query' });

    const clean = UrlActionHandler.getCleanedUrl(loc, action!);
    expect(clean).toBe('http://localhost/');
  });

  it('should detect OPEN_MODAL for #cv-open', () => {
    const loc = mockLocation('', '#cv-open');
    const action = UrlActionHandler.detectAction(loc);
    expect(action).toEqual({ type: 'OPEN_MODAL', triggerKey: '#cv-open', triggerSource: 'hash' });

    const clean = UrlActionHandler.getCleanedUrl(loc, action!);
    expect(clean).toBe('http://localhost/');
  });

  it('should detect START_SHARE for ?cv-share', () => {
    const loc = mockLocation('?cv-share', '');
    const action = UrlActionHandler.detectAction(loc);
    expect(action).toEqual({ type: 'START_SHARE', triggerKey: 'cv-share', triggerSource: 'query' });

    const clean = UrlActionHandler.getCleanedUrl(loc, action!);
    expect(clean).toBe('http://localhost/');
  });

  it('should detect START_SHARE with modes', () => {
    const modes = ['show', 'hide', 'highlight'];
    for (const mode of modes) {
      const loc = mockLocation(`?cv-share-${mode}`, '');
      const action = UrlActionHandler.detectAction(loc);
      expect(action).toMatchObject({
        type: 'START_SHARE',
        mode,
        // triggerKey checked implicitly
      });

      const clean = UrlActionHandler.getCleanedUrl(loc, action!);
      expect(clean).toBe('http://localhost/');
    }
  });

  it('should detect START_SHARE with modes via hash', () => {
    const modes = ['show', 'hide', 'highlight'];
    for (const mode of modes) {
      const loc = mockLocation('', `#cv-share-${mode}`);
      const action = UrlActionHandler.detectAction(loc);
      expect(action).toMatchObject({
        type: 'START_SHARE',
        mode,
        triggerSource: 'hash',
      });

      const clean = UrlActionHandler.getCleanedUrl(loc, action!);
      expect(clean).toBe('http://localhost/');
    }
  });

  it('should prioritize query params over hash', () => {
    const loc = mockLocation('?cv-open', '#cv-share');
    const action = UrlActionHandler.detectAction(loc);
    // Should detect the query param action first
    expect(action).toMatchObject({ type: 'OPEN_MODAL', triggerSource: 'query' });
  });

  it('should return null if no trigger is present', () => {
    const loc = mockLocation('', '#some-other-hash');
    const action = UrlActionHandler.detectAction(loc);
    expect(action).toBeNull();
  });
});
