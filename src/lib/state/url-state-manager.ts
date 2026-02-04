import type { State } from '$lib/types/index';

/**
 * URL State Manager for CustomViews
 * Handles encoding/decoding of states in URL parameters
 */
export class URLStateManager {
  /**
   * Parse current URL parameters into state object
   */
  public static parseURL(): State | null {
    const urlParams = new URLSearchParams(window.location.search);

    // Get view state
    const viewParam = urlParams.get('view');
    let decoded: State | null = null;
    if (viewParam) {
      try {
        decoded = this.decodeState(viewParam);
      } catch (error) {
        console.warn('Failed to decode view state from URL:', error);
      }
    }

    return decoded;
  }

  /**
   * Update URL with current state without triggering navigation
   */
  public static updateURL(state: State | null | undefined): void {
    if (typeof window === 'undefined' || !window.history) return;

    const url = new URL(window.location.href);

    // Clear existing parameters
    url.searchParams.delete('view');

    // Set view state
    if (state) {
      const encoded = this.encodeState(state);
      if (encoded) {
        url.searchParams.set('view', encoded);
      }
    }

    // Use a relative URL to satisfy stricter environments (e.g., jsdom tests)
    const relative = url.pathname + (url.search || '') + (url.hash || '');
    window.history.replaceState({}, '', relative);
  }

  /**
   * Clear all state parameters from URL
   */
  public static clearURL(): void {
    this.updateURL(null);
  }

  /**
   * Generate shareable URL for current state
   */
  public static generateShareableURL(state: State | null | undefined): string {
    const url = new URL(window.location.href);

    // Clear existing parameters
    url.searchParams.delete('view');

    // Set new parameters
    if (state) {
      const encoded = this.encodeState(state);
      if (encoded) {
        url.searchParams.set('view', encoded);
      }
    }

    return url.toString();
  }

  /**
   * Encode state into URL-safe string
   *
   * (Covers Toggles, Tabs and Focus currently)
   */
  private static encodeState(state: State): string | null {
    try {
      // Create a compact representation
      const compact: any = {};

      // Add toggles if present and non-empty
      if (state.shownToggles && state.shownToggles.length > 0) {
        compact.t = state.shownToggles;
      }

      // Add peek toggles if present and non-empty
      if (state.peekToggles && state.peekToggles.length > 0) {
        compact.p = state.peekToggles;
      }

      // Add tab groups if present
      if (state.tabs && Object.keys(state.tabs).length > 0) {
        compact.g = Object.entries(state.tabs);
      }

      // Add focus if present
      if (state.focus && state.focus.length > 0) {
        compact.f = state.focus;
      }

      // Convert to JSON and encode
      const json = JSON.stringify(compact);
      let encoded: string;
      if (typeof btoa === 'function') {
        encoded = btoa(json);
      } else {
        // Node/test fallback
        // @ts-ignore
        encoded = Buffer.from(json, 'utf-8').toString('base64');
      }

      // Make URL-safe
      const urlSafeString = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      return urlSafeString;
    } catch (error) {
      console.warn('Failed to encode state:', error);
      return null;
    }
  }

  /**
   * Decode custom state from URL parameter
   *
   * (Covers Toggles, Tabs and Focus currently)
   */
  private static decodeState(encoded: string): State | null {
    try {
      // Restore base64 padding and characters
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }

      // Decode and parse
      let json: string;
      if (typeof atob === 'function') {
        json = atob(base64);
      } else {
        // Node/test fallback
        // @ts-ignore
        json = Buffer.from(base64, 'base64').toString('utf-8');
      }
      const compact = JSON.parse(json);

      // Validate structure
      if (!compact || typeof compact !== 'object') {
        throw new Error('Invalid compact state structure');
      }

      // Reconstruct State from compact format

      // Reconstruct Toggles
      const state: State = {
        shownToggles: Array.isArray(compact.t) ? compact.t : [],
        peekToggles: Array.isArray(compact.p) ? compact.p : [],
      };

      // Reconstruct Tabs
      if (Array.isArray(compact.g)) {
        state.tabs = {};
        for (const [groupId, tabId] of compact.g) {
          if (typeof groupId === 'string' && typeof tabId === 'string') {
            state.tabs[groupId] = tabId;
          }
        }
      }

      // Reconstruct Focus
      if (Array.isArray(compact.f)) {
        state.focus = compact.f;
      }

      return state;
    } catch (error) {
      console.warn('Failed to decode view state:', error);
      return null;
    }
  }
}
