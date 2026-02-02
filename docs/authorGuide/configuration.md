{% set title = "Configuration Reference" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>  
  title: "Author Guide - Configuration"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# {{ title }}

## Configuration File (`customviews.config.json`)

CustomViews is configured via a JSON file, typically named `customviews.config.json`. This file defines toggles, tabs, assets, and widget settings.

### Basic Structure

```json
{
  "config": {
    "toggles": [...],
    "tabGroups": [...],
    "placeholders": [...]
  },
  "baseUrl": "/website-baseUrl",
  ...
}
```

## Summary of Configuration Options

Refer to individual components for more details on each configuration option.

### Core Configuration (`config`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| toggles | `object[]` | No | Array of toggle configurations. Each object must have a `toggleId`. |
| tabGroups | `object[]` | No | Array of tab group configurations. |
| placeholders | `object[]` | No | Array of global placeholder definitions. |


* Tab Group Configuration Settings, see [here](./components/tabs.md#configuration)
* Toggle Configuration Settings, see [here](./components/toggles.md#configuration)
* Placeholder Configuration Settings, see [here](./components/placeholders.md#configuration)


## Global Options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| assetsJsonPath | `string` | null | Path to the assets manifest JSON file (relative to `baseUrl`). |
| baseUrl | `string` | `/` | Base URL for resolving relative paths (can also be `baseURL`). Specifies the website's base URL (for example `/docs`). |
| showUrl | `boolean` | `false` | Whether to encode state in the URL for shareable links. |
| storageKey | `string` | `null` | Optional key to isolate localStorage settings across different sites. Used as a prefix (e.g., `my-unique-siteName`). |

### Settings Configuration (`settings`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| enabled | `boolean` | `true` | Whether to show the floating settings widget on the page. |
| panel.title | `string` | `"Customize View"` | Title shown in settings tooltip and modal header. |
| panel.description | `string` | `""` | Description text displayed in the settings modal. |
| panel.showTabGroups | `boolean` | `true` | Whether to show tab groups section in widget. |
| panel.showReset | `boolean` | `true` | Whether to show the reset to default button. |
| panel.theme | `string` | `"light"` | Widget theme: `"light"` or `"dark"`. |
| callout.show | `boolean` | `false` | Whether to show the callout. |
| callout.message | `string` | `"Customize your reading experience here."` | Message to display in the callout. |
| callout.enablePulse | `boolean` | `true` | Whether to enable pulse animation for the callout. |
| callout.backgroundColor | `string` | `null` | Custom background color for the callout. |
| callout.textColor | `string` | `null` | Custom text color for the callout. |
| icon.position | `string` | `"middle-left"` | Widget position: `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"middle-left"`, `"middle-right"`. |
| icon.color | `string` | `null` | Custom icon color. |
| icon.backgroundColor | `string` | `null` | Custom background color for the icon. |
| icon.opacity | `number` | `null` | Custom opacity (0-1). |
| icon.scale | `number` | `1` | Custom scale factor. |

## Script Tag Attributes

When using auto-initialization via script tag, you can override configuration:

```html
<script src="/path/to/custom-views.min.js"
        data-base-url="/customviews"
        data-config-path="/my-config.json"
        defer></script>
```

| Attribute | Description |
|-----------|-------------|
| `data-base-url` | Specifies the website's base URL (for example `/docs`). This value is used to resolve relative asset paths and, when provided on the script tag, takes precedence over the `baseURL` in the config file. |
| `data-config-path` | Path to the config file to use for auto-initialization (default: `/customviews.config.json`). Provide an absolute or site-relative path if your config is located elsewhere (e.g. `/my-config.json` or `configs/customviews.json`). |

## Assets Configuration (`assets.json`)

The assets file defines content that can be dynamically inserted:

```json
{
  "screenshot-windows": {
    "type": "image",
    "src": "images/windows.png",
    "alt": "Windows screenshot"
  },
  "text-linux": {
    "type": "text",
    "content": "Linux installation instructions...",
    "className": "highlight"
  }
}
```

### Asset Properties

| Property | Type | Description |
|----------|------|-------------|
| type | `string` | Asset type: `"image"`, `"text"`, `"html"` (auto-detected if omitted). |
| src | `string` | Image source URL (for images). |
| alt | `string` | Alt text for images. |
| content | `string` | Text or HTML content. |
| className | `string` | CSS class(es) to apply. |
| style | `string` | Inline CSS styles. |

