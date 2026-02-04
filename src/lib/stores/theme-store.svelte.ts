import type { PersistenceManager } from '../state/persistence';
export type ThemeMode = 'auto' | 'light' | 'dark';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark';
}

export class ThemeStore {
  mode = $state<ThemeMode>('light'); // Default to light
  systemIsDark = $state(false);
  private persistence?: PersistenceManager;

  constructor() {
    // Initialize system preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemIsDark = mediaQuery.matches;
    }
  }

  init(persistence: PersistenceManager) {
    this.persistence = persistence;
    const saved = this.persistence.getItem('cv-theme-pref');
    if (isThemeMode(saved)) {
      this.mode = saved;
    }
  }

  setMode(newMode: ThemeMode) {
    this.mode = newMode;
    if (this.persistence) {
      this.persistence.setItem('cv-theme-pref', newMode);
    }
  }

  currentTheme = $derived.by(() => {
    if (this.mode === 'auto') {
      return this.systemIsDark ? 'dark' : 'light';
    }
    return this.mode;
  });
}

export const themeStore = new ThemeStore();
