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

.cv-wrapper {
  position: relative;
  width: 100%;
  display: block;
  margin-bottom: 24px; /* Space for the button */
}

.cv-expand-btn {
  position: absolute;
  bottom: -28px; /* Mostly outside, slight overlap */
  left: 50%;
  transform: translateX(-50%);
  display: flex !important;
  background: transparent;
  border: none;
  border-radius: 50%;
  padding: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 100;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: all 0.2s ease;
  box-shadow: none;
}

.cv-expand-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
  transform: translateX(-50%) scale(1.1);
}

.cv-expand-btn svg {
  display: block;
  opacity: 0.6;
}

.cv-expand-btn:hover svg {
  opacity: 1;
}

.cv-expand-btn:hover svg {
  opacity: 1;
}
`;
