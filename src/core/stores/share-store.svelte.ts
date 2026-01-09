import { SvelteSet } from 'svelte/reactivity';
import { showToast } from './toast-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';

export const SELECTED_CLASS = 'cv-share-selected';
export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const HIDE_SELECTED_CLASS = 'cv-share-selected-hide';
export const HIDE_HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target-hide';
export const HIGHLIGHT_SELECTED_CLASS = 'cv-share-selected-highlight';
export const HIGHLIGHT_TARGET_MODE_CLASS = 'cv-highlight-target-mode';
export const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
export const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, table, ' + CV_CUSTOM_ELEMENTS;
// IDs that should be treated as generic wrappers even if they are unique
export const GENERIC_WRAPPER_IDS = ['flex-body', 'content-wrapper', 'app'];

export function isGenericWrapper(el: HTMLElement): boolean {
    // Check for explicit generic IDs (layout wrappers)
    if (el.id && GENERIC_WRAPPER_IDS.includes(el.id)) return true;

    if (el.tagName !== 'DIV') return false;
    if (el.id) return false;
    
    const style = window.getComputedStyle(el);
    const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
    const hasBorder = style.borderStyle !== 'none' && parseFloat(style.borderWidth) > 0;
    const hasShadow = style.boxShadow !== 'none';
    
    return !hasBackground && !hasBorder && !hasShadow;
}

export type SelectionMode = 'focus' | 'hide' | 'highlight';

export class ShareStore {
    isActive = $state(false);
    selectionMode = $state<SelectionMode>('focus');
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
            document.body.classList.remove('cv-share-active-focus', 'cv-share-active-hide');
        } else {
            this.isActive = true;
            this.updateBodyClass();
        }
    }

    setSelectionMode(mode: SelectionMode) {
        if (this.selectionMode === mode) return;
        
        this.selectionMode = mode;
        
        // Update styling for all currently selected elements
        this.selectedElements.forEach(el => {
            this._removeSelectionClass(el);
            this._addSelectionClass(el);
        });

        if (this.isActive) {
            this.updateBodyClass();
        }
    }

    updateBodyClass() {
        document.body.classList.remove('cv-share-active-focus', 'cv-share-active-hide');
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
        if (this.selectedElements.has(el)) {
            this.selectedElements.delete(el);
            this._removeSelectionClass(el);
        } else {
            this.selectElement(el);
        }
    }

    selectElement(el: HTMLElement) {
        if (this.selectedElements.has(el)) return;
            
        // 1. Check if ancestor is selected (Scenario B)
        let parent = el.parentElement;
        let ancestorSelected = false;
        while (parent) {
            if (this.selectedElements.has(parent)) {
                ancestorSelected = true;
                break;
            }
            parent = parent.parentElement;
        }
        
        if (ancestorSelected) {
            return; // Ignore
        }

        // 2. Remove children if selected (Scenario A)
        const toRemove: HTMLElement[] = [];
        this.selectedElements.forEach(selected => {
            if (el.contains(selected) && el !== selected) {
                toRemove.push(selected);
            }
        });

        toRemove.forEach(child => {
            this.selectedElements.delete(child);
            this._removeSelectionClass(child);
        });

        // Add
        this.selectedElements.add(el);
        this._addSelectionClass(el);
    }

    addMultipleElements(elements: HTMLElement[]) {
        for (const el of elements) {
            this.selectElement(el);
        }
    }

    clearAllSelections() {
        this.selectedElements.forEach(el => this._removeSelectionClass(el));
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
        el.classList.remove(HIGHLIGHT_TARGET_CLASS, HIDE_HIGHLIGHT_TARGET_CLASS, HIGHLIGHT_TARGET_MODE_CLASS);
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

        const descriptors = Array.from(this.selectedElements).map(el => DomElementLocator.createDescriptor(el));
        let serialized: string;
        try {
            serialized = DomElementLocator.serialize(descriptors);
        } catch (e) {
            showToast('Failed to generate link. Please try selecting fewer items.');
            return;
        }

        const url = new URL(window.location.href);
        
        // Clear all potential params first
        url.searchParams.delete('cv-focus');
        url.searchParams.delete('cv-hide');
        url.searchParams.delete('cv-highlight');

        if (this.selectionMode === 'hide') {
            url.searchParams.set('cv-hide', serialized);
        } else if (this.selectionMode === 'highlight') {
            url.searchParams.set('cv-highlight', serialized);
        } else {
            url.searchParams.set('cv-focus', serialized);
        }

        // Copy to clipboard
        navigator.clipboard.writeText(url.href).then(() => {
            showToast('Link copied to clipboard!');
            this.toggleActive(false);
        }).catch(() => {
            showToast('Failed to copy to clipboard');
        });
    }

    previewLink() {
        if (this.selectedElements.size === 0) {
            showToast('Please select at least one item.');
            return;
        }

        const descriptors = Array.from(this.selectedElements).map(el => DomElementLocator.createDescriptor(el));
        const serialized = DomElementLocator.serialize(descriptors);

        const url = new URL(window.location.href);
        url.searchParams.delete('cv-focus');
        url.searchParams.delete('cv-hide');
        url.searchParams.delete('cv-highlight');
        
        if (this.selectionMode === 'hide') {
            url.searchParams.set('cv-hide', serialized);
        } else if (this.selectionMode === 'highlight') {
            url.searchParams.set('cv-highlight', serialized);
        } else {
            url.searchParams.set('cv-focus', serialized);
        }
        
        window.open(url.toString(), '_blank');
    }
}

export const shareStore = new ShareStore();
