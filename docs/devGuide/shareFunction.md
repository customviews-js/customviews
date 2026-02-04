{% set title = "Share Functionality" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# Share Function

The **Share Function** (or "Share Mode") allows users to create deeply customized links to specific pages. Instead of sharing a generic URL, users can select specific parts of a page to either **focus on** or **hide**, allowing for granular context sharing.

## Core Concepts

### 1. The Overlay Interface

When Share Mode is activated, the application renders a specialized **Overlay Layer** on top of the document. This layer intercepts all user interactions, preventing standard page behavior (like clicking links or selecting text) and replacing it with a selection mechanism.

- **Visual Feedback**: As users hover over content, the system identifies the underlying structural elements (paragraphs, code blocks, headers) and highlights them.
- **Dual Modes**: Users can toggle between **"Show Mode"** (selecting what to keep) and **"Hide Mode"** (selecting what to redact).

### 2. Robust Deep Linking

To ensure shared links remain valid even if the page content changes slightly (e.g., typos fixed, paragraphs reordered), the system avoids fragile selectors like XPath or Index-based paths.

Instead, it employs a **Fingerprinting Strategy**:

- **Structural Anchoring**: It records the element's position relative to stable landmarks (like ID-bearing parents).
- **Content Awareness**: It generates a hash of the text content.

When a link is opened, the system locates the elements using a "fuzzy match" algorithm. If an element has moved or changed slightly, the system can still confidently identify and target the correct content.

### 3. URL Serialization

The selected state is serialized into a compact, URL-safe string and appended to the page URL. This means the share state is entirely client-side and requires no database or backend storage.

- **Focus Param**: `?cv-focus=...` is used when elements are selected to be shown (filtering out everything else).
- **Hide Param**: `?cv-hide=...` is used when elements are selected to be hidden (redacting specific parts).

When a user visits a link containing these parameters, the application automatically enters **Focus Mode**, applying the necessary visibility filters immediately upon load.
