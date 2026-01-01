<script lang="ts">
  // Component is mounted manually via `mount`, use props for communication.
  let { hiddenCount = 0, onExpand } = $props<{ hiddenCount: number, onExpand: () => void }>();

  function handleClick() {
    if (onExpand) onExpand();
  }
</script>

<div 
  class="cv-context-divider" 
  role="button" 
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  ... {hiddenCount} section{hiddenCount > 1 ? 's' : ''} hidden (Click to expand) ...
</div>

<style>
  .cv-context-divider {
    padding: 12px;
    margin: 16px 0;
    background-color: #f8f8f8;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
    color: #555;
    text-align: center;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    transition: background-color 0.2s;
  }
  .cv-context-divider:hover {
    background-color: #e8e8e8;
    color: #333;
  }
</style>
