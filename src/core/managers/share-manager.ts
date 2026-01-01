
import { showToast } from '../stores/toast-store';
import { AnchorEngine } from './anchor-engine';

import {
  SHARE_MODE_STYLES,
  SHARE_MODE_STYLE_ID,
  FLOATING_ACTION_BAR_ID,
  HOVER_HELPER_ID,
  HIGHLIGHT_TARGET_CLASS,
  SELECTED_CLASS
} from '../../styles/share-mode-styles';

const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, [data-share], ' + CV_CUSTOM_ELEMENTS;

// TODO: Add interface for plugin users to define what is excluded selection.
// const EXCLUDED_ELEMENTS = 'header, nav, footer';
// const EXCLUDED_IDS = 'cv-floating-action-bar';

export interface ShareManagerOptions {
  excludedTags: string[];
  excludedIds: string[];
}

/**
 * Manages the "Share Mode" for creating custom focus links.
 * Implementing Robust Granular Sharing with "Innermost Wins" and "Level Up" UI.
 */
export class ShareManager {
  private isActive = false;
  private selectedElements = new Set<HTMLElement>();
  private floatingBarEl: HTMLElement | null = null;
  private helperEl: HTMLElement | null = null;
  private currentHoverTarget: HTMLElement | null = null;
  private excludedTags: Set<string>;
  private excludedIds: Set<string>;
  private boundHandleHover: (e: MouseEvent) => void;
  private boundHandleClick: (e: MouseEvent) => void;
  private boundHandleKeydown: (e: KeyboardEvent) => void;

