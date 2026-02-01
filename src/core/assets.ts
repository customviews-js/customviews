import type { CustomViewAsset } from "../types/index";

export class AssetsManager {
  assets: Record<string, CustomViewAsset>;
  private baseURL: string;

  constructor(assets: Record<string, CustomViewAsset>, baseURL: string = '') {
    this.assets = assets;
    this.baseURL = baseURL;
    if (!this.validate()) {
      console.warn('Invalid assets:', this.assets);
    }
  }

  // Check each asset has content or src
  validate(): boolean {
    return Object.values(this.assets).every(a => a.src || a.content);
  }

  get(assetId: string): CustomViewAsset | undefined {
    const asset = this.assets[assetId];
    if (!asset) return undefined;

    // If there's a baseURL and the asset has a src property, prepend the baseURL
    if (this.baseURL && asset.src) {
      // Create a shallow copy to avoid mutating the original asset
      return {
        ...asset,
        src: this.prependBaseURL(asset.src)
      };
    }

    return asset;
  }

  private prependBaseURL(path: string): string {
    // Don't prepend if the path is already absolute (starts with http:// or https://)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Ensure baseURL doesn't end with / and path starts with /
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    
    return cleanBaseURL + cleanPath;
  }

  loadFromJSON(json: Record<string, CustomViewAsset>) {
    this.assets = json;
  }

  loadAdditionalAssets(additionalAssets: Record<string, CustomViewAsset>) {
    this.assets = { ...this.assets, ...additionalAssets };
  }

}
