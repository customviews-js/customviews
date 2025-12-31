import type { ToggleId } from "../../types/types";
import { AssetsManager } from "./assets-manager";
import { renderAssetInto } from "../render";
import { LegacyToggleRenderer } from "./legacy-toggle-renderer";

/**
 * ToggleManager handles discovery, visibility, and asset rendering for toggle elements
 */
export class ToggleManager {

  /**
   * Apply toggle visibility to a given list of toggle elements
   */
  public static applyTogglesVisibility(allToggleElements: HTMLElement[], activeToggles: ToggleId[], peekToggles: ToggleId[] = []): void {
    allToggleElements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const shouldShow = categories.some(cat => activeToggles.includes(cat));
      const shouldPeek = !shouldShow && categories.some(cat => peekToggles.includes(cat));

      if (el.tagName !== 'CV-TOGGLE') {
        // Legacy Logic: Delegated to Renderer
        LegacyToggleRenderer.update(el, shouldShow, shouldPeek);
      }
    });
  }

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
   * Get toggle categories from an element (supports both data attributes and cv-toggle elements)
   * Note: a toggle can have multiple categories.
   */
  private static getToggleCategories(el: HTMLElement): string[] {
    if (el.tagName.toLowerCase() === 'cv-toggle') {
      const category = el.getAttribute('category');
      return (category || '').split(/\s+/).filter(Boolean);
    } else {
      const data = el.dataset.cvToggle || el.dataset.customviewsToggle;
      return (data || '').split(/\s+/).filter(Boolean);
    }
  }

  /**
   * Get toggle ID from an element
   */
  private static getToggleId(el: HTMLElement): string | undefined {
    return el.dataset.cvId || el.dataset.customviewsId || el.getAttribute('data-cv-id') || el.getAttribute('data-customviews-id') || undefined;
  }

  /**
   * Scans a given DOM subtree for toggle elements and initializes them.
   * This includes applying visibility and rendering assets.
   */
  public static initializeToggles(
    root: HTMLElement,
    activeToggles: ToggleId[],
    assetsManager: AssetsManager
  ): void {
    const allToggleElements: HTMLElement[] = [];
    if (root.matches('[data-cv-toggle], [data-customviews-toggle], cv-toggle')) {
      allToggleElements.push(root);
    }
    root.querySelectorAll('[data-cv-toggle], [data-customviews-toggle], cv-toggle').forEach(el => allToggleElements.push(el as HTMLElement));

    if (allToggleElements.length === 0) return;

    this.applyTogglesVisibility(allToggleElements, activeToggles);
    this.renderToggleAssets(allToggleElements, activeToggles, assetsManager);
  }
}