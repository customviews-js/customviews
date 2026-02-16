import type { CustomViewsRuntime } from './runtime.svelte';
import type { ConfigFile } from '$lib/types/index';
import UIRoot from '$lib/components/UIRoot.svelte';
import { mount, unmount } from 'svelte';

export interface UIManagerOptions {
  /** The CustomViews runtime instance to control */
  runtime: CustomViewsRuntime;

  /** Container element where the settings widget should be rendered */
  container?: HTMLElement;

  /** Whether the settings feature (icon/modal) is enabled */
  settingsEnabled?: boolean;

  /** Settings panel configuration */
  panel?: {
    /** Title displayed in the settings modal */
    title?: string;
    /** Widget description text */
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
    position?:
      | 'top-right'
      | 'top-left'
      | 'bottom-right'
      | 'bottom-left'
      | 'middle-left'
      | 'middle-right';
    /** Custom icon color (e.g. #000, rgba(0,0,0,1)) */
    color?: string | undefined;

    /** Custom background color (e.g. #fff, rgba(255,255,255,1)) */
    backgroundColor?: string | undefined;

    /** Custom opacity (0-1) */
    opacity?: number | undefined;

    /** Custom scale factor (default 1) */
    scale?: number;
    /** Whether to show the icon (default: true) */
    show?: boolean;
  };
}

export type ResolvedUIManagerOptions = Omit<
  UIManagerOptions,
  'container' | 'theme' | 'panel' | 'callout' | 'icon'
> & {
  container: HTMLElement;
  settingsEnabled: boolean;
  theme: NonNullable<UIManagerOptions['theme']>;
  callout: {
    show: boolean;
    message: string;
    enablePulse: boolean;
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
  };
  icon: {
    position: NonNullable<NonNullable<UIManagerOptions['icon']>['position']>;
    color?: string | undefined;
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
    scale: number;
    show: boolean;
  };
};

export class CustomViewsUIManager {
  private app: ReturnType<typeof mount> | null = null;
  private options: ResolvedUIManagerOptions;

  constructor(options: UIManagerOptions) {
    // Set defaults
    this.options = {
      runtime: options.runtime, // 'runtime' is a required property
      container: options.container || document.body,
      settingsEnabled: options.settingsEnabled ?? true,
      theme: options.theme || 'light',
      callout: {
        show: options.callout?.show ?? false,
        message: options.callout?.message || 'Customize your reading experience here.',
        enablePulse: options.callout?.enablePulse ?? true,
        backgroundColor: options.callout?.backgroundColor,
        textColor: options.callout?.textColor,
      },
      icon: {
        position: options.icon?.position || 'middle-left',
        color: options.icon?.color,
        backgroundColor: options.icon?.backgroundColor,
        opacity: options.icon?.opacity,
        scale: options.icon?.scale ?? 1,
        show: options.icon?.show ?? true,
      },
    };
  }

  /**
   * Render the settings widget
   */
  public render(): void {
    if (this.app) {
      return;
    }

    // Mount Svelte App using Svelte 5 API
    this.app = mount(UIRoot, {
      target: this.options.container,
      props: {
        runtime: this.options.runtime,
        options: this.options,
      },
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

/**
 * Initializes the UI manager (settings and share UI) using the provided config.
 */
export function initUIManager(
  runtime: CustomViewsRuntime,
  config: ConfigFile,
): CustomViewsUIManager | undefined {
  const settingsEnabled = config.settings?.enabled !== false;

  const uiManager = new CustomViewsUIManager({
    runtime,
    settingsEnabled,
    ...config.settings,
  });
  uiManager.render();
  return uiManager;
}
