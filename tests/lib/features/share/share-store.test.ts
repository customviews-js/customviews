// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShareStore } from '$features/share/stores/share-store.svelte';

import * as DomElementLocator from '$lib/utils/dom-element-locator';

describe('ShareStore', () => {
  let store: ShareStore;

  beforeEach(() => {
    store = new ShareStore();
    document.body.className = '';
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should initialize inactive', () => {
    expect(store.isActive).toBe(false);
    expect(store.selectionMode).toBe('show');
    expect(store.selectedElements.size).toBe(0);
  });

  it('should activate and deactivate', () => {
    store.toggleActive(true);
    expect(store.isActive).toBe(true);
    expect(document.body.classList.contains('cv-share-active-show')).toBe(true);

    store.toggleActive(false);
    expect(store.isActive).toBe(false);
    expect(document.body.classList.contains('cv-share-active-show')).toBe(false);
  });

  it('should change selection mode', () => {
    store.toggleActive(true);
    store.setSelectionMode('hide');
    expect(store.selectionMode).toBe('hide');
    expect(document.body.classList.contains('cv-share-active-hide')).toBe(true);
    expect(document.body.classList.contains('cv-share-active-show')).toBe(false);
  });

  it('should select elements (delegate to logic)', () => {
    const el = document.createElement('div');
    store.toggleElementSelection(el);

    expect(store.selectedElements.has(el)).toBe(true);
    expect(el.classList.contains('cv-share-selected')).toBe(true);
  });

  it('should toggle selection off', () => {
    const el = document.createElement('div');
    store.toggleElementSelection(el);
    store.toggleElementSelection(el);

    expect(store.selectedElements.has(el)).toBe(false);
    expect(el.classList.contains('cv-share-selected')).toBe(false);
  });

  it('should generate link', async () => {
    const el = document.createElement('div');
    el.id = 'test-id';
    store.toggleElementSelection(el);

    // Mock createDescriptor to avoid complex DOM resolution logic issues in JSDOM
    vi.spyOn(DomElementLocator, 'createDescriptor').mockReturnValue({
      type: 'id',
      val: 'test-id',
    } as unknown as DomElementLocator.AnchorDescriptor);
    vi.spyOn(DomElementLocator, 'serialize').mockReturnValue('serialized-id');

    await store.generateLink();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('cv-show=serialized-id'),
    );
  });
});
