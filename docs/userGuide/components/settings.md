<frontmatter>
  title: CustomViews - Settings
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Settings Dialog

The **Settings Dialog** component provides a floating user interface that allows visitors to customize their view of the page. It appears as a gear icon (⚙) positioned on the side of the screen, giving users control over content visibility and tab selections.

The settings widget is enabled by default, and will appear if not explicitly disabled in the configuration file, as long as the Custom Views script is present in the page. The settings interface adapts based on your configuration - sections for description, toggles, and tab groups are only displayed when relevant content is available.

<!-- Code and Output Separate the Settings, find a better way to display it. -->

The settings modal allows users to:
- Toggle content sections on/off using toggle switches (only shown when toggles are configured)
- Show or hide navigation headers for tab groups (only shown when tab groups are configured)
- Select active tabs in tab groups (only shown when tab groups are configured)
- View optional description text (only shown when description is configured)
- Reset to default view
- Copy a shareable URL with their current selections

## Intro Callout
 
When `callout.show` is enabled, the settings component displays an introductory callout on the user's first visit to introduce them to the customization features. The callout:
 
- **Appears automatically** on first visit (tracked via localStorage)
- **Points to the settings icon**
- **Includes customizable content** via `callout.message`
- **Dismisses permanently** after the user clicks "X" or opens the settings
 
The callout helps users discover the customization features and understand how to use the settings.


## Conditional Section Display

The settings component dynamically shows or hides sections based on your configuration:

- **Description Section**: Only appears when a `description` is configured in the settings options. When omitted, this section is completely hidden.
- **Toggle Section**: Only appears when `config.allToggles` contains at least one toggle. When no toggles are defined, this section is hidden.
- **Tab Groups Section**: Only appears when `config.tabGroups` contains at least one tab group. When no tab groups are defined, this section is hidden.
- **Navigation Headers Toggle**: Appears within the Tab Groups section when tab groups are configured, allowing users to show or hide tab navigation headers site-wide.

This adaptive behavior ensures the settings interface remains clean and focused, showing only relevant controls to users.

## Configuration

Enable and configure the settings in your `customviews.config.json`:

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
| `enabled` | `boolean` | `true` | Enables or disables the settings widget. |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme of the settings widget. |
| `panel.title` | `string` | `'Customize View'` | Title displayed in the settings modal. |
| `panel.description` | `string` | - | Description text displayed in the settings modal. |
| `panel.showTabGroups` | `boolean` | `true` | Whether to show the "Tab Groups" section in the settings panel. |
| `panel.showReset` | `boolean` | `true` | Whether to show the reset to default button. |
| `callout.show` | `boolean` | `false` | Whether to show an intro callout on first visit. |
| `callout.message` | `string` | `"Customize your reading experience here."` | Message to display in the callout. |
| `callout.enablePulse` | `boolean` | `true` | Whether the callout should pulse to grab attention. |
| `callout.backgroundColor` | `string` | `white` | Custom background color for the callout. |
| `callout.textColor` | `string` | `#1a1a1a` | Custom text color for the callout. |
| `icon.position` | `'middle-left' \| ...` | `'middle-left'` | Position of the settings icon button. |
| `icon.color` | `string` | `rgba(0, 0, 0, 0.9)` | Custom color for the settings icon. |
| `icon.backgroundColor` | `string` | `rgba(255, 255, 255, 0.92)` | Custom background color for the settings icon. |
| `icon.opacity` | `number` | `0.6` | Custom opacity for the settings icon (0-1). |
| `icon.scale` | `number` | `1` | Custom scale factor for the settings icon. |

## Integration with Toggles and Tabs

The settings component automatically discovers:
- **Toggles** from `config.toggles` - shows checkboxes to control visibility
- **Tab Groups** from `config.tabGroups` - shows dropdowns to select active tabs
- **Navigation Headers** - provides a toggle to show/hide tab navigation headers site-wide (persisted in localStorage)

Configure these in your `customviews.config.json` to make them available in the settings.