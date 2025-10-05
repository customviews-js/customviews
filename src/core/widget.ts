import { injectWidgetStyles } from "../styles/widget-styles";
import type { CustomViewsCore } from "./core";
import type { State } from "../types/types";
import { URLStateManager } from "./url-state-manager";

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
      title: options.title || 'Custom Views',
      description: options.description || 'Toggle different content sections to customize your view. Changes are applied instantly and the URL will be updated for sharing.',
      showWelcome: options.showWelcome ?? false,
      welcomeTitle: options.welcomeTitle || 'Welcome to Custom Views!',
      welcomeMessage: options.welcomeMessage || 'This website uses Custom Views to let you personalize your experience. Use the widget on the side (⚙) to show or hide different content sections based on your preferences. Your selections will be saved and can be shared via URL.',
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
    
    const toggleControls = toggles.length
      ? toggles.map(toggle => `
        <div class="cv-custom-state-toggle">
          <label>
            <input type="checkbox" class="cv-custom-toggle-checkbox" data-toggle="${toggle}" />
            ${this.formatToggleName(toggle)}
          </label>
        </div>
      `).join('')
      : `<p class="cv-no-toggles">No configurable sections available.</p>`;

    // Get tab groups
    const tabGroups = this.core.getTabGroups();
    let tabGroupsHTML = '';
    
    if (this.options.showTabGroups && tabGroups && tabGroups.length > 0) {
      const tabGroupControls = tabGroups.map(group => {
        const options = group.tabs.map(tab => 
          `<option value="${tab.id}">${tab.label || tab.id}</option>`
        ).join('');
        
        return `
          <div class="cv-tab-group-control">
            <label for="tab-group-${group.id}">${group.label || group.id}</label>
            <select id="tab-group-${group.id}" class="cv-tab-group-select" data-group-id="${group.id}">
              ${options}
            </select>
          </div>
        `;
      }).join('');
      
      tabGroupsHTML = `
        <h4>Tab Groups</h4>
        <div class="cv-tab-groups">
          ${tabGroupControls}
        </div>
      `;
    }

    this.modal.innerHTML = `
      <div class="cv-widget-modal cv-custom-state-modal">
        <div class="cv-widget-modal-header">
          <h3>Customize View</h3>
          <button class="cv-widget-modal-close" aria-label="Close modal">X</button>
        </div>
        <div class="cv-widget-modal-content">
          <div class="cv-custom-state-form">
            <p>${this.options.description}</p>
            
            <h4>Content Sections</h4>
            <div class="cv-custom-toggles">
              ${toggleControls}
            </div>
            
            ${tabGroupsHTML}
            
            <div class="cv-custom-state-actions">
              ${this.options.showReset ? `<button class="cv-custom-state-reset">Reset to Default</button>` : ''}
              <button class="cv-custom-state-copy-url">Copy Shareable URL</button>
            </div>
          </div>
        </div>
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
    const closeBtn = this.modal.querySelector('.cv-widget-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Copy URL button
    const copyUrlBtn = this.modal.querySelector('.cv-custom-state-copy-url');
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        this.copyShareableURL();
      });
    }

    // Reset to default button
    const resetBtn = this.modal.querySelector('.cv-custom-state-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.core.resetToDefault();
        this.loadCurrentStateIntoForm();
      });
    }

    // Listen to toggle checkboxes
    const toggleCheckboxes = this.modal.querySelectorAll('.cv-custom-toggle-checkbox') as NodeListOf<HTMLInputElement>;
    toggleCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const state = this.getCurrentCustomStateFromModal();
        this.core.applyState(state);
      });
    });

    // Listen to tab group selects
    const tabGroupSelects = this.modal.querySelectorAll('.cv-tab-group-select') as NodeListOf<HTMLSelectElement>;
    tabGroupSelects.forEach(select => {
      select.addEventListener('change', () => {
        const groupId = select.dataset.groupId;
        const tabId = select.value;
        if (groupId && tabId) {
          this.core.setActiveTab(groupId, tabId);
        }
      });
    });

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
      return { toggles: [] };
    }

    // Collect toggle values
    const toggles: string[] = [];
    const toggleCheckboxes = this.modal.querySelectorAll('.cv-custom-toggle-checkbox') as NodeListOf<HTMLInputElement>;
    toggleCheckboxes.forEach(checkbox => {
      const toggle = checkbox.dataset.toggle;
      if (toggle && checkbox.checked) {
        toggles.push(toggle);
      }
    });

    return { toggles };
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
    
    // First, uncheck all checkboxes
    const allCheckboxes = this.modal.querySelectorAll('.cv-custom-toggle-checkbox') as NodeListOf<HTMLInputElement>;
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = false;
      checkbox.parentElement?.removeAttribute('aria-hidden');
    });

    // Then check the ones that should be active
    activeToggles.forEach(toggle => {
      const checkbox = this.modal?.querySelector(`[data-toggle="${toggle}"]`) as HTMLInputElement;
      if (checkbox) {
        if (!checkbox.disabled) {
          checkbox.checked = true;
        }
      }
    });

    // Load tab group selections
    const activeTabs = this.core.getCurrentActiveTabs();
    const tabGroupSelects = this.modal.querySelectorAll('.cv-tab-group-select') as NodeListOf<HTMLSelectElement>;
    tabGroupSelects.forEach(select => {
      const groupId = select.dataset.groupId;
      if (groupId && activeTabs[groupId]) {
        select.value = activeTabs[groupId];
      }
    });
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
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.className = 'cv-widget-modal-overlay cv-welcome-modal-overlay';
    this.applyThemeToModal();
    
    this.modal.innerHTML = `
      <div class="cv-widget-modal cv-welcome-modal">
        <div class="cv-widget-modal-header">
          <h3>${this.options.welcomeTitle}</h3>
          <button class="cv-widget-modal-close" aria-label="Close modal">×</button>
        </div>
        <div class="cv-widget-modal-content">
          <div class="cv-welcome-content">
            <p>${this.options.welcomeMessage}</p>
            
            <div class="cv-welcome-widget-preview">
              <div class="cv-welcome-widget-icon">⚙</div>
              <p class="cv-welcome-widget-label">Look for this widget on the side of the screen</p>
            </div>
            
            <button class="cv-welcome-got-it">Got it!</button>
          </div>
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

    // Close button
    const closeBtn = this.modal.querySelector('.cv-widget-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

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
