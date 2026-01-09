import { mount, unmount, untrack } from 'svelte';
import { focusStore } from '../stores/focus-store.svelte';
import { showToast } from '../stores/toast-store.svelte';
import * as DomElementLocator from '../utils/dom-element-locator';
import FocusDivider from '../../components/focus/FocusDivider.svelte';
import { SvelteURL } from 'svelte/reactivity';

const FOCUS_PARAM = 'cv-focus';
const HIDE_PARAM = 'cv-hide';
const HIGHLIGHT_PARAM = 'cv-highlight';
const BODY_FOCUS_CLASS = 'cv-focus-mode';
const HIDDEN_CLASS = 'cv-focus-hidden';
const FOCUSED_CLASS = 'cv-focused-element';
const HIGHLIGHT_ACTIVE_CLASS = 'cv-highlight-active';
const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';

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
    // Call unsubscribe in destroy to stop svelte effects
    private unsubscribe: () => void;
    private url = new SvelteURL(window.location.href);

    constructor(private rootEl: HTMLElement, options: FocusServiceOptions) {
        const userTags = options.shareExclusions?.tags || [];
        const userIds = options.shareExclusions?.ids || [];
        
        this.excludedTags = new Set([...DEFAULT_EXCLUDED_TAGS, ...userTags].map(t => t.toUpperCase()));
        this.excludedIds = new Set([...DEFAULT_EXCLUDED_IDS, ...userIds]);
        
        // Subscribe to store for exit signal
        this.unsubscribe = $effect.root(() => {
            // 1. Sync URL changes from SvelteURL back to browser history (UI changes affect URL)
            // This effect handles the "Write" direction: App State -> URL
            $effect(() => {
                const currentFromBrowser = window.location.href;
                // Cycle prevention: Only push if the SvelteURL has changed/diverged from browser
                if (currentFromBrowser !== this.url.href) {
                     window.history.pushState({}, '', this.url.href);
                }
            });

            // 2. React to URL changes (URL changes affect UI)
            // This effect handles the "Read" direction: URL -> App State
            $effect(() => {
                const focusDescriptors = this.url.searchParams.get(FOCUS_PARAM);
                const hideDescriptors = this.url.searchParams.get(HIDE_PARAM);
                const highlightDescriptors = this.url.searchParams.get(HIGHLIGHT_PARAM);

                untrack(() => {
                    if (focusDescriptors) {
                        this.applyFocusMode(focusDescriptors);
                    } else if (hideDescriptors) {
                        this.applyHideMode(hideDescriptors);
                    } else if (highlightDescriptors) { 
                         this.applyHighlightMode(highlightDescriptors);
                    } else {
                        if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
                            this.exitFocusMode();
                        }
                    }
                });
            });

            // Store safety check (Store changes affect UI)
            $effect(() => {
                if (!focusStore.isActive && (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS))) {
                    this.exitFocusMode();
                }
            });
        });

        // Listen for popstate to sync back to SvelteURL
        window.addEventListener('popstate', this.handlePopState);
    }

    /**
     * Sync native browser navigation with SvelteURL
     */
    private handlePopState = () => {
        this.url.href = window.location.href;
    }

    /**
     * Applies focus mode to the specified descriptors.
     * @param encodedDescriptors - The encoded descriptors to apply.
     */
    public applyFocusMode(encodedDescriptors: string): void {
        // Check if we are already in the right state to avoid re-rendering loops if feasible
        if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
             // If we are already active, we might want to check if descriptors changed?
             // For now, simple clear and re-apply.
            this.exitFocusMode(false); // don't clear URL here
        }

        const descriptors = DomElementLocator.deserialize(encodedDescriptors);
        if (!descriptors || descriptors.length === 0) return;

        // Resolve anchors to DOM elements
        const targets: HTMLElement[] = [];
        descriptors.forEach(desc => {
            const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
            if (matchingEls && matchingEls.length > 0) {
                targets.push(...matchingEls);
            }
        });

        if (targets.length === 0) {
            showToast("Some shared sections could not be found.");
            this.exitFocusMode(); // Clears URL and resets state, preventing effect loop
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
        if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
            this.exitFocusMode(false);
        }

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
            showToast("Some shared sections could not be found.");
            this.exitFocusMode(); // Clears URL and resets state
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

        this.renderHiddenView(targets);
    }

    public applyHighlightMode(encodedDescriptors: string): void {
        if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
            this.exitFocusMode(false);
        }

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
            this.exitFocusMode(); 
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

        // Mark targets
        targets.forEach(t => t.classList.add(HIGHLIGHT_ACTIVE_CLASS));

        // Scroll first target into view
        const firstTarget = targets[0];
        if (firstTarget) {
            setTimeout(() => {
                firstTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
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
        if (!document.getElementById('cv-focus-service-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-focus-service-styles';
            style.textContent = `
                .${HIDDEN_CLASS} { display: none !important; }
                body.${BODY_FOCUS_CLASS} { 
                    margin-top: 50px !important; 
                    transition: margin-top 0.2s;
                }
                .${HIGHLIGHT_ACTIVE_CLASS} {
                    outline: 4px solid #d13438 !important;
                    outline-offset: 4px;
                    box-shadow: 0 0 0 4px rgba(209, 52, 56, 0.2);
                    position: relative;
                    z-index: 10;
                }
                .${HIGHLIGHT_ACTIVE_CLASS}::before {
                    content: '→';
                    position: absolute;
                    left: -40px;
                    top: 0;
                    font-size: 30px;
                    color: #d13438;
                    font-weight: bold;
                    animation: floatArrow 1.5s infinite;
                }
                @keyframes floatArrow {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-10px); }
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
        
        // Exclude Toast/Banner/Overlay/SettingsIcon/WidgetRoot
        if (el.closest('.toast-container') 
            || el.id === 'cv-exit-focus-banner' 
            || el.classList.contains('cv-settings-icon')
            || el.classList.contains('cv-widget-root')) return;

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
        const wrapper = document.createElement('div');
        wrapper.className = 'cv-divider-wrapper';
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
            focusStore.exit(); 
        }
    }

    public exitFocusMode(updateUrl = true): void {
        document.body.classList.remove(BODY_FOCUS_CLASS, BODY_HIGHLIGHT_CLASS);
        
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
        
        const highlights = document.querySelectorAll(`.${HIGHLIGHT_ACTIVE_CLASS}`);
        highlights.forEach(h => h.classList.remove(HIGHLIGHT_ACTIVE_CLASS));
        
        if (focusStore.isActive) {
             focusStore.setIsActive(false);
        }

        if (updateUrl) {
            if (this.url.searchParams.has(FOCUS_PARAM)) {
                this.url.searchParams.delete(FOCUS_PARAM);
            }
            if (this.url.searchParams.has(HIDE_PARAM)) {
                this.url.searchParams.delete(HIDE_PARAM);
            }
            if (this.url.searchParams.has(HIGHLIGHT_PARAM)) {
                this.url.searchParams.delete(HIGHLIGHT_PARAM);
            }
        }
    }

    public destroy() {
        this.exitFocusMode();
        this.unsubscribe();
        window.removeEventListener('popstate', this.handlePopState);
    }
}
