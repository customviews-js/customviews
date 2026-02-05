import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { type RectData } from './services/highlight-types';

/**
 * Groups elements by their parent.
 * Returns a Map where keys are parent elements and values are lists of child elements.
 */
export function groupSiblings(elements: HTMLElement[]): SvelteMap<HTMLElement, HTMLElement[]> {
  const groups = new SvelteMap<HTMLElement, HTMLElement[]>();

  elements.forEach((t) => {
    const parent = t.parentElement || document.body;
    if (!groups.has(parent)) {
      groups.set(parent, []);
    }
    groups.get(parent)!.push(t);
  });

  return groups;
}

/**
 * Interface representing basic rectangle properties needed for calculation.
 */
export interface SimpleRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Calculates merged rectangles for highlighting from groups of sibling elements.
 *
 * @param groups Map of parent elements to their child elements that need highlighting.
 * @param getRect Callback to retrieve the bounding client rect of an element.
 *                Abstracted to allow testing without real DOM/layout.
 * @param getScroll Callback to retrieve current scroll position {scrollTop, scrollLeft}.
 */
export function calculateMergedRects(
  groups: SvelteMap<HTMLElement, HTMLElement[]>,
  getRect: (el: HTMLElement) => SimpleRect,
  getScroll: () => { scrollTop: number; scrollLeft: number },
): RectData[] {
  const mergedRects: RectData[] = [];
  const { scrollTop, scrollLeft } = getScroll();

  // Iterate groups to ensure strict adjacency
  for (const [parent, siblingsInGroup] of groups) {
    if (siblingsInGroup.length === 0) continue;

    // Optimization if only 1 child, no need to scan parent
    if (siblingsInGroup.length === 1) {
      addMergedRect(mergedRects, siblingsInGroup, getRect, scrollTop, scrollLeft);
      continue;
    }

    // O(1) lookup
    const siblingsSet = new SvelteSet(siblingsInGroup);
    let currentBatch: HTMLElement[] = [];

    // Scan parent children to respect DOM order and interruptions
    // Use parent.children to get Elements only (skip text nodes)
    const children = Array.from(parent.children);

    for (const child of children) {
      if (child instanceof HTMLElement && siblingsSet.has(child)) {
        currentBatch.push(child);
      } else {
        // Break in continuity
        if (currentBatch.length > 0) {
          addMergedRect(mergedRects, currentBatch, getRect, scrollTop, scrollLeft);
          currentBatch = [];
        }
      }
    }
    // Finalize last batch
    if (currentBatch.length > 0) {
      addMergedRect(mergedRects, currentBatch, getRect, scrollTop, scrollLeft);
    }
  }

  return mergedRects;
}

function addMergedRect(
  resultList: RectData[],
  elements: HTMLElement[],
  getRect: (el: HTMLElement) => SimpleRect,
  scrollTop: number,
  scrollLeft: number,
) {
  if (elements.length === 0) return;

  let minTop = Infinity;
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  elements.forEach((t) => {
    const r = getRect(t);

    const top = r.top + scrollTop;
    const left = r.left + scrollLeft;
    const right = left + r.width;
    const bottom = top + r.height;

    if (top < minTop) minTop = top;
    if (left < minLeft) minLeft = left;
    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  });

  const PADDING = 10;

  resultList.push({
    top: minTop - PADDING,
    left: minLeft - PADDING,
    width: maxRight - minLeft + PADDING * 2,
    height: maxBottom - minTop + PADDING * 2,
    right: maxRight + PADDING,
    bottom: maxBottom + PADDING,
    element: elements[0]!,
  });
}
