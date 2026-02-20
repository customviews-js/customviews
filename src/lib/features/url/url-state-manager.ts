import type { State } from '$lib/types/index';

const PARAM_SHOW_TOGGLE = 't-show';
const PARAM_PEEK_TOGGLE = 't-peek';
const PARAM_HIDE_TOGGLE = 't-hide';
const PARAM_TABS = 'tabs';
const PARAM_PH = 'ph';

/** Parameters owned by FocusService — never touched by URLStateManager */
const FOCUS_PARAMS = ['cv-show', 'cv-hide', 'cv-highlight'];
const MANAGED_PARAMS = [PARAM_SHOW_TOGGLE, PARAM_PEEK_TOGGLE, PARAM_HIDE_TOGGLE, PARAM_TABS, PARAM_PH];

/**
 * Encodes a list of IDs into a comma-separated query-safe string.
 *
 * Each ID individually encoded with `encodeURIComponent` so that any commas
 * or special characters *within* an ID are escaped (e.g. `%2C`).
 */
function encodeList(items: string[]): string {
  return items.map(encodeURIComponent).join(',');
}

/**
 * Encodes key:value pairs into a comma-separated query-safe string.
 *
 * Keys and values are individually encoded so that the structural separators
 * (`:` between key/value, `,` between pairs) remain unambiguous.
 */
