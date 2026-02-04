import { prependBaseUrl } from "./url-utils";
import type { ConfigFile } from "$lib/types/index";

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
  const fallbackMinimalConfig: ConfigFile = { 
    config: {},
    settings: { enabled: true }
  };

  try {
    const fullConfigPath = prependBaseUrl(configPath, baseURL);
    const response = await fetch(fullConfigPath);
    
    if (!response.ok) {
      console.warn(`[CustomViews] Config file not found at ${fullConfigPath}. Using defaults.`);
      return fallbackMinimalConfig;
    } 
  
    const config = await response.json();
    return config;
  
  } catch (error) {
    console.error('[CustomViews] Error loading config file:', error);
    return fallbackMinimalConfig;
  }
}
