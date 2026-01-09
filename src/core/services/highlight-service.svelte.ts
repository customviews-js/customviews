import { mount, unmount } from 'svelte';
import { showToast } from '../stores/toast-store.svelte';
import { focusStore } from '../stores/focus-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';
import HighlightOverlay from '../../components/highlight/HighlightOverlay.svelte';

export const HIGHLIGHT_PARAM = 'cv-highlight';

export const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';
const ARROW_OVERLAY_ID = 'cv-highlight-overlay';

import { type RectData } from './highlight-types';

export class HighlightService {
    private overlayApp: any;

    constructor(private rootEl: HTMLElement) {}

    public apply(encodedDescriptors: string): void {
        const descriptors = DomElementLocator.deserialize(encodedDescriptors);
        if (!descriptors || descriptors.length === 0) return;

        const targets: HTMLElement[] = [];
        descriptors.forEach(desc => {
            const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
            if (matchingEls && matchingEls.length > 0) {
                targets.push(...matchingEls);
            }
        });

        if (targets.length === 0) {
            showToast("Some highlighted sections could not be found.");
            this.exit(); 
            return;
        }

        if (targets.length < descriptors.length) {
            showToast("Some highlighted sections could not be found.");
        }

        // Activate Store
        focusStore.setIsActive(true);
        document.body.classList.add(BODY_HIGHLIGHT_CLASS);
        
        
        // Create Overlay across the entire page (App will be mounted into it)
        this.renderHighlightOverlay(targets);        
        
        // Scroll first target into view
        const firstTarget = targets[0];
        if (firstTarget) {
            setTimeout(() => {
                firstTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    public exit(): void {
        document.body.classList.remove(BODY_HIGHLIGHT_CLASS);

        const overlay = document.getElementById(ARROW_OVERLAY_ID);
        if (this.overlayApp) {
            unmount(this.overlayApp);
            this.overlayApp = undefined;
        }
        if (overlay) overlay.remove();
    }

    private renderHighlightOverlay(targets: HTMLElement[]) {
        let overlay = document.getElementById(ARROW_OVERLAY_ID);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = ARROW_OVERLAY_ID;
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = '';

        // 1. Group by Parent (Siblings)
        const groups = new Map<HTMLElement, HTMLElement[]>();
        
        targets.forEach(t => {
            const parent = t.parentElement || document.body;
            if (!groups.has(parent)) {
                groups.set(parent, []);
            }
            groups.get(parent)!.push(t);
        });

        // 2. Calculate Union Rect for each group
        const mergedRects: RectData[] = [];

        // Iterate groups to ensure strict adjacency
        for (const [parent, siblingsInGroup] of groups) {
            if (siblingsInGroup.length === 0) continue;

            // Optimization if only 1 child, no need to scan parent
            if (siblingsInGroup.length === 1) {
                this.addMergedRect(mergedRects, siblingsInGroup);
                continue;
            }

            // O(1) lookup
            const siblingsSet = new Set(siblingsInGroup);
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
                        this.addMergedRect(mergedRects, currentBatch);
                        currentBatch = [];
                    }
                }
            }
            // Finalize last batch
            if (currentBatch.length > 0) {
                this.addMergedRect(mergedRects, currentBatch);
            }
        }

        // 2. Render Overlay Component
        if (this.overlayApp) {
             unmount(this.overlayApp);
        }
        this.overlayApp = mount(HighlightOverlay, {
            target: overlay,
            props: {
                rects: mergedRects
            }
        });
    }

    private addMergedRect(resultList: any[], elements: HTMLElement[]) {
        if (elements.length === 0) return;

        let minTop = Infinity;
        let minLeft = Infinity;
        let maxRight = -Infinity;
        let maxBottom = -Infinity;

        elements.forEach(t => {
            const r = t.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            const top = r.top + scrollTop;
            const left = r.left + scrollLeft;
            const right = left + r.width;
            const bottom = top + r.height;

            if (top < minTop) minTop = top;
            if (left < minLeft) minLeft = left;
            if (right > maxRight) maxRight = right;
            if (bottom > maxBottom) maxBottom = bottom;
        });

        resultList.push({
            top: minTop,
            left: minLeft,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
            right: maxRight,
            bottom: maxBottom,
            element: elements[0]
        });
    }
}
