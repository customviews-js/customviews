import { placeholderManager } from '$features/placeholder/placeholder-manager';
import type { Config, ConfigSectionKey, State } from '$lib/types/index';
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
    // Apply defaults to ensure state integrity.
    // Existing values in `this.state` are preserved if they exist, but `newState`
    // (which comes from computeDefaultState) contains the baseline defaults.
    // We strictly apply defaults here; overlaying URL state happens later via applyState().
    
    this.state.shownToggles = newState.shownToggles ?? [];
    this.state.peekToggles = newState.peekToggles ?? [];
    this.state.tabs = newState.tabs ?? {};
    
    // Process TabGroup-linked Placeholders

  }

  /**
   * Registers placeholders defined in tab groups.
   * Should be called AFTER global config placeholders are registered to ensure correct precedence.
   */
  registerPlaceholders() {
    placeholderManager.registerTabGroupPlaceholders(this.config, this.state.tabs);
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
    placeholderManager.updatePlaceholderFromTab(groupId, tabId, this.config);
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
      tabs: { ...(defaults.tabs ?? {}), ...(newState.tabs ?? {}) },
    };
  }

  /**
   * Resets the application state to the computed defaults.
   */
  reset() {
    this.state = this.computeDefaultState();
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
