import type { ToggleId } from "../../types/types";

/**
 * Keeps track of which toggles are hidden and which are visible in memory.
 * 
 * This class keeps track of hidden toggles without reading the DOM or URL.
 */
export class VisibilityManager {
  private hiddenToggles: Set<ToggleId> = new Set();

  /** Marks a toggle as visible or hidden. 
   * Returns true if changed. 
   * Also updates internal set of hidden toggles.
   */
  public setToggleVisibility(toggleId: ToggleId, visible: boolean): boolean {
    const wasHidden = this.hiddenToggles.has(toggleId);
    const shouldHide = !visible;
    if (shouldHide && !wasHidden) {
      this.hiddenToggles.add(toggleId);
      return true;
    }
    if (!shouldHide && wasHidden) {
      this.hiddenToggles.delete(toggleId);
      return true;
    }
    return false;
  }

  /** Hide all toggles in the provided set. */
  public hideAll(allToggleIds: ToggleId[]): void {
    for (const id of allToggleIds) {
      this.setToggleVisibility(id, false);
    }
  }

  /** Show all toggles in the provided set. */
  public showAll(allToggleIds: ToggleId[]): void {
    for (const id of allToggleIds) {
      this.setToggleVisibility(id, true);
    }
  }

  /** Get the globally hidden toggle ids (explicitly hidden via API). */
  public getHiddenToggles(): ToggleId[] {
    return Array.from(this.hiddenToggles);
  }

  /** Filter a list of toggles to only those visible per the hidden set. */
  public filterVisibleToggles(toggleIds: ToggleId[]): ToggleId[] {
    return toggleIds.filter(t => !this.hiddenToggles.has(t));
  }

  /**
   * Apply simple class-based visibility to a toggle element.
   * The element is assumed to have data-cv-toggle or data-customviews-toggle.
   */
  public applyElementVisibility(el: HTMLElement, visible: boolean): void {
    if (visible) {
      el.classList.remove('cv-hidden');
      el.classList.add('cv-visible');
    } else {
      el.classList.add('cv-hidden');
      el.classList.remove('cv-visible');
    }
  }
}


