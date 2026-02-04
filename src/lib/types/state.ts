export type ToggleId = string;

/**
 * Represents a specific state of a custom view.
 * States contain the list of toggle categories that should be displayed in this state.
 */
export interface State {
  /** List of toggle categories that should be fully displayed ("Show" state) */
  shownToggles?: ToggleId[];
  /** List of toggle categories that should be in preview mode ("Peek" state) */
  peekToggles?: ToggleId[];
  /** Optional tab selections: groupId -> tabId */
  tabs?: Record<string, string>;
  /** Optional focus selections: array of element IDs */
  focus?: string[];
}
