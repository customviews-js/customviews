import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
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
 * Each ID is individually encoded with `encodeURIComponent` so that any commas
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

/**
 * Parses `key:value` pairs from a raw comma-delimited list into a Record.
 * Entries without a colon, or with empty keys, are silently dropped.
 */
function decodePairs(search: string, paramName: string): Record<string, string> {
  const pairs = splitAndDecode(search, paramName);
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx > 0) {
      const key = pair.slice(0, colonIdx);
      const value = pair.slice(colonIdx + 1);
      if (key) result[key] = value;
    }
  }
  return result;
}

// --- URL Parsing ---

/**
 * Parses toggle visibility state from the current URL search string.
 * Returns partial state containing only the toggle fields that are present.
 */
function parseTogglesFromSearch(search: string): Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> {
  const partial: Pick<State, 'shownToggles' | 'peekToggles' | 'hiddenToggles'> = {};

  const showIds = splitAndDecode(search, PARAM_SHOW_TOGGLE);
  if (showIds.length > 0) partial.shownToggles = showIds;

  const peekIds = splitAndDecode(search, PARAM_PEEK_TOGGLE);
  if (peekIds.length > 0) partial.peekToggles = peekIds;

  const hideIds = splitAndDecode(search, PARAM_HIDE_TOGGLE);
  if (hideIds.length > 0) partial.hiddenToggles = hideIds;

  return partial;
}

/**
 * Parses tab group selections from the current URL search string.
 * Returns partial state containing the `tabs` record, or empty object if absent.
 */
function parseTabsFromSearch(search: string): Pick<State, 'tabs'> {
  const tabs = decodePairs(search, PARAM_TABS);
  return Object.keys(tabs).length > 0 ? { tabs } : {};
}

/**
 * Parses placeholder values from the current URL search string.
 * Returns partial state containing the `placeholders` record, or empty object if absent.
 */
function parsePlaceholdersFromSearch(search: string): Pick<State, 'placeholders'> {
  const placeholders = decodePairs(search, PARAM_PH);
  return Object.keys(placeholders).length > 0 ? { placeholders } : {};
}

// --- URL Generation ---

/**
 * Builds the query string fragment for the managed URL parameters from a state object.
 *
 * We construct this string manually (instead of using `URLSearchParams.set()`)
 * to avoid double-encoding. `URLSearchParams.set()` would encode our already-encoded
 * values a second time (e.g. `%2C` → `%252C`), requiring a hacky decode step.
 *
 * By building the string directly, each value is encoded exactly once,
 * and structural separators (`,` `:`) remain as literal characters in the URL.
 */
