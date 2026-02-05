import { SvelteSet } from 'svelte/reactivity';
import { showToast } from '$lib/stores/toast-store.svelte';
import * as DomElementLocator from '$lib/utils/dom-element-locator';
import {
  calculateNewSelection,
  SELECTED_CLASS,
  HIGHLIGHT_TARGET_CLASS,
  HIDE_SELECTED_CLASS,
  HIDE_HIGHLIGHT_TARGET_CLASS,
  HIGHLIGHT_SELECTED_CLASS,
  HIGHLIGHT_TARGET_MODE_CLASS,
} from '../share-logic';

export type SelectionMode = 'show' | 'hide' | 'highlight';

export class ShareStore {
  isActive = $state(false);
  selectionMode = $state<SelectionMode>('show');
  selectedElements = $state<SvelteSet<HTMLElement>>(new SvelteSet<HTMLElement>());
  currentHoverTarget = $state<HTMLElement | null>(null);

  shareCount = $derived(this.selectedElements.size);

  toggleActive(active?: boolean) {
    const newState = active !== undefined ? active : !this.isActive;
    if (!newState) {
      // Cleanup on deactivate
      this.clearAllSelections();
      if (this.currentHoverTarget) {
        this._removeHighlightClass(this.currentHoverTarget);
      }

      // Reset state
      this.isActive = false;
      this.currentHoverTarget = null;
      document.body.classList.remove(
        'cv-share-active-show',
        'cv-share-active-hide',
        'cv-share-active-highlight',
      );
    } else {
      this.isActive = true;
      this.updateBodyClass();
    }
  }

  setSelectionMode(mode: SelectionMode) {
    if (this.selectionMode === mode) return;

    this.selectionMode = mode;

    // Update styling for all currently selected elements
    this.selectedElements.forEach((el) => {
      this._removeSelectionClass(el);
      this._addSelectionClass(el);
    });

    if (this.isActive) {
      this.updateBodyClass();
    }
  }

  updateBodyClass() {
    document.body.classList.remove(
      'cv-share-active-show',
      'cv-share-active-hide',
      'cv-share-active-highlight',
    );
    document.body.classList.add(`cv-share-active-${this.selectionMode}`);
  }

  setHoverTarget(target: HTMLElement | null) {
    // Clear previous highlight
    if (this.currentHoverTarget && this.currentHoverTarget !== target) {
      this._removeHighlightClass(this.currentHoverTarget);
    }

    // Set new highlight
    if (target) {
      this._addHighlightClass(target);
    }

    this.currentHoverTarget = target;
  }

  toggleElementSelection(el: HTMLElement) {
    const { updatedSelection, changesMade } = calculateNewSelection(this.selectedElements, el);

    if (changesMade) {
      // We need to sync the classes on the DOM elements
      // 1. Remove classes from elements that are no longer selected
      this.selectedElements.forEach((oldEl) => {
        if (!updatedSelection.has(oldEl)) {
          this._removeSelectionClass(oldEl);
        }
      });

      // 2. Add classes to elements that are newly selected
      updatedSelection.forEach((newEl) => {
        if (!this.selectedElements.has(newEl)) {
          this._addSelectionClass(newEl);
        }
      });

      // 3. Update the state
      this.selectedElements = updatedSelection;
    }
  }

  toggleMultipleElements(elements: HTMLElement[]) {
    // TODO: Optimization: we could batch this in logic if needed, but simple iteration works for now
    for (const el of elements) {
      this.toggleElementSelection(el);
    }
  }

  clearAllSelections() {
    this.selectedElements.forEach((el) => this._removeSelectionClass(el));
    this.selectedElements.clear();
  }

  private _addHighlightClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_HIGHLIGHT_TARGET_CLASS);
    } else if (this.selectionMode === 'highlight') {
      el.classList.add(HIGHLIGHT_TARGET_MODE_CLASS);
    } else {
      el.classList.add(HIGHLIGHT_TARGET_CLASS);
    }
  }

  private _removeHighlightClass(el: HTMLElement) {
    el.classList.remove(
      HIGHLIGHT_TARGET_CLASS,
      HIDE_HIGHLIGHT_TARGET_CLASS,
      HIGHLIGHT_TARGET_MODE_CLASS,
    );
  }

  private _addSelectionClass(el: HTMLElement) {
    if (this.selectionMode === 'hide') {
      el.classList.add(HIDE_SELECTED_CLASS);
    } else if (this.selectionMode === 'highlight') {
      el.classList.add(HIGHLIGHT_SELECTED_CLASS);
    } else {
      el.classList.add(SELECTED_CLASS);
    }
  }

  private _removeSelectionClass(el: HTMLElement) {
    el.classList.remove(SELECTED_CLASS, HIDE_SELECTED_CLASS, HIGHLIGHT_SELECTED_CLASS);
  }

  generateLink() {
    if (this.selectedElements.size === 0) {
      showToast('Please select at least one item.');
      return;
    }

    const descriptors = Array.from(this.selectedElements).map((el) =>
      DomElementLocator.createDescriptor(el),
    );
    let serialized: string;
    try {
      serialized = DomElementLocator.serialize(descriptors);
    } catch {
      showToast('Failed to generate link. Please try selecting fewer items.');
      return;
    }

    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const url = new URL(window.location.href);

    // Clear all potential params first
    url.searchParams.delete('cv-show');
    url.searchParams.delete('cv-hide');
    url.searchParams.delete('cv-highlight');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'highlight') {
      url.searchParams.set('cv-highlight', serialized);
    } else {
      url.searchParams.set('cv-show', serialized);
    }

    // Copy to clipboard
    navigator.clipboard
      .writeText(url.href)
      .then(() => {
        showToast('Link copied to clipboard!');
      })
      .catch(() => {
        showToast('Failed to copy to clipboard');
      });
  }

  previewLink() {
    if (this.selectedElements.size === 0) {
      showToast('Please select at least one item.');
      return;
    }

    const descriptors = Array.from(this.selectedElements).map((el) =>
      DomElementLocator.createDescriptor(el),
    );
    const serialized = DomElementLocator.serialize(descriptors);

    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const url = new URL(window.location.href);
    url.searchParams.delete('cv-show');
    url.searchParams.delete('cv-hide');
    url.searchParams.delete('cv-highlight');

    if (this.selectionMode === 'hide') {
      url.searchParams.set('cv-hide', serialized);
    } else if (this.selectionMode === 'highlight') {
      url.searchParams.set('cv-highlight', serialized);
    } else {
      url.searchParams.set('cv-show', serialized);
    }

    window.open(url.toString(), '_blank');
  }
}

export const shareStore = new ShareStore();
