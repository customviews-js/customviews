/**
 * Calculates the height of a fixed or sticky header, if present.
 * This is used to offset scroll positions so content isn't hidden behind the header.
 */
export function getHeaderOffset(): number {
  const headerEl = document.querySelector('header');
  if (!headerEl) return 0;

  const headerStyle = window.getComputedStyle(headerEl);
  const isHeaderFixedOrSticky = ['fixed', 'sticky'].includes(headerStyle.position);

  return isHeaderFixedOrSticky ? headerEl.getBoundingClientRect().height : 0;
}

/**
 * Finds the highest element matching the selector that is currently in the viewport.
 * @param selector The CSS selector to match elements against.
 * @returns The HTMLElement of the highest visible element, or null if none are found.
 */
export function findHighestVisibleElement(selector: string): HTMLElement | null {
  const headerOffset = getHeaderOffset();
  const contentTop = headerOffset; // Viewport-relative position where content begins.

  // 1. Find all matching elements, filtering out any inside the main header (if fixed/sticky).
  const allElements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const headerEl = document.querySelector('header');

  const candidateElements = allElements.filter((el) => {
    // If header is sticky/fixed, ignore elements inside it to avoid false positives
    if (headerOffset > 0 && headerEl && el.closest('header') === headerEl) {
      return false;
    }
    return true;
  });

  // 2. Find the highest element visible in the content area.
  let highestVisibleEl: HTMLElement | null = null;
  let highestVisibleTop = Infinity;

  for (const el of candidateElements) {
    const rect = el.getBoundingClientRect();
    // Visible if not completely above content area and not completely below viewport
    const isVisibleInContentArea = rect.bottom > contentTop && rect.top < window.innerHeight;

    if (isVisibleInContentArea) {
      // We want the one closest to the top
      if (rect.top < highestVisibleTop) {
        highestVisibleEl = el;
        highestVisibleTop = rect.top;
      }
    }
  }

  return highestVisibleEl;
}

/**
 * Scrolls the page to align the element to the top of the viewport,
 * accounting for fixed/sticky headers and adding some padding.
 * @param element The element to scroll to.
 */
export function scrollToElement(element: HTMLElement): void {
  const headerOffset = getHeaderOffset();
  const PADDING_BELOW_HEADER = 20;

  const targetElementRect = element.getBoundingClientRect();
  const scrollTargetY = targetElementRect.top + window.scrollY;
  const finalScrollY = scrollTargetY - headerOffset - PADDING_BELOW_HEADER;

  window.scrollTo({
    top: finalScrollY,
    behavior: 'smooth',
  });
}

/**
 * Adjusts the scroll position to keep a specific element in the same visual location.
 * Useful when content additions/removals above might cause jumps.
 */
export function handleScrollAnchor(scrollAnchor: { element: HTMLElement; top: number }): void {
  requestAnimationFrame(() => {
    const { element, top: initialTop } = scrollAnchor;

    // Check if element is still in document
    if (!element || !document.contains(element)) return;

    const newTop = element.getBoundingClientRect().top;
    const scrollDelta = newTop - initialTop;

    // Only scroll if there's a noticeable change
    if (Math.abs(scrollDelta) > 1) {
      window.scrollBy({
        top: scrollDelta,
        behavior: 'instant',
      });
    }
  });
}
