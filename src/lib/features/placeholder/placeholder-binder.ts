/**
 * DOM Scanner for Variable Interpolation
 *
 * Scans the DOM for [[ variable_name ]] patterns and replaces them with
 * reactive spans that update when the variable store changes.
 */

// Regex to find [[ variable : fallback ]]
// Group 1: escape character (backslashes)
// Group 2: variable name (alphanumeric, underscores, hyphens)
// Group 3 (optional): fallback value
export const VAR_REGEX = /(\\)?\[\[\s*([a-zA-Z0-9_-]+)(?:\s*:\s*(.*?))?\s*\]\]/g;
// Non-global version for stateless testing
const VAR_TESTER = /(\\)?\[\[\s*([a-zA-Z0-9_-]+)(?:\s*:\s*(.*?))?\s*\]\]/;

import { placeholderRegistryStore } from '$features/placeholder/stores/placeholder-registry-store.svelte';
import { getAppStore } from '$lib/stores/app-context';

export class PlaceholderBinder {
  /**
   * Scans the root element for text nodes containing variable placeholders.
   * Also scans for elements with .cv-bind or [data-cv-bind] to setup attribute bindings.
   */
  static scanAndHydrate(root: HTMLElement) {
    this.scanTextNodes(root);
    this.scanAttributeBindings(root);
  }

  /**
   * Updates attribute bindings for all elements participating in placeholder binding.
   * Specifically updates attributes on elements with [data-cv-attr-templates].
   * Text content is updated separately via <cv-placeholder> component reactivity.
   */
  static updateAll(values: Record<string, string>) {
    this.updateAttributeBindings(values);
  }

