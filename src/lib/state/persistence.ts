import type { State } from "$lib/types/index";

/**
 * Manages persistence of custom views state using browser localStorage
 */
export class PersistenceManager {
  // Storage keys for localStorage
  private prefix: string;

  constructor(storageKey?: string) {
    this.prefix = storageKey ? `${storageKey}-` : '';
  }

  /**
   * Check if localStorage is available in the current environment
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && window.localStorage !== undefined;
  }

  /**
   * Generic set item with prefix
   */
  public setItem(key: string, value: string): void {
    if (!this.isStorageAvailable()) return;
    try {
      localStorage.setItem(this.getPrefixedKey(key), value);
    } catch (error) {
      console.warn(`Failed to persist key ${key}:`, error);
    }
  }

  /**
   * Generic get item with prefix
   * Keys are automatically prefixed with user specified storageKey
   */
  public getItem(key: string): string | null {
    if (!this.isStorageAvailable()) return null;
    try {
      return localStorage.getItem(this.getPrefixedKey(key));
    } catch (error) {
      console.warn(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  /**
   * Generic remove item with prefix
   * Keys are automatically prefixed with user specified storageKey
   */
  public removeItem(key: string): void {
     if (!this.isStorageAvailable()) return;
     try {
       localStorage.removeItem(this.getPrefixedKey(key));
     } catch (error) {
       console.warn(`Failed to remove key ${key}:`, error);
     }
  }

  private getPrefixedKey(key: string): string {
      return this.prefix + key;
  }

  // --- Type-Safe State Accessors (Wrappers around generic storage) ---

  public persistState(state: State): void {
    this.setItem('customviews-state', JSON.stringify(state));
  }

  public getPersistedState(): State | null {
    const raw = this.getItem('customviews-state');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse persisted state:", e);
      return null;
    }
  }

  public clearAll(): void {
    this.removeItem('customviews-state');
    this.removeItem('cv-tab-navs-visible');
  }

  public persistTabNavVisibility(visible: boolean): void {
    this.setItem('cv-tab-navs-visible', visible ? 'true' : 'false');
  }

  public getPersistedTabNavVisibility(): boolean | null {
    const raw = this.getItem('cv-tab-navs-visible');
    return raw === null ? null : raw === 'true';
  }

  public hasPersistedData(): boolean {
    return !!this.getPersistedState();
  }
}
