<frontmatter>
  title: CustomViews - Widget
  layout: default.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Widget

The **Widget** provides a floating user interface that allows visitors to customize their view of the page. It appears as a gear icon (⚙) positioned on the side of the screen, giving users control over content visibility and tab selections.

The widget is enabled by default, and will appear if not explicitly disabled in the configuration file, as long as the Custom Views script is present in the page.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">json</variable>
<variable name="code">
{
  "config": {
    "allToggles": ["toggle1", "toggle2", "toggle3"],
    "tabGroups": [
      {
        "id": "tabgroup1",
        "label": "Tab Group 1",
        "default": "option1",
        "tabs": [
          { "id": "option1", "label": "Option 1" },
          { "id": "option2", "label": "Option 2" },
          { "id": "option3", "label": "Option 3" }
        ]
      }
    ]
  },
  "widget": {
    "title": "Custom Title",
    "description": "Custom Description",
  }
}

</variable>
<variable name="output">
<!-- The widget icon appears on the configured position -->
<div class="cv-widget-modal cv-custom-state-modal">
  <div class="cv-widget-modal-header">
    <h3>Custom Title</h3>
    <button class="cv-widget-modal-close" aria-label="Close modal">×</button>
  </div>
  <div class="cv-widget-modal-content">
<div class="cv-custom-state-form">
<p>Custom Description</p>

<h4>Content Sections</h4>
<div class="cv-custom-toggles">

<div class="cv-custom-state-toggle">
<label>
<div class="cv-toggle-switch" data-toggle="toggle1">
<div class="cv-toggle-handle"></div>
</div>
Toggle Category 1
</label>
</div>

<div class="cv-custom-state-toggle">
<label>
<div class="cv-toggle-switch" data-toggle="toggle2">
<div class="cv-toggle-handle"></div>
</div>
Toggle Category 2
</label>
</div>

<div class="cv-custom-state-toggle">
<label>
<div class="cv-toggle-switch" data-toggle="toggle3">
<div class="cv-toggle-handle"></div>
</div>
Toggle Category 3
</label>
</div>

</div>


<h4>Tab Groups</h4>
<div class="cv-tab-groups">

<div class="cv-tab-group-control">
<label for="tab-group-1">Tab Group 1</label>
<select id="tab-group-1" class="cv-tab-group-select" data-group-id="1">
<option>Option 1</option><option>Option 2</option><option>Option 3</option>
</select>
</div>

</div>

<div class="cv-custom-state-actions">
  <button class="cv-custom-state-reset">Reset to Default</button>
  <button class="cv-custom-state-copy-url">Copy Shareable URL</button>
</div>
</div>
</div>
</div>

</variable>
</include>

The widget opens a modal dialog where users can:
- Toggle content sections on/off using toggle switches
- Select active tabs in tab groups
- Reset to default view
- Copy a shareable URL with their current selections

## Welcome Modal

When `showWelcome` is enabled, the widget displays a welcome modal on the user's first visit to introduce them to the customization features. The welcome modal:

- **Appears automatically** on first visit (tracked via localStorage)
- **Shows a preview** of the widget icon with instructions
- **Includes customizable content** via `welcomeTitle` and `welcomeMessage`
- **Dismisses permanently** after the user clicks "Got it!" or closes the modal

The welcome modal helps users discover the customization features and understand how to use the widget.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">json</variable>
<variable name="code">
{
  "widget": {
    "showWelcome": true,
    "welcomeTitle": "Custom Welcome Title",
    "welcomeMessage": "Custom Welcome Message"
  }
}

</variable>
<variable name="output">
<div class="cv-widget-modal cv-welcome-modal">
<div class="cv-widget-modal-header">
<h3>Custom Welcome Title</h3>
<button class="cv-widget-modal-close" aria-label="Close modal">×</button>
</div>
<div class="cv-widget-modal-content">
<div class="cv-welcome-content">
  <p style="text-align: justify;">Custom Welcome Message</p>
  
  <div class="cv-welcome-widget-preview">
    <div class="cv-welcome-widget-icon">⚙</div>
    <p class="cv-welcome-widget-label">Look for this widget on the side of the screen</p>
  </div>
  
  <button class="cv-welcome-got-it">Got it!</button>
</div>
</div>
</div>
</variable>
</include>

## Configuration

Enable and configure the widget in your `customviews.config.json`:

```json
{
  "config": {
    "widget": {
      "position": "middle-left",
      "title": "Customize View",
      "description": "Toggle different content sections to customize your view.",
      "showWelcome": true,
      "welcomeTitle": "Site Customization",
      "welcomeMessage": "This site uses CustomViews. Use the widget to customize your experience.",
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
| `description` | string | None | Description text shown in the modal. Set it in the configuration json if you want to add a custom description in the widget popup. |
| `showWelcome` | boolean | `false` | Whether to show a welcome modal on first visit. |
| `welcomeTitle` | string | `"Site Customization"` | Title for the welcome modal. |
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

Configure these in your `customviews.config.json` to make them available in the widget.