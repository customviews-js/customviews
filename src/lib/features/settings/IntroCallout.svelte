<script lang="ts">
  interface Props {
    position?:
      | 'top-right'
      | 'top-left'
      | 'bottom-right'
      | 'bottom-left'
      | 'middle-left'
      | 'middle-right';
    message?: string;
    onclose?: () => void;
    enablePulse?: boolean;
    backgroundColor?: string;
    textColor?: string;
  }

  let {
    position = 'middle-left',
    message = 'Customize your reading experience here.',
    onclose = () => {},
    enablePulse = true,
    backgroundColor = undefined,
    textColor = undefined,
  }: Props = $props();

  // Map widget position to callout position logic
  /*
    Positions need to be adjusted based on the widget icon location.
    "right" positions -> callout appears to the left of the icon
    "left" positions -> callout appears to the right of the icon
    "top" -> aligned top
    "bottom" -> aligned bottom
  */
</script>

<div class="cv-callout-wrapper pos-{position}">
  <div
    class="cv-callout {enablePulse ? 'cv-pulse' : ''}"
    role="alert"
    style:--cv-callout-bg={backgroundColor}
    style:--cv-callout-text={textColor}
  >
    <button class="close-btn" aria-label="Dismiss intro" onclick={onclose}> × </button>
    <p class="text">{message}</p>
  </div>
</div>

<style>
  /* Animation */
  @keyframes popIn {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(-50%);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(-50%);
    }
  }

  /* Reset transform for top/bottom positions */
  @keyframes popInVertical {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Simplified Pulse Animation - Shadow Only */
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 0 0 0 rgba(62, 132, 244, 0.7);
    }
    50% {
      transform: scale(1);
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 0 0 10px rgba(62, 132, 244, 0);
    }
    100% {
      transform: scale(1);
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 0 0 0 rgba(62, 132, 244, 0);
    }
  }

  /* Wrapper handles Positioning & Entry Animation */
  .cv-callout-wrapper {
    position: fixed;
    z-index: 9999;

    /* Default animation (centered ones) */
    animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Inner handles Visuals & Pulse Animation */
  .cv-callout {
    background: var(--cv-callout-bg, var(--cv-bg));
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    box-shadow:
      0 4px 6px -1px var(--cv-shadow),
      0 2px 4px -1px var(--cv-shadow); /* adapt shadow? */
    max-width: 250px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--cv-callout-text, var(--cv-text));
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-family: inherit;
    border: 2px solid var(--cv-border);
  }

  /* Apply pulse to inner callout if enabled */
  .cv-callout.cv-pulse {
    animation: pulse 2s infinite 0.5s;
  }

  /* Arrow Base */
  .cv-callout::before {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: var(--cv-callout-bg, var(--cv-bg));
    transform: rotate(45deg);
    border: 2px solid var(--cv-border);
    z-index: -1;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: currentColor;
    opacity: 0.7;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    margin: -0.25rem -0.5rem 0 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  .close-btn:hover {
    color: currentColor;
    opacity: 1;
  }

  .text {
    margin: 0;
    flex: 1;
    font-weight: 500;
  }

  /* 
     Position Specifics (Applied to Wrapper)
  */

  /* Right-side positions (Icon on Right -> Callout on Left) */
  .pos-top-right,
  .pos-middle-right,
  .pos-bottom-right {
    right: 80px;
  }

  .pos-top-right,
  .pos-bottom-right {
    animation-name: popInVertical;
  }

  /* X Button Spacing Adjustments */
  .pos-top-right .close-btn,
  .pos-middle-right .close-btn,
  .pos-bottom-right .close-btn {
    margin-right: 0;
    margin-left: -0.5rem;
  }

  /* Left-side positions (Icon on Left -> Callout on Right) */
  .pos-top-left,
  .pos-middle-left,
  .pos-bottom-left {
    left: 80px;
  }

  .pos-top-left .close-btn,
  .pos-middle-left .close-btn,
  .pos-bottom-left .close-btn {
    order: 2; /* Move to end */
    margin-right: -0.5rem;
    margin-left: 0;
  }

  .pos-top-left,
  .pos-bottom-left {
    animation-name: popInVertical;
  }

  /* Vertical Alignment */
  .pos-middle-right,
  .pos-middle-left {
    top: 50%;
    /* transform handled by popIn animation (translateY -50%) */
  }

  .pos-top-right,
  .pos-top-left {
    top: 20px;
  }

  .pos-bottom-right,
  .pos-bottom-left {
    bottom: 20px;
  }

  /* Arrow Positioning (Child of .callout, dependent on Wrapper .pos-*) */

  /* Pointing Right */
  .pos-top-right .cv-callout::before,
  .pos-middle-right .cv-callout::before,
  .pos-bottom-right .cv-callout::before {
    right: -0.5rem;
    border-left: none;
    border-bottom: none;
  }

  /* Pointing Left */
  .pos-top-left .cv-callout::before,
  .pos-middle-left .cv-callout::before,
  .pos-bottom-left .cv-callout::before {
    left: -0.5rem;
    border-right: none;
    border-top: none;
  }

  /* Vertical placement of arrow */
  .pos-middle-right .cv-callout::before,
  .pos-middle-left .cv-callout::before {
    top: 50%;
    margin-top: -0.5rem;
  }

  .pos-top-right .cv-callout::before,
  .pos-top-left .cv-callout::before {
    top: 1.25rem;
  }

  .pos-bottom-right .cv-callout::before,
  .pos-bottom-left .cv-callout::before {
    bottom: 1.25rem;
  }

  @media print {
    .cv-callout-wrapper {
      display: none !important;
    }
  }
</style>
