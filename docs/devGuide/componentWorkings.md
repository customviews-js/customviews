---
  title: "Developer Guide - Components"
  layout: devGuide.md
  pageNav: 2
---

## How do the components work (rough explanation)


### Placeholders

Placeholders allow for dynamic text substitution on the client side without needing a server-side build step for every variable combination.

#### 1. Scanning and Hydration
The process begins with the `PlaceholderBinder.scanAndHydrate(root)` method, which is called during the library's initialization (and potentially re-run when new content is injected).

*   **Text Node Scanning**: The binder uses a `TreeWalker` to traverse the DOM looking for text nodes that match the pattern `[[ variable : fallback ]]`.
    *   It skips script and style tags to avoid corrupting code.
    *   When a match is found, the text node is **replaced** by a `DocumentFragment` containing static text and a special `<span class="cv-var" data-name="...">` element.
    *   This conversion turns a static text string into an individually addressable DOM element that we can update later.

*   **Attribute Scanning**: To support replacements in attributes (like `href` or `src`), scanning is **opt-in**.
    *   The binder looks for elements with the class `.cv-bind` or attribute `[data-cv-bind]`.
    *   It iterates through all attributes of these elements.
    *   If an attribute contains a placeholder pattern, the original template string is saved into `data-cv-attr-templates`.

#### 2. Reactivity & Updates
Updates are driven by the `placeholderValueStore`. When a value changes:

1.  **Text Updates**: The binder queries for all `.cv-var` spans. It checks the `data-name` against the new values and updates `textContent`.
    *   Priority: User Value -> Registry Default -> Inline Fallback -> Original Placeholder.

2.  **Attribute Updates**: The binder queries for all elements with `[data-cv-attr-templates]`.
    *   It retrieves the stored template string.
    *   It interpolates the new values into the string.
    *   **Auto-Encoding**: If the attribute is `href` or `src`, the inserted values are automatically `encodeURIComponent`-ed to ensure valid URLs.

#### 3. Handling Dynamic DOM Updates
The system uses a `MutationObserver` (in `core.svelte.ts`) to watch for changes to the DOM.

*   When nodes are added (e.g., via a library inserting content or lazy loading), the observer triggers a re-scan of the *added nodes only*.
*   This ensures that placeholders inside dynamically loaded content are detected and hydrated automatically.
*   The scanner includes a check to skip nodes that are already hydration targets (`.cv-var`) to prevent infinite regression loops where hydrating a node triggers a new observation which triggers hydration...



