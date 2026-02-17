<svelte:options
  customElement={{
    tag: 'cv-tab',
    props: {
      tabId: { reflect: true, type: 'String', attribute: 'tab-id' },
      header: { reflect: true, type: 'String', attribute: 'header' },
    },
  }}
/>

<script lang="ts">
  // Props using Svelte 5 runes
  // tabId and header are used in TabGroup directly.
  // let { active = false, tabId = '', header = '' }: { active?: boolean; tabId?: string; header?: string } = $props();
  let { active = false }: { active?: boolean } = $props();

  // Component is a container that toggles visibility.
  // The parent (TabGroup) will set the .active property directly.
</script>

<div class="cv-tab-content" class:active>
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

  :host([active='true']) {
    display: block;
  }

  .cv-tab-content {
    display: none;
    animation: fade-in 0.2s ease-in-out;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
    padding-left: 0;
    padding-right: 0;
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
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
