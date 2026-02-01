import type { State } from "../../types/index";

/**
 * Manages persistence of custom views state using browser localStorage
 */
export class PersistenceManager {
  // Storage keys for localStorage
  private static readonly STORAGE_KEYS = {
    STATE: 'customviews-state',
    TAB_NAV_VISIBILITY: 'cv-tab-navs-visible'
  } as const;

  /**
   * Check if localStorage is available in the current environment
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && window.localStorage !== undefined;
  }

  
  public persistState(state: State): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(PersistenceManager.STORAGE_KEYS.STATE, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  
  public getPersistedState(): State | null {
    if (!this.isStorageAvailable()) return null;
    try {
      const raw = localStorage.getItem(PersistenceManager.STORAGE_KEYS.STATE);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to parse persisted state:', error);
      return null;
    }
  }

 
  /**
   * Clear persisted state
   */
  public clearAll(): void {
    if (!this.isStorageAvailable()) return;

    localStorage.removeItem(PersistenceManager.STORAGE_KEYS.STATE);
    localStorage.removeItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY);
  }

  /**
   * Persist tab nav visibility preference
   */
  public persistTabNavVisibility(visible: boolean): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY, visible ? 'true' : 'false');
    } catch (error) {
      console.warn('Failed to persist tab nav visibility:', error);
    }
  }

  /**
   * Get persisted tab nav visibility preference
   */
  public getPersistedTabNavVisibility(): boolean | null {
    if (!this.isStorageAvailable()) return null;
    try {
      const raw = localStorage.getItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY);
      return raw === null ? null : raw === 'true';
    } catch (error) {
      console.warn('Failed to get persisted tab nav visibility:', error);
      return null;
    }
  }

  /**
   * Check if any persistence data exists
   */
  public hasPersistedData(): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }
    return !!this.getPersistedState();
  }

}
