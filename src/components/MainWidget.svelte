<script lang="ts">
  import { onMount } from 'svelte';
  import type { State } from '../types/types';
  import type { CustomViewsCore } from '../core/core';
  import type { WidgetOptions } from '../core/widget';
  
  import WidgetIcon from './WidgetIcon.svelte';
  import Modal from './Modal.svelte';
  import IntroCallout from './IntroCallout.svelte';
  import { URLStateManager } from '../core/url-state-manager';
  import { ToastManager } from '../core/toast-manager';
  import { TabManager } from '../core/tab-manager';

  export let core: CustomViewsCore;
  
  export let options: WidgetOptions;

  // Configuration State
  let allToggles: any[] = [];
  let allTabGroups: any[] = [];
  let visibleToggles: any[] = [];
  let visibleTabGroups: any[] = [];
  let hasVisibleConfig = false;

  // View State
  let shownToggles: string[] = [];
  let peekToggles: string[] = [];
  let activeTabs: Record<string, string> = {};
  let navsVisible: boolean = true;
  
  // UI State
  let isModalOpen = false;
  let showCallout = false;
  let isResetting = false;
  let showPulse = false;

  // Init
  onMount(() => {
    // Initial data load
    refreshConfig();
    refreshState();
    
    // Subscribe to core updates
    core.addStateChangeListener(refreshState);

    // Check for callout
    if (options.showWelcome && hasVisibleConfig) {
      checkIntro();
    }

    // Set theme on body if needed, or just rely on component styles
    if (options.theme === 'dark') {
      document.body.classList.add('cv-widget-theme-dark'); // Should be scoped but for modal overlays...
    }

    return () => {
      core.removeStateChangeListener(refreshState);
    };
  });

  function refreshConfig() {
    // Filter toggles and tab groups based on page presence (logic ported from widget.ts)
    const config = core.getConfig();
    allToggles = config?.toggles || [];
    allTabGroups = core.getTabGroups() || [];

    // Ideally we should cache DOM queries or logic
    // Simplified: check existence
    visibleToggles = allToggles.filter(toggle => {
      if (toggle.isLocal) {
        return !!document.querySelector(`[data-cv-toggle="${toggle.id}"], [data-cv-toggle-group-id="${toggle.id}"]`);
      }
      return true;
    });

    visibleTabGroups = allTabGroups.filter(group => {
      if (group.isLocal) {
        return !!document.querySelector(`cv-tabgroup[id="${group.id}"]`);
      }
      return true;
    });

    hasVisibleConfig = visibleToggles.length > 0 || (!!options.showTabGroups && visibleTabGroups.length > 0);
  }

  function refreshState() {
     const currentState = core.getCurrentState();
     shownToggles = currentState.shownToggles || [];
     peekToggles = currentState.peekToggles || [];
     activeTabs = core.getCurrentActiveTabs() || {}; // Ensure object
     
     // Nav visibility
     const persisted = core.getPersistedTabNavVisibility();
     if (persisted !== null) {
       navsVisible = persisted;
     } else {
       navsVisible = TabManager.areNavsVisible(document.body);
     }
  }

  function checkIntro() {
    // Only show if we have active components (logic from widget.ts)
    if (!core.hasActiveComponents()) return;

    try {
      if (!localStorage.getItem('cv-intro-shown')) {
        setTimeout(() => {
           showCallout = true;
           showPulse = true;
        }, 1000);
      }
    } catch (e) {
      /* Ignore localStorage errors (e.g. disabled/full) */
    }
  }

  function dismissCallout() {
    showCallout = false;
    showPulse = false;
    try {
      localStorage.setItem('cv-intro-shown', 'true');
    } catch (e) {
      /* Ignore localStorage errors (e.g. disabled/full) */
    }
  }

  function openModal() {
    if (showCallout) dismissCallout();
    // Mark as seen
    try {
       localStorage.setItem('cv-intro-shown', 'true');
    } catch (e) {
      /* Ignore localStorage errors (e.g. disabled/full) */
    }

    refreshState(); // Ensure fresh state
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  // --- Handlers ---

  function handleReset() {
    isResetting = true;
    core.resetToDefault();
    refreshState();
    ToastManager.show('Settings reset to default');
    
    setTimeout(() => {
      isResetting = false;
    }, 600);
  }

  // Construct the new State and pass to Core, which triggers dom updates
  function handleToggleChange(detail: any) {
    const { toggleId, value } = detail;
  
    // Update lists
    let newShown = [...shownToggles];
    let newPeek = [...peekToggles];

    // Remove from all
    newShown = newShown.filter(id => id !== toggleId);
    newPeek = newPeek.filter(id => id !== toggleId);

    if (value === 'show') newShown.push(toggleId);
    if (value === 'peek') newPeek.push(toggleId);

    shownToggles = newShown;
    peekToggles = newPeek;

    core.applyState({ shownToggles: newShown, peekToggles: newPeek, tabs: activeTabs }, { source: 'widget' });
  }

  function handleTabGroupChange(detail: any) {
    const { groupId, tabId } = detail;
    activeTabs[groupId] = tabId;
    activeTabs = {...activeTabs}; // Trigger Svelte Reactivity
    
    core.applyState({ 
      shownToggles, 
      peekToggles, 
      tabs: activeTabs 
    }, { source: 'widget' });
  }

  function handleNavToggle(visible: boolean) {
    navsVisible = visible;
    core.persistTabNavVisibility(visible);
    TabManager.setNavsVisibility(document.body, visible);
  }

  function handleCopyShareUrl() {
    const state: State = { shownToggles, peekToggles, tabs: activeTabs };
    const url = URLStateManager.generateShareableURL(state);
    
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

{#if hasVisibleConfig}
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
    on:click={openModal} 
  />

  <!-- Modal -->
  {#if isModalOpen}
    <Modal 
      title={options.title}
      description={options.description}
      showReset={options.showReset}
      showTabGroups={options.showTabGroups}
      toggles={visibleToggles}
      tabGroups={visibleTabGroups}
      
      {shownToggles}
      {peekToggles}
      {activeTabs}
      {navsVisible}
      {isResetting}

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
