<script lang="ts">
  import type { ToggleConfig } from '../../types/types';

  export let toggle: ToggleConfig;
  export let value: 'show' | 'hide' | 'peek' = 'hide';
  export let onchange: (detail: { toggleId: string, value: 'show' | 'hide' | 'peek' }) => void = () => {};


</script>

<div class="card">
  <div class="content">
    <div>
      <p class="title">{toggle.label || toggle.toggleId}</p>
      {#if toggle.description}
        <p class="description">{toggle.description}</p>
      {/if}
    </div>
    <div class="radios">
      <label class="radio-label" title="Hide">
        <input 
          class="toggle-input" 
          type="radio" 
          name="cv-toggle-{toggle.toggleId}" 
          value="hide" 
          bind:group={value}
          onchange={() => onchange({ toggleId: toggle.toggleId, value: 'hide' })}
        />
        <span>Hide</span>
      </label>
      <label class="radio-label" title="Peek">
        <input 
          class="toggle-input" 
          type="radio" 
          name="cv-toggle-{toggle.toggleId}" 
          value="peek" 
          bind:group={value}
          onchange={() => onchange({ toggleId: toggle.toggleId, value: 'peek' })}
        />
        <span>Peek</span>
      </label>
      <label class="radio-label" title="Show">
        <input 
          class="toggle-input" 
          type="radio" 
          name="cv-toggle-{toggle.toggleId}" 
          value="show" 
          bind:group={value}
          onchange={() => onchange({ toggleId: toggle.toggleId, value: 'show' })}
        />
        <span>Show</span>
      </label>
    </div>
  </div>
</div>

<style>
  .card {
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: 0.5rem;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
  }

  .title {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--cv-text);
    margin: 0;
  }

  .description {
    font-size: 0.75rem;
    color: var(--cv-text-secondary);
    margin: 0.125rem 0 0 0;
  }

  .radios {
    display: flex;
    gap: 8px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--cv-text);
  }

  .toggle-input {
    margin: 0;
    opacity: 1;
    width: auto;
    height: auto;
  }
</style>
