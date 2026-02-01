import { prependBaseUrl } from "./url-utils";
import type { ConfigFile } from "../types/index";
import { CustomViewsSettings } from "../core/settings";
import type { CustomViewsCore } from "../core/core.svelte";

/**
 * structure for script attributes
 */
export interface ScriptAttributes {
  baseURL: string;
  configPath: string;
}

/**
 * Finds the script tag that loaded the library and extracts configuration attributes.
 * Looks for `data-base-url` and `data-config-path`.
 */
export function getScriptAttributes(): ScriptAttributes {
  let scriptTag = document.currentScript as HTMLScriptElement | null;
  const defaults = { baseURL: '', configPath: '/customviews.config.json' };

  if (!scriptTag || !scriptTag.hasAttribute('data-base-url')) {
    const dataAttrMatch = document.querySelector('script[data-base-url]') as HTMLScriptElement | null;
    if (dataAttrMatch) {
      scriptTag = dataAttrMatch;
    } else {
      // Fallback: try to find script by src pattern
      for (const script of document.scripts) {
        const src = script.src || '';
        if (/(?:custom[-_]views|@customviews-js\/customviews)(?:\.min)?\.(?:esm\.)?js($|\?)/i.test(src)) {
          scriptTag = script as HTMLScriptElement;
          break;
        }
      }
    }
  }

  if (scriptTag) {
    return {
      baseURL: scriptTag.getAttribute('data-base-url') || defaults.baseURL,
      configPath: scriptTag.getAttribute('data-config-path') || defaults.configPath
    };
  }

  return defaults;
}

/**
 * Fetches and parses the configuration file.
 */
export async function fetchConfig(configPath: string, baseURL: string): Promise<ConfigFile> {
  // Default minimal config
  const fallbackConfig: ConfigFile = { 
    config: {},
    settings: { enabled: true }
  };

  try {
    const fullConfigPath = prependBaseUrl(configPath, baseURL);
    console.log(`[CustomViews] Loading config from: ${fullConfigPath}`);
    
    const response = await fetch(fullConfigPath);
    
    if (!response.ok) {
      console.warn(`[CustomViews] Config file not found at ${fullConfigPath}. Using defaults.`);
      return fallbackConfig;
    } else {
      const config = await response.json();
      console.log('[CustomViews] Config loaded successfully');
      return config;
    }
  } catch (error) {
    console.error('[CustomViews] Error loading config file:', error);
    return fallbackConfig;
  }
}

/**
 * Initializes the settings if enabled in the config.
 */
export function initializeWidget(core: CustomViewsCore, config: ConfigFile): CustomViewsSettings | undefined {
  if (config.settings?.enabled !== false) {
    const settings = new CustomViewsSettings({
      core,
      ...config.settings
    });
    settings.renderModalIcon();
    console.log('[CustomViews] Settings initialized and rendered');
    return settings;
  } else {
    console.log('[CustomViews] Settings disabled in config - skipping initialization');
    return undefined;
  }
}
