<svelte:options customElement="cv-tab" />

<script lang="ts">
  // export let header: string = '';
  // export let internalId: string = '';
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

  /* When not active, hide the host entirely? 
     TabManager logic uses 'cv-hidden' class on the host. 
     TabGroup also writes to 'cv-hidden'.
     
     If we want full parity with tab-styles.ts:
     cv-tab.cv-hidden { display: none !important; }
     cv-tab.cv-visible { display: block !important; }
  */

  :host(.cv-hidden) {
    display: none !important;
  }
  
  :host(.cv-visible) {
    display: block !important;
  }

  /* 
     Also existing logic used `active` attribute.
     We can keep this for internal styling consistency.
  */
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

  /* Handle slotted content styling previously in tab-styles.ts */
  
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
