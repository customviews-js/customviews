export const SHARE_MODE_STYLE_ID = 'cv-share-mode-styles';
export const FLOATING_ACTION_BAR_ID = 'cv-floating-action-bar';
export const HOVER_HELPER_ID = 'cv-hover-helper';

export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const SELECTED_CLASS = 'cv-share-selected';

/**
 * CSS styles to be injected during Share Mode.
 */
export const SHARE_MODE_STYLES = `
  body.cv-share-mode {
    cursor: default;
  }

  /* Highlight outlines */
  .${HIGHLIGHT_TARGET_CLASS} {
    outline: 2px dashed #0078D4 !important;
    outline-offset: 2px;
    cursor: crosshair;
  }

  .${SELECTED_CLASS} {
    outline: 3px solid #005a9e !important;
    outline-offset: 2px;
    background-color: rgba(0, 120, 212, 0.05);
  }

  /* Floating Action Bar */
  #${FLOATING_ACTION_BAR_ID} {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2c2c2c;
    color: #f1f1f1;
    border-radius: 8px;
    padding: 12px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    border: 1px solid #4a4a4a;
  }

  #${FLOATING_ACTION_BAR_ID} .cv-action-button {
    background-color: #0078D4;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  #${FLOATING_ACTION_BAR_ID} .cv-action-button:hover {
    background-color: #005a9e;
  }

  #${FLOATING_ACTION_BAR_ID} .cv-action-button.clear {
    background-color: #5a5a5a;
  }
  #${FLOATING_ACTION_BAR_ID} .cv-action-button.clear:hover {
    background-color: #4a4a4a;
  }

  #${FLOATING_ACTION_BAR_ID} .cv-action-button.exit {
    background-color: #d13438;
  }
  #${FLOATING_ACTION_BAR_ID} .cv-action-button.exit:hover {
    background-color: #a42628;
  }

  /* Hover Helper (Smart Label & Level Up) */
  #${HOVER_HELPER_ID} {
    position: fixed;
    z-index: 99999;
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    display: none;
    pointer-events: auto; /* Allow clicking buttons inside */
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  #${HOVER_HELPER_ID} button {
    background: #555;
    border: none;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 14px;
    line-height: 1;
  }
  #${HOVER_HELPER_ID} button:hover {
    background: #777;
  }

`;
