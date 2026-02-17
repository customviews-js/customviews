import { getScriptAttributes, fetchConfig } from '$lib/utils/init-utils';
import { initUIManager } from '$lib/app/ui-manager';
import { CustomViewsController, type ControllerOptions } from '$lib/controller.svelte';
import { AssetsManager } from '$features/render/assets';
import type { CustomViewAsset } from '$lib/types/index';
import { prependBaseUrl } from '$lib/utils/url-utils';
import '$lib/registry';

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

  document.addEventListener('DOMContentLoaded', async function () {
    if (window.__customViewsInitInProgress || window.__customViewsInitialized) return;
    window.__customViewsInitInProgress = true;
    try {
      // Get attributes from script tag
      const { baseURL, configPath } = getScriptAttributes();

      // Fetch Config
      const configFile = await fetchConfig(configPath, baseURL);

      // Determine effective baseURL (data attribute takes precedence)
      const effectiveBaseURL = baseURL || configFile.baseUrl || '';

      // Initialize Assets
      let assetsManager: AssetsManager;
      if (configFile.assetsJsonPath) {
        const assetsPath = prependBaseUrl(configFile.assetsJsonPath, effectiveBaseURL);
        try {
          const assetsJson: Record<string, CustomViewAsset> = await (
            await fetch(assetsPath)
          ).json();
          assetsManager = new AssetsManager(assetsJson, effectiveBaseURL);
        } catch (error) {
          console.error(`[CustomViews] Failed to load assets JSON from ${assetsPath}:`, error);
          assetsManager = new AssetsManager({}, effectiveBaseURL);
        }
      } else {
        assetsManager = new AssetsManager({}, effectiveBaseURL);
      }

      const coreOptions: ControllerOptions = {
        assetsManager,
        configFile,
        rootEl: document.body,
        showUrl: configFile.showUrl || false,
        storageKey: configFile.storageKey,
      };

      const controller = new CustomViewsController(coreOptions);
      controller.init();

      initUIManager(controller, configFile);

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
if (typeof window !== 'undefined') {
  initializeFromScript();
}
