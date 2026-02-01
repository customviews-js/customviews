<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomViewsController } from '../core/controller.svelte';
  import type { UIManagerOptions } from '../core/ui-manager';
  
  import IntroCallout from './settings/IntroCallout.svelte';
  import SettingsIcon from './settings/SettingsIcon.svelte';
  import Modal from './modal/Modal.svelte';
  import { URLStateManager } from '../core/state/url-state-manager';
  import { showToast } from '../core/stores/toast-store.svelte';
  import { shareStore } from '../core/stores/share-store.svelte';
  import { focusStore } from '../core/stores/focus-store.svelte';
  import { placeholderRegistryStore } from '../core/stores/placeholder-registry-store.svelte';
  import { placeholderValueStore } from '../core/stores/placeholder-value-store.svelte';
  import { themeStore } from '../core/stores/theme-store.svelte';
  import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from '../core/constants';
  import Toast from './elements/Toast.svelte';
  import ShareOverlay from './share/ShareOverlay.svelte';
  import FocusBanner from './focus/FocusBanner.svelte';
  import { findHighestVisibleElement, scrollToElement } from '../utils/scroll-utils';

  let { core, options } = $props<{ core: CustomViewsController, options: UIManagerOptions }>();

  // --- Constants ---
  const STORAGE_KEY_INTRO_SHOWN = 'cv-intro-shown';

  // --- Derived State ---
  const store = $derived(core.store);
  const storeConfig = $derived(core.store.config);

  // --- UI State ---
  let isModalOpen = $state(false);
  let showCallout = $state(false);
  let isResetting = $state(false);
  let showPulse = $state(false);
  let areTabNavsVisible = $state(true);
  let settingsIcon: { resetPosition: () => void } | undefined = $state();

  // --- Computed Props ---
  
  // Share Configuration
  const shareExclusions = $derived(storeConfig.shareExclusions || {});
  const excludedTags = $derived([...DEFAULT_EXCLUDED_TAGS, ...(shareExclusions.tags || [])]);
  const excludedIds = $derived([...DEFAULT_EXCLUDED_IDS, ...(shareExclusions.ids || [])]);
  
  // Store State helpers for Modal
  let shownToggles = $derived(store.state.shownToggles ?? []);
  let peekToggles = $derived(store.state.peekToggles ?? []);
  let activeTabs = $derived(store.state.tabs ?? {});

  // Placeholder Data
  let visiblePlaceholders = $derived.by(() => {
     return placeholderRegistryStore.definitions.filter(d => {
         if (d.hiddenFromSettings) return false;
         if (d.isLocal) {
             return store.detectedPlaceholders.has(d.name);
         }
         return true;
     });
  });
  let placeholderValues = $derived(placeholderValueStore.values);

  // --- Initialization ---

  onMount(() => {
    initTheme();
    initNavVisibility();
    initRouteListeners();
    
    return teardownRouteListeners;
  });

  function initTheme() {
    themeStore.init(core.persistenceManager);
  }

  /**
   * Sync local nav visibility with the store's persisted state.
   * Store is the single source of truth.
   */
  function initNavVisibility() {
    areTabNavsVisible = store.isTabGroupNavHeadingVisible;
  }

  function initRouteListeners() {
    checkURLForModalOpenTrigger();
    window.addEventListener('popstate', checkURLForModalOpenTrigger);
    window.addEventListener('hashchange', checkURLForModalOpenTrigger);
  }

  function teardownRouteListeners() {
    window.removeEventListener('popstate', checkURLForModalOpenTrigger);
    window.removeEventListener('hashchange', checkURLForModalOpenTrigger);
  }

  // --- Effects ---

  // Intro Callout Logic
  let hasCheckedIntro = false;
  $effect(() => {
    if (!hasCheckedIntro && options.callout?.show) {
       // Only show if there are actual components on the page
       if (store.hasPageElements) {
           hasCheckedIntro = true;
           checkIntro();
       }
    }
  });

  // --- Logic / Handlers ---

  function checkIntro() {
    if (!core.persistenceManager.getItem(STORAGE_KEY_INTRO_SHOWN)) {
      setTimeout(() => {
          showCallout = true;
          showPulse = true;
      }, 1000);
    }
  }

  function dismissCallout() {
    showCallout = false;
    showPulse = false;
    core.persistenceManager.setItem(STORAGE_KEY_INTRO_SHOWN, 'true');
  }

  /**
   * Checks if the URL (query param or hash) indicates the modal should be opened.
   */
  function checkURLForModalOpenTrigger() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    // Check query param
    if (urlParams.has('cv-open')) {
        openModal();
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('cv-open');
        window.history.replaceState({}, '', newUrl.toString());
    } 
    // Check hash
    else if (hash === '#cv-open') {
        openModal();
        // Clear hash without reload
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  // --- Modal Actions ---

  function openModal() {
    if (showCallout) dismissCallout();
    // Mark intro as shown if user manually opens settings
    core.persistenceManager.setItem(STORAGE_KEY_INTRO_SHOWN, 'true');
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function handleReset() {
    isResetting = true;
    core.resetToDefault();
    settingsIcon?.resetPosition();
    
    // Sync local state
    areTabNavsVisible = true; 
    
    showToast('Settings reset to default');
    
    setTimeout(() => {
      isResetting = false;
    }, 600);
  }

  function handleStartShare() {
    closeModal();
    shareStore.toggleActive(true);
  }

  // --- Settings Handlers ---

  function handleToggleChange(detail: any) {
    const { toggleId, value } = detail;
    const currentShown = store.state.shownToggles || [];
    const currentPeek = store.state.peekToggles || [];

    const newShown = currentShown.filter((id: string) => id !== toggleId);
    const newPeek = currentPeek.filter((id: string) => id !== toggleId);

    if (value === 'show') newShown.push(toggleId);
    if (value === 'peek') newPeek.push(toggleId);

    store.setToggles(newShown, newPeek);
  }

  function handleTabGroupChange(detail: any) {
    const { groupId, tabId } = detail;
    // Scroll Logic: Capture target before state update
    const groupToScrollTo = findHighestVisibleElement('cv-tabgroup');

    store.setPinnedTab(groupId, tabId);

    // Restore scroll after update
    if (groupToScrollTo) {
        queueMicrotask(() => {
             scrollToElement(groupToScrollTo);
        });
    }
  }

  function handleNavToggle(visible: boolean) {
    areTabNavsVisible = visible;
    // Core's effect will capture this change and persist it
    store.isTabGroupNavHeadingVisible = visible;
  }

  function handlePlaceholderChange(e: any) {
    const { name, value } = e;
    placeholderValueStore.set(name, value);
  }

  // --- Share Handlers ---

  function handleCopyShareUrl() {
    const url = URLStateManager.generateShareableURL(store.state);
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy URL!');
    });
  }
