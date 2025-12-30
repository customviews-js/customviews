import type { Config, State, ToggleId } from "../types/types";


/**
 * Reactive Data Store for CustomViews application state.
 * 
 * Uses Svelte 5 Runes ($state, $derived) to provide fine-grained reactivity.
 * - Holds static Configuration (layout rules), dynamic User State (active tabs, toggles).
 * - Maintains a registry of active components on the page and computes derived state.
 */
export class DataStore {
    /**
     * Static configuration loaded at startup.
     * Contains definitions for toggles, tab groups, and defaults.
     */
    config = $state<Config>({});

    /**
     * Mutable application state representing user choices.
     * Use actions like `setTab` or `setToggles` to modify this.
     */
    state = $state<State>({
        shownToggles: [],
        peekToggles: [],
        tabs: {}
    });

    /**
     * Registry of toggle IDs that are currently present in the DOM.
     * Used to filter the `visibleToggles` list.
     */
    activeToggles = $state<Set<string>>(new Set());

    /**
     * Registry of tab group IDs that are currently present in the DOM.
     * Used to filter the `visibleTabGroups` list.
     */
    activeTabGroups = $state<Set<string>>(new Set());

    // Derived: Filtered lists based on what's active on the page
    visibleToggles = $derived.by(() => {
        if (!this.config.toggles) return [];
        return this.config.toggles.filter(t => 
            !t.isLocal || this.activeToggles.has(t.id)
        );
    });

    visibleTabGroups = $derived.by(() => {
        if (!this.config.tabGroups) return [];
        return this.config.tabGroups.filter(g => 
            !g.isLocal || this.activeTabGroups.has(g.id)
        );
    });

    hasActiveComponents = $derived(
        this.visibleToggles.length > 0 || this.visibleTabGroups.length > 0
    );

    constructor(initialConfig: Config = {}) {
        this.config = initialConfig;
        if (initialConfig.defaultState) {
            this.state = this.cloneState(initialConfig.defaultState);
        } else {
            this.state = this.computeDefaultState();
        }
    }

    // --- Actions ---

    /**
     * Set the active tab for a specific tab group.
     * @param groupId The ID of the tab group.
     * @param tabId The ID of the tab to select.
     */
    setTab(groupId: string, tabId: string) {
        // Create a new object to ensure reactivity triggers if nested (though proxies handle fine usually)
        if (!this.state.tabs) this.state.tabs = {};
        this.state.tabs[groupId] = tabId;
    }

    /**
     * Update the visibility of toggles.
     * @param shown List of IDs for toggles in "Show" state.
     * @param peek List of IDs for toggles in "Peek" state.
     */
    setToggles(shown: ToggleId[], peek: ToggleId[]) {
        this.state.shownToggles = shown;
        this.state.peekToggles = peek;
    }

    /**
     * Updates the full state (e.g. from URL or Persistence).
     * Merges the new state with computed defaults to ensure completeness.
     * @param newState Partial state object to apply.
     */
    applyState(newState: State) {
        // Merge with defaults to prevent partial states from breaking things
        const defaults = this.computeDefaultState();
        this.state = {
            shownToggles: newState.shownToggles ?? defaults.shownToggles ?? [],
            peekToggles: newState.peekToggles ?? defaults.peekToggles ?? [],
            tabs: { ...defaults.tabs, ...newState.tabs }
        };
    }

    /**
     * Resets the application state to the computed defaults (defined in config).
     */
    reset() {
        this.state = this.computeDefaultState();
    }

    // --- Registry Actions ---
    
    /**
     * Registers a toggle as active on the current page.
     * @param id The ID of the toggle found in the DOM.
     */
    registerToggle(id: string) {
        this.activeToggles.add(id);
    }
    
    /**
     * Registers a tab group as active on the current page.
     * @param id The ID of the tab group found in the DOM.
     */
    registerTabGroup(id: string) {
        this.activeTabGroups.add(id);
    }

    /**
     * Clears the component registry.
     * Should be called when scanning a fresh part of the DOM or resetting.
     */
    clearRegistry() {
        this.activeToggles.clear();
        this.activeTabGroups.clear();
    }

    // --- Helpers ---

    private cloneState(state: State): State {
        return JSON.parse(JSON.stringify(state));
    }

    private computeDefaultState(): State {
        if (this.config.defaultState) {
             return this.cloneState(this.config.defaultState);
        }

        const tabs: Record<string, string> = {};
        
        // Default: First tab of each group
        if (this.config.tabGroups) {
            this.config.tabGroups.forEach(group => {
                if (group.tabs && group.tabs.length > 0) {
                     const firstTab = group.tabs[0];
                     if (firstTab?.id) {
                         tabs[group.id] = firstTab.id;
                     }
                }
            });
        }

        // Default: All toggles shown (if logic implies all enabled by default, 
        // essentially we assume empty shownToggles means none explicitly shown unless logic dictates otherwise. 
        // Original core logic: "all toggles on". Let's match original logic.)
        const shownToggles = this.config.toggles?.map(t => t.id) || [];

        return {
            shownToggles,
            peekToggles: [],
            tabs
        };
    }
}
