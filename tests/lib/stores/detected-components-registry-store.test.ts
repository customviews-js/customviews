import { describe, it, expect, beforeEach } from 'vitest';
import { DetectedComponentsRegistryStore } from '$lib/stores/detected-components-registry-store.svelte';

describe('DetectedComponentsRegistryStore', () => {
    let store: DetectedComponentsRegistryStore;

    beforeEach(() => {
        store = new DetectedComponentsRegistryStore();
    });

  it('should register and check toggles', () => {
    store.registerToggle('t1');
    expect(store.detectedToggles.has('t1')).toBe(true);
    expect(store.detectedToggles.has('t2')).toBe(false);
  });

  it('should register and check tab groups', () => {
    store.registerTabGroup('g1');
    expect(store.detectedTabGroups.has('g1')).toBe(true);
  });

  it('should register and check placeholders', () => {
      store.registerPlaceholder('p1');
      expect(store.detectedPlaceholders.has('p1')).toBe(true);
  });

  it('should clear all registries', () => {
    store.registerToggle('t1');
    store.registerTabGroup('g1');
    store.registerPlaceholder('p1');
    
    store.clear();
    
    expect(store.detectedToggles.size).toBe(0);
    expect(store.detectedTabGroups.size).toBe(0);
    expect(store.detectedPlaceholders.size).toBe(0);
  });
});
