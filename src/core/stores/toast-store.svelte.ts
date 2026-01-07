export const TOAST_CLASS = 'cv-toast-notification';

export interface ToastConfig {
  message: string;
  duration?: number;
  id?: number;
}

export class ToastStore {
    items = $state<ToastConfig[]>([]);
    nextId = 0;

    show(message: string, duration = 2500) {
        const id = this.nextId++;
        const toast: ToastConfig = { message, duration, id };
        this.items.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }
    }

    dismiss(id: number) {
        this.items = this.items.filter(t => t.id !== id);
    }
}

export const toast = new ToastStore();

export function showToast(message: string, duration?: number) {
  toast.show(message, duration);
}