function encodePairs(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}:${encodeURIComponent(v)}`)
    .join(',');
}

/**
 * Extracts the raw (un-decoded) value of a query parameter from a search string.
 *
 * We avoid `URLSearchParams.get()` here because it decodes the entire value,
 * converting our content-level `%2C` back into literal commas and making them
 * indistinguishable from the structural commas that separate list items.
 */
function getRawParam(search: string, paramName: string): string | null {
  const escaped = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`[?&]${escaped}=([^&]*)`).exec(search);
  return match?.[1] ?? null;
}

/**
 * Splits a raw query parameter value by structural commas and decodes each item.
 *
 * Because values were encoded with `encodeURIComponent` before joining with `,`,
 * splitting on literal commas is safe — any commas inside values appear as `%2C`.
 */
function splitAndDecode(search: string, paramName: string): string[] {
  const raw = getRawParam(search, paramName);
  if (!raw) return [];

  return raw
    .split(',')
    .map((item) => {
      try {
        // application/x-www-form-urlencoded often uses + for spaces
        return decodeURIComponent(item.replace(/\+/g, '%20'));
      } catch {
        console.warn(`URLStateManager: Failed to decode ${paramName} item: ${item}`);
        return item;
      }
    })
    .filter(Boolean);
}

// --- Query String Construction ---

/**
 * Builds the query string fragment for managed parameters from a diff state.
 *
 * We construct this string manually (instead of using `URLSearchParams.set()`)
 * to avoid double-encoding. `URLSearchParams.set()` would encode our already-encoded
 * values a second time (e.g. `%2C` → `%252C`), requiring a hacky decode step.
 *
 * By building the string directly, each value is encoded exactly once,
 * and structural separators (`,` `:`) remain as literal characters.
 */
function buildManagedSearch(diff: State): string {
  const parts: string[] = [];

  if (diff.shownToggles && diff.shownToggles.length > 0) {
    parts.push(`${PARAM_SHOW_TOGGLE}=${encodeList(diff.shownToggles)}`);
  }

  if (diff.peekToggles && diff.peekToggles.length > 0) {
    parts.push(`${PARAM_PEEK_TOGGLE}=${encodeList(diff.peekToggles)}`);
  }

  if (diff.hiddenToggles && diff.hiddenToggles.length > 0) {
    parts.push(`${PARAM_HIDE_TOGGLE}=${encodeList(diff.hiddenToggles)}`);
  }

  if (diff.tabs && Object.keys(diff.tabs).length > 0) {
    parts.push(`${PARAM_TABS}=${encodePairs(diff.tabs)}`);
  }

  if (diff.placeholders && Object.keys(diff.placeholders).length > 0) {
    parts.push(`${PARAM_PH}=${encodePairs(diff.placeholders)}`);
  }

  return parts.join('&');
}

/**
 * Builds a full absolute URL string from the base URL and managed params.
 */
function buildFullUrl(url: URL, managedSearch: string): string {
  const preservedSearch = url.searchParams.toString();
  const search = [preservedSearch, managedSearch].filter(Boolean).join('&');
  return url.origin + url.pathname + (search ? `?${search}` : '') + (url.hash || '');
}

/**
 * Computes a full state representation for sharing.
 * Every toggle known to the page is explicitly encoded as shown, peeked, or hidden,
 * so the recipient's view exactly matches the sender's regardless of their local settings.
 *
 * @param currentState The current application state.
 * @param allToggleIds All toggle IDs registered on the page (from elementStore).
 */
function computeAbsoluteState(currentState: State, allToggleIds: string[]): State {
  const currentShown = currentState.shownToggles ?? [];
  const currentPeek  = currentState.peekToggles  ?? [];

  const shownSet = new Set(currentShown);
  const peekSet  = new Set(currentPeek);

  // Every known toggle that isn't shown or peeked must be explicitly hidden.
  const absoluteHide = allToggleIds.filter((id) => !shownSet.has(id) && !peekSet.has(id));

  const absolute: State = {};

  if (currentShown.length > 0) absolute.shownToggles = currentShown;
  if (currentPeek.length  > 0) absolute.peekToggles  = currentPeek;
  if (absoluteHide.length > 0) absolute.hiddenToggles = absoluteHide;
  if (currentState.tabs && Object.keys(currentState.tabs).length > 0) absolute.tabs = currentState.tabs;
  if (currentState.placeholders) absolute.placeholders = currentState.placeholders;

  return absolute;
}

// --- URL State Manager ---

/**
 * URL State Manager for CustomViews.
 * Handles encoding/decoding of view states as human-readable URL parameters.
 *
 * URL Schema:
 *   ?t-show=A,B        — toggle IDs to explicitly show
 *   ?t-peek=C          — toggle IDs to explicitly peek
 *   ?t-hide=D          — toggle IDs to explicitly hide
 *   ?tabs=g1:t1,g2:t2  — tab group selections (groupId:tabId pairs)
 *   ?ph=key:val        — placeholder values (key:encodedValue pairs)
 *
 * `parseURL` is used on page load to apply state from an inbound link.
 * `generateShareableURL` is used to create a link to copy to clipboard.
 *
 * Focus params (cv-show, cv-hide, cv-highlight) remain owned by FocusService.
 */
export class URLStateManager {
  /**
   * Parse current URL parameters into a delta state object.
   * Returns null if none of the managed params are present.
   */
  public static parseURL(): State | null {
    const urlParams = new URLSearchParams(window.location.search);

    const hasAny = MANAGED_PARAMS.some((p) => urlParams.has(p));
    if (!hasAny) return null;

    const state: State = {};
    const search = window.location.search;

    // Parse ?t-show=A,B
    const showIds = splitAndDecode(search, PARAM_SHOW_TOGGLE);
    if (showIds.length > 0) {
      state.shownToggles = showIds;
    }

    // Parse ?t-peek=C
    const peekIds = splitAndDecode(search, PARAM_PEEK_TOGGLE);
    if (peekIds.length > 0) {
      state.peekToggles = peekIds;
    }

    // Parse ?t-hide=D
    const hideIds = splitAndDecode(search, PARAM_HIDE_TOGGLE);
    if (hideIds.length > 0) {
      state.hiddenToggles = hideIds;
    }

    // Parse ?tabs=g1:t1,g2:t2
    const tabsRaw = splitAndDecode(search, PARAM_TABS);
    if (tabsRaw.length > 0) {
      state.tabs = {};
      for (const pair of tabsRaw) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx > 0) {
          const groupId = pair.slice(0, colonIdx);
          const tabId = pair.slice(colonIdx + 1);
          if (groupId && tabId) {
            state.tabs[groupId] = tabId;
          }
        }
      }
    }

    // Parse ?ph=key:value
    const phRaw = splitAndDecode(search, PARAM_PH);
    if (phRaw.length > 0) {
      state.placeholders = {};
      for (const pair of phRaw) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx > 0) {
          const key = pair.slice(0, colonIdx);
          const value = pair.slice(colonIdx + 1);
          if (key) {
            state.placeholders[key] = value;
          }
        }
      }
    }

    return state;
  }

/**
   * Generate a shareable URL for the current state.
   * Encodes every toggle on the page explicitly (shown, peeked, or hidden)
   * so the recipient sees the exact same view regardless of their local settings.
   *
   * @param currentState The full application state to encode.
   * @param allToggleIds All toggle IDs currently registered on the page.
   */
  public static generateShareableURL(
    currentState: State | null | undefined,
    allToggleIds: string[] = [],
  ): string {
    const url = new URL(window.location.href);

    for (const param of MANAGED_PARAMS) {
      url.searchParams.delete(param);
    }

    let managedSearch = '';
    if (currentState) {
      const absolute = computeAbsoluteState(currentState, allToggleIds);
      managedSearch = buildManagedSearch(absolute);
    }

    return buildFullUrl(url, managedSearch);
  }
}

// Export for use in tests that verify focus params are preserved
export { FOCUS_PARAMS, MANAGED_PARAMS };
