import { CustomViews } from "./CustomViews";
import { getScriptAttributes, fetchConfig, initializeWidget } from "./utils/init-utils";
import type { initOptions } from "./CustomViews";


// --- Public API Exports ---
// These will be available on the global `CustomViews` object in the browser
// e.g., window.CustomViews.CustomViewsSettings
export { CustomViewsCore } from "./core/core.svelte";
export type { CustomViewsOptions } from "./core/core.svelte";
export { CustomViewsSettings } from "./core/settings";
export type { SettingsOptions } from "./core/settings";
export { PersistenceManager } from "./core/state/persistence";
export { URLStateManager } from "./core/state/url-state-manager";
export { AssetsManager } from "./core/managers/assets-manager";
export type { Config, ConfigFile } from "./types/types";

// Re-export the main class for manual usage if needed
export { CustomViews };

/**
 * Main initialization function.
 * This is aliased as `CustomViews.init` in the global namespace because it's a named export.
 */
export const init = CustomViews.init;

/**
 * Initialize CustomViews from script tag attributes and config file
 * This runs automatically when the script is loaded.
 */
export function initializeFromScript(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Idempotency check
  if (window.__customViewsInitialized) {
    console.info('[CustomViews] Auto-init skipped: already initialized.');
    return;
  }

  document.addEventListener('DOMContentLoaded', async function() {
    if (window.__customViewsInitInProgress || window.__customViewsInitialized) return;
    window.__customViewsInitInProgress = true;
    
    try {
      // 1. Get attributes from script tag
      const { baseURL, configPath } = getScriptAttributes();

      // 2. Fetch Config
      const configFile = await fetchConfig(configPath, baseURL);

      // Determine effective baseURL (data attribute takes precedence)
      const effectiveBaseURL = baseURL || configFile.baseUrl || '';

      const options: initOptions = {
        baseURL: effectiveBaseURL,
      }
      
      if (configFile.config) {
        options.config = configFile.config;
      }
      
      if (configFile.assetsJsonPath) {
        options.assetsJsonPath = configFile.assetsJsonPath;
      }

      if (configFile.showUrl !== undefined) {
        options.showUrl = configFile.showUrl;
      }

      // 3. Initialize Core
      const core = await CustomViews.init(options);

      if (!core) {
        console.error('[CustomViews] Failed to initialize core.');
        return; 
      }

      // Store instance on the global object for debugging/access
      window.customViewsInstance = { core };

      // 4. Initialize Settings
      const settings = initializeWidget(core, configFile);
      if (settings) {
        window.customViewsInstance.settings = settings;
      }

      // Mark initialized
      window.__customViewsInitialized = true;
      window.__customViewsInitInProgress = false;

    } catch (error) {
      window.__customViewsInitInProgress = false;
      console.error('[CustomViews] Auto-initialization error:', error);
    }
  });
}

// Auto-run initialization logic when this file is evaluated
if (typeof window !== "undefined") {
   initializeFromScript();
}
