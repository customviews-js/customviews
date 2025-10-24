<frontmatter>
  title: User Guide - Tabs
</frontmatter>

# Tabs

`<cv-tabgroup>`
`<cv-tab>`

The **Tabs** component lets you define **mutually exclusive content sections** that users can toggle between — perfect for organizing platform-specific, step-based, or categorized documentation.  

When multiple tab groups (`<cv-tabgroup/>`) share the same `id` attribute, they stay synchronized automatically across the entire page.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<cv-tabgroup id="fruit" nav="auto">
  <cv-tab id="apple" header="Apple">
  
**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab id="orange" header="Orange">
  
**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab id="pear" header="Pear">
  
**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
</box>

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup id="fruit">
<cv-tab id="apple">
<cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

  Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

  Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>

</variable>
<variable name="output">

<cv-tabgroup id="fruit" nav="auto">
  <cv-tab id="apple" header="Apple">
  
**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab id="orange" header="Orange">
  
**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab id="pear" header="Pear">
  
**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
</box>

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup id="fruit">
<cv-tab id="apple">
<cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

  Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

  Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>

  Pear types include the **Asian pear** and the **European pear**
</cv-tab-body>
</cv-tab>
</cv-tabgroup>

</variable>
</include>


* **Single-Click Behavior** — Click once to switch tabs locally within that specific tab group only. The change is visual only and is not saved.
* **Double-Click Behavior** — Double-click to synchronize the tab selection across all tab groups with the same `id` on the page. The state is saved to browser storage and persists across page reloads.
* **Example:** If you have two tab groups both with `id="fruit"`, a single-click on "Orange" in the first group only changes that group locally. Double-clicking on "Orange" will sync both groups to show "Orange" and save the state.


## Multi-ID Tabs

You can create a single tab that represents multiple alternative IDs by specifying multiple IDs separated by spaces or `|`

* This will create **one tab** in the navigation bar that activates when **any** of the specified IDs is selected.
* The tab header displays the label of the first ID in the list (or the `header` attribute if provided).
* The content inside the tab is shared for all IDs listed.
* **Use case:** When multiple options (e.g., `python java`) present the same content, show a single tab instead of duplicates that might confuse readers into thinking the content differs.

**Example:**


<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup id="lang" nav="auto">
  <cv-tab id="python" header="Python">

Python is a high-level, interpreted programming language known for its simplicity and readability.

  </cv-tab>
  <cv-tab id="java" header="Java">

Java is a statically-typed, compiled language known for its robustness and platform independence.

  </cv-tab>
  <cv-tab id="javascript" header="JavaScript">

JavaScript is a dynamic language primarily used for web development.

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup id="lang" nav="auto">
  <cv-tab id="python java" header="Python/Java Installation">

Both Python and Java are easy to install. Download from their official websites.

  </cv-tab>
  <cv-tab id="javascript" header="JS Installation">

Install JavaScript by downloading Node.js from nodejs.org.

  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup id="lang" nav="auto">
  <cv-tab id="python" header="Python">

Python is a high-level, interpreted programming language known for its simplicity and readability.

  </cv-tab>
  <cv-tab id="java" header="Java">

Java is a statically-typed, compiled language known for its robustness and platform independence.

  </cv-tab>
  <cv-tab id="javascript" header="JavaScript">

JavaScript is a dynamic language primarily used for web development.

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup id="lang" nav="auto">
  <cv-tab id="python java" header="Python/Java Installation">

Both Python and Java are easy to install. Download from their official websites.

  </cv-tab>
  <cv-tab id="javascript" header="JS Installation">

Install JavaScript by downloading Node.js from nodejs.org.

  </cv-tab>
</cv-tabgroup>
</variable>
</include>

**Behavior:** In the second tab group, you'll see a single "Installation" tab in the navigation bar that becomes active when either Python or Java is selected in the first group. This avoids showing duplicate tabs with identical content.


## Alternative Syntax with Rich Formatting

In addition to the standard `header` attribute, you can use an alternative syntax with `<cv-tab-header>` and `<cv-tab-body>` elements to enable **rich HTML formatting** in your tab headers.

