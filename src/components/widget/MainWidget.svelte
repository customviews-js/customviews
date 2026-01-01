<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomViewsCore } from '../../core/core.svelte';
  import type { WidgetOptions } from '../../core/widget';
  
  import WidgetIcon from './WidgetIcon.svelte';
  import Modal from '../modal/Modal.svelte';
  import IntroCallout from './IntroCallout.svelte';
  import { URLStateManager } from '../../core/state/url-state-manager';
  import { showToast } from '../../core/stores/toast-store';
  import Toast from '../elements/Toast.svelte';
  import { ScrollManager } from '../../utils/scroll-manager';

  let { core, options } = $props<{ core: CustomViewsCore, options: WidgetOptions }>();

  // Derived state
  const store = $derived(core.store);

  // UI State
  let isModalOpen = $state(false);
  let showCallout = $state(false);
  let isResetting = $state(false);
  let showPulse = $state(false);

  // Nav Visibility
  let navsVisible = $state(true);

  // Reactively track store state for passing to Modal
  let shownToggles = $derived(store.state.shownToggles ?? []);
  let peekToggles = $derived(store.state.peekToggles ?? []);
  let activeTabs = $derived(store.state.tabs ?? {});

  // Init
  onMount(() => {
    // Check for callout
    if (options.showWelcome && store.hasActiveComponents) {
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
    const groupToScrollTo = ScrollManager.findHighestVisibleTabGroup();

    store.setPinnedTab(groupId, tabId);

    // Restore scroll after update
    if (groupToScrollTo) {
        queueMicrotask(() => {
             ScrollManager.scrollToTabGroup(groupToScrollTo);
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
    core.toggleShareMode();
  }
</script>

{#if store.hasActiveComponents || options.showTabGroups}
  <!-- Intro Callout -->
  {#if showCallout}
    <IntroCallout 
      position={options.position} 
      message={options.welcomeMessage}
      onclose={dismissCallout} 
    />
  {/if}

  <!-- Toast Container -->
  <Toast />

  <!-- Widget Icon -->
  <WidgetIcon 
    position={options.position} 
    title={options.title} 
    pulse={showPulse} 
    onclick={openModal} 
  />

  <!-- Modal -->
  {#if isModalOpen}
    <Modal 
      title={options.title}
      description={options.description}
      showReset={options.showReset}
      showTabGroups={options.showTabGroups}
      
      toggles={store.visibleToggles}
      tabGroups={store.visibleTabGroups}
      
      shownToggles={shownToggles}
      peekToggles={peekToggles}
      activeTabs={activeTabs}
      navsVisible={navsVisible}
      isResetting={isResetting}

      onclose={closeModal}
      onreset={handleReset}
      ontoggleChange={handleToggleChange}
      ontabGroupChange={handleTabGroupChange}
      ontoggleNav={handleNavToggle}
      oncopyShareUrl={handleCopyShareUrl}
      onstartShare={handleStartShare}
    />
  {/if}
{/if}
