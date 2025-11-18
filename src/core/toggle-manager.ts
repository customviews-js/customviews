import type { ToggleId } from "../types/types";
import { AssetsManager } from "./assets-manager";
import { renderAssetInto } from "./render";

/**
 * ToggleManager handles discovery, visibility, and asset rendering for toggle elements
 */
export class ToggleManager {
  /**
   * Apply toggle visibility to a given list of toggle elements
   */
  public static applyToggles(elements: HTMLElement[], activeToggles: ToggleId[]): void {
    elements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const shouldShow = categories.some(cat => activeToggles.includes(cat));
      this.applyToggleVisibility(el, shouldShow);
    });
  }

  /**
   * Render assets into a given list of toggle elements that are currently visible
   */
  public static renderAssets(elements: HTMLElement[], activeToggles: ToggleId[], assetsManager: AssetsManager): void {
    elements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const toggleId = this.getToggleId(el);
      if (toggleId && categories.some(cat => activeToggles.includes(cat))) {
        renderAssetInto(el, toggleId, assetsManager);
      }
    });
  }

  /**
   * Get toggle categories from an element (supports both data attributes and cv-toggle elements)
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
   * Apply simple class-based visibility to a toggle element
   */
  private static applyToggleVisibility(el: HTMLElement, visible: boolean): void {
    if (visible) {
      el.classList.remove('cv-hidden');
      el.classList.add('cv-visible');
    } else {
      el.classList.add('cv-hidden');
      el.classList.remove('cv-visible');
    }
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
    const elements: HTMLElement[] = [];
    if (root.matches('[data-cv-toggle], [data-customviews-toggle], cv-toggle')) {
        elements.push(root);
    }
    root.querySelectorAll('[data-cv-toggle], [data-customviews-toggle], cv-toggle').forEach(el => elements.push(el as HTMLElement));

    if (elements.length === 0) return;

    this.applyToggles(elements, activeToggles);
    this.renderAssets(elements, activeToggles, assetsManager);
  }
}