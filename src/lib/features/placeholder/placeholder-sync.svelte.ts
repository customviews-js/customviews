import type { AppStore } from '$lib/stores/app-store.svelte';
import { placeholderRegistryStore } from './stores/placeholder-registry-store.svelte';
import { placeholderValueStore } from './stores/placeholder-value-store.svelte';
import type { TabGroupConfig } from '$lib/types/index';

/**
 * Syncs AppStore state (Config, UserPrefs) with the Placeholder system.
 */
export class PlaceholderSync {
  constructor(private app: AppStore) {}

  init() {
    // 1. Register placeholders from config
    this.registerConfigPlaceholders();
    
    // 2. Register from TabGroups
    this.registerTabGroupPlaceholders();
  }

  // Called when a tab selection changes
  onTabChanged(groupId: string, tabId: string) {
    this.updatePlaceholderFromTabInput(groupId, tabId);
  }

  private registerConfigPlaceholders() {
    const config = this.app.siteConfig.config;
    if (config.placeholders) {
      config.placeholders.forEach((def) => {
        placeholderRegistryStore.register({
          ...def,
          source: 'config',
        });
      });
    }
  }

  private registerTabGroupPlaceholders() {
    const config = this.app.siteConfig.config;
    if (config.tabGroups) {
      config.tabGroups.forEach((group) => {
        this.registerPlaceholderFromTabGroup(group);
      });
    }
  }

  private registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig) {
    if (!groupConfig.placeholderId) return;

    const id = groupConfig.placeholderId;
    const existing = placeholderRegistryStore.get(id);

    if (existing) {
      if (existing.source === 'config') {
        console.warn(
          `[CustomViews] Tab group "${groupConfig.groupId}" is binding to placeholder "${id}", ` +
            `which is already explicitly defined in placeholders config.`,
        );
      } else if (
        existing.source === 'tabgroup' &&
        existing.ownerTabGroupId !== groupConfig.groupId
      ) {
        console.warn(
          `[CustomViews] Multiple tab groups are binding to placeholderId: "${id}".`,
        );
      }
      return;
    }

    placeholderRegistryStore.register({
      name: id,
      settingsLabel: groupConfig.label ?? groupConfig.groupId,
      hiddenFromSettings: true,
      source: 'tabgroup',
      ownerTabGroupId: groupConfig.groupId,
    });

    const activeTabId = this.app.userPreferences.state.tabs?.[groupConfig.groupId];
    if (activeTabId) {
      this.updatePlaceholderFromTabInput(groupConfig.groupId, activeTabId);
    }
  }

  private updatePlaceholderFromTabInput(groupId: string, tabId: string) {
    const groupConfig = this.app.siteConfig.config.tabGroups?.find(
      (g) => g.groupId === groupId,
    );

    if (!groupConfig || !groupConfig.placeholderId) return;
    if (!placeholderRegistryStore.has(groupConfig.placeholderId)) return;

    const tabConfig = groupConfig.tabs.find((t) => t.tabId === tabId);
    if (!tabConfig) return;

    const placeholderValue = tabConfig.placeholderValue ?? '';
    placeholderValueStore.set(groupConfig.placeholderId, placeholderValue);
  }
}
