<svelte:options customElement="cv-tab" />

<script lang="ts">
  export let header: string = '';
  // Internal ID used by TabGroup if no ID is provided
  export let internalId: string = '';
  export let active: boolean = false;

  // We need to expose the ability for the parent to read the header content if it's passed via slot
  // But standard slot content inspection is hard in shadow DOM or even light DOM from Svelte.
  // The existing TabManager logic uses querySelector for `cv-tab-header`.
  // We can treat this component mainly as a container that toggles visibility.
</script>

<div class="cv-tab-content" class:active={active} hidden={!active}>
  <slot></slot>
</div>

<style>
  :host {
    display: block;
  }

  /* When not active, valid to hide the host entirely or just the content?
     The logic in TabManager uses 'cv-hidden' class on the host. 
     If we use the `hidden` attribute on the host, it's native.
  */

  :host([active="true"]) {
    display: block;
  }
  
  /* Reflect the prop to attribute for styling if needed, or rely on internal logic */

  .cv-tab-content {
    display: block;
    animation: fade-in 0.2s ease-in-out;
  }

  .cv-tab-content[hidden] {
    display: none;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
