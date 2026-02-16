import { AppStore } from './app-store.svelte';
import type { ConfigFile } from '$lib/types/index';

let appStoreInstance: AppStore | undefined;

export function initAppStore(configFile?: ConfigFile): AppStore {
  const config = configFile?.config || {};
  appStoreInstance = new AppStore(config);
  
  if (configFile) {
      appStoreInstance.init(configFile);
  }
  
  return appStoreInstance;
}

export function getAppStore(): AppStore {
  if (!appStoreInstance) {
    throw new Error(
      '[CustomViews] AppStore not initialized. Call initAppStore() first.'
    );
  }
  return appStoreInstance;
}

/**
 * For testing purposes only.
 */
export function setAppStore(store: AppStore) {
  appStoreInstance = store;
}
