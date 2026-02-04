import { UrlActionHandler } from '../state/url-action-handler';
import type { SelectionMode } from '$features/share/stores/share-store.svelte';

export interface RouterOptions {
    onOpenModal: () => void;
    onStartShare: (mode?: SelectionMode) => void;
    checkSettingsEnabled: () => boolean;
}

/**
 * UrlActionRouter
 * 
 * Responsibilities:
 * - Listens for URL changes (popstate, hashchange) and initial page loads.
 * - Detects "action triggers" in the URL (e.g., `?cv-open`, `?cv-share-show`) via `UrlActionHandler`.
 * - Invokes the appropriate callbacks (open modal, start share) based on the detected action.
 * - Cleans the URL after processing the action to prevent re-triggering on reload.
 * 
 * This service acts as the bridge between browser URL state and the CustomViews UI state.
 */
export class UrlActionRouter {
    private options: RouterOptions;
    private boundCheck: () => void;

    constructor(options: RouterOptions) {
        this.options = options;
        this.boundCheck = this.checkURLForAction.bind(this);
    }

    public init() {
        this.checkURLForAction();
        window.addEventListener('popstate', this.boundCheck);
        window.addEventListener('hashchange', this.boundCheck);
    }

    public destroy() {
        window.removeEventListener('popstate', this.boundCheck);
        window.removeEventListener('hashchange', this.boundCheck);
    }

    private checkURLForAction() {
        const action = UrlActionHandler.detectAction(window.location);
        if (action) {
            if (action.type === 'OPEN_MODAL') {
                if (this.options.checkSettingsEnabled()) {
                    this.options.onOpenModal();
                }
            } else if (action.type === 'START_SHARE') {
                this.options.onStartShare(action.mode);
            }

            const cleanedUrl = UrlActionHandler.getCleanedUrl(window.location, action);
            window.history.replaceState({}, '', cleanedUrl);
        }
    }
}
