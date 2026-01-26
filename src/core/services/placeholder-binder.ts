/**
 * DOM Scanner for Variable Interpolation
 * 
 * Scans the DOM for [[ variable_name ]] patterns and replaces them with
 * reactive spans that update when the variable store changes.
 */

// Regex to find [[ variable : fallback ]]
// Group 1: escape character (backslashes)
// Group 2: variable name
// Group 3 (optional): fallback value
export const VAR_REGEX = /(\\)?\[\[\s*([a-zA-Z0-9_]+)(?:\s*:\s*(.*?))?\s*\]\]/g;
// Non-global version for stateless testing
const VAR_TESTER = /(\\)?\[\[\s*([a-zA-Z0-9_]+)(?:\s*:\s*(.*?))?\s*\]\]/;

import { placeholderRegistryStore } from '../stores/placeholder-registry-store.svelte';
import { store } from '../stores/main-store.svelte';

export class PlaceholderBinder {
  /**
   * Scans the root element for text nodes containing variable placeholders.
   * Replaces them with <span class="cv-var" data-name="...">...</span>.
   * 
   * Also scans for elements with .cv-bind or [data-cv-bind] to setup attribute bindings.
   */
  static scanAndHydrate(root: HTMLElement) {
    this.scanTextNodes(root);
    this.scanAttributeBindings(root);
  }

  /**
   * Updates all <span class="cv-var"> elements with new values.
   * Also updates attributes on elements with [data-cv-attr-templates].
   */
  static updateAll(values: Record<string, string>) {
    // Note: Text nodes update themselves via <cv-placeholder> reactivity
    this.updateAttributeBindings(values);
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
        // Skip existing variables to prevent observer loops
        if (node.parentElement && node.parentElement.classList.contains('cv-var')) {
            return NodeFilter.FILTER_REJECT;
        }
        return VAR_TESTER.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    // Process nodes
    textNodes.forEach(node => {
      PlaceholderBinder.processTextNode(node);
    });
  }

  private static scanAttributeBindings(root: HTMLElement) {
    // Attribute Scanning (Opt-in)
    const candidates = root.querySelectorAll('.cv-bind, [data-cv-bind]');
    candidates.forEach(el => {
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
             if (name) store.registerPlaceholder(name);
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
          if (attr.name.startsWith('data-cv')) continue; // Skip own attributes
          
          if (VAR_TESTER.test(attr.value)) {
              templates[attr.name] = attr.value;
              hasBindings = true;
          }
      }

      if (hasBindings) {
          el.dataset.cvAttrTemplates = JSON.stringify(templates);

          const matcher = new RegExp(VAR_REGEX.source, 'g');           
          Object.values(templates).forEach(tmpl => {
             let match;
             while ((match = matcher.exec(tmpl)) !== null) {
                 if (!match[1] && match[2]) {
                    store.registerPlaceholder(match[2]);
                 }
             }
          });
      }
  }

  // =========================================================================
  // Update Logic
  // =========================================================================

  // No need for updateTextNodes as components handle themselves

  private static updateAttributeBindings(values: Record<string, string>) {
    const attrElements = document.querySelectorAll('[data-cv-attr-templates]');
    attrElements.forEach(el => {
        if (el instanceof HTMLElement) {
            try {
                const templates = JSON.parse(el.dataset.cvAttrTemplates || '{}');
                Object.entries(templates).forEach(([attrName, template]) => {
                     const newValue = PlaceholderBinder.interpolateString(template as string, values, attrName);
                     el.setAttribute(attrName, newValue);
                });
            } catch (e) {
                console.warn('Failed to parse cv-attr-templates', e);
            }
        }
    });
  }

  // =========================================================================
  // Resolution Helpers
  // =========================================================================

  private static resolveValue(name: string, fallback: string | undefined, values: Record<string, string>): string | undefined {
        const userVal = values[name];
        
        // Look up registry definition
        const def = placeholderRegistryStore.get(name);
        const registryDefault = def?.defaultValue;

        if (userVal !== undefined && userVal !== '') {
            return userVal;
        } else if (registryDefault !== undefined && registryDefault !== '') {
            return registryDefault;
        } else if (fallback) {
            return fallback;
        }
        return undefined;
  }

  private static interpolateString(template: string, values: Record<string, string>, attrName?: string): string {
      return template.replace(VAR_REGEX, (_full, escape, name, fallback) => {
          if (escape) return `[[${name}]]`;
          
          let val = PlaceholderBinder.resolveValue(name, fallback, values);
          if (val === undefined) return `[[${name}]]`;

          // Auto-encode for URL attributes
          if (attrName && (attrName === 'href' || attrName === 'src')) {
              val = encodeURIComponent(val);
          }

          return val;
      });
  }
}
