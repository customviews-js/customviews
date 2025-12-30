import type { Config, TabGroupElement, TabGroupConfig } from "../types/types";
import type { AssetsManager } from "./managers/assets-manager";

import { PersistenceManager } from "./state/persistence";
import { URLStateManager } from "./state/url-state-manager";
import { VisibilityManager } from "./managers/visibility-manager";
import { ToggleManager } from "./managers/toggle-manager";
import { ScrollManager } from "../utils/scroll-manager";
import { injectCoreStyles } from "../styles/styles";
import { ShareManager } from "./managers/share-manager";
import { FocusManager } from "./managers/focus-manager";
import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from './state/config';
import { DataStore } from "./state/data-store.svelte";

const TOGGLE_SELECTOR = "[data-cv-toggle], [data-customviews-toggle], cv-toggle";
const TABGROUP_SELECTOR = 'cv-tabgroup';
const TAB_SELECTOR = 'cv-tab';

interface ComponentRegistry {
  toggles: Set<HTMLElement>;
  tabGroups: Set<TabGroupElement>;
}

export interface CustomViewsOptions {
  assetsManager: AssetsManager;
  config: Config;
  rootEl?: HTMLElement | undefined;
  showUrl?: boolean;
}

/**
 * The Reactive Binder for CustomViews, coordinates interaction between DataStore and other components. (DOM, URL, Persistence)
 * It uses Svelte 5 Effects ($effect) to automatically apply state changes 
 * from `this.store` to the DOM/URL.
 */
export class CustomViewsCore {
  /**
   * The single source of truth for application state.
   */
  public store: DataStore;
  
  private rootEl: HTMLElement;
  private assetsManager: AssetsManager;
  private persistenceManager: PersistenceManager;
  private visibilityManager: VisibilityManager;
  private observer: MutationObserver | null = null;
  private shareManager: ShareManager;
  private focusManager: FocusManager;
  
  private showUrlEnabled: boolean;

  private componentRegistry: ComponentRegistry = {
    toggles: new Set(),
    tabGroups: new Set(),
  };

  /**
   * Map to store cleanup functions for reactive effects attached to dynamic components.
   */
  private componentEffects = new Map<HTMLElement, () => void>();

  private destroyEffectRoot?: () => void;

  constructor(opt: CustomViewsOptions) {
    this.assetsManager = opt.assetsManager;
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager();
    this.visibilityManager = new VisibilityManager();
    this.showUrlEnabled = opt.showUrl ?? false;
    
    // Initialize Reactive Store
    this.store = new DataStore(opt.config);

    // Initial State Resolution: URL > Persistence > Default
    this.resolveInitialState();

    // Resolve Exclusions
    const excludedTags = [...DEFAULT_EXCLUDED_TAGS, ...(opt.config.shareExclusions?.tags || [])];
    const excludedIds = [...DEFAULT_EXCLUDED_IDS, ...(opt.config.shareExclusions?.ids || [])];
    const commonOptions = { excludedTags, excludedIds };

    this.shareManager = new ShareManager(commonOptions);
    this.focusManager = new FocusManager(this.rootEl, commonOptions);
  }

  private resolveInitialState() {
     // 1. URL State
     const urlState = URLStateManager.parseURL();
     if (urlState) {
       this.store.applyState(urlState);
       return;
     }
 
     // 2. Persisted State
     const persistedState = this.persistenceManager.getPersistedState();
     if (persistedState) {
        this.store.applyState(persistedState);
        return;
     }

     // 3. Defaults handled by Store constructor
  }

  public getShareManager(): ShareManager {
    return this.shareManager;
  }

  public toggleShareMode(): void {
    this.shareManager.toggleShareMode();
  }

  public getConfig(): Config {
    return this.store.config;
  }
  
  public getTabGroups() {
      return this.store.config.tabGroups;
  }

  /**
   * Initializes the CustomViews core.
   * 
   * 1. Injects core styles.
   * 2. Scans the DOM for components.
   * 3. Sets up Svelte Reactivity Root ($effect.root).
   * 4. Binds history events.
   */
  public async init() {
    injectCoreStyles();
    this.scan(this.rootEl);

    this.initializeNewComponents();

    const navPref = this.persistenceManager.getPersistedTabNavVisibility();
    if (navPref !== null) {
      this.store.isTabGroupNavHeadingVisible = navPref;
    }
    
    // Setup Global Reactivity using $effect.root
    this.destroyEffectRoot = $effect.root(() => {
        // Effect 1: Render Declarative Components (Toggles)
        // Note: TabGroups are now handled by individual effects in initializeNewComponents
        $effect(() => {
            this.render();
        });

        // Effect 2: Update URL
        $effect(() => {
            if (this.showUrlEnabled) {
                // Ensure we pass a snapshot or clone if updateURL mutates (it shouldn't)
                URLStateManager.updateURL(this.store.state);
            } else {
                URLStateManager.clearURL();
            }
        });

        // Effect 3: Persistence
        $effect(() => {
            this.persistenceManager.persistState(this.store.state);
            this.persistenceManager.persistTabNavVisibility(this.store.isTabGroupNavHeadingVisible);
        });
    });

    // Handle History Popstate
    window.addEventListener("popstate", () => {
       const urlState = URLStateManager.parseURL();
       if (urlState) {
          this.store.applyState(urlState);
       }
       this.focusManager.handleUrlChange();
    });

    this.focusManager.init();
    this.initObserver();
  }
  
