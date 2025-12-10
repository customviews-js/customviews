import { injectWidgetStyles } from "../styles/widget-styles";
import type { CustomViewsCore } from "./core";
import type { State } from "../types/types";
import { URLStateManager } from "./url-state-manager";

import { TabManager } from "./tab-manager";
import { getGearIcon, getCloseIcon, getResetIcon, getCopyIcon, getTickIcon, getNavHeadingOnIcon, getNavHeadingOffIcon, getNavDashed } from "../utils/icons";

export interface WidgetOptions {
  /** The CustomViews core instance to control */
  core: CustomViewsCore;

  /** Container element where the widget should be rendered */
  container?: HTMLElement;

  /** Widget position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'middle-left', 'middle-right' */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right';

  /** Widget theme: 'light' or 'dark' */
  theme?: 'light' | 'dark';

  /** Whether to show reset button */
  showReset?: boolean;

  /** Widget title */
  title?: string;

  /** Widget description text */
  description?: string;

  /** Whether to show welcome modal on first visit */
  showWelcome?: boolean;

  /** Welcome modal title (only used if showWelcome is true) */
  welcomeTitle?: string;

  /** Welcome modal message (only used if showWelcome is true) */
  welcomeMessage?: string;

  /** Whether to show tab groups section in widget (default: true) */
  showTabGroups?: boolean;
}

export class CustomViewsWidget {
  private core: CustomViewsCore;
  private container: HTMLElement;
  private widgetIcon: HTMLElement | null = null;
  private options: Required<WidgetOptions>;
  private _hasVisibleConfig = false;
  private pageToggleIds: Set<string> = new Set();
  private pageTabIds: Set<string> = new Set();

  // Modal state
  private stateModal: HTMLElement | null = null;


  constructor(options: WidgetOptions) {
    this.core = options.core;
    this.container = options.container || document.body;

    // Set defaults
    this.options = {
      core: options.core,
      container: this.container,
      position: options.position || 'middle-left',
      theme: options.theme || 'light',
      showReset: options.showReset ?? true,
      title: options.title || 'Customize View',
      description: options.description || '',
      showWelcome: options.showWelcome ?? false,
      welcomeTitle: options.welcomeTitle || 'Site Customization',
      welcomeMessage: options.welcomeMessage || 'This site is powered by Custom Views. Use the widget on the side (⚙) to customize your experience. Your preferences will be saved and can be shared via URL.<br><br>Learn more at <a href="https://github.com/customviews-js/customviews" target="_blank">customviews GitHub</a>.',
      showTabGroups: options.showTabGroups ?? true
    };

    // Determine if there are any configurations to show
    const config = this.core.getConfig();
    const allToggles = config?.toggles || [];
    const visibleToggles = allToggles.filter(toggle => {
      if (toggle.isLocal) {
        return !!document.querySelector(`[data-cv-toggle="${toggle.id}"], [data-cv-toggle-group-id="${toggle.id}"]`);
      }
      return true;
    });

    const allTabGroups = this.core.getTabGroups() || [];
    const visibleTabGroups = allTabGroups.filter(group => {
      if (group.isLocal) {
        return !!document.querySelector(`cv-tabgroup[id="${group.id}"]`);
      }
      return true;
    });

    if (visibleToggles.length > 0 || (this.options.showTabGroups && visibleTabGroups.length > 0)) {
      this._hasVisibleConfig = true;
    }

    // Scan for page-declared local components and cache them
    // Do this on initialization to avoid querying DOM repeatedly
    const pageTogglesAttr = document.querySelector('[data-cv-page-local-toggles]')?.getAttribute('data-cv-page-local-toggles') || '';
    this.pageToggleIds = new Set(pageTogglesAttr.split(',').map(id => id.trim()).filter(id => id));

    const pageTabsAttr = document.querySelector('[data-cv-page-local-tabs]')?.getAttribute('data-cv-page-local-tabs') || '';
    this.pageTabIds = new Set(pageTabsAttr.split(',').map(id => id.trim()).filter(id => id));

  }

