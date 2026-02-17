<script lang="ts">
  import type { PlaceholderDefinition } from '$features/placeholder/types';

  interface Props {
    definition: PlaceholderDefinition;
    value?: string;
    onchange?: (detail: { name: string; value: string }) => void;
  }

  let { definition, value = $bindable(''), onchange = () => {} }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange({ name: definition.name, value: target.value });
  }

  const sanitizedId = $derived(`cv-placeholder-${definition.name.replace(/[^a-zA-Z0-9-_]/g, '-')}`);
</script>

<div class="placeholder-item">
  <label class="placeholder-label" for={sanitizedId}
    >{definition.settingsLabel || definition.name}</label
  >
  <input
    id={sanitizedId}
    class="placeholder-input"
    type="text"
    placeholder={definition.settingsHint || ''}
    {value}
    oninput={handleInput}
  />
</div>

<style>
  .placeholder-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .placeholder-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--cv-text);
  }

  .placeholder-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--cv-input-border);
    border-radius: 0.375rem;
    font-size: 0.9rem;
    transition: border-color 0.2s;
    background: var(--cv-input-bg);
    color: var(--cv-text);
  }

  .placeholder-input:focus {
    outline: none;
    border-color: var(--cv-primary);
    box-shadow: 0 0 0 2px var(--cv-focus-ring);
  }
</style>
