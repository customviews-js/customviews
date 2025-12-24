import { injectWidgetStyles } from "../styles/widget-styles";
import type { CustomViewsCore } from "./core";
import type { State } from "../types/types";
import { URLStateManager } from "./url-state-manager";

import { TabManager } from "./tab-manager";
import { getGearIcon, getCloseIcon, getResetIcon, getCopyIcon, getTickIcon, getNavHeadingOnIcon, getNavHeadingOffIcon, getNavDashed, getShareIcon, getGitHubIcon } from "../utils/icons";

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
  private currentTab: 'customize' | 'share' = 'customize';

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
      welcomeMessage: options.welcomeMessage || 'Customize your reading experience (theme, toggles, tabs) here.',
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

    // Show intro callout on first visit if enabled
    if (this.options.showWelcome) {
      this.showIntroCalloutIfFirstVisit();
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

    // Clean up callout
    const callout = document.querySelector('.cv-widget-callout');
    if (callout) {
      callout.remove();
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
   * Dismiss the intro callout
   */
  private dismissIntroCallout(callout: HTMLElement): void {
    callout.classList.add('cv-hidden');
    setTimeout(() => callout.remove(), 300); // Wait for fade out if any

    // Stop pulsing the widget icon
    if (this.widgetIcon) {
      this.widgetIcon.classList.remove('cv-pulse');
    }

    // Mark as shown in localStorage
    try {
      localStorage.setItem('cv-intro-shown', 'true');
    } catch (e) {
      // Ignore localStorage errors
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
          <div class="cv-toggle-radios">
             <label class="cv-radio-label" title="Hide">
               <input class="cv-toggle-input" type="radio" name="cv-toggle-${toggle.id}" value="hide" data-toggle="${toggle.id}"/>
               <span>Hide</span>
             </label>
             <label class="cv-radio-label" title="Peek">
               <input class="cv-toggle-input" type="radio" name="cv-toggle-${toggle.id}" value="peek" data-toggle="${toggle.id}"/>
               <span>Peek</span>
             </label>
             <label class="cv-radio-label" title="Show">
               <input class="cv-toggle-input" type="radio" name="cv-toggle-${toggle.id}" value="show" data-toggle="${toggle.id}"/>
               <span>Show</span>
             </label>
          </div>
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
                <p class="cv-tabgroup-title">Show only the selected tab</p>
              </div>
              <p class="cv-tabgroup-description">Hide the navigation headers</p>
            </div>
            <label class="cv-toggle-switch cv-nav-toggle">
              <input class="cv-nav-pref-input" type="checkbox" ${initialNavsVisible ? '' : 'checked'} aria-label="Show only the selected tab" />
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
          
          <div class="cv-modal-tabs">
            <button class="cv-modal-tab ${this.currentTab === 'customize' ? 'active' : ''}" data-tab="customize">Customize</button>
            <button class="cv-modal-tab ${this.currentTab === 'share' ? 'active' : ''}" data-tab="share">Share</button>
          </div>

          <div class="cv-tab-content ${this.currentTab === 'customize' ? 'active' : ''}" data-content="customize">
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
          </div>

          <div class="cv-tab-content ${this.currentTab === 'share' ? 'active' : ''}" data-content="share">
            <div class="cv-share-content">
              <div class="cv-share-instruction">
                Create a shareable link for your current customization, or select specific parts of the page to share.
              </div>
              
              <button class="cv-share-action-btn primary cv-start-share-btn">
                <span class="cv-btn-icon">${getShareIcon()}</span>
                <span>Select elements to share</span>
              </button>
              
              <button class="cv-share-action-btn cv-copy-url-btn">
                <span class="cv-btn-icon">${getCopyIcon()}</span>
                <span>Copy Shareable URL of Settings</span>
              </button>
            </div>
          </div>
        </main>

        <footer class="cv-modal-footer">
          ${this.options.showReset ? `
          <button class="cv-reset-btn" title="Reset to Default">
            <span class="cv-reset-btn-icon">${getResetIcon()}</span>
            <span>Reset</span>
          </button>
          ` : '<div></div>'}
          
          <a href="https://github.com/customviews-js/customviews" target="_blank" class="cv-footer-link">
            ${getGitHubIcon()}
            <span>View on GitHub</span>
          </a>

          <button class="cv-done-btn">Done</button>
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

      // Done button
      if (target.closest('.cv-done-btn')) {
        this.closeModal();
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


          const currentState = this.core.getCurrentState();

          const newState: State = {
            shownToggles: currentState.shownToggles || [],
            peekToggles: currentState.peekToggles || [], // Preserve peek state, fallback to empty array
            tabs: currentTabs,
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

      navHeaderCard.addEventListener('mouseenter', () => updateIcon(!tabNavToggle.checked, true));
      navHeaderCard.addEventListener('mouseleave', () => updateIcon(!tabNavToggle.checked, false));

      tabNavToggle.addEventListener('change', () => {
        const visible = !tabNavToggle.checked;
        updateIcon(visible, false);
        this.core.persistTabNavVisibility(visible);
        try {
          TabManager.setNavsVisibility(document.body, visible);
        } catch (e) {
          console.error('Failed to set tab nav visibility:', e);
        }
      });
    }

    // Tab switching
    const tabs = this.stateModal.querySelectorAll('.cv-modal-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = (tab as HTMLElement).dataset.tab;
        if (tabId === 'customize' || tabId === 'share') {
          this.currentTab = tabId;

          // Update UI without full re-render
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const contents = this.stateModal?.querySelectorAll('.cv-tab-content');
          contents?.forEach(c => {
            c.classList.remove('active');
            if ((c as HTMLElement).dataset.content === tabId) {
              c.classList.add('active');
            }
          });
        }
      });
    });

    // Share buttons (inside content)
    const startShareBtn = this.stateModal.querySelector('.cv-start-share-btn');
    if (startShareBtn) {
      startShareBtn.addEventListener('click', () => {
        this.closeModal();
        this.core.toggleShareMode();
      });
    }

    const copyUrlBtn = this.stateModal.querySelector('.cv-copy-url-btn');
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        this.copyShareableURL();
        const iconContainer = copyUrlBtn.querySelector('.cv-btn-icon');
        if (iconContainer) {
          const originalIcon = iconContainer.innerHTML;
          iconContainer.innerHTML = getTickIcon();
          setTimeout(() => {
            iconContainer.innerHTML = originalIcon;
          }, 2000);
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
    const peekToggles: string[] = [];

    // Get all radio inputs
    const radios = this.stateModal.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
      const input = radio as HTMLInputElement;
      const toggleId = input.getAttribute('data-toggle');
      if (toggleId) {
        if (input.value === 'show') {
          toggles.push(toggleId);
        } else if (input.value === 'peek') {
          peekToggles.push(toggleId);
        }
      }
    });

    const result: State = { shownToggles: toggles, peekToggles };

    // Get active tabs from selects
    const selects = this.stateModal.querySelectorAll('select[data-group-id]');
    if (selects.length > 0) {
      result.tabs = {};
      selects.forEach(select => {
        const el = select as HTMLSelectElement;
        const groupId = el.getAttribute('data-group-id');
        if (groupId) {
          result.tabs![groupId] = el.value;
        }
      });
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

    // We need complete state for both shown and peek toggles
    const currentState = this.core.getCurrentState();
    const currentToggles = currentState.shownToggles || [];
    const currentPeekToggles = currentState.peekToggles || [];

    // Reset all inputs first (optional, but good for clarity)
    const allToggleInputs = this.stateModal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;

    // Identify unique toggles present in the modal
    const uniqueToggles = new Set<string>();
    allToggleInputs.forEach(input => {
      if (input.dataset.toggle) uniqueToggles.add(input.dataset.toggle);
    });

    uniqueToggles.forEach(toggleId => {
      let valueToSelect = 'hide';
      if (currentToggles.includes(toggleId)) {
        valueToSelect = 'show';
      } else if (currentPeekToggles.includes(toggleId)) {
        valueToSelect = 'peek';
      }

      const input = this.stateModal!.querySelector(`input[name="cv-toggle-${toggleId}"][value="${valueToSelect}"]`) as HTMLInputElement;
      if (input) {
        input.checked = true;
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
      tabNavToggle.checked = !navPref;
      // Ensure UI matches actual visibility
      TabManager.setNavsVisibility(document.body, navPref);

      // Update the nav icon to reflect the current state
      if (navIcon) {
        navIcon.innerHTML = navPref ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
      }
    }
  }

  /**
   * Check if this is the first visit and show intro callout
   */
  private showIntroCalloutIfFirstVisit(): void {
    if (!this._hasVisibleConfig) return;

    // Strict check: Only show callout if there is actual content on the page to customize.
    // We check the core registry for any active toggles or tab groups.
    if (!this.core.hasActiveComponents()) {
      return;
    }

    const STORAGE_KEY = 'cv-intro-shown';

    // Check if intro has been shown before
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenIntro) {
      // Show callout after a short delay
      setTimeout(() => {
        this.createCallout();
      }, 1000);
    }
  }

  /**
   * Create and show the intro callout
   */
  private createCallout(): void {
    // Avoid duplicates
    if (document.querySelector('.cv-widget-callout')) return;

    const callout = document.createElement('div');
    callout.className = `cv-widget-callout cv-pos-${this.options.position}`;
    if (this.options.theme === 'dark') {
      callout.classList.add('cv-widget-theme-dark');
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cv-widget-callout-close';
    closeBtn.innerHTML = getCloseIcon(); // Reusing close icon, might be too big? 
    // Actually getCloseIcon returns an SVG string.
    // Let's use a simple '×' character or a smaller SVG for the callout close button for simplicity/tightness
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Dismiss intro');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismissIntroCallout(callout);
    });

    // Message
    const msg = document.createElement('p');
    msg.className = 'cv-widget-callout-text';
    msg.textContent = this.options.welcomeMessage;
    // Allow HTML in welcome message? The original allowed it. 
    msg.innerHTML = this.options.welcomeMessage;

    callout.appendChild(closeBtn);
    callout.appendChild(msg);

    document.body.appendChild(callout);

    // Add pulse to widget icon to draw attention
    if (this.widgetIcon) {
      this.widgetIcon.classList.add('cv-pulse');
    }

    // Auto-dismiss on click anywhere on callout? No, maybe clicking callout opens widget?
    callout.addEventListener('click', () => {
      this.dismissIntroCallout(callout);
      this.openStateModal();
    });
  }


}
