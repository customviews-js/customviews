<svelte:options customElement="cv-tabgroup" />

<script lang="ts">
  import { onMount } from 'svelte';
  import { getPinIcon } from '../../utils/icons';

  export let id: string = '';
  export let activeTab: string = '';
  export let navsVisible: boolean = true;
  export let pinnedTab: string = '';

  function dispatch(name: string, detail: any) {
    if (!contentWrapper) return;
    contentWrapper.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  let tabs: Array<{
    id: string,
    rawId: string,
    header: string,
    element: HTMLElement
  }> = [];

  let contentWrapper: HTMLElement;
  let slotEl: HTMLSlotElement | null = null;
  let initialized = false;

  // Icons
  const pinIconHtml = getPinIcon(true);

  onMount(() => {
     if (contentWrapper) {
         slotEl = contentWrapper.querySelector('slot');
         if (slotEl) {
             slotEl.addEventListener('slotchange', handleSlotChange);
             // Initial check
             handleSlotChange();
         }
     }
  });

  $: if (activeTab) {
    updateVisibility();
  }

  function splitTabIds(tabId: string): string[] {
    return tabId.split(/[\s|]+/).filter(id => id.trim() !== '').map(id => id.trim());
  }

  function handleSlotChange() {
    if (!slotEl) return;
    
    const elements = slotEl.assignedElements().filter(el => el.tagName.toLowerCase() === 'cv-tab');
    
    // ... same logic ...
    tabs = elements.map((el, index) => {
      const element = el as HTMLElement;
      let rawId = element.getAttribute('id');
      
      // If tab has no id, generate one based on position (parity with TabManager)
      if (!rawId) {
        rawId = `${id || 'tabgroup'}-tab-${index}`;
        element.setAttribute('data-cv-internal-id', rawId);
      }

      const splitIds = splitTabIds(rawId);
      const primaryId = splitIds[0] || rawId;

      // Extract Header
      let header = '';
      
      // Check for <cv-tab-header> (new syntax)
      const headerEl = element.querySelector('cv-tab-header');
      if (headerEl) {
        header = headerEl.innerHTML.trim();
      } else {
        // Attribute syntax
        header = element.getAttribute('header') || '';
        if (!header) {
           // Fallback to ID or default
           header = element.getAttribute('id') ? primaryId : `Tab ${index + 1}`;
        }
      }

      return {
        id: primaryId,
        rawId,
        header,
        element
      };
    });

    if (!initialized && tabs.length > 0) {
      if (!activeTab) {
        // Default to activeTab if passed, else first tab
        // If activeTab is already set (e.g. via prop), use it.
        // Wait, if activeTab is '', set to first.
        if (!activeTab) {
             activeTab = tabs[0]!.id;
             dispatch('tabchange', { groupId: id, tabId: activeTab });
        } else {
             updateVisibility();
        }
      } else {
        updateVisibility();
      }
      initialized = true;
    } else if (initialized) {
        // Re-run visibility in case new tabs matched current activeTab
        updateVisibility();
    }
  }

  // ... rest of functions ...


  function updateVisibility() {
    if (!tabs.length) return;

    tabs.forEach(tab => {
        const splitIds = splitTabIds(tab.rawId);
        const isActive = splitIds.includes(activeTab);
        
        // Pass active state to child
        if (isActive) {
            tab.element.setAttribute('active', 'true');
            tab.element.classList.remove('cv-hidden');
            tab.element.classList.add('cv-visible');
        } else {
            tab.element.removeAttribute('active'); // or set to false
            tab.element.setAttribute('active', 'false');
            tab.element.classList.add('cv-hidden');
            tab.element.classList.remove('cv-visible');
        }
    });
  }

  function handleTabClick(tabId: string, event: MouseEvent) {
    event.preventDefault();
    if (activeTab === tabId) return; // No change

    activeTab = tabId;
    dispatch('tabchange', { groupId: id, tabId: activeTab });
  }

  function handleTabDoubleClick(tabId: string, event: MouseEvent) {
      event.preventDefault();
      // Dispatch double click for "pinning" logic which is handled externally by TabManager/Core
      dispatch('tabdblclick', { groupId: id, tabId: tabId });
  }

  // Exposed method for external managers to find if a tab exists here
  export function hasTab(tabId: string): boolean {
      return tabs.some(t => {
          const splitIds = splitTabIds(t.rawId);
          return splitIds.includes(tabId);
      });
  }

</script>

<div class="cv-tabgroup-container">
  <!-- Nav -->
  {#if tabs.length > 0 && navsVisible}
    <ul class="cv-tabs-nav nav-tabs" role="tablist">
      {#each tabs as tab}
        {@const splitIds = splitTabIds(tab.rawId)}
        {@const isActive = splitIds.includes(activeTab)}
        {@const isPinned = pinnedTab && splitIds.includes(pinnedTab)}
        <li class="nav-item">
          <a class="nav-link" 
             href={'#' + tab.id} 
             class:active={isActive}
             role="tab"
             aria-selected={isActive}
             on:click={(e) => handleTabClick(tab.id, e)}
             on:dblclick={(e) => handleTabDoubleClick(tab.id, e)}
             title="Double-click a tab to 'pin' it in all similar tab groups."
             data-tab-id={tab.id}
             data-raw-tab-id={tab.rawId}
             data-group-id={id}
          >
            <span class="cv-tab-header-container">
               <span class="cv-tab-header-text">{@html tab.header}</span>
               <span class="cv-tab-pin-icon" style:display={isPinned ? 'inline-flex' : 'none'}>{@html pinIconHtml}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Content -->
  <div class="cv-tabgroup-content" bind:this={contentWrapper}>
      <slot></slot>
  </div>
  
  <div class="cv-tabgroup-bottom-border"></div>
</div>

<style>
  :host {
    display: block;
    margin-bottom: 24px;
  }
  
  /* Inherit global styles for navs or define them here if not global.
     The generic .nav-tabs classes usually come from bootstrap or site-wide CSS.
     Since this is a shadow DOM component, global styles WON'T leak in unless we use <link> or @import.
     However, customviews seems to rely on being injected into pages that might have these styles,
     OR it provides them. Check toggle-styles.ts or similar.
     
     If this is a Custom Element with Shadow DOM, we MUST provide the styles for the nav here.
     The previous implementation was vanilla Light DOM custom element, so it used global styles.
     
     Svelte custom elements use Shadow DOM by default.
     We need to copy the relevant nav styles here.
  */
  
  ul.nav-tabs {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }

  .nav-item {
    margin-bottom: -1px;
  }

  .nav-link {
    display: block;
    padding: 0.5rem 1rem;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    text-decoration: none;
    color: #495057;
    background-color: transparent;
    cursor: pointer;
  }

  .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  .cv-tab-header-container {
      display: flex;
      align-items: center;
      gap: 6px;
  }

  .cv-tab-pin-icon {
      display: inline-flex;
      align-items: center;
  }

  /* Support for hiding navs via class on body is tricky in Shadow DOM 
     because we can't easily see body class.
     But we can check a prop or attribute on the host. 
  */
</style>
