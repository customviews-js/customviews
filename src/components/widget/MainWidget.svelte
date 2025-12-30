<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomViewsCore } from '../../core/core.svelte'; // Updated import
  import type { WidgetOptions } from '../../core/widget';
  
  import WidgetIcon from './WidgetIcon.svelte';
  import Modal from '../modal/Modal.svelte';
  import IntroCallout from './IntroCallout.svelte';
  import { URLStateManager } from '../../core/state/url-state-manager';
  import { ToastManager } from '../../core/managers/toast-manager';
  import { TabManager } from '../../core/managers/tab-manager';
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

  // Init
  onMount(() => {
    // Check for callout
    if (options.showWelcome && store.hasActiveComponents) {
      checkIntro();
    }
    
    // Check Nav Visibility
    const persisted = core.getPersistedTabNavVisibility();
    if (persisted !== null) {
        navsVisible = persisted;
    } else {
        navsVisible = TabManager.areNavsVisible(document.body);
    }
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
    ToastManager.show('Settings reset to default');
    
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

    store.setTab(groupId, tabId);

    // Restore scroll after update
    if (groupToScrollTo) {
        queueMicrotask(() => {
             ScrollManager.scrollToTabGroup(groupToScrollTo);
        });
    }
  }

  function handleNavToggle(visible: boolean) {
    navsVisible = visible;
    core.persistTabNavVisibility(visible);
    TabManager.setNavsVisibility(document.body, visible);
  }

  function handleCopyShareUrl() {
    const url = URLStateManager.generateShareableURL(store.state);
    navigator.clipboard.writeText(url).then(() => {
      ToastManager.show('Link copied to clipboard!');
    }).catch(() => {
      ToastManager.show('Failed to copy URL!');
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
      
      shownToggles={store.state.shownToggles || []}
      peekToggles={store.state.peekToggles || []}
      activeTabs={store.state.tabs || {}}
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
