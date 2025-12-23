/**
 * Styles for toggle visibility and animations
 */

export const TOGGLE_STYLES = `
/* Core toggle visibility transitions */
[data-cv-toggle], [data-customviews-toggle], cv-toggle {
  transition: opacity 150ms ease,
              transform 150ms ease,
              max-height 200ms ease,
              margin 150ms ease;
  will-change: opacity, transform, max-height, margin;
}

.cv-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
  max-height: var(--cv-max-height, 9999px) !important;
}

.cv-hidden {
  opacity: 0 !important;
  transform: translateY(-4px) !important;
  pointer-events: none !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-top-width: 0 !important;
  border-bottom-width: 0 !important;
  max-height: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  overflow: hidden !important;
}

.cv-peek {
  display: block !important;
  max-height: 70px !important;
  overflow: hidden !important;
  opacity: 0.7 !important;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}
  position: relative;
}

.cv-expand-btn {
  /* Position relative to flow, but pulled up to overlap the fuzzy edge */
  display: flex;
  margin: -24px auto 4px auto; /* Negative top margin pulls it up */
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  align-items: center;
  justify-content: center;
  color: #333;
  width: fit-content;
}

.cv-expand-btn:hover {
  background: #f0f0f0;
  color: #000;
}
`;
