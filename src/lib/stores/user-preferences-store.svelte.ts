import type { State, TabGroupConfig, ToggleConfig } from '$lib/types/index';
import type { SiteConfigStore } from './site-config-store.svelte';

/**
 * User Preferences Store
 * Handles mutable user state (toggles, tabs).
 */
export class UserPreferencesStore {
  /**
   * Mutable application state representing user choices.
   */
  state = $state<State>({
    shownToggles: [],
    peekToggles: [],
    tabs: {},
  });

  constructor(private checkConfig: () => SiteConfigStore['config']) {
    this.state = this.computeDefaultState();
  }

  // --- Actions ---

  setPinnedTab(groupId: string, tabId: string) {
    if (!this.state.tabs) this.state.tabs = {};
    this.state.tabs[groupId] = tabId;
  }

  setToggles(shown: string[], peek: string[]) {
    this.state.shownToggles = shown;
    this.state.peekToggles = peek;
  }

  applyState(newState: State) {
    const defaults = this.computeDefaultState();
    this.state = {
      shownToggles: newState.shownToggles ?? defaults.shownToggles ?? [],
      peekToggles: newState.peekToggles ?? defaults.peekToggles ?? [],
      tabs: { ...defaults.tabs, ...newState.tabs },
    };
  }

  reset() {
    this.state = this.computeDefaultState();
  }

  // --- Helpers ---

  computeDefaultState(): State {
    const config = this.checkConfig();
    const shownToggles: string[] = [];
    const peekToggles: string[] = [];
    const tabs: Record<string, string> = {};

    // 1. Process Toggles
    if (config.toggles) {
      config.toggles.forEach((toggle: ToggleConfig) => {
        if (toggle.default === 'peek') {
          peekToggles.push(toggle.toggleId);
        } else if (toggle.default === 'hide') {
          // Start hidden
        } else {
          shownToggles.push(toggle.toggleId);
        }
      });
    }

    // 2. Process Tab Groups
    if (config.tabGroups) {
      config.tabGroups.forEach((group: TabGroupConfig) => {
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
