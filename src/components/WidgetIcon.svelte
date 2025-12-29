<script lang="ts">
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' = 'middle-left';
  export let title: string = 'Customize View';
  export let pulse: boolean = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
  class="cv-widget-icon cv-widget-{position} {pulse ? 'cv-pulse' : ''}" 
  {title} 
  role="button"
  tabindex="0"
  aria-label="Open Custom Views"
  on:click
>
  ⚙
</div>

<style>
  .cv-widget-icon {
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

  .cv-widget-icon:hover {
    background: rgba(255, 255, 255, 1);
    color: rgba(0, 0, 0, 1);
    opacity: 1;
  }

  /* Top-right */
  .cv-widget-top-right {
    top: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
  }

  /* Top-left */
  .cv-widget-top-left {
    top: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Bottom-right */
  .cv-widget-bottom-right {
    bottom: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
  }

  /* Bottom-left */
  .cv-widget-bottom-left {
    bottom: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Middle-left */
  .cv-widget-middle-left {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-radius: 0 18px 18px 0;
    padding-right: 8px;
    justify-content: flex-end;
  }

  /* Middle-right */
  .cv-widget-middle-right {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    border-radius: 18px 0 0 18px;
    padding-left: 8px;
    justify-content: flex-start;
  }

  .cv-widget-top-right,
  .cv-widget-middle-right,
  .cv-widget-bottom-right,
  .cv-widget-top-left,
  .cv-widget-middle-left,
  .cv-widget-bottom-left {
    height: 36px;
    width: 36px;
  }

  .cv-widget-middle-right:hover,
  .cv-widget-top-right:hover,
  .cv-widget-bottom-right:hover,
  .cv-widget-top-left:hover,
  .cv-widget-middle-left:hover,
  .cv-widget-bottom-left:hover {
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
    .cv-widget-top-right,
    .cv-widget-top-left {
      top: 10px;
    }

    .cv-widget-bottom-right,
    .cv-widget-bottom-left {
      bottom: 10px;
    }

    .cv-widget-top-right,
    .cv-widget-bottom-right,
    .cv-widget-middle-right {
      right: 0;
    }

    .cv-widget-top-left,
    .cv-widget-bottom-left,
    .cv-widget-middle-left {
      left: 0;
    }

    .cv-widget-icon {
      width: 60px;
      height: 32px;
    }

    .cv-widget-icon:hover {
      width: 75px;
    }
  }
</style>
