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
    z-index: 9998;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .cv-settings-icon:hover {
    background: rgba(255, 255, 255, 1);
    color: rgba(0, 0, 0, 1);
    opacity: 1;
  }

  /* Top-right */
  .cv-settings-top-right {
    top: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
  }

  /* Top-left */
  .cv-settings-top-left {
    top: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Bottom-right */
  .cv-settings-bottom-right {
    bottom: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
  }

  /* Bottom-left */
  .cv-settings-bottom-left {
    bottom: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Middle-left */
  .cv-settings-middle-left {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Middle-right */
  .cv-settings-middle-right {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
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
      box-shadow: 0 0 0 0 rgba(62, 132, 244, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(62, 132, 244, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(62, 132, 244, 0);
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
