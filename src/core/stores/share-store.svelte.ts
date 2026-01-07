import { showToast } from './toast-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';

export const SELECTED_CLASS = 'cv-share-selected';
export const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
export const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
export const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, [data-share], ' + CV_CUSTOM_ELEMENTS;

export class ShareStore {
    isActive = $state(false);
    selectedElements = $state(new Set<HTMLElement>());
    currentHoverTarget = $state<HTMLElement | null>(null);

    shareCount = $derived(this.selectedElements.size);

    toggleActive(active?: boolean) {
        const newState = active !== undefined ? active : !this.isActive;
        if (!newState) {
            // Cleanup on deactivate
            this.selectedElements.forEach(el => el.classList.remove(SELECTED_CLASS));
            if (this.currentHoverTarget) {
                this.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
            }
            
            // Reset state
            this.isActive = false;
            this.selectedElements.clear();
            this.currentHoverTarget = null;
        } else {
            this.isActive = true;
        }
    }

    setHoverTarget(target: HTMLElement | null) {
        // Clear previous highlight
        if (this.currentHoverTarget && this.currentHoverTarget !== target) {
            this.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
        }
        
        // Set new highlight
        if (target) {
            target.classList.add(HIGHLIGHT_TARGET_CLASS);
        }
        
        this.currentHoverTarget = target;
    }

    toggleSelection(el: HTMLElement) {
        if (this.selectedElements.has(el)) {
            this.selectedElements.delete(el);
            el.classList.remove(SELECTED_CLASS);
        } else {
            // Selection Logic
            
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
                child.classList.remove(SELECTED_CLASS);
            });

            // Add
            this.selectedElements.add(el);
            el.classList.add(SELECTED_CLASS);
        }
    }

    clearSelection() {
        this.selectedElements.forEach(el => el.classList.remove(SELECTED_CLASS));
        this.selectedElements.clear();
    }

    generateLink() {
        if (this.selectedElements.size === 0) {
            showToast('Please select at least one item.');
            return;
        }

        const descriptors = Array.from(this.selectedElements).map(el => DomElementLocator.createDescriptor(el));
        const serialized = DomElementLocator.serialize(descriptors);

        const url = new URL(window.location.href);
        url.searchParams.set('cv-focus', serialized);

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
        url.searchParams.set('cv-focus', serialized);
        window.open(url.toString(), '_blank');
    }
}

export const shareStore = new ShareStore();
