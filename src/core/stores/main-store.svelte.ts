import { SvelteSet } from 'svelte/reactivity';
import type { Config, State, TabGroupConfig } from "../../types/types";
import type { AssetsManager } from "../managers/assets-manager";
import { placeholderValueStore } from "./placeholder-value-store.svelte";
import { placeholderRegistryStore } from "./placeholder-registry-store.svelte";


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
     * Use actions like `setPinnedTab` or `setToggles` to modify this.
     */
    state = $state<State>({
        shownToggles: [],
        peekToggles: [],
        tabs: {}
    });

    /**
     * Registry of toggle IDs that are currently present in the DOM.
     * Used to filter the `menuToggles` list.
     */
    detectedToggles = $state<SvelteSet<string>>(new SvelteSet());

    /**
     * Registry of tab group IDs that are currently present in the DOM.
     * Used to filter the `menuTabGroups` list.
     */
    detectedTabGroups = $state<SvelteSet<string>>(new SvelteSet());

    /**
     * Registry of placeholder names that are currently present in the DOM.
     * Used to filter `isLocal` placeholders in settings.
     */
    detectedPlaceholders = $state<SvelteSet<string>>(new SvelteSet());

    /**
     * Controls the visibility of the tab navigation headers globally.
     */
    isTabGroupNavHeadingVisible = $state(true);

    /**
     * Assets manager for rendering dynamic content into toggle elements.
     */
    assetsManager = $state<AssetsManager | undefined>(undefined);

    // Menu toggles are those that are either global or 
    // local but present and registered in the DOM
    menuToggles = $derived.by(() => {
        if (!this.config.toggles) return [];
        return this.config.toggles.filter(t => 
            !t.isLocal || this.detectedToggles.has(t.toggleId)
        );
    });

    menuTabGroups = $derived.by(() => {
        if (!this.config.tabGroups) return [];
        return this.config.tabGroups.filter(g => 
            !g.isLocal || this.detectedTabGroups.has(g.groupId)
        );
    });

    hasMenuOptions = $derived(
        this.menuToggles.length > 0 || this.menuTabGroups.length > 0
    );

    /**
     * Returns true if there are any active components (toggles or tab groups) actually present in the DOM.
     * This is distinct from `hasMenuOptions` which checks if there are ANY non-local components configured.
     */
    hasPageElements = $derived(
        this.detectedToggles.size > 0 || this.detectedTabGroups.size > 0
    );

    constructor(initialConfig: Config = {}) {
        this.config = initialConfig;
        this.state = this.computeDefaultState();
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
        this.detectedToggles.add(id);
    }
    
    /**
     * Registers a tab group as active on the current page.
     * @param id The ID of the tab group found in the DOM.
     */
    registerTabGroup(id: string) {
        this.detectedTabGroups.add(id);

        // Register corresponding placeholder if defined
        const groupConfig = this.config.tabGroups?.find(g => g.groupId === id);
        if (!groupConfig) return;

        this.registerPlaceholderFromTabGroup(groupConfig);
    }

    /**
     * Registers a placeholder variable as active on the current page.
     * @param name The name of the placeholder found in the DOM.
     */
    registerPlaceholder(name: string) {
        this.detectedPlaceholders.add(name);
    }

    /**
     * Clears the component registry.
     * Should be called when scanning a fresh part of the DOM or resetting.
     */
    clearRegistry() {
        this.detectedToggles.clear();
        this.detectedTabGroups.clear();
        this.detectedPlaceholders.clear();
    }

    clearDetectedPlaceholders() {
        this.detectedPlaceholders.clear();
    }

    /**
     * Sets the assets manager for dynamic content rendering.
     */
    setAssetsManager(manager: AssetsManager) {
        this.assetsManager = manager;
    }

    // --- Helpers ---

    private registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig) {
        if (!groupConfig.placeholderId) return;

        const id = groupConfig.placeholderId;
        const existing = placeholderRegistryStore.get(id);

        if (existing) {
            // Conflict Detection Logic
            if (existing.source === 'config') {
                console.warn(
                    `[CustomViews] Tab group "${groupConfig.groupId}" is binding to placeholder "${id}", ` +
                    `which is already explicitly defined in placeholders config. ` +
                    `To avoid unexpected behavior, placeholders should have a single source of truth.`
                );
            } else if (existing.source === 'tabgroup' && existing.ownerTabGroupId !== groupConfig.groupId) {
                console.warn(
                    `[CustomViews] Multiple tab groups are binding to the same placeholderId: "${id}". ` +
                    `Current group: "${groupConfig.groupId}", Existing group: "${existing.ownerTabGroupId}". ` +
                    `This will cause race conditions as both groups compete for the same value.`
                );
            }
            
            // Strict Precedence: If the placeholder already exists, we do nothing.
            // This ensures config definitions cannot be overwritten by tab groups.
            return;
        }

        // Register new tab-bound placeholder
        placeholderRegistryStore.register({
            name: id,
            settingsLabel: groupConfig.label ?? groupConfig.groupId,
            hiddenFromSettings: true,
            source: 'tabgroup',
            ownerTabGroupId: groupConfig.groupId
        });

        // Initial Sync: Ensures the store value matches the initial tab choice
        const activeTabId = this.state.tabs?.[groupConfig.groupId];
        if (activeTabId) {
            this.updatePlaceholderFromTabInput(groupConfig.groupId, activeTabId);
        }
    }

    private updatePlaceholderFromTabInput(groupId: string, tabId: string) {
        const groupConfig = this.config.tabGroups?.find(g => g.groupId === groupId);

        if (!groupConfig || !groupConfig.placeholderId) return;
        
        if (!placeholderRegistryStore.has(groupConfig.placeholderId)) return;

        const tabConfig = groupConfig.tabs.find(t => t.tabId === tabId);

        if (!tabConfig) return;

        const placeholderValue = tabConfig.placeholderValue ?? "";
        placeholderValueStore.set(groupConfig.placeholderId, placeholderValue);
    }

    public computeDefaultState(): State {
        const shownToggles: string[] = [];
        const peekToggles: string[] = [];
        const tabs: Record<string, string> = {};

        // 1. Process Toggles
        if (this.config.toggles) {
            this.config.toggles.forEach(toggle => {
                if (toggle.default === 'peek') {
                    peekToggles.push(toggle.toggleId);
                } else if (toggle.default === 'hide') {
                    // Start hidden
                } else {
                    // 'show' is the implicit default (or if explicitly set to 'show')
                    shownToggles.push(toggle.toggleId);
                }
            });
        }

        // 2. Process Tab Groups
        if (this.config.tabGroups) {
            this.config.tabGroups.forEach(group => {
                // If a specific default tab is configured, use it
                if (group.default) {
                    tabs[group.groupId] = group.default;
                } 
                // Fallback: Use the first tab if no specific default is set
                else if (group.tabs && group.tabs.length > 0) {
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
            tabs
        };
    }
}

// Hollow Singleton - created immediately with empty state
// Runs once once, cached and returns same store instance.
export const store = new DataStore({});

/**
 * Initialize the store with actual configuration.
 * This populates the hollow singleton with real data.
 */
export function initStore(config: Config): DataStore {
    // Mutate config in place to preserve reactivity
    Object.assign(store.config, config);
    
    // Compute new state
    const newState = store.computeDefaultState();
    
    // Mutate state properties in place to preserve reactivity
    store.state.shownToggles = newState.shownToggles ?? [];
    store.state.peekToggles = newState.peekToggles ?? [];
    store.state.tabs = newState.tabs ?? {};
    
    // Process Global Placeholders from Config
    if (config.placeholders) {
        config.placeholders.forEach(def => {
            placeholderRegistryStore.register({
                ...def,
                source: 'config'
            });
        });
    }

    return store;
}
