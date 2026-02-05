<svelte:options customElement="cv-placeholder-input" />

<script lang="ts">
  import { placeholderValueStore } from '$features/placeholder/stores/placeholder-value-store.svelte';
  import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';

  type Layout = 'inline' | 'stacked' | 'horizontal';
  type Appearance = 'outline' | 'underline' | 'ghost';

  let {
    name,
    label,
    hint,
    layout = 'inline',
    appearance = 'outline',
    width,
  } = $props<{
    name: string;
    label?: string;
    hint?: string;
    layout?: Layout;
    appearance?: Appearance;
    width?: string;
  }>();

  let effectiveLayout = $derived(layout);

  let value = $derived(placeholderValueStore.values[name] ?? '');

  let effectiveLabel = $derived.by(() => {
    if (label) return label;
    const def = placeholderRegistryStore.get(name);
    if (!def) return name;
    
    // For visible label layouts, try settingsLabel
    if (effectiveLayout !== 'inline' && def.settingsLabel) return def.settingsLabel;
    
    // Fallback
    return def.settingsLabel || name;
  });

  let effectiveHint = $derived.by(() => {
    if (hint) return hint;
    const def = placeholderRegistryStore.get(name);
    return def?.settingsHint || '';
  });

  let sanitizedId = $derived(name.replace(/[^a-zA-Z0-9_-]/g, '_'));

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    placeholderValueStore.set(name, target.value);
  }

  let inputSize = $derived.by(() => {
    if (effectiveLayout !== 'inline' || width !== 'auto-grow') return undefined; 
    
    const len = (value || effectiveHint).length;
    return Math.max(len, 4); 
  });
</script>

<div
  class="cv-input-wrapper {effectiveLayout}"
  style:--cv-input-width={width === 'auto-grow' ? 'auto' : width}
>
  {#if effectiveLayout !== 'inline' && effectiveLabel}
    <label class="placeholder-label" for="cv-input-{sanitizedId}">{effectiveLabel}</label>
  {/if}
  <input
    id="cv-input-{sanitizedId}"
    class="placeholder-input {appearance}"
    type="text"
    placeholder={effectiveHint}
    {value}
    oninput={handleInput}
    aria-label={effectiveLayout === 'inline' ? effectiveLabel : undefined}
    size={inputSize}
  />
</div>

<style>
  :host {
    display: inline-block;
    width: auto;
    margin: 0;
  }

  /* Host display overrides based on layout */
  :host([layout='stacked']),
  :host([layout='horizontal']) {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  /* Wrapper Grid/Flex Layouts */
  .cv-input-wrapper {
    display: flex;
    width: 100%;
    box-sizing: border-box;
  }

  /* INLINE */
  .cv-input-wrapper.inline {
    display: inline-block;
    width: auto;
  }

  /* STACKED */
  .cv-input-wrapper.stacked {
    flex-direction: column;
    gap: 0.25rem;
  }

  /* HORIZONTAL */
  .cv-input-wrapper.horizontal {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  /* Label Styles */
  .placeholder-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--cv-text, #333);
    white-space: nowrap;
  }
  .stacked .placeholder-label {
    margin-bottom: 2px;
    width: 100%; /* Ensure label context is full width */
    text-align: left; /* Reset text align */
  }

  /* Input Styles */
  .placeholder-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--cv-input-border, rgba(0, 0, 0, 0.1));
    border-radius: 0.375rem;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: var(--cv-input-bg, white);
    color: var(--cv-text, #333);
    box-sizing: border-box;
    width: 100%;
  }

  .stacked .placeholder-input {
    width: 100%;
  }

  .inline .placeholder-input {
    width: var(--cv-input-width, auto);
    padding: 0.3rem 0.5rem;
    display: inline-block;
    text-align: center;
  }
  
  .horizontal .placeholder-input {
      width: var(--cv-input-width, auto);
      flex: 1;
  }

  /* APPEARANCES */
  
  /* Outline (Default) - handled by base styles above */

  /* Underline */
  .placeholder-input.underline {
    border: none;
    border-bottom: 1px solid var(--cv-input-border, rgba(0, 0, 0, 0.2));
    border-radius: 0;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
  }
  .placeholder-input.underline:focus {
    box-shadow: none;
    border-bottom-color: var(--cv-primary, #3e84f4);
  }

  /* Ghost */
  .placeholder-input.ghost {
    border-color: transparent;
    background: transparent;
  }
  .placeholder-input.ghost:hover {
    background: var(--cv-input-bg-hover, rgba(0,0,0,0.05));
  }
  .placeholder-input.ghost:focus {
    background: var(--cv-input-bg, white);
    border-color: var(--cv-primary, #3e84f4);
    box-shadow: 0 0 0 2px var(--cv-focus-ring, rgba(62, 132, 244, 0.2));
  }

  /* Focus states for standard inputs */
  .placeholder-input:not(.underline):focus {
    outline: none;
    border-color: var(--cv-primary, #3e84f4);
    box-shadow: 0 0 0 2px var(--cv-focus-ring, rgba(62, 132, 244, 0.2));
  }
</style>
