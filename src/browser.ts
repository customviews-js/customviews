import { CustomViews } from "./CustomViews";
import { getScriptAttributes, fetchConfig, initializeWidget } from "./utils/init-utils";
import type { initOptions } from "./CustomViews";


// --- No Public API Exports ---
// The script auto-initializes via initializeFromScript().

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

      // 4. Initialize UI Manager
      const uiManager = initializeWidget(core, configFile);
      if (uiManager) {
        window.customViewsInstance.uiManager = uiManager;
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
