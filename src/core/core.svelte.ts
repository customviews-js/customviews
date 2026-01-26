import type { Config } from "../types/types";
import type { AssetsManager } from "./managers/assets-manager";

import { PersistenceManager } from "./state/persistence";
import { URLStateManager } from "./state/url-state-manager";

import { FocusService } from "./services/focus-service.svelte";
import { DataStore, initStore } from "./stores/main-store.svelte";
import { placeholderValueStore } from "./stores/placeholder-value-store.svelte";
import { PlaceholderBinder } from "./services/placeholder-binder";

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
  private observer?: MutationObserver;
  private destroyEffectRoot?: () => void;
  private popstateHandler?: () => void;

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

  }

  /**
   * Initializes the CustomViews core.
   * 
   * Components (Toggle, TabGroup) self-register during their mount lifecycle.
   * Core only manages global reactivity for URL state and persistence.
   */
  public init() {
    // Restore tab nav visibility preference
    const navPref = this.persistenceManager.getPersistedTabNavVisibility();
    if (navPref !== null) {
      this.store.isTabGroupNavHeadingVisible = navPref;
    }
    
    // Run initial scan (non-reactive)
    // Clear previous page detections if any, before scan (SPA support)
    this.store.clearDetectedPlaceholders();
    PlaceholderBinder.scanAndHydrate(this.rootEl);

    this.setUpObserver();
    
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
            PlaceholderBinder.updateAll(placeholderValueStore.values);
            placeholderValueStore.persist();
        });
    });


    // Handle History Popstate
    this.popstateHandler = () => {
       const urlState = URLStateManager.parseURL();
       if (urlState) {
          this.store.applyState(urlState);
       }
    };
    window.addEventListener("popstate", this.popstateHandler);
  }

  /** 
   * Sets up a MutationObserver to detect content added dynamically to the page
   * (e.g. by other scripts, lazy loading, or client-side routing).
   */
  private setUpObserver() {
    this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            mutation.addedNodes.forEach(node => this.handleForPlaceholders(node));
        }
    });

    // Observe the entire document tree for changes
    this.observer.observe(this.rootEl, { childList: true, subtree: true });
  }

  /**
   * Processes a newly added DOM node to check for and hydrate placeholders.
   */
  private handleForPlaceholders(node: Node) {
      // Case 1: A new HTML element was added (e.g. via innerHTML or appendChild).
      // Recursively scan inside for any new placeholders.
      if (node.nodeType === Node.ELEMENT_NODE) {
          PlaceholderBinder.scanAndHydrate(node as HTMLElement);
      } 
      // Case 2: A raw text node was added directly.
      // Check looks like a variable `[[...]]` to avoid unnecessary scans of plain text.
      else if (
          node.nodeType === Node.TEXT_NODE && 
          node.parentElement && 
          node.nodeValue?.includes('[[')
      ) {
          // Re-scan parent to properly wrap text node in reactive span.
          PlaceholderBinder.scanAndHydrate(node.parentElement);
      }
  }

  // --- Public APIs for Widget/Other ---

  public resetToDefault() {
      this.persistenceManager.clearAll();
      this.store.reset();
      this.store.isTabGroupNavHeadingVisible = true;
      URLStateManager.clearURL();
  }

  public destroy() {
      this.observer?.disconnect();
      this.destroyEffectRoot?.();
      
      if (this.popstateHandler) {
          window.removeEventListener("popstate", this.popstateHandler);
      }

      this.focusService.destroy();
  }
}

