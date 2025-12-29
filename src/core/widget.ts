import type { CustomViewsCore } from "./core";
import MainWidget from "../components/MainWidget.svelte";
import { mount, unmount } from "svelte";

export interface WidgetOptions {
  /** The CustomViews core instance to control */
  core: CustomViewsCore;

  /** Container element where the widget should be rendered */
  container?: HTMLElement;

  /** Widget position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'middle-left', 'middle-right' */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right';

  /** Widget theme: 'light' | 'dark' */
  theme?: 'light' | 'dark';

  /** Whether to show reset button */
  showReset?: boolean;

  /** Widget title */
  title?: string;

  /** Widget description text */
  description?: string;

  /** Whether to show welcome callout on first visit */
  showWelcome?: boolean;

  /** Welcome callout message (only used if showWelcome is true) */
  welcomeMessage?: string;

  /** Whether to show tab groups section in widget (default: true) */
  showTabGroups?: boolean;
}

export class CustomViewsWidget {
  private app: ReturnType<typeof mount> | null = null;
  private options: Required<WidgetOptions>;

  constructor(options: WidgetOptions) {
    // Set defaults
    this.options = {
      core: options.core,
      container: options.container || document.body,
      position: options.position || 'middle-left',
      theme: options.theme || 'light',
      showReset: options.showReset ?? true,
      title: options.title || 'Customize View',
      description: options.description || '',
      showWelcome: options.showWelcome ?? false,
      welcomeMessage: options.welcomeMessage || 'Customize your reading experience (theme, toggles, tabs) here.',
      showTabGroups: options.showTabGroups ?? true
    };
  }

  /**
   * Render the widget
   */
  public renderModalIcon(): void {
    if (this.app) {
      return;
    }

    // Mount Svelte App using Svelte 5 API
    this.app = mount(MainWidget, {
      target: this.options.container,
      props: {
        core: this.options.core,
        options: this.options
      }
    });
  }

  /**
   * Remove the widget from DOM
   */
  public destroy(): void {
    if (this.app) {
      unmount(this.app);
      this.app = null;
    }
  }
}
