import { TOAST_STYLES, TOAST_STYLE_ID, TOAST_CLASS } from '../../styles/toast-styles';

/**
 * Manages toast notifications for the application.
 */
export class ToastManager {
    private static isStyleInjected = false;
    private static toastEl: HTMLElement | null = null;
    private static navTimeout: any = null;
    private static fadeTimeout: any = null;

    public static show(message: string, duration: number = 2500): void {
        this.injectStyles();

        // specific reuse logic
        if (!this.toastEl) {
            this.toastEl = document.createElement('div');
            this.toastEl.className = TOAST_CLASS;
            document.body.appendChild(this.toastEl);
        }

        // Reset state
        this.toastEl.textContent = message;
        this.toastEl.style.opacity = '0';
        this.toastEl.style.display = 'block';

        // Clear any pending dismissal
        if (this.navTimeout) clearTimeout(this.navTimeout);
        if (this.fadeTimeout) clearTimeout(this.fadeTimeout);

        // Trigger reflow & fade in
        requestAnimationFrame(() => {
            if (this.toastEl) this.toastEl.style.opacity = '1';
        });

        // Schedule fade out
        this.navTimeout = setTimeout(() => {
            if (this.toastEl) this.toastEl.style.opacity = '0';

            this.fadeTimeout = setTimeout(() => {
                if (this.toastEl) this.toastEl.style.display = 'none';
            }, 300);
        }, duration);
    }

    private static injectStyles(): void {
        if (this.isStyleInjected) return;
        if (document.getElementById(TOAST_STYLE_ID)) {
            this.isStyleInjected = true;
            return;
        }

        const style = document.createElement('style');
        style.id = TOAST_STYLE_ID;
        style.innerHTML = TOAST_STYLES;
        document.head.appendChild(style);
        this.isStyleInjected = true;
    }
}
