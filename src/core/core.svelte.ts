import type { Config } from "../types/types";
import type { AssetsManager } from "./managers/assets-manager";

import { PersistenceManager } from "./state/persistence";
import { URLStateManager } from "./state/url-state-manager";

import { FocusService } from "./services/focus-service.svelte";
import { DataStore, initStore } from "./stores/main-store.svelte";
import { placeholderValueStore } from "./stores/placeholder-value-store.svelte";
import { DomScanner } from "./utils/dom-scanner";

export interface CustomViewsOptions {
  assetsManager: AssetsManager;
  config: Config;
  rootEl?: HTMLElement | undefined;
  showUrl?: boolean;
}

/**
 * The Reactive Binder for CustomViews, coordinates interaction between DataStore and other components.
 * Uses Svelte 5 Effects ($effect) to automatically apply state changes from the store to URL and persistence.
 * Components (Toggle, TabGroup) are self-contained and self-managing via the global store.
 */
export class CustomViewsCore {
  /**
   * The single source of truth for application state.
   */
  public store: DataStore;
  
  private rootEl: HTMLElement;
  private persistenceManager: PersistenceManager;
  private focusService: FocusService;
  
  private showUrlEnabled: boolean;
  private destroyEffectRoot?: () => void;

  constructor(opt: CustomViewsOptions) {
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager();
    this.showUrlEnabled = opt.showUrl ?? false;
    
    // Initialize Reactive Store Singleton
    this.store = initStore(opt.config);
    
    // Store assetsManager in global store for component access
    this.store.setAssetsManager(opt.assetsManager);

    // Initial State Resolution: URL > Persistence > Default
    this.resolveInitialState();

    // Resolve Exclusions
    this.focusService = new FocusService(this.rootEl, { 
       shareExclusions: opt.config.shareExclusions || {}
    });
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



  public getConfig(): Config {
    return this.store.config;
  }
  
  public getTabGroups() {
      return this.store.config.tabGroups;
  }

  /**
   * Initializes the CustomViews core.
   * 
   * Components (Toggle, TabGroup) self-register during their mount lifecycle.
   * Core only manages global reactivity for URL state and persistence.
   */
  public async init() {
    // Restore tab nav visibility preference
    const navPref = this.persistenceManager.getPersistedTabNavVisibility();
    if (navPref !== null) {
      this.store.isTabGroupNavHeadingVisible = navPref;
    }
    
    // Run initial scan (non-reactive)
    DomScanner.scanAndHydrate(this.rootEl);
    
    // Setup Global Reactivity using $effect.root
    this.destroyEffectRoot = $effect.root(() => {
        // Effect 1: Update URL
        $effect(() => {
            if (this.showUrlEnabled) {
                URLStateManager.updateURL(this.store.state);
            } else {
                URLStateManager.clearURL();
            }
        });

        // Effect 2: Persistence
        $effect(() => {
            this.persistenceManager.persistState(this.store.state);
            this.persistenceManager.persistTabNavVisibility(this.store.isTabGroupNavHeadingVisible);
        });

        // Effect 3: React to Variable Changes
        $effect(() => {
            DomScanner.updateAll(placeholderValueStore.values);
            placeholderValueStore.persist();
        });
    });

    // Handle History Popstate
    window.addEventListener("popstate", () => {
       const urlState = URLStateManager.parseURL();
       if (urlState) {
          this.store.applyState(urlState);
       }
       this.focusService.handleUrlChange();
    });

    this.focusService.init();
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
      this.focusService.destroy();
  }
}

