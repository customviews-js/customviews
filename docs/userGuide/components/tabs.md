<frontmatter>
  title: User Guide - Tabs
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Tabs

`<cv-tabgroup>`
`<cv-tab>`

The **Tabs** component lets you define **mutually exclusive content sections** that users can toggle between — perfect for organizing platform-specific, step-based, or categorized documentation.  

When multiple tab groups (`<cv-tabgroup/>`) share the same `group-id` attribute, they stay synchronized automatically across the entire page.


<cv-tabgroup group-id="fruit" >
  
  <cv-tab tab-id="apple" header="Apple">
  
  **Apple Information**

  Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

  <box type="important" icon=":apple:">
      An apple a day keeps the doctor away!
  </box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
  **Orange Information**

  Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

  <box type="warning" icon=":orange:">
      The color orange was named after the fruit, not the other way around
  </box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
  **Pear Information**

  Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

  <box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
  </box>
  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
  </cv-tab-header>
  <cv-tab-body>

Apple types include **Granny Smith** and the **Cosmic Crisp**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="orange">
  <cv-tab-header>

:fa-solid-circle: Orange Types
  </cv-tab-header>
  <cv-tab-body>

Orange types include the **Blood orange** and **Valencia orange**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="pear">
  <cv-tab-header>

:fa-solid-leaf: Pear Types
  </cv-tab-header>
  <cv-tab-body>

Pear types include the **Asian pear** and the **European pear**
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>


<panel header="Code for above Tab Group">
<!-- ------------------------ CODE OUTPUT ---------------------------- -->

```html
<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple" header="Apple">
  
**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
</box>

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
  </cv-tab-header>
  <cv-tab-body>

  Apple types include **Granny Smith** and the **Cosmic Crisp**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="orange">
  <cv-tab-header>

:fa-solid-circle: Orange Types
  </cv-tab-header>
  <cv-tab-body>

  Orange types include the **Blood orange** and **Valencia orange**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="pear">
  <cv-tab-header>

:fa-solid-leaf: Pear Types
  </cv-tab-header>
  <cv-tab-body>
</cv-tabgroup>

```
</panel>

<br>


* **Single-Click Behavior** — Click once to switch tabs locally within that specific tab group only. The change is visual only and is not saved.
* **Double-Click Behavior** — Double-click to synchronize the tab selection across all tab groups with the same `id` on the page. The state is saved to browser storage and persists across page reloads.
* **Example:** If you have two tab groups both with `id="fruit"`, a single-click on "Orange" in the first group only changes that group locally. Double-clicking on "Orange" will sync both groups to show "Orange" and save the state.

## No-ID Tabs

Each tabgroup element should have a parent `id` attribute, while each tab element should have their own tab `id` as well.

However, if a tabgroup element does not have an `id` attribute, the tabgroup and children tabs will function as normal tabs. If the children tabs do not have `id` or `header` attributes, their headers will be enumerated.

For example:

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup>
<cv-tab>

  Tab 1 Content
</cv-tab>
<cv-tab>

  Tab 2 Content
</cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup>
<cv-tab>

  Tab 1 Content
</cv-tab>
<cv-tab>

  Tab 2 Content
</cv-tab>
</cv-tabgroup>
</variable>
</include>




## Multi-ID Tabs

You can create a single tab that represents multiple alternative IDs by specifying multiple IDs separated by spaces or `|`

* This will create **one tab** in the navigation bar that activates when **any** of the specified IDs is selected.
* The tab header displays the label of the first ID in the list (or the `header` attribute if provided).
* The content inside the tab is shared for all IDs listed.
* **Use case:** When multiple options (e.g., `python java`) present the same content, show a single tab instead of duplicates that might confuse readers into thinking the content differs.

<!-- ------------------------ CODE OUTPUT ---------------------------- -->


**Example:**

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python" header="Python">

Python is a high-level, interpreted programming language known for its simplicity and readability.

  </cv-tab>
  <cv-tab tab-id="java" header="Java">

Java is a statically-typed, compiled language known for its robustness and platform independence.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JavaScript">

