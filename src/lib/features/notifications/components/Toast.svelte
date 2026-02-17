<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { toast, TOAST_CLASS } from '../stores/toast-store.svelte';
</script>

<div class="toast-container">
  {#each toast.items as t (t.id)}
    <div
      class="{TOAST_CLASS} toast-item"
      role="alert"
      aria-live="polite"
      in:fly={{ y: -20, duration: 300 }}
      out:fade={{ duration: 200 }}
      animate:flip
    >
      {t.message}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none; /* Let clicks pass through container */
  }

  .toast-item {
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: auto; /* Re-enable clicks on toasts */
    max-width: 300px;
    text-align: center;
  }
</style>
