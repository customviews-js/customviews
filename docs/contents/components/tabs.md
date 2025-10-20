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

<cv-tabgroup id="fruit" nav="auto">
  <cv-tab id="apple" header="Apple Types">

Apple types include **Granny Smith** and the **Cosmic Crisp**.

  </cv-tab>
  <cv-tab id="orange" header="Orange Types">

Orange types include the **Blood orange** and **Valencia orange**. 
  </cv-tab>
  <cv-tab id="pear" header="Pear">

Pear types include the **Asian pear** and the **European pear**
  </cv-tab>
</cv-tabgroup>

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

<cv-tabgroup id="fruit" nav="auto">
  <cv-tab id="apple" header="Apple Types :fab-windows:">

Apple types include **Granny Smith** and the **Cosmic Crisp**.

  </cv-tab>
  <cv-tab id="orange" header="Orange Types :fab-apple:">

Orange types include the **Blood orange** and **Valencia orange**. 
  </cv-tab>
  <cv-tab id="pear" header="Pear :fa-at:">

Pear types include the **Asian pear** and the **European pear**
  </cv-tab>
</cv-tabgroup>

</variable>
</include>


* **Synchronized Tab Groups** Multiple tab groups with the same `id` will automatically synchronize. When you switch tabs in one group, all other groups with the same ID will update simultaneously.
* E.g. Clicking "Orange" in the first group will automatically switch the second group to "Orange" as well.


## Multi-ID Tabs and Header Demarcation

You can create a single tab that appears under multiple tab IDs by specifying multiple IDs separated by spaces or `|`

* This will create three tabs ("apple", "orange", "pear") in the navigation bar, all showing the same content. 
* The `header` attribute can be demarcated with the `|` character to provide a separate label for each tab. If the number of header parts matches the number of IDs, each tab will use its corresponding header. If not, the first header or fallback label will be used for all.
* The content inside the tab is shared for all IDs listed.

**Example:**


<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cv-tabgroup id="fruit">
<cv-tab id="apple orange pear" header="Apple Header|Orange Header|Pear Header">
  Applicable to all fruits.
</cv-tab>
<cv-tab id="pear" header="Pear Header">
  Applicable to pear
</cv-tab>
</cv-tabgroup>
</variable>
<variable name="output">
<cv-tabgroup id="fruit">
<cv-tab id="apple orange" header="Apple Header|Orange Header">
  Applicable to apple and orange.
</cv-tab>
<cv-tab id="pear" header="Pear Header">
  Applicable to pear
</cv-tab>
<cv-tabgroup/>
</variable>
</include>



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
| `header` | string | Tab ID | Display label for the tab in the navigation bar. Supports text and font-awesome emojis. |

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

