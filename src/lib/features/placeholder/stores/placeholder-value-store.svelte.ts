import type { PersistenceManager } from '$lib/state/persistence';

const STORAGE_KEY_BASE = 'cv-user-variables';

export class PlaceholderValueStore {
  values = $state<Record<string, string>>({});
  private persistence?: PersistenceManager;

  constructor() {
    // Lazy load
  }

  public init(persistence: PersistenceManager) {
    this.persistence = persistence;
    this.loadSavedPlaceholderValues();
  }

  private loadSavedPlaceholderValues() {
    if (!this.persistence) return;

    const stored = this.persistence.getItem(STORAGE_KEY_BASE);
    if (stored) {
      try {
        this.values = JSON.parse(stored);
      } catch (e) {
        console.warn('[CustomViews] Failed to parse user variables:', e);
      }
    }
  }

  getValue(name: string): string | undefined {
    return this.values[name];
  }

  set(name: string, value: string) {
    this.values[name] = value;
    this.persistValue();
  }

  public persistValue() {
    if (!this.persistence) return;
    this.persistence.setItem(STORAGE_KEY_BASE, JSON.stringify(this.values));
  }

  public reset() {
    this.values = {};
    this.persistValue();
  }
}

export const placeholderValueStore = new PlaceholderValueStore();