JavaScript is a dynamic language primarily used for web development.

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python java" header="Python/Java Installation">

Both Python and Java are easy to install. Download from their official websites.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JS Installation">

Install JavaScript by downloading Node.js from nodejs.org.

  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python" header="Python">

Python is a high-level, interpreted programming language known for its simplicity and readability.

  </cv-tab>
  <cv-tab tab-id="java" header="Java">

Java is a statically-typed, compiled language known for its robustness and platform independence.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JavaScript">

JavaScript is a dynamic language primarily used for web development.

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="lang" >
  <cv-tab tab-id="python java" header="Python/Java Installation">

Both Python and Java are easy to install. Download from their official websites.

  </cv-tab>
  <cv-tab tab-id="javascript" header="JS Installation">

Install JavaScript by downloading Node.js from nodejs.org.

  </cv-tab>
</cv-tabgroup>
</variable>
</include>

<!-- ------------------------ CODE OUTPUT ---------------------------- -->


**Behavior:** In the second tab group, you'll see a single "Installation" tab in the navigation bar that becomes active when either Python or Java is selected in the first group. This avoids showing duplicate tabs with identical content.


## Setting the Default Tab

By default, the **first tab** in a group is selected when the page loads (unless the user has previously selected a different tab, in which case their selection is restored).

You can override this default behavior and specify which tab should be initially selected using the `customviews.config.json`, by adding a `default` property to the `tabGroup`.

**Default Tab Example Configuration:**
To make the "orange" tab selected by default for the "fruit" group:

```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "fruit",
        "default": "orange",
        "tabs": [...]
      }
    ]
  }
}
```

<br>


## Header Syntax with Rich Formatting

In addition to the standard `header` attribute, you can use an alternative syntax with `<cv-tab-header>` and `<cv-tab-body>` elements to enable **rich HTML formatting** in your tab headers.

This is useful when you need:
- **Bold, italic, or colored text** in headers
- **Icons or badges** alongside the header text
- **Complex nested elements** with custom styling
- **Multi-line or specially formatted headers**

**Key Points:**
- `<cv-tab-header>` is the recommended way to define headers. It takes precedence over the `header` attribute.
- **Icon Support:**
  - **Inside `<cv-tab-header>`:** Supports both MarkBind shortcodes (e.g., `:fa-user:`) and raw HTML. MarkBind processes the content automatically.
  - **Inside `header="..."` attribute:** Supports **raw HTML only** (e.g., `header='<i class="fa-solid fa-user"></i> Title'` to display an icon, and bold is `header='<strong>Important</strong>'`). MarkBind shortcodes **will not work** in attributes.
- **HTML Support:** Both methods support general HTML.
- If `<cv-tab-header>` exists but is empty, the tab ID is used as the fallback header label.


### Syntax & Rules

**Structure:**
```html
<cv-tab tab-id="tab-id">
  <cv-tab-header>Header content (supports HTML)</cv-tab-header>
  <cv-tab-body>Tab body content (both can be used together)</cv-tab-body>
  Tab body content (both can be used together)
</cv-tab>
```

<!-- ------------------------ HEADER EXAMPLES ---------------------------- -->

<panel header="### Basic Example">

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="docs" >
  <cv-tab tab-id="overview">
    <cv-tab-header><strong>Overview</strong></cv-tab-header>
    <cv-tab-body>
      Start here to learn the basics.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab tab-id="advanced">
    <cv-tab-header><em>Advanced Topics</em></cv-tab-header>
    <cv-tab-body>
      Dive deeper into powerful features.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup group-id="docs" >
  <cv-tab tab-id="overview">
    <cv-tab-header><strong>Overview</strong></cv-tab-header>
    <cv-tab-body>
      Start here to learn the basics.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab tab-id="advanced">
    <cv-tab-header><em>Advanced Topics</em></cv-tab-header>
    <cv-tab-body>
      Dive deeper into powerful features.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

</panel>

