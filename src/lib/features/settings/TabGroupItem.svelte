<script lang="ts">
  import type { TabGroupConfig } from '$lib/types/index';

  let {
    group,
    activeTabId = $bindable(''),
    onchange = () => {},
  }: {
    group: TabGroupConfig;
    activeTabId?: string | undefined;
    onchange?: (detail: { groupId: string; tabId: string }) => void;
  } = $props();

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
  <select id="tab-group-{group.groupId}" class="select" value={activeTabId} onchange={onChange}>
    {#each group.tabs as tab (tab.tabId)}
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
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: 0.5rem;
  }

  /* Remove special handling for last child since they are now separate cards */
  .root:last-child {
    border-bottom: 1px solid var(--cv-border);
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0;
    line-height: 1.4;
    font-weight: 500;
    display: block;
    cursor: pointer;
  }

  .description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .select {
    width: 100%;
    border-radius: 0.5rem;
    background: var(--cv-input-bg);
    border: 1px solid var(--cv-input-border);
    color: var(--cv-text);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .select:hover {
    border-color: var(--cv-text-secondary);
  }

  .select:focus {
    outline: none;
    border-color: var(--cv-primary);
    box-shadow: 0 0 0 2px var(--cv-focus-ring);
  }
</style>
