<script lang="ts">
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right' | undefined = 'middle-left';
  export let message: string | undefined = 'Customize your reading experience here.';
  export let onclose: (() => void) | undefined = () => {};

  // Map widget position to callout position logic
  /*
    Positions need to be adjusted based on the widget icon location.
    "right" positions -> callout appears to the left of the icon
    "left" positions -> callout appears to the right of the icon
    "top" -> aligned top
    "bottom" -> aligned bottom
  */

  /*
    Positions need to be adjusted based on the widget icon location.
    "right" positions -> callout appears to the left of the icon
    "left" positions -> callout appears to the right of the icon
    "top" -> aligned top
    "bottom" -> aligned bottom
  */
</script>

<div 
  class="callout pos-{position}" 
  role="alert" 
>
  <button class="close-btn" aria-label="Dismiss intro" onclick={onclose}>
    ×
  </button>
  <p class="text">{message}</p>
</div>

<style>
  /* Animation */
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.9) translateY(-50%); }
    100% { opacity: 1; transform: scale(1) translateY(-50%); }
  }

  /* Reset transform for top/bottom positions */
  @keyframes popInVertical {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  .callout {
    position: fixed;
    background: white;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 9999;
    max-width: 250px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #1a1a1a;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-family: inherit;
    border: 2px solid rgba(0,0,0,0.2);
    
    /* Animation defaults */
    animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Arrow Base */
  .callout::before {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: white;
    transform: rotate(45deg);
    border: 2px solid rgba(0,0,0,0.2);
    z-index: -1;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #6b7280;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    margin: -0.25rem -0.5rem 0 0;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .close-btn:hover {
    color: #111827;
  }

  .text {
    margin: 0;
    flex: 1;
    font-weight: 500;
  }

  /* 
     Position Specifics 
     Note: Icon is roughly 50px x 50px. 
     We assume 60px offset from edge for the icon center/edge.
     We need to position the callout relative to that.
  */

  /* Right-side positions (Icon on Right -> Callout on Left) */
  /* Arrow is on RIGHT. X should be on LEFT. */
  .pos-top-right, .pos-middle-right, .pos-bottom-right {
    right: 80px;
  }

  .pos-top-right, .pos-bottom-right {
     animation-name: popInVertical; 
  }
  
  /* X Button on Left (Default order) - tweaks for spacing */
  .pos-top-right .close-btn, 
  .pos-middle-right .close-btn, 
  .pos-bottom-right .close-btn {
     margin-right: 0;
     margin-left: -0.5rem;
  }


  /* Left-side positions (Icon on Left -> Callout on Right) */
  /* Arrow is on LEFT. X should be on RIGHT. */
  .pos-top-left, .pos-middle-left, .pos-bottom-left {
    left: 80px; 
  }
  
  .pos-top-left .close-btn, 
  .pos-middle-left .close-btn, 
  .pos-bottom-left .close-btn {
    order: 2; /* Move to end */
    margin-right: -0.5rem;
    margin-left: 0;
  }
  
  .pos-top-left, .pos-bottom-left {
     animation-name: popInVertical; 
  }

  /* Vertical Alignment */
  .pos-middle-right, .pos-middle-left {
    top: 50%;
    /* transform handled by animation */
  }

  .pos-top-right, .pos-top-left {
    top: 20px;
  }

  .pos-bottom-right, .pos-bottom-left {
    bottom: 20px;
  }


  /* Arrow Positioning */
  
  /* Pointing Right (for callouts regarding right-side icons) */
  .pos-top-right::before, 
  .pos-middle-right::before, 
  .pos-bottom-right::before {
    right: -0.5rem; /* Adjusted for larger size */
    border-left: none;
    border-bottom: none;
  }

  /* Pointing Left (for callouts regarding left-side icons) */
  .pos-top-left::before, 
  .pos-middle-left::before, 
  .pos-bottom-left::before {
    left: -0.5rem; /* Adjusted for larger size */
    border-right: none;
    border-top: none;
  }

  /* Vertical placement of arrow on the box */
  .pos-middle-right::before, .pos-middle-left::before {
    top: 50%;
    margin-top: -0.5rem; /* Center larger arrow */
  }

  .pos-top-right::before, .pos-top-left::before {
    top: 1.25rem;
  }

  .pos-bottom-right::before, .pos-bottom-left::before {
    bottom: 1.25rem;
  }


  /* Dark Theme */
  :global(.cv-settings-theme-dark) .callout {
    background: #1f2937;
    color: #e5e7eb;
    border-color: rgba(255,255,255,0.2);
  }

  :global(.cv-settings-theme-dark) .callout::before {
    background: #1f2937;
    border-color: rgba(255,255,255,0.2);
  }
  
  :global(.cv-settings-theme-dark) .close-btn {
    color: #9ca3af;
  }

  :global(.cv-settings-theme-dark) .close-btn:hover {
    color: #f3f4f6;
  }
</style>
