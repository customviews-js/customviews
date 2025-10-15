import { CustomViews } from "../lib/custom-views";
import { CustomViewsWidget } from "../core/widget";
import { prependBaseUrl } from "../utils/url-utils";

/**
 * Initialize CustomViews from script tag attributes and config file
 * This function handles the automatic initialization of CustomViews when included via script tag
 * 
 * Data attributes supported:
 * - data-base-url: Base URL for the site (e.g., "/customviews" for subdirectory deployments)
 * - data-config-path: Path to config file (default: "/customviews.config.json")
 * 
 * The function fetches the config file and uses it directly to initialize CustomViews.
 * Widget visibility is controlled via the config file (widget.enabled property).
 */
export default function initializeFromScript(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Use the typed global `window` (see src/types/global.d.ts)
  // Idempotency guard: if already initialized, skip setting up listener again.
  if (window.__customViewsInitialized) {
    // Informational for developers; harmless in production.
    console.info('[CustomViews] Auto-init skipped: already initialized.');
    return;
  }

  document.addEventListener('DOMContentLoaded', async function() {
    // Prevent concurrent initialization runs (race conditions when script is loaded twice)
    if (window.__customViewsInitInProgress || window.__customViewsInitialized) {
      return;
    }
    window.__customViewsInitInProgress = true;
    
    try {
      // Find the script tag
      let scriptTag = document.currentScript as HTMLScriptElement;
      
      // Fallback if currentScript is not available (executed after page load)
      if (!scriptTag) {
        // Try to find the script tag by looking for our script
        const scripts = document.querySelectorAll('script[src*="@customviews-js"]');
        if (scripts.length > 0) {
          // Find the most specific match (to avoid matching other custom-views scripts)
          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i] as HTMLScriptElement;
            const src = script.getAttribute('src') || '';
            // Look for .min.js or .js at the end, or the package root
            if (src.match(/@customviews-js\/customviews(\.min)?\.js($|\?)/) || src.includes('@customviews-js/customviews')) {
              scriptTag = script;
              break;
            }
          }
          // If no specific match found, use the first one
          if (!scriptTag) {
            scriptTag = scripts[0] as HTMLScriptElement;
          }
        }
      }

      // Read data attributes from script tag
      let baseURL = '';
      let configPath = '/customviews.config.json';

      if (scriptTag) {
        baseURL = scriptTag.getAttribute('data-base-url') || '';
        configPath = scriptTag.getAttribute('data-config-path') || configPath;
      }

      // Fetch config file
      let configFile;
      try {
        const fullConfigPath = prependBaseUrl(configPath, baseURL);
        console.log(`[CustomViews] Loading config from: ${fullConfigPath}`);
        
        const response = await fetch(fullConfigPath);
        
        if (!response.ok) {
          console.warn(`[CustomViews] Config file not found at ${fullConfigPath}. Using defaults.`);
          // Provide minimal default config structure
          configFile = { 
            config: {
              allToggles: [],
              defaultState: { toggles: [] }
            },
            widget: {
              enabled: true
            }
          };
        } else {
          configFile = await response.json();
          console.log('[CustomViews] Config loaded successfully');
        }
      } catch (error) {
        console.error('[CustomViews] Error loading config file:', error);
        return; // Abort initialization
      }

      // Determine effective baseURL (data attribute takes precedence over config)
      const effectiveBaseURL = baseURL || configFile.baseURL || '';

      const options: any = {
        config: configFile.config,
        assetsJsonPath: configFile.assetsJsonPath,
        baseURL: effectiveBaseURL,
      }

      if (configFile.showUrl !== undefined) {
        options.showUrl = configFile.showUrl;
      }

      // Initialize CustomViews core
      const core = await CustomViews.init(options);

      if (!core) {
        console.error('[CustomViews] Failed to initialize core.');
        return; // Abort widget creation
      }

      // Store instance
      window.customViewsInstance = { core };

      // Initialize widget if enabled in config
      let widget;
      if (configFile.widget?.enabled !== false) {
        widget = new CustomViewsWidget({
          core,
          ...configFile.widget
        });
        widget.render();
        
        // Store widget instance
        window.customViewsInstance.widget = widget;
        console.log('[CustomViews] Widget initialized and rendered');
      } else {
        console.log('[CustomViews] Widget disabled in config - skipping initialization');
      }

      // Dispatch ready event
      const readyEvent = new CustomEvent('customviews:ready', {
        detail: {
          core,
          widget
        }
      });
      document.dispatchEvent(readyEvent);

      // Mark initialized and clear in-progress flag
      window.__customViewsInitialized = true;
      window.__customViewsInitInProgress = false;

    } catch (error) {
      // Clear in-progress flag so a future attempt can retry
      window.__customViewsInitInProgress = false;
      console.error('[CustomViews] Auto-initialization error:', error);
    }
  });
}
