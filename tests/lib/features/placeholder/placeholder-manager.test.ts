import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaceholderManager } from '../../../../src/lib/features/placeholder/placeholder-manager';

// Polyfill Svelte Runes
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;

// Mock dependencies
vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-value-store.svelte', () => ({
  placeholderValueStore: {
    set: vi.fn(),
    values: {},
  },
}));

vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn(),
    register: vi.fn(),
    get: vi.fn(),
  },
}));

import { placeholderRegistryStore } from '../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';
import { placeholderValueStore } from '../../../../src/lib/features/placeholder/stores/placeholder-value-store.svelte';

describe('PlaceholderManager', () => {
  let manager: PlaceholderManager;
  let warnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new PlaceholderManager();
    // Spy on console.warn
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('registerConfigPlaceholders', () => {
    it('should register placeholders from config with source "config"', () => {
      const config = {
        placeholders: [{ name: 'p1', defaultValue: 'val1' }],
      };

      manager.registerConfigPlaceholders(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'config',
        })
      );
    });
  });

  describe('registerTabGroupPlaceholders', () => {
    it('should register placeholders from tabGroups with source "tabgroup"', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'g1',
            placeholderId: 'p1',
            tabs: [],
          },
        ],
      };

      // Mock registry.get to return undefined (not existing)
      vi.mocked(placeholderRegistryStore.get).mockReturnValue(undefined);

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'p1',
          source: 'tabgroup',
          ownerTabGroupId: 'g1',
        })
      );
    });

    it('should NOT register if placeholder exists from config', () => {
      const config = {
        tabGroups: [{ groupId: 'g1', placeholderId: 'p1', tabs: [] }],
      };

      // Mock existing config placeholder
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'p1',
        source: 'config',
      });

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should NOT register if placeholder exists from another tabgroup', () => {
      const config = {
        tabGroups: [{ groupId: 'g2', placeholderId: 'p1', tabs: [] }],
      };

      // Mock existing tabgroup placeholder
      vi.mocked(placeholderRegistryStore.get).mockReturnValue({
        name: 'p1',
        source: 'tabgroup',
        ownerTabGroupId: 'g1',
      });

      manager.registerTabGroupPlaceholders(config);

      expect(placeholderRegistryStore.register).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });
    it('should update placeholder on registration if activeTabs is provided', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'g1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'val1' }],
          },
        ],
      };

      // Mock registry to pretend it registered successfully
      vi.mocked(placeholderRegistryStore.get).mockReturnValue(undefined);
      // Mock registry has to say 'true' for update internal check
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      manager.registerTabGroupPlaceholders(config, { g1: 't1' });

      expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', 'val1');
    });
  });

  describe('updatePlaceholderFromTab', () => {
    it('should update value store if tab has placeholderValue', () => {
      const config = {
        tabGroups: [
          {
            groupId: 'g1',
            placeholderId: 'p1',
            tabs: [{ tabId: 't1', placeholderValue: 'v1' }],
          },
        ],
      };

      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      manager.updatePlaceholderFromTab('g1', 't1', config);

      expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', 'v1');
    });

    it('should set empty string if placeholderValue is undefined', () => {
        const config = {
          tabGroups: [
            {
              groupId: 'g1',
              placeholderId: 'p1',
              tabs: [{ tabId: 't1' }],
            },
          ],
        };
  
        vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);
  
        manager.updatePlaceholderFromTab('g1', 't1', config);
  
        expect(placeholderValueStore.set).toHaveBeenCalledWith('p1', '');
      });
  });
});
