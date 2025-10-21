import type { State, TabGroupConfig, Config } from "../types/types";
import type { AssetsManager } from "./assets-manager";
import { PersistenceManager } from "./persistence";
import { URLStateManager } from "./url-state-manager";
import { VisibilityManager } from "./visibility-manager";
import { TabManager } from "./tab-manager";
import { ToggleManager } from "./toggle-manager";
import { injectCoreStyles } from "../styles/styles";


export interface CustomViewsOptions {
  assetsManager: AssetsManager;
  config: Config;
  rootEl?: HTMLElement | undefined;
  showUrl?: boolean;
}

export class CustomViewsCore {
  private rootEl: HTMLElement;
  private assetsManager: AssetsManager;
  private persistenceManager: PersistenceManager;
  private visibilityManager: VisibilityManager;

  private config: Config;
  private stateChangeListeners: Array<() => void> = [];
  private showUrlEnabled: boolean;
  private lastAppliedState: State | null = null;

  constructor(opt: CustomViewsOptions) {
    this.assetsManager = opt.assetsManager;
    this.config = opt.config;
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager();
    this.visibilityManager = new VisibilityManager();
    this.showUrlEnabled = opt.showUrl ?? false;
    this.lastAppliedState = this.cloneState(this.config?.defaultState);
  }

  public getConfig(): Config {
    return this.config;
  }

  /**
   * Get tab groups from config
   */
  public getTabGroups(): TabGroupConfig[] | undefined {
    return this.config.tabGroups;
  }

  /**
   * Get currently active tabs (from URL > persisted (localStorage) > defaults)
   */
  public getCurrentActiveTabs(): Record<string, string> {
    if (this.lastAppliedState?.tabs) {
      return { ...this.lastAppliedState.tabs };
    }

    const persistedState = this.persistenceManager.getPersistedState();
    if (persistedState?.tabs) {
      return { ...persistedState.tabs };
    }

    return this.config?.defaultState?.tabs ? { ...this.config.defaultState.tabs } : {};
  }

  /**
   * Set active tab for a group and apply state
   */
  public setActiveTab(groupId: string, tabId: string, groupEl?: HTMLElement): void {
    // If groupEl is provided, apply tab selection locally to just that element
    // Single-click: only updates DOM visually, no persistence
    if (groupEl) {
      TabManager.applyTabLocalOnly(groupEl, tabId);
      
      // Update nav active state for this group element only
      TabManager.updateNavActiveState(groupEl, tabId);

      // Emit custom event for local tab change
      const event = new CustomEvent('customviews:tab-change', {
        detail: { groupId, tabId, synced: false },
        bubbles: true
      });
      document.dispatchEvent(event);
    }
  }

  // Inject styles, setup listeners and call rendering logic
  public async init() {
    injectCoreStyles();

    // Build navigation once (with click and double-click handlers)
    TabManager.buildNavs(
      this.rootEl,
      this.config.tabGroups,
      // Single click: update clicked group only (local, no persistence)
      (groupId, tabId, groupEl) => {
        this.setActiveTab(groupId, tabId, groupEl);
      },
      // Double click: sync across all tabgroups with same id (with persistence)
      (groupId, tabId, _groupEl) => {
        const currentTabs = this.getCurrentActiveTabs();
        currentTabs[groupId] = tabId;
        
        const currentToggles = this.getCurrentActiveToggles();
        const newState: State = {
          toggles: currentToggles,
          tabs: currentTabs
        };
        // applyState() will handle all visual updates via renderState()
        this.applyState(newState);
      }
    );

    // Apply stored nav visibility preference on page load
    try {
      const navPref = localStorage.getItem('cv-tab-navs-visible');
      if (navPref !== null) {
        const visible = navPref === 'true';
        TabManager.setNavsVisibility(this.rootEl, visible);
      }
    } catch (e) { /* ignore */ }

    // For session history, clicks on back/forward button
    window.addEventListener("popstate", () => {
      this.loadAndCallApplyState();
    });
    this.loadAndCallApplyState();
  }

