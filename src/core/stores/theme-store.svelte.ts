
export type ThemeMode = 'auto' | 'light' | 'dark';

export class ThemeStore {
  mode = $state<ThemeMode>('auto');
  systemIsDark = $state(false);

  constructor() {
    // Initialize system preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemIsDark = mediaQuery.matches;

      // Listener for system changes
      mediaQuery.addEventListener('change', (e) => {
        this.systemIsDark = e.matches;
      });
    }
  }

  init() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('cv-theme-pref') as ThemeMode | null;
        if (saved && ['auto', 'light', 'dark'].includes(saved)) {
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