This is useful when you need:
- **Bold, italic, or colored text** in headers
- **Icons or badges** alongside the header text
- **Complex nested elements** with custom styling
- **Multi-line or specially formatted headers**

### Basic Example

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup id="docs" nav="auto">
  <cv-tab id="overview">
    <cv-tab-header><strong>Overview</strong></cv-tab-header>
    <cv-tab-body>
      Start here to learn the basics.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab id="advanced">
    <cv-tab-header><em>Advanced Topics</em></cv-tab-header>
    <cv-tab-body>
      Dive deeper into powerful features.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup id="docs" nav="auto">
  <cv-tab id="overview">
    <cv-tab-header><strong>Overview</strong></cv-tab-header>
    <cv-tab-body>
      Start here to learn the basics.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab id="advanced">
    <cv-tab-header><em>Advanced Topics</em></cv-tab-header>
    <cv-tab-body>
      Dive deeper into powerful features.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

### Advanced Example with Badges

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup id="status" nav="auto">
  <cv-tab id="active">
    <cv-tab-header>
      <strong>Active</strong> 
      <span style="color: green; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Currently active items are displayed here.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab id="archived">
    <cv-tab-header>
      <strong>Archived</strong> 
      <span style="color: gray; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Archived items are stored here for reference.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup id="status" nav="auto">
  <cv-tab id="active">
    <cv-tab-header>
      <strong>Active</strong> 
      <span style="color: green; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Currently active items are displayed here.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab id="archived">
    <cv-tab-header>
      <strong>Archived</strong> 
      <span style="color: gray; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Archived items are stored here for reference.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

### Using Icons in Headers

Since `<cv-tab-header>` accepts HTML elements, you can include icons in multiple ways:

1. **Via MarkBind shortcodes** (when using MarkBind) — MarkBind pre-processes `:fa-solid-icon:` into `<i>` elements
2. **Via direct HTML** — Include Font Awesome `<i>` tags directly

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup id="status" nav="auto">
<cv-tab id="enabled">
  <cv-tab-header>
  
  :fa-solid-virus: Enabled
  </cv-tab-header>
  <cv-tab-body>
    This feature is currently enabled and active.
  </cv-tab-body>
</cv-tab>

<cv-tab id="disabled">
  <cv-tab-header>
  
  :fa-solid-virus-slash: Disabled
  </cv-tab-header>
  <cv-tab-body>
    This feature is currently disabled.
  </cv-tab-body>
</cv-tab>

  <cv-tab id="pending">
  <cv-tab-header>
  
  :fa-solid-hourglass-end: Pending
  </cv-tab-header>
  <cv-tab-body>
    This feature is pending review.
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup id="status" nav="auto">
<cv-tab id="enabled">
  <cv-tab-header>

  :fa-solid-virus: Enabled
  </cv-tab-header>
  <cv-tab-body>
  This feature is currently enabled and active.
  </cv-tab-body>
</cv-tab>

<cv-tab id="disabled">
  <cv-tab-header>

  :fa-solid-virus-slash: Disabled
  </cv-tab-header>
  <cv-tab-body>
  This feature is currently disabled.
  </cv-tab-body>
</cv-tab>

<cv-tab id="pending">
  <cv-tab-header>

  :fa-solid-hourglass-end: Pending
  </cv-tab-header>
    <cv-tab-body>
      This feature is pending review.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

**Example with direct HTML:**
```html
<cv-tab id="enabled">
  <cv-tab-header><i class="fa-solid fa-virus"></i> Enabled</cv-tab-header>
  <cv-tab-body>This feature is enabled.</cv-tab-body>
</cv-tab>
```

**Note:** `<cv-tab-header>` accepts any HTML elements. Icon shortcodes like `:fa-solid-virus:` work because MarkBind pre-processes them into `<i>` elements before CustomViews renders. You can also directly include HTML tags like `<i class="fa-solid fa-virus"></i>` in the header.

### Syntax & Rules