  /**
   * Sets up a MutationObserver to detect content added dynamically to the page.
   * Returns the observer instance so the caller can manage its lifecycle.
   */
  static observe(root: HTMLElement): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.addedNodes.forEach((node) => this.handleMutation(node));
      }
    });

    observer.observe(root, { childList: true, subtree: true });
    return observer;
  }

  /**
   * Processes a newly added DOM node to check for and hydrate placeholders.
   */
  private static handleMutation(node: Node) {
    // Skip our own custom elements to avoid unnecessary scanning
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'CV-PLACEHOLDER' || el.tagName === 'CV-PLACEHOLDER-INPUT') {
        return;
      }
    }

    // Case 1: A new HTML element was added (e.g. via innerHTML or appendChild).
    // Recursively scan inside for any new placeholders.
    if (node.nodeType === Node.ELEMENT_NODE) {
      PlaceholderBinder.scanAndHydrate(node as HTMLElement);
    }
    // Case 2: A raw text node was added directly.
    // Check looks like a variable `[[...]]` to avoid unnecessary scans of plain text.
    else if (
      node.nodeType === Node.TEXT_NODE &&
      node.parentElement &&
      node.nodeValue?.includes('[[') &&
      node.nodeValue?.includes(']]')
    ) {
      // Re-scan parent to properly wrap text node in reactive span.
      PlaceholderBinder.scanAndHydrate(node.parentElement);
    }
  }

  // =========================================================================
  // Scanning Logic
  // =========================================================================

  private static scanTextNodes(root: HTMLElement) {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip script/style tags
        if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip existing placeholders to prevent observer loops
        if (node.parentElement && node.parentElement.tagName === 'CV-PLACEHOLDER') {
          return NodeFilter.FILTER_REJECT;
        }
        return VAR_TESTER.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    // Process nodes
    textNodes.forEach((node) => {
      PlaceholderBinder.processTextNode(node);
    });
  }

  private static scanAttributeBindings(root: HTMLElement) {
    // Attribute Scanning (Opt-in)
    const candidates = root.querySelectorAll('.cv-bind, [data-cv-bind]');
    candidates.forEach((el) => {
      if (el instanceof HTMLElement) {
        PlaceholderBinder.processElementAttributes(el);
      }
    });
  }

  private static processTextNode(textNode: Text) {
    const text = textNode.nodeValue || '';
    let match;
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let hasMatch = false;

    // Reset regex state
    VAR_REGEX.lastIndex = 0;

    while ((match = VAR_REGEX.exec(text)) !== null) {
      hasMatch = true;
      const [fullMatch, escape, name, fallback] = match;
      const index = match.index;

      if (!name) continue;

      // Append text before match
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      if (escape) {
        // If escaped, append the text without the backslash
        // fullMatch matches '\[[...]]', slice(1) gives '[[...]]'
        fragment.appendChild(document.createTextNode(fullMatch.slice(1)));
      } else {
        // Create Placeholder Custom Element
        const el = document.createElement('cv-placeholder');
        el.setAttribute('name', name);
        if (fallback) el.setAttribute('fallback', fallback);
        fragment.appendChild(el);

        // Register detection
        getAppStore().registry.registerPlaceholder(name);
      }

      lastIndex = VAR_REGEX.lastIndex;
    }

    if (hasMatch) {
      // Append remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.replaceWith(fragment);
    }
  }

  private static processElementAttributes(el: HTMLElement) {
    if (el.dataset.cvAttrTemplates) return; // Already processed

    const templates: Record<string, string> = {};
    let hasBindings = false;

    // Iterate all attributes
    for (const attr of Array.from(el.attributes)) {
      // Skip system attributes and class (to avoid conflicts with dynamic class manipulation)
      if (
        attr.name === 'data-cv-bind' ||
        attr.name === 'data-cv-attr-templates' ||
        attr.name === 'class'
      ) {
        continue;
      }

      if (VAR_TESTER.test(attr.value)) {
        templates[attr.name] = attr.value;
        hasBindings = true;
      }
    }

    if (hasBindings) {
      el.dataset.cvAttrTemplates = JSON.stringify(templates);

      const matcher = new RegExp(VAR_REGEX.source, 'g');
      Object.values(templates).forEach((tmpl) => {
        matcher.lastIndex = 0; // Reset regex state for each template
        let match;
        while ((match = matcher.exec(tmpl)) !== null) {
          if (!match[1] && match[2]) {
            getAppStore().registry.registerPlaceholder(match[2]);
          }
        }
      });
    }
  }

  // =========================================================================
  // Update Logic
  // =========================================================================

  private static updateAttributeBindings(values: Record<string, string>) {
    const attrElements = document.querySelectorAll('[data-cv-attr-templates]');
    attrElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        try {
          const templates = JSON.parse(el.dataset.cvAttrTemplates || '{}');
          Object.entries(templates).forEach(([attrName, template]) => {
            const newValue = PlaceholderBinder.interpolateString(
              template as string,
              values,
              attrName,
            );
            el.setAttribute(attrName, newValue);
          });
        } catch (e) {
          console.warn('Failed to parse cv-attr-templates', e);
        }
      }
    });
  }

  /**
   * Checks if a value is a full URL with protocol
   * (e.g., http://, https://, ftp://, data:, mailto:)
   */
  private static isFullUrl(value: string): boolean {
    // Match protocol://... OR protocol: (for mailto:, data:, tel:, etc.)
    // Protocol must start with letter per RFC 3986
    return /^[a-z][a-z0-9+.-]*:/i.test(value);
  }

  /**
   * Checks if a value is a relative URL path (e.g., /, ./, ../)
   */
  private static isRelativeUrl(value: string): boolean {
    return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
  }

  /**
   * Resolves value for a placeholder by checking and using sources in order of:
   * 1. user-set value, 2. registry default value, 3. inline fallback value
   *
   * Empty strings are treated as "not set" and will fall through to the next priority level.
   *
   * @param name - The placeholder name to resolve
   * @param fallback - Optional inline fallback value from the usage syntax (e.g., `[[ name : fallback ]]`)
   * @param values - Record of user-set placeholder values
   * @returns The resolved value, or undefined if no value is available from any source
   */
  private static resolveValue(
    name: string,
    fallback: string | undefined,
    values: Record<string, string>,
  ): string | undefined {
    const userVal = values[name];

    // Look up registry definition
    const def = placeholderRegistryStore.get(name);
    const registryDefault = def?.defaultValue;

    if (userVal !== undefined && userVal !== '') {
      return userVal;
    } else if (fallback) {
      return fallback;
    } else if (registryDefault !== undefined && registryDefault !== '') {
      return registryDefault;
    }
    return undefined;
  }

  /**
   * Interpolates placeholder patterns in a template string with their resolved values.
   *
   * Replaces all `[[ name ]]` or `[[ name : fallback ]]` patterns with their resolved values.
   * Escaped patterns (e.g., `\[[ name ]]`) are preserved as literal text.
   *
   * For `href` and `src` attributes, applies context-aware URL encoding:
   * - Full URLs (http://, https://, mailto:, data:, etc.) are preserved as-is
   * - Relative URLs (/, ./, ../) are preserved as-is
   * - URL components (query parameters, path segments) are encoded with encodeURIComponent
   *
   * @param template - The template string containing placeholder patterns
   * @param values - Record of user-set placeholder values
   * @param attrName - Optional attribute name (enables URL encoding for 'href' and 'src')
   * @returns The interpolated string with all placeholders replaced
   */
  private static interpolateString(
    template: string,
    values: Record<string, string>,
    attrName?: string,
  ): string {
    return template.replace(VAR_REGEX, (_full, escape, name, fallback) => {
      if (escape) return `[[${name}]]`;

      let val = PlaceholderBinder.resolveValue(name, fallback, values);
      if (val === undefined) return `[[${name}]]`;

      // Context-aware encoding for URL attributes
      if (attrName && (attrName === 'href' || attrName === 'src')) {
        // Don't encode full URLs or relative URLs - only encode URL components
        if (!PlaceholderBinder.isFullUrl(val) && !PlaceholderBinder.isRelativeUrl(val)) {
          val = encodeURIComponent(val);
        }
      }

      return val;
    });
  }
}
