/**
 * Custom Elements for Tab Groups and Tabs
 */

/**
 * <cv-tab> element - represents a single tab panel
 */
class CVTab extends HTMLElement {
  connectedCallback() {
    // Element is managed by TabManager
  }
}

/**
 * <cv-tabgroup> element - represents a group of tabs
 */
class CVTabgroup extends HTMLElement {
  connectedCallback() {
    // Element is managed by TabManager
    // Emit ready event after a brief delay to ensure children are parsed
    setTimeout(() => {
      const event = new CustomEvent('cv:tabgroup-ready', {
        bubbles: true,
        detail: { groupId: this.getAttribute('id') }
      });
      this.dispatchEvent(event);
    }, 0);
  }
}

/**
 * <cv-toggle> element - represents a toggleable content block
 */
class CVToggle extends HTMLElement {
  connectedCallback() {
    // Element is managed by Core
  }
}

/**
 * <cv-tab-header> element - represents tab header with rich HTML formatting
 * Content is extracted and used in the navigation link
 */
class CVTabHeader extends HTMLElement {
  connectedCallback() {
    // Element is a semantic container; TabManager extracts its content
  }
}

/**
 * <cv-tab-body> element - represents tab body content
 * Semantic container for tab panel content
 */
class CVTabBody extends HTMLElement {
  connectedCallback() {
    // Element is a semantic container; visibility managed by TabManager
  }
}

/**
 * Register custom elements
 */
export function registerCustomElements(): void {
  // Only register if not already defined
  if (!customElements.get('cv-tab')) {
    customElements.define('cv-tab', CVTab);
  }
  
  if (!customElements.get('cv-tabgroup')) {
    customElements.define('cv-tabgroup', CVTabgroup);
  }

  if (!customElements.get('cv-toggle')) {
    customElements.define('cv-toggle', CVToggle);
  }

  if (!customElements.get('cv-tab-header')) {
    customElements.define('cv-tab-header', CVTabHeader);
  }

  if (!customElements.get('cv-tab-body')) {
    customElements.define('cv-tab-body', CVTabBody);
  }
}
