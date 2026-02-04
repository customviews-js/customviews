// Global runtime extensions for browser `window` used by CustomViews.
// Keep this file minimal and focused so it can live safely in src/types.
declare global {
  interface Window {
    /** Whether auto-init has completed successfully */
    __customViewsInitialized?: boolean;
    /** Guard for an initialization already in progress to avoid races */
    __customViewsInitInProgress?: boolean;
  }
}

export {};
