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

export class DomScanner {
  /**
   * Scans the root element for text nodes containing variable placeholders.
   * Replaces them with <span class="cv-var" data-name="...">...</span>.
   */
  static scanAndHydrate(root: HTMLElement) {
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
      DomScanner.processTextNode(node);
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

        // Append text before match
        if (index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
        }

        if (escape) {
             // If escaped, append the text without the backslash
             // fullMatch matches '\[[...]]', slice(1) gives '[[...]]'
             fragment.appendChild(document.createTextNode(fullMatch.slice(1)));
        } else {
             // Create Span
             const span = document.createElement('span');
             span.className = 'cv-var';
             span.dataset.name = name;
             if (fallback) span.dataset.fallback = fallback;
             span.textContent = fullMatch; // Will be hydrated later
             fragment.appendChild(span);
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

  /**
   * Updates all <span class="cv-var"> elements with new values.
   */
  static updateAll(values: Record<string, string>) {
     // console.log('[DomScanner] updateAll called', { values, definitions: placeholderRegistryStore.definitions });
     const spans = document.querySelectorAll('.cv-var');
     spans.forEach(span => {
         if (span instanceof HTMLElement) {
             const name = span.dataset.name;
             const fallback = span.dataset.fallback || '';
             
             if (name) {
                // Priority:
                // 1. User Value (Store)
                // 2. Registry Default (from <cv-define-placeholder>)
                // 3. Inline Fallback (from [[ var : fallback ]])
                
                 const userVal = values[name];
                 
                 // Look up registry definition
                 // Accessing definitions here makes the calling effect reactive to registry changes
                 const def = placeholderRegistryStore.definitions.find(d => d.name === name);
                 const registryDefault = def?.defaultValue;

                 if (userVal !== undefined && userVal !== '') {
                     span.textContent = userVal;
                 } else if (registryDefault !== undefined && registryDefault !== '') {
                     span.textContent = registryDefault;
                 } else if (fallback) {
                     span.textContent = fallback;
                 } else {
                     span.textContent = `[[${name}]]`; 
                 }
             }
         }
     });
  }
}
