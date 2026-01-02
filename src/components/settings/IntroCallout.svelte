<script lang="ts">
  import { fly } from 'svelte/transition';

  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' | undefined = 'middle-left';
  export let message: string | undefined = 'Customize your reading experience here.';
  export let onclose: (() => void) | undefined = () => {};

  // Map widget position to callout position logic
  /*
    Positions need to be adjusted based on the widget icon location.
    "right" positions -> callout appears to the left of the icon
    "left" positions -> callout appears to the right of the icon
    "top" -> aligned top
    "bottom" -> aligned bottom
  */

  function getTransitionParams() {
    if (position && position.includes('right')) return { x: 20, duration: 300 };
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
  @keyframes pulse {
    0% {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(99, 102, 241, 0.4);
    }
    70% {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(99, 102, 241, 0);
    }
    100% {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(99, 102, 241, 0);
    }
  }

  .callout {
    position: fixed;
    background: white;
    padding: 16px 20px; /* Slight increase in padding */
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* Stronger base shadow */
    z-index: 9999;
    max-width: 280px; /* Slight increase */
    font-size: 15px; /* Slight increase */
    line-height: 1.5;
    color: #1a1a1a;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border-left: 4px solid #6366f1; /* Indigo accent */
    animation: pulse 2s infinite;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 2px;
    margin-right: -8px;
    margin-top: -4px;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #4b5563;
  }

  .text {
    margin: 0;
    flex: 1;
    font-weight: 500;
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

  :global(.cv-settings-theme-dark) .callout {
    background: #1f2937;
    color: #f3f4f6;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid #818cf8; /* Lighter indigo for dark mode */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  
  :global(.cv-settings-theme-dark) .close-btn {
    color: #9ca3af;
  }

  :global(.cv-settings-theme-dark) .close-btn:hover {
    color: #e5e7eb;
  }</style>
