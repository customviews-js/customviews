<script lang="ts">
  import { shareStore, shareCount } from '../../core/stores/share-store';
  import { fly } from 'svelte/transition';

  function handleClear() {
    shareStore.clearSelection();
  }

  function handlePreview() {
    shareStore.previewLink();
  }

  function handleGenerate() {
    shareStore.generateLink();
  }

  function handleExit() {
    shareStore.toggleActive(false);
  }
</script>

<div class="floating-bar" transition:fly={{ y: 50, duration: 200 }}>
  <span class="count">{$shareCount} item{$shareCount === 1 ? '' : 's'} selected</span>
  
  <button class="btn clear" onclick={handleClear}>Clear All</button>
  <button class="btn preview" onclick={handlePreview}>Preview</button>
  <button class="btn generate" onclick={handleGenerate}>Generate Link</button>
  <button class="btn exit" onclick={handleExit}>Exit</button>
</div>

<style>
  .floating-bar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2c2c2c;
    color: #f1f1f1;
    border-radius: 8px;
    padding: 12px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    border: 1px solid #4a4a4a;
    pointer-events: auto;
  }

  .count {
    font-weight: 500;
    min-width: 100px;
  }

  .btn {
    background-color: #0078D4;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn:hover {
    background-color: #005a9e;
  }

  .btn.clear {
    background-color: #5a5a5a;
  }
  .btn.clear:hover {
    background-color: #4a4a4a;
  }

  .btn.preview {
    background-color: #106ebe;
  }

  .btn.exit {
    background-color: #d13438;
  }
  .btn.exit:hover {
    background-color: #a42628;
  }
</style>
