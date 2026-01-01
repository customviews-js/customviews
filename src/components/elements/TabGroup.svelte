<svelte:options customElement="cv-tabgroup" />

<script lang="ts">
  import { onMount } from 'svelte';
  import { getPinIcon } from '../../utils/icons';
  import { store } from '../../core/state/data-store.svelte';

  let tabs: Array<{
    id: string,
    rawId: string,
    header: string,
    element: HTMLElement
  }> = $state([]);

  let contentWrapper: HTMLElement | undefined = $state();
  let slotEl: HTMLSlotElement | null = $state(null);
  let initialized = $state(false);
  let hostElement: HTMLElement | null = $state(null);

  // Derive tabGroupId from the host element's group-id attribute
  let tabGroupId = $derived.by(() => hostElement?.getAttribute('group-id') || '');

  // Local active tab state (independent per group instance)
  let localActiveTabId = $state('');

  // Derive pinnedTab from store (shared across groups with same ID)
  let pinnedTab = $derived.by(() => {
    const tabs$ = store.state.tabs ?? {};
    return (tabGroupId && tabs$[tabGroupId]) ? tabs$[tabGroupId] : null;
  });

  // Track the last seen store state to detect real changes
  let lastSeenStoreState = $state<string | null>(null);

  // Authoritative Sync: Only sync when store actually changes
  $effect(() => {
    // If store state has changed from what we last saw
    if (pinnedTab !== lastSeenStoreState) {
      lastSeenStoreState = pinnedTab;
      
      // If there is a pinned tab, it overrides local state
      if (pinnedTab) {
        // Check if we actually need to update (avoid redundant DOM work)
        if (localActiveTabId !== pinnedTab) {
            localActiveTabId = pinnedTab;
            updateVisibility();
        }
      }
    }
  });

  // Sync isTabGroupNavHeadingVisible from store
  let navHeadingVisible = $derived(store.isTabGroupNavHeadingVisible);

  // Icons
  const pinIconHtml = getPinIcon(true);

  onMount(() => {
     if (contentWrapper) {
         // Get the host element (the <cv-tabgroup> custom element)
         const root = contentWrapper.getRootNode() as ShadowRoot;
         hostElement = root.host as HTMLElement;
         
         slotEl = contentWrapper.querySelector('slot');
         if (slotEl) {
             slotEl.addEventListener('slotchange', handleSlotChange);
             handleSlotChange();
         }
     }
  });

  // Self-register with store when tabGroupId becomes available
  $effect(() => {
    if (tabGroupId) {
      store.registerTabGroup(tabGroupId);
    }
  });


  /**
   * Split a tab ID string into an array of individual IDs.
   * Handles space or pipe delimiters.
   * @param tabId - The raw ID string (e.g., "python java")
   */
  function splitTabIds(tabId: string): string[] {
    return tabId.split(/[\s|]+/).filter(id => id.trim() !== '').map(id => id.trim());
  }

  /**
   * Handler for the slotchange event.
   * Scans the assigned elements in the slot to find `<cv-tab>` components.
   * Builds the internal `tabs` state used to render the navigation.
   * Also initializes the active tab if not already set.
   */
  function handleSlotChange() {
    if (!slotEl) return;
    
    const elements = slotEl.assignedElements().filter(el => el.tagName.toLowerCase() === 'cv-tab');
    

    tabs = elements.map((el, index) => {
      const element = el as HTMLElement;
      let rawId = element.getAttribute('tab-id');
      
      // If tab has no tab-id, generate one based on position
      if (!rawId) {
        rawId = `${tabGroupId || 'tabgroup'}-tab-${index}`;
        element.setAttribute('data-cv-internal-id', rawId);
      }

      const splitIds = splitTabIds(rawId);
      const primaryId = splitIds[0] || rawId;

      // Extract Header
      let header = '';
      
      // Check for <cv-tab-header>
      const headerEl = element.querySelector('cv-tab-header');
      if (headerEl) {
        header = headerEl.innerHTML.trim();
      } else {
        // Attribute syntax
        header = element.getAttribute('header') || '';
        if (!header) {
           // Fallback to tab-id or default
           header = element.getAttribute('tab-id') ? primaryId : `Tab ${index + 1}`;
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
      // Initialize active tab by dispatching event if none is set
      if (!localActiveTabId) {
        const firstTabId = tabs[0]!.id;
        localActiveTabId = firstTabId;
      } else {
        updateVisibility();
      }
      initialized = true;
    } else if (initialized) {
        // Re-run visibility in case new tabs matched current activeTab
        updateVisibility();
    }
  }


  /**
   * Updates the visibility of the child `<cv-tab>` elements based on the current `activeTab`.
   * Sets the `active` attribute and `cv-visible`/`cv-hidden` classes on the child elements.
   */
  function updateVisibility() {
    if (!tabs.length) return;

    tabs.forEach(tab => {
        const splitIds = splitTabIds(tab.rawId);
        const isActive = splitIds.includes(localActiveTabId);
        // Set property directly to trigger Svelte component reactivity
        (tab.element as any).active = isActive;
    });
  }

  /**
   * Handles click events on the navigation tabs.
   * Updates the local active tab (visibility is updated automatically via $effect).
   */

  function handleTabClick(tabId: string, event: MouseEvent) {
    event.preventDefault();
    
    // Optimistic Update: Update local state immediately
    if (localActiveTabId !== tabId) {
      localActiveTabId = tabId;
      updateVisibility();
    }
  }

  /**
   * Handles double-click events on the navigation tabs.
   * Updates the store to "pin" the tab globally across all tab groups with the same ID.
   */
  function handleTabDoubleClick(tabId: string, event: MouseEvent) {
    event.preventDefault();
    
    if (!tabGroupId) return;
    
    // Update store directly - this will sync to all tab groups with same group-id
    store.setPinnedTab(tabGroupId, tabId);
  }

</script>


<!-- Container for the tab group -->
<div class="cv-tabgroup-container">
  <!-- Nav -->
  {#if tabs.length > 0 && navHeadingVisible}
    <ul class="cv-tabs-nav nav-tabs" role="tablist">
      {#each tabs as tab}
        {@const splitIds = splitTabIds(tab.rawId)}
        {@const isActive = splitIds.includes(localActiveTabId)}
        {@const isPinned = pinnedTab && splitIds.includes(pinnedTab)}
        <li class="nav-item">
          <a class="nav-link" 
             href={'#' + tab.id} 
             class:active={isActive}
             role="tab"
             aria-selected={isActive}
             onclick={(e) => handleTabClick(tab.id, e)}
             ondblclick={(e) => handleTabDoubleClick(tab.id, e)}
             title="Double-click a tab to 'pin' it in all similar tab groups."
             data-tab-id={tab.id}
             data-raw-tab-id={tab.rawId}
             data-group-id={tabGroupId}
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

  <!-- Content i.e. tab elements -->
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
  
  /* Tab navigation styles */
  ul.nav-tabs {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-top: 0.5rem;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
    align-items: stretch;
  }

  .nav-item {
    margin-bottom: -1px;
    list-style: none;
    display: flex;
    align-items: stretch;
  }

  .nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    color: #495057;
    text-decoration: none;
    background-color: transparent;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
    cursor: pointer;
    min-height: 2.5rem;
    box-sizing: border-box;
  }

  .nav-link :global(p) {
    margin: 0;
    display: inline;
  }

  .nav-link:hover,
  .nav-link:focus {
    border-color: #e9ecef #e9ecef #dee2e6;
    isolation: isolate;
  }

  .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  .nav-link:focus {
    outline: 0;
  }

  .cv-tab-header-container {
      display: flex;
      align-items: center;
      gap: 6px;
  }

  .cv-tab-header-text {
    flex: 1;
  }

  .cv-tab-pin-icon {
      display: inline-flex;
      align-items: center;
      line-height: 0;
      flex-shrink: 0;
  }

  .cv-tab-pin-icon :global(svg) {
    vertical-align: middle;
    width: 14px;
    height: 14px;
  }

  .cv-tabgroup-bottom-border {
    border-bottom: 1px solid #dee2e6;
  }

  @media print {
    ul.cv-tabs-nav {
      display: none !important;
    }
  }
</style>
