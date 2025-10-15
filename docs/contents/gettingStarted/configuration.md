<frontmatter>
  title: Configuration Reference
  layout: default.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Configuration File (`customviews.config.json`)

CustomViews is configured via a JSON file, typically named `customviews.config.json`. This file defines toggles, tabs, assets, and widget settings.

### Basic Structure

```json
{
  "config": {
    "allToggles": ["toggle1", "toggle2"],
    "defaultState": {
      "toggles": ["toggle1"],
      "tabs": {
        "group1": "tabA"
      }
    },
    "tabGroups": [
      {
        "id": "group1",
        "label": "Group 1",
        "tabs": [
          { "id": "tabA", "label": "Tab A" },
          { "id": "tabB", "label": "Tab B" }
        ],
        "default": "tabA"
      }
    ]
  },
  "assetsJsonPath": "/assets/assets.json",
  "baseUrl": "/website-baseUrl",
  "showUrl": true,
  "widget": {
    "enabled": true,
    "position": "middle-left",
    "theme": "light",
    "showReset": true,
    "title": "Custom Views",
    "description": "Toggle different content sections to customize your view.",
    "showWelcome": false,
    "welcomeTitle": "Site Customization",
    "welcomeMessage": "This site uses CustomViews. Use the widget to customize your experience.",
    "showTabGroups": true
  }
}
```

## Configuration Options

### Core Configuration (`config`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allToggles` | `string[]` | Yes | Array of all available toggle IDs that can be used on the page. |
| `defaultState` | `object` | Yes | Default state when no user preferences are saved. |
| `defaultState.toggles` | `string[]` | No | Toggles enabled by default. |
| `defaultState.tabs` | `object` | No | Default tab selections: `{groupId: tabId}`. |
| `tabGroups` | `object[]` | No | Array of tab group configurations. |

### Tab Group Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the tab group. |
| `label` | `string` | No | Display name for the tab group (shown in widget). |
| `tabs` | `object[]` | Yes | Array of tab configurations. |
| `tabs[].id` | `string` | Yes | Unique identifier for the tab. |
| `tabs[].label` | `string` | No | Display label for the tab. |
| `default` | `string` | No | Default tab ID (falls back to first tab if omitted). |

### Global Options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `assetsJsonPath` | `string` | null | Path to the assets manifest JSON file (relative to `baseUrl`). |
| `baseUrl` | `string` | `/` | Base URL for resolving relative paths (can also be `baseURL`). Specifies the website's base URL (for example `/docs`). |
| `showUrl` | `boolean` | `false` | Whether to encode state in the URL for shareable links. |

### Widget Configuration (`widget`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether to show the floating widget on the page. |
| `position` | `string` | `"middle-left"` | Widget position: `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"middle-left"`, `"middle-right"`. |
| `theme` | `string` | `"light"` | Widget theme: `"light"` or `"dark"`. |
| `showReset` | `boolean` | `true` | Whether to show the reset to default button. |
| `title` | `string` | `"Custom Views"` | Title shown in widget tooltip and modal header. |
| `description` | `string` | `"Toggle different content sections..."` | Description text shown in the modal. |
| `showWelcome` | `boolean` | `false` | Whether to show a welcome modal on first visit. |
| `welcomeTitle` | `string` | `"Site Customization"` | Title for the welcome modal. |
| `welcomeMessage` | `string` | Welcome message HTML | Message shown in the welcome modal. |
| `showTabGroups` | `boolean` | `true` | Whether to show tab groups section in widget. |

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

## HTML Attributes

Use these attributes in your HTML to control content visibility and asset insertion:

### Toggle Attributes

```html
<div data-cv-toggle="windows">Content for Windows users</div>
<div data-customviews-toggle="mac">Content for Mac users</div>
```

Both `data-cv-toggle` and `data-customviews-toggle` are supported.

### Asset Insertion Attributes

```html
<div data-cv-id="screenshot-windows"></div>
<div data-customviews-id="diagram-mac"></div>
```

Assets with matching IDs from `assets.json` will be inserted into these elements when their toggle is active.

Both `data-cv-id` and `data-customviews-id` are supported for backwards compatibility.

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
| `type` | `string` | Asset type: `"image"`, `"text"`, `"html"` (auto-detected if omitted). |
| `src` | `string` | Image source URL (for images). |
| `alt` | `string` | Alt text for images. |
| `content` | `string` | Text or HTML content. |
| `className` | `string` | CSS class(es) to apply. |
| `style` | `string` | Inline CSS styles. |

## Programmatic Configuration

You can also configure CustomViews programmatically:

```javascript
import { CustomViews } from './lib/custom-views';

const core = await CustomViews.init({
  config: {
    allToggles: ['toggle1'],
    defaultState: { toggles: ['toggle1'] }
  },
  assetsJsonPath: '/assets.json',
  baseUrl: '/customviews'
});
```

This bypasses the config file and allows full control over initialization.
