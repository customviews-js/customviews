<script lang="ts">
  import { onMount } from 'svelte';
  import type { CustomViewsController } from '$lib/controller.svelte';
  import type { UIManagerOptions } from '$lib/ui-manager';
  
  import IntroCallout from '$features/settings/IntroCallout.svelte';
  import SettingsIcon from '$features/settings/SettingsIcon.svelte';
  import Modal from '$features/settings/Modal.svelte';
  import { showToast } from '$lib/stores/toast-store.svelte';
  import { shareStore, type SelectionMode } from '$features/share/stores/share-store.svelte';
  import { themeStore } from '$lib/stores/theme-store.svelte';
  import { DEFAULT_EXCLUDED_TAGS, DEFAULT_EXCLUDED_IDS } from '$lib/constants';
  import Toast from '$ui/Toast.svelte';
  import ShareOverlay from '$features/share/ShareOverlay.svelte';
  import FocusBanner from '$features/focus/FocusBanner.svelte';
  
  import { UrlActionRouter } from '$lib/services/url-action-router.svelte';
  import { IntroManager } from '$lib/services/intro-manager.svelte';

  let { controller, options } = $props<{ controller: CustomViewsController, options: UIManagerOptions }>();

  // --- Derived State ---
  const store = $derived(controller.store);
  const storeConfig = $derived(controller.store.config);
  const settingsEnabled = $derived(options.settingsEnabled ?? true);

  // --- Services ---
  const introManager = new IntroManager(
    () => controller.persistenceManager, 
    () => options.callout
  );
  const router = new UrlActionRouter({
    onOpenModal: openModal,
    onStartShare: handleStartShare,
    checkSettingsEnabled: () => settingsEnabled
  });

  // --- UI State ---
  let isModalOpen = $state(false);
  let isResetting = $state(false);
  let settingsIcon: { resetPosition: () => void } | undefined = $state();

  // --- Computed Props ---
  
  // Share Configuration
  const shareExclusions = $derived(storeConfig.shareExclusions || {});
  const excludedTags = $derived([...DEFAULT_EXCLUDED_TAGS, ...(shareExclusions.tags || [])]);
  const excludedIds = $derived([...DEFAULT_EXCLUDED_IDS, ...(shareExclusions.ids || [])]);
  
  // --- Initialization ---

  onMount(() => {
    initTheme();
    router.init();
    
    return () => router.destroy();
  });

  function initTheme() {
    themeStore.init(controller.persistenceManager);
  }

  // --- Effects ---

  $effect(() => {
    introManager.init(store.hasPageElements, settingsEnabled);
  });

  // --- Modal Actions ---

  function openModal() {
    if (!settingsEnabled) return;
    introManager.dismiss();
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function handleReset() {
    isResetting = true;
    controller.resetToDefault();
    settingsIcon?.resetPosition();
    
    showToast('Settings reset to default');
    
    setTimeout(() => {
      isResetting = false;
      settingsIcon?.resetPosition();
    }, 600);
  }

  function handleStartShare(mode?: SelectionMode) {
    closeModal();
    if (mode) {
      shareStore.setSelectionMode(mode);
    }
    shareStore.toggleActive(true);
  }

  // --- Settings Visibility ---
  const shouldRenderSettings = $derived(
    settingsEnabled && (
      store.hasMenuOptions || 
      options.panel.showTabGroups || 
      isModalOpen
    )
  );
</script>

<div class="cv-widget-root" data-theme={themeStore.currentTheme}>
  <!-- Intro Callout -->
  {#if introManager.showCallout && settingsEnabled}
    <IntroCallout 
      position={options.icon.position} 
      message={options.callout?.message}
      enablePulse={options.callout?.enablePulse}
      backgroundColor={options.callout?.backgroundColor}
      textColor={options.callout?.textColor}
      onclose={() => introManager.dismiss()} 
    />
  {/if}

  <!-- Toast Container -->
  <Toast />

  {#if shareStore.isActive}
    <ShareOverlay {excludedTags} {excludedIds} />
  {/if}

  <FocusBanner />

  <!-- Widget Icon: Only specific to Settings -->
  {#if shouldRenderSettings && options.icon.show}
    <SettingsIcon 
      bind:this={settingsIcon}
      position={options.icon.position} 
      title={options.panel.title} 
      pulse={introManager.showPulse} 
      onclick={openModal}
      iconColor={options.icon?.color}
      backgroundColor={options.icon?.backgroundColor}
      opacity={options.icon?.opacity}
      scale={options.icon?.scale}
      persistence={controller.persistenceManager}
    />
  {/if}

  <!-- Modal: Only specific to Settings -->
  {#if settingsEnabled && isModalOpen}
    <Modal 
      {controller}
      title={options.panel.title}
      description={options.panel.description}
      showReset={options.panel.showReset}
      showTabGroups={options.panel.showTabGroups}
      isResetting={isResetting}
      onclose={closeModal}
      onreset={handleReset}
      onstartShare={handleStartShare}
    />
  {/if}
</div>

<style>
  /* Root should allow clicks to pass through to the page unless hitting checking/interactive element */
  :global(.cv-widget-root) {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 9999;
    pointer-events: none; /* Crucial: Allow clicks to pass through */

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

  /* But interactive children need pointer-events back */
  :global(.cv-widget-root > *) {
    pointer-events: auto;
  }

  /* Exception: ShareOverlay manages its own pointer events */
  :global(.cv-widget-root .cv-share-overlay) {
    pointer-events: none; /* Overlay often passes clicks until specialized handles active */
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
