
<script>
  let { isPinned = false, ...rest } = $props();
  // Derived opacity based on isPinned
  const extraOpacity = $derived(isPinned ? '1' : '0.6');
</script>

<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="currentColor"
  opacity={extraOpacity}
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  <g transform="rotate(45 8 8)">
    <path d="M10.5 2H12V0H4V2H5.5V6L4 7.5V9H7.2V15H8.8V9H12V7.5L10.5 6V2Z" />
  </g>
</svg>
