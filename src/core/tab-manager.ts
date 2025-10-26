import type { TabGroupConfig } from "../types/types";


// Constants for selectors
const TABGROUP_SELECTOR = 'cv-tabgroup';
const TAB_SELECTOR = 'cv-tab';
const NAV_AUTO_SELECTOR = 'cv-tabgroup[nav="auto"], cv-tabgroup:not([nav])';
const NAV_CONTAINER_CLASS = 'cv-tabs-nav';
const NAV_HIDE_ROOT_CLASS = 'cv-hide-tab-navs';
const NAV_HIDDEN_CLASS = 'cv-tabs-nav-hidden';

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
   * Apply tab selections to all tab groups in the DOM
   */
  public static applySelections(
    rootEl: HTMLElement,
    tabs: Record<string, string>,
    cfgGroups?: TabGroupConfig[]
  ): void {
    // Find all cv-tabgroup elements
    const tabGroups = rootEl.querySelectorAll(TABGROUP_SELECTOR);
    
    tabGroups.forEach((groupEl) => {
      const groupId = groupEl.getAttribute('id');
      if (!groupId) return;

      // Determine the active tab for this group
      const activeTabId = this.resolveActiveTabForGroup(groupId, tabs, cfgGroups, groupEl as HTMLElement);
      
      // Apply visibility to direct child cv-tab elements only (not nested ones)
      const tabElements = Array.from(groupEl.children).filter(
        (child) => child.tagName.toLowerCase() === TAB_SELECTOR
      );
      tabElements.forEach((tabEl) => {
        const tabId = tabEl.getAttribute('id');
        if (!tabId) return;

        // Split IDs and check if any match the active tab
        const splitIds = this.splitTabIds(tabId);
        const isActive = splitIds.includes(activeTabId || '');
        this.applyTabVisibility(tabEl as HTMLElement, isActive);
      });
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
      const splitIds = this.splitTabIds(firstTab.getAttribute('id') || '');
      return splitIds[0] || null;
    }

    return null;
  }

  /**
   * Apply visibility classes to a tab element
   */
  private static applyTabVisibility(tabEl: HTMLElement, isActive: boolean): void {
    if (isActive) {
      tabEl.classList.remove('cv-hidden');
      tabEl.classList.add('cv-visible');
    } else {
      tabEl.classList.add('cv-hidden');
      tabEl.classList.remove('cv-visible');
    }
  }

  /**
   * Extract header and body content from header component syntax: <cv-tab-header> and <cv-tab-body>
   * Returns null if using old attribute-based syntax.
   * 
   * @param tabEl The <cv-tab> element to inspect
   * @returns Object with extracted content, or null if new syntax not used
   */
  private static extractTabContent(
    tabEl: HTMLElement
  ): { headerHTML: string; bodyEl: HTMLElement | null } | null {
    // Look for direct children 
    let headerEl = tabEl.querySelector(':scope > cv-tab-header');
    
    if (!headerEl) {
      return null;
    }

    const headerHTML = headerEl.innerHTML.trim();
    
    // Find body element
    let bodyEl = tabEl.querySelector(':scope > cv-tab-body') as HTMLElement | null;

    // Fallback: try finding both header and body
    // without :scope (in case of DOM manipulation) by iterating through tabEl.children if needed

    return {
      headerHTML,
      bodyEl
    };
  }

  /**
   * Build navigation for tab groups with nav="auto" (one-time setup)
   */
  public static buildNavs(
    rootEl: HTMLElement,
    cfgGroups?: TabGroupConfig[],
    onTabClick?: (groupId: string, tabId: string, groupEl: HTMLElement) => void,
    onTabDoubleClick?: (groupId: string, tabId: string, groupEl: HTMLElement) => void
  ): void {
    // Find all cv-tabgroup elements with nav="auto" or no nav attribute
    const tabGroups = rootEl.querySelectorAll(NAV_AUTO_SELECTOR);
    
    tabGroups.forEach((groupEl) => {
      const groupId = groupEl.getAttribute('id');
      if (!groupId) return;

      // Check if nav already exists - if so, skip building
      let navContainer = groupEl.querySelector(`.${NAV_CONTAINER_CLASS}`);
      if (navContainer) return; // Already built
      
      // Get only direct child tabs (not nested ones)
      const tabElements = Array.from(groupEl.children).filter(
        (child) => child.tagName.toLowerCase() === TAB_SELECTOR
      );
      if (tabElements.length === 0) return;

      // Create nav container
      navContainer = document.createElement('ul');
      navContainer.className = `${NAV_CONTAINER_CLASS} nav-tabs`;
      navContainer.setAttribute('role', 'tablist');
      // Respect viewer preference on the root to show/hide navs
      const showNavs = !rootEl.classList.contains(NAV_HIDE_ROOT_CLASS);
      if (!showNavs) {
        navContainer.classList.add(NAV_HIDDEN_CLASS);
        navContainer.setAttribute('aria-hidden', 'true');
      } else {
        navContainer.setAttribute('aria-hidden', 'false');
      }
      groupEl.insertBefore(navContainer, groupEl.firstChild);

      // Build nav items
      tabElements.forEach((tabEl) => {
        const rawTabId = tabEl.getAttribute('id');
        if (!rawTabId) return;

        const splitIds = this.splitTabIds(rawTabId);
        // If multiple IDs, use the first as primary
        const tabId = splitIds[0] || rawTabId;
        
        // Get header for this tab - prefer new syntax over old attribute syntax
        const extractedHeaderAndBody = this.extractTabContent(tabEl as HTMLElement);
        let header = '';
      
        // use <cv-tab-header> content if available
        if (extractedHeaderAndBody && extractedHeaderAndBody.headerHTML) {
          header = extractedHeaderAndBody.headerHTML;
        } else {
          // use header attribute if available
          const headerAttr = tabEl.getAttribute('header') || '';
          if (headerAttr) {
            header = headerAttr;
          } else {
            // Use config label or id as fallback
            header = this.getTabLabel(tabId, groupId, cfgGroups) || tabId || '';
          }
        }

        // Create a single nav link for this tab element
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';

        const navLink = document.createElement('a');
        navLink.className = 'nav-link';
        navLink.innerHTML = header;
        navLink.href = '#';
        navLink.setAttribute('data-tab-id', tabId);
        navLink.setAttribute('data-raw-tab-id', rawTabId);
        navLink.setAttribute('data-group-id', groupId);
        navLink.setAttribute('role', 'tab');

        // Check if any of the split IDs is active
        const activeTabId = this.resolveActiveTabForGroup(groupId, {}, cfgGroups, groupEl as HTMLElement); // Pass empty tabs for initial state
        const isActive = splitIds.includes(activeTabId || '');
        if (isActive) {
          navLink.classList.add('active');
          navLink.setAttribute('aria-selected', 'true');
        } else {
          navLink.setAttribute('aria-selected', 'false');
        }

        // Add click handler for local tab switch (if split id, switches to default first ID)
        if (onTabClick) {
          navLink.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log("Single-click detected");
            onTabClick(groupId, tabId, groupEl as HTMLElement);
          });
        }

        // Add double-click handler for sync
        if (onTabDoubleClick) {
          navLink.addEventListener('dblclick', (e) => {
            e.preventDefault();
            // console.log("Double-click detected");
            onTabDoubleClick(groupId, tabId, groupEl as HTMLElement);
          });
        }

        // Add tooltip for UX feedback (use native title attribute)
        navLink.setAttribute('title', 'Double click to change switch tabs across all groups');

        listItem.appendChild(navLink);
        navContainer.appendChild(listItem);
      });

      // Add bottom border line at the end of the tab group
      const bottomBorder = document.createElement('div');
      bottomBorder.className = 'cv-tabgroup-bottom-border';
      groupEl.appendChild(bottomBorder);
    });
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

    const navContainers = rootEl.querySelectorAll(`.${NAV_CONTAINER_CLASS}`);
    navContainers.forEach((nav) => {
      if (visible) {
        nav.classList.remove(NAV_HIDDEN_CLASS);
        nav.setAttribute('aria-hidden', 'false');
      } else {
        nav.classList.add(NAV_HIDDEN_CLASS);
        nav.setAttribute('aria-hidden', 'true');
      }
    });

    // Also hide/show the bottom border of tab groups
    const bottomBorders = rootEl.querySelectorAll('.cv-tabgroup-bottom-border');
    bottomBorders.forEach((border) => {
      if (visible) {
        border.classList.remove('cv-hidden');
      } else {
        border.classList.add('cv-hidden');
      }
    });
  }

  /**
   * Read current nav visibility (viewer preference)
   */
  public static areNavsVisible(rootEl: HTMLElement): boolean {
    return !rootEl.classList.contains(NAV_HIDE_ROOT_CLASS);
  }

  /**
   * Get tab label from config
   */
  private static getTabLabel(
    tabId: string,
    groupId: string,
    cfgGroups?: TabGroupConfig[]
  ): string | null {
    if (!cfgGroups) return null;

    const groupCfg = cfgGroups.find(g => g.id === groupId);
    if (!groupCfg) return null;

    const tabCfg = groupCfg.tabs.find(t => t.id === tabId);
    return tabCfg?.label || null;
  }

  /**
   * Update active state in navs for a specific tabgroup element only
   */
  public static updateNavActiveState(groupEl: HTMLElement, activeTabId: string): void {
    const navLinks = groupEl.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      const rawTabId = link.getAttribute('data-raw-tab-id');
      if (!rawTabId) return;

      // Check if activeTabId is in the split IDs of this link
      const splitIds = this.splitTabIds(rawTabId);
      const isActive = splitIds.includes(activeTabId);
      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
      } else {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
      }
    });
  }

  /**
   * Update active states for all tab groups based on current state
   */
  public static updateAllNavActiveStates(
    rootEl: HTMLElement,
    tabs: Record<string, string>,
    cfgGroups?: TabGroupConfig[]
  ): void {
    const tabGroups = rootEl.querySelectorAll(TABGROUP_SELECTOR);
    
    tabGroups.forEach((groupEl) => {
      const groupId = groupEl.getAttribute('id');
      if (!groupId) return;

      // Determine the active tab for this group
      const activeTabId = this.resolveActiveTabForGroup(groupId, tabs, cfgGroups, groupEl as HTMLElement);
      if (!activeTabId) return;

      // Update nav links for this group
      const navLinks = groupEl.querySelectorAll('.nav-link');
      navLinks.forEach((link) => {
        const rawTabId = link.getAttribute('data-raw-tab-id');
        if (!rawTabId) return;

        // Check if activeTabId is in the split IDs of this link
        const splitIds = this.splitTabIds(rawTabId);
        const isActive = splitIds.includes(activeTabId);
        if (isActive) {
          link.classList.add('active');
          link.setAttribute('aria-selected', 'true');
        } else {
          link.classList.remove('active');
          link.setAttribute('aria-selected', 'false');
        }
      });
    });
  }

  /**
   * Apply tab selection to a specific tabgroup element only (not globally).
   * Used for single-click behavior to update only the clicked tabgroup.
   */
  public static applyTabLocalOnly(groupEl: HTMLElement, activeTabId: string): void {
    const tabElements = Array.from(groupEl.children).filter(
      (child) => child.tagName.toLowerCase() === TAB_SELECTOR
    );
    
    tabElements.forEach((tabEl) => {
      const tabId = tabEl.getAttribute('id');
      if (!tabId) return;

      const splitIds = this.splitTabIds(tabId);
      const isActive = splitIds.includes(activeTabId);
      this.applyTabVisibility(tabEl as HTMLElement, isActive);
    });
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
      const idAttr = tabEl.getAttribute('id') || '';
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



}
