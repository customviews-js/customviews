<frontmatter>
  title: CustomViews - Settings
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Settings

The **Settings** component provides a floating user interface that allows visitors to customize their view of the page. It appears as a gear icon (⚙) positioned on the side of the screen, giving users control over content visibility and tab selections.

The settings widget is enabled by default, and will appear if not explicitly disabled in the configuration file, as long as the Custom Views script is present in the page. The settings interface adapts based on your configuration - sections for description, toggles, and tab groups are only displayed when relevant content is available.

<!-- Code and Output Separate the Settings, find a better way to display it. -->

The settings modal allows users to:
- Toggle content sections on/off using toggle switches (only shown when toggles are configured)
- Show or hide navigation headers for tab groups (only shown when tab groups are configured)
- Select active tabs in tab groups (only shown when tab groups are configured)
- View optional description text (only shown when description is configured)
- Reset to default view
- Copy a shareable URL with their current selections

## Welcome Modal

When `showWelcome` is enabled, the settings component displays a welcome modal on the user's first visit to introduce them to the customization features. The welcome modal:

- **Appears automatically** on first visit (tracked via localStorage)
- **Shows a preview** of the settings icon with instructions
- **Includes customizable content** via `welcomeMessage`
- **Dismisses permanently** after the user clicks "Got it!" or closes the modal

The welcome modal helps users discover the customization features and understand how to use the settings.


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
      "position": "middle-left",
      "title": "Customize View",
      "description": "Toggle different content sections to customize your view.",
      "showWelcome": true,
      "welcomeMessage": "Custom Welcome Message"
    }
  }
}
```

## Settings Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | boolean | `true` | Whether to show the settings widget on the page. |
| `position` | string | `"middle-left"` | Widget position: `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"middle-left"`, `"middle-right"`. |
| `theme` | string | `"light"` | Widget theme: `"light"` or `"dark"`. |
| `showReset` | boolean | `true` | Whether to show the reset to default button. |
| `title` | string | `"Custom Views"` | Title shown in the settings icon tooltip and modal header. |
| `description` | string | `null` | Optional description text shown in the modal. When not set, the description section is omitted entirely. |
| `showWelcome` | boolean | `false` | Whether to show a welcome modal on first visit. |
| `welcomeMessage` | string | Welcome message HTML | Message shown in the welcome callout. |


## Integration with Toggles and Tabs

The settings component automatically discovers:
- **Toggles** from `config.toggles` - shows checkboxes to control visibility
- **Tab Groups** from `config.tabGroups` - shows dropdowns to select active tabs
- **Navigation Headers** - provides a toggle to show/hide tab navigation headers site-wide (persisted in localStorage)

Configure these in your `customviews.config.json` to make them available in the settings.