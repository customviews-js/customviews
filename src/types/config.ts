import type { State } from './state';

/**
 * Configuration for a single tab within a tab group
 */
export interface TabConfig {
  /** Tab identifier */
  id: string;
  /** Display label for the tab */
  label?: string;
}

/**
 * Configuration for a tab group
 */
export interface TabGroupConfig {
  /** Group identifier (stable across the page) */
  id: string;
  /** Display name for widget/nav */
  label?: string;
  /** Available tabs in this group */
  tabs: TabConfig[];
  /** Determines if the tab group is only shown on pages where it's used. */
  isLocal?: boolean;
}

/**
 * Configuration for a single toggle.
 */
export interface ToggleConfig {
  /** Toggle identifier */
  id: string;
  /** Display label for the toggle */
  label?: string;
  /** Determines if the toggle is only shown on pages where it's used. */
  isLocal?: boolean;
  /** Optional description to display below functionality */
  description?: string;
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
  /** Default state for the site */
  defaultState?: State;
  /** Optional tab group configurations */
  tabGroups?: TabGroupConfig[];
  /** Excluded tags and IDs for Share/Focus modes */
  shareExclusions?: ShareExclusions;
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
  widget?: {
    /** Whether the widget is enabled */
    enabled?: boolean;
    /** Widget position */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right';
    /** Widget theme */
    theme?: 'light' | 'dark';
    /** Whether to show reset button */
    showReset?: boolean;
    /** Widget title */
    title?: string;
    /** Widget description text */
    description?: string;
    /** Whether to show welcome modal on first visit */
    showWelcome?: boolean;
    /** Welcome modal message */
    welcomeMessage?: string;
    /** Whether to show tab groups section in widget (default: true) */
    showTabGroups?: boolean;
  };
}
