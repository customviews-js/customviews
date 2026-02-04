<svelte:options
  customElement={{
    tag: 'cv-tabgroup',
    props: {
      groupId: { reflect: true, type: 'String', attribute: 'group-id' },
    },
  }}
/>

<script lang="ts">
  import { onMount } from 'svelte';
  import { getPinIcon } from '$lib/utils/icons';
  import { store } from '$lib/stores/main-store.svelte';

  //  ID of the tabgroup Group
  let { groupId } = $props<{ groupId?: string }>();
  $effect(() => {
    if (groupId) store.registerTabGroup(groupId);
  });

  let tabs: Array<{
    id: string;
    rawId: string;
    header: string;
    element: HTMLElement;
  }> = $state([]);

  let contentWrapper: HTMLElement | undefined = $state();
  let slotEl: HTMLSlotElement | null = $state(null);
  let initialized = $state(false);

  // Local active tab state (independent per group instance)
  let localActiveTabId = $state('');

  // Derive pinnedTab from store (shared across groups with same ID)
  let pinnedTab = $derived.by(() => {
    const tabs$ = store.state.tabs ?? {};
    return groupId && tabs$[groupId] ? tabs$[groupId] : null;
  });

  // Track the last seen store state to detect real changes
  let lastSeenStoreState = $state<string | null>(null);

  // Authoritative Sync: Only sync when store actually changes
  $effect(() => {
    // If store state has changed from what we last saw
    // Note: strict inequality works here because both are strings or null
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
      slotEl = contentWrapper.querySelector('slot');
      if (slotEl) {
        slotEl.addEventListener('slotchange', handleSlotChange);
        handleSlotChange();
      }
    }
  });

  function splitTabIds(tabId: string): string[] {
    return tabId
      .split(/[\s|]+/)
      .filter((id) => id.trim() !== '')
      .map((id) => id.trim());
  }

  // Todo: For handleSlotChange(), consider if there is a svelte way
  // to do this without the need for the slotchange event.

  /**
   * Handler for the slotchange event.
   * Scans the assigned elements in the slot to find `<cv-tab>` components.
   * Builds the internal `tabs` state used to render the navigation.
   * Also initializes the active tab if not already set.
   */
  function handleSlotChange() {
    if (!slotEl) return;

    const elements = slotEl
      .assignedElements()
      .filter((el) => el.tagName.toLowerCase() === 'cv-tab');

    tabs = elements.map((el, index) => {
      const element = el as HTMLElement;
      let rawId = element.getAttribute('tab-id');

      // If tab has no tab-id, generate one based on position
      if (!rawId) {
        rawId = `${groupId || 'tabgroup'}-tab-${index}`;
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
        element,
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

    tabs.forEach((tab) => {
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

    if (!groupId) return;

    // Update store directly - this will sync to all tab groups with same group-id
    store.setPinnedTab(groupId, tabId);
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
          <a
            class="nav-link"
            href={'#' + tab.id}
            class:active={isActive}
            role="tab"
            aria-selected={isActive}
            onclick={(e) => handleTabClick(tab.id, e)}
            ondblclick={(e) => handleTabDoubleClick(tab.id, e)}
            title="Double-click a tab to 'pin' it in all similar tab groups."
            data-tab-id={tab.id}
            data-raw-tab-id={tab.rawId}
            data-group-id={groupId}
          >
            <span class="cv-tab-header-container">
              <span class="cv-tab-header-text">{@html tab.header}</span>
              <span class="cv-tab-pin-icon" style:display={isPinned ? 'inline-flex' : 'none'}
                >{@html pinIconHtml}</span
              >
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Inject global stylesheets to support icons (FontAwesome, etc.) inside Shadow DOM -->
  {#each Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as link}
    <link rel="stylesheet" href={(link as HTMLLinkElement).href} />
  {/each}

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
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out;
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
