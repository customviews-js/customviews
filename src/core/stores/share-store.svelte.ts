import { SvelteSet } from 'svelte/reactivity';
import { showToast } from './toast-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';

export const SELECTED_CLASS = 'cv-share-selected';
export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const HIDE_SELECTED_CLASS = 'cv-share-selected-hide';
export const HIDE_HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target-hide';
export const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
export const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, [data-share], ' + CV_CUSTOM_ELEMENTS;

export type SelectionMode = 'focus' | 'hide';

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
        
        this.clearAllSelections();
        
        this.selectionMode = mode;
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
        el.classList.add(this.selectionMode === 'hide' ? HIDE_HIGHLIGHT_TARGET_CLASS : HIGHLIGHT_TARGET_CLASS);
    }

    private _removeHighlightClass(el: HTMLElement) {
        el.classList.remove(HIGHLIGHT_TARGET_CLASS, HIDE_HIGHLIGHT_TARGET_CLASS);
    }

    private _addSelectionClass(el: HTMLElement) {
         el.classList.add(this.selectionMode === 'hide' ? HIDE_SELECTED_CLASS : SELECTED_CLASS);
    }

    private _removeSelectionClass(el: HTMLElement) {
        el.classList.remove(SELECTED_CLASS, HIDE_SELECTED_CLASS);
    }

    generateLink() {
        if (this.selectedElements.size === 0) {
            showToast('Please select at least one item.');
            return;
        }

        const descriptors = Array.from(this.selectedElements).map(el => DomElementLocator.createDescriptor(el));
        const serialized = DomElementLocator.serialize(descriptors);

        const url = new URL(window.location.href);
        
        // Clear both potential params first
        url.searchParams.delete('cv-focus');
        url.searchParams.delete('cv-hide');

        if (this.selectionMode === 'hide') {
            url.searchParams.set('cv-hide', serialized);
        } else {
            url.searchParams.set('cv-focus', serialized);
        }

        navigator.clipboard.writeText(url.toString())
            .then(() => showToast('Link copied to clipboard!'))
            .catch((e) => {
                console.error('Clipboard failed', e);
                showToast('Failed to copy link.');
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
         // Clear both potential params first
        url.searchParams.delete('cv-focus');
        url.searchParams.delete('cv-hide');
        
        if (this.selectionMode === 'hide') {
             url.searchParams.set('cv-hide', serialized);
        } else {
             url.searchParams.set('cv-focus', serialized);
        }
        
        window.open(url.toString(), '_blank');
    }
}

export const shareStore = new ShareStore();
