<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomViewsCore } from '../../core/core.svelte';
  import type { SettingsOptions } from '../../core/settings';
  
  import IntroCallout from './IntroCallout.svelte';
  import SettingsIcon from './SettingsIcon.svelte';
  import Modal from '../modal/Modal.svelte';
  import { URLStateManager } from '../../core/state/url-state-manager';
  import { showToast } from '../../core/stores/toast-store.svelte';
  import { shareStore } from '../../core/stores/share-store.svelte';
  import { placeholderRegistryStore } from '../../core/stores/placeholder-registry-store.svelte';
  import { placeholderValueStore } from '../../core/stores/placeholder-value-store.svelte';
  import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from '../../core/constants';
  import Toast from '../elements/Toast.svelte';
  import ShareOverlay from '../share/ShareOverlay.svelte';
  import FocusBanner from '../focus/FocusBanner.svelte';
  import { findHighestVisibleElement, scrollToElement } from '../../utils/scroll-utils';

  let { core, options } = $props<{ core: CustomViewsCore, options: SettingsOptions }>();

  // Derived state
  const store = $derived(core.store);

  // UI State
  let isModalOpen = $state(false);
  let showCallout = $state(false);
  let isResetting = $state(false);
  let showPulse = $state(false);
  let settingsIcon: { resetPosition: () => void } | undefined = $state();

  // Nav Visibility
  let navsVisible = $state(true);

  // Computed Props for ShareOverlay
  const config = $derived(core.store.config);
  const shareExclusions = $derived(config.shareExclusions || {});
  const excludedTags = $derived([...DEFAULT_EXCLUDED_TAGS, ...(shareExclusions.tags || [])]);
  const excludedIds = $derived([...DEFAULT_EXCLUDED_IDS, ...(shareExclusions.ids || [])]);
  
  // Reactively track store state for passing to Modal
  let shownToggles = $derived(store.state.shownToggles ?? []);
  let peekToggles = $derived(store.state.peekToggles ?? []);
  let activeTabs = $derived(store.state.tabs ?? {});

  // Placeholder State
  let definitions = $derived(placeholderRegistryStore.definitions);
  let values = $derived(placeholderValueStore.values);

  // Init
  onMount(() => {
    // Check for callout
    if (options.callout?.show && store.hasActiveComponents) {
      checkIntro();
    }
    
    // Check Nav Visibility
    // Store is the single source of truth, handled by Core's persistence effect
    navsVisible = store.isTabGroupNavHeadingVisible;
  });

  function checkIntro() {
    try {
      if (!localStorage.getItem('cv-intro-shown')) {
        setTimeout(() => {
           showCallout = true;
           showPulse = true;
        }, 1000);
      }
    } catch (e) { }
  }

  function dismissCallout() {
    showCallout = false;
    showPulse = false;
    try { localStorage.setItem('cv-intro-shown', 'true'); } catch (e) { }
  }

  function openModal() {
    if (showCallout) dismissCallout();
    try { localStorage.setItem('cv-intro-shown', 'true'); } catch (e) { }
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  // --- Handlers ---

  function handleReset() {
    isResetting = true;
    core.resetToDefault();
    settingsIcon?.resetPosition();
    // Sync local state
    navsVisible = true; 
    
    showToast('Settings reset to default');
    
    setTimeout(() => {
      isResetting = false;
    }, 600);
  }

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
    navsVisible = visible;
    // Core's effect will capture this change and persist it
    store.isTabGroupNavHeadingVisible = visible;
  }

  function handleCopyShareUrl() {
    const url = URLStateManager.generateShareableURL(store.state);
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy URL!');
    });
  }

  function handleStartShare() {
    closeModal();
    shareStore.toggleActive(true);
  }

  function handleVariableChange(e: any) {
    const { name, value } = e;
    placeholderValueStore.set(name, value);
  }
</script>

{#if store.hasActiveComponents || options.showTabGroups}
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
  />

  <!-- Modal -->
  {#if isModalOpen}
    <Modal 
      title={options.panel.title}
      description={options.panel.description}
      showReset={options.panel.showReset}
      showTabGroups={options.panel.showTabGroups}
      
      toggles={store.visibleToggles}
      tabGroups={store.visibleTabGroups}
      
      shownToggles={shownToggles}
      peekToggles={peekToggles}
      activeTabs={activeTabs}
      navsVisible={navsVisible}
      isResetting={isResetting}

      placeholderDefinitions={definitions}
      placeholderValues={values}

      onclose={closeModal}
      onreset={handleReset}
      ontoggleChange={handleToggleChange}
      ontabGroupChange={handleTabGroupChange}
      ontoggleNav={handleNavToggle}
      oncopyShareUrl={handleCopyShareUrl}
      onstartShare={handleStartShare}
      onvariableChange={handleVariableChange}
    />
  {/if}
{/if}
