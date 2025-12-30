import { getChevronDownIcon, getChevronUpIcon } from "../../utils/icons";

/**
 * LegacyToggleRenderer handles the DOM manipulation for legacy attribute-based toggles.
 * This includes managing visibility classes (cv-hidden, cv-visible, cv-peek) and 
 * injecting/managing the expand/collapse buttons.
 */
export class LegacyToggleRenderer {
  /**
   * Track locally expanded elements (that were in peek mode but user expanded them)
   */
  private static expandedPeekElements = new WeakSet<HTMLElement>();

  /**
   * Update the visibility and rendering of a legacy toggle element.
   * @param element The DOM element to update
   * @param shouldShow Whether the element should be fully visible
   * @param shouldPeek Whether the element should be in peek mode
   */
  public static update(element: HTMLElement, shouldShow: boolean, shouldPeek: boolean): void {
    if (!shouldPeek) {
      this.expandedPeekElements.delete(element);
    }

    // If locally expanded, treat as shown (override peek)
    // Note: If neither show nor peek is active (i.e. hidden), local expansion is ignored/cleared effectively
    const visible = shouldShow || (shouldPeek && this.expandedPeekElements.has(element));
    const peek = shouldPeek && !this.expandedPeekElements.has(element);

    this.applyVisuals(element, visible, peek);
  }

  /**
   * Apply simple class-based visibility to a toggle element
   */
  private static applyVisuals(toggleElement: HTMLElement, visible: boolean, peek: boolean = false): void {
    const isLocallyExpanded = this.expandedPeekElements.has(toggleElement);

    if (visible) {
      toggleElement.classList.remove('cv-hidden', 'cv-peek');
      toggleElement.classList.add('cv-visible');
      // Show collapse button ONLY if locally expanded (meaning we are actually in peek mode but expanded).
      // If globally visible (because of 'Show' state), isLocallyExpanded should have been cleared by update(),
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
        this.applyVisuals(toggleElement, true, false);
      } else {
        wrapper!.classList.remove('cv-expanded');
        this.expandedPeekElements.delete(toggleElement);
        this.applyVisuals(toggleElement, false, true);
      }
    });

    if (btn) {
      btn.replaceWith(newBtn);
    } else {
      wrapper.appendChild(newBtn);
    }
  }
}