  /**
   * The main DOM rendering effect for non-granular components (mainly Toggles for now).
   * 
   * This method is called automatically by Svelte whenever `this.store.state` changes.
   */
  private render() {
      // pause observer to avoid loops? 
      this.observer?.disconnect();
      
      const { shownToggles, peekToggles } = this.store.state;
      
      // Filter visible toggles
      const finalToggles = this.visibilityManager.filterVisibleToggles(shownToggles || []);
      
      const allToggleElements = Array.from(this.componentRegistry.toggles);

      // Apply Toggles
      ToggleManager.applyTogglesVisibility(allToggleElements, finalToggles, peekToggles || []);
      ToggleManager.renderToggleAssets(allToggleElements, finalToggles, this.assetsManager);

      this.observer?.observe(this.rootEl, {
        childList: true,
        subtree: true,
      });
  }

  // --- Scanning Logic (Kept mostly same, but updates global set in Store) ---

  private scan(element: HTMLElement): boolean {
    let newComponentsFound = false;

    // Scan for toggles
    const toggles = Array.from(element.querySelectorAll(TOGGLE_SELECTOR));
    if (element.matches(TOGGLE_SELECTOR)) toggles.unshift(element);
    
    toggles.forEach((el) => {
        const toggleEl = el as HTMLElement;
      if (!this.componentRegistry.toggles.has(toggleEl)) {
        this.componentRegistry.toggles.add(toggleEl);
        newComponentsFound = true;
        
        // Update Store Registry
        const id = toggleEl.dataset.cvToggle || toggleEl.dataset.customviewsToggle || toggleEl.getAttribute('cv-toggle');
        if (id) this.store.registerToggle(id);
      }
    });

    // Scan for tab groups
    const tabGroups = Array.from(element.querySelectorAll(TABGROUP_SELECTOR));
    if (element.matches(TABGROUP_SELECTOR)) tabGroups.unshift(element);
    
    tabGroups.forEach((el) => {
        const groupEl = el as HTMLElement;
      if (!this.componentRegistry.tabGroups.has(groupEl as TabGroupElement)) {
        this.componentRegistry.tabGroups.add(groupEl as TabGroupElement);
        newComponentsFound = true;
        
        // Update Store Registry
        const id = groupEl.id;
        if (id) this.store.registerTabGroup(id);
      }
    });

    return newComponentsFound;
  }
  
  private unscan(element: HTMLElement): void {
      const toggles = Array.from(element.querySelectorAll(TOGGLE_SELECTOR));
      if (element.matches(TOGGLE_SELECTOR)) toggles.unshift(element);
      toggles.forEach(t => this.componentRegistry.toggles.delete(t as HTMLElement));
      
      const tabGroups = Array.from(element.querySelectorAll(TABGROUP_SELECTOR));
      if (element.matches(TABGROUP_SELECTOR)) tabGroups.unshift(element);
      
      tabGroups.forEach(t => {
          const groupEl = t as TabGroupElement;
          this.componentRegistry.tabGroups.delete(groupEl);
          
          // Cleanup Effects
          const destroy = this.componentEffects.get(groupEl);
          if (destroy) {
              destroy();
              this.componentEffects.delete(groupEl);
          }
      });
  }

