export const FOCUS_MODE_STYLE_ID = 'cv-focus-mode-styles';
export const BODY_FOCUS_CLASS = 'cv-focus-mode';
export const HIDDEN_CLASS = 'cv-focus-hidden';
export const FOCUSED_CLASS = 'cv-focused-element';
export const DIVIDER_CLASS = 'cv-context-divider';
export const EXIT_BANNER_ID = 'cv-exit-focus-banner';

const styles = `
  body.${BODY_FOCUS_CLASS} {
     /* e.g. potentially hide scrollbars or adjust layout */
  }

  .${HIDDEN_CLASS} {
    display: none !important;
  }

  .${FOCUSED_CLASS} {
    /* No visual style for focused elements, just logic class for now. Can add borders for debugging*/
  }

  .${DIVIDER_CLASS} {
    padding: 12px;
    margin: 16px 0;
    background-color: #f8f8f8;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
    color: #555;
    text-align: center;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    transition: background-color 0.2s;
  }
  .${DIVIDER_CLASS}:hover {
    background-color: #e8e8e8;
    color: #333;
  }

  #${EXIT_BANNER_ID} {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background-color: #0078D4;
    color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 100000;
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  #${EXIT_BANNER_ID} button {
    background: white;
    color: #0078D4;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  #${EXIT_BANNER_ID} button:hover {
    background: #f0f0f0;
  }
`;

export const FOCUS_MODE_STYLES = styles;
