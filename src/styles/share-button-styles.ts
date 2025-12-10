
export const SHARE_BUTTON_ID = 'cv-share-button';

export const SHARE_BUTTON_STYLES = `
  #${SHARE_BUTTON_ID} {
    position: fixed;
    bottom: 20px;
    right: 100px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #007bff; /* Primary Blue */
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* Drop shadow */
    z-index: 9998; /* Below modals (9999) but above content */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.2s;
    opacity: 1;
    transform: scale(1);
    padding: 0;
    margin: 0;
  }

  #${SHARE_BUTTON_ID}:hover {
    background-color: #0056b3; /* Darker blue on hover */
    transform: scale(1.05);
  }

  #${SHARE_BUTTON_ID}:active {
    transform: scale(0.95);
  }

  #${SHARE_BUTTON_ID}.cv-hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }

  @media print {
    #${SHARE_BUTTON_ID} {
      display: none !important;
    }
  }

  #${SHARE_BUTTON_ID} svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;
