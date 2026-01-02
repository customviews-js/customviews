<script lang="ts">
  import { onMount } from 'svelte';

  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' | undefined = 'middle-left';
  export let title: string | undefined = 'Customize View';
  export let pulse: boolean | undefined = false;
  export let onclick: (() => void) | undefined = undefined;
  
  // Custom Styles
  export let iconColor: string | undefined = undefined;
  export let backgroundColor: string | undefined = undefined;
  export let opacity: number | undefined = undefined;
  export let scale: number | undefined = undefined;

  export function resetPosition() {
    currentOffset = 0;
    startOffset = 0;
    localStorage.removeItem(STORAGE_KEY);
  }

  let isDragging = false;
  let startY = 0;
  let startOffset = 0;
  let currentOffset = 0;
  const STORAGE_KEY = 'cv-settings-icon-offset';

  onMount(() => {
    // Load persisted offset
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentOffset = parseFloat(saved);
    }

    // Global event listeners to handle drag leaving the element
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalEnd);
    window.addEventListener('touchmove', onGlobalMove, { passive: false });
    window.addEventListener('touchend', onGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('mouseup', onGlobalEnd);
      window.removeEventListener('touchmove', onGlobalMove);
      window.removeEventListener('touchend', onGlobalEnd);
    };
  });

  // Refined Click Logic:
  // We'll capture the specific startY of the interaction.
  // If at mouseup (which happens before click), the delta is > 5, we set a flag 'suppressClick'.
  // On click, if suppressClick is true, we reset it and return.
  let suppressClick = false;

  function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      handleRefinedStart(e.clientY);
  }

  function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      handleRefinedStart(e.touches[0]!.clientY);
  }

  function handleRefinedStart(clientY: number) {
    isDragging = true;
    startY = clientY;
    startOffset = currentOffset;
    suppressClick = false;
  }
   
  function onGlobalMove(e: MouseEvent | TouchEvent) {
      if (!isDragging) return;
      
      let clientY;
      // Safer type check and access
      if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 0) {
          clientY = e.touches[0]!.clientY;
      } else if (e instanceof MouseEvent) {
          clientY = e.clientY;
      } else { 
          return; 
      }
      
      const deltaY = clientY - startY;
      currentOffset = startOffset + deltaY;
      
      if (Math.abs(deltaY) > 5) {
          suppressClick = true;
      }
  }
  
  function onGlobalEnd() {
      if (!isDragging) return;
      isDragging = false;
      localStorage.setItem(STORAGE_KEY, currentOffset.toString());
  }
  
  function onClick(e: MouseEvent) {
      if (suppressClick) {
          e.stopImmediatePropagation();
          e.preventDefault();
          suppressClick = false;
          return;
      }
      if (onclick) onclick();
  }
   
   // Key handler for accessibility
    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onclick) onclick();
        }
    }

    // Helper for transforms
    function getTransform(pos: string | undefined, offset: number, s: number | undefined) {
        const isMiddle = pos && pos.includes('middle');
        let t = '';
        
        if (isMiddle) {
            t = `translateY(calc(-50% + ${offset}px))`;
        } else {
             t = `translateY(${offset}px)`;
        }

        if (s && s !== 1) {
            t += ` scale(${s})`;
        }
        return t;
    }

</script>

<svelte:window 
    on:mousemove={onGlobalMove} 
    on:mouseup={onGlobalEnd}
    on:touchmove|nonpassive={onGlobalMove}
    on:touchend={onGlobalEnd}
/>

<div 
  class="cv-settings-icon cv-settings-{position} {pulse ? 'cv-pulse' : ''}" 
  {title} 
  role="button"
  tabindex="0"
  aria-label="Open Custom Views Settings"
  on:mousedown={onMouseDown}
  on:touchstart|nonpassive={onTouchStart}
  on:click={onClick}
  on:keydown={onKeyDown}
  style:--cv-icon-color={iconColor}
  style:--cv-icon-bg={backgroundColor}
  style:--cv-icon-opacity={opacity}
  style:transform={getTransform(position, currentOffset, scale)}
  style:cursor={isDragging ? 'grabbing' : 'grab'}
>
  <span class="cv-gear">⚙</span>
</div>

<style>
  .cv-settings-icon {
    position: fixed;
    background: var(--cv-icon-bg, rgba(255, 255, 255, 0.92));
    color: var(--cv-icon-color, rgba(0, 0, 0, 0.9));
    opacity: var(--cv-icon-opacity, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    cursor: grab; /* Default cursor */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(0, 0, 0, 0.2);
    z-index: 9998;
    transition: width 0.3s ease, background 0.3s ease, color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease; /* Removed transform transition to allow smooth dragging */
    touch-action: none; /* Crucial for touch dragging */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
    user-select: none; /* Prevent text selection while dragging */
  }
  
  .cv-settings-icon:active {
      cursor: grabbing;
  }

  .cv-settings-icon:hover {
    background: var(--cv-icon-bg, rgba(255, 255, 255, 1));
    color: var(--cv-icon-color, rgba(0, 0, 0, 1));
    opacity: 1;
    border-color: rgba(0, 0, 0, 0.3);
  }

  /* Top-right */
  .cv-settings-top-right {
    top: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px; 
    justify-content: flex-start;
    border-right: none; 
  }

  /* Top-left */
  .cv-settings-top-left {
    top: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px; 
    justify-content: flex-end;
    border-left: none;
  }

  /* Bottom-right */
  .cv-settings-bottom-right {
    bottom: 20px;
    right: 0;
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  /* Bottom-left */
  .cv-settings-bottom-left {
    bottom: 20px;
    left: 0;
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-left */
  .cv-settings-middle-left {
    top: 50%;
    left: 0;
    /* transform handled by inline style now */
    border-radius: 0 18px 18px 0;
    padding-right: 6px;
    justify-content: flex-end;
    border-left: none;
  }

  /* Middle-right */
  .cv-settings-middle-right {
    top: 50%;
    right: 0;
    /* transform handled by inline style now */
    border-radius: 18px 0 0 18px;
    padding-left: 6px;
    justify-content: flex-start;
    border-right: none;
  }

  .cv-settings-top-right,
  .cv-settings-middle-right,
  .cv-settings-bottom-right,
  .cv-settings-top-left,
  .cv-settings-middle-left,
  .cv-settings-bottom-left {
    height: 36px;
    width: 36px;
  }

  .cv-settings-middle-right:hover,
  .cv-settings-top-right:hover,
  .cv-settings-bottom-right:hover,
  .cv-settings-top-left:hover,
  .cv-settings-middle-left:hover,
  .cv-settings-bottom-left:hover {
    width: 55px;
  }

  :global(.cv-pulse) {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0.7);
    }
    70% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(62, 132, 244, 0);
    }
    100% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0);
    }
  }

  @media (max-width: 768px) {
    .cv-settings-top-right,
    .cv-settings-top-left {
      top: 10px;
    }

    .cv-settings-bottom-right,
    .cv-settings-bottom-left {
      bottom: 10px;
    }

    .cv-settings-top-right,
    .cv-settings-bottom-right,
    .cv-settings-middle-right {
      right: 0;
    }

    .cv-settings-top-left,
    .cv-settings-bottom-left,
    .cv-settings-middle-left {
      left: 0;
    }

    .cv-settings-icon {
      width: 60px;
      height: 32px;
    }

    .cv-settings-icon:hover {
      width: 75px;
    }
  }

</style>
