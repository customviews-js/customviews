import type { State, TabGroupConfig, Config } from "../types/types";
import type { AssetsManager } from "./assets-manager";
import { PersistenceManager } from "./persistence";
import { URLStateManager } from "./url-state-manager";
import { VisibilityManager } from "./visibility-manager";
import { TabManager } from "./tab-manager";
import { ToggleManager } from "./toggle-manager";
import { ScrollManager } from "../utils/scroll-manager";
import { injectCoreStyles } from "../styles/styles";

const TOGGLE_SELECTOR = "[data-cv-toggle], [data-customviews-toggle], cv-toggle";
const TABGROUP_SELECTOR = 'cv-tabgroup';

interface ComponentRegistry {
  toggles: Set<HTMLElement>;
  tabGroups: Set<HTMLElement>;
}

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
  private observer: MutationObserver | null = null;

  private componentRegistry: ComponentRegistry = {
    toggles: new Set(),
    tabGroups: new Set(),
  };

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
    this.lastAppliedState = this.cloneState(this.getComputedDefaultState());
  }

  /**
   * Scan the given element for toggles and tab groups, register them
   * Returns true if new components were found
   */
  private scan(element: HTMLElement): boolean {
    let newComponentsFound = false;

    // Scan for toggles
    const toggles = Array.from(element.querySelectorAll(TOGGLE_SELECTOR));
    if (element.matches(TOGGLE_SELECTOR)) {
      toggles.unshift(element);
    }
    toggles.forEach((toggle) => {
      if (!this.componentRegistry.toggles.has(toggle as HTMLElement)) {
        this.componentRegistry.toggles.add(toggle as HTMLElement);
        newComponentsFound = true;
      }
    });

    // Scan for tab groups
    const tabGroups = Array.from(element.querySelectorAll(TABGROUP_SELECTOR));
    if (element.matches(TABGROUP_SELECTOR)) {
      tabGroups.unshift(element);
    }
    tabGroups.forEach((tabGroup) => {
      if (!this.componentRegistry.tabGroups.has(tabGroup as HTMLElement)) {
        this.componentRegistry.tabGroups.add(tabGroup as HTMLElement);
        newComponentsFound = true;
      }
    });

    return newComponentsFound;
  }

  /**
   * Unscan the given element for toggles and tab groups, de-register them
   */
  private unscan(element: HTMLElement): void {
    // Unscan for toggles
    const toggles = Array.from(element.querySelectorAll(TOGGLE_SELECTOR));
    if (element.matches(TOGGLE_SELECTOR)) {
      toggles.unshift(element);
    }
    toggles.forEach((toggle) => {
      this.componentRegistry.toggles.delete(toggle as HTMLElement);
    });

    // Unscan for tab groups
    const tabGroups = Array.from(element.querySelectorAll(TABGROUP_SELECTOR));
    if (element.matches(TABGROUP_SELECTOR)) {
      tabGroups.unshift(element);
    }
    tabGroups.forEach((tabGroup) => {
      this.componentRegistry.tabGroups.delete(tabGroup as HTMLElement);
    });
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
   * Generate a computed default state:
   * - If config.defaultState is defined, use it (even if empty)
   * - Otherwise, compute a default: enable all toggles and set all tab groups to their first tab
   */
  private getComputedDefaultState(): State {
    const configDefaultState = this.config?.defaultState;
    
    // If defaultState is explicitly defined in config, use it as-is
    if (configDefaultState !== undefined) {
      return configDefaultState;
    }

    // Otherwise, compute a default state: all toggles on, all tabs to first
    const tabs: Record<string, string> = {};
    
    // Set all tab groups to their first tab
    if (this.config.tabGroups?.length) {
      this.config.tabGroups.forEach(group => {
        if (group.tabs && group.tabs.length > 0) {
          const firstTab = group.tabs[0];
          if (firstTab?.id) {
            tabs[group.id] = firstTab.id;
          }
        }
      });
    }

    const computedState: State = {
      toggles: this.config.toggles?.map(t => t.id) || [],
      tabs
    };

    return computedState;
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

    return this.getComputedDefaultState().tabs || {};
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
    this.scan(this.rootEl);

    // Initialize all components found on initial scan
    this.initializeNewComponents();

    // Apply stored nav visibility preference on page load
    const navPref = this.persistenceManager.getPersistedTabNavVisibility();
    if (navPref !== null) {
      TabManager.setNavsVisibility(this.rootEl, navPref);
    }

    // For session history, clicks on back/forward button
    window.addEventListener("popstate", () => {
      this.loadAndCallApplyState();
    });
    this.loadAndCallApplyState();
    this.initObserver();
  }

  private initializeNewComponents(): void {
    // Build navigation for any newly added tab groups.
    // The `data-cv-initialized` attribute in `buildNavs` prevents re-initialization.
    TabManager.buildNavs(
      Array.from(this.componentRegistry.tabGroups),
      this.config.tabGroups,
      // Single click: update clicked group only (local, no persistence)
      (groupId, tabId, groupEl) => {
        this.setActiveTab(groupId, tabId, groupEl);
      },
      // Double click: sync across all tabgroups with same id (with persistence)
      (groupId, tabId, groupEl) => {
        // 1. Record position before state change
        const navHeader = groupEl.querySelector('.cv-tabs-nav');
        const anchorElement = navHeader instanceof HTMLElement ? navHeader : groupEl;
        const initialTop = anchorElement.getBoundingClientRect().top;

        const currentTabs = this.getCurrentActiveTabs();
        currentTabs[groupId] = tabId;
        
        const currentToggles = this.getCurrentActiveToggles();
        const newState: State = {
          toggles: currentToggles,
          tabs: currentTabs
        };

        // 2. Apply state with scroll anchor information
        this.applyState(newState, { 
          scrollAnchor: { element: anchorElement, top: initialTop } 
        });
      }
    );

    // Future components (e.g., toggles, widgets) can be initialized here
  }

  private initObserver() {
    this.observer = new MutationObserver((mutations) => {
      let newComponentsFound = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              // Scan the new node for components and add them to the registry
              if (this.scan(node as HTMLElement)) {
                newComponentsFound = true;
              }
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element) {
              // Unscan the removed node to cleanup the registry
              this.unscan(node as HTMLElement);
            }
          });
        }
      }

      if (newComponentsFound) {
        // Initialize navs for new components.
        this.initializeNewComponents();
        
        // Re-apply the last known state. renderState will handle disconnecting
        // the observer to prevent infinite loops.
        if (this.lastAppliedState) {
          this.renderState(this.lastAppliedState);
        }
      }
    });

    // Observe only the root element to avoid performance issues on large pages.
    if (this.rootEl) {
      this.observer.observe(this.rootEl, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Priority: URL state > persisted state > config default > computed default
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

    // 3. Computed Default Fallback
    this.renderState(this.getComputedDefaultState());
  }

  /**
  * Apply a custom state, saves to localStorage and updates the URL
  * Add 'source' in options to indicate the origin of the state change
  * (e.g., 'widget' to trigger scroll behavior)
  * Add scrollAnchor in options to maintain scroll position of a specific element
  */
  public applyState(state: State, options?: { source?: string; scrollAnchor?: { element: HTMLElement; top: number; }; }) {
    // console.log(`[Core] applyState called with source: ${options?.source}`, state);
    
    let groupToScrollTo: HTMLElement | null = null;
    if (options?.source === 'widget') {
      groupToScrollTo = ScrollManager.findHighestVisibleTabGroup();
    }

    const snapshot = this.cloneState(state);
    this.renderState(snapshot);
    this.persistenceManager.persistState(snapshot);
    if (this.showUrlEnabled) {
      URLStateManager.updateURL(snapshot);
    } else {
      URLStateManager.clearURL();
    }

    if (groupToScrollTo) {
      // Defer scrolling until after the DOM has been updated by renderState
      queueMicrotask(() => {
        ScrollManager.scrollToTabGroup(groupToScrollTo as HTMLElement);
      });
    }

    // Handle scroll anchoring for double-clicks
    // scroll to original position after content changes
    if (options?.scrollAnchor) {
      ScrollManager.handleScrollAnchor(options.scrollAnchor);
    }
  }

  /** 
   * Renders state on components in ComponentRegistry
   * Applies the given state.
   * Disconnects the mutation observer during rendering to prevent loops
   **/
  private renderState(state: State) {
    this.observer?.disconnect();
    this.lastAppliedState = this.cloneState(state);
    const toggles = state?.toggles || [];
    const finalToggles = this.visibilityManager.filterVisibleToggles(toggles);

    const toggleElements = Array.from(this.componentRegistry.toggles);
    const tabGroupElements = Array.from(this.componentRegistry.tabGroups);

    // Apply toggle visibility
    ToggleManager.applyToggles(toggleElements, finalToggles);

    // Render assets into toggles
    ToggleManager.renderAssets(toggleElements, finalToggles, this.assetsManager);

    // Apply tab selections
    TabManager.applyTabSelections(tabGroupElements, state.tabs || {}, this.config.tabGroups);

    // Update nav active states (without rebuilding)
    TabManager.updateAllNavActiveStates(tabGroupElements, state.tabs || {}, this.config.tabGroups);

    // Update pin icons to show which tabs are persisted
    TabManager.updatePinIcons(tabGroupElements, state.tabs || {});

    // Notify state change listeners (like widgets)
    this.notifyStateChangeListeners();
    this.observer?.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Reset to default state
   */
  public resetToDefault() {
    this.persistenceManager.clearAll();

    if (this.config) {
      this.renderState(this.getComputedDefaultState());
    } else {
      console.warn("No configuration loaded, cannot reset to default state");
    }

    // Reset tab nav visibility to default (visible)
    TabManager.setNavsVisibility(this.rootEl, true);

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
      return this.getComputedDefaultState().toggles || [];
    }

    return [];
  }

  /**
   * Clear all persistence and reset to default
   */
  public clearPersistence() {
    this.persistenceManager.clearAll();
    if (this.config) {
      this.renderState(this.getComputedDefaultState());
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

  /**
   * Persist tab nav visibility preference
   */
  public persistTabNavVisibility(visible: boolean): void {
    this.persistenceManager.persistTabNavVisibility(visible);
  }

  /**
   * Get persisted tab nav visibility preference
   */
  public getPersistedTabNavVisibility(): boolean | null {
    return this.persistenceManager.getPersistedTabNavVisibility();
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
      return this.cloneState(this.getComputedDefaultState());
    }

    return {};
  }

}






