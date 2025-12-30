import type { TabGroupConfig } from "../../types/types";

// Constants for selectors
const TABGROUP_SELECTOR = 'cv-tabgroup';
const TAB_SELECTOR = 'cv-tab';
const NAV_HIDE_ROOT_CLASS = 'cv-hide-tab-navs';


export class TabManager {
  /**
   * Split a tab ID into multiple IDs if it contains spaces or |
   */
  private static splitTabIds(tabId: string): string[] {
    const splitIds = tabId.split(/[\s|]+/).filter(id => id.trim() !== '');
    const trimmedIds = splitIds.map(id => id.trim());
    return trimmedIds;
  }

  /**
   * Apply tab selections to a given list of tab group elements
   */
  public static applyTabSelections(
    tabGroups: HTMLElement[],
    tabs: Record<string, string>,
    cfgGroups?: TabGroupConfig[]
  ): void {
    tabGroups.forEach((groupEl) => {
      const groupId = groupEl.getAttribute('id');
      
      // Determine the active tab for this group
      let activeTabId: string | null;
      if (groupId) {
        activeTabId = this.resolveActiveTabForGroup(groupId, tabs, cfgGroups, groupEl as HTMLElement);
      } else {
        // For standalone groups without id, activate the first tab
        const tabElements = Array.from(groupEl.children).filter(
          (child) => child.tagName.toLowerCase() === TAB_SELECTOR
        );
        const firstTab = tabElements[0];
        if (firstTab) {
          const firstTabId = firstTab.getAttribute('id') || firstTab.getAttribute('data-cv-internal-id') || '';
          const splitIds = this.splitTabIds(firstTabId);
          activeTabId = splitIds[0] || null;
        } else {
          activeTabId = null;
        }
      }

      if (activeTabId) {
          // Set property on Custom Element
          (groupEl as any).activeTabId = activeTabId;
      }
    });
  }

  /**
   * Resolve the active tab for a group based on state, config, and DOM
   * 
   * Pass in the current tabs state, config groups, and the group element
   */
  private static resolveActiveTabForGroup(
    groupId: string,
    tabs: Record<string, string>,
    cfgGroups: TabGroupConfig[] | undefined,
    groupEl: HTMLElement
  ): string | null {
    // 1. Check state
    if (tabs[groupId]) {
      return tabs[groupId];
    }

    // 2. Check config for first tab
    if (cfgGroups) {
      const groupCfg = cfgGroups.find(g => g.id === groupId);
      if (groupCfg) {
        // Fallback to first tab in config
        const firstConfigTab = groupCfg.tabs[0];
        if (firstConfigTab) {
          return firstConfigTab.id;
        }
      }
    }

    // 3. Fallback to first direct cv-tab child in DOM
    const firstTab = Array.from(groupEl.children).find(
      (child) => child.tagName.toLowerCase() === TAB_SELECTOR
    );
    if (firstTab) {
      // Use id or internal id
      const tabId = firstTab.getAttribute('id') || firstTab.getAttribute('data-cv-internal-id') || '';
      const splitIds = this.splitTabIds(tabId);
      return splitIds[0] || null;
    }

    return null;
  }

  /**
   * Toggle nav visibility for all tab groups (viewer-controlled)
   */
  public static setNavsVisibility(rootEl: HTMLElement, visible: boolean): void {
    if (visible) {
      rootEl.classList.remove(NAV_HIDE_ROOT_CLASS);
    } else {
      rootEl.classList.add(NAV_HIDE_ROOT_CLASS);
    }
    
    // Update all tabgroups
    const groups =  rootEl.querySelectorAll(TABGROUP_SELECTOR);
    groups.forEach(g => {
        (g as any).isNavsVisible = visible;
    });
  }

  /**
   * Read current nav visibility (viewer preference)
   */
  public static areNavsVisible(rootEl: HTMLElement): boolean {
    return !rootEl.classList.contains(NAV_HIDE_ROOT_CLASS);
  }

  /**
   * Update active states for all tab groups based on current state
   */
  public static updateAllNavActiveStates(
    tabGroups: HTMLElement[],
    tabs: Record<string, string>,
    cfgGroups?: TabGroupConfig[]
  ): void {
      this.applyTabSelections(tabGroups, tabs, cfgGroups);
  }

  /**
   * Apply tab selection to a specific tabgroup element only (not globally).
   * Used for single-click behavior to update only the clicked tabgroup.
   */
  public static applyTabLocalOnly(groupEl: HTMLElement, activeTabId: string): void {
      (groupEl as any).activeTabId = activeTabId;
  }

  /**
   * Check if a tabgroup element contains a specific tab ID (respects split IDs).
   * Accepts groupEl to avoid repeated DOM queries.
   */
  public static groupHasTab(groupEl: HTMLElement, tabId: string): boolean {
    const tabElements = Array.from(groupEl.children).filter(
      (child) => child.tagName.toLowerCase() === TAB_SELECTOR
    );
    return tabElements.some((tabEl) => {
      // Use id or internal id
      const idAttr = tabEl.getAttribute('id') || tabEl.getAttribute('data-cv-internal-id') || '';
      const splitIds = this.splitTabIds(idAttr);
      return splitIds.includes(tabId);
    });
  }


  /**
   * Returns array of group elements to be synced (excluding source).
   */
  public static getTabgroupsWithId(
    rootEl: HTMLElement,
    sourceGroupId: string,
    tabId: string
  ): HTMLElement[] {
    const syncedGroupEls: HTMLElement[] = [];
    const allGroupEls = Array.from(rootEl.querySelectorAll(`${TABGROUP_SELECTOR}[id="${sourceGroupId}"]`)) as HTMLElement[];

    allGroupEls.forEach((targetGroupEl) => {
      // Only sync if target group actually contains this tab
      if (this.groupHasTab(targetGroupEl, tabId)) {
        syncedGroupEls.push(targetGroupEl);
      }
    });

    return syncedGroupEls;
  }

  /**
   * Update pin icon visibility for all tab groups based on current state.
   * Shows pin icon for tabs that are in the persisted state (i.e., have been double-clicked).
   */
  public static updatePinIcons(
      tabGroups: HTMLElement[],
      tabs: Record<string, string>
    ): void {
      tabGroups.forEach((groupEl) => {
        const groupId = groupEl.getAttribute('id');
        if (!groupId) return;

        const persistedTabId = tabs[groupId];
        if (persistedTabId) {
             (groupEl as any).pinnedTabId = persistedTabId;
        } else {
             (groupEl as any).pinnedTabId = '';
        }
      });
    }
}
