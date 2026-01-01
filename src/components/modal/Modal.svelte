<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { getNavHeadingOnIcon, getNavHeadingOffIcon, getNavDashed, getShareIcon, getCopyIcon, getTickIcon, getGitHubIcon, getResetIcon, getGearIcon, getCloseIcon } from '../../utils/icons';
  import type { ToggleConfig, TabGroupConfig } from '../../types/types';
  import ToggleItem from './ToggleItem.svelte';
  import TabGroupItem from './TabGroupItem.svelte';

  export let title: string | undefined = 'Customize View';
  export let description: string | undefined = '';
  export let showReset: boolean | undefined = true;
  export let showTabGroups: boolean | undefined = true;
  
  // Data
  export let toggles: ToggleConfig[] = [];
  export let tabGroups: TabGroupConfig[] = [];
  
  // State from parent
  export let shownToggles: string[] = [];
  export let peekToggles: string[] = [];
  export let activeTabs: Record<string, string> = {};
  export let navsVisible: boolean = true;
  export let isResetting: boolean = false;

  // Callbacks
  export let onclose: () => void = () => {};
  export let onreset: () => void = () => {};
  export let ontoggleChange: (detail: any) => void = () => {};
  export let ontabGroupChange: (detail: any) => void = () => {};
  export let ontoggleNav: (visible: boolean) => void = () => {};
  export let oncopyShareUrl: () => void = () => {};
  export let onstartShare: () => void = () => {};

  let activeTab: 'customize' | 'share' = 'customize';
  let copySuccess = false;
  let navIconHtml = '';

  $: {
    updateNavIcon(navsVisible, false);
  }

  function updateNavIcon(isVisible: boolean, isHovering: boolean) {
     if (isHovering) {
       navIconHtml = getNavDashed();
     } else {
       navIconHtml = isVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
     }
  }

  function handleNavHover(hovering: boolean) {
    updateNavIcon(navsVisible, hovering);
  }

  function handleNavToggle() {
    ontoggleNav(!navsVisible);
  }

  function handleToggleChange(detail: any) {
    ontoggleChange(detail);
  }

  function handleTabGroupChange(detail: any) {
    ontabGroupChange(detail);
  }

  function copyShareUrl() {
    oncopyShareUrl();
    copySuccess = true;
    setTimeout(() => {
      copySuccess = false;
    }, 2000);
  }

  function getToggleValue(id: string, currentShown: string[], currentPeek: string[]): 'show' | 'hide' | 'peek' {
    if (currentShown.includes(id)) return 'show';
    if (currentPeek.includes(id)) return 'peek';
    return 'hide';
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="modal-overlay" 
  onclick={(e) => { if(e.target === e.currentTarget) onclose(); }} 
  role="presentation"
  transition:fade={{ duration: 200 }}
>
  <div class="modal-box cv-custom-state-modal" role="dialog" aria-modal="true" transition:scale={{ duration: 200, start: 0.9 }}>
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

    <main class="main">
      {#if description}
        <p class="description">{description}</p>
      {/if}

      <div class="tabs">
        <button 
          class="tab {activeTab === 'customize' ? 'active' : ''}" 
          onclick={() => activeTab = 'customize'}
        >Customize</button>
        <button 
          class="tab {activeTab === 'share' ? 'active' : ''}" 
          onclick={() => activeTab = 'share'}
        >Share</button>
      </div>

      {#if activeTab === 'customize'}
        <div class="tab-content active" in:fade={{ duration: 150 }}>
          {#if toggles.length > 0}
            <div class="section">
              <div class="section-heading">Toggles</div>
              <div class="toggles-container">
                {#each toggles as toggle (toggle.id)}
                  <ToggleItem 
                    toggle={toggle} 
                    value={getToggleValue(toggle.id, shownToggles, peekToggles)} 
                    onchange={handleToggleChange}
                  />
                {/each}
              </div>
            </div>
          {/if}

          {#if showTabGroups && tabGroups.length > 0}
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
                        checked={!navsVisible}
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
                  {#each tabGroups as group (group.id)}
                    <TabGroupItem 
                      group={group} 
                      activeTabId={activeTabs[group.id] || group.tabs[0]?.id} 
                      onchange={handleTabGroupChange}
                    />
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="tab-content active" in:fade={{ duration: 150 }}>
          <div class="share-content">
            <div class="share-instruction">
              Create a shareable link for your current customization, or select specific parts of the page to share.
            </div>
            
            <button class="share-action-btn primary start-share-btn" onclick={onstartShare}>
              <span class="btn-icon">{@html getShareIcon()}</span>
              <span>Select elements to share</span>
            </button>
            
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
/* 
  Styles from widget.ts/widget-styles.ts 
  Adapted for Svelte
*/

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
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
}

.title {
  font-size: 1.125rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.9);
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
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(62, 132, 244, 0.1);
  color: #3e84f4;
}

.main {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(80vh - 8rem);
}

.description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

/* Tabs */
.tabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.tab {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab.active {
  color: #3e84f4;
  border-bottom-color: #3e84f4;
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
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.toggles-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

/* Tab Groups Section specific */
.tabgroups-container {
  border-radius: 0.5rem;
}

/* Nav Toggle Card */
.tabgroup-card {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tabgroup-card.header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon {
  width: 2rem;
  height: 2rem;
  color: rgba(0, 0, 0, 0.8);
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
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 0 0;
}

.tabgroup-description {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
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
  background: rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  pointer-events: none;
}

.toggle-switch .switch-knob {
  position: relative;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  transform: translateX(0);
}

.toggle-switch input:checked ~ .switch-knob {
  transform: translateX(20px);
}

.toggle-switch input:checked ~ .switch-bg {
  background: #3e84f4;
}

/* Tab Groups List */
.tab-groups-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Footer */
.footer {
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: rgba(0, 0, 0, 0.8);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #dc2626;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease;
}

.reset-btn:hover {
  background: rgba(220, 38, 38, 0.1);
}

.done-btn {
  background: #3e84f4;
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
  background: #2563eb;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  color: #666;
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
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.share-action-btn:hover {
  border-color: #3e84f4;
  color: #3e84f4;
  background: #f8fbfd;
}

.share-action-btn.primary {
  background: #3e84f4;
  border-color: #3e84f4;
  color: white;
}

.share-action-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}

/* Dark Theme Overrides */
:global(.cv-widget-theme-dark) .modal-box {
  background: #101722;
  color: #e2e8f0;
}

:global(.cv-widget-theme-dark) .header {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.cv-widget-theme-dark) .title {
  color: #e2e8f0;
}

:global(.cv-widget-theme-dark) .close-btn {
  color: rgba(255, 255, 255, 0.6);
}

:global(.cv-widget-theme-dark) .close-btn:hover {
  background: rgba(62, 132, 244, 0.2);
  color: #3e84f4;
}

:global(.cv-widget-theme-dark) .description {
  color: rgba(255, 255, 255, 0.8);
}

:global(.cv-widget-theme-dark) .section-heading {
  color: #e2e8f0;
}

:global(.cv-widget-theme-dark) .toggles-container,
:global(.cv-widget-theme-dark) .tabgroups-container {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.cv-widget-theme-dark) .tabgroup-card {
  background: #101722;
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.cv-widget-theme-dark) .tabgroup-title {
  color: #e2e8f0;
}

:global(.cv-widget-theme-dark) .tabgroup-description {
  color: rgba(255, 255, 255, 0.6);
}

:global(.cv-widget-theme-dark) .footer {
  border-color: rgba(255, 255, 255, 0.1);
  background: #101722;
}

:global(.cv-widget-theme-dark) .footer-link {
  color: rgba(255, 255, 255, 0.6);
}

:global(.cv-widget-theme-dark) .reset-btn {
  color: #f87171;
}

:global(.cv-widget-theme-dark) .reset-btn:hover {
  background: rgba(248, 113, 113, 0.1);
}

:global(.cv-widget-theme-dark) .tab-groups-list {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.cv-widget-theme-dark) .nav-icon {
  color: rgba(255, 255, 255, 0.8);
}
</style>
