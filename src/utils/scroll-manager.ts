// src/utils/scroll-manager.ts

export class ScrollManager {
  /**
   * Finds the highest tab group currently in the viewport.
   * This is intended to be called BEFORE the state changes, to identify which element to scroll to.
   * @returns The HTMLElement of the highest visible tab group, or null if none are found.
   */
  public static findHighestVisibleTabGroup(): HTMLElement | null {
    // console.log('[ScrollManager] Finding highest visible tab group.');

    // 1. Detect fixed/sticky header and calculate its height for offset.
    let headerOffset = 0;
    const headerEl = document.querySelector('header');
    let isHeaderFixedOrSticky = false;
    if (headerEl) {
      const headerStyle = window.getComputedStyle(headerEl);
      isHeaderFixedOrSticky = ['fixed', 'sticky'].includes(headerStyle.position);
      if (isHeaderFixedOrSticky) {
        headerOffset = headerEl.getBoundingClientRect().height;
      }
    }
    const contentTop = headerOffset; // Viewport-relative position where content begins.

    // 2. Find all tab groups, filtering out any inside the main header.
    const allTabGroups = Array.from(document.querySelectorAll<HTMLElement>('cv-tabgroup'));
    const candidateGroups = allTabGroups.filter(groupEl => {
      if (isHeaderFixedOrSticky && headerEl && groupEl.closest('header') === headerEl) {
        return false;
      }
      return true;
    });

    // 3. Find the highest group that is visible in the content area (below the header).
    let highestVisibleGroup: HTMLElement | null = null;
    let highestVisibleGroupTop = Infinity;

    for (const groupEl of candidateGroups) {
      const rect = groupEl.getBoundingClientRect();
      // A group is "visible" if it's not completely above the content area or completely below the viewport.
      const isVisibleInContentArea = rect.bottom > contentTop && rect.top < window.innerHeight;
      
      if (isVisibleInContentArea) {
        // We want the one with the smallest 'top' value (closest to the top of the viewport).
        if (rect.top < highestVisibleGroupTop) {
          highestVisibleGroup = groupEl;
          highestVisibleGroupTop = rect.top;
        }
      }
    }
    
    return highestVisibleGroup;
  }

  /**
   * Scrolls the page to align the given tab group's header (or the group itself) 
   * to the top of the viewport, accounting for a fixed/sticky page header.
   * This should be called AFTER the content has changed.
   * @param groupEl The tab group element to scroll to.
   */
  public static scrollToTabGroup(groupEl: HTMLElement): void {
    // console.log('[ScrollManager] Scrolling to tab group:', groupEl);

    // 1. Detect fixed/sticky header and calculate its height for offset.
    let headerOffset = 0;
    const headerEl = document.querySelector('header');
    if (headerEl) {
      const headerStyle = window.getComputedStyle(headerEl);
      if (['fixed', 'sticky'].includes(headerStyle.position)) {
        headerOffset = headerEl.getBoundingClientRect().height;
      }
    }
    const PADDING_BELOW_HEADER = 20; // Extra space.

    // 2. Calculate the target position.
    const targetElementRect = groupEl.getBoundingClientRect();

    // Calculate the absolute top position of the target element in the document.
    const scrollTargetY = targetElementRect.top + window.scrollY;

    // Adjust for the header offset and padding to position it just below the header.
    const finalScrollY = scrollTargetY - headerOffset - PADDING_BELOW_HEADER;

    // change to 'auto' if instant scroll is preferred.
    window.scrollTo({
      top: finalScrollY,
      behavior: 'smooth',
    });
  }

  /**
   * Adjusts the scroll position to keep a specific element in the same visual location
   * after a content change. This is useful for preventing the page from jumping when
   * content above the element is added or removed.
   * @param scrollAnchor An object containing the element to anchor and its initial top position.
   */
  public static handleScrollAnchor(scrollAnchor: { element: HTMLElement; top: number }): void {
    requestAnimationFrame(() => {
      const { element, top: initialTop } = scrollAnchor;
      const newTop = element.getBoundingClientRect().top;
      const scrollDelta = newTop - initialTop;

      // Only scroll if there's a noticeable change to avoid jitter
      if (Math.abs(scrollDelta) > 1) {
        window.scrollBy({
          top: scrollDelta,
          behavior: 'instant'
        });
      }
    });
  }
}
