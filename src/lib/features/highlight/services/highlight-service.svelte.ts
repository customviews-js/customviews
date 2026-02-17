/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount } from 'svelte';
import { showToast } from '$features/notifications/stores/toast-store.svelte';
import { focusStore } from '$features/focus/stores/focus-store.svelte';
import * as DomElementLocator from '$lib/utils/dom-element-locator';
import { scrollToElement } from '$lib/utils/scroll-utils';
import HighlightOverlay from '$features/highlight/HighlightOverlay.svelte';
import { groupSiblings, calculateMergedRects } from '../highlight-logic';

export const HIGHLIGHT_PARAM = 'cv-highlight';

export const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';
const ARROW_OVERLAY_ID = 'cv-highlight-overlay';

import { type RectData } from './highlight-types';

export class HighlightState {
  rects = $state<RectData[]>([]);
}

export class HighlightService {
  private overlayApp: any;
  private state = new HighlightState();
  private resizeObserver: ResizeObserver;
  private activeTargets: HTMLElement[] = [];
  private onWindowResize = () => this.updatePositions();

  constructor(private rootEl: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.updatePositions();
    });
  }

  public apply(encodedDescriptors: string): void {
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
      showToast('Some highlighted sections could not be found.');
      this.exit();
      return;
    }

    if (targets.length < descriptors.length) {
      showToast('Some highlighted sections could not be found.');
    }

    // Activate Store
    focusStore.setIsActive(true);
    document.body.classList.add(BODY_HIGHLIGHT_CLASS);

    // Create Overlay across the entire page (App will be mounted into it)
    this.activeTargets = targets;

    // Start observing
    this.activeTargets.forEach((t) => this.resizeObserver.observe(t));
    this.resizeObserver.observe(document.body); // Catch layout shifts
    window.addEventListener('resize', this.onWindowResize);

    this.renderHighlightOverlay();

    // Scroll first target into view with header offset awareness
    const firstTarget = targets[0];
    if (firstTarget) {
      // Use double-RAF to ensure layout stability (e.g. Svelte updates, animations)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToElement(firstTarget);
        });
      });
    }
  }

  public exit(): void {
    document.body.classList.remove(BODY_HIGHLIGHT_CLASS);

    this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.activeTargets = [];
    this.state.rects = [];

    const overlay = document.getElementById(ARROW_OVERLAY_ID);
    if (this.overlayApp) {
      unmount(this.overlayApp);
      this.overlayApp = undefined;
    }
    if (overlay) overlay.remove();
  }

  private renderHighlightOverlay() {
    let overlay = document.getElementById(ARROW_OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = ARROW_OVERLAY_ID;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = '';

    // Initial calc
    this.updatePositions();

    // 2. Render Overlay Component
    if (this.overlayApp) {
      unmount(this.overlayApp);
    }
    this.overlayApp = mount(HighlightOverlay, {
      target: overlay,
      props: {
        box: this.state,
      },
    });
  }

  private updatePositions() {
    if (this.activeTargets.length === 0) {
      this.state.rects = [];
      return;
    }

    // Group by Parent (Siblings)
    const groups = groupSiblings(this.activeTargets);

    // Calculate Union Rect for each group
    this.state.rects = calculateMergedRects(
      groups,
      (el) => el.getBoundingClientRect(),
      () => ({
        scrollTop: window.pageYOffset || document.documentElement.scrollTop,
        scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
      }),
    );
  }
}