function buildManagedSearch(state: State): string {
  const parts: string[] = [];

  if (state.shownToggles && state.shownToggles.length > 0) {
    parts.push(`${PARAM_SHOW_TOGGLE}=${encodeList(state.shownToggles)}`);
  }
  if (state.peekToggles && state.peekToggles.length > 0) {
    parts.push(`${PARAM_PEEK_TOGGLE}=${encodeList(state.peekToggles)}`);
  }
  if (state.hiddenToggles && state.hiddenToggles.length > 0) {
    parts.push(`${PARAM_HIDE_TOGGLE}=${encodeList(state.hiddenToggles)}`);
  }
  if (state.tabs && Object.keys(state.tabs).length > 0) {
    parts.push(`${PARAM_TABS}=${encodePairs(state.tabs)}`);
  }
  if (state.placeholders && Object.keys(state.placeholders).length > 0) {
    parts.push(`${PARAM_PH}=${encodePairs(state.placeholders)}`);
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
 * Strips placeholder entries whose value is derived from a tab group (source: 'tabgroup').
 *
 * These placeholders should NOT be encoded in the shared URL because their value
 * is already implied by the `?tabs=` param. Encoding both would create two sources
 * of truth and risk drift when decoded on the recipient's side.
 */
function stripTabDerivedPlaceholders(placeholders: Record<string, string>): Record<string, string> {
  const shareable: Record<string, string> = {};

  for (const [key, value] of Object.entries(placeholders)) {
    const definition = placeholderRegistryStore.get(key);
    if (definition?.source === 'tabgroup') {
      // Omit — the tab selection in ?tabs= is the source of truth for this placeholder.
      continue;
    }
    shareable[key] = value;
  }

  return shareable;
}

/**
 * Computes a full absolute state for sharing from the current application state.
 *
 * Every toggle known to the page is explicitly encoded as shown, peeked, or hidden,
 * so the recipient's view exactly matches the sender's regardless of their local settings.
 *
 * Tab-group-derived placeholders are omitted — the `?tabs=` param is their source of truth.
 *
 * @param currentState The current application state.
 * @param allToggleIds All toggle IDs registered on the page (from elementStore).
 */
function computeShareableState(currentState: State, allToggleIds: string[]): State {
  const currentShown = currentState.shownToggles ?? [];
  const currentPeek  = currentState.peekToggles  ?? [];

  const shownSet = new Set(currentShown);
  const peekSet  = new Set(currentPeek);

  // Every known toggle that isn't shown or peeked must be explicitly hidden.
  const absoluteHide = allToggleIds.filter((id) => !shownSet.has(id) && !peekSet.has(id));

  const shareable: State = {};

  if (currentShown.length > 0) shareable.shownToggles = currentShown;
  if (currentPeek.length  > 0) shareable.peekToggles  = currentPeek;
  if (absoluteHide.length > 0) shareable.hiddenToggles = absoluteHide;

  if (currentState.tabs && Object.keys(currentState.tabs).length > 0) {
    shareable.tabs = currentState.tabs;
  }

  if (currentState.placeholders) {
    const shareablePlaceholders = stripTabDerivedPlaceholders(currentState.placeholders);
    if (Object.keys(shareablePlaceholders).length > 0) {
      shareable.placeholders = shareablePlaceholders;
    }
  }

  return shareable;
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
 * Precedence model (applied by ActiveStateStore, not here):
 * - Persisted state is loaded first as a base.
 * - URL parameters act as a sparse override on top of persisted state.
 *   Only toggles/tabs/placeholders mentioned in the URL are affected.
 * - Tab-group-derived placeholders are always re-derived from the active tab,
 *   so the `?tabs=` param is the sole source of truth for those values.
 *
 * `parseURL` is used on page load to read inbound link state.
 * `generateShareableURL` is used to produce a link for the clipboard.
 *
 * Focus params (cv-show, cv-hide, cv-highlight) remain owned by FocusService.
 */
export class URLStateManager {
  /**
   * Parses the current page URL into a sparse delta state object.
   * Only fields present in the URL are populated; the rest are omitted.
   * Returns null if none of the managed parameters are present.
   */
  public static parseURL(): State | null {
    const urlParams = new URLSearchParams(window.location.search);

    const hasAny = MANAGED_PARAMS.some((p) => urlParams.has(p));
    if (!hasAny) return null;

    const search = window.location.search;

    return {
      ...parseTogglesFromSearch(search),
      ...parseTabsFromSearch(search),
      ...parsePlaceholdersFromSearch(search),
    };
  }

  /**
   * Generates a shareable URL that encodes the full current state.
   *
   * Encodes every toggle on the page explicitly (shown, peeked, or hidden)
   * so the recipient sees the exact same view regardless of their local settings.
   *
   * Tab-group-derived placeholders are omitted from the URL — they are implied
   * by the `?tabs=` parameter and will be re-derived by the recipient's store.
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
      const shareable = computeShareableState(currentState, allToggleIds);
      managedSearch = buildManagedSearch(shareable);
    }

    return buildFullUrl(url, managedSearch);
  }

  /**
   * Clears all managed parameters from the current browser URL.
   * This is called after parsing so that shared configurations don't stick around in
   * the address bar when the user subsequently interacts with the page or refreshes.
   */
  public static clearURL(): void {
    if (typeof window === 'undefined' || !window.history) return;

    const url = new URL(window.location.href);
    let hasChanges = false;

    for (const param of MANAGED_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      window.history.replaceState({}, '', url.toString());
    }
  }
}

// Export for use in tests that verify focus params are preserved
export { FOCUS_PARAMS, MANAGED_PARAMS };
