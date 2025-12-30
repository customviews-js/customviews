<script lang="ts">
  import type { TabGroupConfig } from '../../types/types';

  export let group: TabGroupConfig;
  export let activeTabId: string | undefined = '';

  export let onchange: (detail: { groupId: string, tabId: string }) => void = () => {};

  function onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    activeTabId = target.value;
    onchange({ groupId: group.id, tabId: activeTabId });
  }
</script>

<div class="root">
  <label class="label" for="tab-group-{group.id}">
    {group.label || group.id}
  </label>
  <select 
    id="tab-group-{group.id}" 
    class="select" 
    value={activeTabId} 
    onchange={onChange}
  >
    {#each group.tabs as tab}
      <option value={tab.id}>{tab.label || tab.id}</option>
    {/each}
  </select>
</div>

<style>

  .root {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .root:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.8);
    margin: 0;
    line-height: 1.4;
    font-weight: 500;
    display: block;
    cursor: pointer;
  }

  .select {
    width: 100%;
    border-radius: 0.5rem;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.9);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .select:hover {
    border-color: rgba(0, 0, 0, 0.25);
  }

  .select:focus {
    outline: none;
    border-color: #3e84f4;
    box-shadow: 0 0 0 2px rgba(62, 132, 244, 0.2);
  }

  /* Dark Theme */
  :global(.cv-widget-theme-dark) .root {
    background: #101722;
    border-color: rgba(255, 255, 255, 0.1);
  }

  :global(.cv-widget-theme-dark) .label {
    color: #e2e8f0;
  }

  :global(.cv-widget-theme-dark) .select {
    background: #101722;
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
  }
</style>
