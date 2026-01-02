{% set title = "Architectural Overview" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

CustomViews uses **Svelte** for HTML-like declarative UI and **TypeScript** for the core logic.

* Initially, **Vanilla JavaScript, HTML, CSS** was used to build the widget. Direct DOM manipulation was used to update the UI based on state changes, to keep the runtime as small as possible and widget lightweight and ensure fast load times. However, the codebase became difficult to maintain, and the codebase became verbose and complex. Additionally, keeping the UI in sync with internal state was error-prone. Additionally, there was potential style bleeding issues.


## Why Svelte?

This is because unlike React or Vue, which require heavy runtimes, **Svelte** compiles components directly into standard Web components (HTML tags) that can be used in any environment. It is a compiler that does work during the build step, and not at runtime. 


* Svelte is a compiler that generates Web Components (Custom Elements). This allows us to author code in a modern, component-based developer environment while publishing a standard, framework-agnostic HTML tag (e.g., `<cv-settings>`) for end-users.


* **Key Benefits for this Project**
  1. **Declarative Reactivity**: Allows writing of declarative UI compared to imperative code that manually updates the DOM step-by-step, abstracting the complexity of keeping the DOM in sync with JavaScript logic.
  2. **Native Web Component Support**: Svelte compiles directly to standard Custom Elements. This allows the widget to be embedded in any environment (MarkBind, React, or plain HTML) and uses the Shadow DOM to strictly encapsulate styles, preventing them from breaking the host user's site.
  3. **Scoped Styling**: Svelte limits CSS to the component where it is defined. This solves "CSS bleeding" issues, allowing general use of simple class names like .container or .button without worrying about global namespace collisions with the host website.