  /**
   * Render the widget modal icon
   * 
   * Does not render if there are no visible toggles or tab groups.
   */
  public renderModalIcon(): HTMLElement | undefined {
    if (!this._hasVisibleConfig) {
      return;
    }

    this.widgetIcon = this.createWidgetIcon();
    this.attachEventListeners();

    // Always append to body since it's a floating icon
    document.body.appendChild(this.widgetIcon);

    // Show welcome modal on first visit if enabled
    if (this.options.showWelcome) {
      this.showWelcomeModalIfFirstVisit();
    }

    return this.widgetIcon;
  }

  /**
   * Create the simple widget icon
   */
  private createWidgetIcon(): HTMLElement {
    const icon = document.createElement('div');
    icon.className = `cv-widget-icon cv-widget-${this.options.position}`;
    icon.innerHTML = '⚙';
    icon.title = this.options.title;
    icon.setAttribute('aria-label', 'Open Custom Views');

    // Add styles
    injectWidgetStyles();

    return icon;
  }

  /**
   * Remove the widget from DOM
   */
  public destroy(): void {
    if (this.widgetIcon) {
      this.widgetIcon.remove();
      this.widgetIcon = null;
    }

    // Clean up modal
    if (this.stateModal) {
      this.stateModal.remove();
      this.stateModal = null;
    }
  }

  private attachEventListeners(): void {
    if (!this.widgetIcon) return;

    // Click to open customization modal directly
    this.widgetIcon.addEventListener('click', () => this.openStateModal());
  }

  /**
   * Close the modal
   */
  private closeModal(): void {
    if (this.stateModal) {
      this.stateModal.classList.add('cv-hidden');
    }
  }

  /**
   * Open the custom state creator
   */
  private openStateModal(): void {
    if (!this.stateModal) {
      this._createStateModal();
    }
    this._updateStateModalContent();
    this.stateModal!.classList.remove('cv-hidden');
  }

  /**
   * Create the custom state creator modal shell and attach listeners
   */
  private _createStateModal(): void {
    this.stateModal = document.createElement('div');
    this.stateModal.className = 'cv-widget-modal-overlay cv-hidden';
    this.applyThemeToModal();

    document.body.appendChild(this.stateModal);
    this._attachStateModalFrameEventListeners();
  }

