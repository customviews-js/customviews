import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaceholderManager } from '../../../../src/lib/features/placeholder/placeholder-manager';

// Polyfill Svelte Runes
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;



vi.mock('../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte', () => ({
  placeholderRegistryStore: {
    has: vi.fn(),
    register: vi.fn(),
    get: vi.fn(),
  },
}));

import { placeholderRegistryStore } from '../../../../src/lib/features/placeholder/stores/placeholder-registry-store.svelte';

describe('PlaceholderManager', () => {
  let manager: PlaceholderManager;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new PlaceholderManager();
    // Spy on console.warn
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
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

  });

  describe('calculatePlaceholderFromTabSelected', () => {
    it('should return key and value if tab has placeholderValue', () => {
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

      const result = manager.calculatePlaceholderFromTabSelected('g1', 't1', config);

      expect(result).toEqual({ key: 'p1', value: 'v1' });
    });

    it('should return empty string if placeholderValue is undefined', () => {
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

        const result = manager.calculatePlaceholderFromTabSelected('g1', 't1', config);

        expect(result).toEqual({ key: 'p1', value: '' });
      });
  });

  describe('filterValidPlaceholders', () => {
    it('returns values for registered placeholder keys', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(true);

      const result = manager.filterValidPlaceholders({ lang: 'Python', os: 'Linux' });

      expect(result).toEqual({ lang: 'Python', os: 'Linux' });
    });

    it('warns and omits unregistered keys', () => {
      vi.mocked(placeholderRegistryStore.has).mockReturnValue(false);

      const result = manager.filterValidPlaceholders({ unknown: 'value' });

      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"unknown"'),
      );
    });

    it('returns empty object when placeholders is undefined', () => {
      const result = manager.filterValidPlaceholders(undefined);

      expect(result).toEqual({});
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns empty object when placeholders is an empty object', () => {
      const result = manager.filterValidPlaceholders({});

      expect(result).toEqual({});
    });

    it('returns registered keys and omits unregistered keys in a mixed state', () => {
      vi.mocked(placeholderRegistryStore.has).mockImplementation((key) => key === 'registered');

      const result = manager.filterValidPlaceholders({ registered: 'yes', unregistered: 'no' });

      expect(result).toEqual({ registered: 'yes' });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"unregistered"'));
    });
  });
});
