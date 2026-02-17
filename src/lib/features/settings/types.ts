/**
 * Configuration for the settings widget panel.
 */
export interface WidgetPanelConfig {
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
}

/**
 * Configuration for the widget callout message.
 */
export interface WidgetCalloutConfig {
  /** Whether to show the callout (default: false) */
  show?: boolean;
  /** Message to display in the callout */
  message?: string;
  /** Whether to enable pulse animation */
  enablePulse?: boolean;
  /** Custom background color */
  backgroundColor?: string | undefined;
  /** Custom text color */
  textColor?: string | undefined;
}

/**
 * Configuration for the widget icon appearance.
 */
export interface WidgetIconConfig {
  /** Widget position */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'middle-left'
    | 'middle-right';
  /** Custom icon color */
  color?: string | undefined;
  /** Custom background color */
  backgroundColor?: string | undefined;
  /** Custom opacity (0-1) */
  opacity?: number | undefined;
  /** Custom scale factor */
  scale?: number;
  /** Whether to show the icon (default: true) */
  show?: boolean;
}

/**
 * Top-level settings for the widget.
 */
export interface WidgetSettings {
  /** Whether the settings widget is enabled */
  enabled?: boolean;
  /** Settings panel configuration */
  panel?: WidgetPanelConfig;
  /** Callout configuration options */
  callout?: WidgetCalloutConfig;
  /** Custom icon styling options */
  icon?: WidgetIconConfig;
}
