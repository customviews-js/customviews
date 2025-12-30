import '../components/elements/Toggle.svelte';

/**
 * `<cv-tab>`: A custom element representing a single tab panel within a tab group.
 * Its content is displayed when the corresponding tab is active.
 */
class CVTab extends HTMLElement {
  connectedCallback() {
    // Element is managed by TabManager
  }
}

/**
 * `<cv-tabgroup>`: A custom element that encapsulates a set of tabs (`<cv-tab>`).
 * It manages the tab navigation and content visibility for the group.
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
 * `<cv-tab-header>`: A semantic container for a tab's header content.
 * The content of this element is used to create the navigation link for the tab.
 */
class CVTabHeader extends HTMLElement {
  connectedCallback() {
    // Element is a semantic container; TabManager extracts its content
  }
}

/**
 * `<cv-tab-body>`: A semantic container for the main content of a tab panel.
 */
class CVTabBody extends HTMLElement {
  connectedCallback() {
    // Element is a semantic container; visibility managed by TabManager
  }
}

/**
 * Registers all CustomViews custom elements with the CustomElementRegistry.
 */
export function registerCustomElements(): void {
  // Only register if not already defined
  if (!customElements.get('cv-tab')) {
    customElements.define('cv-tab', CVTab);
  }

  if (!customElements.get('cv-tabgroup')) {
    customElements.define('cv-tabgroup', CVTabgroup);
  }

  // cv-toggle is registered by the imported Svelte component.

  if (!customElements.get('cv-tab-header')) {
    customElements.define('cv-tab-header', CVTabHeader);
  }

  if (!customElements.get('cv-tab-body')) {
    customElements.define('cv-tab-body', CVTabBody);
  }
}
