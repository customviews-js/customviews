import { SvelteSet } from 'svelte/reactivity';

export const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';

export const SHAREABLE_SELECTOR =
  'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, table, span, tr, ' + CV_CUSTOM_ELEMENTS;

export const SELECTED_CLASS = 'cv-share-selected';
export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const HIDE_SELECTED_CLASS = 'cv-share-selected-hide';
export const HIDE_HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target-hide';
export const HIGHLIGHT_SELECTED_CLASS = 'cv-share-selected-highlight';
export const HIGHLIGHT_TARGET_MODE_CLASS = 'cv-highlight-target-mode';

// IDs that should be treated as generic wrappers even if they are unique
export const GENERIC_WRAPPER_IDS = ['flex-body', 'content-wrapper', 'app'];

/**
 * Determines if an element is a generic div wrapper (like a div used for layout)
 * that should effectively be "ignored" or treated transparently during selection.
 */
export function isGenericWrapper(el: HTMLElement): boolean {
  // Check for explicit generic IDs (layout wrappers)
  if (el.id && GENERIC_WRAPPER_IDS.includes(el.id)) return true;

  if (el.tagName !== 'DIV') return false;
  if (el.id) return false;

  const style = window.getComputedStyle(el);
  const hasBackground =
    style.backgroundColor &&
    style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
    style.backgroundColor !== 'transparent';
  const hasBorder =
    style.borderStyle && style.borderStyle !== 'none' && parseFloat(style.borderWidth) > 0;
  const hasShadow = style.boxShadow && style.boxShadow !== 'none';

  return !hasBackground && !hasBorder && !hasShadow;
}

/**
 * Calculates the new set of selected elements based on the current selection
 * and the new element to toggle/select.
 *
 * Implements the logic:
 * 1. If an ancestor is already selected, ignore the new selection (Scenario B).
 * 2. If children of the new selection are already selected, remove them (Scenario A) and add the new one.
 * 3. Otherwise, just add the new one.
 */
export function calculateNewSelection(
  currentSelection: SvelteSet<HTMLElement>,
  newElement: HTMLElement,
): { updatedSelection: SvelteSet<HTMLElement>; changesMade: boolean } {
  // Create a copy to modify
  const nextSelection = new SvelteSet(currentSelection);

  // 0. Toggle off if already present
  if (nextSelection.has(newElement)) {
    nextSelection.delete(newElement);
    return { updatedSelection: nextSelection, changesMade: true };
  }

  // 1. Check if ancestor is selected (Scenario B)
  // Guard Check -> element toggled should not have an ancestor in the selection technically
  let parent = newElement.parentElement;
  let ancestorSelected = false;
  while (parent) {
    if (nextSelection.has(parent)) {
      ancestorSelected = true;
      break;
    }
    parent = parent.parentElement;
  }

  if (ancestorSelected) {
    return { updatedSelection: currentSelection, changesMade: false }; // No change
  }

  // 2. NewElement is the parent of an element in the selection.
  //  Remove children if selected (Scenario A)
  const toRemove: HTMLElement[] = [];
  nextSelection.forEach((selected) => {
    if (newElement.contains(selected) && newElement !== selected) {
      toRemove.push(selected);
    }
  });

  toRemove.forEach((child) => {
    nextSelection.delete(child);
  });

  // Add
  nextSelection.add(newElement);

  return { updatedSelection: nextSelection, changesMade: true };
}
