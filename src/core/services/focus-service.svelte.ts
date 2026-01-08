import { mount, unmount } from 'svelte';
import { focusStore } from '../stores/focus-store.svelte';
import { showToast } from '../stores/toast-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';
import FocusDivider from '../../components/focus/FocusDivider.svelte';

const FOCUS_PARAM = 'cv-focus';
const HIDE_PARAM = 'cv-hide';
const BODY_FOCUS_CLASS = 'cv-focus-mode';
const HIDDEN_CLASS = 'cv-focus-hidden';
const FOCUSED_CLASS = 'cv-focused-element';

import { DEFAULT_EXCLUDED_IDS, DEFAULT_EXCLUDED_TAGS } from '../constants';
import { type ShareExclusions } from '../../types/config'; 

export interface FocusServiceOptions {
    shareExclusions?: ShareExclusions;
}

export class FocusService {
    private hiddenElements = new Set<HTMLElement>();
    private dividers = new Set<any>(); // Store Svelte App instances
    private excludedTags: Set<string>;
    private excludedIds: Set<string>;
    private unsubscribe: () => void;

    constructor(private rootEl: HTMLElement, options: FocusServiceOptions) {
        const userTags = options.shareExclusions?.tags || [];
        const userIds = options.shareExclusions?.ids || [];
        
        this.excludedTags = new Set([...DEFAULT_EXCLUDED_TAGS, ...userTags].map(t => t.toUpperCase()));
        this.excludedIds = new Set([...DEFAULT_EXCLUDED_IDS, ...userIds]);
        
        // ...
        
        // Subscribe to store for exit signal
        // Subscribe to store for exit signal
        this.unsubscribe = $effect.root(() => {
            $effect(() => {
                if (!focusStore.isActive && document.body.classList.contains(BODY_FOCUS_CLASS)) {
                    this.exitFocusMode();
                }
            });
        });
    }

    public init(): void {
        this.handleUrlChange();
    }

    /**
     * Checks URL for focus param and applies focus mode if found.
     * If no focus param is found, exits focus mode if active.
     */
    public handleUrlChange(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const focusDescriptors = urlParams.get(FOCUS_PARAM);
        const hideDescriptors = urlParams.get(HIDE_PARAM);

        if (focusDescriptors) {
            this.applyFocusMode(focusDescriptors);
        } else if (hideDescriptors) {
            this.applyHideMode(hideDescriptors);
        } else {
            if (document.body.classList.contains(BODY_FOCUS_CLASS)) {
                this.exitFocusMode();
            }
        }
    }

    /**
     * Applies focus mode to the specified descriptors.
     * @param encodedDescriptors - The encoded descriptors to apply.
     */
    public applyFocusMode(encodedDescriptors: string): void {
        // Idempotency check? 
        // If already active, maybe we are switching focus? 
        // For now, let's just clear previous state if any to be safe
        if (document.body.classList.contains(BODY_FOCUS_CLASS)) {
            this.exitFocusMode();
        }

        const descriptors = DomElementLocator.deserialize(encodedDescriptors);
        if (!descriptors || descriptors.length === 0) return;

        // Resolve anchors to DOM elements
        const targets: HTMLElement[] = [];
        descriptors.forEach(desc => {
            const el = DomElementLocator.resolve(this.rootEl, desc);
            if (el) {
                targets.push(el);
            }
        });

        if (targets.length === 0) {
            showToast("Some shared sections could not be found.");
            return;
        }

        if (targets.length < descriptors.length) {
            showToast("Some shared sections could not be found.");
        }

        // Activate Store
        focusStore.setIsActive(true);
        document.body.classList.add(BODY_FOCUS_CLASS);
        
        // Inject structural styles for hiding
        this.injectGlobalStyles();

        this.renderFocusedView(targets);
    }

    public applyHideMode(encodedDescriptors: string): void {
        if (document.body.classList.contains(BODY_FOCUS_CLASS)) {
            this.exitFocusMode();
        }

        const descriptors = DomElementLocator.deserialize(encodedDescriptors);
        if (!descriptors || descriptors.length === 0) return;

        const targets: HTMLElement[] = [];
        descriptors.forEach(desc => {
            const el = DomElementLocator.resolve(this.rootEl, desc);
            if (el) {
                targets.push(el);
            }
        });

        if (targets.length === 0) {
            showToast("Some shared sections could not be found.");
            return;
        }

        // Activate Store
        focusStore.setIsActive(true);
        document.body.classList.add(BODY_FOCUS_CLASS);
        
        // Inject structural styles for hiding
        this.injectGlobalStyles();

        this.renderHiddenView(targets);
    }

    private renderHiddenView(targets: HTMLElement[]): void {
        // 1. Mark targets as hidden
        targets.forEach(t => {
            t.classList.add(HIDDEN_CLASS);
            this.hiddenElements.add(t);
        });

        // 2. Insert Dividers
        const processedContainers = new Set<HTMLElement>();
        targets.forEach(el => {
            const parent = el.parentElement;
            if (parent && !processedContainers.has(parent)) {
                this.insertDividersForContainer(parent);
                processedContainers.add(parent);
            }
        });
    }
    
