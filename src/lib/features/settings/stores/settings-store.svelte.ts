import type { AppStore } from '$lib/stores/app-store.svelte';
import { getAppStore } from '$lib/stores/app-context';
import { placeholderRegistryStore, type PlaceholderDefinition } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import type { ToggleConfig, TabGroupConfig } from '$lib/types/index';

export class SettingsStore {
  private app: AppStore;

  menuToggles: ToggleConfig[];
  menuTabGroups: TabGroupConfig[];
  visiblePlaceholders: PlaceholderDefinition[];
  hasVisiblePlaceholders: boolean;
  hasMenuOptions: boolean;
  hasPageElements: boolean;

  constructor(app: AppStore) {
    this.app = app;

    this.menuToggles = $derived.by(() => {
        const toggles = this.app.siteConfig.config.toggles;
        if (!toggles) return [];
        return toggles.filter(
          (t) => !t.isLocal || this.app.registry.detectedToggles.has(t.toggleId),
        );
      });
    
      this.menuTabGroups = $derived.by(() => {
        const groups = this.app.siteConfig.config.tabGroups;
        if (!groups) return [];
        return groups.filter(
          (g) => !g.isLocal || this.app.registry.detectedTabGroups.has(g.groupId),
        );
      });
    
      this.visiblePlaceholders = $derived.by(() => {
        return placeholderRegistryStore.definitions.filter((d) => {
          if (d.hiddenFromSettings) return false;
          if (d.isLocal) {
            return this.app.registry.detectedPlaceholders.has(d.name);
          }
          return true;
        });
      });
    
      this.hasVisiblePlaceholders = $derived(this.visiblePlaceholders.length > 0);
    
      this.hasMenuOptions = $derived(
        this.menuToggles.length > 0 ||
          this.menuTabGroups.length > 0 ||
          this.hasVisiblePlaceholders,
      );
    
      this.hasPageElements = $derived(
        this.app.registry.detectedToggles.size > 0 ||
          this.app.registry.detectedTabGroups.size > 0,
      );
  }
}

// Helper to get singleton instance
let instance: SettingsStore | undefined;

export function getSettingsStore(): SettingsStore {
    if (!instance) {
        instance = new SettingsStore(getAppStore());
    }
    return instance;
}