</script>

{#if store.hasMenuOptions || options.panel.showTabGroups || shareStore.isActive || focusStore.isActive || isModalOpen}
  <div class="cv-widget-root" data-theme={themeStore.currentTheme}>
    <!-- Intro Callout -->
    {#if showCallout}
      <IntroCallout 
        position={options.icon.position} 
        message={options.callout?.message}
        enablePulse={options.callout?.enablePulse}
        backgroundColor={options.callout?.backgroundColor}
        textColor={options.callout?.textColor}
        onclose={dismissCallout} 
      />
    {/if}
  
    <!-- Toast Container -->
    <Toast />
  
    {#if shareStore.isActive}
      <ShareOverlay {excludedTags} {excludedIds} />
    {/if}
  
    <FocusBanner />
  
    <!-- Widget Icon -->
    {#if options.icon.show}
      <SettingsIcon 
        bind:this={settingsIcon}
        position={options.icon.position} 
        title={options.panel.title} 
        pulse={showPulse} 
        onclick={openModal}
        iconColor={options.icon?.color}
        backgroundColor={options.icon?.backgroundColor}
        opacity={options.icon?.opacity}
        scale={options.icon?.scale}
        persistence={core.persistenceManager}
      />
    {/if}
  
    <!-- Modal -->
    {#if isModalOpen}
      <Modal 
        title={options.panel.title}
        description={options.panel.description}
        showReset={options.panel.showReset}
        showTabGroups={options.panel.showTabGroups}
        
        toggles={store.menuToggles}
        tabGroups={store.menuTabGroups}
        
        shownToggles={shownToggles}
        peekToggles={peekToggles}
        activeTabs={activeTabs}
        navsVisible={areTabNavsVisible}
        isResetting={isResetting}
  
        placeholderDefinitions={visiblePlaceholders}
        placeholderValues={placeholderValues}
        sectionOrder={store.configSectionOrder}

        onclose={closeModal}
        onreset={handleReset}
        ontoggleChange={handleToggleChange}
        ontabGroupChange={handleTabGroupChange}
        ontoggleNav={handleNavToggle}
        oncopyShareUrl={handleCopyShareUrl}
        onstartShare={handleStartShare}
        onplaceholderChange={handlePlaceholderChange}
      />
    {/if}
  </div>
{/if}

<style>
  :global(.cv-widget-root) {
    /* Light Theme Defaults */
    --cv-bg: white;
    --cv-text: rgba(0, 0, 0, 0.9);
    --cv-text-secondary: rgba(0, 0, 0, 0.6);
    --cv-border: rgba(0, 0, 0, 0.1);
    --cv-bg-hover: rgba(0, 0, 0, 0.05);
    
    --cv-primary: #3e84f4;
    --cv-primary-hover: #2563eb;
    
    --cv-danger: #dc2626;
    --cv-danger-bg: rgba(220, 38, 38, 0.1);
    
    --cv-shadow: rgba(0, 0, 0, 0.25);
    
    --cv-input-bg: white;
    --cv-input-border: rgba(0, 0, 0, 0.15);
    --cv-switch-bg: rgba(0, 0, 0, 0.1);
    --cv-switch-knob: white;
    
    --cv-modal-icon-bg: rgba(0, 0, 0, 0.08);
    --cv-icon-bg: rgba(255, 255, 255, 0.92);
    --cv-icon-color: rgba(0, 0, 0, 0.9);
    
    --cv-focus-ring: rgba(62, 132, 244, 0.2);
    
    --cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);

    font-family: inherit; /* Inherit font from host */
  }

  :global(.cv-widget-root[data-theme="dark"]) {
    /* Dark Theme Overrides */
    --cv-bg: #101722;
    --cv-text: #e2e8f0;
    --cv-text-secondary: rgba(255, 255, 255, 0.6);
    --cv-border: rgba(255, 255, 255, 0.1);
    --cv-bg-hover: rgba(255, 255, 255, 0.05);

    --cv-primary: #3e84f4;
    --cv-primary-hover: #60a5fa;

    --cv-danger: #f87171;
    --cv-danger-bg: rgba(248, 113, 113, 0.1);

    --cv-shadow: rgba(0, 0, 0, 0.5);

    --cv-input-bg: #1e293b;
    --cv-input-border: rgba(255, 255, 255, 0.1);
    --cv-switch-bg: rgba(255, 255, 255, 0.1);
    --cv-switch-knob: #e2e8f0;
    
    --cv-modal-icon-bg: rgba(255, 255, 255, 0.08);
    --cv-icon-bg: #1e293b;
    --cv-icon-color: #e2e8f0;
    
    --cv-focus-ring: rgba(62, 132, 244, 0.5);
    
    --cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
</style>
