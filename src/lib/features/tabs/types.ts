/**
 * Configuration for a single tab within a tab group
 */
export interface TabConfig {
  /** Tab identifier */
  tabId: string;
  /** Display label for the tab */
  label?: string;
  /** Value to set the placeholder to when this tab is active */
  placeholderValue?: string;
}

/**
 * Configuration for a tab group
 */
export interface TabGroupConfig {
  /** Group identifier (stable across the page) */
  groupId: string;
  /** Display name for widget/nav */
  label?: string;
  /** ID of the placeholder variable to bind this group's selection to */
  placeholderId?: string;
  /** Available tabs in this group */
  tabs: TabConfig[];
  /** Determines if the tab group is only shown on pages where it's used. */
  isLocal?: boolean;
  /** Optional description to display below label */
  description?: string;
  /** Default tab ID to select */
  default?: string;
}
