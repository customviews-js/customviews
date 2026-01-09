<script lang="ts">
  import { shareStore, SHAREABLE_SELECTOR } from '../../core/stores/share-store.svelte';
  import ShareToolbar from './ShareToolbar.svelte';
  import HoverHelper from './HoverHelper.svelte';

  let {
    excludedTags = ['HEADER', 'NAV', 'FOOTER'],
    excludedIds = ['cv-floating-action-bar', 'cv-hover-helper']
  }: { excludedTags?: string[]; excludedIds?: string[] } = $props();

  let excludedTagSet = $derived(new Set(excludedTags.map((t: string) => t.toUpperCase())));
  let excludedIdSet = $derived(new Set(excludedIds));

  let isDragging = $state(false);
  let dragStart = $state<{x: number, y: number} | null>(null);
  let dragCurrent = $state<{x: number, y: number} | null>(null);
  let wasDragging = false;

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
   * It filters out internal UI components and excluded elements, then identifies
   * the nearest shareable element. If the element is a child of an already selected
   * block, the hover highlight bubbles up to that ancestor.
   *
   * @param e - The mouse event.
   */
  function handleHover(e: MouseEvent) {
    if (isDragging) return; // Don't highlight while dragging

    // If hovering over our own UI, ignore
    const target = e.target as HTMLElement;

    // Check if target is part of our UI (Toolbar or Helper)
    if (target.closest('.hover-helper') || target.closest('.floating-bar')) return;

    // Exclude by Tag/ID
    if (isExcluded(target)) return;

    // Find nearest shareable
    const shareablePart = target.closest(SHAREABLE_SELECTOR);
    if (!shareablePart) {
      shareStore.setHoverTarget(null);
      return;
    }
    const finalTarget = shareablePart as HTMLElement;

    // Check ancestors selection (level up logic)
    // If an ancestor is selected, we highlight THAT ancestor instead of the child
    // so the user sees the helper for the block they already selected.
    let parent = finalTarget.parentElement;
    let selectedAncestor: HTMLElement | null = null;

    while(parent) {
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
    shareStore.setHoverTarget(finalTarget);
  }

  /**
   * Handles mouse down events to start a selection drag.
   */
  function handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // Don't start drag on UI
    if (target.closest('.hover-helper') || target.closest('.floating-bar')) return;

    // Disable drag on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    isDragging = false;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragStart) return;

    dragCurrent = { x: e.clientX, y: e.clientY };

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.hypot(dx, dy) > 5) {
      isDragging = true;
      shareStore.setHoverTarget(null); // Clear highlight on drag start
    }
  }

  function isGenericWrapper(el: HTMLElement): boolean {
    if (el.tagName !== 'DIV') return false;
    if (el.hasAttribute('data-share')) return false;
    
    const style = window.getComputedStyle(el);
    const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
    const hasBorder = style.borderStyle !== 'none' && parseFloat(style.borderWidth) > 0;
    const hasShadow = style.boxShadow !== 'none';
    
    return !hasBackground && !hasBorder && !hasShadow;
  }

  function handleMouseUp(_: MouseEvent) {
    if (isDragging && dragStart && dragCurrent) {
        // Perform selection logic
        const left = Math.min(dragStart.x, dragCurrent.x);
        const top = Math.min(dragStart.y, dragCurrent.y);
        const width = Math.abs(dragCurrent.x - dragStart.x);
        const height = Math.abs(dragCurrent.y - dragStart.y);
        const right = left + width;
        const bottom = top + height;

        const candidates = document.querySelectorAll(SHAREABLE_SELECTOR);
        const selected: HTMLElement[] = [];

        candidates.forEach(node => {
            const el = node as HTMLElement;
            if (isExcluded(el)) return;

            const rect = el.getBoundingClientRect();
            // Check containment (element must be fully inside selection box)
            // AND check if it's not just a generic wrapper
            if (
                rect.left >= left && rect.right <= right && 
                rect.top >= top && rect.bottom <= bottom &&
                !isGenericWrapper(el)
            ) {
                selected.push(el);
            }
        });

        if (selected.length > 0) {
            shareStore.addMultipleElements(selected);
        }

        wasDragging = true;
        setTimeout(() => wasDragging = false, 50);
    }

    isDragging = false;
    dragStart = null;
    dragCurrent = null;
  }

  function handleClick(e: MouseEvent) {
    if (wasDragging) {
        e.preventDefault();
        e.stopPropagation();
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

  function isExcluded(el: HTMLElement): boolean {
    // Exclude our own UI
    if (el.closest('.share-overlay-ui') || el.closest('.hover-helper') || el.closest('.floating-bar')) {
        return true;
    }

    // Check self
    if (excludedTagSet.has(el.tagName.toUpperCase()) || (el.id && excludedIdSet.has(el.id))) {
      return true;
    }
    // Check  all the way up
    let ancestor = el.parentElement;
    while(ancestor) {
      if (excludedTagSet.has(ancestor.tagName.toUpperCase()) || (ancestor.id && excludedIdSet.has(ancestor.id))) {
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
        class="selection-box {shareStore.selectionMode === 'hide' ? 'hide-mode' : ''}"
        style="left: {selectionBox.left}px; top: {selectionBox.top}px; width: {selectionBox.width}px; height: {selectionBox.height}px;"
      >
        <span class="selection-label">
            {shareStore.selectionMode === 'hide' ? 'Select to hide' : 'Select to share'}
        </span>
      </div>
    {/if}
  </div>

  <style>
    /* Global styles injected when active */
    :global(body) {
      cursor: default;
    }

    /* Highlight outlines */
    :global(.cv-highlight-target) {
      outline: 2px dashed #0078D4 !important;
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

    .selection-label {
        position: absolute;
        top: -24px;
        left: 0;
        background: #0078D4;
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
  </style>
