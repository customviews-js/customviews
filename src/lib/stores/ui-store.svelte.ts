/**
 * Store for UI Configuration Options.
 * Stores settings related to the UI appearance and behavior (e.g. visibility of specific sections).
 */
export class UIStore {
  uiOptions = $state({
    showTabGroups: true,
    showReset: true,
    title: 'Customize View',
    description: '',
  });

  /**
   * Controls the visibility of the tab navigation headers globally.
   */
  isTabGroupNavHeadingVisible = $state(true);

  /**
   * Updates the UI configuration options.
   * @param options Partial UI options to merge.
   */
  setUIOptions(options: {
    showTabGroups?: boolean;
    showReset?: boolean;
    title?: string;
    description?: string;
  }) {
    if (options.showTabGroups !== undefined) {
      this.uiOptions.showTabGroups = options.showTabGroups;
    }
    if (options.showReset !== undefined) {
      this.uiOptions.showReset = options.showReset;
    }
    if (options.title !== undefined) {
      this.uiOptions.title = options.title;
    }
    if (options.description !== undefined) {
      this.uiOptions.description = options.description;
    }
  }

  reset() {
    this.uiOptions = {
      showTabGroups: true,
      showReset: true,
      title: 'Customize View',
      description: '',
    };
    // isTabGroupNavHeadingVisible is intentionally NOT reset here.
    // This value is persisted separately and should survive a store reset.
  }
}
