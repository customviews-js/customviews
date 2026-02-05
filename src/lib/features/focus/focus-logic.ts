import { SvelteSet } from 'svelte/reactivity';

/**
 * Determines which siblings of the target path elements should be hidden.
 * 
 * @param targets The list of elements that are focused (and their ancestors up to root).
 * @param root The root element where focus mode applies (usually document.body or a main wrapper).
 * @param isExcluded Callback to determine if an element should be excluded from hiding (e.g. fixed position elements, overlays).
 */
export function determineHiddenElements(
    targets: HTMLElement[], 
    root: HTMLElement, 
    isExcluded: (el: HTMLElement) => boolean
): SvelteSet<HTMLElement> {
    const hiddenElements = new SvelteSet<HTMLElement>();
    
    // Performs a "reverse" traversal, hides elements that are not in the ancestry path 
    // of the focused elements. Siblings of the ancestry path are hidden.
    
    // 1. Identification of "keep" path
    // All targets and their ancestors up to root are kept.
    const keepSet = new Set<HTMLElement>();
    
    targets.forEach(target => {
        let current: HTMLElement | null = target;
        while (current && current !== root && current.parentElement) {
            keepSet.add(current);
            current = current.parentElement;
        }
        if (current === root) keepSet.add(root);
    });

    // 2. Traversal
    // For every element in the keep set (that is not root), we look at its siblings.
    // If a sibling is NOT in the keep set, we hide it.
    const targetsSet = new Set(targets);
    
    keepSet.forEach(el => {
        if (el === root) {
             // For root, we look at its children. 
             // Logic is slightly different: we hide children of root that are not in KeepSet.
             Array.from(root.children).forEach(child => {
                 if (child instanceof HTMLElement && !keepSet.has(child)) {
                     if (!isExcluded(child)) {
                         hiddenElements.add(child);
                     }
                 }
             });
             return;
        }
        
        const parent = el.parentElement;
        // Parent Dominance: If parent is a target, we want to show all its content, so don't hide siblings of el.
        if (parent && targetsSet.has(parent)) {
            return;
        }

        if (parent && keepSet.has(parent)) {
            Array.from(parent.children).forEach(sibling => {
                if (sibling instanceof HTMLElement && !keepSet.has(sibling)) {
                    if (!isExcluded(sibling)) {
                        hiddenElements.add(sibling);
                    }
                }
            });
        }
    });

    return hiddenElements;
}

export interface ExclusionOptions {
    hiddenElements: Set<HTMLElement>;
    excludedTags: Set<string>;
    excludedIds: Set<string>;
}

/**
 * Checks if an element should be excluded from hiding logic.
 */
export function isElementExcluded(el: HTMLElement, options: ExclusionOptions): boolean {
    if (options.hiddenElements.has(el)) return true;
    if (options.excludedTags.has(el.tagName.toUpperCase())) return true;
    if (el.id && options.excludedIds.has(el.id)) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;

    // Exclude Toast/Banner/Overlay/SettingsIcon/UIRoot
    if (
      el.closest('.toast-container') ||
      el.id === 'cv-exit-focus-banner' ||
      el.classList.contains('cv-settings-icon') ||
      el.classList.contains('cv-widget-root')
    )
      return true;



    return false;
}

export interface DividerGroup {
    insertBefore: HTMLElement | null; // Null means append at end (though typically not used for dividers)
    startNode: HTMLElement;
    count: number;
}

/**
 * Scans a list of children and groups consecutive hidden elements.
 * Returns a list of groups where dividers should be inserted.
 */
export function calculateDividerGroups(
    children: HTMLElement[], 
    isHidden: (el: HTMLElement) => boolean
): DividerGroup[] {
    const groups: DividerGroup[] = [];
    let hiddenCount = 0;
    let hiddenGroupStart: HTMLElement | null = null;

    children.forEach((child) => {
        if (isHidden(child)) {
            if (hiddenCount === 0) hiddenGroupStart = child;
            hiddenCount++;
        } else {
            if (hiddenCount > 0 && hiddenGroupStart) {
                groups.push({
                    insertBefore: child,
                    startNode: hiddenGroupStart,
                    count: hiddenCount
                });
                hiddenCount = 0;
                hiddenGroupStart = null;
            }
        }
    });

    // Handle trailing hidden group
    if (hiddenCount > 0 && hiddenGroupStart) {
         // Consistent with service logic: insert divider before the start of the hidden group.
         
         groups.push({
             insertBefore: hiddenGroupStart,
             startNode: hiddenGroupStart,
             count: hiddenCount
         });
    }

    return groups;
}
