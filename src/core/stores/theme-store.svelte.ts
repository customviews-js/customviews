
export type ThemeMode = 'auto' | 'light' | 'dark';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark';
}

export class ThemeStore {
  mode = $state<ThemeMode>('light'); // Default to light
  systemIsDark = $state(false);

  constructor() {
    // Initialize system preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemIsDark = mediaQuery.matches;
    }
  }

  listen() {
    // Auto feature disabled for now
    /*
    if (typeof window === 'undefined') return () => {};
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Update initial state just in case
    this.systemIsDark = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      this.systemIsDark = e.matches;
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
    */
    return () => {};
  }

  init() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('cv-theme-pref');
        if (isThemeMode(saved)) {
            this.mode = saved;
        }
    }
  }

  setMode(newMode: ThemeMode) {
    this.mode = newMode;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cv-theme-pref', newMode);
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
