import type { ConfigFile, State } from '$lib/types/index';
import type { AssetsManager } from '$features/render/assets';

import { PersistenceManager } from './utils/persistence';
import { URLStateManager } from '$features/url/url-state-manager';

import { FocusService } from '$features/focus/services/focus-service.svelte';
import { activeStateStore } from './stores/active-state-store.svelte';
import { elementStore } from './stores/element-store.svelte';
import { uiStore } from './stores/ui-store.svelte';
import { derivedStore } from './stores/derived-store.svelte';
import { placeholderManager } from '$features/placeholder/placeholder-manager';
import { PlaceholderBinder } from '$features/placeholder/placeholder-binder';

export interface RuntimeOptions {
  assetsManager: AssetsManager;
  configFile: ConfigFile;
  rootEl?: HTMLElement | undefined;
  storageKey?: string | undefined;
}

/**
 * The reactive runtime for CustomViews. Manages the full lifecycle: initialization,
 * state resolution, reactive side-effects (URL sync, persistence), DOM observation, and teardown.
 * Components (Toggle, TabGroup) are self-contained and self-managing via the global store.
 */
export class AppRuntime {
  private rootEl: HTMLElement;
  private persistenceManager: PersistenceManager;
  private focusService: FocusService;

  private urlState: State | null = null;
  private observer?: MutationObserver;
  private destroyEffectRoot?: () => void;

  constructor(opt: RuntimeOptions) {
    this.rootEl = opt.rootEl || document.body;
    this.persistenceManager = new PersistenceManager(opt.storageKey);

    // Initialize all store singletons with config
    this.initStores(opt.configFile);

    // Store assetsManager for component access
    derivedStore.setAssetsManager(opt.assetsManager);

    // Initial State Resolution: URL > Persistence > Default
    this.resolveInitialState();

    // Resolve Exclusions
    this.focusService = new FocusService(this.rootEl, {
      shareExclusions: opt.configFile.config?.shareExclusions || {},
    });
  }

  /**
   * Initialize all stores with configuration from the config file.
   * Populates the singleton sub-stores with real data.
   */
  private initStores(configFile: ConfigFile) {
    const config = configFile.config || {};
    const settings = configFile.settings?.panel || {};

    // Process Global Placeholders from Config
    placeholderManager.registerConfigPlaceholders(config);

    // Initialize ActiveStateStore with config
    activeStateStore.init(config);

    // Register tab-group placeholders AFTER global config placeholders to preserve precedence
    placeholderManager.registerTabGroupPlaceholders(config);

    // Initialize UI Options from Settings
    uiStore.setUIOptions({
      showTabGroups: settings.showTabGroups ?? true,
      showReset: settings.showReset ?? true,
      title: settings.title ?? 'Customize View',
      description: settings.description ?? '',
    });
  }

  private resolveInitialState() {
    // 1. Apply base state: Persistence > Defaults (already set by init())
    const persistedState = this.persistenceManager.getPersistedState();
    if (persistedState) {
      activeStateStore.applyState(persistedState);
    }

    // TODO: Confirm intended behavior again

    // 2. Apply URL delta on top of base state.
    //    URL params represent sparse overrides (e.g. ?t-hide=X only hides X,
    //    leaving other toggles in their current visibility).
    const urlDelta = URLStateManager.parseURL();
    if (urlDelta) {
      this.urlState = urlDelta;
      activeStateStore.applyDifferenceInState(urlDelta);
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
      uiStore.isTabGroupNavHeadingVisible = navPref;
    }

    // Initialize Stores
    // TODO: Confirm intended behavior again

    // URL placeholder values override localStorage values
    if (this.urlState) {
      const validUrlPlaceholders = placeholderManager.filterValidPlaceholders(this.urlState);
      for (const [key, value] of Object.entries(validUrlPlaceholders)) {
        activeStateStore.setPlaceholder(key, value);
      }
    }

    // Run initial scan (non-reactive)
    // Clear previous page detections if any, before scan (SPA support)
    elementStore.clearDetectedPlaceholders();
    PlaceholderBinder.scanAndHydrate(this.rootEl);

    this.setUpObserver();

    // Setup Global Reactivity using $effect.root
    this.destroyEffectRoot = $effect.root(() => {
      // Persistence
      $effect(() => {
        this.persistenceManager.persistState(activeStateStore.state);
        this.persistenceManager.persistTabNavVisibility(uiStore.isTabGroupNavHeadingVisible);
      });

      // React to Variable Changes
      $effect(() => {
        PlaceholderBinder.updateAll(activeStateStore.state.placeholders ?? {});
      });
    });
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
    activeStateStore.reset();
    uiStore.reset();
    uiStore.isTabGroupNavHeadingVisible = true;
  }

  // --- Icon Position Persistence ---

  public getIconPosition(): number | null {
    const raw = this.persistenceManager.getItem('cv-settings-icon-offset');
    return raw ? parseFloat(raw) : null;
  }

  public saveIconPosition(offset: number): void {
    this.persistenceManager.setItem('cv-settings-icon-offset', offset.toString());
  }

  public clearIconPosition(): void {
    this.persistenceManager.removeItem('cv-settings-icon-offset');
  }

  // --- Intro Callout Persistence ---

  public isIntroSeen(): boolean {
    return !!this.persistenceManager.getItem('cv-intro-shown');
  }

  public markIntroSeen(): void {
    this.persistenceManager.setItem('cv-intro-shown', 'true');
  }

  public destroy() {
    this.observer?.disconnect();
    this.destroyEffectRoot?.();
    this.focusService.destroy();
  }
}