<panel header="### Advanced Example with Badges">

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup>
  <cv-tab header="active">
    <cv-tab-header>
      <strong>Active</strong> 
      <span style="color: green; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Currently active items are displayed here.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab header="archived">
    <cv-tab-header>
      <i>Archived</i> 
      <span style="color: gray; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Archived items are stored here for reference.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup>
  <cv-tab header="active">
    <cv-tab-header>
      <strong>Active</strong> 
      <span style="color: green; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Currently active items are displayed here.
    </cv-tab-body>
  </cv-tab>
  
  <cv-tab header="archived">
    <cv-tab-header>
      <i>Archived</i> 
      <span style="color: gray; margin-left: 0.5rem;">●</span>
    </cv-tab-header>
    <cv-tab-body>
      Archived items are stored here for reference.
    </cv-tab-body>
  </cv-tab>
</cv-tabgroup>
</variable>
</include>

</panel>

<panel header="### Using Icons in Headers">

Since `<cv-tab-header>` accepts HTML elements, you can include icons in multiple ways:

1. **Via MarkBind shortcodes** (when using MarkBind) — MarkBind pre-processes `:fa-solid-icon:` into `<i>` elements
2. **Via direct HTML** — Include Font Awesome `<i>` tags directly

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup group-id="status">
<cv-tab tab-id="enabled">
  <cv-tab-header>
  
  :fa-solid-virus: Enabled
  </cv-tab-header>
  <cv-tab-body>
    This feature is currently enabled and active.
  </cv-tab-body>
</cv-tab>

<cv-tab tab-id="disabled">
  <cv-tab-header>
  
  :fa-solid-virus-slash: Disabled
  </cv-tab-header>
  <cv-tab-body>
    This feature is currently disabled.
  </cv-tab-body>
</cv-tab>

  <cv-tab tab-id="pending">
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

<cv-tabgroup group-id="status">
<cv-tab tab-id="enabled">
<cv-tab-header>

:fa-solid-virus: Enabled
</cv-tab-header>
<cv-tab-body>

This feature is currently enabled and active.
</cv-tab-body>
</cv-tab>

<cv-tab tab-id="disabled">
<cv-tab-header>

:fa-solid-virus-slash: Disabled
</cv-tab-header>
<cv-tab-body>

This feature is currently disabled.
</cv-tab-body>
</cv-tab>

<cv-tab tab-id="pending">
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
<cv-tab tab-id="enabled" header="<i class='fa-solid fa-virus'></i> Enabled">
  <cv-tab-header><i class="fa-solid fa-virus"></i> Enabled</cv-tab-header>
  <cv-tab-body>This feature is enabled.</cv-tab-body>
