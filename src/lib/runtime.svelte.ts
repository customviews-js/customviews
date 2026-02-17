import type { ConfigFile } from '$lib/types/index';
import type { AssetsManager } from '$features/render/assets';

import { PersistenceManager } from './state/persistence';
import { URLStateManager } from '$features/url/url-state-manager';

import { FocusService } from '$features/focus/services/focus-service.svelte';
import { DataStore, initStore } from './stores/main-store.svelte';
import { placeholderValueStore } from '$features/placeholder/stores/placeholder-value-store.svelte';
import { PlaceholderBinder } from '$features/placeholder/placeholder-binder';

export interface RuntimeOptions {
  assetsManager: AssetsManager;
  configFile: ConfigFile;
  rootEl?: HTMLElement | undefined;
  showUrl?: boolean;
  storageKey?: string | undefined;
}

/**
 * The reactive runtime for CustomViews. Manages the full lifecycle: initialization,
 * state resolution, reactive side-effects (URL sync, persistence), DOM observation, and teardown.
 * Components (Toggle, TabGroup) are self-contained and self-managing via the global store.
 */
export class AppRuntime {
  /**
   * The single source of truth for application state.
   */
  public store: DataStore;

  private rootEl: HTMLElement;
  public persistenceManager: PersistenceManager;
  private focusService: FocusService;

  private showUrlEnabled: boolean;
  private observer?: MutationObserver;
  private destroyEffectRoot?: () => void;
  private popstateHandler?: () => void;

  constructor(opt: RuntimeOptions) {
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager(opt.storageKey);
    this.showUrlEnabled = opt.showUrl ?? false;

    // Initialize Reactive Store Singleton
    this.store = initStore(opt.configFile);

    // Store assetsManager in global store for component access
    this.store.setAssetsManager(opt.assetsManager);

    // Initial State Resolution: URL > Persistence > Default
    this.resolveInitialState();

    // Resolve Exclusions
    this.focusService = new FocusService(this.rootEl, {
      shareExclusions: opt.configFile.config?.shareExclusions || {},
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

    // Initialize Stores
    placeholderValueStore.init(this.persistenceManager);

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
      });
    });

    // Handle History Popstate
    this.popstateHandler = () => {
      const urlState = URLStateManager.parseURL();
      if (urlState) {
        this.store.applyState(urlState);
      }
    };
    window.addEventListener('popstate', this.popstateHandler);
  }

  /**
   * Sets up a MutationObserver to detect content added dynamically to the page
   * (e.g. by other scripts, lazy loading, or client-side routing).
   */
  private setUpObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.addedNodes.forEach((node) => this.handleForPlaceholders(node));
      }
    });

    // Observe the entire document tree for changes
    this.observer.observe(this.rootEl, { childList: true, subtree: true });
  }

  /**
   * Processes a newly added DOM node to check for and hydrate placeholders.
   */
  private handleForPlaceholders(node: Node) {
    // Skip our own custom elements to avoid unnecessary scanning
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'CV-PLACEHOLDER' || el.tagName === 'CV-PLACEHOLDER-INPUT') {
        return;
      }
    }

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
      node.nodeValue?.includes('[[') &&
      node.nodeValue?.includes(']]')
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
    placeholderValueStore.reset();
    URLStateManager.clearURL();
  }

  public destroy() {
    this.observer?.disconnect();
    this.destroyEffectRoot?.();

    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
    }

    this.focusService.destroy();
  }
}
