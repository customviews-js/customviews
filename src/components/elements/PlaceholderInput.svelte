<svelte:options customElement="cv-placeholder-input" />

<script lang="ts">
  import { placeholderValueStore } from '../../core/stores/placeholder-value-store.svelte';
  import { placeholderRegistryStore } from '../../core/stores/placeholder-registry-store.svelte';

  let { 
    name, 
    label, 
    hint 
  } = $props<{ name: string, label?: string, hint?: string }>();

  let value = $derived(placeholderValueStore.values[name] ?? '');
  
  let effectiveLabel = $derived.by(() => {
    if (label) return label;
    const def = placeholderRegistryStore.get(name);
    return def?.settingsLabel || name;
  });

  let effectiveHint = $derived.by(() => {
    if (hint) return hint;
    const def = placeholderRegistryStore.get(name);
    return def?.settingsHint || '';
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    placeholderValueStore.set(name, target.value);
  }
</script>

<div class="cv-input-wrapper">
  {#if effectiveLabel}
    <label class="variable-label" for="cv-input-{name}">{effectiveLabel}</label>
  {/if}
  <input 
      id="cv-input-{name}"
      class="variable-input"
      type="text" 
      placeholder={effectiveHint}
      value={value}
      oninput={handleInput}
  />
</div>

<style>
  :host {
    display: inline-block;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  /* Reuse styles from Modal/Settings */
  .cv-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
  }

  .variable-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--cv-text, #333);
    margin-bottom: 2px;
  }

  .variable-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--cv-input-border, rgba(0,0,0,0.1));
    border-radius: 0.375rem;
    font-size: 0.9rem;
    transition: border-color 0.2s;
    background: var(--cv-input-bg, white);
    color: var(--cv-text, #333);
    width: 100%;
    box-sizing: border-box;
  }

  .variable-input:focus {
    outline: none;
    border-color: var(--cv-primary, #3e84f4);
    box-shadow: 0 0 0 2px var(--cv-focus-ring, rgba(62, 132, 244, 0.2));
  }
</style>
