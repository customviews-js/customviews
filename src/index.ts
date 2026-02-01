// Export public API
export { CustomViewsCore } from "./core/core.svelte";
export type { CustomViewsOptions } from "./core/core.svelte";
export { CustomViewsSettings } from "./core/settings";
export type { SettingsOptions } from "./core/settings";
export { CustomViews } from "./CustomViews";
export type { initOptions } from "./CustomViews";
export { PersistenceManager } from "./core/state/persistence";
export { URLStateManager } from "./core/state/url-state-manager";
export { AssetsManager } from "./core/managers/assets-manager";
export type { Config } from "./types/index";
export type { ConfigFile } from "./types/index";

// Note: No auto-initialization here. 
// For browser script tag usage, use dist/custom-views.min.js (built from src/entry/browser-entry.ts)