  private initializeNewComponents(): void {
    const groups = Array.from(this.componentRegistry.tabGroups);
    groups.forEach((groupEl) => {
        // Setup Reactivity if not already setup
        if (!this.componentEffects.has(groupEl)) {
             const cleanup = $effect.root(() => {
                $effect(() => {
                    const groupId = groupEl.getAttribute('id');
                    const tabsState = this.store.state.tabs || {};

                    // 1. Resolve Active Tab
                    let activeTabId: string | null = null;
                    if (groupId) {
                        activeTabId = this.resolveActiveTabForGroup(groupId, tabsState, this.store.config.tabGroups, groupEl as HTMLElement);
                    } else {
                         // Standalone logic
                         activeTabId = this.resolveActiveTabForStandalone(groupEl as HTMLElement);
                    }

                    if (activeTabId) {
                        groupEl.activeTabId = activeTabId;
                    }

                    // 2. Resolve Pinned Tab
                    if (groupId && tabsState[groupId]) {
                        groupEl.pinnedTabId = tabsState[groupId];
                    } else {
                        groupEl.pinnedTabId = '';
                    }

                    // 3. Resolve Nav Visibility
                    groupEl.isTabGroupNavHeadingVisible = this.store.isTabGroupNavHeadingVisible;
                });
             });
             this.componentEffects.set(groupEl, cleanup);
        }

        if (groupEl._listenersAttached) return;
        groupEl._listenersAttached = true;

        groupEl.addEventListener('tabchange', (e: any) => {
            const { tabId } = e.detail;
            const groupId = e.detail.groupId || groupEl.getAttribute('id');

            // Local update is handled by the component via prop, but we also ensure consistency?
            // Actually, if we update store, the effect triggers and updates the prop again.
            // This is "Controlled Component" pattern.
            
            // However, the component updates its local state immediately on click. 
            // We just need to notify others if synced.
            
            // Note: We don't need to manually set `groupEl.activeTabId` here because the component does it on click
            // BUT if we want true "Single Source of Truth", component should invoke callback and waiting for prop update?
            // Currently TabGroup.svelte: `activeTabId = tabId` then dispatch.
            // So it's optimistic.
            
            // Custom event for anyone listening (optional)
            document.dispatchEvent(new CustomEvent('customviews:tab-change', {
                detail: { groupId, tabId, synced: false },
                bubbles: true
            }));
        });

        groupEl.addEventListener('tabdblclick', (e: any) => {
            const { tabId } = e.detail;
            const groupId = e.detail.groupId || groupEl.getAttribute('id');
            
            // 1. Record position before state change
            const anchorElement = groupEl;
            const initialTop = anchorElement.getBoundingClientRect().top;

            // 2. Sync to store
            if (groupId) {
               this.store.setTab(groupId, tabId);
            }
            
            // 3. Restore position after DOM update (wait for tick)
            // Since we are using Svelte effects, we might need to wait for them to flush.
             queueMicrotask(() => { // or tick()
                ScrollManager.handleScrollAnchor({ element: anchorElement, top: initialTop });
            });
        });
    });
  }

  /**
   * Resolve the active tab for a group based on state, config, and DOM
   */
  private resolveActiveTabForGroup(
    groupId: string,
    tabs: Record<string, string>,
    cfgGroups: TabGroupConfig[] | undefined,
    groupEl: HTMLElement
  ): string | null {
    // 1. Check state
    if (tabs[groupId]) {
      return tabs[groupId];
    }

    // 2. Check config for first tab
    if (cfgGroups) {
      const groupCfg = cfgGroups.find(g => g.id === groupId);
      if (groupCfg) {
        // Fallback to first tab in config
        const firstConfigTab = groupCfg.tabs[0];
        if (firstConfigTab) {
          return firstConfigTab.id;
        }
      }
    }

    // 3. Fallback to first direct cv-tab child in DOM
    return this.resolveActiveTabForStandalone(groupEl);
  }

  /**
   * Helper to resolve active tab for standalone (non-synced) groups or fallback
   */
  private resolveActiveTabForStandalone(groupEl: HTMLElement): string | null {
        const firstTab = Array.from(groupEl.children).find(
          (child) => child.tagName.toLowerCase() === TAB_SELECTOR
        );
        if (firstTab) {
          // Use id or internal id
          const tabId = firstTab.getAttribute('id') || firstTab.getAttribute('data-cv-internal-id') || '';
          const splitIds = tabId.split(/[\s|]+/).filter(id => id.trim() !== '').map(id => id.trim());
          return splitIds[0] || null;
        }
        return null;
  }

  private initObserver() {
    this.observer = new MutationObserver((mutations) => {
      let newComponentsFound = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element && this.scan(node as HTMLElement)) {
                newComponentsFound = true;
            }
          });
          mutation.removedNodes.forEach((node) => {
             if (node instanceof Element) this.unscan(node as HTMLElement);
          });
        }
      }

      if (newComponentsFound) {
        this.initializeNewComponents();
        // Force re-render for Toggles
        this.render();
      }
    });

    if (this.rootEl) {
      this.observer.observe(this.rootEl, { childList: true, subtree: true });
    }
  }

  // --- Public APIs for Widget/Other ---

  public hasActiveComponents(): boolean {
      return this.store.hasActiveComponents;
  }

  public resetToDefault() {
      this.persistenceManager.clearAll();
      this.store.reset();
      this.store.isTabGroupNavHeadingVisible = true;
      URLStateManager.clearURL();
  }

  public destroy() {
      this.destroyEffectRoot?.();
      
      // Destroy all component effects
      this.componentEffects.forEach(destroy => destroy());
      this.componentEffects.clear();

      this.observer?.disconnect();
  }
}