</cv-tab>
```



**Note:** `<cv-tab-header>` accepts any HTML elements. Icon shortcodes like `:fa-solid-virus:` work because MarkBind pre-processes them inside the element content. For `header` attributes, you must use direct HTML tags like `<i class="fa-solid fa-virus"></i>` as MarkBind does not process attributes.

</panel>

<!-- ------------------------HEADER EXAMPLES END ---------------------------->

<br>


## Attributes & Options

### `<cv-tabgroup>` Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `group-id` | string | **(required)** | Unique identifier for the tab group. Tab groups with the same ID will synchronize. |
| `nav` | string | `"auto"` | Navigation display mode. Use `"none"` to hide navigation headers. |

### `<cv-tab>` Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `tab-id` | string | **(required)** | Unique identifier for the tab within its group. |
| `header` | string | Tab ID | Display label for the tab. Supports plain text and raw HTML (e.g., icons via `<i>` tags). Does not support MarkBind shortcodes. |

### `<cv-tab-header>` Attributes

No required attributes, just a container for the tab header content.

### `<cv-tab-body>` Attributes

No required attributes, just a container for the tab body content.

# Configuration

Tab groups work out of the box with no setup — just use the `<cv-tabgroup>` and `<cv-tab>` elements.  
By default, the first tab is shown.

For more control (such as settings integration or default selections), configure them in your `customviews.config.json`.

```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "fruit",
        "label": "Fruit Selection",
        "isLocal": false,
        "default": "apple",
        "tabs": [
          { "tabId": "apple", "label": "Apple" },
          { "tabId": "orange", "label": "Orange" },
          { "tabId": "pear", "label": "Pear" }
        ]
      },
      {
        "groupId": "localTabGroup",
        "label": "Page specific tabgroup",
        "isLocal": true,
        "default": "c",
        "tabs": [
          { "tabId": "a", "label": "Alpha" },
          { "tabId": "b", "label": "Beta" },
          { "tabId": "c", "label": "Charlie" }
        ]
      },
    ]
  }
}
```

### JSON Configuration Option Types

#### TabGroupConfig

The TabGroupConfig object is for defining tabgroups in JSON configuration.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `groupId` | string | **(required)** | Group identifier (must match HTML `cv-tabgroup` id). |
| `label` | string | - | Display name shown in the settings. |
| `description` | string | - | Optional description to display below functionality. |
| `isLocal` | boolean | `false` | Set to `true` to make the group only appear in the settings on pages where it's used. |
| `default` | string | - | The `tabId` of the tab that should be selected by default. |
| `tabs` | TabConfig[] | **(required)** | Array of tab configurations. |

#### TabConfig

The TabConfig object is for defining tabs in JSON configuration.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `tabId` | string | **(required)** | Tab identifier (must match HTML `cv-tab` id). |
| `label` | string | - | Display label for the tab (used in settings and as fallback for header). |



<box type="info">

**Note:** Configuration is completely optional. Tab groups will work fine without being added to the config file—they'll just default to showing the first tab and won't appear in the settings.
</box>


# Global vs. Local Tab Groups

By default, all tab groups defined in your configuration are **global**—they will appear in the settings on every page of your site.

You can mark a tab group as **local** to make it appear in the settings *only* on pages where that specific tab group is actually used. This is useful for keeping the settings clean and only showing relevant options to the user.

To mark a tab group as local, add `"isLocal": true` to its configuration.

**Example:**

For example, this tab group is only specific to this page:

<cv-tabgroup group-id="ltab">
<cv-tab tab-id="lt1">
  Tab 1
</cv-tab>
<cv-tab tab-id="lt2">
  Tab 2
</cv-tab>
<cv-tab tab-id="lt3">
  Tab 3
</cv-tab>
</cv-tabgroup>

<panel header="Code for above Tab Group">

```html
<cv-tabgroup group-id="ltab">
<cv-tab tab-id="lt1">
  Tab 1
</cv-tab>
<cv-tab tab-id="lt2">
  Tab 2
</cv-tab>
<cv-tab tab-id="lt3">
  Tab 3
</cv-tab>
</cv-tabgroup>
```
</panel>

<br>

By setting it as **local** in the configuration, the "Local Tab Configuration" option will only show up in the settings on pages containing that tab group.

If all tab configurations (and other component configurations) are local, and a given page has no configured elements, neither the modal nor the modal icon will appear.

**Configuration file** setting this option:
```json
{
  "config": {
    "tabGroups": [
      {
        "groupId": "ltab",
        "label": "Local Tab Configuration",
        "isLocal": true, // This makes the group local
        "tabs": [
          { "tabId": "lt1", "label": "Tab Option 1" },
          { "tabId": "lt2", "label": "Tab Option 2" },
          { "tabId": "lt3", "label": "Tab Option 3" }
        ]
      },
    ]
  }
}
```


# Defining Local Components

You can ensure that specific local tab groups are always available in the settings, even if they are not initially visible on the page. This is useful for tab groups that are loaded dynamically (e.g., inside a dropdown menu) and might not be detected by the plugin otherwise.

To do this, add a `data-cv-page-local-tabs` attribute to any element (an empty `<div>` is a good choice). The value of this attribute should be a comma-separated list of the local tab group IDs you want to register.

For example, to make the local tab groups with IDs `OS` and `language` available in the settings, add the following to your page:

```html
<div data-cv-page-local-tabs="OS, language"></div>
```

This will ensure that the specified local tab groups appear in the configuration settings, allowing users to control them even if they are not immediately visible on the page.
