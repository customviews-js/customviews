import type { PersistenceManager } from '../state/persistence';
import type { UIManagerOptions } from '../ui-manager';

const STORAGE_KEY_INTRO_SHOWN = 'cv-intro-shown';

/**
 * IntroManager
 * 
 * Responsibilities:
 * - Manages the visibility state of the introductory callout component.
 * - Handles the logic for when to show the callout (delay, checks if already shown).
 * - Manages the "pulse" effect state on the settings icon.
 * - Persists the "shown" state to localStorage to prevent showing it repeatedly.
 */
export class IntroManager {
    // UI State
    showCallout = $state(false);
    showPulse = $state(false);

    private getPersistence: () => PersistenceManager;
    private getOptions: () => UIManagerOptions['callout'];
    private hasChecked = false;

    constructor(persistence: PersistenceManager | (() => PersistenceManager), options: UIManagerOptions['callout'] | (() => UIManagerOptions['callout'])) {
        this.getPersistence = typeof persistence === 'function' ? (persistence as () => PersistenceManager) : () => persistence;
        this.getOptions = typeof options === 'function' ? (options as () => UIManagerOptions['callout']) : () => options;
    }

    /**
     * Initializes the manager. Should be called when the component is ready
     * and we know there are elements on the page.
     */
    public init(hasPageElements: boolean, settingsEnabled: boolean) {
        const options = this.getOptions();
        if (settingsEnabled && !this.hasChecked && options?.show) {
             if (hasPageElements) {
                 this.hasChecked = true;
                 this.checkAndShow();
             }
        }
    }

    private checkAndShow() {
        if (!this.getPersistence().getItem(STORAGE_KEY_INTRO_SHOWN)) {
            setTimeout(() => {
                this.showCallout = true;
                this.showPulse = true;
            }, 1000);
        }
    }

    public dismiss() {
        this.showCallout = false;
        this.showPulse = false;
        this.getPersistence().setItem(STORAGE_KEY_INTRO_SHOWN, 'true');
    }
}
