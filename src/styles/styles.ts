import { TOGGLE_STYLES } from './toggle-styles';

/**
 * Combined core styles for toggles and tabs
 */
const CORE_STYLES = `
${TOGGLE_STYLES}
`;

/**
 * Add styles for hiding and showing toggles animations and transitions to the document head
 */
export function injectCoreStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector('#cv-core-styles')) return;
  const style = document.createElement('style');
  style.id = 'cv-core-styles';
  style.textContent = CORE_STYLES;
  document.head.appendChild(style);
}

// Export individual style modules for flexibility
export { TOGGLE_STYLES } from './toggle-styles';


