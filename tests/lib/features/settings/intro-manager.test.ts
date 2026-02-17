/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Polyfill Svelte Runes BEFORE import
// @ts-expect-error - Polyfill for testing
globalThis.$state = (initial) => initial;

import { IntroManager, type IntroPersistence } from '../../../../src/lib/features/settings/intro-manager.svelte';

describe('IntroManager', () => {
  let introManager: IntroManager;
  let persistence: IntroPersistence;
  let calloutOptions: any;

  beforeEach(() => {
    persistence = {
      isIntroSeen: vi.fn().mockReturnValue(false),
      markIntroSeen: vi.fn(),
    };

    calloutOptions = {
      show: true,
    };

    introManager = new IntroManager(persistence, calloutOptions);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should not show callout if not initialized with page elements', () => {
    introManager.init(false, true); // hasPageElements = false
    vi.advanceTimersByTime(2000);
    expect(introManager.showCallout).toBe(false);
  });

  it('should not show callout if settings disabled', () => {
    introManager.init(true, false); // settingsEnabled = false
    vi.advanceTimersByTime(2000);
    expect(introManager.showCallout).toBe(false);
  });

  it('should show callout after delay if requirements met', () => {
    introManager.init(true, true);

    expect(introManager.showCallout).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(true);
    expect(introManager.showPulse).toBe(true);
  });

  it('should not show if already persisted as shown', () => {
    (persistence.isIntroSeen as ReturnType<typeof vi.fn>).mockReturnValue(true);
    introManager = new IntroManager(persistence, calloutOptions);
    introManager.init(true, true);

    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(false);
  });

  it('should persist and hide on dismiss', () => {
    introManager.init(true, true);
    vi.advanceTimersByTime(1100);
    expect(introManager.showCallout).toBe(true);

    introManager.dismiss();

    expect(introManager.showCallout).toBe(false);
    expect(persistence.markIntroSeen).toHaveBeenCalled();
  });
});
