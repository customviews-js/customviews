<svelte:options customElement="cv-placeholder" />

<script lang="ts">
  import { activeStateStore } from '$lib/stores/active-state-store.svelte';
  import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';

  let { name, fallback } = $props<{ name: string; fallback?: string }>();

  let value = $derived.by(() => {
    if (!name) return '';

    // 1. User Value
    const userVal = activeStateStore.state.placeholders?.[name];
    if (userVal !== undefined && userVal !== '') return userVal;

    // 2. Fallback
    if (fallback) return fallback;

    // 3. Registry Default
    const def = placeholderRegistryStore.get(name);
    if (def?.defaultValue !== undefined && def.defaultValue !== '') return def.defaultValue;

    // 4. Raw Name
    return `[[${name}]]`;
  });
  function updateHost(node: HTMLElement) {
    // With {@attach}, this function runs in an effect context
    // and re-runs whenever dependencies (like `value`) change.

    // Write to the host's light DOM so that .textContent works on parent elements
    // This is safe because we don't have <slot>s, so this text is never rendered
    const host = node.getRootNode() as ShadowRoot;
    if (host && host.host) {
      const hostEl = host.host as HTMLElement;
      hostEl.innerText = value;
    }
  }
</script>

<span class="cv-var" {@attach updateHost}>{value}</span>

<style>
  :host {
    display: inline;
  }
</style>
