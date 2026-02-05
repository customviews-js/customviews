// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastStore } from '$lib/stores/toast-store.svelte';

describe('ToastStore', () => {
  let store: ToastStore;

  beforeEach(() => {
    store = new ToastStore();
    vi.useFakeTimers();
  });

  it('should start empty', () => {
    expect(store.items.length).toBe(0);
  });

  it('should add a toast with correct message and id', () => {
    store.show('Hello');
    expect(store.items.length).toBe(1);
    expect(store.items[0]!.message).toBe('Hello');
    expect(store.items[0]!.id).toBeDefined();
  });

  it('should dismiss toast after duration', () => {
    store.show('Ephemeral', 1000);
    expect(store.items.length).toBe(1);

    vi.runAllTimers();
    expect(store.items.length).toBe(0);
  });

  it('should not dismiss toast if duration is 0', () => {
    store.show('Permanent', 0);
    vi.runAllTimers();
    expect(store.items.length).toBe(1);
  });

  it('should allow manual dismissal', () => {
    store.show('Dismiss me');
    const id = store.items[0]!.id!;
    store.dismiss(id);
    expect(store.items.length).toBe(0);
  });

  it('should handle multiple toasts queue', () => {
    store.show('Toast 1');
    store.show('Toast 2');
    expect(store.items.length).toBe(2);
    expect(store.items[0]!.message).toBe('Toast 1');
    expect(store.items[1]!.message).toBe('Toast 2');
  });
});
