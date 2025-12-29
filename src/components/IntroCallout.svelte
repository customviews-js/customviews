<script lang="ts">
  import { fly } from 'svelte/transition';

  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' = 'middle-left';
  export let message: string = 'Customize your reading experience here.';
  export let onclose: () => void = () => {};

  // Map widget position to callout position logic
  /*
    Positions need to be adjusted based on the widget icon location.
    "right" positions -> callout appears to the left of the icon
    "left" positions -> callout appears to the right of the icon
    "top" -> aligned top
    "bottom" -> aligned bottom
  */

  function getTransitionParams() {
    if (position.includes('right')) return { x: 20, duration: 300 };
    return { x: -20, duration: 300 };
  }
</script>

<div 
  class="callout pos-{position}" 
  role="alert" 
  transition:fly={getTransitionParams()}
>
  <button class="close-btn" aria-label="Dismiss intro" onclick={onclose}>
    ×
  </button>
  <p class="text">{message}</p>
</div>

<style>
  .callout {
    position: fixed;
    background: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 260px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #999;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    margin-right: -4px;
    margin-top: -2px;
  }

  .close-btn:hover {
    color: #333;
  }

  .text {
    margin: 0;
    flex: 1;
  }

  /* Position specifics */
  .pos-top-right {
    top: 20px;
    right: 60px; /* offset from icon */
  }

  .pos-top-left {
    top: 20px;
    left: 60px;
  }

  .pos-bottom-right {
    bottom: 20px;
    right: 60px;
  }

  .pos-bottom-left {
    bottom: 20px;
    left: 60px;
  }

  .pos-middle-right {
    top: 50%;
    right: 60px;
    transform: translateY(-50%);
  }

  .pos-middle-left {
    top: 50%;
    left: 60px;
    transform: translateY(-50%);
  }

  :global(.cv-widget-theme-dark) .callout {
    background: #101722;
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  :global(.cv-widget-theme-dark) .close-btn {
    color: rgba(255, 255, 255, 0.5);
  }

  :global(.cv-widget-theme-dark) .close-btn:hover {
    color: rgba(255, 255, 255, 0.9);
  }
</style>
