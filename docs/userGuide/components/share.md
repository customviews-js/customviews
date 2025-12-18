<frontmatter>
  title: User Guide - Sharing
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Share Mode & Focus View

CustomViews provides a powerful way to share specific content from a page. "Share Mode" allows you to select exactly what you want to highlight, and "Focus View" (or Presentation View) displays that content to the recipient, filtering out distractions.

## Sharing Content

### 1. Activating Share Mode
To activate Share Mode, click the **floating share button** located at the bottom right of the screen. A floating bar will appear at the bottom, and the page becomes interactive for selection.

### 2. Selecting Elements
Hover over any part of the page to see it highlighted.
- **Click to Select**: Click any highlighted element to select it. It will turn green.
- **Click to Deselect**: Click a selected element again to remove it.
- **Multiple Selection**: You can select as many different sections of the page as you need.

### 3. Smart Selection Guidelines

- **Parent Selection**: If you select a large container (like a whole section), individual items inside it are automatically included. You cannot select a child element separately if its parent is already selected.
- **"Up" Button**: When hovering over an element, a small helper tooltip appears. Click the **"↰" (Up Arrow)** button in this tooltip to quickly select the parent container instead of the specific element.
- **Direct Selection**: The tooltip also has a **"✓" (Tick)** button to select the current element without clicking it directly—useful for precise selection.

### 4. Generating the Link
Once you have selected one or more items, use the floating bar at the bottom:

- **Preview**: Click **"Preview"** to open the generated link in a new tab immediately. This lets you verify exactly what the recipient will see.
- **Generate Link**: Click **"Generate Link"** to copy the unique link to your clipboard.

### Exiting
To leave Share Mode, click the **"Exit"** button on the floating bar, press the **`Esc`** key, or click the floating share button again.

---

## Focus View (Recipient Experience)

When someone opens the link you generated, they enter **Focus View**.

- **Distraction-Free**: Only the elements you selected (and their necessary context) are shown. Irrelevant content is hidden.
- **Context Indicators**: Where content has been hidden, you will see markers like `... 3 sections hidden ...`.
- **Expandable Context**: Clicking on these markers reveals the hidden content, allowing the viewer to see more context if needed.
- **Exit Focus**: A banner at the top of the page reminds the user they are in a focused view. They can click **"Show Full Page"** to return to the normal website view.

## Customizing Share Behavior ( TO REFINE )
Website authors can customize which elements are excluded from selection (e.g., sidebars, headers) by configuring `shareExclusions` in their `customviews.config.js` file.

```json
{
  "shareExclusions": {
    "tags": ["NAV", "FOOTER"],
    "ids": ["my-private-sidebar"]
  }
}
```


