<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

# Migration Guide

For most recent changes... (sorry for the confusion)

A checklist for updating git-mastery...

### Summary:
**Markdown file side:**
- [ ] Change usage of `data-cv-toggle` to use `<cv-toggle>` components
- [ ] Change usage of `<cv-tabgroup id="XXX">` to use `<cv-tabgroup group-id="XXX">`
- [ ] Change usage of `<cv-tab id="XXX">` to use `<cv-tab tab-id="XXX">`
- [ ] Change usage of `<cv-toggle category="XXX">` to use `<cv-toggle toggle-id="XXX">`

**Configuration side:**
- [ ] Change usage of `id` to `toggleId` for toggles
- [ ] Change usage of `id` to `groupId` for tab groups
- [ ] Change usage of `id` to `tabId` for tabs
- [ ] Change usage of `defaultState` to `default` for tab groups
- [ ] Change usage of `defaultState` to `default` for toggles
- [ ] Change usage of `widget` to `settings` for settings (config.widget becomes config.settings)
- [ ] Usage of `icon` customizations (new customizations: config.settings.icon.color, backgroundColor, opacity, scale)

**Find and Replace Patterns:**
| Find | Replace | Notes |
|------|---------|-------|
| `data-cv-toggle=` | `<cv-toggle toggle-id=` | manual replacement |
| `<cv-toggle category=` | `<cv-toggle toggle-id=` | |
| `<cv-tabgroup id=` | `<cv-tabgroup group-id=` | |
| `<cv-tab id=` | `<cv-tab tab-id=` | |
| `"id":` | `"toggleId":` / `"groupId":` / `"tabId":` | In JSON config (check context) |

## More Detailed:

### HTML Attributes Update

Renamed generic `id` attributes to be more specific and consistent.

#### Toggles (`<cv-toggle>`)

*   **Deprecated**: `data-cv-toggle="..."` on `<div>` elements.
*   **New**: Use the `<cv-toggle>` component.
*   **Renamed**: `category` -> `toggle-id`.

**Before:**
```html
<!-- Old style with data attributes -->
<div data-cv-toggle="windows">...</div>

<!-- Old component style -->
<cv-toggle category="windows">...</cv-toggle>
```

**After:**
```html
<cv-toggle toggle-id="windows">...</cv-toggle>
```

#### Tab Groups (`<cv-tabgroup>`)

*   **Renamed**: `id` -> `group-id`.

**Before:**
```html
<cv-tabgroup id="fruit">...</cv-tabgroup>
```

**After:**
```html
<cv-tabgroup group-id="fruit">...</cv-tabgroup>
```

#### Tabs (`<cv-tab>`)

*   **Renamed**: `id` -> `tab-id`.

**Before:**
```html
<cv-tab id="apple">...</cv-tab>
```

**After:**
```html
<cv-tab tab-id="apple">...</cv-tab>
```

---

### 2. Configuration File (`customviews.config.json`)

The configuration format has been updated to match the new attribute names and simplify default state management.

#### Renamed Keys

*   **Toggles**: `id` -> `toggleId`
*   **Tab Groups**: `id` -> `groupId`
*   **Tabs**: `id` -> `tabId`

### Default State

*   **Removed**: The `defaultState` object is no longer used.
*   **New**: Define defaults directly on the component configuration.
    *   **Toggles**: Add `"default": "show" | "peek" | "hide"`. (Implicit default is now `"show"`).
    *   **Tab Groups**: Add `"default": "tabId"` to specify the default tab.

### Widget Configuration Rename

*   **Renamed**: The top-level configuration key `widget` has been renamed to `settings`.
*   **Class**: `CustomViewsWidget` is now `CustomViewsSettings`.

**Before:**
```json
{
  "widget": {
    "enabled": true
  }
}
```

**After:**
```json
{
  "settings": {
    "enabled": true
  }
}
```

**Before:**
```json
{
  "toggles": [
    { "id": "mac", "label": "MacOS" }
  ],
  "tabGroups": [
    {
      "id": "os",
      "tabs": [ { "id": "windows", "label": "Windows" } ]
    }
  ],
  "defaultState": {
    "shownToggles": ["mac"],
    "tabs": { "os": "windows" }
  }
}
```

**After:**
```json
{
  "toggles": [
    { "toggleId": "mac", "label": "MacOS", "default": "show" }
  ],
  "tabGroups": [
    {
      "groupId": "os",
      "default": "windows",
      "tabs": [ { "tabId": "windows", "label": "Windows" } ]
    }
  ]
}
```
