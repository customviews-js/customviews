// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UrlActionRouter, type RouterOptions } from '../../../src/core/services/url-action-router.svelte';
import { UrlActionHandler } from '../../../src/core/state/url-action-handler';

describe('UrlActionRouter', () => {
    let router: UrlActionRouter;
    let options: RouterOptions;

    beforeEach(() => {
        options = {
            onOpenModal: vi.fn(),
            onStartShare: vi.fn(),
            checkSettingsEnabled: vi.fn().mockReturnValue(true)
        };
        router = new UrlActionRouter(options);
        
        // Mock window location and history
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
                hash: '',
                href: 'http://localhost/',
                origin: 'http://localhost'
            },
            writable: true
        });
        
        window.history.replaceState = vi.fn();
    });

    afterEach(() => {
        router.destroy();
        vi.restoreAllMocks();
    });

    it('should initialize and listen to events', () => {
        const addListenerSpy = vi.spyOn(window, 'addEventListener');
        router.init();
        expect(addListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
        expect(addListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });

    it('should destroy and remove events', () => {
        const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
        router.init();
        router.destroy();
        expect(removeListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
        expect(removeListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });

    it('should trigger openModal when URL action is detected and settings are enabled', () => {
        vi.spyOn(UrlActionHandler, 'detectAction').mockReturnValue({
            type: 'OPEN_MODAL',
            triggerKey: 'cv-open',
            triggerSource: 'query'
        });
        vi.spyOn(UrlActionHandler, 'getCleanedUrl').mockReturnValue('http://localhost/');

        router.init();

        expect(options.onOpenModal).toHaveBeenCalled();
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should NOT trigger openModal if settings are disabled', () => {
        options.checkSettingsEnabled = vi.fn().mockReturnValue(false);
        vi.spyOn(UrlActionHandler, 'detectAction').mockReturnValue({
            type: 'OPEN_MODAL',
            triggerKey: 'cv-open',
            triggerSource: 'query'
        });

        router.init();

        expect(options.onOpenModal).not.toHaveBeenCalled();
        // Still cleans URL though
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should trigger onStartShare when URL action is detected', () => {
        vi.spyOn(UrlActionHandler, 'detectAction').mockReturnValue({
            type: 'START_SHARE',
            mode: 'show',
            triggerKey: 'cv-share-show',
            triggerSource: 'query'
        });

        router.init();

        expect(options.onStartShare).toHaveBeenCalledWith('show');
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should trigger onStartShare when URL action is detected EVEN IF settings are disabled', () => {
        options.checkSettingsEnabled = vi.fn().mockReturnValue(false);
        vi.spyOn(UrlActionHandler, 'detectAction').mockReturnValue({
            type: 'START_SHARE',
            mode: 'show',
            triggerKey: 'cv-share-show',
            triggerSource: 'query'
        });

        router.init();

        expect(options.onStartShare).toHaveBeenCalledWith('show');
        expect(window.history.replaceState).toHaveBeenCalled();
    });
});
