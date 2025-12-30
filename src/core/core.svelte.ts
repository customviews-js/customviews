import type { Config } from "../types/types";
import type { AssetsManager } from "./managers/assets-manager";

import { PersistenceManager } from "./state/persistence";
import { URLStateManager } from "./state/url-state-manager";
import { VisibilityManager } from "./managers/visibility-manager";
import { TabManager } from "./managers/tab-manager";
import { ToggleManager } from "./managers/toggle-manager";
import { ScrollManager } from "../utils/scroll-manager";
import { injectCoreStyles } from "../styles/styles";
import { ShareManager } from "./managers/share-manager";
import { FocusManager } from "./managers/focus-manager";
import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from './state/config';
import { DataStore } from "./state/data-store.svelte";

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
      TabManager.setNavsVisibility(this.rootEl, navPref);
    }
    
    // Setup Reactivity using $effect.root
    this.destroyEffectRoot = $effect.root(() => {
        // Effect 1: Render DOM (Tabs, Toggles)
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
   * The main DOM rendering effect.
   * 
   * This method is called automatically by Svelte whenever `this.store.state` changes.
   * It takes the pure state from the Store and imperatively updates the DOM 
   * via TabManager and ToggleManager.
   */
  private render() {
      // pause observer to avoid loops? 
      // In Svelte 5 effects used to be synchronous in Svelte 4, 
      // but here we are in an effect. 
      // The original code disconnected observer.
      
      this.observer?.disconnect();
      
      const { shownToggles, peekToggles, tabs } = this.store.state;
      
      // Filter visible toggles
      const finalToggles = this.visibilityManager.filterVisibleToggles(shownToggles || []);
      
      const allToggleElements = Array.from(this.componentRegistry.toggles);
      const tabGroupElements = Array.from(this.componentRegistry.tabGroups);

      // Apply Toggles
      ToggleManager.applyTogglesVisibility(allToggleElements, finalToggles, peekToggles || []);
      ToggleManager.renderToggleAssets(allToggleElements, finalToggles, this.assetsManager);

      // Apply Tabs
      TabManager.applyTabSelections(tabGroupElements, tabs || {}, this.store.config.tabGroups);
      TabManager.updateAllNavActiveStates(tabGroupElements, tabs || {}, this.store.config.tabGroups);
      TabManager.updatePinIcons(tabGroupElements, tabs || {});

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
      if (!this.componentRegistry.tabGroups.has(groupEl)) {
        this.componentRegistry.tabGroups.add(groupEl);
        newComponentsFound = true;
        
        // Update Store Registry
        const id = groupEl.id;
        if (id) this.store.registerTabGroup(id);
      }
    });

    return newComponentsFound;
  }
  
  private unscan(element: HTMLElement): void {
      // Simplified unscan - ideally we should remove from store registry too if count drops to 0
      // For now, removing from internal componentRegistry is enough for DOM updates
      
      const toggles = Array.from(element.querySelectorAll(TOGGLE_SELECTOR));
      if (element.matches(TOGGLE_SELECTOR)) toggles.unshift(element);
      toggles.forEach(t => this.componentRegistry.toggles.delete(t as HTMLElement));
      
      const tabGroups = Array.from(element.querySelectorAll(TABGROUP_SELECTOR));
      if (element.matches(TABGROUP_SELECTOR)) tabGroups.unshift(element);
      tabGroups.forEach(t => this.componentRegistry.tabGroups.delete(t as HTMLElement));
  }

  private initializeNewComponents(): void {
    const groups = Array.from(this.componentRegistry.tabGroups);
    groups.forEach((groupEl) => {
        if ((groupEl as any)._listenersAttached) return;
        (groupEl as any)._listenersAttached = true;

        groupEl.addEventListener('tabchange', (e: any) => {
            const { tabId, groupId } = e.detail;
            TabManager.applyTabLocalOnly(groupEl, tabId);
            
            // Custom event for anyone listening (optional)
            document.dispatchEvent(new CustomEvent('customviews:tab-change', {
                detail: { groupId, tabId, synced: false },
                bubbles: true
            }));
        });

        groupEl.addEventListener('tabdblclick', (e: any) => {
            const { tabId, groupId } = e.detail;
            
            // 1. Record position before state change
            // Use groupEl as anchor since nav info is internal
            const anchorElement = groupEl;
            const initialTop = anchorElement.getBoundingClientRect().top;

            // 2. Sync to store
            if (groupId) {
               this.store.setTab(groupId, tabId);
            }
            
            // 3. Restore position after DOM update (wait for effect)
            queueMicrotask(() => {
                ScrollManager.handleScrollAnchor({ element: anchorElement, top: initialTop });
            });
        });
    });
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
        // Force re-render to apply state to new components
        // Svelte effects might not trigger if state didn't change.
        // But render() depends on componentRegistry too?
        // Actually, render() iterates componentRegistry. 
        // If state doesn't change, effect won't run.
        // We need to trigger render or make registry reactive.
        // Making `componentRegistry` sets reactive ($state) would solve this!
        // But Set internal mutation doesn't trigger updates in Svelte 5 unless you reassign new Set or use Svelte Set.
        // Quick fix: Just call render() manually here since the observer is imperative anyway.
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
      TabManager.setNavsVisibility(this.rootEl, true);
      URLStateManager.clearURL();
  }

  public persistTabNavVisibility(visible: boolean) {
      this.persistenceManager.persistTabNavVisibility(visible);
  }

  public getPersistedTabNavVisibility(): boolean | null {
      return this.persistenceManager.getPersistedTabNavVisibility();
  }
  
  public setOption(flag: string, value: unknown) {
      if (flag === 'showUrl') {
          this.showUrlEnabled = Boolean(value);
          // Effect 2 will handle update/clear automatically when showUrlEnabled changes
          // Wait, showUrlEnabled is not reactive.
          // I should make it reactive or just call logic.
          if (this.showUrlEnabled) URLStateManager.updateURL(this.store.state);
          else URLStateManager.clearURL();
      }
  }

  public destroy() {
      this.destroyEffectRoot?.();
      this.observer?.disconnect();
  }
}
