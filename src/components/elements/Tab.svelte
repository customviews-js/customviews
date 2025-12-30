<svelte:options customElement="cv-tab" />

<script lang="ts">

  export let active: boolean = false;

  // Component is a container that toggles visibility.
</script>

<div class="cv-tab-content" class:active={active} hidden={!active}>
  <slot></slot>
</div>

<style>
  :host {
    display: block;
  }

  :host(.cv-hidden) {
    display: none !important;
  }
  
  :host(.cv-visible) {
    display: block !important;
  }

  :host([active="true"]) {
    display: block;
  }
  
  .cv-tab-content {
    display: block;
    animation: fade-in 0.2s ease-in-out;
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }

  .cv-tab-content[hidden] {
    display: none;
  }

  /* Hide cv-tab-header source element; content is extracted to nav link */
  ::slotted(cv-tab-header) {
    display: none !important;
  }

  /* Allow cv-tab-body to flow naturally */
  ::slotted(cv-tab-body) {
    display: block;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
