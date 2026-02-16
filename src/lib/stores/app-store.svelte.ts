import type { Config, ConfigFile } from '$lib/types/index';
import type { AssetsManager } from '../assets';
import { SiteConfigStore } from './site-config-store.svelte';
import { UserPreferencesStore } from './user-preferences-store.svelte';
import { InterfaceSettingsStore } from './interface-settings-store.svelte';
import { DetectedComponentsRegistryStore } from './detected-components-registry-store.svelte';
import { PlaceholderSync } from '$features/placeholder/placeholder-sync.svelte';

/**
 * App Store
 * The root container that composes all sub-stores.
 */
export class AppStore {
  siteConfig!: SiteConfigStore;
  userPreferences!: UserPreferencesStore;
  interfaceSettings = new InterfaceSettingsStore();
  registry = new DetectedComponentsRegistryStore();
  placeholderSync: PlaceholderSync;

  assetsManager = $state<AssetsManager | undefined>(undefined);

  constructor(initialConfig: Config = {}) {
    this.siteConfig = new SiteConfigStore(initialConfig);
    // UserPreferences needs access to config for defaults
    this.userPreferences = new UserPreferencesStore(() => this.siteConfig.config);
    
    this.placeholderSync = new PlaceholderSync(this);
  }

  // --- Derived State (Cross-Store Logic) ---



  // --- Actions ---

  init(configFile: ConfigFile) {
    const config = configFile.config || {};
    const settings = configFile.settings?.panel || {};

    this.siteConfig.setConfig(config);

    // Re-compute defaults and reset state
    this.userPreferences.reset();

    // Apply UI Settings
    this.interfaceSettings.updateOptions({
      ...(settings.showTabGroups !== undefined && { showTabGroups: settings.showTabGroups }),
      ...(settings.showReset !== undefined && { showReset: settings.showReset }),
      ...(settings.title !== undefined && { title: settings.title }),
      ...(settings.description !== undefined && { description: settings.description }),
    });

    this.interfaceSettings.updateOptions({
      ...(settings.showTabGroups !== undefined && { showTabGroups: settings.showTabGroups }),
      ...(settings.showReset !== undefined && { showReset: settings.showReset }),
      ...(settings.title !== undefined && { title: settings.title }),
      ...(settings.description !== undefined && { description: settings.description }),
    });

    // Initialize/Sync Placeholders
    this.placeholderSync.init();
  }

  setAssetsManager(manager: AssetsManager) {
    this.assetsManager = manager;
  }


  
  // Wrapped setPinnedTab to include the side effect
  setPinnedTab(groupId: string, tabId: string) {
      this.userPreferences.setPinnedTab(groupId, tabId);
      this.placeholderSync.onTabChanged(groupId, tabId);
  }

  reset() {
      this.userPreferences.reset();
      this.interfaceSettings.reset();
  }

  // --- Internal ---


}
