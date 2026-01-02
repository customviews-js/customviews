{% set title = "Configuration Reference" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>  
  title: "User Guide - Configuration"
  layout: userGuide.md
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
    "toggles": [
      { "toggleId": "toggle1", "label": "Toggle 1", "description": "Description for Toggle 1", "default": "show" }, 
      { "toggleId": "toggle2", "label": "Toggle 2", "description": "Description for Toggle 2", "default": "hide" },
      { "toggleId": "localToggle", "label": "Local Toggle", "description": "Description for Local Toggle", "isLocal": true },
    ],
    "tabGroups": [
      {
        "groupId": "group1",
        "label": "Group 1",
        "default": "tabA",
        "tabs": [
          { "tabId": "tabA", "label": "Tab A" },
          { "tabId": "tabB", "label": "Tab B" }
        ]
      }
    ]
  },
  "baseUrl": "/website-baseUrl",
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

## Summary of Configuration Options

Refer to individual components for more details on each configuration option.

### Core Configuration (`config`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toggles` | `object[]` | No | Array of toggle configurations. Each object must have a `toggleId`. |
| `tabGroups` | `object[]` | No | Array of tab group configurations. |

### Tab Group Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | `string` | Yes | Unique identifier for the tab group. |
| `label` | `string` | No | Display name for the tab group (shown in widget). |
| `tabs` | `object[]` | Yes | Array of tab configurations. |
| `tabs[].tabId` | `string` | Yes | Unique identifier for the tab. |
| `tabs[].label` | `string` | No | Display label for the tab. |
| `default` | `string` | No | The `tabId` of the tab that should be selected by default. If omitted, the first tab is selected. |

### Toggles Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toggleId` | `string` | Yes | Unique identifier for the toggle. |
| `label` | `string` | No | Display label for the toggle. |
| `description` | `string` | No | Description for the toggle. |
| `isLocal` | `boolean` | No | Whether the toggle is a local toggle. |
| `default` | `string` | No | Default state: `"show"`, `"hide"`, or `"peek"`. Implicit default is `"show"`. |


## Default State Behavior

## Default State Behavior
 
When no user preferences are saved, CustomViews determines the initial state from the configuration:

- **Toggles**: Toggles are enabled by default. Toggles with `"default": "peek"` are in peek mode. Toggles with `"default": "hide"` are hidden.
- **Tabs**: Tab groups select the tab specified in `default`, or the first tab if not specified.

### Example: Auto-generated Default State

```json
{
  "config": {
    "toggles": [
      { "toggleId": "mac", "label": "MacOS", "default": "show" },
      { "toggleId": "linux", "label": "Linux", "default": "peek" },
      { "toggleId": "windows", "label": "Windows", "default": "show" }
    ],
    "tabGroups": [
      {
        "groupId": "os",
        "default": "first",
        "tabs": [
          { "tabId": "first", "label": "First Tab" },
          { "tabId": "second", "label": "Second Tab" }
        ]
      }
    ]
  }
}
```

This configuration will auto-generate:
```javascript
{
  shownToggles: ["mac", "linux", "windows"],
  tabs: { os: "first" }
}
```

## Global Options

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
| `description` | `string` | `"Toggle different content sections..."` | Description text shown in the main widget modal. |
| `showWelcome` | `boolean` | `false` | Whether to show a welcome callout on first visit. |
| `welcomeMessage` | `string` | `"Customize your reading experience..."` | Message shown in the welcome callout. |
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
    toggles: [
      { toggleId: 'toggle1', label: 'Toggle 1', default: 'show' }
    ]
  },
  assetsJsonPath: '/assets.json',
  baseUrl: '/customviews'
});
```

This bypasses the config file and allows full control over initialization.
