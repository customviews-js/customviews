<frontmatter>
  title: CustomViews - Toggle Component
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Toggles

`<cv-toggle>` `<div data-cv-toggle="category">`

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

## Multi-ID Toggles 

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
| `config.toggles` | An array of toggle objects. Each object must have an `id` and can have an optional `label` and `isLocal` flag. |
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
<box data-cv-toggle="localToggle">

Local Toggle content 

</box>
```


<box data-cv-toggle="localToggle">

Local Toggle content 

</box>

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
	* Ensure the element uses data-cv-toggle and matches an active toggle ID.

* URL state not persisting in URL bar?
	* Enable showUrl in the configuration.

* Widget not loading?
	* Verify the script is included and customviews.config.json is accessible.



