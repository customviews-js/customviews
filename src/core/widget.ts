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
  
  // Modal state
  private modal: HTMLElement | null = null;
  

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
    
    // No external state manager to initialize
  }

  /**
   * Render the widget
   */
  public render(): HTMLElement {
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
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
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
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  /**
   * Open the custom state creator
   */
  private openStateModal(): void {
    // Get toggles from current configuration and open the modal regardless of count
    const config = this.core.getConfig();
    const toggles = config?.allToggles || [];
    this.createCustomStateModal(toggles);
  }

  /**
   * Create the custom state creator modal
   */
  private createCustomStateModal(toggles: string[]): void {
    // Close existing modal
    this.closeModal();

    this.modal = document.createElement('div');
    this.modal.className = 'cv-widget-modal-overlay';
    this.applyThemeToModal();
    
    const toggleControlsHtml = toggles.map(toggle => `
      <div class="cv-toggle-card">
        <div class="cv-toggle-content">
          <div>
            <p class="cv-toggle-title">${this.formatToggleName(toggle)}</p>
          </div>
          <label class="cv-toggle-label">
            <input class="cv-toggle-input" type="checkbox" data-toggle="${toggle}"/>
            <span class="cv-toggle-slider"></span>
          </label>
        </div>
      </div>
    `).join('');
    
    // Todo: Re-add description if needed (Line 168, add label field to toggles if needed change structure)
    // <p class="cv-toggle-description">Show or hide the ${this.formatToggleName(toggle).toLowerCase()} area </p>

    // Get tab groups
    const tabGroups = this.core.getTabGroups();
    let tabGroupControlsHTML = '';


    if (this.options.showTabGroups && tabGroups && tabGroups.length > 0) {
      // Determine initial nav visibility state
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


    this.modal.innerHTML = `
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
          
          ${toggles.length ? `
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

    document.body.appendChild(this.modal);
    this.attachStateModalEventListeners();

    // Load current state into form if we're already in a custom state
    this.loadCurrentStateIntoForm();
  }

  /**
   * Attach event listeners for custom state creator
   */
  private attachStateModalEventListeners(): void {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.cv-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Copy URL button
    const copyUrlBtn = this.modal.querySelector('.cv-share-btn');
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        this.copyShareableURL();
        
        // Visual feedback: change icon to tick for 3 seconds
        const iconContainer = copyUrlBtn.querySelector('.cv-share-btn-icon');
        if (iconContainer) {
          const originalIcon = iconContainer.innerHTML;
          iconContainer.innerHTML = getTickIcon();
          
          // Revert after 3 seconds
          setTimeout(() => {
            iconContainer.innerHTML = originalIcon;
          }, 3000);
        }
      });
    }

    // Reset to default button
    const resetBtn = this.modal.querySelector('.cv-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Add spinning animation to icon
        const resetIcon = resetBtn.querySelector('.cv-reset-btn-icon');
        if (resetIcon) {
          resetIcon.classList.add('cv-spinning');
        }
        
        this.core.resetToDefault();
        this.loadCurrentStateIntoForm();
        
        // Remove spinning animation after it completes
        setTimeout(() => {
          if (resetIcon) {
            resetIcon.classList.remove('cv-spinning');
          }
        }, 600); // 600ms matches the animation duration
      });
    }

    // Listen to toggle switches
    const toggleInputs = this.modal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    toggleInputs.forEach(toggleInput => {
      toggleInput.addEventListener('change', () => {
        const state = this.getCurrentCustomStateFromModal();
        this.core.applyState(state, { source: 'widget' });
      });
    });

    // Listen to tab group selects
    const tabGroupSelects = this.modal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
    tabGroupSelects.forEach(select => {
      select.addEventListener('change', () => {
        const groupId = select.dataset.groupId;
        const tabId = select.value;
        if (groupId && tabId) {
          // Get current state and update the tab for this group, then apply globally
          // This triggers sync behavior and persistence
          const currentTabs = this.core.getCurrentActiveTabs();
          currentTabs[groupId] = tabId;
          
          // Apply state globally for persistence and sync
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
    const tabNavToggle = this.modal.querySelector('.cv-nav-pref-input') as HTMLInputElement | null;
    const navIcon = this.modal?.querySelector('#cv-nav-icon');
    const navHeaderCard = this.modal?.querySelector('.cv-tabgroup-card.cv-tabgroup-header') as HTMLElement | null;
    
    if (tabNavToggle && navIcon && navHeaderCard) {
      // Helper to update icon based on state
      const updateIcon = (isVisible: boolean, isHovering: boolean = false) => {
        if (isHovering) {
          // On hover, show the transition icon
          navIcon.innerHTML = getNavDashed();
        } else {
          // Normal state, show the status icon (on if visible, off if hidden)
          navIcon.innerHTML = isVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon();
        }
      };
      
      // Add hover listeners to entire header card
      navHeaderCard.addEventListener('mouseenter', () => {
        updateIcon(tabNavToggle.checked, true);
      });
      
      navHeaderCard.addEventListener('mouseleave', () => {
        updateIcon(tabNavToggle.checked, false);
      });
      
      // Add change listener
      tabNavToggle.addEventListener('change', () => {
        const visible = tabNavToggle.checked;
        
        // Update the icon based on new state (not hovering)
        updateIcon(visible, false);
        
        // Persist preference via core
        this.core.persistTabNavVisibility(visible);
        
        // Apply to DOM using TabManager via core
        try {
          const rootEl = document.body;
          TabManager.setNavsVisibility(rootEl, visible);
        } catch (e) {
          // ignore errors
          console.error('Failed to set tab nav visibility:', e);
        }
      });
    }

    // Overlay click to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Apply theme class to the modal overlay based on options
   */
  private applyThemeToModal(): void {
    if (!this.modal) return;
    if (this.options.theme === 'dark') {
      this.modal.classList.add('cv-widget-theme-dark');
    } else {
      this.modal.classList.remove('cv-widget-theme-dark');
    }
  }


  /**
   * Get current state from form values
   */
  private getCurrentCustomStateFromModal(): State {
    if (!this.modal) {
      return {};
    }

    // Collect toggle values
    const toggles: string[] = [];
    const toggleInputs = this.modal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    toggleInputs.forEach(toggleInput => {
      const toggle = toggleInput.dataset.toggle;
      if (toggle && toggleInput.checked) {
        toggles.push(toggle);
      }
    });

    // Collect tab selections
    const tabGroupSelects = this.modal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
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
    }).catch(() => {console.error('Failed to copy URL!');});
  }

  /**
   * Load current state into form based on currently active toggles
   */
  private loadCurrentStateIntoForm(): void {
    if (!this.modal) return;

    // Get currently active toggles (from custom state or default configuration)
    const activeToggles = this.core.getCurrentActiveToggles();
    
    // First, uncheck all toggle inputs
    const allToggleInputs = this.modal.querySelectorAll('.cv-toggle-input') as NodeListOf<HTMLInputElement>;
    allToggleInputs.forEach(toggleInput => {
      toggleInput.checked = false;
    });

    // Then check the ones that should be active
    activeToggles.forEach(toggle => {
      const toggleInput = this.modal?.querySelector(`[data-toggle="${toggle}"]`) as HTMLInputElement;
      if (toggleInput) {
        toggleInput.checked = true;
      }
    });

    // Load tab group selections
    const activeTabs = this.core.getCurrentActiveTabs();
    const tabGroupSelects = this.modal.querySelectorAll('.cv-tabgroup-select') as NodeListOf<HTMLSelectElement>;
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
    const tabNavToggle = this.modal.querySelector('.cv-nav-pref-input') as HTMLInputElement | null;
    const navIcon = this.modal?.querySelector('#cv-nav-icon');
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
   * Format toggle name for display
   */
  private formatToggleName(toggle: string): string {
    return toggle.charAt(0).toUpperCase() + toggle.slice(1);
  }

  /**
   * Check if this is the first visit and show welcome modal
   */
  private showWelcomeModalIfFirstVisit(): void {
    const STORAGE_KEY = 'cv-welcome-shown';
    
    // Check if welcome has been shown before
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    
    if (!hasSeenWelcome) {
      // Check if this page has any custom views elements
      const hasCustomViewElements = 
        document.querySelector('cv-tabgroup') !== null ||
        document.querySelector('cv-tab') !== null ||
        document.querySelector('cv-toggle') !== null ||
        document.querySelector('[data-cv-toggle]') !== null;
      
      if (hasCustomViewElements) {
        // Show welcome modal after a short delay to let the page settle
        setTimeout(() => {
          this.createWelcomeModal();
        }, 500);
        
        // Mark as shown
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    }
  }

  /**
   * Create and show the welcome modal
   */
  private createWelcomeModal(): void {
    // Don't show if there's already a modal open
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.className = 'cv-widget-modal-overlay cv-welcome-modal-overlay';
    this.applyThemeToModal();
    
    this.modal.innerHTML = `
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

    document.body.appendChild(this.modal);
    this.attachWelcomeModalEventListeners();
  }

  /**
   * Attach event listeners for welcome modal
   */
  private attachWelcomeModalEventListeners(): void {
    if (!this.modal) return;

    // Got it button
    const gotItBtn = this.modal.querySelector('.cv-welcome-got-it');
    if (gotItBtn) {
      gotItBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Overlay click to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }


}
