import { writable, get, derived } from 'svelte/store';
import * as DomElementLocator from '../utils/dom-element-locator';
import { showToast } from './toast-store';

export const SELECTED_CLASS = 'cv-share-selected';
export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
export const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, [data-share], ' + CV_CUSTOM_ELEMENTS;

// State Interfaces
interface ShareState {
  isActive: boolean;
  selectedElements: Set<HTMLElement>;
  currentHoverTarget: HTMLElement | null;
}

// Initial State
const initialState: ShareState = {
  isActive: false,
  selectedElements: new Set(),
  currentHoverTarget: null
};

function createShareStore() {
  const { subscribe, update } = writable<ShareState>(initialState);

  return {
    subscribe,
    
    // Actions
    toggleActive: (active?: boolean) => update(state => {
      const newState = active !== undefined ? active : !state.isActive;
      if (!newState) {
        // Cleanup on deactivate
        state.selectedElements.forEach(el => el.classList.remove(SELECTED_CLASS));
        if (state.currentHoverTarget) {
          state.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
        }
        return { ...initialState, isActive: false };
      }
      return { ...state, isActive: true };
    }),

    setHoverTarget: (target: HTMLElement | null) => update(state => {
      // Clear previous highlight
      if (state.currentHoverTarget && state.currentHoverTarget !== target) {
        state.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
      }
      
      // Set new highlight
      if (target) {
        target.classList.add(HIGHLIGHT_TARGET_CLASS);
      }
      
      return { ...state, currentHoverTarget: target };
    }),

    toggleSelection: (el: HTMLElement) => update(state => {
      const newSet = new Set(state.selectedElements);
      
      if (newSet.has(el)) {
        newSet.delete(el);
        el.classList.remove(SELECTED_CLASS);
      } else {
        // Selection Logic
        
        // 1. Check if ancestor is selected (Scenario B)
        let parent = el.parentElement;
        let ancestorSelected = false;
        while (parent) {
          if (newSet.has(parent)) {
            ancestorSelected = true;
            break;
          }
          parent = parent.parentElement;
        }
        
        if (ancestorSelected) {
          return state; // Ignore
        }

        // 2. Remove children if selected (Scenario A)
        const toRemove: HTMLElement[] = [];
        newSet.forEach(selected => {
          if (el.contains(selected) && el !== selected) {
            toRemove.push(selected);
          }
        });

        toRemove.forEach(child => {
          newSet.delete(child);
          child.classList.remove(SELECTED_CLASS);
        });

        // Add
        newSet.add(el);
        el.classList.add(SELECTED_CLASS);
      }
      
      return { ...state, selectedElements: newSet };
    }),

    clearSelection: () => update(state => {
      state.selectedElements.forEach(el => el.classList.remove(SELECTED_CLASS));
      return { ...state, selectedElements: new Set() };
    }),

    // Helpers
    generateLink: () => {
      const state = get(shareStore);
      if (state.selectedElements.size === 0) {
        showToast('Please select at least one item.');
        return;
      }

      const descriptors = Array.from(state.selectedElements).map(el => DomElementLocator.createDescriptor(el));
      const serialized = DomElementLocator.serialize(descriptors);

      const url = new URL(window.location.href);
      url.searchParams.set('cv-focus', serialized);

      navigator.clipboard.writeText(url.toString())
        .then(() => showToast('Link copied to clipboard!'))
        .catch((e) => {
          console.error('Clipboard failed', e);
          showToast('Failed to copy link.');
        });
    },

    previewLink: () => {
      const state = get(shareStore);
      if (state.selectedElements.size === 0) {
        showToast('Please select at least one item.');
        return;
      }

      const descriptors = Array.from(state.selectedElements).map(el => DomElementLocator.createDescriptor(el));
      const serialized = DomElementLocator.serialize(descriptors);

      const url = new URL(window.location.href);
      url.searchParams.set('cv-focus', serialized);
      window.open(url.toString(), '_blank');
    }
  };
}

export const shareStore = createShareStore();

// Derived Stores
export const shareCount = derived(shareStore, $state => $state.selectedElements.size);
