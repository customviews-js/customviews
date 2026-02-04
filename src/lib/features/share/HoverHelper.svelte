<script lang="ts">
  import { shareStore, SHAREABLE_SELECTOR, isGenericWrapper } from '$features/share/stores/share-store.svelte';
  import { fade } from 'svelte/transition';
  import { untrack } from 'svelte';

  // Derived state for easier access
  let target = $derived(shareStore.currentHoverTarget);
  let isSelected = $derived(target && shareStore.selectedElements.has(target));
  
  // Computed Position using effect for DOM layout properties
  let style = $state('display: none;');
  let tagName = $state('TAG');
  let elementId = $state<string | null>(null);
  let canGoUp = $state(false);
  let lastSavedHelperPosition = $state<string | null>(null);

  function findNextShareableParent(el: HTMLElement): HTMLElement | null {
      let parent = el.parentElement;
      while (parent) {
          if (parent.matches(SHAREABLE_SELECTOR) && !isGenericWrapper(parent)) {
              return parent;
          }
          parent = parent.parentElement;
      }
      return null;
  }

  $effect(() => {
    const t = shareStore.currentHoverTarget;
    if (t) {
        // Use untrack to prevent the reset of lastSavedHelperPosition from re-triggering this effect
        const savedPosition = untrack(() => lastSavedHelperPosition);

        if (savedPosition) {
            // Apply the saved position (from clicking "Up") to keep the UI stable
            style = savedPosition;
            lastSavedHelperPosition = null; // Consume so subsequent hovers update normally
        } else {
            // Standard positioning logic: calculate based on the target element
            const rect = t.getBoundingClientRect();
            
            let top = rect.top - 23; // Closer to element (was -28)
            if (top < 0) top = rect.top + 5;

            let left = rect.right - 80;
            if (left < 10) left = 10;
            
            // Ensure it doesn't go off right edge
            if (left + 100 > window.innerWidth) {
                left = window.innerWidth - 110;
            }

            style = `top: ${top}px; left: ${left}px;`;
        }

        tagName = t.tagName;
        elementId = t.id || null;
        canGoUp = !!findNextShareableParent(t);
    } else {
        style = 'display: none;';
        lastSavedHelperPosition = null;
    }
  });

  function handleSelect(e: Event) {
    e.stopPropagation();
    if (target) shareStore.toggleElementSelection(target);
  }


  let helperWidth = $state(0);

  function handleSelectParent(e: Event) {
    e.stopPropagation();
    if (!target) return;

    const parent = findNextShareableParent(target);
    if (parent) {
        // Pin current style + min-width to prevent shrinking under cursor
        lastSavedHelperPosition = `${style} min-width: ${helperWidth}px;`;
        shareStore.setHoverTarget(parent);
    }
  }
</script>

{#if target}
  <div 
    class="hover-helper" 
    {style} 
    bind:clientWidth={helperWidth}
    transition:fade={{ duration: 100 }}
  >
    <div class="info">
        <span class="tag">{tagName}</span>
        {#if elementId}
            <span class="id-badge" title="ID detection active">#{elementId}</span>
        {/if}
    </div>
    
    <button 
      class="action-btn {isSelected ? 'deselect' : 'select'}" 
      title={isSelected ? "Deselect" : "Select"}
      onclick={handleSelect}
    >
      {isSelected ? '✕' : '✓'}
    </button>

    {#if canGoUp}
      <button 
        class="action-btn up" 
        title="Select Parent" 
        onclick={handleSelectParent}
      >
        ↰
      </button>
    {/if}
  </div>
{/if}

<style>
  .hover-helper {
    position: fixed;
    z-index: 99999;
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-family: monospace;
    pointer-events: auto;
  }

  .info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1;
      gap: 2px;
  }

  .tag {
    font-size: 12px;
    font-weight: bold;
    color: #aeaeae;
  }

  .id-badge {
      font-size: 10px;
      color: #64d2ff;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  }

  .action-btn {
    background: #555;
    border: none;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.1s;
  }

  .action-btn:hover {
    background: #777;
  }

  .action-btn.deselect {
    background-color: #d13438;
  }
  
  .action-btn.deselect:hover {
    background-color: #a42628;
  }
</style>
