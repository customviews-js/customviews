import { describe, it, expect } from 'vitest';
import { SiteConfigStore } from '$lib/stores/site-config-store.svelte';
import type { Config } from '$lib/types/index';

const mockConfig: Config = {
  toggles: [],
  tabGroups: [],
};

const complexConfig: Config = {
    toggles: [{ toggleId: 't1', default: 'show' }],
    // @ts-ignore - testing unknown sections
    unknownSection: { foo: 'bar' }
}

describe('SiteConfigStore', () => {
  it('should load initial config', () => {
    const store = new SiteConfigStore(mockConfig);
    expect(store.config).toEqual(mockConfig);
  });

  it('should filter valid config sections for order', () => {
      const store = new SiteConfigStore(complexConfig);
      expect(store.sectionOrder).toContain('toggles');
      expect(store.sectionOrder).not.toContain('unknownSection');
  });

  it('should update config', () => {
      const store = new SiteConfigStore();
      expect(store.config).toEqual({});
      
      store.setConfig(mockConfig);
      expect(store.config).toEqual(mockConfig);
  });
});
