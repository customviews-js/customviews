<svelte:options
  customElement={{
    tag: 'cv-toggle',
    props: {
      toggleId: { reflect: true, type: 'String', attribute: 'toggle-id' },
      assetId: { reflect: true, type: 'String', attribute: 'asset-id' },
      showPeekBorder: { reflect: true, type: 'Boolean', attribute: 'show-peek-border' },
      showLabel: { reflect: true, type: 'Boolean', attribute: 'show-label' },
    },
  }}
/>

<script lang="ts">
  import IconChevronDown from '$lib/app/icons/IconChevronDown.svelte';
  import IconChevronUp from '$lib/app/icons/IconChevronUp.svelte';
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { elementStore } from '$lib/stores/element-store.svelte';
  import { derivedStore } from '$lib/stores/derived-store.svelte';
  import { renderAssetInto } from '$features/render/render';

  // Props using Svelte 5 runes
  let {
    toggleId = '',
    assetId = '',
    showPeekBorder = false,
    showLabel = false,
  }: {
    toggleId?: string;
    assetId?: string;
    showPeekBorder?: boolean;
    showLabel?: boolean;
  } = $props();
  // Derive toggle IDs from toggle-id prop (can have multiple space-separated IDs)
  let toggleIds = $derived((toggleId || '').split(/\s+/).filter(Boolean));
  let toggleConfig = $derived(activeStateStore.config.toggles?.find((t) => t.toggleId === toggleIds[0]));

  $effect(() => {
    toggleIds.forEach((id) => elementStore.registerToggle(id));
  });

  // Derive label text from config
  let labelText = $derived.by(() => {
    if (!toggleConfig) return '';
    return toggleConfig.label || toggleIds[0];
  });

  let localExpanded = $state(false);
  let isUnconstrained = $state(false); /* New state to track if we can release max-height */
  let hasRendered = $state(false);
  let contentEl: HTMLDivElement;
  let innerEl: HTMLDivElement;
  let scrollHeight = $state(0);

  // Derive visibility from store state
  let showState = $derived.by(() => {
    // Default to SHOWN if config hasn't loaded yet (prevent pop-in)
    if (!activeStateStore.config.toggles) return true;

    const shownToggles = activeStateStore.state.shownToggles ?? [];
    return toggleIds.some((id) => shownToggles.includes(id));
  });

  // Derive peek state from store state
  let peekState = $derived.by(() => {
    const peekToggles = activeStateStore.state.peekToggles ?? [];
    return !showState && toggleIds.some((id) => peekToggles.includes(id));
  });

  const PEEK_HEIGHT = 70;
  let isSmallContent = $state(false);

  // Setup ResizeObserver to track content height changes (e.g. images loading, window resize)
  $effect(() => {
    if (!contentEl) return;

    const observer = new ResizeObserver(() => {
      // We measure the inner element's height
      // contentEl is the window, innerEl is the content
      if (innerEl) {
        scrollHeight = innerEl.offsetHeight;
      }

      // Always track small content state to avoid race conditions/stale state
      if (scrollHeight > 0) {
        if (scrollHeight <= PEEK_HEIGHT) {
          isSmallContent = true;
        } else if (!isSmallContent) {
          // Only set to false if it wasn't already true (latch behavior)
          // This ensures if it STARTS small, growing won't add the button.
          isSmallContent = false;
        }
      }
    });

    if (innerEl) {
      observer.observe(innerEl);
      scrollHeight = innerEl.offsetHeight;
    }

    return () => {
      observer.disconnect();
    };
  });

  let showFullContent = $derived(
    showState || (peekState && localExpanded) || (peekState && isSmallContent),
  );

  // Reset unconstrained state when toggling
  $effect(() => {
    if (showFullContent) {
      // Expanding: start constrained (to animate), will unlock on transitionend
      isUnconstrained = false;
    } else {
      // Collapsing: must recapture height immediately (snap) or stay constrained
      isUnconstrained = false;
    }
  });
  // Only show peek styling (mask) if it's peeking, not expanded locally, AND content is actually taller than peek height
  let showPeekContent = $derived(!showState && peekState && !localExpanded && !isSmallContent);
  let isHidden = $derived(!showState && !peekState);

  // Calculate dynamic max-height for animation
  let currentMaxHeight = $derived.by(() => {
    if (isHidden) return '0px';
    if (isUnconstrained && showFullContent) return 'none'; /* Release constraint when stable */
    if (showPeekContent) return `${PEEK_HEIGHT}px`;
    if (showFullContent) return scrollHeight > 0 ? `${scrollHeight}px` : '9999px';
    return '0px';
  });

  function handleTransitionEnd(e: TransitionEvent) {
    // Only care about max-height transitions on the content element
    if (e.propertyName !== 'max-height' || e.target !== contentEl) return;

    // If we finished expanding, release the height constraint
    if (showFullContent) {
      isUnconstrained = true;
    }
  }

  function toggleExpand(e: MouseEvent) {
    e.stopPropagation();
    localExpanded = !localExpanded;
  }

  // Reactive asset rendering - renders assets when toggle becomes visible
  $effect(() => {
    if (showFullContent && assetId && !hasRendered && derivedStore.assetsManager && contentEl) {
      renderAssetInto(contentEl, assetId, derivedStore.assetsManager);
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
  class:has-border={showPeekBorder && peekState}
>
  {#if showLabel && labelText && !isHidden}
    <div class="cv-toggle-label">{labelText}</div>
  {/if}

  <div
    class="cv-toggle-content"
    bind:this={contentEl}
    style:max-height={currentMaxHeight}
    ontransitionend={handleTransitionEnd}
  >
    <div class="cv-toggle-inner" bind:this={innerEl}>
      <slot></slot>
    </div>
  </div>

  {#if peekState && !isSmallContent}
    <button
      class="cv-expand-btn"
      aria-label={localExpanded ? 'Collapse content' : 'Expand content'}
      onclick={toggleExpand}
    >
      {#if localExpanded}
        <IconChevronUp />
      {:else}
        <IconChevronDown />
      {/if}
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
    transition:
      max-height 0.3s ease,
      opacity 0.3s ease,
      overflow 0s 0s;
    /* CSS max-height defaults are handled by inline styles now */
  }

  .cv-toggle-inner {
    display: flow-root; /* Ensures margins of children are contained */
  }

  /* Hidden State */
  .hidden .cv-toggle-content {
    opacity: 0;
    pointer-events: none;
  }

  /* Bordered State */
  .has-border {
    box-sizing: border-box; /* Ensure padding/border doesn't increase width */

    /* Dashed border */
    border: 2px dashed rgba(0, 0, 0, 0.15);
    border-bottom: none;

    /* Inner shadow to look like it's going into something + outer shadow */
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.05),
      /* Subtle outer */ inset 0 -15px 10px -10px rgba(0, 0, 0, 0.1); /* Inner bottom shadow */

    border-radius: 8px 8px 0 0;

    padding: 12px 0 0 0; /* bottom 0 px until expanded */
    margin-top: 4px;
  }

  /* Visible / Expanded State */
  .expanded .cv-toggle-content {
    opacity: 1;
    transform: translateY(0);
    overflow: visible;
    transition:
      max-height 0.3s ease,
      opacity 0.3s ease,
      overflow 0s 0.3s;
  }

  /* When expanded, complete the border */
  .has-border.expanded {
    border-bottom: 2px dashed rgba(0, 0, 0, 0.15);
    border-radius: 8px; /* Round all corners */
    padding-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Remove inner shadow when expanded */
  }

  /* Peek State */
  .peeking .cv-toggle-content {
    opacity: 1;
    /* Mask for fade out effect */
    mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  }

  /* Label Style */
  .cv-toggle-label {
    position: absolute;
    top: -12px;
    left: 0;
    background: #e0e0e0;
    color: #333;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    z-index: 10;
    pointer-events: auto;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Adjust label position if bordered */
  .has-border .cv-toggle-label {
    top: -10px;
    left: 0;
  }

  /* Expand Button */
  .cv-expand-btn {
    position: absolute;
    bottom: -24px;
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
