import type { ToggleId } from "../types/types";
import { AssetsManager } from "./assets-manager";
import { renderAssetInto } from "./render";

/**
 * ToggleManager handles discovery, visibility, and asset rendering for toggle elements
 */
export class ToggleManager {
  /**
   * Track locally expanded elements (that were in peek mode but user expanded them)
   */
  private static expandedElements = new WeakSet<HTMLElement>();

  /**
   * Apply toggle visibility to a given list of toggle elements
   */
  public static applyTogglesVisibility(allToggleElements: HTMLElement[], activeToggles: ToggleId[], peekToggles: ToggleId[] = []): void {
    allToggleElements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const shouldShow = categories.some(cat => activeToggles.includes(cat));
      const shouldPeek = !shouldShow && categories.some(cat => peekToggles.includes(cat));
      const isExpanded = this.expandedElements.has(el);

      // If locally expanded, treat as shown (override peek)
      // Note: If neither show nor peek is active (i.e. hidden), local expansion is ignored/cleared effectively
      this.applyToggleVisibility(el, shouldShow || (shouldPeek && isExpanded), shouldPeek && !isExpanded);
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
   * Apply simple class-based visibility to a toggle element
   */
  private static applyToggleVisibility(el: HTMLElement, visible: boolean, peek: boolean = false): void {
    const isLocallyExpanded = this.expandedElements.has(el);

    if (visible) {
      el.classList.remove('cv-hidden', 'cv-peek');
      el.classList.add('cv-visible');
      // Show collapse button ONLY if locally expanded. If globally visible, no button (or different logic if desired)
      this.manageExpandButton(el, false, isLocallyExpanded);
    } else if (peek) {
      el.classList.remove('cv-hidden', 'cv-visible');
      el.classList.add('cv-peek');
      // Show/create expand button if peeked
      this.manageExpandButton(el, true, false);
    } else {
      el.classList.add('cv-hidden');
      el.classList.remove('cv-visible', 'cv-peek');
      // Ensure button is gone/hidden
      this.manageExpandButton(el, false, false);
    }
  }

  /**
   * Manage the presence of the inline Expand/Collapse button
   * 
   * TODO: (gerteck) Revisit this logic and update the styling
   */
  private static manageExpandButton(el: HTMLElement, showExpand: boolean, showCollapse: boolean = false): void {
    // Check for existing sibling button
    let btn = el.nextElementSibling as HTMLElement;
    const isExistingBtn = btn && btn.classList.contains('cv-expand-btn');

    // Helper to create button
    const createBtn = (text: string, expand: boolean) => {
      const newBtn = document.createElement('button');
      newBtn.className = 'cv-expand-btn';
      newBtn.innerHTML = text;
      newBtn.setAttribute('aria-label', expand ? 'Expand content' : 'Collapse content');
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expand) {
          this.expandedElements.add(el);
          this.applyToggleVisibility(el, true, false);
        } else {
          this.expandedElements.delete(el);
          this.applyToggleVisibility(el, false, true);
        }
      });
      return newBtn;
    };

    if (showExpand) {
      if (isExistingBtn) {
        if (btn.innerHTML !== 'Show More') {
          btn.replaceWith(createBtn('Show More', true));
        }
        btn.style.display = 'flex';
      } else {
        el.after(createBtn('Show More', true));
      }
    } else if (showCollapse) {
      if (isExistingBtn) {
        if (btn.innerHTML !== 'Show Less') {
          btn.replaceWith(createBtn('Show Less', false));
        }
        btn.style.display = 'flex';
      } else {
        el.after(createBtn('Show Less', false));
      }
    } else {
      if (isExistingBtn) {
        btn.style.display = 'none';
      }
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