/**
 * Interface Settings Store
 * Stores settings related to the UI appearance and behavior.
 */
export class InterfaceSettingsStore {
  /**
   * UI Configuration Options
   */
  options = $state({
    showTabGroups: true,
    showReset: true,
    title: 'Customize View',
    description: '',
  });

  /**
   * Controls the visibility of the tab navigation headers globally.
   */
  isTabGroupNavHeadingVisible = $state(true);

  constructor() {}

  updateOptions(opts: {
    showTabGroups?: boolean;
    showReset?: boolean;
    title?: string;
    description?: string;
  }) {
    if (opts.showTabGroups !== undefined) this.options.showTabGroups = opts.showTabGroups;
    if (opts.showReset !== undefined) this.options.showReset = opts.showReset;
    if (opts.title !== undefined) this.options.title = opts.title;
    if (opts.description !== undefined) this.options.description = opts.description;
  }

  reset() {
    this.options = {
      showTabGroups: true,
      showReset: true,
      title: 'Customize View',
      description: '',
    };
    this.isTabGroupNavHeadingVisible = true;
  }
}
