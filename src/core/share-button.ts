import { ShareManager } from './share-manager';
import { SHARE_BUTTON_ID, SHARE_BUTTON_STYLES } from '../styles/share-button-styles';
import { getShareIcon } from '../utils/icons';

export class ShareButton {
    private shareManager: ShareManager;
    private button: HTMLElement | null = null;
    private boundHandleClick: () => void;

    constructor(shareManager: ShareManager) {
        this.shareManager = shareManager;
        this.boundHandleClick = () => this.shareManager.toggleShareMode();
    }

    public init(): void {
        if (this.button) return;

        this.injectStyles();
        this.button = this.createButton();
        document.body.appendChild(this.button);

        // Subscribe to share manager state changes
        this.shareManager.addStateChangeListener((isActive) => {
            this.setShareModeActive(isActive);
        });
    }

    public destroy(): void {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
    }

    private createButton(): HTMLElement {
        const btn = document.createElement('button');
        btn.id = SHARE_BUTTON_ID;
        btn.setAttribute('aria-label', 'Share specific sections');
        btn.title = 'Select sections to share';

        // Using the link icon from utils, ensuring it's white via CSS currentColor
        btn.innerHTML = getShareIcon();

        btn.addEventListener('click', this.boundHandleClick);
        return btn;
    }

    private injectStyles(): void {
        if (!document.getElementById('cv-share-button-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-share-button-styles';
            style.textContent = SHARE_BUTTON_STYLES;
            document.head.appendChild(style);
        }
    }

    private setShareModeActive(isActive: boolean): void {
        if (!this.button) return;

        if (isActive) {
            this.button.classList.add('cv-hidden');
        } else {
            this.button.classList.remove('cv-hidden');
        }
    }
}
