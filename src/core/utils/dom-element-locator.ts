
/**
 * Descriptor for an anchor that represents a DOM element.
 */
export interface AnchorDescriptor {
    tag: string;          // e.g., "P", "BLOCKQUOTE"
    index: number;        // e.g., 2 (It is the 2nd <p> in the container)
    parentId?: string;    // ID of the nearest parent that HAS a hard ID (e.g., #section-configuration)
    textSnippet: string;  // First 32 chars of text content (normalized)
    textHash: number;     // A simple hash of the full text content
    elementId?: string;   // The element's own ID if present
}

/**
 * Generates a simple hash code for a string.
 */
function hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * Normalizes text content by removing excessive whitespace.
 */
function normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * Creates an AnchorDescriptor for a given DOM element.
 */
export function createDescriptor(el: HTMLElement): AnchorDescriptor {
    const tag = el.tagName;
    const textContent = el.textContent || "";
    const normalizedText = normalizeText(textContent);

    // Find nearest parent with an ID
    let parentId: string | undefined;
    let parent = el.parentElement;
    while (parent) {
        if (parent.id) {
            parentId = parent.id;
            break;
        }
        parent = parent.parentElement;
    }

    // Calculate index relative to the container
    const container = parent || document.body;
    const siblings = Array.from(container.querySelectorAll(tag));
    const index = siblings.indexOf(el);

    const descriptor: AnchorDescriptor = {
        tag,
        index: index !== -1 ? index : 0,
        textSnippet: normalizedText.substring(0, 32),
        textHash: hashCode(normalizedText),
        elementId: el.id
    };

    if (parentId) {
        descriptor.parentId = parentId;
    }

    return descriptor;
}

/**
 * Serializes a list of AnchorDescriptors into a URL-safe string.
 */
export function serialize(descriptors: AnchorDescriptor[]): string {
    // Check if we can use human-readable format that only uses IDs
    // AnchorDescriptor carries the element's OWN id optionally.
    const minified = descriptors.map(d => ({
        t: d.tag,
        i: d.index,
        p: d.parentId,
        s: d.textSnippet,
        h: d.textHash,
        id: d.elementId
    }));

    // Check if all have IDs, use human-readable format
    const allHaveIds = minified.every(m => !!m.id);
    if (allHaveIds) {
        return minified.map(m => m.id).join(',');
    }

    const json = JSON.stringify(minified);
    
    // Modern UTF-8 safe Base64 encoding
    try {
        const bytes = new TextEncoder().encode(json);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        return btoa(binString);
    } catch (e) {
        console.error("Failed to encode anchor:", e);
        return "";
    }
}

/**
 * Deserializes a URL-safe string back into a list of AnchorDescriptors.
 */
export function deserialize(encoded: string): AnchorDescriptor[] {
    if (!encoded) return [];

    // Heuristic: If it contains spaces, it's definitely a list of IDs (Base64 doesn't have spaces)
    if (encoded.includes(' ')) {
        return parseIds(encoded);
    }

    // Heuristic: Check for characters invalid in standard Base64 (btoa uses +/)
    // Common IDs use - or _ or . which are not in Base64
    const isBase64Candidate = /^[A-Za-z0-9+/]*={0,2}$/.test(encoded);
    if (!isBase64Candidate) {
        return parseIds(encoded);
    }

    try {
        // Modern UTF-8 safe Base64 decoding
        const binString = atob(encoded);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
        const json = new TextDecoder().decode(bytes);
        
        const minified = JSON.parse(json);
        
        // Robustness: Ensure result is an array
        if (!Array.isArray(minified)) {
            throw new Error("Decoded JSON is not an array");
        }

        return minified.map((m: any) => {
            // Robustness: Ensure item is an object
            if (typeof m !== 'object' || m === null) throw new Error("Item is not an object");
            
            return {
                tag: m.t,
                index: m.i,
                parentId: m.p,
                textSnippet: m.s,
                textHash: m.h,
                elementId: m.id
            };
        });
    } catch (e) {
        // This handles cases where an ID string happens to look like Base64 but does not match the expected schema
        return parseIds(encoded);
    }
}

/**
 * Parses a space-separated, plus-separated, or comma-separated list of IDs into a list of AnchorDescriptors.
 */
function parseIds(encoded: string): AnchorDescriptor[] {
    const parts = encoded.split(/[ +,]+/).filter(p => p.length > 0);
    return parts.map(id => ({
            tag: 'ANY',
            index: 0,
            textSnippet: '',
            textHash: 0,
            elementId: id
    }));
}

const SCORE_EXACT_HASH = 50;
const SCORE_SNIPPET_START = 30;
const SCORE_INDEX_MATCH = 10;
const SCORE_PERFECT = 60;
const SCORE_THRESHOLD = 30;

/**
 * Finds the best DOM element match(es) for a descriptor.
 * Returns an array of elements. For specific descriptors, usually contains 0 or 1 element.
 * For ID-only descriptors (tag='ANY'), may return multiple if duplicates exist.
 */
export function resolve(root: HTMLElement, descriptor: AnchorDescriptor): HTMLElement[] {
    // 0. Direct ID Shortcut
    if (descriptor.elementId) {
        // Always support duplicate IDs for consistency, even if technically invalid HTML.
        const all = document.querySelectorAll(`[id="${CSS.escape(descriptor.elementId)}"]`);
        if (all.length > 0) return Array.from(all) as HTMLElement[];
        
        // If not found by ID (and it's a manual ID-only request), stop search.
        if (descriptor.tag === 'ANY') return []; 
    }

    // 1. Determine Scope
    let scope: HTMLElement = root;
    
    // Optimization: If parentId exists, try to narrow scope immediately
    if (descriptor.parentId) {
        const foundParent = root.querySelector(`#${descriptor.parentId}`);
        if (foundParent instanceof HTMLElement) {
            scope = foundParent;
        } else {
            const globalParent = document.getElementById(descriptor.parentId);
            if (globalParent) {
                scope = globalParent;
            }
        }
    }

    // 2. Candidate Search & Scoring
    const candidates = scope.querySelectorAll(descriptor.tag);
    
    // Optimization: Structural Check First (Fastest)
    // If we trust the structure hasn't changed, the element at the specific index 
    // is effectively O(1) access if we assume `querySelectorAll` order is stable.
    if (candidates[descriptor.index]) {
        const candidate = candidates[descriptor.index] as HTMLElement;
        const text = normalizeText(candidate.textContent || "");
        
        // Perfect Match Check: If index + hash match, it's virtually guaranteed.
        // This avoids checking every other candidate.
        if (hashCode(text) === descriptor.textHash) {
            return [candidate];
        }
    }

    // Fallback: Full scan if structural match failed (element moved/deleted/inserted)
    let bestMatch: HTMLElement | null = null;
    let highestScore = 0;

    // Use loop with break ability for optimization
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i] as HTMLElement;
        let score = 0;
        const text = normalizeText(candidate.textContent || "");

        // Content Match
        if (hashCode(text) === descriptor.textHash) {
            score += SCORE_EXACT_HASH;
        } else if (text.startsWith(descriptor.textSnippet)) {
            score += SCORE_SNIPPET_START;
        }

        // Structural Match (Re-calculated index)
        if (i === descriptor.index) {
            score += SCORE_INDEX_MATCH;
        }
        
        // Early Exit: If we find a very high score (Hash + Index), we can stop.
        if (score >= SCORE_PERFECT) {
            return [candidate];
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = candidate;
        }
    }

    // Threshold check
    return highestScore > SCORE_THRESHOLD && bestMatch ? [bestMatch] : [];
}
