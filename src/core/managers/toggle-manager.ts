import type { ToggleId } from "../../types/types";
import { AssetsManager } from "./assets-manager";
import { renderAssetInto } from "../render";

/**
 * ToggleManager handles discovery and asset rendering for toggle elements
 */
export class ToggleManager {

  /**
   * Render assets into a given list of toggle elements that are currently visible
   * Toggles that have a toggleId and are currently visible will have their assets rendered (if any)
   */
  public static renderToggleAssets(elements: HTMLElement[], activeToggles: ToggleId[], assetsManager: AssetsManager): void {
    // TO DO: (gerteck) Enable for peek toggles as well
    // Also, rework the rendering logic again to make it more user friendly.

    elements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const toggleId = this.getToggleId(el);
      const isRendered = el.dataset.cvRendered === 'true';

      if (toggleId && !isRendered && categories.some(cat => activeToggles.includes(cat))) {
        renderAssetInto(el, toggleId, assetsManager);
        el.dataset.cvRendered = 'true';
      }
    });
  }

  /**
   * Get toggle categories from a cv-toggle element.
   * Note: a toggle can have multiple categories.
   */
  private static getToggleCategories(el: HTMLElement): string[] {
    const category = el.getAttribute('category');
    return (category || '').split(/\s+/).filter(Boolean);
  }

  /**
   * Get toggle ID from an element
   */
  private static getToggleId(el: HTMLElement): string | undefined {
    return el.dataset.cvId || el.dataset.customviewsId || el.getAttribute('data-cv-id') || el.getAttribute('data-customviews-id') || undefined;
  }

  /**
   * Scans a given DOM subtree for toggle elements and initializes them.
   * This includes rendering assets for visible toggles.
   */
  public static initializeToggles(
    root: HTMLElement,
    activeToggles: ToggleId[],
    assetsManager: AssetsManager
  ): void {
    const allToggleElements: HTMLElement[] = [];
    if (root.matches('cv-toggle')) {
      allToggleElements.push(root);
    }
    root.querySelectorAll('cv-toggle').forEach(el => allToggleElements.push(el as HTMLElement));

    if (allToggleElements.length === 0) return;

    this.renderToggleAssets(allToggleElements, activeToggles, assetsManager);
  }
}