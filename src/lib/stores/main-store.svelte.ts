
import type { Config, ConfigFile, State, TabGroupConfig } from '$lib/types/index';

import type { AssetsManager } from '../assets';
import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import { ElementStore } from './element-store.svelte';
import { ActiveStateStore } from './active-state-store.svelte';
import { UIStore } from './ui-store.svelte';

/**
 * Reactive Data Store for CustomViews application state.
 *
 * Uses Svelte 5 Runes ($state, $derived) to provide fine-grained reactivity.
 * - Holds static Configuration (layout rules), dynamic User State (active tabs, toggles).
 * - Maintains a registry of active components on the page and computes derived state.
 * 
 * @deprecated This store is now a facade. Use `elementStore`, `activeStateStore`, or `uiStore` directly if possible.
 */
export class DataStore {
  elementStore = new ElementStore();
  activeStateStore = new ActiveStateStore();
  uiStore = new UIStore();

  /**
   * Static configuration loaded at startup.
   */
  get config() { return this.activeStateStore.config; }

  /**
   * Explicit order of sections derived from the initial configuration JSON.
   */
  get configSectionOrder() { return this.activeStateStore.configSectionOrder; }

  /**
   * Mutable application state representing user choices.
   */
  get state() { return this.activeStateStore.state; }
  set state(v) { this.activeStateStore.state = v; }

  /**
   * Registry of toggle IDs that are currently present in the DOM.
   */
  get detectedToggles() { return this.elementStore.detectedToggles; }

  /**
   * Registry of tab group IDs that are currently present in the DOM.
   */
  get detectedTabGroups() { return this.elementStore.detectedTabGroups; }

  /**
   * Registry of placeholder names that are currently present in the DOM.
   */
  get detectedPlaceholders() { return this.elementStore.detectedPlaceholders; }

  /**
   * UI Configuration Options
   */
  get uiOptions() { return this.uiStore.uiOptions; }
  set uiOptions(v) { this.uiStore.uiOptions = v; }

  /**
   * Controls the visibility of the tab navigation headers globally.
   */
  get isTabGroupNavHeadingVisible() { return this.uiStore.isTabGroupNavHeadingVisible; }
  set isTabGroupNavHeadingVisible(v) { this.uiStore.isTabGroupNavHeadingVisible = v; }

  /**
   * Assets manager for rendering dynamic content into toggle elements.
   */
  assetsManager = $state<AssetsManager | undefined>(undefined);

  // Menu toggles are those that are either global or
  // local but present and registered in the DOM
  menuToggles = $derived.by(() => {
    if (!this.config.toggles) return [];
    return this.config.toggles.filter((t) => !t.isLocal || this.detectedToggles.has(t.toggleId));
  });

  menuTabGroups = $derived.by(() => {
    if (!this.config.tabGroups) return [];
    return this.config.tabGroups.filter((g) => !g.isLocal || this.detectedTabGroups.has(g.groupId));
  });

  hasVisiblePlaceholders = $derived.by(() => {
    return placeholderRegistryStore.definitions.some((d) => {
      if (d.hiddenFromSettings) return false;
      if (d.isLocal) {
        return this.detectedPlaceholders.has(d.name);
      }
      return true;
    });
  });

  hasMenuOptions = $derived(
    this.menuToggles.length > 0 ||
      this.menuTabGroups.length > 0 ||
      this.hasVisiblePlaceholders,
  );

  /**
   * Returns true if there are any active components (toggles or tab groups) actually present in the DOM.
   */
  get hasPageElements() { return this.elementStore.hasPageElements; }

  constructor(initialConfig: Config = {}) {
    // Pass initial config to activeStateStore to ensure it's initialized immediately,
    // although initStore() will typically be called later with the full config.
    if (initialConfig && Object.keys(initialConfig).length > 0) {
      this.activeStateStore.init(initialConfig);
    }
  }

  // --- Actions ---

  setPinnedTab(groupId: string, tabId: string) {
    this.activeStateStore.setPinnedTab(groupId, tabId);
  }

  setToggles(shown: string[], peek: string[]) {
    this.activeStateStore.setToggles(shown, peek);
  }

  applyState(newState: State) {
    this.activeStateStore.applyState(newState);
  }

  reset() {
    this.activeStateStore.reset();
    this.uiStore.reset();
  }

  // --- Registry Actions ---

  registerToggle(id: string) {
    this.elementStore.registerToggle(id);
  }

  registerTabGroup(id: string) {
    this.elementStore.registerTabGroup(id);
  }

  registerPlaceholder(name: string) {
    this.elementStore.registerPlaceholder(name);
  }

  clearRegistry() {
    this.elementStore.clearRegistry();
  }

  clearDetectedPlaceholders() {
    this.elementStore.clearDetectedPlaceholders();
  }

  setAssetsManager(manager: AssetsManager) {
    this.assetsManager = manager;
  }

  setUIOptions(options: {
    showTabGroups?: boolean;
    showReset?: boolean;
    title?: string;
    description?: string;
  }) {
    this.uiStore.setUIOptions(options);
  }

  // --- Helpers ---

  public registerPlaceholderFromTabGroup(groupConfig: TabGroupConfig) {
    this.activeStateStore.registerPlaceholderFromTabGroup(groupConfig);
  }

  public computeDefaultState(): State {
    return this.activeStateStore.computeDefaultState();
  }
}

// Hollow Singleton - created immediately with empty state
// Runs once once, cached and returns same store instance.
export const store = new DataStore({});

/**
 * Initialize the store with actual configuration.
 * This populates the hollow singleton with real data.
 */
export function initStore(configFile: ConfigFile): DataStore {
  const config = configFile.config || {};
  const settings = configFile.settings?.panel || {};

  // Process Global Placeholders from Config
  if (config.placeholders) {
    config.placeholders.forEach((def) => {
      placeholderRegistryStore.register({
        ...def,
        source: 'config',
      });
    });
  }

  // Initialize ActiveStateStore with config
  store.activeStateStore.init(config);
  
  // activeStateStore.init() computes defaults and resets state.
  // This ensures the store starts with a valid state based on the provided config.
  
  // Initialize UI Options from Settings
  store.uiStore.setUIOptions({
    showTabGroups: settings.showTabGroups ?? true,
    showReset: settings.showReset ?? true,
    title: settings.title ?? 'Customize View',
    description: settings.description ?? '',
  });



  return store;
}
