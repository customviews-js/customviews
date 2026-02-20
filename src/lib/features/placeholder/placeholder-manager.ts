import { placeholderRegistryStore } from './stores/placeholder-registry-store.svelte';
import type { Config, TabGroupConfig, State } from '$lib/types/index';

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
  registerTabGroupPlaceholders(config: Config) {
    if (config.tabGroups) {
      config.tabGroups.forEach((group) => {
        this.registerPlaceholderFromTabGroup(group);
      });
    }
  }

  /**
   * Calculates the placeholder value based on the active tab selection in a group.
   *
   * @param tabgroupId The ID of the tab group
   * @param tabId The ID of the currently active tab
   * @param config The full application configuration
   * @returns An object containing the placeholder key and value, or null if nothing to update.
   */
  calculatePlaceholderFromTabSelected(tabgroupId: string, tabId: string, config: Config): { key: string; value: string } | null {
    const groupConfig = config.tabGroups?.find((g) => g.groupId === tabgroupId);

    if (!groupConfig || !groupConfig.placeholderId) return null;

    if (!placeholderRegistryStore.has(groupConfig.placeholderId)) return null;

    const tabConfig = groupConfig.tabs.find((t) => t.tabId === tabId);

    if (!tabConfig) return null;

    const placeholderValue = tabConfig.placeholderValue ?? '';
    return { key: groupConfig.placeholderId, value: placeholderValue };
  }

  /**
   * Filters incoming URL state placeholders to only those that are registered.
   * Warns and skips unregistered keys to prevent arbitrary key injection.
   * @returns A partial record of valid placeholders to apply.
   */
  filterValidPlaceholders(state: State): Record<string, string> {
    const valid: Record<string, string> = {};
    if (!state.placeholders) return valid;
    
    for (const [key, value] of Object.entries(state.placeholders)) {
      if (placeholderRegistryStore.has(key)) {
        valid[key] = value;
      } else {
        console.warn(`[CustomViews] URL placeholder "${key}" is not registered and will be ignored.`);
      }
    }
    return valid;
  }

  // --- Internal Helpers ---

  private registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig) {
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
    
    // We do not return the initial value here, as registration happens during config load
    // and we let the ActiveStateStore handle initial state setup.
  }
}

export const placeholderManager = new PlaceholderManager();
