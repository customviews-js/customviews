import { placeholderManager } from '$features/placeholder/placeholder-manager';
import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import type { Config, ConfigSectionKey, State } from '$lib/types/index';
import { isValidConfigSection } from '$lib/types/index';

/**
 * Store for managing the application's configuration and user state.
 * Handles:
 * - Loading and storing static configuration.
 * - Managing mutable user state (toggles, tabs, placeholders).
 * - Computing default states based on configuration.
 */
export class ActiveStateStore {
  /**
   * Static configuration loaded at startup.
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
    placeholders: {},
  });

  constructor(initialConfig: Config = {}) {
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
    
    // Reset state to computed defaults.
    // Overriding with URL state happens later via applyDifferenceInState().
    this.state.shownToggles = newState.shownToggles ?? [];
    this.state.peekToggles = newState.peekToggles ?? [];
    this.state.tabs = newState.tabs ?? {};
    this.state.placeholders = newState.placeholders ?? {};
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
    
    const phUpdate = placeholderManager.calculatePlaceholderFromTabSelected(groupId, tabId, this.config);
    if (phUpdate) {
      this.setPlaceholder(phUpdate.key, phUpdate.value);
    }
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
   * Set a specific placeholder value.
   * @param key The ID/name of the placeholder.
   * @param value The value to set.
   */
  setPlaceholder(key: string, value: string) {
    if (!this.state.placeholders) this.state.placeholders = {};
    this.state.placeholders[key] = value;
  }

  // --- State Application ---

  /**
   * Replaces the full application state (e.g. from persistence).
   *
   * Precedence model:
   * 1. Start from computed defaults (config-driven).
   * 2. Layer in the incoming `newState`, sanitizing tabs and placeholders.
   * 3. Sync any tab-group-derived placeholders that weren't explicitly set.
   *
   * @param newState The persisted state to restore.
   */
  applyState(newState: State) {
    const defaults = this.computeDefaultState();

    const validatedTabs = this.filterValidTabs(newState.tabs ?? {});
    const validatedPlaceholders = placeholderManager.filterValidPlaceholders(newState.placeholders ?? {});

    this.state = {
      shownToggles: newState.shownToggles ?? defaults.shownToggles ?? [],
      peekToggles: newState.peekToggles ?? defaults.peekToggles ?? [],
      tabs: { ...(defaults.tabs ?? {}), ...validatedTabs },
      placeholders: { ...(defaults.placeholders ?? {}), ...validatedPlaceholders },
    };

    // Sync derived placeholders for any tabs that shifted (and aren't explicitly overridden).
    this.syncPlaceholdersFromTabs(validatedPlaceholders);
  }

  /**
   * Applies a sparse delta on top of the current state (e.g. from URL parameters).
   *
   * Semantics:
   * - Only toggles explicitly mentioned in the delta are affected;
   *   unmentioned toggles retain their current visibility.
   * - Tab and placeholder entries in the delta are merged into (not replacing) current state.
   * - Incoming tab IDs are validated against the config; invalid entries are dropped.
   * - Incoming placeholder keys are validated against the registry; invalid keys are dropped.
   * - After tab merges, tab-group-derived placeholders are automatically synced
   *   unless the delta explicitly provides a value for them.
   *
   * @param deltaState Partial state describing only the changes to apply.
   */
  applyDifferenceInState(deltaState: State) {
    this.applyToggleDelta(deltaState);
    this.applyTabsDelta(deltaState.tabs ?? {});
    this.applyPlaceholdersDelta(deltaState.placeholders ?? {});
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
    const placeholders: Record<string, string> = {};

    if (this.config.placeholders) {
      this.config.placeholders.forEach((p) => {
        if (p.defaultValue !== undefined) {
          placeholders[p.name] = p.defaultValue;
        }
      });
    }

    if (this.config.toggles) {
      this.config.toggles.forEach((toggle) => {
        if (toggle.default === 'peek') {
          peekToggles.push(toggle.toggleId);
        } else if (toggle.default === 'hide') {
          // Start hidden — not in shown or peek lists
        } else {
          shownToggles.push(toggle.toggleId);
        }
      });
    }

    if (this.config.tabGroups) {
      this.config.tabGroups.forEach((group) => {
        let defaultTabId: string | undefined = undefined;

        if (group.default) {
          defaultTabId = group.default;
        } else if (group.tabs && group.tabs.length > 0) {
          const firstTab = group.tabs[0];
          if (firstTab?.tabId) {
            defaultTabId = firstTab.tabId;
          }
        }
        
        if (defaultTabId) {
          tabs[group.groupId] = defaultTabId;
          
          if (group.placeholderId) {
            const tabConfig = group.tabs.find(t => t.tabId === defaultTabId);
            if (tabConfig && placeholders[group.placeholderId] === undefined) {
              placeholders[group.placeholderId] = tabConfig.placeholderValue ?? '';
            }
          }
        }
      });
    }

    return { shownToggles, peekToggles, tabs, placeholders };
  }

