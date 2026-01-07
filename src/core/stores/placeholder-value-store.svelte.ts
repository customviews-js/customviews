const STORAGE_KEY = 'cv-user-variables';

export class PlaceholderValueStore {
  values = $state<Record<string, string>>({});

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.values = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[CustomViews] Failed to load user variables:', e);
    }
  }

  public persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values));
    } catch (e) {
      console.warn('[CustomViews] Failed to save user variables:', e);
    }
  }

  getValue(name: string): string | undefined {
    return this.values[name];
  }

  set(name: string, value: string) {
    this.values[name] = value;
  }
}

export const placeholderValueStore = new PlaceholderValueStore();
