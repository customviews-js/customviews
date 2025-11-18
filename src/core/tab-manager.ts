import type { TabGroupConfig } from "../types/types";
import { getPinIcon } from "../utils/icons";


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
      
      // Apply visibility to direct child cv-tab elements only (not nested ones)
      const tabElements = Array.from(groupEl.children).filter(
        (child) => child.tagName.toLowerCase() === TAB_SELECTOR
      );
      tabElements.forEach((tabEl) => {
        // Use id or internal id
        const tabId = tabEl.getAttribute('id') || tabEl.getAttribute('data-cv-internal-id');
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
      // Use id or internal id
      const tabId = firstTab.getAttribute('id') || firstTab.getAttribute('data-cv-internal-id') || '';
      const splitIds = this.splitTabIds(tabId);
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
   * Build navigation for tab groups (one-time setup)
   */
  public static buildNavs(
    tabGroups: HTMLElement[],
    cfgGroups?: TabGroupConfig[],
    onTabClick?: (groupId: string, tabId: string, groupEl: HTMLElement) => void,
    onTabDoubleClick?: (groupId: string, tabId: string, groupEl: HTMLElement) => void
  ): void {
    const rootEl = document.body; // Needed for NAV_HIDE_ROOT_CLASS check
    
    tabGroups.forEach((groupEl) => {
      // Filter to only build for groups with nav="auto" or no nav attribute
      if (!groupEl.matches(NAV_AUTO_SELECTOR)) {
        return;
      }

      const groupId = groupEl.getAttribute('id') || null;
      
      // Note: groupId can be null for standalone tabgroups
      // These won't sync with other groups or persist state

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
      tabElements.forEach((tabEl, index) => {
        let rawTabId = tabEl.getAttribute('id');
        
        // If tab has no id, generate one based on position
        if (!rawTabId) {
          rawTabId = `${groupId}-tab-${index}`;
          tabEl.setAttribute('data-cv-internal-id', rawTabId);
        }

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
            // Use config label if available (only if group has an id)
            const configLabel = groupId ? this.getTabLabel(tabId, groupId, cfgGroups) : null;
            if (configLabel) {
              header = configLabel;
            }
            else if (tabEl.getAttribute('id')) {
              // Use the original id if it exists
              header = tabId;
            } else {
              // Auto-generate label for tabs without id (Tab 1, Tab 2, etc.)
              header = `Tab ${index + 1}`;
            }
          }
        }

        // Create a single nav link for this tab element
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';

        const navLink = document.createElement('a');
        navLink.className = 'nav-link';
        navLink.href = '#';
        navLink.setAttribute('data-tab-id', tabId);
        navLink.setAttribute('data-raw-tab-id', rawTabId);
        if (groupId) {
          navLink.setAttribute('data-group-id', groupId);
        }
        navLink.setAttribute('role', 'tab');
        
        // Create header container with text and pin icon
        const headerContainer = document.createElement('span');
        headerContainer.className = 'cv-tab-header-container';
        
        const headerText = document.createElement('span');
        headerText.className = 'cv-tab-header-text';
        headerText.innerHTML = header;
        
        const pinIcon = document.createElement('span');
        pinIcon.className = 'cv-tab-pin-icon';
        pinIcon.innerHTML = getPinIcon(true);
        pinIcon.style.display = 'none'; // Hidden by default
        
        headerContainer.appendChild(headerText);
        headerContainer.appendChild(pinIcon);
        navLink.appendChild(headerContainer);

        // Check if any of the split IDs is active
        const activeTabId = groupId 
          ? this.resolveActiveTabForGroup(groupId, {}, cfgGroups, groupEl as HTMLElement)
          : (index === 0 ? tabId : null); // For standalone groups, activate first tab
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
            // For standalone groups (no groupId), use empty string
            onTabClick(groupId || '', tabId, groupEl as HTMLElement);
          });
        }

        // Add double-click handler for sync (only for groups with id)
        if (onTabDoubleClick && groupId) {
          navLink.addEventListener('dblclick', (e) => {
            e.preventDefault();
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
    tabGroups: HTMLElement[],
    tabs: Record<string, string>,
    cfgGroups?: TabGroupConfig[]
  ): void {
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
      // Use id or internal id
      const tabId = tabEl.getAttribute('id') || tabEl.getAttribute('data-cv-internal-id');
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
      
      // Find all nav links in this group
      const navLinks = groupEl.querySelectorAll('.nav-link');
      navLinks.forEach((link) => {
        const rawTabId = link.getAttribute('data-raw-tab-id');
        const pinIcon = link.querySelector('.cv-tab-pin-icon') as HTMLElement;
        
        if (!pinIcon || !rawTabId) return;
        
        // Check if persisted tab ID matches any of the split IDs (for multi-ID tabs)
        const splitIds = this.splitTabIds(rawTabId);
        const shouldShowPin = persistedTabId && splitIds.includes(persistedTabId);
        
        if (shouldShowPin) {
          pinIcon.style.display = 'inline-block';
        } else {
          pinIcon.style.display = 'none';
        }
      });
    });
  }


}
