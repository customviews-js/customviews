<frontmatter>
  title: CustomViews - Settings
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Settings Dialog

The **Settings Dialog** allows visitors to customize page content visibility and tab selections. It is enabled by default and automatically adapts to your configuration, showing only relevant sections.

The settings panel allows users to:
- Toggle content sections on/off
- Select active tabs in tab groups
- Show/hide navigation headers
- Configure placeholders
- Select and enter share and highlight view 
- Reset view to defaults or copy a shareable URL


## Settings Icon Trigger

The floating gear icon provides quick access to the settings.
- **Draggable**: Users can drag the icon vertically to their preferred position.
- **Persistent**: The icon's position is saved in the browser so it stays where the user left it.
- **Adaptive**: It stays within the viewport bounds automatically.

It can be disabled as well, and you can opt to trigger the settings dialog via a link or button.

### Intro Popup for Icon Trigger
 
An optional popup can appear on the user's first visit to highlight the settings icon. It includes a customizable message and dismisses permanently after interaction.


## Opening via Link

You can trigger the settings dialog via a link or button:

### Hash Trigger (Recommended)
Append `#cv-open` to the URL. Works without reloading the page.

```markdown
[Open Settings](./#cv-open)
```
[Open Settings through hash](#cv-open)

### Query Parameter
Append `?cv-open=true`, or simply `?cv-open` to the URL. Works on page load (reloads page) and auto-cleans the URL.

```markdown
[Open Settings](./settings.html?cv-open)
```
[Open Settings through query parameter](./settings.html?cv-open=true)


## Adaptive Display

The settings panel stays clean by only verifying configured elements:
- **Toggles/Tabs**: Sections appear only if defined in `config`.
- **Order of Sections**: The order of Toggles, Tab Groups, and Placeholders in the modal follows their order in your `customviews.config.json`.
- **Description**: Appears only if `panel.description` is set.

## Configuration

Configure the settings in `customviews.config.json`:

```json
{
  "config": {
    "settings": {
      "panel": {
        "title": "Custom Views Settings Dialog",
        "description": "Toggle different content sections to customize your view.",
        "showTabGroups": true,
        "showReset": true
      },
      "callout": {
        "show": true,
        "message": "Open the CustomViews settings to customize your view.",
        "enablePulse": true,
        "backgroundColor": "#198755",
        "textColor": "#ffffff"
      },
      "icon": {
        "position": "middle-left",
        "color": "#ffffff",
        "backgroundColor": "#198755",
        "opacity": 1.0,
        "scale": 1.1
      }
    }
  }
}
```

## Settings Options

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| enabled | `boolean` | `true` | Enables or disables the settings widget. |
| theme | `'light' \| 'dark'` | `'light'` | Theme of the settings widget. |
| panel.title | `string` | `'Customize View'` | Title displayed in the settings modal. |
| panel.description | `string` | - | Description text displayed in the settings modal. |
| panel.showTabGroups | `boolean` | `true` | Whether to show the "Tab Groups" section in the settings panel. |
| panel.showReset | `boolean` | `true` | Whether to show the reset to default button. |
| callout.show | `boolean` | `false` | Whether to show an intro callout on first visit. |
| callout.message | `string` | `"Customize your reading experience here."` | Message to display in the callout. |
| callout.enablePulse | `boolean` | `true` | Whether the callout should pulse to grab attention. |
| callout.backgroundColor | `string` | `white` | Custom background color for the callout. |
| callout.textColor | `string` | `#1a1a1a` | Custom text color for the callout. |
| icon.show | `boolean` | `true` | Whether to show the floating settings icon. |
| icon.position | `'middle-left' \| ...` | `'middle-left'` | Position of the settings icon button. |
| icon.color | `string` | `rgba(0, 0, 0, 0.9)` | Custom color for the settings icon. |
| icon.backgroundColor | `string` | `rgba(255, 255, 255, 0.92)` | Custom background color for the settings icon. |
| icon.opacity | `number` | `0.6` | Custom opacity for the settings icon (0-1). |
| icon.scale | `number` | `1` | Custom scale factor for the settings icon. |

## Integration

The settings component automatically discovers:
- **Toggles** from `config.toggles`
- **Tab Groups** from `config.tabGroups`
- **Navigation Headers** (persisted site-wide)
