import { type Config, type ConfigSectionKey, isValidConfigSection } from '$lib/types/index';

/**
 * Static Config Store
 * Handles the immutable configuration logic.
 */
export class SiteConfigStore {
  /**
   * Static configuration loaded at startup.
   */
  config: Config = $state({});

  /**
   * Explicit order of sections derived from the initial configuration JSON.
   */
  sectionOrder: ConfigSectionKey[] = $state([]);

  constructor(initialConfig: Config = {}) {
    this.setConfig(initialConfig);
  }

  setConfig(config: Config) {
    this.config = config;
    this.sectionOrder = Object.keys(config).filter(isValidConfigSection);
  }
}
