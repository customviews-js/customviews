<script lang="ts">
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' | undefined = 'middle-left';
  export let title: string | undefined = 'Customize View';
  export let pulse: boolean | undefined = false;
  export let onclick: (() => void) | undefined = undefined;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
  class="cv-settings-icon cv-settings-{position} {pulse ? 'cv-pulse' : ''}" 
  {title} 
  role="button"
  tabindex="0"
  aria-label="Open Custom Views Settings"
  {onclick}
>
  ⚙
</div>

<style>
  .cv-settings-icon {
    position: fixed;
    background: rgba(255, 255, 255, 0.92);
    color: rgba(0, 0, 0, 0.9);
    opacity: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(0, 0, 0, 0.2); /* Added border */
    z-index: 9998;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
  }

  .cv-settings-icon:hover {
    background: rgba(255, 255, 255, 1);
    color: rgba(0, 0, 0, 1);
    opacity: 1;
    border-color: rgba(0, 0, 0, 0.3);
  }

  /* Top-right */
  .cv-settings-top-right {
    top: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px; /* Adjusted for border */
    justify-content: flex-start;
    border-right: none; /* No border on edge side */
  }

  /* Top-left */
  .cv-settings-top-left {
    top: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px; /* Adjusted for border */
    justify-content: flex-end;
    border-left: none;
  }

  /* Bottom-right */
  .cv-settings-bottom-right {
    bottom: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  /* Bottom-left */
  .cv-settings-bottom-left {
    bottom: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-left */
  .cv-settings-middle-left {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-right */
  .cv-settings-middle-right {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  .cv-settings-top-right,
  .cv-settings-middle-right,
  .cv-settings-bottom-right,
  .cv-settings-top-left,
  .cv-settings-middle-left,
  .cv-settings-bottom-left {
    height: 36px;
    width: 36px;
  }

  .cv-settings-middle-right:hover,
  .cv-settings-top-right:hover,
  .cv-settings-bottom-right:hover,
  .cv-settings-top-left:hover,
  .cv-settings-middle-left:hover,
  .cv-settings-bottom-left:hover {
    width: 55px;
  }

  :global(.cv-pulse) {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0.7);
    }
    70% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(62, 132, 244, 0);
    }
    100% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0);
    }
  }

  @media (max-width: 768px) {
    .cv-settings-top-right,
    .cv-settings-top-left {
      top: 10px;
    }

    .cv-settings-bottom-right,
    .cv-settings-bottom-left {
      bottom: 10px;
    }

    .cv-settings-top-right,
    .cv-settings-bottom-right,
    .cv-settings-middle-right {
      right: 0;
    }

    .cv-settings-top-left,
    .cv-settings-bottom-left,
    .cv-settings-middle-left {
      left: 0;
    }

    .cv-settings-icon {
      width: 60px;
      height: 32px;
    }

    .cv-settings-icon:hover {
      width: 75px;
    }
  }
</style>
