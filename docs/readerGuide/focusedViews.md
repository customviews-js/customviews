<frontmatter>
  title: "Focused Views"
  layout: "readerGuide.md"
  pageNav: 3
</frontmatter>

# Focused Views

CustomViews allows content to be shared in a focused, distraction-free mode. This is particularly useful for sharing specific steps in a tutorial, a single API endpoint definition, or a particular policy clause.

## Focus View Experience

When you open a shared link, you enter **Focus Mode**:

*   **Highlighted Content**: Only the selected content is displayed.
*   **Hidden Context**: Surrounding content is hidden, replaced by expandable delimiters (e.g., `... 3 sections hidden ...`).
*   **Focus Banner**: A blue banner at the top indicates you are viewing a filtered version of the page.

### Navigation

*   **Expand Sections**: Click on any "hidden sections" marker to reveal the content in that specific area.
*   **Show Full Page**: Click "Show Full Page" on the top banner (or the floating action button) to exit Focus Mode and see the entire document.

## Advanced: Readable URLs

While generated links typically use an encoded format (e.g., `?cv-focus=ey...`), CustomViews also supports human-readable URLs for easier sharing.

If you know the **ID** of the element you want to share, you can construct a URL manually:

* `https://example.com/page.html?cv-focus=introduction,installation`


This would focus **only** the elements with IDs `#introduction` and `#installation`. 

**Note on separators:** IDs are separated by **commas**.
So `cv-focus=introduction,installation` is interpreted as the list `["introduction", "installation"]`.

For example, try `https://customviews-js.github.io{{baseUrl}}?cv-focus=customviews` at this [link](https://customviews-js.github.io{{baseUrl}}?cv-focus=customviews).