  /**
   * Update the content of the state modal
   */
  private _updateStateModalContent(): void {
    if (!this.stateModal) return;

    const pageToggleIds = this.pageToggleIds;
    const pageTabIds = this.pageTabIds;

    // Get toggles from current configuration
    const config = this.core.getConfig();
    const allToggles = config?.toggles || [];

    // Filter toggles to only include global and visible/declared local toggles
    const visibleToggles = allToggles.filter(toggle => {
      if (toggle.isLocal) {
        return pageToggleIds.has(toggle.id) || !!document.querySelector(`[data-cv-toggle="${toggle.id}"], [data-cv-toggle-group-id="${toggle.id}"]`);
      }
      return true; // Keep global toggles
    });

    const toggleControlsHtml = visibleToggles.map(toggle => `
      <div class="cv-toggle-card">
        <div class="cv-toggle-content">
          <div>
            <p class="cv-toggle-title">${toggle.label || toggle.id}</p>
          </div>
          <label class="cv-toggle-label">
            <input class="cv-toggle-input" type="checkbox" data-toggle="${toggle.id}"/>
            <span class="cv-toggle-slider"></span>
          </label>
        </div>
      </div>
    `).join('');

    // Get tab groups
    const allTabGroups = this.core.getTabGroups() || [];
    const tabGroups = allTabGroups.filter(group => {
      if (group.isLocal) {
        return pageTabIds.has(group.id) || !!document.querySelector(`cv-tabgroup[id="${group.id}"]`);
      }
      return true; // Keep global tab groups
    });

    let tabGroupControlsHTML = '';
    if (this.options.showTabGroups && tabGroups && tabGroups.length > 0) {
      const initialNavsVisible = TabManager.areNavsVisible(document.body);

      tabGroupControlsHTML = `
        <div class="cv-tabgroup-card cv-tabgroup-header">
          <div class="cv-tabgroup-row">
            <div class="cv-tabgroup-logo-box" id="cv-nav-icon-box">
              <div class="cv-nav-icon" id="cv-nav-icon">${initialNavsVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon()}</div>
            </div>
            <div class="cv-tabgroup-info">
              <div class="cv-tabgroup-title-container">
                <p class="cv-tabgroup-title">Navigation Headers</p>
              </div>
              <p class="cv-tabgroup-description">Show or hide navigation headers</p>
            </div>
            <label class="cv-toggle-switch cv-nav-toggle">
              <input class="cv-nav-pref-input" type="checkbox" ${initialNavsVisible ? 'checked' : ''} aria-label="Show or hide navigation headers" />
              <span class="cv-switch-bg"></span>
              <span class="cv-switch-knob"></span>
            </label>
          </div>
        </div>
        <div class="cv-tab-groups-list">
          ${tabGroups.map(group => `
            <div class="cv-tabgroup-card cv-tabgroup-item">
              <label class="cv-tabgroup-label" for="tab-group-${group.id}">
                ${group.label || group.id}
              </label>
              <select id="tab-group-${group.id}" class="cv-tabgroup-select" data-group-id="${group.id}">
                ${group.tabs.map(tab => `<option value="${tab.id}">${tab.label || tab.id}</option>`).join('')}
              </select>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.stateModal.innerHTML = `
      <div class="cv-widget-modal cv-custom-state-modal">
        <header class="cv-modal-header">
          <div class="cv-modal-header-content">
            <div class="cv-modal-icon">
              ${getGearIcon()}
            </div>
            <div class="cv-modal-title">${this.options.title}</div>
          </div>
          <button class="cv-modal-close" aria-label="Close modal">
            ${getCloseIcon()}
          </button>
        </header>
        <main class="cv-modal-main">
          ${this.options.description ? `<p class="cv-modal-description">${this.options.description}</p>` : ''}
          
          ${visibleToggles.length ? `
          <div class="cv-content-section">
            <div class="cv-section-heading">Toggles</div>
            <div class="cv-toggles-container">
              ${toggleControlsHtml}
            </div>
          </div>
          ` : ''}
          
          ${this.options.showTabGroups && tabGroups && tabGroups.length > 0 ? `
          <div class="cv-content-section">
            <div class="cv-section-heading">Tab Groups</div>
            <div class="cv-tabgroups-container">
              ${tabGroupControlsHTML}
            </div>
          </div>
          ` : ''}
        </main>

        <footer class="cv-modal-footer">
          ${this.options.showReset ? `
          <button class="cv-reset-btn">
            <span class="cv-reset-btn-icon">${getResetIcon()}</span>
            <span>Reset to Default</span>
          </button>
          ` : ''}
          <button class="cv-share-btn">
            <span>Copy Shareable URL</span>
            <span class="cv-share-btn-icon">${getCopyIcon()}</span>
          </button>

        </footer>
      </div>
    `;

    this._attachStateModalContentEventListeners();
    this.loadCurrentStateIntoForm();
  }

  /**
   * Attach event listeners for the modal frame (delegated events)
   */
  private _attachStateModalFrameEventListeners(): void {
    if (!this.stateModal) return;

    // Delegated click events
    this.stateModal.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Close button
      if (target.closest('.cv-modal-close')) {
        this.closeModal();
        return;
      }

      // Copy URL button
      if (target.closest('.cv-share-btn')) {
        this.copyShareableURL();
        const copyUrlBtn = target.closest('.cv-share-btn');
        const iconContainer = copyUrlBtn?.querySelector('.cv-share-btn-icon');
        if (iconContainer) {
          const originalIcon = iconContainer.innerHTML;
          iconContainer.innerHTML = getTickIcon();
          setTimeout(() => {
            iconContainer.innerHTML = originalIcon;
          }, 3000);
        }
        return;
      }

      // Reset to default button
      if (target.closest('.cv-reset-btn')) {
        const resetBtn = target.closest('.cv-reset-btn');
        const resetIcon = resetBtn?.querySelector('.cv-reset-btn-icon');
        if (resetIcon) {
          resetIcon.classList.add('cv-spinning');
        }

        this.core.resetToDefault();
        this.loadCurrentStateIntoForm();

        setTimeout(() => {
          if (resetIcon) {
            resetIcon.classList.remove('cv-spinning');
          }
        }, 600);
        return;
      }



      // Overlay click to close
      if (e.target === this.stateModal) {
        this.closeModal();
      }
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    };
    // We can't remove this listener easily if it's anonymous, so we attach it to the document
    // and it will stay for the lifetime of the widget. This is acceptable.
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Attach event listeners for custom state creator's dynamic content
   */
  private _attachStateModalContentEventListeners(): void {
    if (!this.stateModal) return;

    // Listen to toggle switches
    const toggleInputs = this.stateModal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    toggleInputs.forEach(toggleInput => {
      toggleInput.addEventListener('change', () => {
        const state = this.getCurrentCustomStateFromModal();
        this.core.applyState(state, { source: 'widget' });
      });
    });

    // Listen to tab group selects
    const tabGroupSelects = this.stateModal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
    tabGroupSelects.forEach(select => {
      select.addEventListener('change', () => {
        const groupId = select.dataset.groupId;
        const tabId = select.value;
        if (groupId && tabId) {
          const currentTabs = this.core.getCurrentActiveTabs();
          currentTabs[groupId] = tabId;

          const currentToggles = this.core.getCurrentActiveToggles();
          const newState: State = {
            toggles: currentToggles,
            tabs: currentTabs
          };
          this.core.applyState(newState, { source: 'widget' });
        }
      });
    });

    // Listener for show/hide tab navs
    const tabNavToggle = this.stateModal.querySelector('.cv-nav-pref-input') as HTMLInputElement | null;
    const navIcon = this.stateModal?.querySelector('#cv-nav-icon');
    const navHeaderCard = this.stateModal?.querySelector('.cv-tabgroup-card.cv-tabgroup-header') as HTMLElement | null;

    if (tabNavToggle && navIcon && navHeaderCard) {
      const updateIcon = (isVisible: boolean, isHovering: boolean = false) => {
        if (isHovering) {
          navIcon.innerHTML = getNavDashed();
        } else {
          navIcon.innerHTML = isVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
        }
      };

      navHeaderCard.addEventListener('mouseenter', () => updateIcon(tabNavToggle.checked, true));
      navHeaderCard.addEventListener('mouseleave', () => updateIcon(tabNavToggle.checked, false));

      tabNavToggle.addEventListener('change', () => {
        const visible = tabNavToggle.checked;
        updateIcon(visible, false);
        this.core.persistTabNavVisibility(visible);
        try {
          TabManager.setNavsVisibility(document.body, visible);
        } catch (e) {
          console.error('Failed to set tab nav visibility:', e);
        }
      });
    }
  }

  /**
   * Apply theme class to the modal overlay based on options
   */
  private applyThemeToModal(): void {
    if (!this.stateModal) return;
    if (this.options.theme === 'dark') {
      this.stateModal.classList.add('cv-widget-theme-dark');
    } else {
      this.stateModal.classList.remove('cv-widget-theme-dark');
    }
  }


  /**
   * Get current state from form values
   */
  private getCurrentCustomStateFromModal(): State {
    if (!this.stateModal) {
      return {};
    }

    // Collect toggle values
    const toggles: string[] = [];
    const toggleInputs = this.stateModal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    toggleInputs.forEach(toggleInput => {
      const toggle = toggleInput.dataset.toggle;
      if (toggle && toggleInput.checked) {
        toggles.push(toggle);
      }
    });

    // Collect tab selections
    const tabGroupSelects = this.stateModal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
    const tabs: Record<string, string> = {};
    tabGroupSelects.forEach(select => {
      const groupId = select.dataset.groupId;
      if (groupId) {
        tabs[groupId] = select.value;
      }
    });

    const result: State = { toggles };
    if (Object.keys(tabs).length > 0) {
      result.tabs = tabs;
    }
    return result;
  }

  /**
   * Copy shareable URL to clipboard
   */
  private copyShareableURL(): void {
    const customState = this.getCurrentCustomStateFromModal();
    const url = URLStateManager.generateShareableURL(customState);

    navigator.clipboard.writeText(url).then(() => {
      console.log('Shareable URL copied to clipboard!');
    }).catch(() => { console.error('Failed to copy URL!'); });
  }

  /**
   * Load current state into form based on currently active toggles
   */
  private loadCurrentStateIntoForm(): void {
    if (!this.stateModal) return;

    // Get currently active toggles (from custom state or default configuration)
    const activeToggles = this.core.getCurrentActiveToggles();

    // First, uncheck all toggle inputs
    const allToggleInputs = this.stateModal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    allToggleInputs.forEach(toggleInput => {
      toggleInput.checked = false;
    });

    // Then check the ones that should be active
    activeToggles.forEach(toggle => {
      const toggleInput = this.stateModal?.querySelector(`[data-toggle="${toggle}"]`) as HTMLInputElement;
      if (toggleInput) {
        toggleInput.checked = true;
      }
    });

    // Load tab group selections
    const activeTabs = this.core.getCurrentActiveTabs();
    const tabGroupSelects = this.stateModal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
    tabGroupSelects.forEach(select => {
      const groupId = select.dataset.groupId;
      if (groupId && activeTabs[groupId]) {
        select.value = activeTabs[groupId];
      }
    });

    // Load tab nav visibility preference
    const navPref = ((): boolean => {
      const persisted = this.core.getPersistedTabNavVisibility();
      if (persisted !== null) {
        return persisted;
      }
      return TabManager.areNavsVisible(document.body);
    })();
    const tabNavToggle = this.stateModal.querySelector('.cv-nav-pref-input') as HTMLInputElement | null;
    const navIcon = this.stateModal?.querySelector('#cv-nav-icon');
    if (tabNavToggle) {
      tabNavToggle.checked = navPref;
      // Ensure UI matches actual visibility
      TabManager.setNavsVisibility(document.body, navPref);

      // Update the nav icon to reflect the current state
      if (navIcon) {
        navIcon.innerHTML = navPref ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
      }
    }
  }

  /**
   * Check if this is the first visit and show welcome modal
   */
  private showWelcomeModalIfFirstVisit(): void {
    if (!this._hasVisibleConfig) return;

    const STORAGE_KEY = 'cv-welcome-shown';

    // Check if welcome has been shown before
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenWelcome) {
      // Show welcome modal after a short delay to let the page settle
      setTimeout(() => {
        this.createWelcomeModal();
      }, 500);

      // Mark as shown
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

  /**
   * Create and show the welcome modal
   */
  private createWelcomeModal(): void {
    // Don't show if there's already a modal open
    if (this.stateModal && !this.stateModal.classList.contains('cv-hidden')) return;

    const welcomeModal = document.createElement('div');
    welcomeModal.className = 'cv-widget-modal-overlay cv-welcome-modal-overlay';
    if (this.options.theme === 'dark') {
      welcomeModal.classList.add('cv-widget-theme-dark');
    }

    welcomeModal.innerHTML = `
      <div class="cv-widget-modal cv-welcome-modal">
        <header class="cv-modal-header">
          <div class="cv-modal-header-content">
            <div class="cv-modal-icon">
              ${getGearIcon()}
            </div>
            <h1 class="cv-modal-title">${this.options.welcomeTitle}</h1>
          </div>
        </header>
        <div class="cv-modal-main">
          <p class="cv-welcome-message">${this.options.welcomeMessage}</p>
          
          <div class="cv-welcome-widget-preview">
            <div class="cv-welcome-widget-icon">
              ${getGearIcon()}
            </div>
            <p class="cv-welcome-widget-label">Look for this widget</p>
          </div>
          
          <button class="cv-welcome-got-it">Got it!</button>
        </div>
      </div>
    `;

    document.body.appendChild(welcomeModal);
    this.attachWelcomeModalEventListeners(welcomeModal);
  }

  /**
   * Attach event listeners for welcome modal
   */
  private attachWelcomeModalEventListeners(welcomeModal: HTMLElement): void {
    const closeModal = () => {
      welcomeModal.remove();
      document.removeEventListener('keydown', handleEscape);
    };

    // Got it button
    const gotItBtn = welcomeModal.querySelector('.cv-welcome-got-it');
    if (gotItBtn) {
      gotItBtn.addEventListener('click', closeModal);
    }

    // Overlay click to close
    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) {
        closeModal();
      }
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
  }


}
