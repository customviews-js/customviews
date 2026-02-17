/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount, untrack } from 'svelte';
import { focusStore } from '$features/focus/stores/focus-store.svelte';
import { showToast } from '$lib/stores/toast-store.svelte';
import * as DomElementLocator from '$lib/utils/dom-element-locator';
import FocusDivider from '$features/focus/FocusDivider.svelte';
import { determineHiddenElements, isElementExcluded, calculateDividerGroups } from '../focus-logic';
import { SvelteSet, SvelteURL } from 'svelte/reactivity';

const SHOW_PARAM = 'cv-show';
const HIDE_PARAM = 'cv-hide';
const BODY_SHOW_CLASS = 'cv-show-mode';
const HIDDEN_CLASS = 'cv-hidden';
const SHOW_ELEMENT_CLASS = 'cv-show-element';

import {
  HighlightService,
  BODY_HIGHLIGHT_CLASS,
  HIGHLIGHT_PARAM,
} from '$features/highlight/services/highlight-service.svelte';

import { DEFAULT_EXCLUDED_IDS, DEFAULT_EXCLUDED_TAGS } from '$lib/exclusion-defaults';
import type { ShareExclusions } from '$features/share/types';

export interface FocusServiceOptions {
  shareExclusions?: ShareExclusions;
}

export class FocusService {
  private hiddenElements = new SvelteSet<HTMLElement>();
  private dividers = new SvelteSet<any>(); // Store Svelte App instances
  private excludedTags: Set<string>;
  private excludedIds: Set<string>;
  // Call unsubscribe in destroy to stop svelte effects
  private unsubscribe: () => void;
  private url = new SvelteURL(window.location.href);
  private highlightService: HighlightService;