    private injectGlobalStyles() {
        // We rely on MainWidget or global styles to provide .cv-focus-hidden { display: none !important }
        // But to be safe and self-contained:
        if (!document.getElementById('cv-focus-service-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-focus-service-styles';
            style.textContent = `
                .${HIDDEN_CLASS} { display: none !important; }
                body.${BODY_FOCUS_CLASS} { 
                    margin-top: 50px !important; 
                    transition: margin-top 0.2s;
                }
            `;
            document.head.appendChild(style);
        }
    }

    private renderFocusedView(targets: HTMLElement[]): void {
        // 1. Mark targets
        targets.forEach(t => t.classList.add(FOCUSED_CLASS));

        // 2. Identify Elements to Keep Visible (Targets + Ancestors)
        const keepVisible = new Set<HTMLElement>();
        targets.forEach(t => {
            let curr: HTMLElement | null = t;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                keepVisible.add(curr);
                curr = curr.parentElement;
            }
        });

        // 3. Hide Siblings
        keepVisible.forEach(el => {
            if (el === document.body) return;

            const parent = el.parentElement;
            if (!parent) return;

            // Parent Dominance: If parent is focused, don't hide its children
            if (parent.classList.contains(FOCUSED_CLASS)) {
                return;
            }

            Array.from(parent.children).forEach(child => {
                if (child instanceof HTMLElement && !keepVisible.has(child)) {
                    this.hideElement(child);
                }
            });
        });

        // 4. Insert Dividers
        const processedContainers = new Set<HTMLElement>();
        keepVisible.forEach(el => {
            const parent = el.parentElement;
            if (parent && !processedContainers.has(parent)) {
                this.insertDividersForContainer(parent);
                processedContainers.add(parent);
            }
        });
    }

    private hideElement(el: HTMLElement): void {
        if (this.hiddenElements.has(el)) return;
        if (this.excludedTags.has(el.tagName.toUpperCase())) return;
        if (el.id && this.excludedIds.has(el.id)) return;
        if (el.getAttribute('aria-hidden') === 'true') return;
        
        // Exclude Toast/Banner/Overlay
        if (el.closest('.toast-container') || el.id === 'cv-exit-focus-banner') return;

        // "Wrapper Problem": Don't hide a container if it contains structural components
        // e.g. <div id="footer-wrap"><footer>...</footer></div>
        // Limitation: This simple check prevents hiding ANY element containing these tags,
        // even if they are deep descendants or irrelevant. 
        // A more robust solution may check visibility/size.
        if (el.querySelector('header, footer, nav') !== null) return;

        el.classList.add(HIDDEN_CLASS);
        this.hiddenElements.add(el);
    }

    private insertDividersForContainer(container: HTMLElement): void {
        const children = Array.from(container.children) as HTMLElement[];
        let hiddenCount = 0;
        let hiddenGroupStart: HTMLElement | null = null;

        children.forEach((child) => {
            if (child.classList.contains(HIDDEN_CLASS)) {
                if (hiddenCount === 0) hiddenGroupStart = child;
                hiddenCount++;
            } else {
                if (hiddenCount > 0 && hiddenGroupStart) {
                    this.createDivider(container, hiddenGroupStart, hiddenCount);
                    hiddenCount = 0;
                    hiddenGroupStart = null;
                }
            }
        });

        if (hiddenCount > 0 && hiddenGroupStart) {
            this.createDivider(container, hiddenGroupStart, hiddenCount);
        }
    }

    private createDivider(container: HTMLElement, insertBeforeEl: HTMLElement, count: number): void {
        // Create a wrapper div for the component because `mount` needs a target
        // But we want to insert IN PLACE. 
        // `mount` prop `target` appends by default.
        // We can create a div, insert it, then mount into it.
        const wrapper = document.createElement('div');
        wrapper.className = 'cv-divider-wrapper'; // Helper class for cleanup if needed
        container.insertBefore(wrapper, insertBeforeEl);

        const app = mount(FocusDivider, {
            target: wrapper,
            props: {
                hiddenCount: count,
                onExpand: () => {
                    this.expandContext(insertBeforeEl, count, app, wrapper);
                }
            }
        });
        
        this.dividers.add(app);
    }

    private expandContext(firstHidden: HTMLElement, count: number, app: any, wrapper: HTMLElement) {
        let curr: Element | null = firstHidden;
        let expanded = 0;

        // Safety: ensure we only expand up to `count` elements AND they are actually the ones we hid
        // The DOM might have changed, so we check for the class.
        while (curr && expanded < count) {
            if (curr instanceof HTMLElement && curr.classList.contains(HIDDEN_CLASS)) {
                curr.classList.remove(HIDDEN_CLASS);
                this.hiddenElements.delete(curr);
            }
            curr = curr.nextElementSibling;
            expanded++;
        }

        // Cleanup
        unmount(app);
        this.dividers.delete(app);
        wrapper.remove();

        // If no more hidden elements, exit completely
        if (this.hiddenElements.size === 0) {
            focusStore.exit(); // This triggers exitFocusMode logic via subscription
        }
    }

    public exitFocusMode(): void {
        document.body.classList.remove(BODY_FOCUS_CLASS);
        
        this.hiddenElements.forEach(el => el.classList.remove(HIDDEN_CLASS));
        this.hiddenElements.clear();

        // Remove dividers
        this.dividers.forEach(app => unmount(app));
        this.dividers.clear();
        
        // Remove wrappers? 
        document.querySelectorAll('.cv-divider-wrapper').forEach(el => el.remove());

        // Remove styling from targets
        const targets = document.querySelectorAll(`.${FOCUSED_CLASS}`);
        targets.forEach(t => t.classList.remove(FOCUSED_CLASS));
        
        focusStore.setIsActive(false);

        // Update URL
        const url = new URL(window.location.href);
        if (url.searchParams.has(FOCUS_PARAM)) {
            url.searchParams.delete(FOCUS_PARAM);
            window.history.pushState({}, '', url.toString());
        }
    }

    public destroy() {
        this.exitFocusMode();
        this.unsubscribe();
    }
}
