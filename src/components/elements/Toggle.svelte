<svelte:options customElement={{
    tag: 'cv-toggle',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      assetId: { reflect: true, type: 'String', attribute: 'asset-id' },
      borderedPeek: { reflect: true, type: 'Boolean', attribute: 'bordered-peek' }
    }
  }} />

<script lang="ts">
  import { getChevronDownIcon, getChevronUpIcon } from '../../utils/icons';
  import { store } from '../../core/stores/main-store.svelte';
  import { renderAssetInto } from '../../core/render';

  // Props using Svelte 5 runes
  let { toggleId = '', assetId = '', borderedPeek = false }: { toggleId?: string; assetId?: string; borderedPeek?: boolean } = $props();
  // Derive toggle IDs from toggle-id prop (can have multiple space-separated IDs)
  let toggleIds = $derived((toggleId || '').split(/\s+/).filter(Boolean));
  $effect(() => {
    toggleIds.forEach(id => store.registerToggle(id));
  });

  let localExpanded = $state(false);
  let hasRendered = $state(false);
  let contentEl: HTMLDivElement;
  let scrollHeight = $state(0);
  let resizeObserver: ResizeObserver;

  // Derive visibility from store state
  let showState = $derived.by(() => {
      const shownToggles = store.state.shownToggles ?? [];
      return toggleIds.some(id => shownToggles.includes(id));
  });

  // Derive peek state from store state
  let peekState = $derived.by(() => {
      const peekToggles = store.state.peekToggles ?? [];
      return !showState && toggleIds.some(id => peekToggles.includes(id));
  });

  const PEEK_HEIGHT = 70;
  let isSmallContent = $state(false);

  // Setup ResizeObserver to track content height changes (e.g. images loading, window resize)
  $effect(() => {
    if (contentEl) {
       resizeObserver = new ResizeObserver(() => {
          scrollHeight = contentEl.scrollHeight;
          // If content shrinks below peek height, update small content state
          if (peekState) {
             isSmallContent = scrollHeight <= PEEK_HEIGHT;
          }
       });
       resizeObserver.observe(contentEl);
       
       // Initial measurement
       scrollHeight = contentEl.scrollHeight;
    }
    
    return () => {
       resizeObserver?.disconnect();
    };
  });

  let showFullContent = $derived(showState || (peekState && localExpanded));
  // Only show peek styling (mask) if it's peeking, not expanded locally, AND content is actually taller than peek height
  let showPeekContent = $derived(!showState && peekState && !localExpanded && !isSmallContent);
  let isHidden = $derived(!showState && !peekState);

  // Calculate dynamic max-height for animation
  let currentMaxHeight = $derived.by(() => {
      if (isHidden) return '0px';
      if (showPeekContent) return `${PEEK_HEIGHT}px`;
      if (showFullContent) return scrollHeight > 0 ? `${scrollHeight}px` : 'none'; 
      return '0px';
  });

  function toggleExpand(e: MouseEvent) {
    e.stopPropagation();
    localExpanded = !localExpanded;
  }

  // Reactive asset rendering - renders assets when toggle becomes visible
  $effect(() => {
    if (showFullContent && assetId && !hasRendered && store.assetsManager && contentEl) {
      renderAssetInto(contentEl, assetId, store.assetsManager);
      hasRendered = true;
    }
  });
</script>

<div 
  class="cv-toggle-wrapper" 
  class:expanded={showFullContent && !showPeekContent} 
  class:peeking={showPeekContent} 
  class:peek-mode={peekState}
  class:hidden={isHidden} 
  class:has-border={borderedPeek && peekState}
>
  <div 
    class="cv-toggle-content" 
    bind:this={contentEl}
    style:max-height={currentMaxHeight}
  >
    <slot></slot>
  </div>

  {#if peekState && !isSmallContent}
    <button 
      class="cv-expand-btn" 
      aria-label={localExpanded ? "Collapse content" : "Expand content"}
      onclick={toggleExpand}
    >
      {@html localExpanded ? getChevronUpIcon() : getChevronDownIcon()}
    </button>
  {/if}
</div>

<style>
  :host {
    display: block;
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  /* Host visibility control */
  :host([hidden]) {
    display: none;
  }

  .cv-toggle-wrapper {
    position: relative;
    width: 100%;
    transition: all 0.3s ease;
    margin-bottom: 4px;
  }

  .cv-toggle-wrapper.hidden {
    margin-bottom: 0;
  }

  .cv-toggle-wrapper.peek-mode {
    margin-bottom: 24px;
  }

  .cv-toggle-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    /* CSS max-height defaults are handled by inline styles now */
  }

  /* Hidden State */
  .hidden .cv-toggle-content {
    opacity: 0;
    pointer-events: none;
  }

  /* Bordered State */
  .has-border {
    box-sizing: border-box; /* Ensure padding/border doesn't increase width */
    
    /* Stronger border for better visibility */
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-bottom: none;
    
    /* Clearer shadow */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); 
    
    border-radius: 8px 8px 0 0;
    
    padding: 8px 12px 0 12px;
    margin-top: 4px;
  }
  
  /* Visible / Expanded State */
  .expanded .cv-toggle-content {
    opacity: 1;
    transform: translateY(0);
  }

  /* When expanded, complete the border */
  .has-border.expanded {
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 8px; /* Round all corners */
    padding-bottom: 12px;
  }

  /* Peek State */
  .peeking .cv-toggle-content {
    opacity: 1;
    /* Mask for fade out effect */
    mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  }

  /* Expand Button */
  .cv-expand-btn {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background: transparent;
    border: none;
    border-radius: 50%;
    padding: 4px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    z-index: 100;
    align-items: center;
    justify-content: center;
    color: #888;
    transition: all 0.2s ease;
  }

  .cv-expand-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
    transform: translateX(-50%) scale(1.1);
  }

  /* Accessing SVG inside button - might need :global if SVG is injected as HTML or just plain styles since it adheres to current scope */
  .cv-expand-btn :global(svg) {
    display: block;
    opacity: 0.6;
    width: 24px;
    height: 24px;
    transition: opacity 0.2s;
  }

  .cv-expand-btn:hover :global(svg) {
    opacity: 1;
  }
</style>
