<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import {
    getNavHeadingOnIcon,
    getNavHeadingOffIcon,
    getNavDashed,
    getShareIcon,
    getCopyIcon,
    getTickIcon,
    getGitHubIcon,
    getResetIcon,
    getGearIcon,
    getCloseIcon,
    getSunIcon,
    getMoonIcon,
  } from '$lib/utils/icons';
  import { themeStore } from '$lib/stores/theme-store.svelte';
  import type { CustomViewsController } from '$lib/controller.svelte';
  import { URLStateManager } from '$lib/state/url-state-manager';
  import { showToast } from '$lib/stores/toast-store.svelte';
  import { placeholderRegistryStore } from '$lib/stores/placeholder-registry-store.svelte';
  import { placeholderValueStore } from '$lib/stores/placeholder-value-store.svelte';
  import { findHighestVisibleElement, scrollToElement } from '$lib/utils/scroll-utils';

  import ToggleItem from './ToggleItem.svelte';
  import TabGroupItem from './TabGroupItem.svelte';
  import PlaceholderItem from './PlaceholderItem.svelte';
  import { copyToClipboard } from '$lib/utils/clipboard-utils';

  interface Props {
    controller: CustomViewsController;
    title?: string;
    description?: string;
    showReset?: boolean;
    showTabGroups?: boolean;
    isResetting?: boolean;
    onclose?: () => void;
    onreset?: () => void;
    onstartShare?: () => void;
  }

  let {
    controller,
    title = 'Customize View',
    description = '',
    showReset = true,
    showTabGroups = true,
    isResetting = false,
    onclose = () => {},
    onreset = () => {},
    onstartShare = () => {},
  }: Props = $props();

  // --- Derived State from Core ---
  const store = $derived(controller.store);
  const areTabNavsVisible = $derived(store.isTabGroupNavHeadingVisible);

  // Config Items
  const toggles = $derived(store.menuToggles);
  const tabGroups = $derived(store.menuTabGroups);
  const sectionOrder = $derived(store.configSectionOrder);

  // State Items
  let shownToggles = $derived(store.state.shownToggles ?? []);
  let peekToggles = $derived(store.state.peekToggles ?? []);
  let activeTabs = $derived(store.state.tabs ?? {});

  // Placeholder Data
  let placeholderDefinitions = $derived.by(() => {
    return placeholderRegistryStore.definitions.filter((d) => {
      if (d.hiddenFromSettings) return false;
      if (d.isLocal) {
        return store.detectedPlaceholders.has(d.name);
      }
      return true;
    });
  });
  let placeholderValues = $derived(placeholderValueStore.values);

  // --- UI Logic ---

  let hasCustomizeContent = $derived(
    toggles.length > 0 ||
      placeholderDefinitions.length > 0 ||
      (showTabGroups && tabGroups.length > 0),
  );

  let activeTab = $state<'customize' | 'share'>('customize');

  let copySuccess = $state(false);
  let navIconHtml = $state('');

  // Height preservation logic
  let mainClientHeight = $state(0);
  let preservedHeight = $state(0);

  $effect(() => {
    if (!hasCustomizeContent && activeTab === 'customize') {
      activeTab = 'share';
    }
  });

  $effect(() => {
    if (activeTab === 'customize' && mainClientHeight > preservedHeight) {
      preservedHeight = mainClientHeight;
    }
  });

  $effect(() => {
    updateNavIcon(areTabNavsVisible, false);
  });

  function updateNavIcon(isVisible: boolean, isHovering: boolean) {
    if (isHovering) {
      navIconHtml = getNavDashed();
    } else {
      navIconHtml = isVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
    }
  }

  function handleNavHover(hovering: boolean) {
    updateNavIcon(areTabNavsVisible, hovering);
  }

  function handleNavToggle() {
    store.isTabGroupNavHeadingVisible = !areTabNavsVisible;
  }

  // --- Core Actions ---

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

  function handlePlaceholderChange(detail: { name: string; value: string }) {
    placeholderValueStore.set(detail.name, detail.value);
  }

  async function copyShareUrl() {
    const url = URLStateManager.generateShareableURL(store.state);
    try {
      await copyToClipboard(url);
      showToast('Link copied to clipboard!');
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('Failed to copy URL. Please copy manually.');
    }
  }

  function computeToggleState(
    id: string,
    currentShown: string[],
    currentPeek: string[],
  ): 'show' | 'hide' | 'peek' {
    if (currentShown.includes(id)) return 'show';
    if (currentPeek.includes(id)) return 'peek';
    return 'hide';
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="modal-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose();
  }}
  role="presentation"
  transition:fade={{ duration: 200 }}
