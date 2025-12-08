export const TOAST_STYLE_ID = 'cv-toast-styles';
export const TOAST_CLASS = 'cv-toast-notification';

export const TOAST_STYLES = `
  .cv-toast-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #323232;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 100000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none; /* Let clicks pass through if needed, though usually it blocks */
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }
`;
