export class FocusStore {
  isActive = $state(false);

  /**
   * Sets the active state of the focus mode.
   */
  setIsActive(isActive: boolean) {
    this.isActive = isActive;
  }

  /**
   * Signals intent to exit focus mode.
   * Logic is handled by the service observing this state.
   */
  exit() {
    this.isActive = false;
  }
}

export const focusStore = new FocusStore();
