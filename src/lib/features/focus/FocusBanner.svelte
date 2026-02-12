<script lang="ts">
  import { focusStore } from '$features/focus/stores/focus-store.svelte';
  import { slide } from 'svelte/transition';

  function handleExit() {
    focusStore.exit();
  }
</script>

{#if focusStore.isActive}
  <div class="cv-focus-banner-wrapper" transition:slide={{ duration: 250 }}>
    <div id="cv-exit-focus-banner" data-cv-scroll-offset>
      <span>You are viewing a focused selection.</span>
      <button onclick={handleExit}>Show Full Page</button>
    </div>
  </div>
{/if}

<style>
  .cv-focus-banner-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9000;
    background-color: #0078d4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-family: system-ui, sans-serif;
  }

  #cv-exit-focus-banner {
    color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  button {
    background: white;
    color: #0078d4;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    background: #f0f0f0;
  }
</style>
