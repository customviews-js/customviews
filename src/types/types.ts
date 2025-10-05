/**
 * Represents an individual asset that can be rendered in a custom view.
 */
export interface CustomViewAsset {
  /** Optional type. If not provided, auto-detected from src/content. */
  type?: 'image' | 'text' | 'html' | string;
  /** Image source URL */
  src?: string;
  /** Alt text for images */
  alt?: string;
  /** Text or HTML content */
  content?: string;
  /** CSS class name(s) to apply */
  className?: string;
  /** Inline CSS styles to apply */
  style?: string;
  [key: string]: any;
}

/**
 * Represents a specific state of a custom view.
 * States contain the list of toggle categories that should be displayed in this state. 
 */
export interface State {
  /** List of toggle categories that should be displayed in this state */
  toggles: ToggleId[];
  /** Optional tab selections: groupId -> tabId */
  tabs?: Record<string, string>;
}

export type ToggleId = string;

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
  /** Default tab id for this group (fallback to first in tabs if omitted) */
  default?: string;
}

/**
 * Represents the configuration file structure for CustomViews auto-initialization.
 */
export interface ConfigFile {
  /** Core configuration object with allToggles and defaultState */
  config?: any;
  /** Path to the assets JSON file */
  assetsJsonPath?: string;
  /** Base URL for all paths */
  baseUrl?: string;
  
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
    /** Welcome modal title */
    welcomeTitle?: string;
    /** Welcome modal message */
    welcomeMessage?: string;
    /** Whether to show tab groups section in widget (default: true) */
    showTabGroups?: boolean;
  };
}

/**
 * Global window interface augmentation for CustomViews
 */
declare global {
  interface Window {
    CustomViews: any;
    CustomViewsWidget: any;
    customViewsInstance?: {
      core: any;
      widget?: any;
    };
  }
}
