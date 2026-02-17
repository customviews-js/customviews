import { placeholderRegistryStore } from './stores/placeholder-registry-store.svelte';
import { placeholderValueStore } from './stores/placeholder-value-store.svelte';
import type { Config, TabGroupConfig } from '$lib/types/index';

/**
 * Manager for Placeholder Logic
 *
 * Centralizes logic for registering placeholders from different sources (Config, TabGroups)
 * and updating placeholder values based on state changes.
 */
export class PlaceholderManager {
  /**
   * Registers global placeholders defined in the configuration.
   * Source is marked as 'config'.
   */
  registerConfigPlaceholders(config: Config) {
    if (config.placeholders) {
      config.placeholders.forEach((def) => {
        placeholderRegistryStore.register({
          ...def,
          source: 'config',
        });
      });
    }
  }

  /**
   * Registers placeholders defined implicitly via Tab Groups.
   * Source is marked as 'tabgroup'.
   *
   * Should be called AFTER registerConfigPlaceholders to ensure config precedence.
   */
  registerTabGroupPlaceholders(config: Config, activeTabs?: Record<string, string>) {
    if (config.tabGroups) {
      config.tabGroups.forEach((group) => {
        this.registerPlaceholderFromTabGroup(group, config, activeTabs);
      });
    }
  }

  /**
   * Updates a placeholder value based on the active tab selection in a group.
   *
   * @param groupId The ID of the tab group
   * @param tabId The ID of the currently active tab
   * @param config The full application configuration
   */
  updatePlaceholderFromTab(groupId: string, tabId: string, config: Config) {
    const groupConfig = config.tabGroups?.find((g) => g.groupId === groupId);

    if (!groupConfig || !groupConfig.placeholderId) return;

    if (!placeholderRegistryStore.has(groupConfig.placeholderId)) return;

    const tabConfig = groupConfig.tabs.find((t) => t.tabId === tabId);

    if (!tabConfig) return;

    const placeholderValue = tabConfig.placeholderValue ?? '';
    placeholderValueStore.set(groupConfig.placeholderId, placeholderValue);
  }

  // --- Internal Helpers ---

  private registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig, fullConfig: Config, activeTabs?: Record<string, string>) {
    if (!groupConfig.placeholderId) return;

    const id = groupConfig.placeholderId;
    const existing = placeholderRegistryStore.get(id);

    if (existing) {
      if (existing.source === 'config') {
        console.warn(
          `[CustomViews] Tab group "${groupConfig.groupId}" is binding to placeholder "${id}", ` +
            `which is already explicitly defined in placeholders config. ` +
            `To avoid unexpected behavior, placeholders should have a single source of truth.`,
        );
      } else if (
        existing.source === 'tabgroup' &&
        existing.ownerTabGroupId !== groupConfig.groupId
      ) {
        console.warn(
          `[CustomViews] Multiple tab groups are binding to the same placeholderId: "${id}". ` +
            `Current group: "${groupConfig.groupId}", Existing group: "${existing.ownerTabGroupId}". ` +
            `This will cause race conditions as both groups compete for the same value.`,
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
    
    // Initial Update: If we have an active tab for this group, ensure the placeholder matches
    if (activeTabs) {
      const activeTabId = activeTabs[groupConfig.groupId];
      if (activeTabId) {
        this.updatePlaceholderFromTab(groupConfig.groupId, activeTabId, fullConfig);
      }
    }
  }
}

export const placeholderManager = new PlaceholderManager();