  constructor(options: ShareManagerOptions) {
    this.excludedTags = new Set(options.excludedTags.map(t => t.toUpperCase()));
    this.excludedIds = new Set(options.excludedIds);
    this.boundHandleHover = this.handleHover.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);
  }

  private listeners: Array<(isActive: boolean) => void> = [];

  public addStateChangeListener(listener: (isActive: boolean) => void): void {
    this.listeners.push(listener);
  }

  public removeStateChangeListener(listener: (isActive: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isActive));
  }

  public toggleShareMode(): void {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.activate();
    } else {
      this.cleanup();
    }
    this.notifyListeners();
  }

  /**
   * Activates the share mode.
   * Injects styles, creates floating bar, and helper element.
   * Adds event listeners for hover and click.
   */
  private activate(): void {
    this.injectStyles();
    this.createFloatingBar();
    this.helperEl = this.createHelperPopover();

    // Event Listeners
    document.addEventListener('mouseover', this.boundHandleHover, true);
    document.addEventListener('click', this.boundHandleClick, true);
    document.addEventListener('keydown', this.boundHandleKeydown, true);
  }

  private injectStyles(): void {
    const styleElement = document.createElement('style');
    styleElement.id = SHARE_MODE_STYLE_ID;
    styleElement.innerHTML = SHARE_MODE_STYLES;
    document.head.appendChild(styleElement);
  }

  /**
   * Creates the hover helper element that shows up when hovering over a shareable element.
   */
  private createHelperPopover(): HTMLElement {
    const div = document.createElement('div');
    div.id = HOVER_HELPER_ID;
    div.innerHTML = `
      <span id="cv-helper-tag">TAG</span>
      <button id="cv-helper-select-btn" title="Select This Element">✓</button>
      <button id="cv-helper-up-btn" title="Select Parent">↰</button>
    `;
    document.body.appendChild(div);

    // Select parent button
    div.querySelector('#cv-helper-up-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleSelectParent();
    });

    // Select element button
    div.querySelector('#cv-helper-select-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentHoverTarget) {
        this.toggleSelection(this.currentHoverTarget);
      }
    });

    return div;
  }

  /**
   * Handles mouse hover events.
   *
   * This function is called when the user hovers over an element.
   * It checks if the element is shareable and highlights it.
   * If a parent element is already selected, it highlights the parent instead,
   * allowing the helper to remain visible for the selected parent.
   *
   * @param e The mouse event triggered by the hover.
   */
  private handleHover(e: MouseEvent): void {
    if (!this.isActive) return;

    // Check if we are hovering over the helper itself
    if (this.helperEl && this.helperEl.contains(e.target as Node)) {
      return;
    }

    const target = e.target as HTMLElement;

    // Exclude by Tag or ID
    const upperTag = target.tagName.toUpperCase();
    if (this.excludedTags.has(upperTag) || (target.id && this.excludedIds.has(target.id))) {
      return;
    }

    // Check closest excluded (for nested elements in excluded regions)
    let ancestor = target.parentElement;
    while (ancestor) {
      if (this.excludedTags.has(ancestor.tagName.toUpperCase()) || (ancestor.id && this.excludedIds.has(ancestor.id))) {
        return;
      }
      ancestor = ancestor.parentElement;
    }

    // Find closest shareable parent element
    const shareablePart = target.closest(SHAREABLE_SELECTOR);
    if (!shareablePart) {
      this.clearHover();
      return;
    }

    // Cast to HTMLElement
    const finalTarget = shareablePart as HTMLElement;

    // Check if any ancestor is already selected. If so, do NOT highlight this child.
    // Instead, highlight (or keep highlighted) the SELECTED PARENT so the user can see the helper for it.
    let parent = finalTarget.parentElement;
    let selectedAncestor: HTMLElement | null = null;

    // Loop outwards until we find a selected parent or reach the top
    while (parent) {
      if (this.selectedElements.has(parent)) {
        selectedAncestor = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (selectedAncestor) {
      // If we are hovering deep inside a selected block, show the helper for that block
      this.setNewHoverTarget(selectedAncestor);
      return;
    }

    // stop bubbling to parent
    // when element found for highlight
    e.stopPropagation();

    // If we are already on this target, do nothing (and keep it selected/highlighted)
    if (this.currentHoverTarget === finalTarget) return;

    // Highlight
    this.setNewHoverTarget(finalTarget);
  }

  private setNewHoverTarget(target: HTMLElement): void {
    if (this.currentHoverTarget) {
      this.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
    }
    this.currentHoverTarget = target;
    this.currentHoverTarget.classList.add(HIGHLIGHT_TARGET_CLASS);
    this.positionHelper(target);
  }

  private positionHelper(target: HTMLElement): void {
    if (!this.helperEl) return;

    const rect = target.getBoundingClientRect();
    const tagLabel = this.helperEl.querySelector('#cv-helper-tag');
    const upBtn = this.helperEl.querySelector('#cv-helper-up-btn') as HTMLElement;

    if (tagLabel) tagLabel.textContent = target.tagName;

    // Position at top-right of the element
    // Prevent going off-screen
    let top = rect.top - 20;
    if (top < 0) top = rect.top + 10; // Flip down if too close to top

    let left = rect.right - 80;
    if (left < 0) left = 10;

    this.helperEl.style.display = 'flex';
    this.helperEl.style.top = `${top}px`;
    this.helperEl.style.left = `${left}px`;

    // Update Select Button State (Tick or Cross)
    const selectBtn = this.helperEl.querySelector('#cv-helper-select-btn') as HTMLElement;
    if (selectBtn) {
      if (this.selectedElements.has(target)) {
        selectBtn.textContent = '✕';
        selectBtn.title = 'Deselect This Element';
        selectBtn.style.backgroundColor = '#d13438'; // Reddish
      } else {
        selectBtn.textContent = '✓';
        selectBtn.title = 'Select This Element';
        selectBtn.style.backgroundColor = ''; // Reset
      }
    }

    // Ancestry Check
    const parent = target.parentElement;
    const parentIsShareable = parent && parent.matches(SHAREABLE_SELECTOR);
    if (parentIsShareable) {
      upBtn.style.display = 'inline-block';
    } else {
      upBtn.style.display = 'none';
    }
  }

  private handleSelectParent(): void {
    if (this.currentHoverTarget && this.currentHoverTarget.parentElement) {
      const parent = this.currentHoverTarget.parentElement;
      if (parent.matches(SHAREABLE_SELECTOR)) {
        this.setNewHoverTarget(parent);
      }
    }
  }

  private handleClick(e: MouseEvent): void {
    if (!this.isActive) return;

    // If clicking helper
    if (this.helperEl && this.helperEl.contains(e.target as Node)) return;
    // If clicking floating bar
    if (this.floatingBarEl && this.floatingBarEl.contains(e.target as Node)) return;

    e.preventDefault();
    e.stopPropagation();

    if (this.currentHoverTarget) {
      this.toggleSelection(this.currentHoverTarget);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (!this.isActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.toggleShareMode();
    }
  }

  /**
   * Toggles the selection state of a given HTML element.
   * Implements selection logic:
   * - If an ancestor of the element is already selected, the click is ignored.
   * - If the element being selected is a parent of already selected elements, those children are deselected.
   * @param el The HTMLElement to toggle selection for.
   */
  private toggleSelection(el: HTMLElement): void {
    if (this.selectedElements.has(el)) {
      this.selectedElements.delete(el);
      el.classList.remove(SELECTED_CLASS);
    } else {
      // Selection Logic
      // Scenario A: Selecting a Parent -> Remove children selected while selecting parent
      // Scenario B: Selecting a Child -> Ignore if ancestor selected (or handle)

      // B. Check if any ancestor is already selected, return if any (Scenario B)
      let parent = el.parentElement;
      while (parent) {
        if (this.selectedElements.has(parent)) {
          // Ancestor is selected. Ignore click.
          return;
        }
        parent = parent.parentElement;
      }

      // A. Check if any children are selected (Scenario A)
      // We must iterate over currently selected elements
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

      // Add new selection
      this.selectedElements.add(el);
      el.classList.add(SELECTED_CLASS);
    }
    this.updateFloatingBarCount();
  }



  private createFloatingBar(): void {
    const bar = document.createElement('div');
    bar.id = FLOATING_ACTION_BAR_ID;
    bar.innerHTML = `
      <span id="cv-selected-count">0 items selected</span>
      <button class="cv-action-button clear">Clear All</button>
      <button class="cv-action-button preview">Preview</button>
      <button class="cv-action-button generate">Generate Link</button>
      <button class="cv-action-button exit">Exit</button>
    `;
    document.body.appendChild(bar);
    this.floatingBarEl = bar;

    bar.querySelector('.clear')?.addEventListener('click', () => this.clearAll());
    bar.querySelector('.preview')?.addEventListener('click', () => this.previewLink());
    bar.querySelector('.generate')?.addEventListener('click', () => this.generateLink());
    bar.querySelector('.exit')?.addEventListener('click', () => this.toggleShareMode());
  }

  private updateFloatingBarCount(): void {
    if (this.floatingBarEl) {
      const countElement = this.floatingBarEl.querySelector('#cv-selected-count');
      if (countElement) {
        const count = this.selectedElements.size;
        countElement.textContent = `${count} item${count === 1 ? '' : 's'} selected`;
      }
    }
  }

  private clearAll(): void {
    this.selectedElements.forEach(el => el.classList.remove('cv-share-selected'));
    this.selectedElements.clear();
    this.updateFloatingBarCount();
  }

  private getShareUrl(): URL | null {
    if (this.selectedElements.size === 0) {
      return null;
    }

    const descriptors = Array.from(this.selectedElements).map(el => AnchorEngine.createDescriptor(el));
    const serialized = AnchorEngine.serialize(descriptors);

    const url = new URL(window.location.href);
    url.searchParams.set('cv-focus', serialized);
    return url;
  }

  private async generateLink(): Promise<void> {
    const url = this.getShareUrl();
    if (!url) {
      showToast('Please select at least one item.');
      return;
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      showToast('Link copied to clipboard!');
    } catch (e) {
      console.error('Clipboard failed', e);
      showToast('Failed to copy link.');
    }
  }

  private previewLink(): void {
    const url = this.getShareUrl();
    if (!url) {
      showToast('Please select at least one item.');
      return;
    }
    window.open(url.toString(), '_blank');
  }



  private clearHover(): void {
    if (this.currentHoverTarget) {
      this.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
      this.currentHoverTarget = null;
    }
    if (this.helperEl) {
      this.helperEl.style.display = 'none';
    }
  }

  public cleanup(): void {
    document.body.classList.remove('cv-share-mode');
    this.clearAll();

    const style = document.getElementById(SHARE_MODE_STYLE_ID);
    if (style) document.head.removeChild(style);

    if (this.floatingBarEl) {
      document.body.removeChild(this.floatingBarEl);
      this.floatingBarEl = null;
    }

    if (this.helperEl) {
      document.body.removeChild(this.helperEl);
      this.helperEl = null;
    }

    if (this.currentHoverTarget) {
      this.currentHoverTarget.classList.remove(HIGHLIGHT_TARGET_CLASS);
      this.currentHoverTarget = null;
    }

    document.removeEventListener('mouseover', this.boundHandleHover, true);
    document.removeEventListener('click', this.boundHandleClick, true);
    document.removeEventListener('keydown', this.boundHandleKeydown, true);

    this.isActive = false;
  }
}
