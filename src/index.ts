// Export public API
export { CustomViewsCore } from "./core/core.svelte";
export type { CustomViewsOptions } from "./core/core.svelte";
export { CustomViewsWidget } from "./core/widget";
export type { WidgetOptions } from "./core/widget";
export { CustomViews } from "./lib/custom-views";
export type { initOptions } from "./lib/custom-views";
export { PersistenceManager } from "./core/state/persistence";
export { URLStateManager } from "./core/state/url-state-manager";
export { AssetsManager } from "./core/managers/assets-manager";
export type { Config } from "./types/types";
export type { ConfigFile } from "./types/types";

// Note: No auto-initialization here. 
// For browser script tag usage, use dist/custom-views.min.js (built from src/entry/browser-entry.ts)