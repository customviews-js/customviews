import { writable } from 'svelte/store';

export const TOAST_CLASS = 'cv-toast-notification';

export interface ToastConfig {
  message: string;
  duration?: number;
  id?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastConfig[]>([]);

  let nextId = 0;

  function show(message: string, duration = 2500) {
    const id = nextId++;
    const toast: ToastConfig = { message, duration, id };
    
    update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }

  function dismiss(id: number) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    show,
    dismiss
  };
}

export const toast = createToastStore();

export function showToast(message: string, duration?: number) {
  toast.show(message, duration);
}
