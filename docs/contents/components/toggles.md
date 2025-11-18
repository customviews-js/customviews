<frontmatter>
  title: CustomViews - Toggle Component
  layout: default.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

## Toggle

`<cv-toggle>`

`<div data-cv-toggle="category">`

Toggles let you show or hide sections of a page based on a category (for example: `mac`, `linux`, `windows`). They are ideal for platform-specific content, progressive disclosure, or audience-targeted sections.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<section data-cv-toggle="mac">
    <h2>macOS</h2>
    <p>macOS-specific install steps...</p>
</section>

<section data-cv-toggle="linux">
    <h2>Linux</h2>
    <p>Linux-specific install steps...</p>
</section>

<section data-cv-toggle="windows">
    <h2>Windows</h2>
    <p>Windows-specific install steps...</p>
</section>
</variable>
<variable name="output">
<section data-cv-toggle="mac">
    <h3>macOS</h3>
    <p>macOS-specific install steps...</p>
</section>

<section data-cv-toggle="linux">
    <h3>Linux</h3>
    <p>Linux-specific install steps...</p>
</section>

<section data-cv-toggle="windows">
    <h3>Windows</h3>
    <p>Windows-specific install steps...</p>
</section>
</variable>
</include>

When the active toggle state includes `mac`, only the element with `data-cv-toggle="mac"` will be visible. CustomViews applies `.cv-visible` and `.cv-hidden` classes to animate visibility transitions.

> Other attribute names are supported as well: `data-customviews-toggle` behaves the same as `data-cv-toggle`.

## Variants 

You can apply multiple toggles to a single element by separating categories with spaces.
This allows content to appear as long as one toggle category is active.

```html
<div data-cv-toggle="mac linux">
  This section appears for both macOS and Linux users.
</div>

<cv-toggle category="mac linux">
  This section appears for both macOS and Linux users.
</cv-toggle>
```

## Configuration 

To make toggles discoverable by the CustomViews widget, you must define them in your `customviews.config.json`.

```json
{
  "config": {
    "toggles": [
      { "id": "mac", "label": "MacOS" },
      { "id": "linux", "label": "Linux" },
      { "id": "windows", "label": "Windows" }
    ],
    "defaultState": {
      "toggles": ["mac", "linux", "windows"]
    }
  }
}
```

## Key Fields

| Field | Description |
|--------|-------------|
| `config.toggles` | An array of toggle objects. Each object must have an `id` and can have an optional `label` for display in the widget. |
| `config.defaultState.toggles` | An array of toggle `id`s that should be active by default on first load when no URL or stored state is available. |

---

## Attributes & Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| `data-cv-toggle` | string | **required** for data attribute usage | Defines the category for the element. Example: `data-cv-toggle="mac"`. |
| `category` | string | **required** for `<cv-toggle>` | Defines the category for the cv-toggle element. Example: `category="mac"`. |
| `data-cv-id` / `data-customviews-id` | string | - | Marks the element as an asset render target. When visible, matching assets from `assets.json` will be dynamically inserted. |


### Visibility Resolution Order

1. URL state (if `showUrl` is enabled)
2. Persisted local storage state
3. Default configuration (`config.defaultState`)

Elements whose toggles match the active state are shown; all others are hidden.


## Troubleshooting

* Toggles not appearing in widget?
	* Check that your `config.toggles` array is correctly formatted with `id` and `label` for each toggle.

* No effect when toggling?
	* Ensure the element uses data-cv-toggle and matches an active toggle ID.

* URL state not persisting in URL bar?
	* Enable showUrl in the configuration.

* Widget not loading?
	* Verify the script is included and customviews.config.json is accessible.



