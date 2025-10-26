<frontmatter>
  title: Installation
  layout: default.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Quick Start (Autoload via Script)

To get started quickly, add the following snippet to your site’s `<head>` or right before `</body>`:

```html
<!-- Load from CDN or your hosted bundle -->
<script src="https://unpkg.com/@customviews-js/customviews"
        data-base-url="/website-baseUrl"                          (ONLY IF NEEDED)
        data-config-path="/custom/customviewsconfigfilename.json" (ONLY IF NEEDED)
></script>
```

This snippet loads:
* The CustomViews runtime, a lightweight JavaScript that auto-initializes on page load.
* The base URL and config path, which tell the runtime where to find your assets and configuration.

Now you can start using Custom Views!

### Manual Initialization (Optional)

If you need more control, you can import and initialize it manually. Check out the API on the GitHub page!

## Creating `customviews.config.json`

Create a `customviews.config.json` file at your project root, or point to a custom path using `data-config-path`.

Here's an example configuration:
```json
{
  "config": {
    "allToggles": ["example-toggle", "beta-feature"],
    "defaultState": {
      "toggles": ["example-toggle"],
      "tabs": {
        "fruit": "pear"
      }
    },
    "tabGroups": [
      {
        "id": "fruit",
        "label": "Fruit Selection",
        "tabs": [
          { "id": "apple", "label": "Apple" },
          { "id": "orange", "label": "Orange" },
          { "id": "pear", "label": "Pear" }
        ]
      }
    ]
  },
  "baseUrl": "/customviews",
  "widget": {
    "showWelcome": true
  },
}
```

## Key Fields

| Field | Description |
| ------ | ------------ |
| `config.allToggles` | List of toggle IDs recognized by CustomViews. |
| `config.defaultState` | Toggles and tabs per tab group enabled by default on first load. |
| `assetsJsonPath` | Path to your compiled assets manifest (resolved relative to `baseUrl`). |
| `widget` | Floating widget settings — control position, visibility, and welcome prompt. |
| `showUrl` | When true, CustomViews encodes the active state into the browser URL for shareable links. |

---

Happy toggling! 

CustomViews lets you build content that adapts — without framework bloat or complex build steps.
