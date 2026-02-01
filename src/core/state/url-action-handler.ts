import type { SelectionMode } from '../stores/share-store.svelte';

export type UrlActionType = 'OPEN_MODAL' | 'START_SHARE';

/**
 * STRATEGY INTERFACE
 * Each rule is a "Strategy" that knows how to identify itself in a URL
 * and how to remove itself once the action is acknowledged.
 */
export interface UrlAction {
    type: UrlActionType;
    mode?: SelectionMode;
    triggerKey: string; // The param name or hash string that triggered this
    triggerSource: 'query' | 'hash';
}

/**
 * Strategy Interface for URL Actions
 * Each rule is a "Strategy" that knows how to identify itself in a URL
 * and how to remove itself once the action is acknowledged.
 */
interface UrlRule {
    parseForMatch(location: Pick<Location, 'search' | 'hash'>): UrlAction | null;
    getCleanedUrl(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string | null;
}

/**
 * Handles basic modal triggers: ?cv-open or #cv-open
 */
class OpenModalRule implements UrlRule {
    parseForMatch(location: Pick<Location, 'search' | 'hash'>): UrlAction | null {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('cv-open')) {
            return { type: 'OPEN_MODAL', triggerKey: 'cv-open', triggerSource: 'query' };
        }
        if (location.hash === '#cv-open') {
             return { type: 'OPEN_MODAL', triggerKey: '#cv-open', triggerSource: 'hash' };
        }
        return null;
    }

    getCleanedUrl(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string | null {
        if (action.type !== 'OPEN_MODAL') return null;
        return cleanHelper(location, action);
    }
}

/**
 * Handles basic share triggers: ?cv-share or #cv-share
 */
class BasicShareRule implements UrlRule {
    parseForMatch(location: Pick<Location, 'search' | 'hash'>): UrlAction | null {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('cv-share')) {
            return { type: 'START_SHARE', triggerKey: 'cv-share', triggerSource: 'query' };
        }
        if (location.hash === '#cv-share') {
             return { type: 'START_SHARE', triggerKey: '#cv-share', triggerSource: 'hash' };
        }
        return null;
    }

    getCleanedUrl(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string | null {
         if (action.type !== 'START_SHARE' || action.mode) return null; // Only basic share
         return cleanHelper(location, action);
    }
}

/**
 * Handles specific share mode triggers: ?cv-share-show, ?cv-share-hide, or #cv-share-highlight, etc.
 */
class SpecificShareModeRule implements UrlRule {
     private static SHARE_MODES: Record<string, SelectionMode> = {
        'show': 'show',
        'focus': 'show', // Legacy
        'hide': 'hide',
        'highlight': 'highlight'
    };

    parseForMatch(location: Pick<Location, 'search' | 'hash'>): UrlAction | null {
        const urlParams = new URLSearchParams(location.search);
        
        // Check Query
        for (const [suffix, mode] of Object.entries(SpecificShareModeRule.SHARE_MODES)) {
            const param = `cv-share-${suffix}`;
            if (urlParams.has(param)) {
                return { type: 'START_SHARE', mode, triggerKey: param, triggerSource: 'query' };
            }
        }

        // Check Hash
        for (const [suffix, mode] of Object.entries(SpecificShareModeRule.SHARE_MODES)) {
            const hashKey = `#cv-share-${suffix}`;
            if (location.hash === hashKey) {
                 return { type: 'START_SHARE', mode, triggerKey: hashKey, triggerSource: 'hash' };
            }
        }
        return null;
    }

    getCleanedUrl(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string | null {
        if (action.type !== 'START_SHARE' || !action.mode) return null;
        return cleanHelper(location, action);
    }
}

// Helper for common cleanup logic
function cleanHelper(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string {
    const newUrl = new URL(location.href);

    if (action.triggerSource === 'query') {
        newUrl.searchParams.delete(action.triggerKey);
    } else if (action.triggerSource === 'hash') {
        if (newUrl.hash === action.triggerKey) {
            newUrl.hash = '';
        }
    }
    return newUrl.toString();
}


export class UrlActionHandler {
    // The order of array determines priority (First match wins)
    private static rules: UrlRule[] = [
        new OpenModalRule(),
        new BasicShareRule(),
        new SpecificShareModeRule()
    ];

    /**
     * Pure function: Parses the URL and returns the detected action if any.
     * Iterates through the registry of rules.
     */
    static detectAction(location: Pick<Location, 'search' | 'hash'>): UrlAction | null {
        for (const rule of this.rules) {
            const action = rule.parseForMatch(location);
            if (action) return action;
        }
        return null; // No match
    }

    /**
     * Pure function: Returns the clean URL string after removing the action trigger.
     * Delegates cleanup to the appropriate rule.
     */
    static getCleanedUrl(location: Pick<Location, 'href' | 'search'>, action: UrlAction): string {
        for (const rule of this.rules) {
            const cleanUrl = rule.getCleanedUrl(location, action);
            if (cleanUrl) return cleanUrl;
        }
        // Fallback (shouldn't happen if rules are consistent)
        return cleanHelper(location, action);
    }
}
