/**
 * Manages the "Focus Mode" (Presentation View).
 * Parses the URL for robust anchors, resolves them, hides irrelevant content, and inserts context dividers.
 */
import { ToastManager } from './toast-manager';
import { AnchorEngine } from './anchor-engine';
import { TOAST_CLASS } from '../../styles/toast-styles';
import {
    FOCUS_MODE_STYLES,
    FOCUS_MODE_STYLE_ID,
    BODY_FOCUS_CLASS,
    HIDDEN_CLASS,
    FOCUSED_CLASS,
    DIVIDER_CLASS,
    EXIT_BANNER_ID
} from '../../styles/focus-mode-styles';

const FOCUS_PARAM = 'cv-focus';

export interface FocusManagerOptions {
    excludedTags: string[];
    excludedIds: string[];
}

export class FocusManager {

    private hiddenElements = new Set<HTMLElement>();
    private dividers: HTMLElement[] = [];
    private exitBanner: HTMLElement | null = null;
    private excludedTags: Set<string>;
    private excludedIds: Set<string>;

    constructor(private rootEl: HTMLElement, options: FocusManagerOptions) {
        this.excludedTags = new Set(options.excludedTags.map(t => t.toUpperCase()));
        this.excludedIds = new Set(options.excludedIds);
    }

    /**
     * Initializes the Focus Manager. Checks URL for focus parameter.
     */
    public init(): void {
        this.handleUrlChange();
    }

    public handleUrlChange(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedDescriptors = urlParams.get(FOCUS_PARAM);

        if (encodedDescriptors) {
            this.applyFocusMode(encodedDescriptors);
        } else {
            // encoding missing, ensure we exit focus mode if active
            if (document.body.classList.contains(BODY_FOCUS_CLASS)) {
                this.exitFocusMode();
            }
        }
    }

    /**
     * Applies Focus Mode based on encoded descriptors.
     */
    public applyFocusMode(encodedDescriptors: string): void {
        const descriptors = AnchorEngine.deserialize(encodedDescriptors);
        if (!descriptors || descriptors.length === 0) return;

        // Resolve anchors to DOM elements
        const targets: HTMLElement[] = [];
        descriptors.forEach(desc => {
            const el = AnchorEngine.resolve(this.rootEl, desc);
            if (el) {
                targets.push(el);
            }
        });

        if (targets.length === 0) {
            ToastManager.show("Some shared sections could not be found.");
            return;
        }

        if (targets.length < descriptors.length) {
            ToastManager.show("Some shared sections could not be found.");
        }

        this.injectStyles();
        document.body.classList.add(BODY_FOCUS_CLASS);
        this.renderFocusedView(targets);
        this.showExitBanner();
    }

