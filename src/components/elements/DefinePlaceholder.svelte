<svelte:options
  customElement={{
    tag: 'cv-define-placeholder',
    props: {
        name: { type: 'String', attribute: 'name' },
        settingsLabel: { type: 'String', attribute: 'settings-label' },
        settingsHint: { type: 'String', attribute: 'settings-hint' },
        defaultValue: { type: 'String', attribute: 'default-value' }
    }
  }}
/>
<script lang="ts">
  import { untrack } from 'svelte';
  import { placeholderRegistryStore } from '../../core/stores/placeholder-registry-store.svelte';

  interface Props {
    name: string;
    settingsLabel?: string;
    settingsHint?: string;
    defaultValue?: string;
  }

  let { name, settingsLabel, settingsHint, defaultValue }: Props = $props();

  $effect(() => {
    // Capture dependencies (props) outside untrack
    const def = {
        name,
        settingsLabel: settingsLabel ?? name,
        settingsHint: settingsHint,
        defaultValue: defaultValue
    };

    untrack(() => {
        console.log('[DefinePlaceholder] Registering:', name);
        try {
          placeholderRegistryStore.register(def);
        } catch (err) {
          console.error('[DefinePlaceholder] Error registering:', err);
        }
    });
  });
</script>
