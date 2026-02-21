/**
 * Represents a specific state of a custom view.
 */
export interface State {
  /** List of toggle categories that should be fully displayed ("Show" state) */
  shownToggles?: string[];
  /** List of toggle categories that should be in preview mode ("Peek" state) */
  peekToggles?: string[];
  /** List of toggle categories that should be explicitly hidden ("Hide" state) */
  hiddenToggles?: string[];
  /** Tab selections: groupId -> tabId */
  tabs?: Record<string, string>;
  /** Placeholder values: key -> value */
  placeholders?: Record<string, string>;
}
