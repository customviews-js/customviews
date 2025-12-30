<svelte:options customElement="cv-tab-header" />

<script lang="ts">
  // No logic needed, just a container
</script>

<slot></slot>

<style>
  :host {
    display: none; /* Semantic container only, usually read by parent and hidden */
  }
</style>
