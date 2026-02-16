import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import { placeholderValueStore } from '$features/placeholder/stores/placeholder-value-store.svelte';
import type { Config, ConfigSectionKey, State, TabGroupConfig } from '$lib/types/index';
import { isValidConfigSection } from '$lib/types/index';

/**
 * Store for managing the application's configuration and user state.
 * Handles:
 * - Loading and storing static configuration.
 * - Managing mutable user state (toggles, tabs).
 * - Computing default states based on configuration.
 */
export class ActiveStateStore {
  /**
   * Static configuration loaded at startup.
   * Contains definitions for toggles, tab groups, and defaults.
   */
  config = $state<Config>({});

  /**
   * Explicit order of sections derived from the initial configuration JSON.
   */
  configSectionOrder = $state<ConfigSectionKey[]>([]);

  /**
   * Mutable application state representing user choices.
   * Use actions like `setPinnedTab` or `setToggles` to modify this.
   */
  state = $state<State>({
    shownToggles: [],
    peekToggles: [],
    tabs: {},
  });

  constructor(initialConfig: Config = {}) {
    this.config = initialConfig;
    if (Object.keys(initialConfig).length > 0) {
        this.init(initialConfig);
    } else {
        this.state = this.computeDefaultState();
    }
  }

  /**
   * Initialize with real configuration.
   */
  init(config: Config) {
    Object.assign(this.config, config);
    this.configSectionOrder = Object.keys(config).filter(isValidConfigSection);
    
    // Compute new defaults and merge
    const newState = this.computeDefaultState();
    
    // Mutate state properties in place to preserve reactivity
    // We only apply defaults if state is empty or we want to ensure basic integrity
    // But usually init is called before applying URL state?
    // In original code:
    // store.state.shownToggles = newState.shownToggles ?? [];
    // store.state.peekToggles = newState.peekToggles ?? [];
    // store.state.tabs = newState.tabs ?? {};
    
    this.state.shownToggles = newState.shownToggles ?? [];
    this.state.peekToggles = newState.peekToggles ?? [];
    this.state.tabs = newState.tabs ?? {};
    
    // Process TabGroup-linked Placeholders
    if (this.config.tabGroups) {
      this.config.tabGroups.forEach((group) => {
        this.registerPlaceholderFromTabGroup(group);
      });
    }
  }

  // --- Actions ---

  /**
   * Set the pinned tab for a specific tab group.
   * This syncs across all tab groups with the same ID.
   * @param groupId The ID of the tab group.
   * @param tabId The ID of the tab to pin.
   */
  setPinnedTab(groupId: string, tabId: string) {
    if (!this.state.tabs) this.state.tabs = {};
    this.state.tabs[groupId] = tabId;
    this.updatePlaceholderFromTabInput(groupId, tabId);
  }

  /**
   * Update the visibility of toggles.
   * @param shown List of IDs for toggles in "Show" state.
   * @param peek List of IDs for toggles in "Peek" state.
   */
  setToggles(shown: string[], peek: string[]) {
    this.state.shownToggles = shown;
    this.state.peekToggles = peek;
  }

  /**
   * Updates the full state (e.g. from URL or Persistence).
   * Merges the new state with computed defaults to ensure completeness.
   * @param newState Partial state object to apply.
   */
  applyState(newState: State) {
    const defaults = this.computeDefaultState();
    this.state = {
      shownToggles: newState.shownToggles ?? defaults.shownToggles ?? [],
      peekToggles: newState.peekToggles ?? defaults.peekToggles ?? [],
      tabs: { ...defaults.tabs, ...newState.tabs },
    };
  }

  /**
   * Resets the application state to the computed defaults.
   */
  reset() {
    this.state = this.computeDefaultState();
  }

  // --- Helpers ---

  public registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig) {
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

    const activeTabId = this.state.tabs?.[groupConfig.groupId];
    if (activeTabId) {
      this.updatePlaceholderFromTabInput(groupConfig.groupId, activeTabId);
    }
  }

  private updatePlaceholderFromTabInput(groupId: string, tabId: string) {
    const groupConfig = this.config.tabGroups?.find((g) => g.groupId === groupId);

    if (!groupConfig || !groupConfig.placeholderId) return;

    if (!placeholderRegistryStore.has(groupConfig.placeholderId)) return;

    const tabConfig = groupConfig.tabs.find((t) => t.tabId === tabId);

    if (!tabConfig) return;

    const placeholderValue = tabConfig.placeholderValue ?? '';
    placeholderValueStore.set(groupConfig.placeholderId, placeholderValue);
  }

  public computeDefaultState(): State {
    const shownToggles: string[] = [];
    const peekToggles: string[] = [];
    const tabs: Record<string, string> = {};

    if (this.config.toggles) {
      this.config.toggles.forEach((toggle) => {
        if (toggle.default === 'peek') {
          peekToggles.push(toggle.toggleId);
        } else if (toggle.default === 'hide') {
          // Start hidden
        } else {
          shownToggles.push(toggle.toggleId);
        }
      });
    }

    if (this.config.tabGroups) {
      this.config.tabGroups.forEach((group) => {
        if (group.default) {
          tabs[group.groupId] = group.default;
        } else if (group.tabs && group.tabs.length > 0) {
          const firstTab = group.tabs[0];
          if (firstTab?.tabId) {
            tabs[group.groupId] = firstTab.tabId;
          }
        }
      });
    }

    return {
      shownToggles,
      peekToggles,
      tabs,
    };
  }
}
