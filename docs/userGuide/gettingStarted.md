{% set title = "Getting Started" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

++**Prerequisites**++

<div class="indented">

  :white_check_mark: a basic knowledge of [HTML](https://www.w3schools.com/html/) syntax<br>
  :white_check_mark: (Optional) [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/get-npm) if you plan to use the package manager
</div>

---

There are two main ways to use CustomViews: including it directly via a script tag (simplest) or installing it via npm (for bundlers).

## Method 1: CDN / Script Tag (Recommended)

<box type="info" seamless>

This method is the quickest way to get started and is ideal for static sites (Jekyll, Hugo, MarkBind, plain HTML). For more details, see the integrations section for each framework.

</box>

++**1. Add the Script Tag**++

Add the following script tag to the `<head>` or end of `<body>` in your HTML file:

```html
<!-- Load from unpkg -->
<script src="https://unpkg.com/@customviews-js/customviews/dist/custom-views.min.js"></script>

<!-- OR Load from jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@customviews-js/customviews/dist/custom-views.min.js"></script>
```

++**2. Create a Configuration File (Optional)**++

Create a `customviews.config.json` file in the same directory as your site root. This file defines the available toggles and default settings.

```json
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "macOS", "description": "Show content for macOS users" },
      { "toggleId": "win", "label": "Windows", "description": "Show content for Windows users" }
    ]
  },
  "settings": {
    "enabled": true,
    "panel": {
      "title": "Customize View"
    }
  }
}
```

++**3. Start Using Components**++

You can now use CustomViews attributes in your HTML:

```html
<cv-toggle toggle-id="mac">
  <p>This content is only for macOS users.</p>
</cv-toggle>

<cv-toggle toggle-id="win">
  <p>This content is only for Windows users.</p>
</cv-toggle>
```

---

## Method 2: Install via NPM

To be updated...

## Verify Installation

Open your HTML file in a browser. If installed correctly:

1.  You should see the **CustomViews Settings** (a gear icon) on your page.
2.  Clicking the icon should open the customization panel.
3.  Toggling options in the panel should show/hide the corresponding content on your page.

<panel header=":fa-solid-lightbulb: Troubleshooting">

**Settings icon not appearing?**
- Check your browser console for errors.
- Ensure `customviews.config.json` is accessible (check the Network tab).
- If using a local file (file:// protocol), browser security policies might block loading the JSON config. strongly recommend using a local server (like `http-server` or VS Code's Live Server).

</panel>

<br>
<br>
