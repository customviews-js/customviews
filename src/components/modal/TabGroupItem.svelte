<script lang="ts">
  import type { TabGroupConfig } from '../../types/types';

  export let group: TabGroupConfig;
  export let activeTabId: string | undefined = '';

  export let onchange: (detail: { groupId: string, tabId: string }) => void = () => {};

  function onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    activeTabId = target.value;
    onchange({ groupId: group.groupId, tabId: activeTabId });
  }
</script>

<div class="root">
  <div class="header">
    <label class="label" for="tab-group-{group.groupId}">
      {group.label || group.groupId}
    </label>
    {#if group.description}
      <p class="description">{group.description}</p>
    {/if}
  </div>
  <select 
    id="tab-group-{group.groupId}" 
    class="select" 
    value={activeTabId} 
    onchange={onChange}
  >
    {#each group.tabs as tab}
      <option value={tab.tabId}>{tab.label || tab.tabId}</option>
    {/each}
  </select>
</div>

<style>

  .root {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
  }

  /* Remove special handling for last child since they are now separate cards */
  .root:last-child {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

  .description {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.6);
    margin: 0;
    line-height: 1.4;
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
  :global(.cv-settings-theme-dark) .root {
    background: #101722;
    border-color: rgba(255, 255, 255, 0.1);
  }

  :global(.cv-settings-theme-dark) .label {
    color: #e2e8f0;
  }

  :global(.cv-settings-theme-dark) .description {
    color: rgba(255, 255, 255, 0.6);
  }

  :global(.cv-settings-theme-dark) .select {
    background: #101722;
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
  }
</style>
