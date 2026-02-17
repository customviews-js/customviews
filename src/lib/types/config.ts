import type { PlaceholderDefinition } from '../features/placeholder/types';
import type { TabGroupConfig } from '../features/tabs/types';
import type { ToggleConfig } from '../features/toggles/types';
import type { ShareExclusions } from '../features/share/types';

/**
 * Configuration for the site, has default state and list of toggles
 */
export interface Config {
  /** All available toggle categories */
  toggles?: ToggleConfig[];
  /** Optional tab group configurations */
  tabGroups?: TabGroupConfig[];
  /** Excluded tags and IDs for Share/Focus modes */
  shareExclusions?: ShareExclusions;
  /** Global placeholder definitions */
  placeholders?: PlaceholderDefinition[];
}

import type { WidgetSettings } from '../features/settings/types';

/**
 * Represents the configuration file structure for CustomViews auto-initialization.
 */
export interface ConfigFile {
  /** Core configuration object with toggles and defaultState */
  config?: Config;
  /** Path to the assets JSON file */
  assetsJsonPath?: string;
  /** Base URL for all paths */
  baseUrl?: string;
  /** Whether to keep the `view` state parameter visible in the browser URL bar */
  showUrl?: boolean;
  /** Optional key to namespace localStorage items for isolation */
  storageKey?: string;
  /** Widget configuration options */
  settings?: WidgetSettings;
}
