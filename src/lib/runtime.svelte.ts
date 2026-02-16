import type { ConfigFile } from '$lib/types/index';
import type { AssetsManager } from './assets';

import { PersistenceManager } from './state/persistence';
import { URLStateManager } from '$features/url/url-state-manager';

import { FocusService } from '$features/focus/services/focus-service.svelte';
import { type AppStore } from './stores/app-store.svelte';
import { initAppStore } from '$lib/stores/app-context';
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
 * The Reactive Runtime for CustomViews, coordinates interaction between DataStore and other components.
 * Uses Svelte 5 Effects ($effect) to automatically apply state changes from the store to URL and persistence.
 * Components (Toggle, TabGroup) are self-contained and self-managing via the global store.
 */
export class CustomViewsRuntime {
  /**
   * The single source of truth for application state.
   */
  public store: AppStore;

  private rootEl: HTMLElement;
  public persistenceManager: PersistenceManager;
  private focusService: FocusService;

  private showUrlEnabled: boolean;
  private observer?: MutationObserver;
  private destroyEffectRoot?: () => void;
  private popstateHandler?: () => void;

  constructor(options: RuntimeOptions) {
    this.rootEl = options.rootEl || document.body;

    const showUrl = options.showUrl || false;
    const storageKey = options.storageKey || 'custom-views-settings';
    this.persistenceManager = new PersistenceManager(storageKey);
    this.showUrlEnabled = showUrl;

    // Initialize Reactive Store Singleton
    this.store = initAppStore(options.configFile);

    // Store assetsManager in global store for component access
    this.store.setAssetsManager(options.assetsManager);

    // Initial State Resolution: URL > Persistence > Default
    this.resolveInitialState();

    // Resolve Exclusions
    this.focusService = new FocusService(this.rootEl, {
      shareExclusions: options.configFile.config?.shareExclusions || {},
    });
  }

  private resolveInitialState() {
    // 1. URL State
    const urlState = URLStateManager.parseURL();
    if (urlState) {
      this.store.userPreferences.applyState(urlState);
      return;
    }

    // 2. Persisted State
    const persistedState = this.persistenceManager.getPersistedState();
    if (persistedState) {
      this.store.userPreferences.applyState(persistedState);
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
      this.store.interfaceSettings.isTabGroupNavHeadingVisible = navPref;
    }

    // Initialize Stores
    placeholderValueStore.init(this.persistenceManager);

    // Run initial scan (non-reactive)
    // Clear previous page detections if any, before scan (SPA support)
    this.store.registry.clearPlaceholders();
    PlaceholderBinder.scanAndHydrate(this.rootEl);

    // Delegate observation to PlaceholderBinder
    this.observer = PlaceholderBinder.observe(this.rootEl);

    // Setup Global Reactivity using $effect.root
    this.destroyEffectRoot = $effect.root(() => {
      // Effect 1: Update URL
      $effect(() => {
        if (this.showUrlEnabled) {
          URLStateManager.updateURL(this.store.userPreferences.state);
        } else {
          URLStateManager.clearURL();
        }
      });

      // Effect 2: Persistence
      $effect(() => {
        this.persistenceManager.persistState(this.store.userPreferences.state);
        this.persistenceManager.persistTabNavVisibility(
          this.store.interfaceSettings.isTabGroupNavHeadingVisible,
        );
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
        this.store.userPreferences.applyState(urlState);
      }
    };
    window.addEventListener('popstate', this.popstateHandler);
  }

  // --- Public APIs for Widget/Other ---

  public resetToDefault() {
    this.persistenceManager.clearAll();
    this.store.reset();
    this.store.interfaceSettings.isTabGroupNavHeadingVisible = true;
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
