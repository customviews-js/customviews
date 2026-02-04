<script lang="ts">
  import {
    shareStore,
    SHAREABLE_SELECTOR,
    isGenericWrapper,
  } from '$features/share/stores/share-store.svelte';
  import ShareToolbar from './ShareToolbar.svelte';
  import HoverHelper from './HoverHelper.svelte';

  let {
    excludedTags = ['HEADER', 'NAV', 'FOOTER'],
    excludedIds = ['cv-floating-action-bar', 'cv-hover-helper'],
  }: { excludedTags?: string[]; excludedIds?: string[] } = $props();

  let excludedTagSet = $derived(new Set(excludedTags.map((t: string) => t.toUpperCase())));
  let excludedIdSet = $derived(new Set(excludedIds));

  $effect(() => {
    document.body.classList.add('cv-share-active');
    return () => {
      document.body.classList.remove('cv-share-active');
    };
  });

  let isDragging = $state(false);
  let dragStart = $state<{ x: number; y: number } | null>(null);
  let dragCurrent = $state<{ x: number; y: number } | null>(null);
  let wasDragging = false;

  // Cache candidates when active to avoid repeated DOM queries
  let cachedCandidates: HTMLElement[] = [];

  let selectionBox = $derived.by(() => {
    if (!dragStart || !dragCurrent || !isDragging) return null;
    const left = Math.min(dragStart.x, dragCurrent.x);
    const top = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);
    return { left, top, width, height };
  });

  /**
   * Handles window-level mouse hover events to identify and highlight shareable elements.
   */
  function handleHover(e: MouseEvent) {
    if (!shareStore.isActive || isDragging) return;

    const target = e.target as HTMLElement;

    // 1. If we are on the helper or toolbar, do nothing (keep current selection)
    if (target.closest('.hover-helper') || target.closest('.floating-bar')) {
      return;
    }

    // 2. Exclude by Tag/ID
    if (isOrHasExcludedParentElement(target)) return;

    // 3. Find nearest shareable
    const shareablePart = target.closest(SHAREABLE_SELECTOR);

    // If not on a shareable part, clear selection immediately
    if (!shareablePart) {
      shareStore.setHoverTarget(null);
      return;
    }

    const finalTarget = shareablePart as HTMLElement;

    // Check ancestors selection (level up logic)
    let parent = finalTarget.parentElement;
    let selectedAncestor: HTMLElement | null = null;
    while (parent) {
      if (shareStore.selectedElements.has(parent)) {
        selectedAncestor = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (selectedAncestor) {
      shareStore.setHoverTarget(selectedAncestor);
      return;
    }

    // New target
    if (isGenericWrapper(finalTarget)) {
      shareStore.setHoverTarget(null);
      return;
    }

    // Check selection is not child of current hover target
    if (shareStore.currentHoverTarget !== finalTarget) {
      if (shareStore.currentHoverTarget && shareStore.currentHoverTarget.contains(finalTarget)) {
        return;
      }

      shareStore.setHoverTarget(finalTarget);
    }
  }

  /**
   * Handles mouse down events to start a selection drag.
   */
  function handleMouseDown(e: MouseEvent) {
    if (!shareStore.isActive) return;

    // Ignore clicks on UI
    const target = e.target as HTMLElement;
    if (target.closest('.floating-bar') || target.closest('.hover-helper')) return;

    // Disable drag on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Prevent default browser text selection
    e.preventDefault();

    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    isDragging = false;
    wasDragging = false; // Ensure clean state
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragStart) return;

    dragCurrent = { x: e.clientX, y: e.clientY };

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.hypot(dx, dy) > 12) {
      isDragging = true;
      shareStore.setHoverTarget(null); // Clear highlight on drag start
    }
  }

  function handleMouseUp() {
    if (isDragging && dragStart && dragCurrent) {
      // Perform selection logic
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      // Optimization: Skip if drag area is too small (avoids accidental micro-selections)
      if (width < 10 || height < 10) {
        isDragging = false;
        dragStart = null;
        dragCurrent = null;
        return;
      }

      const left = Math.min(dragStart.x, dragCurrent.x);
      const top = Math.min(dragStart.y, dragCurrent.y);
      const right = left + width;
      const bottom = top + height;

      // Populate cache only if needed (lazy loading)
      if (cachedCandidates.length === 0) {
        cachedCandidates = Array.from(
          document.querySelectorAll(SHAREABLE_SELECTOR),
        ) as HTMLElement[];
      }

      const selected: HTMLElement[] = [];

      cachedCandidates.forEach((node) => {
        const el = node as HTMLElement;
        if (isOrHasExcludedParentElement(el)) return;

        const rect = el.getBoundingClientRect();
        // Check containment (element must be fully inside selection box)
        // AND check if it's not just a generic wrapper
        if (
          rect.left >= left &&
          rect.right <= right &&
          rect.top >= top &&
          rect.bottom <= bottom &&
          !isGenericWrapper(el)
        ) {
          selected.push(el);
        }
      });

      if (selected.length > 0) {
        shareStore.addMultipleElements(selected);
      }

      wasDragging = true;
    }

    isDragging = false;
    dragStart = null;
    dragCurrent = null;
  }

  function handleClick(e: MouseEvent) {
    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging = false; // Synchronous reset
      return;
    }

    const target = e.target as HTMLElement;

    if (target.closest('.hover-helper') || target.closest('.floating-bar')) return;

    // Intercept click on document
    e.preventDefault();
    e.stopPropagation();

    // If we have a hover target, toggle it
    const currentTarget = shareStore.currentHoverTarget;
    if (currentTarget) {
      shareStore.toggleElementSelection(currentTarget);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      shareStore.toggleActive(false);
    }
  }

  function isOrHasExcludedParentElement(el: HTMLElement): boolean {
    // Exclude our own UI
    if (
      el.closest('.share-overlay-ui') ||
      el.closest('.hover-helper') ||
      el.closest('.floating-bar')
    ) {
      return true;
    }

    // Check self
    if (excludedTagSet.has(el.tagName.toUpperCase()) || (el.id && excludedIdSet.has(el.id))) {
      return true;
    }
    // Check  all the way up
    let ancestor = el.parentElement;
    while (ancestor) {
      if (
        excludedTagSet.has(ancestor.tagName.toUpperCase()) ||
        (ancestor.id && excludedIdSet.has(ancestor.id))
      ) {
        return true;
      }
      ancestor = ancestor.parentElement;
    }
    return false;
  }
