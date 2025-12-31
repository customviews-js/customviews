/**
 * Interface for the <cv-tabgroup> custom element.
 * Has both HTMLElement and the Svelte component props.
 */
export interface TabGroupElement extends HTMLElement {
  activeTabId?: string;
  isTabGroupNavHeadingVisible?: boolean;
  pinnedTabId?: string;
  hasTab: (tabId: string) => boolean;

  // Add any properties that are not exported props but present on the element or needed by Core
  _listenersAttached?: boolean;
}
