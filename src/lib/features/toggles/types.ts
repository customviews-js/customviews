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
