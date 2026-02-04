<script lang="ts">
  import { focusStore } from '$features/focus/stores/focus-store.svelte';
  import { slide } from 'svelte/transition';

  function handleExit() {
    focusStore.exit();
  }
</script>

{#if focusStore.isActive}
  <div id="cv-exit-focus-banner" transition:slide={{ duration: 250 }}>
    <span>You are viewing a focused selection.</span>
    <button onclick={handleExit}>Show Full Page</button>
  </div>
{/if}

<style>
  /* Global Styles for Focus/Highlight Modes */
  :global(.cv-focus-hidden) {
    display: none !important;
  }

  :global(body.cv-focus-mode),
  :global(body.cv-highlight-mode) {
    margin-top: 50px !important;
  }

  #cv-exit-focus-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #0078d4;
    color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 9000; /* Below Toast (usually 9999+) */
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