**Structure:**
```html
<cv-tab id="tab-id">
  <cv-tab-header>Header content (supports HTML)</cv-tab-header>
  <cv-tab-body>Tab body content (optional)</cv-tab-body>
</cv-tab>
```

**Key Points:**
- `<cv-tab-header>` is the new element containing the header text/HTML. It takes precedence over the `header` attribute if both are present.
- `<cv-tab-body>` is optional and wraps the tab's content. You can also put content directly in `<cv-tab>` without a `<cv-tab-body>` wrapper.
- **HTML Support:** `<cv-tab-header>` accepts any HTML elements, including icons. When using MarkBind, icon shortcodes are pre-processed into `<i>` elements automatically. You can also include HTML directly (e.g., `<i class="fa-solid fa-virus"></i>`).
- The `header` attribute supports plain text only—for rich formatting and HTML, use `<cv-tab-header>`.
- If `<cv-tab-header>` exists but is empty, the tab ID is used as the fallback header label.

### Backward Compatibility

The new syntax is **fully backward compatible**. Your existing tab definitions with the `header` attribute will continue to work without any changes:

```html
<!-- Old syntax (still works) -->
<cv-tab id="tab1" header="My Header">Content</cv-tab>

<!-- New syntax (allows rich formatting) -->
<cv-tab id="tab2">
  <cv-tab-header>My <strong>Rich</strong> Header</cv-tab-header>
  <cv-tab-body>Content</cv-tab-body>
</cv-tab>

<!-- Mixed on the same page - no problem! -->
<cv-tabgroup id="mixed" nav="auto">
  <cv-tab id="old" header="Old Style">Old content</cv-tab>
  <cv-tab id="new">
    <cv-tab-header><em>New Style</em></cv-tab-header>
    <cv-tab-body>New content</cv-tab-body>
  </cv-tab>
</cv-tabgroup>
```


## Attributes & Options

### `<cv-tabgroup>` Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **(required)** | Unique identifier for the tab group. Tab groups with the same ID will synchronize. |
| `nav` | string | `"auto"` | Navigation display mode. Use `"auto"` to automatically generate navigation, or omit the attribute (defaults to auto). Use `"none"` to hide navigation. |

### `<cv-tab>` Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **(required)** | Unique identifier for the tab within its group. |
| `header` | string | Tab ID | Display label for the tab in the navigation bar. Plain text only (no icons or HTML). Use `<cv-tab-header>` for rich formatting. |

## Configuration

Tab groups work out of the box without any configuration—just use the `<cv-tabgroup>` and `<cv-tab>` elements in your HTML. The first tab will be shown by default.

However, you can optionally configure tab groups in your configuration file for additional features:

## Configuration

Tab groups work out of the box with no setup — just use the `<cv-tabgroup>` and `<cv-tab>` elements.  
By default, the first tab is shown.

For more control (such as widget integration or default selections), configure them in your `customviews.config.json`.

```json
{
  "config": {
    "defaultState": {
      "tabs": {
        "fruit": "apple"
      }
    },
    "tabGroups": [
      {
        "id": "fruit",
        "label": "Fruit Selection",
        "default": "apple",
        "tabs": [
          { "id": "apple", "label": "Apple" },
          { "id": "orange", "label": "Orange" },
          { "id": "pear", "label": "Pear" }
        ]
      }
    ],
  }
}
```

<box type="info">

**Note:** Configuration is completely optional. Tab groups will work perfectly fine without being added to the config file—they'll just default to showing the first tab and won't appear in the widget.
</box>


### Config File Options

#### TabGroupConfig

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **(required)** | Group identifier (must match HTML `cv-tabgroup` id). |
| `label` | string | - | Display name shown in the widget. |
| `tabs` | TabConfig[] | **(required)** | Array of tab configurations. |
| `default` | string | First tab | Default tab ID to show on initial load. |

#### TabConfig

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **(required)** | Tab identifier (must match HTML `cv-tab` id). |
| `label` | string | - | Display label for the tab (used in widget and as fallback for header). |

