import type { ToggleId } from "../types/types";
import { AssetsManager } from "./assets-manager";
import { renderAssetInto } from "./render";
import { getChevronDownIcon, getChevronUpIcon } from "../utils/icons";

/**
 * ToggleManager handles discovery, visibility, and asset rendering for toggle elements
 */
export class ToggleManager {
  /**
   * Track locally expanded elements (that were in peek mode but user expanded them)
   */
  private static expandedPeekElements = new WeakSet<HTMLElement>();

  /**
   * Apply toggle visibility to a given list of toggle elements
   */
  public static applyTogglesVisibility(allToggleElements: HTMLElement[], activeToggles: ToggleId[], peekToggles: ToggleId[] = []): void {
    allToggleElements.forEach(el => {
      const categories = this.getToggleCategories(el);
      const shouldShow = categories.some(cat => activeToggles.includes(cat));
      const shouldPeek = !shouldShow && categories.some(cat => peekToggles.includes(cat));

      if (el.tagName === 'CV-TOGGLE') {
        // New Component Logic: Set props directly
        (el as any).visible = shouldShow;
        (el as any).peek = shouldPeek;
      } else {
        // Legacy Logic
        if (!shouldPeek) {
          this.expandedPeekElements.delete(el);
        }

        // If locally expanded, treat as shown (override peek)
        // Note: If neither show nor peek is active (i.e. hidden), local expansion is ignored/cleared effectively
        this.applyToggleVisibility(el, shouldShow || (shouldPeek && this.expandedPeekElements.has(el)), shouldPeek && !this.expandedPeekElements.has(el));
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
   * Apply simple class-based visibility to a toggle element
   */
  private static applyToggleVisibility(toggleElement: HTMLElement, visible: boolean, peek: boolean = false): void {
    const isLocallyExpanded = this.expandedPeekElements.has(toggleElement);

    if (visible) {
      toggleElement.classList.remove('cv-hidden', 'cv-peek');
      toggleElement.classList.add('cv-visible');
      // Show collapse button ONLY if locally expanded (meaning we are actually in peek mode but expanded).
      // If globally visible (because of 'Show' state), isLocallyExpanded should have been cleared by applyTogglesVisibility,
      // so this will be false, and button will be removed.
      this.manageExpandButton(toggleElement, false, isLocallyExpanded);
    } else if (peek) {
      toggleElement.classList.remove('cv-hidden', 'cv-visible');
      toggleElement.classList.add('cv-peek');
      // Show/create expand button if peeked
      this.manageExpandButton(toggleElement, true, false);
    } else {
      toggleElement.classList.add('cv-hidden');
      toggleElement.classList.remove('cv-visible', 'cv-peek');
      // Ensure button is gone/hidden
      this.manageExpandButton(toggleElement, false, false);
    }
  }

  /**
   * Manage the presence of the inline Expand/Collapse button using a wrapper approach
   */
  private static manageExpandButton(toggleElement: HTMLElement, showExpand: boolean, showCollapse: boolean = false): void {
    // 1. Ensure wrapper exists
    let wrapper = toggleElement.parentElement;
    if (!wrapper || !wrapper.classList.contains('cv-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'cv-wrapper';
      toggleElement.parentNode?.insertBefore(wrapper, toggleElement);
      wrapper.appendChild(toggleElement);
    }

    const btn = wrapper.querySelector('.cv-expand-btn') as HTMLElement;

    // 2. Handle "No Button" case (neither expand nor collapse)
    if (!showExpand && !showCollapse) {
      if (btn) btn.style.display = 'none';

      // If content is visible globally (not hidden), ensure wrapper has 'cv-expanded' 
      // to hide the peek fade effect (since fade is for peek state only).
      if (!toggleElement.classList.contains('cv-hidden')) {
        wrapper.classList.add('cv-expanded');
      } else {
        wrapper.classList.remove('cv-expanded');
      }
      return;
    }

    // 3. Handle Button Needed (Expand or Collapse)
    const action = showExpand ? 'expand' : 'collapse';

    // Update Wrapper Class Logic
    // If showExpand (Peek state) -> remove cv-expanded (show fade)
    // If showCollapse (Expanded peek) -> add cv-expanded (hide fade)
    if (showExpand) {
      wrapper.classList.remove('cv-expanded');
    } else {
      if (!wrapper.classList.contains('cv-expanded')) wrapper.classList.add('cv-expanded');
    }

    // Check if existing button matches desired state
    const currentAction = btn?.getAttribute('data-action');
    if (btn && currentAction === action) {
      btn.style.display = 'flex';
      return;
    }

    // 4. Create New Button (if missing or state changed)
    const iconSvg = showExpand ? getChevronDownIcon() : getChevronUpIcon();

    const newBtn = document.createElement('button');
    newBtn.className = 'cv-expand-btn';
    newBtn.innerHTML = iconSvg;
    newBtn.setAttribute('aria-label', showExpand ? 'Expand content' : 'Collapse content');
    newBtn.setAttribute('data-action', action); // Track state
    newBtn.style.display = 'flex';

    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Logic: Toggle expansion state
      if (showExpand) {
        wrapper!.classList.add('cv-expanded');
        this.expandedPeekElements.add(toggleElement);
        this.applyToggleVisibility(toggleElement, true, false);
      } else {
        wrapper!.classList.remove('cv-expanded');
        this.expandedPeekElements.delete(toggleElement);
        this.applyToggleVisibility(toggleElement, false, true);
      }
    });

    if (btn) {
      btn.replaceWith(newBtn);
    } else {
      wrapper.appendChild(newBtn);
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