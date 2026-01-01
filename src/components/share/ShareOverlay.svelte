<script lang="ts">
  import { shareStore, SHAREABLE_SELECTOR, HIGHLIGHT_TARGET_CLASS, SELECTED_CLASS } from '../../core/stores/share-store';
  import ShareToolbar from './ShareToolbar.svelte';
  import HoverHelper from './HoverHelper.svelte';

  export let excludedTags: string[] = ['HEADER', 'NAV', 'FOOTER'];
  export let excludedIds: string[] = ['cv-floating-action-bar', 'cv-hover-helper'];

  const excludedTagSet = new Set(excludedTags.map(t => t.toUpperCase()));
  const excludedIdSet = new Set(excludedIds);

  /**
   * Handles window-level mouse hover events to identify and highlight shareable elements.
   * It filters out internal UI components and excluded elements, then identifies 
   * the nearest shareable element. If the element is a child of an already selected 
   * block, the hover highlight bubbles up to that ancestor.
   * 
   * @param e - The mouse event.
   */
  function handleHover(e: MouseEvent) {
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
      if ($shareStore.selectedElements.has(parent)) {
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
    shareStore.setHoverTarget(finalTarget);
  }

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    
    if (target.closest('.hover-helper') || target.closest('.floating-bar')) return;

    // Intercept click on document
    e.preventDefault();
    e.stopPropagation();

    // If we have a hover target, toggle it
    const currentTarget = $shareStore.currentHoverTarget;
    if (currentTarget) {
      shareStore.toggleSelection(currentTarget);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      shareStore.toggleActive(false);
    }
  }

  function isExcluded(el: HTMLElement): boolean {
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
    on:click|capture={handleClick} 
    on:keydown={handleKeydown} 
  />

  <div class="share-overlay-ui">
    <ShareToolbar />
    <HoverHelper />
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
  </style>
