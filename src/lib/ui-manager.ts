import type { CustomViewsController } from './controller.svelte';
import type { ConfigFile } from '$lib/types/index';
import UIRoot from '$lib/components/UIRoot.svelte';
import { mount, unmount } from 'svelte';

import type { WidgetSettings, WidgetCalloutConfig, WidgetIconConfig } from '$features/settings/types';

export interface UIManagerOptions extends Omit<WidgetSettings, 'enabled'> {
  /** The CustomViews controller instance to control */
  controller: CustomViewsController;

  /** Container element where the settings widget should be rendered */
  container?: HTMLElement;

  /** Whether the settings feature (icon/modal) is enabled */
  settingsEnabled?: boolean;

  /** Widget theme: 'light' | 'dark' */
  theme?: 'light' | 'dark';
}

export type ResolvedUIManagerOptions = Omit<
  UIManagerOptions,
  'container' | 'theme' | 'panel' | 'callout' | 'icon'
> & {
  container: HTMLElement;
  settingsEnabled: boolean;
  theme: NonNullable<UIManagerOptions['theme']>;
  callout: Required<Pick<WidgetCalloutConfig, 'show' | 'message' | 'enablePulse'>> & {
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
  };
  icon: Required<Pick<WidgetIconConfig, 'position' | 'scale' | 'show'>> & {
    color?: string | undefined;
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
  };
};

export class CustomViewsUIManager {
  private app: ReturnType<typeof mount> | null = null;
  private options: ResolvedUIManagerOptions;

  constructor(options: UIManagerOptions) {
    // Set defaults
    this.options = {
      controller: options.controller, // 'controller' is a required property
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
        controller: this.options.controller,
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
  controller: CustomViewsController,
  config: ConfigFile,
): CustomViewsUIManager | undefined {
  const settingsEnabled = config.settings?.enabled !== false;

  const uiManager = new CustomViewsUIManager({
    controller,
    settingsEnabled,
    ...config.settings,
  });
  uiManager.render();
  return uiManager;
}
