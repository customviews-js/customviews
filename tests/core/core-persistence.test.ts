import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { CustomViewsCore } from '../../src/core/core';
import { AssetsManager } from '../../src/core/assets-manager';
import { URLStateManager } from '../../src/core/url-state-manager';
import type { Config, State } from '../../src/types/types';

// Mock URLStateManager
vi.mock('../../src/core/url-state-manager', async () => {
    return {
        URLStateManager: {
            parseURL: vi.fn(),
            updateURL: vi.fn(),
            clearURL: vi.fn(),
            generateShareableURL: vi.fn(),
        }
    };
});

describe('CustomViewsCore Persistence', () => {
    let core: CustomViewsCore;
    let mockAssetsManager: AssetsManager;
    let mockConfig: Config;
    let dom: JSDOM;

    beforeEach(() => {
        // Setup JSDOM
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: "http://localhost/"
        });
        global.window = dom.window as any;
        global.document = dom.window.document as any;

        // Mock localStorage
        const storage: Record<string, string> = {};
        global.localStorage = {
            getItem: vi.fn((key) => storage[key] || null),
            setItem: vi.fn((key, value) => { storage[key] = value }),
            removeItem: vi.fn((key) => { delete storage[key] }),
            clear: vi.fn(() => { for (const key in storage) delete storage[key] }),
            key: vi.fn((index) => Object.keys(storage)[index] || null),
            length: 0
        } as any;

        // Mock MutationObserver
        global.MutationObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            disconnect: vi.fn(),
            takeRecords: vi.fn(),
        })) as any;

        vi.clearAllMocks();

        mockAssetsManager = {} as AssetsManager;
        mockConfig = {
            toggles: [{ id: 't1' }, { id: 't2' }],
            defaultState: { shownToggles: ['t1'] }
        };

        const options = {
            assetsManager: mockAssetsManager,
            config: mockConfig,
            rootEl: document.createElement('div'),
            showUrl: false
        };

        core = new CustomViewsCore(options);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should NOT persist state to localStorage when persist option is false', () => {
        const newState: State = { shownToggles: ['t2'] };
        core.applyState(newState, { persist: false });

        const storedState = localStorage.getItem('customviews-state');
        expect(storedState).toBeNull();
    });

    it('should persist state to localStorage when persist option is true (default)', () => {
        const newState: State = { shownToggles: ['t2'] };
        core.applyState(newState);

        const storedState = localStorage.getItem('customviews-state');
        expect(storedState).not.toBeNull();
        expect(JSON.parse(storedState!)).toEqual(newState);
    });

    it('should apply URL state temporarily and not persist it', async () => {
        // Mock URL having a state
        const urlState = { shownToggles: ['t2'] };
        vi.spyOn(URLStateManager, 'parseURL').mockReturnValue(urlState);

        // Re-initialize core to trigger loadAndCallApplyState
        const options = {
            assetsManager: mockAssetsManager,
            config: mockConfig,
            rootEl: document.createElement('div'),
            showUrl: false
        };
        core = new CustomViewsCore(options);

        // We need to wait for init or manually call init if we tested init()
        // But the constructor calls common setup? No, init calls loadAndCallApplyState.
        await core.init();

        // Verify URLStateManager.parseURL was called
        expect(URLStateManager.parseURL).toHaveBeenCalled();

        // Verify state is applied (we can't easily check internal state, maybe check active toggles)
        const activeToggles = core.getCurrentShownToggles();
        expect(activeToggles).toEqual(['t2']);

        // Verify localStorage is EMPTY
        const storedState = localStorage.getItem('customviews-state');
        expect(storedState).toBeNull();
    });
});