    private injectStyles(): void {
        if (document.getElementById(FOCUS_MODE_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = FOCUS_MODE_STYLE_ID;
        style.textContent = FOCUS_MODE_STYLES;
        document.head.appendChild(style);
    }

    /**
     * Hides irrelevant content and adds dividers.
     */
    private renderFocusedView(targets: HTMLElement[]): void {
        // 1. Mark targets
        targets.forEach(t => t.classList.add(FOCUSED_CLASS));

        // 2. We need to hide siblings of targets (and their ancestors up to root generally, 
        // but "siblings between focused zones" suggests we are mostly looking at a flat list or specific nesting).
        //
        // "All sibling elements between the focused zones are collapsed and hidden."
        // "If a user selects a parent element, all of its child elements must be visible."
        //
        // Algorithm:
        // Walk up from each target to finding the common container? 
        // Or just assume targets are somewhat related.
        //
        // Let's implement a robust "Hide Siblings" approach.
        // For every target, we ensure it is visible.
        // We look at its siblings. If a sibling is NOT a target AND NOT an ancestor of a target, we hide it.

        // We need to identify all "Keep Visible" elements (targets + ancestors)
        const keepVisible = new Set<HTMLElement>();
        targets.forEach(t => {
            let curr: HTMLElement | null = t;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                keepVisible.add(curr);
                curr = curr.parentElement;
            }
        });

        // Now iterate through siblings of "Keep Visible" elements?
        // Actually, we can just walk the tree or iterate siblings of targets/ancestors?
        //
        // Improved Algorithm: 
        // 1. Collect all direct siblings of every element in keepVisible set.
        // 2. If a sibling is NOT in keepVisible, hide it.

        // To avoid processing the entire DOM, we start from targets and walk up.
        keepVisible.forEach(el => {
            if (el === document.body) return; // Don't hide siblings of body (scripts etc) unless we are sure.
            // Actually usually we want to hide siblings of the content container.

            const parent = el.parentElement;
            if (!parent) return;

            // FIX: "Parent Dominance"
            // If the parent itself is a target (or we otherwise decided its whole content is meaningful),
            // then we should NOT hide anything inside it.
            // We check if 'parent' is one of the explicitly resolved targets.
            // We can check if it has the FOCUSED_CLASS class, since we added it in step 1.
            if (parent.classList.contains(FOCUSED_CLASS)) {
                return;
            }

            // Using children because we want element nodes
            Array.from(parent.children).forEach(child => {
                if (child instanceof HTMLElement && !keepVisible.has(child)) {
                    this.hideElement(child);
                }
            });
        });

        // 3. Insert Dividers
        // We process each container that has hidden elements
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
        if (this.hiddenElements.has(el)) return; // Already hidden

        // Exclude by Tag
        if (this.excludedTags.has(el.tagName.toUpperCase())) return;

        // Exclude by ID (if strictly matching)
        if (el.id && this.excludedIds.has(el.id)) return;

        // Also don't hide things that are aria-hidden
        if (el.getAttribute('aria-hidden') === 'true') return;

        // Exclude Toast Notification
        if (el.classList.contains(TOAST_CLASS)) return;

        // We check if it is already hidden (e.g. by previous focus mode run? No, isActive check handles that)
        // Just mark it.
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
                // Found a visible element. Was there a hidden group before this?
                if (hiddenCount > 0 && hiddenGroupStart) {
                    this.createDivider(container, hiddenGroupStart, hiddenCount);
                    hiddenCount = 0;
                    hiddenGroupStart = null;
                }
            }
        });

        // Trailing hidden group
        if (hiddenCount > 0 && hiddenGroupStart) {
            this.createDivider(container, hiddenGroupStart, hiddenCount);
        }
    }

    private createDivider(container: HTMLElement, insertBeforeEl: HTMLElement | null, count: number): void {
        const divider = document.createElement('div');
        divider.className = DIVIDER_CLASS;
        divider.textContent = `... ${count} section${count > 1 ? 's' : ''} hidden (Click to expand) ...`;
        divider.onclick = () => this.expandContext(insertBeforeEl, count, divider);

        container.insertBefore(divider, insertBeforeEl);
        this.dividers.push(divider);
    }

    private expandContext(firstHidden: HTMLElement | null, count: number, divider: HTMLElement) {
        // Divider is inserted BEFORE firstHidden.
        // So firstHidden is the first element to reveal.
        let curr: Element | null = firstHidden;
        let expanded = 0;

        while (curr && expanded < count) {
            if (curr instanceof HTMLElement && curr.classList.contains(HIDDEN_CLASS)) {
                curr.classList.remove(HIDDEN_CLASS);
                this.hiddenElements.delete(curr);
            }
            curr = curr.nextElementSibling;
            // Note: If nested dividers or other elements exist, they shouldn't count?
            // "Children" iteration in insertDividers covered direct children.
            // sibling iteration also covers direct children.
            // We assume contiguous hidden siblings.
            expanded++;
        }

        divider.remove();
        const idx = this.dividers.indexOf(divider);
        if (idx > -1) this.dividers.splice(idx, 1);

        // If no more hidden elements, remove the banner
        if (this.hiddenElements.size === 0) {
            this.removeExitBanner();
        }
    }

    private removeExitBanner(): void {
        if (this.exitBanner) {
            this.exitBanner.remove();
            this.exitBanner = null;
        }
    }

    /**
     * Override of renderFocusedView with robust logic
     */
    // (We use the class method `renderFocusedView` and internal helpers)

    private showExitBanner(): void {
        if (document.getElementById(EXIT_BANNER_ID)) return;

        const banner = document.createElement('div');
        banner.id = EXIT_BANNER_ID;
        banner.innerHTML = `
        <span>You are viewing a focused selection.</span>
        <button id="cv-exit-focus-btn">Show Full Page</button>
      `;
        document.body.prepend(banner); // Top of body

        banner.querySelector('button')?.addEventListener('click', () => this.exitFocusMode());
        this.exitBanner = banner;
    }

    public exitFocusMode(): void {
        document.body.classList.remove(BODY_FOCUS_CLASS);

        // Show all hidden elements
        this.hiddenElements.forEach(el => el.classList.remove(HIDDEN_CLASS));
        this.hiddenElements.clear();

        // Remove dividers
        this.dividers.forEach(d => d.remove());
        this.dividers = [];

        // Remove styling from targets
        const targets = document.querySelectorAll(`.${FOCUSED_CLASS}`);
        targets.forEach(t => t.classList.remove(FOCUSED_CLASS));

        // Remove banner
        this.removeExitBanner();

        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.delete(FOCUS_PARAM);
        window.history.pushState({}, '', url.toString());
    }


}
