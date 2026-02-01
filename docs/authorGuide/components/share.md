<frontmatter>
  title: Author Guide - Sharing
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Focused Views

CustomViews provides a powerful way to share specific content from a page. "Share Mode" allows you to select exactly what you want to highlight, and "Focus View" (or Presentation View) displays that content to the recipient, filtering out distractions.

## Share Mode

### Types ofSharing

There are three modes of sharing:

* **Show**: Generates a custom view that shows *only* the specific elements you selected. All other content is hidden.
* **Hide**: Generates a view that hides the selected elements. All others are shown.
* **Highlight**: Generates a view that keeps the full page but **visually outlines** the selected elements in red with an arrow indicator. This is ideal for pointing out specific sections without losing the surrounding context.

To toggle between modes, use the floating toolbar at the bottom of the page in share mode.

### Toggling Share Mode

There are two ways to toggle Share Mode:

#### Settings Toggle

To access share mode, you can open the settings dialog and click the "Share" tab, and click 'select elements to share'.

#### Link Toggle

You can trigger the Share Mode UI in headless mode directly via URL links. This is useful if you do not wish to use any other features of CustomViews, such as the settings dialog, which you can disable.

* Two modes are supported, through the hash and query parameters. 
* Note that clicking on the query parameter link will refresh the page.

| Trigger (Hash) | Trigger (Query) | Mode Activated |
| :--- | :--- | :--- |
| `#cv-share` | `?cv-share` | Opens Share Mode (default mode, which is share mode) |
| `#cv-share-show` | `?cv-share-show` | Opens Share Mode in **Show** mode |
| `#cv-share-hide` | `?cv-share-hide` | Opens Share Mode in **Hide** mode |
| `#cv-share-highlight` | `?cv-share-highlight` | Opens Share Mode in **Highlight** mode |

**Example:**
To create a link that toggle the highlight mode through the links:

[Default Mode (Hash)](#cv-share) (through `[Default Mode (Hash)](#cv-share)`)

[Highlight Mode (Hash)](#cv-share-highlight) (through `[Highlight Mode (Hash)](#cv-share-highlight)`)

[Show Mode (Hash)](#cv-share-show) (through `[Show Mode (Hash)](#cv-share-show)`)

[Hide Mode (Hash)](#cv-share-hide) (through `[Hide Mode (Hash)](#cv-share-hide)`)

[Highlight Mode (Query)](./share.md?cv-share-highlight) (through `[Highlight Mode (Query)](./share.md?cv-share-highlight)`)


### Selecting Elements

Hover over any part of the page to see it highlighted.

- **Click to Select**: Click any highlighted element to select it. A border will be shown around it.
- **Click to Deselect**: Click a selected element again to remove it.
- **Multiple Selection**: You can select as many different sections of the page as you need.

If you select a large container, all of its children are automatically selected. You cannot select a child element separately if its parent is already selected.

<box type="info" dismissible>
  You can also drag in share mode to select multiple elements at one time.
</box>


**Helper Tooltip:**

* When hovering over an element, a small helper tooltip appears. Click the **"↰" (Up Arrow)** button in this tooltip to quickly select the parent container instead of the specific element.
* The tooltip also has a **"✓" (Tick)** button to select the current element without clicking it directly.


### Generating Share Link

Once you have selected one or more items, use the floating bar at the bottom:

- **Preview**: Click **"Preview"** to open the generated link in a new tab immediately. This lets you verify exactly what the recipient will see.
- **Generate Link**: Click **"Generate Link"** to copy the unique link to your clipboard.

<div id="example-share">

#### Manual URL Link Construction

While the Share Mode UI generates robust, encoded links automatically, you may sometimes want to manually create a readable link for documentation or communication.

CustomViews supports a human-readable format using HTML element IDs:

| Parameter | format | Description |
| :--- | :--- | :--- |
| `cv-show` | `id1,id2` | **Shows** only the specified elements. All others are hidden. (Replaces legacy `cv-focus`) |
| `cv-hide` | `id1,id2` | **Hides** the specified elements. All others are shown. |
| `cv-highlight` | `id1,id2` | **Highlights** the specified elements. Full page remains visible. |

**Example:**
To show only the `#setup` and `#config` sections:
`https://yoursite.com/guide.html?cv-show=setup,config`

* For example, one such link could be [this](./share.html?cv-highlight=example-share): `[this](./share.html?cv-highlight=example-share)`

**Note:**
* IDs are case-sensitive.
* Use `,` (comma), or use `+` (plus sign) to separate multiple IDs.
* Note that `,` will be URL-encoded to `%2C` when used in a URL, after visiting the page. 
* If an ID contains special characters, it should be URL-encoded, but standard alphanumeric IDs work directly.

</div>

### Exiting Share Mode

To leave Share Mode, click the **"Exit"** button on the floating bar.

<box type="info" dismissible>

  You can also press the **`Esc`** key to exit Share Mode.
</box>


## Focus Mode

When someone opens the link you generated, they enter **Focus View**. This allows them in each mode:

* Show Mode: Only the elements you selected (and their necessary context) are shown. Irrelevant content is hidden.
* Hide Mode: The selected elements are hidden, while the rest of the page remains visible.
* Highlight Mode: The selected elements are highlighted in red with an arrow indicator, while the rest of the page remains visible.

For show or hide mode, where content has been hidden, you will see markers like `... 3 sections hidden ...`. Clicking on these markers reveals the hidden content, allowing the viewer to see more context if needed.

Additionally, a banner at the top of the page reminds the user they are in a focused view. They can click **"Show Full Page"** to return to the normal website view.




## Configurations

### Customizing Share Behavior ( WIP )
Website authors can customize which elements are excluded from selection (e.g., sidebars, headers) by configuring `shareExclusions` in their `customviews.config.js` file.

```json
{
  "shareExclusions": {
    "tags": ["NAV", "FOOTER"],
    "ids": ["my-private-sidebar"]
  }
}
```


