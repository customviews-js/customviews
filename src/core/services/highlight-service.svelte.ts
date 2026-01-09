import { showToast } from '../stores/toast-store.svelte';
import { focusStore } from '../stores/focus-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';

export const HIGHLIGHT_PARAM = 'cv-highlight';
export const HIGHLIGHT_ACTIVE_CLASS = 'cv-highlight-active';
export const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';
const ARROW_OVERLAY_ID = 'cv-highlight-overlay';

export class HighlightService {
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
        
        // Inject styles
        this.injectGlobalStyles();

        // Create Overlay for Highlights (Arrows + Boxes)
        // We do NOT add HIGHLIGHT_ACTIVE_CLASS to targets because we draw boxes in the overlay
        
        // Mark targets for internal tracking if needed, but remove visual style class
        targets.forEach(t => t.classList.add(HIGHLIGHT_ACTIVE_CLASS)); 

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
        
        const highlights = document.querySelectorAll(`.${HIGHLIGHT_ACTIVE_CLASS}`);
        highlights.forEach(h => {
             h.classList.remove(HIGHLIGHT_ACTIVE_CLASS);
        });

        const overlay = document.getElementById(ARROW_OVERLAY_ID);
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
        type RectData = {
            top: number;
            left: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
            element: HTMLElement;
        };
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

        // 2. Render Boxes and Arrows
        mergedRects.forEach(rect => {
            // Box
            const box = document.createElement('div');
            box.className = 'cv-highlight-box';
            box.style.top = `${rect.top}px`;
            box.style.left = `${rect.left}px`;
            box.style.width = `${rect.width}px`;
            box.style.height = `${rect.height}px`;
            overlay!.appendChild(box);

            // Arrow
            const arrow = document.createElement('div');
            arrow.className = 'cv-highlight-arrow';
            
            // Logic for direction (Relative to the MERGED rect)
            const viewportWidth = window.innerWidth;
            
            // Simple viewport relative check for left side (approximation)
            const rectLeftViewport = rect.left - (window.pageXOffset || document.documentElement.scrollLeft);

            // Default Left
            if (rectLeftViewport >= 50) {
                 arrow.classList.add('left');
                 arrow.style.top = `${rect.top}px`; // Top aligned with box start
                 arrow.style.left = `${rect.left - 40}px`;
                 arrow.innerHTML = '→';
            } else if (viewportWidth - (rectLeftViewport + rect.width) >= 50) {
                 // Right
                 arrow.classList.add('right');
                 arrow.style.top = `${rect.top}px`;
                 arrow.style.left = `${rect.left + rect.width + 10}px`;
                 arrow.innerHTML = '←';
            } else if (rect.top - (window.pageYOffset || document.documentElement.scrollTop) >= 50) {
                 // Top
                 arrow.classList.add('top');
                 arrow.style.top = `${rect.top - 40}px`;
                 arrow.style.left = `${rect.left + (rect.width / 2) - 15}px`;
                 arrow.innerHTML = '↓';
            } else {
                 // Bottom
                 arrow.classList.add('bottom');
                 arrow.style.top = `${rect.top + rect.height + 10}px`;
                 arrow.style.left = `${rect.left + (rect.width / 2) - 15}px`;
                 arrow.innerHTML = '↑';
            }
            
            overlay!.appendChild(arrow);
        });
    }

    private injectGlobalStyles() {
        if (!document.getElementById('cv-highlight-service-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-highlight-service-styles';
            style.textContent = `
                .cv-highlight-box {
                    position: absolute;
                    border: 4px solid #d13438;
                    box-shadow: 0 0 0 4px rgba(209, 52, 56, 0.2);
                    pointer-events: none;
                }
                #${ARROW_OVERLAY_ID} {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2147483647; /* Max z-index */
                    overflow: visible;
                }
                .cv-highlight-arrow {
                    position: absolute;
                    font-size: 30px;
                    color: #d13438;
                    font-weight: bold;
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                }
                .cv-highlight-arrow.left { animation: floatArrowLeft 1.5s infinite; }
                .cv-highlight-arrow.right { animation: floatArrowRight 1.5s infinite; }
                .cv-highlight-arrow.top { animation: floatArrowTop 1.5s infinite; }
                .cv-highlight-arrow.bottom { animation: floatArrowBottom 1.5s infinite; }

                @keyframes floatArrowLeft {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-10px); }
                }
                @keyframes floatArrowRight {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(10px); }
                }
                @keyframes floatArrowTop {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -10px); }
                }
                @keyframes floatArrowBottom {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, 10px); }
                }
            `;
            document.head.appendChild(style);
        }
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