>
  <div
    class="modal-box cv-custom-state-modal"
    role="dialog"
    aria-modal="true"
    transition:scale={{ duration: 200, start: 0.9 }}
  >
    <header class="header">
      <div class="header-content">
        <div class="modal-icon">
          <!-- Gear Icon -->
          {@html getGearIcon()}
        </div>
        <div class="title">{title}</div>
      </div>
      <button class="close-btn" aria-label="Close modal" onclick={onclose}>
        <!-- Close icon svg -->
        {@html getCloseIcon()}
      </button>
    </header>

    <main
      class="main"
      bind:clientHeight={mainClientHeight}
      style:min-height={activeTab === 'share' && preservedHeight > 0
        ? `${preservedHeight}px`
        : undefined}
    >
      <div class="tabs">
        {#if hasCustomizeContent}
          <button
            class="tab {activeTab === 'customize' ? 'active' : ''}"
            onclick={() => (activeTab = 'customize')}>Customize</button
          >
        {/if}
        <button
          class="tab {activeTab === 'share' ? 'active' : ''}"
          onclick={() => (activeTab = 'share')}>Share</button
        >
      </div>

      {#if activeTab === 'customize'}
        <div class="tab-content active" in:fade={{ duration: 150 }}>
          {#if description}
            <p class="description">{description}</p>
          {/if}

          {#each sectionOrder as section}
            <!-- Toggles Section -->
            {#if section === 'toggles' && toggles.length > 0}
              <div class="section">
                <div class="section-heading">Toggles</div>
                <div class="toggles-container">
                  {#each toggles as toggle (toggle.toggleId)}
                    <ToggleItem
                      {toggle}
                      value={computeToggleState(toggle.toggleId, shownToggles, peekToggles)}
                      onchange={handleToggleChange}
                    />
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Placeholders Section -->
            {#if section === 'placeholders' && placeholderDefinitions.length > 0}
              <div class="section">
                <div class="section-heading">Placeholders</div>
                <div class="placeholders-container">
                  {#each placeholderDefinitions as def (def.name)}
                    <PlaceholderItem
                      definition={def}
                      value={placeholderValues[def.name] ?? def.defaultValue ?? ''}
                      onchange={handlePlaceholderChange}
                    />
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Tab Groups Section -->
            {#if section === 'tabGroups' && showTabGroups && tabGroups.length > 0}
              <div class="section">
                <div class="section-heading">Tab Groups</div>
                <div class="tabgroups-container">
                  <!-- Navigation Headers Toggle -->
                  <div
                    class="tabgroup-card header-card"
                    onmouseenter={() => handleNavHover(true)}
                    onmouseleave={() => handleNavHover(false)}
                    role="group"
                  >
                    <div class="tabgroup-row">
                      <div class="logo-box" id="cv-nav-icon-box">
                        <div class="nav-icon">{@html navIconHtml}</div>
                      </div>
                      <div class="tabgroup-info">
                        <div class="tabgroup-title-container">
                          <p class="tabgroup-title">Show only the selected tab</p>
                        </div>
                        <p class="tabgroup-description">Hide the navigation headers</p>
                      </div>
                      <label class="toggle-switch nav-toggle">
                        <input
                          class="nav-pref-input"
                          type="checkbox"
                          checked={!areTabNavsVisible}
                          onchange={handleNavToggle}
                          aria-label="Show only the selected tab"
                        />
                        <span class="switch-bg"></span>
                        <span class="switch-knob"></span>
                      </label>
                    </div>
                  </div>

                  <!-- Tab Groups List -->
                  <div class="tab-groups-list">
                    {#each tabGroups as group (group.groupId)}
                      <TabGroupItem
                        {group}
                        activeTabId={activeTabs[group.groupId] || group.tabs[0]?.tabId}
                        onchange={handleTabGroupChange}
                      />
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          {/each}

          <!-- Hide Light Dark Theme Selection for now -->
          {#if false}
            <div class="section">
              <div class="section-heading">Theme</div>
              <div class="theme-selector">
                <button
                  class="theme-btn {themeStore.mode === 'light' ? 'active' : ''}"
                  onclick={() => themeStore.setMode('light')}
                  title="Light Mode"
                >
                  {@html getSunIcon()}
                  <span>Light</span>
                </button>
                <button
                  class="theme-btn {themeStore.mode === 'dark' ? 'active' : ''}"
                  onclick={() => themeStore.setMode('dark')}
                  title="Dark Mode"
                >
                  {@html getMoonIcon()}
                  <span>Dark</span>
                </button>
                <!-- Auto button disabled for now -->
                <!--
              <button 
                class="theme-btn {themeStore.mode === 'auto' ? 'active' : ''}" 
                onclick={() => themeStore.setMode('auto')}
                title="System Default"
              >
                {@html getSystemIcon()}
                <span>Auto</span>
              </button>
              -->
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="tab-content active" in:fade={{ duration: 150 }}>
          <div class="share-content">
            <div class="share-instruction">
              Create a shareable link for your current customization, or select specific parts of
              the page to share.
            </div>

            <button class="share-action-btn primary start-share-btn" onclick={onstartShare}>
              <span class="btn-icon">{@html getShareIcon()}</span>
              <span>Select elements to share</span>
            </button>

            {#if hasCustomizeContent}
              <button class="share-action-btn copy-url-btn" onclick={copyShareUrl}>
                <span class="btn-icon">
                  {#if copySuccess}
                    {@html getTickIcon()}
                  {:else}
                    {@html getCopyIcon()}
                  {/if}
                </span>
                <span>
                  {#if copySuccess}
                    Copied!
                  {:else}
                    Copy Shareable URL of Settings
                  {/if}
                </span>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </main>

    <footer class="footer">
      {#if showReset}
        <button class="reset-btn" title="Reset to Default" onclick={onreset}>
          <span class="reset-btn-icon {isResetting ? 'spinning' : ''}">
            {@html getResetIcon()}
          </span>
          <span>Reset</span>
        </button>
      {:else}
        <div></div>
      {/if}

      <a href="https://github.com/customviews-js/customviews" target="_blank" class="footer-link">
        {@html getGitHubIcon()}
        <span>View on GitHub</span>
      </a>

      <button class="done-btn" onclick={onclose}>Done</button>
    </footer>
  </div>
</div>

<style>
  /* Modal Overlay & Modal Frame */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10002;
  }

  .modal-box {
    background: var(--cv-bg);
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px var(--cv-shadow);
    max-width: 32rem;
    width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--cv-border);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .modal-icon {
    position: relative;
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    color: var(--cv-text);
  }

  .modal-icon :global(svg) {
    fill: currentColor;
  }

  .title {
    font-size: 1.125rem;
    font-weight: bold;
    color: var(--cv-text);
    margin: 0;
  }

  .close-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: transparent;
    border: none;
    color: var(--cv-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(62, 132, 244, 0.1);
    color: var(--cv-primary);
  }

  .main {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: calc(80vh - 8rem);
    min-height: var(--cv-modal-min-height, 20rem);
  }

  .description {
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0 0 1rem 0;
    line-height: 1.4;
  }

  /* Tabs */
  .tabs {
    display: flex;
    margin-bottom: 1rem;
    border-bottom: 2px solid var(--cv-border);
  }

  .tab {
    background: transparent;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--cv-text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }

  .tab.active {
    color: var(--cv-primary);
    border-bottom-color: var(--cv-primary);
  }

  .tab-content {
    display: none;
  }

  .tab-content.active {
    display: block;
  }

  /* Section Styling */
  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .section-heading {
    font-size: 1rem;
    font-weight: bold;
    color: var(--cv-text);
    margin: 0;
  }

  .toggles-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: hidden;
  }

  /* Theme Selector */
  .theme-selector {
    display: flex;
    background: var(--cv-input-bg);
    border: 1px solid var(--cv-input-border);
    border-radius: 0.5rem;
    padding: 0.25rem;
    gap: 0.25rem;
  }

  .theme-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: none;
    background: transparent;
    color: var(--cv-text-secondary);
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .theme-btn:hover {
    background: var(--cv-bg-hover);
    color: var(--cv-text);
  }

  .theme-btn.active {
    background: var(--cv-primary);
    color: white;
    box-shadow: var(--cv-shadow-sm);
  }

  /* Tab Groups Section specific */
  .tabgroups-container {
    border-radius: 0.5rem;
  }

  /* Nav Toggle Card */
  .tabgroup-card {
    background: var(--cv-bg);
    border-bottom: 1px solid var(--cv-border);
  }

  .tabgroup-card.header-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid var(--cv-border);
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tabgroup-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }

  .logo-box {
    width: 3rem;
    height: 3rem;
    background: var(--cv-modal-icon-bg);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-icon {
    width: 2rem;
    height: 2rem;
    color: var(--cv-text);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  .tabgroup-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tabgroup-title {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0 0 0 0;
  }

  .tabgroup-description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0;
    line-height: 1.3;
  }

  /* Toggle Switch */
  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 44px;
    height: 24px;
    background: var(--cv-switch-bg);
    border-radius: 9999px;
    padding: 2px;
    box-sizing: border-box;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: none;
  }

  .toggle-switch input {
    display: none;
  }

  .toggle-switch .switch-bg {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: var(--cv-switch-bg);
    transition: background-color 0.2s ease;
    pointer-events: none;
  }

  .toggle-switch .switch-knob {
    position: relative;
    width: 20px;
    height: 20px;
    background: var(--cv-switch-knob);
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    transform: translateX(0);
  }

  .toggle-switch input:checked ~ .switch-knob {
    transform: translateX(20px);
  }

  .toggle-switch input:checked ~ .switch-bg {
    background: var(--cv-primary);
  }

  /* Tab Groups List */
  .tab-groups-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Footer */
  .footer {
    padding: 1rem;
    border-top: 1px solid var(--cv-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--cv-bg);
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }

  .footer-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--cv-text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .footer-link:hover {
    color: var(--cv-text);
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--cv-danger);
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .reset-btn:hover {
    background: var(--cv-danger-bg);
    border-color: var(--cv-danger);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .done-btn {
    background: var(--cv-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .done-btn:hover {
    background: var(--cv-primary-hover);
  }

  .reset-btn-icon {
    display: flex;
    align-items: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  :global(.spinning) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Share Tab Styles */
  .share-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
    padding: 1rem 0;
  }

  .share-instruction {
    font-size: 0.95rem;
    color: var(--cv-text-secondary);
    margin-bottom: 0.5rem;
  }

  .share-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 320px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--cv-border);
    background: var(--cv-bg);
    color: var(--cv-text);
  }

  .share-action-btn:hover {
    border-color: var(--cv-primary);
    color: var(--cv-primary);
    background: var(--cv-bg-hover);
  }

  .share-action-btn.primary {
    background: var(--cv-primary);
    border-color: var(--cv-primary);
    color: white;
  }

  .share-action-btn.primary:hover {
    background: var(--cv-primary-hover);
    border-color: var(--cv-primary-hover);
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Placeholder Inputs */
  .placeholders-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
