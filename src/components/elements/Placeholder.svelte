<svelte:options customElement="cv-placeholder" />

<script lang="ts">
  import { placeholderValueStore } from '../../core/stores/placeholder-value-store.svelte';
  import { placeholderRegistryStore } from '../../core/stores/placeholder-registry-store.svelte';

  let { name, fallback } = $props<{ name: string, fallback?: string }>();

  let value = $derived.by(() => {
     if (!name) return '';
     
     // 1. User Value
     const userVal = placeholderValueStore.values[name];
     if (userVal) return userVal;

     // 2. Registry Default
     const def = placeholderRegistryStore.get(name);
     if (def?.defaultValue) return def.defaultValue;

     // 3. Fallback
     if (fallback) return fallback;

     // 4. Raw Name
     return `[[${name}]]`;
  });
</script>

<span class="cv-var">{value}</span>

<style>
  :host {
    display: inline;
  }
</style>
