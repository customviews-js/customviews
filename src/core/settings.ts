import type { CustomViewsCore } from "./core.svelte";
import Settings from "../components/settings/Settings.svelte";
import { mount, unmount } from "svelte";

export interface SettingsOptions {
  /** The CustomViews core instance to control */
  core: CustomViewsCore;

  /** Container element where the settings widget should be rendered */
  container?: HTMLElement;

  /** Settings panel configuration */
  panel?: {
    /** Title displayed in the settings modal */
    title?: string;
    /** Description text displayed in the settings modal */
    description?: string;
    /** Whether to show tab groups section in widget (default: true) */
    showTabGroups?: boolean;
    /** Whether to show the reset button (default: true) */
    showReset?: boolean;
  };

  /** Widget theme: 'light' | 'dark' */
  theme?: 'light' | 'dark';

  /** Callout configuration options */
  callout?: {
    /** Whether to show the callout */
    show?: boolean;
    /** Message to display in the callout */
    message?: string;
    /** Whether to enable pulse animation */
    enablePulse?: boolean;
    /** Custom background color */
    backgroundColor?: string | undefined;
    /** Custom text color */
    textColor?: string | undefined;
  };

  /** Custom icon styling options */
  icon?: {
    /** Widget position (default: middle-left) */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'middle-left' | 'middle-right';
    /** Custom icon color (e.g. #000, rgba(0,0,0,1)) */
    color?: string | undefined;

    /** Custom background color (e.g. #fff, rgba(255,255,255,1)) */
    backgroundColor?: string | undefined;

    /** Custom opacity (0-1) */
    opacity?: number | undefined;

    /** Custom scale factor (default 1) */
    scale?: number;
  };
}

export type ResolvedSettingsOptions = Omit<SettingsOptions, 'container' | 'theme' | 'panel' | 'callout' | 'icon'> & {
  container: HTMLElement;
  theme: NonNullable<SettingsOptions['theme']>;
  panel: Required<NonNullable<SettingsOptions['panel']>>;
  callout: {
    show: boolean;
    message: string;
    enablePulse: boolean;
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
  };
  icon: {
    position: NonNullable<NonNullable<SettingsOptions['icon']>['position']>;
    color?: string | undefined;
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
    scale: number;
  };
};

export class CustomViewsSettings {
  private app: ReturnType<typeof mount> | null = null;
  private options: ResolvedSettingsOptions;

  constructor(options: SettingsOptions) {
    // Set defaults
    this.options = {
      core: options.core, // 'core' is a required property and must be explicitly passed
      container: options.container || document.body,
      theme: options.theme || 'light',
      panel: {
        title: options.panel?.title || 'Customize View',
        description: options.panel?.description || '',
        showTabGroups: options.panel?.showTabGroups ?? true,
        showReset: options.panel?.showReset ?? true
      },
      callout: {
        show: options.callout?.show ?? false,
        message: options.callout?.message || 'Customize your reading experience here.',
        enablePulse: options.callout?.enablePulse ?? true,
        backgroundColor: options.callout?.backgroundColor,
        textColor: options.callout?.textColor
      },
      icon: {
        position: options.icon?.position || 'middle-left',
        color: options.icon?.color,
        backgroundColor: options.icon?.backgroundColor,
        opacity: options.icon?.opacity,
        scale: options.icon?.scale ?? 1
      }
    };
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
