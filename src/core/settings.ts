import type { CustomViewsCore } from "./core.svelte";
import Settings from "../components/settings/Settings.svelte";
import { mount, unmount } from "svelte";

export interface SettingsOptions {
  /** The CustomViews core instance to control */
  core: CustomViewsCore;

  /** Container element where the settings widget should be rendered */
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

  /** Callout configuration options */
  callout?: {
    /** Whether to show the callout */
    show?: boolean;
    /** Message to display in the callout */
    message?: string;
    /** Whether to enable pulse animation */
    enablePulse?: boolean;
    /** Custom background color */
    backgroundColor?: string;
    /** Custom text color */
    textColor?: string;
  };

  /** Whether to show tab groups section in widget (default: true) */
  showTabGroups?: boolean;

  /** Custom icon styling options */
  icon?: {
    /** Custom icon color (e.g. #000, rgba(0,0,0,1)) */
    color?: string;

    /** Custom background color (e.g. #fff, rgba(255,255,255,1)) */
    backgroundColor?: string;

    /** Custom opacity (0-1) */
    opacity?: number;

    /** Custom scale factor (default 1) */
    scale?: number;
  };
}

export class CustomViewsSettings {
  private app: ReturnType<typeof mount> | null = null;
  private options: Required<Omit<SettingsOptions, 'container' | 'position' | 'theme' | 'showReset' | 'title' | 'description' | 'callout' | 'showTabGroups' | 'icon'>> & Omit<SettingsOptions, 'container'> & { container: HTMLElement };

  constructor(options: SettingsOptions) {
    // Set defaults
    this.options = {
      core: options.core,
      container: options.container || document.body,
      position: options.position || 'middle-left',
      theme: options.theme || 'light',
      showReset: options.showReset ?? true,
      title: options.title || 'Customize View',
      description: options.description || '',
      callout: {
        show: options.callout?.show ?? false,
        message: options.callout?.message || 'Customize your reading experience here.',
        enablePulse: options.callout?.enablePulse ?? true,
        backgroundColor: options.callout?.backgroundColor,
        textColor: options.callout?.textColor
      },
      showTabGroups: options.showTabGroups ?? true,
      icon: {
        color: options.icon?.color,
        backgroundColor: options.icon?.backgroundColor,
        opacity: options.icon?.opacity,
        scale: options.icon?.scale ?? 1
      }
    } as any;
  }

  /**
   * Render the settings widget
   */
  public renderModalIcon(): void {
    if (this.app) {
      return;
    }

    // Mount Svelte App using Svelte 5 API
    this.app = mount(Settings, {
      target: this.options.container,
      props: {
        core: this.options.core,
        options: this.options
      }
    });
  }

  /**
   * Remove the settings widget from DOM
   */
  public destroy(): void {
    if (this.app) {
      unmount(this.app);
      this.app = null;
    }
  }
}
