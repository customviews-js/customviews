{% set title = "Share Functionality" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# Share Function

The **Share Function** (or "Share Mode") allows users to select specific parts of a page (paragraphs, code blocks, headers) and generate a distinct "Deep Link" that, when opened, restores the focus to those specific elements.

## Architecture

The feature is built using a **Store-Overlay-Service** pattern, fully decoupled from the core widget logic.

### 1. State Management (`share-store.ts`)
The `shareStore` is the single source of truth. It manages:
*   `isActive`: Whether Share Mode is currently enabled.
*   `selectedElements`: A `Set<HTMLElement>` of currently selected DOM nodes.
*   `currentHoverTarget`: The element currently under the mouse cursor.

### 2. The Overlay (`ShareOverlay.svelte`)
When Share Mode is active, `Settings` mounts the `ShareOverlay` component.
*   **Event Interception**: It uses global event listeners (`mouseover`, `click`) to intercept user interactions *before* they reach the underlying page.
*   **Visual Feedback**: It renders the `HoverHelper` (floating tag label) and applies highlighting classes (`.cv-highlight-target`) to the underlying elements.
*   **Toolbar**: Renders the `ShareToolbar` at the bottom of the screen.

### 3. Element Location (`DomElementLocator.ts`)
To make links robust (surviving page reloads or minor content updates), we do **not** use simple XPath or CSS selectors. We use a **Fingerprinting** strategy implemented in `src/core/utils/dom-element-locator.ts`.

#### How it works
The `DomElementLocator` generates a unique descriptor for any element:
1.  **Scope**: Finds the nearest parent with an ID to narrow the search.
2.  **Structure**: Records the tag name and relative index (e.g., "3rd `<p>` in `#main-content`").
3.  **Content**: Calculates a 32-bit Hash of the text content and stores a short text snippet.

When resolving an anchor:
*   **Fast Path**: Checks the element at the expected index. If the text hash matches, it confirms immediately (**O(1)**).
*   **Robust Fallback**: If the fast path fails (e.g., index shifted), it searches siblings for a match based on content hash or text snippet (**Fuzzy Matching**).

## Usage Flow

1.  **Activation**: User clicks "Share" in the Main Widget.
    *   `shareStore.toggleActive(true)` is called.
    *   `ShareOverlay` mounts.
2.  **Selection**: User clicks elements.
    *   `shareStore.toggleSelection(el)` adds/removes elements.
    *   **Smart Selection**: If a parent is selected, its children are implicitly included (and removed from explicit selection to keep the list clean).
3.  **Link Generation**: User clicks "Generate Link".
    *   `DomElementLocator.createDescriptor(el)` creates fingerprints for all selected items.
    *   `DomElementLocator.serialize()` compresses them into a base64 string.
    *   The string is appended to the URL as `?cv-focus=...`.
4.  **Restoration**: When a user loads the link:
    *   `FocusService` (sharing the same Locator logic) parses the URL.
    *   `DomElementLocator.resolve()` finds the elements.
    *   Focus Mode is activated for those elements.
