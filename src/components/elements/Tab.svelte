<svelte:options customElement="cv-tab" />

<script lang="ts">
  // Props using Svelte 5 runes
  let { active = false }: { active?: boolean } = $props();

  // Component is a container that toggles visibility.
  // The parent (TabGroup) will set the .active property directly.
</script>

<div class="cv-tab-content" class:active={active}>
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
    display: none;
    animation: fade-in 0.2s ease-in-out;
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }

  .cv-tab-content.active {
    display: block;
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
