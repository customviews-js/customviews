---
  title: "Developer Guide - Components"
  layout: devGuide.md
  pageNav: 2
---

## How do the components work (rough explanation)


### Placeholders

Placeholders enable dynamic text substitution without a server-side build step.

#### 1. Scanning and Hydration
The `PlaceholderBinder.scanAndHydrate(root)` method initializes detection:

*   **Text Node Scanning**: A `TreeWalker` identifies text nodes matching `[[ variable : fallback ]]`.
    *   Matching nodes are replaced by a `<cv-placeholder>` custom element.
    *   This converts static text into a reactive component that manages its own lifecycle.
*   **Attribute Scanning**: Scanning is **opt-in** for attributes (like `href` or `src`).
    *   Targets must have the `.cv-bind` class or `data-cv-bind` attribute.
    *   The original template is stored in `data-cv-attr-templates` for later interpolation.

#### 2. Reactivity & Updates
Updates are driven by the `placeholderValueStore`:

1.  **Text Updates (Push-based)**: Each `<cv-placeholder>` component subscribes to the store. When a value changes, the component re-renders independently. This ensures O(1) update performance regardless of page size.
2.  **Attribute Updates (Pull-based)**: The binder queries for all elements with `[data-cv-attr-templates]`, interpolates the new values, and updates attributes directly. URL attributes (`href`, `src`) are automatically encoded.

#### 3. Dynamic Content
A `MutationObserver` watches for DOM changes:
*   Only **added nodes** are scanned for new placeholders.
*   The system skips nodes already hydrated as `<cv-placeholder>` to prevent infinite loops.



