<script lang="ts">
  import { shareStore } from '../../core/stores/share-store.svelte';
  import { fly } from 'svelte/transition';

  function handleClear() {
    shareStore.clearAllSelections();
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
  
  <div class="mode-toggle">
    <button 
      class="mode-btn {shareStore.selectionMode === 'focus' ? 'active' : ''}" 
      onclick={() => shareStore.setSelectionMode('focus')}
      title="Show only selected elements"
    >
      Show
    </button>
    <button 
      class="mode-btn {shareStore.selectionMode === 'hide' ? 'active' : ''}" 
      onclick={() => shareStore.setSelectionMode('hide')}
      title="Hide selected elements"
    >
      Hide
    </button>
  </div>

  <span class="divider"></span>

  <span class="count">{shareStore.shareCount} item{shareStore.shareCount === 1 ? '' : 's'} to {shareStore.selectionMode === 'focus' ? 'show' : 'hide'}</span>
  
  <button class="btn clear" onclick={handleClear}>Clear</button>
  <button class="btn preview" onclick={handlePreview}>Preview</button>
  <button class="btn generate" onclick={handleGenerate}>Copy Link</button>
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
    padding: 8px 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    display: grid;
    grid-template-columns: auto auto 1fr auto auto auto auto;
    align-items: center;
    gap: 12px;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    border: 1px solid #4a4a4a;
    pointer-events: auto;
    white-space: nowrap;
    min-width: 500px;
  }

  .mode-toggle {
    display: flex;
    background: #1a1a1a;
    border-radius: 6px;
    padding: 2px;
    border: 1px solid #4a4a4a;
  }

  .mode-btn {
    background: transparent;
    color: #aeaeae;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    color: #fff;
  }

  .mode-btn.active {
    background: #4a4a4a;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .divider {
    width: 1px;
    height: 20px;
    background: #4a4a4a;
    margin: 0 4px;
  }

  .count {
    font-weight: 500;
    min-width: 120px;
    text-align: center;
    font-size: 13px;
    color: #ccc;
  }

  .btn {
    background-color: #0078D4;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    font-size: 13px;
  }

  .btn:hover {
    background-color: #005a9e;
  }

  .btn.clear {
    background-color: transparent;
    border: 1px solid #5a5a5a;
    color: #dadada;
  }
  .btn.clear:hover {
    background-color: #3a3a3a;
    color: white;
  }

  .btn.preview {
    background-color: #333;
    border: 1px solid #555;
  }
  .btn.preview:hover {
    background-color: #444;
  }

  .btn.exit {
    background-color: transparent;
    color: #ff6b6b;
    padding: 6px 10px;
  }
  .btn.exit:hover {
    background-color: rgba(255, 107, 107, 0.1);
  }

  @media (max-width: 600px) {
    .floating-bar {
      display: flex;
      flex-wrap: wrap;
      min-width: unset;
      width: 90%;
      max-width: 400px;
      height: auto;
      padding: 12px;
      gap: 10px;
      bottom: 30px;
    }

    .mode-toggle {
      margin-right: auto;
      order: 1;
    }

    .btn.exit {
      margin-left: auto;
      order: 2;
    }
  
    .divider { display: none; }
  
    .count {
      width: 100%;
      text-align: center;
      order: 3;
      padding: 8px 0;
      border-top: 1px solid #3a3a3a;
      border-bottom: 1px solid #3a3a3a;
      margin: 4px 0;
    }
  
    .btn.clear, .btn.preview, .btn.generate {
      flex: 1;
      text-align: center;
      font-size: 12px;
      padding: 8px 4px;
      order: 4;
    }
  
    .btn.generate {
      flex: 1.5;
    }
  }
</style>
