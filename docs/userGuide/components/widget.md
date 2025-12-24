<frontmatter>
  title: CustomViews - Widget
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Widget

The **Widget** provides a floating user interface that allows visitors to customize their view of the page. It appears as a gear icon (⚙) positioned on the side of the screen, giving users control over content visibility and tab selections.

The widget is enabled by default, and will appear if not explicitly disabled in the configuration file, as long as the Custom Views script is present in the page. The widget adapts its interface based on your configuration - sections for description, toggles, and tab groups are only displayed when relevant content is available.

<!-- Code and Output Separate the Widget, find a better way to display it. -->

The widget opens a modal dialog where users can:
- Toggle content sections on/off using toggle switches (only shown when toggles are configured)
- Show or hide navigation headers for tab groups (only shown when tab groups are configured)
- Select active tabs in tab groups (only shown when tab groups are configured)
- View optional description text (only shown when description is configured)
- Reset to default view
- Copy a shareable URL with their current selections

## Welcome Modal

When `showWelcome` is enabled, the widget displays a welcome modal on the user's first visit to introduce them to the customization features. The welcome modal:

- **Appears automatically** on first visit (tracked via localStorage)
- **Shows a preview** of the widget icon with instructions
- **Includes customizable content** via `welcomeMessage`
- **Dismisses permanently** after the user clicks "Got it!" or closes the modal

The welcome modal helps users discover the customization features and understand how to use the widget.


## Conditional Section Display

The widget dynamically shows or hides sections based on your configuration:

- **Description Section**: Only appears when a `description` is configured in the widget options. When omitted, this section is completely hidden.
- **Toggle Section**: Only appears when `config.allToggles` contains at least one toggle. When no toggles are defined, this section is hidden.
- **Tab Groups Section**: Only appears when `config.tabGroups` contains at least one tab group. When no tab groups are defined, this section is hidden.
- **Navigation Headers Toggle**: Appears within the Tab Groups section when tab groups are configured, allowing users to show or hide tab navigation headers site-wide.

This adaptive behavior ensures the widget remains clean and focused, showing only relevant controls to users.

## Configuration

Enable and configure the widget in your `customviews.config.json`:

```json
{
  "config": {
    "widget": {
      "position": "middle-left",
      "title": "Customize View",
      "description": "Toggle different content sections to customize your view.", // Optional - omit to hide description section
      "showWelcome": true,
      "welcomeMessage": "Custom Welcome Message"
    }
  }
}
```

## Widget Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | boolean | `true` | Whether to show the widget on the page. |
| `position` | string | `"middle-left"` | Widget position: `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"middle-left"`, `"middle-right"`. |
| `theme` | string | `"light"` | Widget theme: `"light"` or `"dark"`. |
| `showReset` | boolean | `true` | Whether to show the reset to default button. |
| `title` | string | `"Custom Views"` | Title shown in the widget icon tooltip and modal header. |
| `description` | string | `null` | Optional description text shown in the modal. When not set, the description section is omitted entirely. |
| `showWelcome` | boolean | `false` | Whether to show a welcome modal on first visit. |
| `welcomeMessage` | string | Welcome message HTML | Message shown in the welcome modal. |

## Programmatic Usage

You can also create and control the widget programmatically:

```javascript
import { CustomViewsWidget } from './lib/custom-views';

// Create widget instance
const widget = new CustomViewsWidget({
  core: customViewsCore,
  position: 'middle-left',
  theme: 'dark',
  showWelcome: true
});

// Render the widget
widget.render();

// Remove the widget
widget.destroy();
```

## Integration with Toggles and Tabs

The widget automatically discovers:
- **Toggles** from `config.allToggles` - shows checkboxes to control visibility
- **Tab Groups** from `config.tabGroups` - shows dropdowns to select active tabs
- **Navigation Headers** - provides a toggle to show/hide tab navigation headers site-wide (persisted in localStorage)

Configure these in your `customviews.config.json` to make them available in the widget.