  // --- Private Helpers ---

  /**
   * Applies the toggle portion of a delta state.
   * Toggles explicitly reassigned in the delta are moved to their new state;
   * all others retain their current visibility.
   */
  private applyToggleDelta(deltaState: State) {
    const toShow = new Set(deltaState.shownToggles ?? []);
    const toPeek = new Set(deltaState.peekToggles ?? []);
    const toHide = new Set(deltaState.hiddenToggles ?? []);
    const allMentioned = new Set([...toShow, ...toPeek, ...toHide]);

    const newShown = (this.state.shownToggles ?? []).filter((id) => !allMentioned.has(id));
    const newPeek = (this.state.peekToggles ?? []).filter((id) => !allMentioned.has(id));

    newShown.push(...toShow);
    newPeek.push(...toPeek);
    // Hidden toggles are simply absent from both shown and peek lists

    this.state.shownToggles = newShown;
    this.state.peekToggles = newPeek;
  }

  /**
   * Merges a tab delta into the current state.
   * Validates each incoming groupId and tabId against the configuration.
   * Invalid entries are dropped with a warning; valid entries override the current selection.
   * After merging, tab-group-derived placeholders are synced.
   */
  private applyTabsDelta(deltaTabs: Record<string, string>) {
    const validatedTabs = this.filterValidTabs(deltaTabs);

    if (!this.state.tabs) this.state.tabs = {};
    Object.assign(this.state.tabs, validatedTabs);

    // Sync tab-derived placeholders for any tabs that changed.
    // Placeholders are NOT passed as explicit overrides here, so all tab-derived ones will sync.
    this.syncPlaceholdersFromTabs({});
  }

  /**
   * Merges a placeholder delta into the current state.
   * Only registered placeholder keys are accepted; others are dropped with a warning.
   * Explicit placeholder values override any tab-derived value (winning over syncPlaceholdersFromTabs).
   */
  private applyPlaceholdersDelta(deltaPlaceholders: Record<string, string>) {
    const validatedPlaceholders = placeholderManager.filterValidPlaceholders(deltaPlaceholders);

    if (!this.state.placeholders) this.state.placeholders = {};
    Object.assign(this.state.placeholders, validatedPlaceholders);
  }

  /**
   * Validates an incoming tab record against the configuration.
   * Drops any groupId that doesn't exist in `config.tabGroups`,
   * and any tabId that doesn't exist within that group.
   *
   * @param incomingTabs Raw tab record (e.g. from a URL or persistence).
   * @returns A filtered record containing only valid groupId → tabId pairs.
   */
  private filterValidTabs(incomingTabs: Record<string, string>): Record<string, string> {
    const valid: Record<string, string> = {};

    for (const [groupId, tabId] of Object.entries(incomingTabs)) {
      const group = this.config.tabGroups?.find((g) => g.groupId === groupId);
      if (!group) {
        console.warn(`[CustomViews] Tab group "${groupId}" is not in the config and will be ignored.`);
        continue;
      }

      const tabExists = group.tabs.some((t) => t.tabId === tabId);
      if (!tabExists) {
        console.warn(`[CustomViews] Tab "${tabId}" is not in group "${groupId}" and will be ignored.`);
        continue;
      }

      valid[groupId] = tabId;
    }

    return valid;
  }

  /**
   * Recalculates tab-group-derived placeholders for any tab group that hasn't been
   * explicitly overridden in the `explicitPlaceholders` map.
   *
   * Skip rules (to avoid overwriting intentional values):
   * - If the placeholder was explicitly included in the incoming state, skip it.
   * - If the placeholder is owned by `config` (not a tab group), skip it.
   *
   * @param explicitPlaceholders Placeholders that were explicitly set in the incoming state.
   */
  private syncPlaceholdersFromTabs(explicitPlaceholders: Record<string, string>) {
    if (!this.config.tabGroups) return;

    for (const group of this.config.tabGroups) {
      const phId = group.placeholderId;
      if (!phId) continue;

      // Explicit URL/persistence value wins — don't overwrite it with the tab-derived value.
      if (explicitPlaceholders[phId] !== undefined) continue;

      // Config-owned placeholders are not tab-derived — don't synchronize them.
      const definition = placeholderRegistryStore.get(phId);
      if (definition?.source === 'config') continue;

      // Calculate the tab-derived value for the currently active tab.
      const activeTabId = this.state.tabs?.[group.groupId];
      if (!activeTabId) continue;

      const phUpdate = placeholderManager.calculatePlaceholderFromTabSelected(group.groupId, activeTabId, this.config);
      if (phUpdate) {
        this.setPlaceholder(phUpdate.key, phUpdate.value);
      }
    }
  }
}

export const activeStateStore = new ActiveStateStore();