</script>

<!-- https://svelte.dev/docs/svelte/svelte-window -->
<svelte:window
  on:mouseover={handleHover}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:click|capture={handleClick}
  on:keydown={handleKeydown}
/>

<div class="share-overlay-ui">
  <ShareToolbar />
  <HoverHelper />

  {#if selectionBox}
    <div
      class="selection-box {shareStore.selectionMode === 'hide'
        ? 'hide-mode'
        : shareStore.selectionMode === 'highlight'
          ? 'highlight-mode'
          : ''}"
      style="left: {selectionBox.left}px; top: {selectionBox.top}px; width: {selectionBox.width}px; height: {selectionBox.height}px;"
    >
      <span class="selection-label">
        {shareStore.selectionMode === 'hide'
          ? 'Select to hide'
          : shareStore.selectionMode === 'highlight'
            ? 'Select to highlight'
            : 'Select to show'}
      </span>
    </div>
  {/if}
</div>

<style>
  /* Global styles injected when active */
  :global(body.cv-share-active) {
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Highlight outlines */
  :global(.cv-highlight-target) {
    outline: 2px dashed #0078d4 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected) {
    outline: 3px solid #005a9e !important;
    outline-offset: 2px;
    background-color: rgba(0, 120, 212, 0.05);
  }

  :global(.cv-highlight-target-hide) {
    outline: 2px dashed #d13438 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected-hide) {
    outline: 3px solid #a4262c !important;
    outline-offset: 2px;
    background-color: rgba(209, 52, 56, 0.05);
  }

  :global(.cv-highlight-target-mode) {
    outline: 2px dashed #d97706 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  :global(.cv-share-selected-highlight) {
    outline: 3px solid #b45309 !important;
    outline-offset: 2px;
    background-color: rgba(245, 158, 11, 0.05);
  }

  .selection-box {
    position: fixed;
    border: 1px solid rgba(0, 120, 212, 0.4);
    background-color: rgba(0, 120, 212, 0.1);
    pointer-events: none;
    z-index: 10000;
    box-sizing: border-box;
  }

  .selection-box.hide-mode {
    border: 1px solid rgba(209, 52, 56, 0.4);
    background-color: rgba(209, 52, 56, 0.1);
  }

  .selection-box.highlight-mode {
    border: 1px solid rgba(255, 140, 0, 0.6); /* Orange/Gold for highlight */
    background-color: rgba(255, 140, 0, 0.1);
  }

  .selection-label {
    position: absolute;
    top: -24px;
    left: 0;
    background: #0078d4;
    color: white;
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 3px;
    white-space: nowrap;
    font-family: sans-serif;
    opacity: 0.9;
  }

  .hide-mode .selection-label {
    background: #d13438;
  }

  .highlight-mode .selection-label {
    background: #d97706; /* Darker orange for text bg */
  }
</style>