  // Priority: URL state > persisted state > default
  // Also filters using the visibility manager to persist selection
  // across back/forward button clicks
  private async loadAndCallApplyState() {
    // 1. URL State
    const urlState = URLStateManager.parseURL();
    if (urlState) {
      this.applyState(urlState);
      return;
    }

    // 2. Persisted State
    const persistedState = this.persistenceManager.getPersistedState();
    if (persistedState) {
      this.applyState(persistedState);
      return;
    }

    // 3. Local Config Fallback
    this.renderState(this.config.defaultState);
  }

  /**
  * Apply a custom state, saves to localStorage and updates the URL
  */
  public applyState(state: State) {
    const snapshot = this.cloneState(state);
    this.renderState(snapshot);
    this.persistenceManager.persistState(snapshot);
    if (this.showUrlEnabled) {
      URLStateManager.updateURL(snapshot);
    } else {
      URLStateManager.clearURL();
    }
  }

  /** Render all toggles for the current state */
  private renderState(state: State) {
    this.lastAppliedState = this.cloneState(state);
    const toggles = state.toggles || [];
    const finalToggles = this.visibilityManager.filterVisibleToggles(toggles);

    // Apply toggle visibility
    ToggleManager.applyToggles(this.rootEl, finalToggles);

    // Render assets into toggles
    ToggleManager.renderAssets(this.rootEl, finalToggles, this.assetsManager);

    // Apply tab selections
    TabManager.applySelections(this.rootEl, state.tabs || {}, this.config.tabGroups);

    // Update nav active states (without rebuilding)
    TabManager.updateAllNavActiveStates(this.rootEl, state.tabs || {}, this.config.tabGroups);

    // Notify state change listeners (like widgets)
    this.notifyStateChangeListeners();
  }

  /**
   * Reset to default state
   */
  public resetToDefault() {
    this.persistenceManager.clearAll();

    if (this.config) {
      this.renderState(this.config.defaultState);
    } else {
      console.warn("No configuration loaded, cannot reset to default state");
    }

    // Clear URL
    URLStateManager.clearURL();
  }


  /**
   * Get the currently active toggles regardless of whether they come from custom state or default configuration
   */
  public getCurrentActiveToggles(): string[] {
    if (this.lastAppliedState) {
      return this.lastAppliedState.toggles || [];
    }

    if (this.config) {
      return this.config.defaultState.toggles || [];
    }

    return [];
  }

  /**
   * Clear all persistence and reset to default
   */
  public clearPersistence() {
    this.persistenceManager.clearAll();
    if (this.config) {
      this.renderState(this.config.defaultState);
    } else {
      console.warn("No configuration loaded, cannot reset to default state");
    }

    URLStateManager.clearURL();
  }

  public setOption(flag: string, value: unknown): void {
    switch (flag) {
      case 'showUrl': {
        const nextValue = Boolean(value);
        if (this.showUrlEnabled === nextValue) {
          return;
        }

        this.showUrlEnabled = nextValue;
        if (nextValue) {
          const stateForUrl = this.getTrackedStateSnapshot();
          URLStateManager.updateURL(stateForUrl);
        } else {
          URLStateManager.clearURL();
        }
        break;
      }
      default:
        console.warn(`[CustomViews] Unknown option '${flag}' passed to setOption`);
    }
  }

  // === STATE CHANGE LISTENER METHODS ===
  /**
   * Add a listener that will be called whenever the state changes
   */
  public addStateChangeListener(listener: () => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove a state change listener
   */
  public removeStateChangeListener(listener: () => void): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all state change listeners
   */
  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.warn('Error in state change listener:', error);
      }
    });
  }

  private cloneState(state?: State | null): State {
    if (!state) return { };
    return JSON.parse(JSON.stringify(state));
  }

  private getTrackedStateSnapshot(): State {
    if (this.lastAppliedState) {
      return this.cloneState(this.lastAppliedState);
    }

    if (this.config) {
      return this.cloneState(this.config.defaultState);
    }

    return {};
  }

}






