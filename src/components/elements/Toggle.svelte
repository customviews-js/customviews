<svelte:options customElement={{
    tag: 'cv-toggle',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      assetId: { reflect: true, type: 'String', attribute: 'asset-id' }
    }
  }} />

<script lang="ts">
  import { getChevronDownIcon, getChevronUpIcon } from '../../utils/icons';
  import { store } from '../../core/stores/main-store.svelte';
  import { renderAssetInto } from '../../core/render';

  // Props using Svelte 5 runes
  let { toggleId = '', assetId = '' }: { toggleId?: string; assetId?: string } = $props();
  // Derive toggle IDs from toggle-id prop (can have multiple space-separated IDs)
  let toggleIds = $derived((toggleId || '').split(/\s+/).filter(Boolean));
  $effect(() => {
    toggleIds.forEach(id => store.registerToggle(id));
  });

  let localExpanded = $state(false);
  let hasRendered = $state(false);
  let contentEl: HTMLDivElement;

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

  // Check content height when peeking
  $effect(() => {
    if (contentEl && peekState) {
       // We only care if it's small when we are effectively peeking
       isSmallContent = contentEl.scrollHeight <= PEEK_HEIGHT;
    }
  });

  let showFullContent = $derived(showState || (peekState && localExpanded));
  // Only show peek styling (mask) if it's peeking, not expanded locally, AND content is actually taller than peek height
  let showPeekContent = $derived(!showState && peekState && !localExpanded && !isSmallContent);
  let isHidden = $derived(!showState && !peekState);

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

<div class="cv-toggle-wrapper" class:expanded={showFullContent && !showPeekContent} class:peeking={showPeekContent} class:hidden={isHidden}>
  <div class="cv-toggle-content" bind:this={contentEl}>
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
    margin-bottom: 24px;
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
  }

  .cv-toggle-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
  }

  /* Hidden State */
  .hidden .cv-toggle-content {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }
  
  /* Visible / Expanded State */
  .expanded .cv-toggle-content {
    max-height: none; /* or a large value if we want transition, but 'none' is cleaner for layout */
    opacity: 1;
    transform: translateY(0);
  }

  /* Peek State */
  .peeking .cv-toggle-content {
    max-height: 70px;
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
