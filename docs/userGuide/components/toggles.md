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
<cv-toggle toggle-id="mac">

**macOS**
macOS-specific install steps...

</cv-toggle>

<cv-toggle toggle-id="linux">

**Linux**
Linux-specific install steps...

</cv-toggle>

<cv-toggle toggle-id="windows">

**Windows**
Windows-specific install steps...

</cv-toggle>

</variable>
<variable name="output">
<cv-toggle toggle-id="mac">

**macOS**

macOS-specific install steps...

</cv-toggle>

<cv-toggle toggle-id="linux">

**Linux**

Linux-specific install steps...

</cv-toggle>

<cv-toggle toggle-id="windows">

**Windows**

Windows-specific install steps...

</cv-toggle>
</variable>
</include>

When the active toggle state includes `mac`, only the `<cv-toggle toggle-id="mac">` element will be visible. The component reactively updates based on the global toggle state.

## Multi-ID Toggles 

You can apply multiple toggles to a single element by separating categories with spaces.
This allows content to appear as long as one toggle category is active.

```html
<cv-toggle toggle-id="mac linux">
  This section appears for both macOS and Linux users.
</cv-toggle>
```

### Toggles with Peek Mode

You can set a toggle to "peek" mode, where it shows a preview of the content.
Use `show-peek-border` to add a border to the peek view to make it stand out.
We recommend `show-label` to add a label to the toggle, so users know what it is.

```html
<cv-toggle toggle-id="toggle1" show-peek-border show-label>
  <p>This content is in peek mode!</p>
</cv-toggle>
```

**Precedence Behaviour**:

When multiple IDs are used, the effective visibility is determined by the most "positive" state among all matching IDs. The order of precedence is:

1.  **Show** (Highest)
2.  **Peek**
3.  **Hide** (Lowest)

**Logic:**
*   If **ANY** of the IDs are set to **Show**, the content is completely **Shown**.
*   If **NONE** show, but **ANY** are **Peek**, the content is shown in **Peek** mode.
*   If **ALL** are **Hide** (or undefined), the content is **Hidden**.

This means that "Show" overrides "Peek", and "Peek" overrides "Hide". Explicit interest always overrides disinterest.

<box type="info">

**Note on Peek Mode:** If the content height is less than the standard peek height (70px), the component will automatically display the full content without the "expand" button or fade effect, even if the result state is "Peek". This ensures that short content isn't unnecessarily obscured.
</box>


## Attributes & Options of `<cv-toggle>`

| Name | Type | Default | Description |
|------|------|----------|-------------|
| `toggle-id` | string | **required** | Defines the category for the cv-toggle element. Example: `toggle-id="mac"`. |
| `asset-id` | string | - | ID for dynamic asset rendering. When the toggle becomes visible, matching assets from `assets.json` will be automatically rendered into the toggle content. Example: `asset-id="mac-assets"`. |
| `show-peek-border` | boolean | `false` | If present, adds a subtle border to the top and sides of the toggle content. The border is only applied while the toggle is in Peek mode (whether collapsed or user‑expanded). When the toggle is fully shown (non‑Peek), no border is rendered even if this attribute is set. |
| `show-label` | boolean | `false` | If present, displays the category label (e.g. "MacOS") at the top-left corner of the toggle. |

## Configuration 

To make toggles discoverable by the settings, you must define them in your `customviews.config.json`.

```json
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "MacOS", "description": "Show content for macOS users", "default": "show" },
      { "toggleId": "linux", "label": "Linux", "description": "Show content for Linux users", "default": "peek" },
      { "toggleId": "windows", "label": "Windows", "default": "hide" },
      { "toggleId": "localToggle", "label": "Local Toggle", "description": "Show content for local users", "isLocal": true }
    ]
  }
}
```

## Key Configuration Fields in `customviews.config.json` for Toggles

Also refer to the [Configuration](../configuration.md) section for a summary of all configuration options.

| Name | Type | Default | Description |
|------|------|----------|-------------|
| `toggleId` | string | **required** | Defines the category for the cv-toggle element. Example: `toggleId="mac"`. |
| `label` | string | - | Label for the toggle in the settings. |
| `description` | string | - | Description for the toggle in the settings. |
| `default` | string | `show` | Default state: `"show"`, `"hide"`, or `"peek"`. |
| `isLocal` | boolean | false | Whether the toggle is local (only appears in the settings on pages where it is used). |


### Visibility Resolution Order

1. URL state (if `showUrl` is enabled)
2. Persisted local storage state
3. Default configuration (per-item `default`)

Elements whose toggles match the active state are shown; all others are hidden.


## Global vs. Local Toggles

By default, all toggles defined in your configuration are **global**—they will appear in the settings on every page of your site.

You can mark a toggle as **local** to make it appear in the settings *only* on pages where that specific toggle is actually used. This is useful for keeping the settings clean and only showing relevant options to the user.

To mark a toggle as local, add `"isLocal": true` to its configuration.

**Example:**

If you have a `mac` toggle that is only used on a few pages, setting it as local ensures the "MacOS" option only appears in the settings on those pages.

```json
{
  "config": {
    "toggles": [
      { "toggleId": "localToggle", "label": "Local Toggle", "isLocal": true},
      { "toggleId": "mac", "label": "MacOS", "isLocal": false},
      { "toggleId": "linux", "label": "Linux" },
      { "toggleId": "windows", "label": "Windows" }
    ]
  }
}
```

And present on this page:

```html
<cv-toggle toggle-id="localToggle">

Local Toggle content 

</cv-toggle>
```


<cv-toggle toggle-id="localToggle">

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

## Registering Local Toggles for Settings

You can ensure that specific local toggles are always available in the settings, even if they are not initially visible on the page. This is useful for toggles that are loaded dynamically (e.g., inside a dropdown menu) and might not be detected by the plugin otherwise.

To do this, add a `data-cv-page-local-toggles` attribute to any element (an empty `<div>` is a good choice). The value of this attribute should be a comma-separated list of the local toggle IDs you want to register.

For example, to make the local toggles with IDs `advanced` and `dark-mode` available in the settings, add the following to your page:

```html
<div data-cv-page-local-toggles="advanced, dark-mode"></div>
```

This will ensure that the specified local toggles appear in the configuration settings, allowing users to control them even if they are not immediately visible on the page.




# Troubleshooting

* Toggles not appearing in settings?
	* Check that your `config.toggles` array is correctly formatted with `toggleId` and `label` for each toggle.

* No effect when toggling?
	* Ensure the element uses `<cv-toggle toggle-id="...">` and the category matches a configured toggle ID.

* URL state not persisting in URL bar?
	* Enable showUrl in the configuration.

* Settings icon not loading?
	* Verify the script is included and customviews.config.json is accessible.



