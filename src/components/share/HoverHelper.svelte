<script lang="ts">
  import { shareStore, SHAREABLE_SELECTOR } from '../../core/stores/share-store.svelte';
  import { fade } from 'svelte/transition';

  // Derived state for easier access
  let target = $derived(shareStore.currentHoverTarget);
  let isSelected = $derived(target && shareStore.selectedElements.has(target));
  
  // Computed Position using effect for DOM layout properties
  let style = $state('display: none;');
  let tagName = $state('TAG');
  let canGoUp = $state(false);

  $effect(() => {
    const t = shareStore.currentHoverTarget;
    if (t) {
        // DOM measurement requires element to be available
        const rect = t.getBoundingClientRect();
        
        let top = rect.top - 28; // slightly higher
        if (top < 0) top = rect.top + 10;

        let left = rect.right - 80;
        if (left < 10) left = 10;
        
        // Ensure it doesn't go off right edge
        if (left + 100 > window.innerWidth) {
            left = window.innerWidth - 110;
        }

        style = `top: ${top}px; left: ${left}px;`;
        tagName = t.tagName;
        
        // Parent check for "Up" button
        const parent = t.parentElement;
        canGoUp = !!(parent && parent.matches(SHAREABLE_SELECTOR));
    } else {
        style = 'display: none;';
    }
  });

  function handleSelect(e: Event) {
    e.stopPropagation();
    if (target) shareStore.toggleSelection(target);
  }

  function handleUp(e: Event) {
    e.stopPropagation();
    if (target && target.parentElement && target.parentElement.matches(SHAREABLE_SELECTOR)) {
      shareStore.setHoverTarget(target.parentElement);
    }
  }
</script>

{#if target}
  <div class="hover-helper" {style} transition:fade={{ duration: 100 }}>
    <span class="tag">{tagName}</span>
    
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
        onclick={handleUp}
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

  .tag {
    font-size: 12px;
    font-weight: bold;
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
