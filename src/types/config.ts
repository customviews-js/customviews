
import type { PlaceholderDefinition } from '../core/stores/placeholder-registry-store.svelte';

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

/**
 * Configuration for a single toggle.
 */
export interface ToggleConfig {
  /** Toggle identifier */
  toggleId: string;
  /** Display label for the toggle */
  label?: string;
  /** Determines if the toggle is only shown on pages where it's used. */
  isLocal?: boolean;
  /** Optional description to display below functionality */
  description?: string;
  /** Default state for this toggle: 'show', 'hide', or 'peek' */
  default?: 'show' | 'hide' | 'peek';
}

/**
 * Configuration for the site, has default state and list of toggles
 */
export interface ShareExclusions {
  tags?: string[];
  ids?: string[];
}

/**
 * Configuration for the site, has default state and list of toggles
 */
export interface Config {
  /** All available toggle categories */
  toggles?: ToggleConfig[];
  /** Optional tab group configurations */
  tabGroups?: TabGroupConfig[];
  /** Excluded tags and IDs for Share/Focus modes */
  shareExclusions?: ShareExclusions;
  /** Global placeholder definitions */
  placeholders?: PlaceholderDefinition[];
}

/**
 * Represents the configuration file structure for CustomViews auto-initialization.
 */
export interface ConfigFile {
  /** Core configuration object with toggles and defaultState */
  config?: Config;
  /** Path to the assets JSON file */
  assetsJsonPath?: string;
  /** Base URL for all paths */
  baseUrl?: string;
  /** Whether to keep the `view` state parameter visible in the browser URL bar */
  showUrl?: boolean;

  /** Widget configuration options */
  settings?: {
    /** Whether the settings widget is enabled */
    enabled?: boolean;
    /** Settings panel configuration */
    panel?: {
      /** Widget title */
      title?: string;
      /** Widget description text */
      description?: string;
      /** Whether to show tab groups section in widget (default: true) */
      showTabGroups?: boolean;
      /** Whether to show reset button */
      showReset?: boolean;
      /** Widget theme */
      theme?: 'light' | 'dark';
    };
    /** Callout configuration options */
    callout?: {
      /** Whether to show the callout (default: false) */
      show?: boolean;
      /** Message to display in the callout */
      message?: string;
      /** Whether to enable pulse animation */
      enablePulse?: boolean;
      /** Custom background color */
      backgroundColor?: string;
      /** Custom text color */
      textColor?: string;
    };
    /** Custom icon styling options */
    icon?: {
      /** Widget position */
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right';
      /** Custom icon color */
      color?: string;
      /** Custom background color */
      backgroundColor?: string;
      /** Custom opacity (0-1) */
      opacity?: number;
      /** Custom scale factor */
      scale?: number;
    };
  };
}