  constructor(
    private rootEl: HTMLElement,
    options: FocusServiceOptions,
  ) {
    const userTags = options.shareExclusions?.tags || [];
    const userIds = options.shareExclusions?.ids || [];

    this.excludedTags = new SvelteSet(
      [...DEFAULT_EXCLUDED_TAGS, ...userTags].map((t) => t.toUpperCase()),
    );
    this.excludedIds = new SvelteSet([...DEFAULT_EXCLUDED_IDS, ...userIds]);

    this.highlightService = new HighlightService(this.rootEl);

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
        // Check cv-show first
        const showDescriptors = this.url.searchParams.get(SHOW_PARAM);
        const hideDescriptors = this.url.searchParams.get(HIDE_PARAM);
        const highlightDescriptors = this.url.searchParams.get(HIGHLIGHT_PARAM);

        untrack(() => {
          if (showDescriptors) {
            this.applyShowMode(showDescriptors);
          } else if (hideDescriptors) {
            this.applyHideMode(hideDescriptors);
          } else if (highlightDescriptors) {
            this.applyHighlightMode(highlightDescriptors);
          } else {
            if (
              document.body.classList.contains(BODY_SHOW_CLASS) ||
              document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
            ) {
              this.exitShowMode();
            }
          }
        });
      });

      // Store safety check (Store changes affect UI)
      $effect(() => {
        if (
          !focusStore.isActive &&
          (document.body.classList.contains(BODY_SHOW_CLASS) ||
            document.body.classList.contains(BODY_HIGHLIGHT_CLASS))
        ) {
          this.exitShowMode();
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
  };

  /**
   * Applies focus mode to the specified descriptors.
   * @param encodedDescriptors - The encoded descriptors to apply.
   */
  public applyShowMode(encodedDescriptors: string): void {
    // Check if we are already in the right state to avoid re-rendering loops if feasible
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      // If we are already active, we might want to check if descriptors changed?
      // For now, simple clear and re-apply.
      this.exitShowMode(false); // don't clear URL here
    }

    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return;

    // Resolve anchors to DOM elements
    const targets: HTMLElement[] = [];
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) {
        targets.push(...matchingEls);
      }
    });

    if (targets.length === 0) {
      showToast('Some shared sections could not be found.');
      this.exitShowMode(); // Clears URL and resets state, preventing effect loop
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some shared sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_SHOW_CLASS);

    this.renderShowView(targets);
  }

  public applyHideMode(encodedDescriptors: string): void {
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      this.exitShowMode(false);
    }

    const descriptors = DomElementLocator.deserialize(encodedDescriptors);
    if (!descriptors || descriptors.length === 0) return;

    const targets: HTMLElement[] = [];
    descriptors.forEach((desc) => {
      const matchingEls = DomElementLocator.resolve(this.rootEl, desc);
      if (matchingEls && matchingEls.length > 0) {
        targets.push(...matchingEls);
      }
    });

    if (targets.length === 0) {
      showToast('Some shared sections could not be found.');
      this.exitShowMode(); // Clears URL and resets state
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some shared sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_SHOW_CLASS);

    this.renderHiddenView(targets);
  }

  public applyHighlightMode(encodedDescriptors: string): void {
    if (
      document.body.classList.contains(BODY_SHOW_CLASS) ||
      document.body.classList.contains(BODY_HIGHLIGHT_CLASS)
    ) {
      this.exitShowMode(false);
    }
    this.highlightService.apply(encodedDescriptors);
  }

  private renderHiddenView(targets: HTMLElement[]): void {
    // 1. Mark targets as hidden
    targets.forEach((t) => {
      t.classList.add(HIDDEN_CLASS);
      this.hiddenElements.add(t);
    });

    // 2. Insert Dividers
    const processedContainers = new SvelteSet<HTMLElement>();
    targets.forEach((el) => {
      const parent = el.parentElement;
      if (parent && !processedContainers.has(parent)) {
        this.insertDividersForContainer(parent);
        processedContainers.add(parent);
      }
    });
  }

  private renderShowView(targets: HTMLElement[]): void {
    // 1. Mark targets
    targets.forEach((t) => t.classList.add(SHOW_ELEMENT_CLASS));

    // 2. Determine what to hide
    const elementsToHide = determineHiddenElements(targets, document.body, (el) =>
      isElementExcluded(el, {
        hiddenElements: this.hiddenElements,
        excludedTags: this.excludedTags,
        excludedIds: this.excludedIds,
      }),
    );

    // 3. Apply changes (Hide & Track)
    elementsToHide.forEach((el) => {
      el.classList.add(HIDDEN_CLASS);
      this.hiddenElements.add(el);
    });

    // 4. Identify Elements to Keep Visible (Targets + Ancestors)
    // We still need this for divider insertion optimization?
    // Actually insertDividersForContainer uses processedContainers logic.
    const keepVisible = new SvelteSet<HTMLElement>();
    targets.forEach((t) => {
      let curr: HTMLElement | null = t;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        keepVisible.add(curr);
        curr = curr.parentElement;
      }
    });

    // 5. Insert Dividers
    const processedContainers = new SvelteSet<HTMLElement>();
    keepVisible.forEach((el) => {
      const parent = el.parentElement;
      if (parent && !processedContainers.has(parent)) {
        this.insertDividersForContainer(parent);
        processedContainers.add(parent);
      }
    });
  }

  private insertDividersForContainer(container: HTMLElement): void {
    const children = Array.from(container.children) as HTMLElement[];
    const isHidden = (el: HTMLElement) => el.classList.contains(HIDDEN_CLASS);

    const groups = calculateDividerGroups(children, isHidden);

    groups.forEach((group) => {
      // Insert the divider before first hidden element of the group.
      this.createDivider(container, group.startNode, group.count);
    });
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
        },
      },
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

  public exitShowMode(updateUrl = true): void {
    document.body.classList.remove(BODY_SHOW_CLASS, BODY_HIGHLIGHT_CLASS);

    this.hiddenElements.forEach((el) => el.classList.remove(HIDDEN_CLASS));
    this.hiddenElements.clear();

    // Remove dividers
    this.dividers.forEach((app) => unmount(app));
    this.dividers.clear();

    // Remove wrappers?
    document.querySelectorAll('.cv-divider-wrapper').forEach((el) => el.remove());

    // Remove styling from targets
    const targets = document.querySelectorAll(`.${SHOW_ELEMENT_CLASS}`);
    targets.forEach((t) => t.classList.remove(SHOW_ELEMENT_CLASS));

    this.highlightService.exit();

    if (focusStore.isActive) {
      focusStore.setIsActive(false);
    }

    if (updateUrl) {
      if (this.url.searchParams.has(SHOW_PARAM)) {
        this.url.searchParams.delete(SHOW_PARAM);
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
    this.exitShowMode();
    this.unsubscribe();
    window.removeEventListener('popstate', this.handlePopState);
  }
}
