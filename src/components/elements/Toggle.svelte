<svelte:options customElement="cv-toggle" />

<script lang="ts">
  import { getChevronDownIcon, getChevronUpIcon } from '../../utils/icons';

  export let visible: boolean = false;
  export let peek: boolean = false;
  // Category is read from the attribute by ToggleManager, so we don't strictly need it as a prop unless we use it in the template.
  // export let category: string = '';

  let localExpanded = false;

  $: showContent = visible || (peek && localExpanded);
  $: isPeeking = !visible && peek && !localExpanded;
  $: isHidden = !visible && !peek;

  function toggleExpand(e: MouseEvent) {
    e.stopPropagation();
    localExpanded = !localExpanded;
  }
</script>

<div class="cv-toggle-wrapper" class:expanded={showContent && !isPeeking} class:peeking={isPeeking} class:hidden={isHidden}>
  <div class="cv-toggle-content">
    <slot></slot>
  </div>

  {#if isPeeking || (peek && localExpanded)}
    <button 
      class="cv-expand-btn" 
      aria-label={localExpanded ? "Collapse content" : "Expand content"}
      on:click={toggleExpand}
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
