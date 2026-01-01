<frontmatter>
  title: CustomViews - Toggle Component
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Toggles

`<cv-toggle>`

Toggles let you show or hide sections of a page based on a category (for example: `mac`, `linux`, `windows`). They are ideal for platform-specific content, progressive disclosure, or audience-targeted sections.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-toggle category="mac">
    <h2>macOS</h2>
    <p>macOS-specific install steps...</p>
</cv-toggle>

<cv-toggle category="linux">
    <h2>Linux</h2>
    <p>Linux-specific install steps...</p>
</cv-toggle>

<cv-toggle category="windows">
    <h2>Windows</h2>
    <p>Windows-specific install steps...</p>
</cv-toggle>
</variable>
<variable name="output">
<cv-toggle category="mac">
    <h3>macOS</h3>
    <p>macOS-specific install steps...</p>
</cv-toggle>

<cv-toggle category="linux">
    <h3>Linux</h3>
    <p>Linux-specific install steps...</p>
</cv-toggle>

<cv-toggle category="windows">
    <h3>Windows</h3>
    <p>Windows-specific install steps...</p>
</cv-toggle>
</variable>
</include>

When the active toggle state includes `mac`, only the `<cv-toggle category="mac">` element will be visible. The component reactively updates based on the global toggle state.

## Multi-ID Toggles 

You can apply multiple toggles to a single element by separating categories with spaces.
This allows content to appear as long as one toggle category is active.

```html
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
      { "id": "mac", "label": "MacOS", "description": "Show content for macOS users" },
      { "id": "linux", "label": "Linux", "description": "Show content for Linux users" },
      { "id": "windows", "label": "Windows" }
    ],
    "defaultState": {
      "shownToggles": ["mac"],
      "peekToggles": ["linux"]
    }
  }
}
```

## Key Fields

| Field | Description |
|--------|-------------|
| `config.toggles` | An array of toggle objects. Each object must have an `id` and can have an optional `label`, `description`, and `isLocal` flag. |
| `config.defaultState.shownToggles` | An array of toggle `id`s that should be active (fully visible) by default on first load. |
| `config.defaultState.peekToggles` | An array of toggle `id`s that should be in peek mode by default. |

---

## Attributes & Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| `category` | string | **required** | Defines the category for the cv-toggle element. Example: `category="mac"`. |
| `assetId` | string | - | ID for dynamic asset rendering. When the toggle becomes visible, matching assets from `assets.json` will be automatically rendered into the toggle content. Example: `assetId="mac-assets"`. |


### Visibility Resolution Order

1. URL state (if `showUrl` is enabled)
2. Persisted local storage state
3. Default configuration (`config.defaultState`)

Elements whose toggles match the active state are shown; all others are hidden.


## Global vs. Local Toggles

By default, all toggles defined in your configuration are **global**—they will appear in the settings widget on every page of your site.

You can mark a toggle as **local** to make it appear in the widget *only* on pages where that specific toggle is actually used. This is useful for keeping the widget clean and only showing relevant options to the user.

To mark a toggle as local, add `"isLocal": true` to its configuration.

**Example:**

If you have a `mac` toggle that is only used on a few pages, setting it as local ensures the "MacOS" option only appears in the widget on those pages.

```json
{
  "config": {
    "toggles": [
      { "id": "localToggle", "label": "Local Toggle", "isLocal": true},
      { "id": "mac", "label": "MacOS", "isLocal": false},
      { "id": "linux", "label": "Linux" },
      { "id": "windows", "label": "Windows" }
    ]
  }
}
```

And present on this page:

```html
<cv-toggle category="localToggle">

Local Toggle content 

</cv-toggle>
```


<cv-toggle category="localToggle">

Local Toggle content 

Some long long text content to make sure the box is scrollable

Use toggles to separate platform-specific or audience-specific instructions:
- `mac`: Steps tailored for macOS users.
- `linux`: Commands for common Linux distributions.
- `windows`: Installer-based setup for Windows.
Scroll within this panel to review additional best practices:
- Keep toggle IDs short, descriptive, and lowercase (e.g. `advanced`, `dark-mode`).
- Prefer reusing the same toggle IDs across pages for consistency.
- Avoid introducing toggles that overlap heavily in meaning (users may be confused).
- Document what each toggle controls in your configuration or contributor guide.
- Test that content is still understandable when individual toggles are on or off.
- Consider a sensible default combination of toggles for new visitors.
These extra lines ensure the box remains scrollable while conveying useful guidance.

</cv-toggle>

## Registering Local Toggles for the Widget

You can ensure that specific local toggles are always available in the widget, even if they are not initially visible on the page. This is useful for toggles that are loaded dynamically (e.g., inside a dropdown menu) and might not be detected by the plugin otherwise.

To do this, add a `data-cv-page-local-toggles` attribute to any element (an empty `<div>` is a good choice). The value of this attribute should be a comma-separated list of the local toggle IDs you want to register.

For example, to make the local toggles with IDs `advanced` and `dark-mode` available in the widget, add the following to your page:

```html
<div data-cv-page-local-toggles="advanced, dark-mode"></div>
```

This will ensure that the specified local toggles appear in the configuration widget, allowing users to control them even if they are not immediately visible on the page.




# Troubleshooting

* Toggles not appearing in widget?
	* Check that your `config.toggles` array is correctly formatted with `id` and `label` for each toggle.

* No effect when toggling?
	* Ensure the element uses `<cv-toggle category="...">` and the category matches a configured toggle ID.

* URL state not persisting in URL bar?
	* Enable showUrl in the configuration.

* Widget not loading?
	* Verify the script is included and customviews.config.json is accessible.



