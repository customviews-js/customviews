<frontmatter>
  title: CustomViews - Placeholders
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Simple Placeholders (Variable Interpolation)

`\[[ variable_name ]]`

Placeholders allow you to create dynamic "Mad Libs" style documentation. Authors can define variables that readers can customize via the Settings Widget. The values entered by the reader are persisted and automatically update text, code blocks, and other content across the site.


## Usage

### Define the Placeholder

Placeholders are defined in your `customviews.config.json` under the `placeholders` key.

```json
{
  "config": {
    "placeholders": [
       { "name": "username", "settingsLabel": "Your Username", "settingsHint": "Enter username" },
       { "name": "api_key", "settingsLabel": "API Key", "isLocal": true }
    ]
  }
}
```


### Use the placeholder
To use the variable in your content, wrap the variable name in double square brackets: `[[ variable_name ]]`.

For example, we write `Hello, \[[username]]` here:

```markdown
Hello, \[[username]]! 
↓ 
Hello, [[username]]!
```

The system scans the page and replaces these tokens with the current value. When the user updates the value in the settings, all instances on the page update immediately.


### Inline Fallback

You can provide a fallback value directly in the usage syntax. This is useful if you haven't defined a formal placeholder or want a specific default for one instance.

```markdown
Contact us at \[[ email : support@example.com ]]
↓ 
Contact us at [[ email : support@example.com ]]
```

If the user has not set a value for `email`, "support@example.com" will be displayed.

**Note**: Placeholders resolve their displayed value by first using user-set values if available, registered defaults, inline feedback and lastly raw placeholder names, i.e. `\[[name]]`.

> Empty strings (`""`) are treated as "not set" and will fall through to the next resolution level. This means clearing a placeholder value in the settings will cause it to display the registry default or inline fallback instead of showing nothing.


### Manual Component Usage

For more control, you can use the internal custom element directly:

```html
<cv-placeholder name="email" fallback="support@example.com"></cv-placeholder>
```

This is functionally equivalent to `[[ email : support@example.com ]]` but can be useful when you need to ensure the element exists in the DOM structurally or when working within other HTML constructs that might interfere with text scanning.

## Attribute Interpolation

In addition to text, you can interpolate variables into HTML attributes, such as `href` or `src`. This is useful for creating dynamic links or loading images based on user preferences.

**Requirements:**
1. You must use standard HTML syntax (e.g., `<a href="...">`) rather than Markdown links.
2. You must add the `class="cv-bind"` (or `data-cv-bind`) attribute to the element. This signals the system to scan the element's attributes.

### Examples

**Dynamic Query Parameter:**

```html
<!-- Use it in a link -->
<a href="https://www.google.com/search?q=[[searchQuery]]" class="cv-bind">
  Search Google for '\[[searchQuery]]'
</a>
```

This renders into: 
<a href="https://www.google.com/search?q=[[searchQuery]]" class="cv-bind">
  Search Google for '[[searchQuery]]'
</a>



If the user sets `searchQuery` to `hello world`, the link becomes `https://www.google.com/search?q=hello%20world`.


<br>

> **Automatic Encoding**: Variables used in `href` and `src` attributes are automatically URL-encoded using `encodeURIComponent` to ensure valid URLs.

> **Note**: The `class` attribute is **excluded** from placeholder binding to prevent conflicts with dynamic class manipulation by JavaScript or CSS frameworks. If you need dynamic classes, use JavaScript or CSS to add/remove classes instead.
> Or raise an issue to explore the use case!

**Dynamic Image Source:**

```html
<img src="https://example.com/assets/[[theme]].png" class="cv-bind" alt="Theme Preview" />
```

## Inline Editing

You can allow users to edit placeholders directly on the page (without opening the settings menu) using the `<cv-placeholder-input>` component.

```html
<cv-placeholder-input name="username" label="Enter your username"></cv-placeholder-input>
```

This component is fully two-way bound. Typing in it will instantly update all `[[username]]` occurrences on the page, and changing the value in the settings menu will update this input.

**Example:**

<cv-placeholder-input name="username" label="Who are you?" hint="Type here..."></cv-placeholder-input>

Hello, [[ username : Guest ]]!

Google search for <a href="https://www.google.com/search?q=[[username]]" class="cv-bind"> [[username]] </a>


## Configuration

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | **Required**. Unique identifier (e.g., `api_key`). |
| `settingsLabel` | `string` | Display label in Settings. |
| `settingsHint` | `string` | Helper text in input field. |
| `defaultValue` | `string` | Initial value if unset. |
| `isLocal` | `boolean` | If `true`, the input field only appears in Settings when the placeholder is actually used on the current page. |

## Escaping Syntax

You can "escape" the placeholder syntax if you want to display the literal brackets instead of a variable.

- **In Markdown Text**: Use two backslashes `\\[[ variable ]]`.
- **In Code Blocks**: Use one backslash `\[[ variable ]]`.

## Tab Group Binding & Integration

You can bind a **Tab Group** directly to a placeholder variable in your `customviews.config.json`. This allows the variable to update automatically when the user switches tabs.

```json
"tabGroups": [
  {
    "groupId": "fruit",
    "label": "Fruit Selection",
    "description": "Select your favorite fruit.",
    "isLocal": false,
    "default": "pear",
    "placeholderId": "fruit",
    "tabs": [
      {"tabId": "apple","label": "Apple", "placeholderValue": "apple"},
      {"tabId": "orange","label": "Orange", "placeholderValue": "orange"},
      {"tabId": "pear","label": "Pear", "placeholderValue": "pear"}
    ]
  }
]
```

<box>
    
#### Live Demo

Double click a tab below to update the variable.

<cv-tabgroup group-id="fruit">
    <cv-tab tab-id="apple"> I love apples. </cv-tab>
    <cv-tab tab-id="orange"> I love oranges. </cv-tab>
    <cv-tab tab-id="pear"> I love pears. </cv-tab>
</cv-tabgroup>

[[ fruit ]]

My favourite fruit is `[[fruit]]`, and it updates automatically!


</box>


## Persistence

Values entered by the user are saved in the browser's `localStorage` (key: `cv-user-variables`). This means:
1. Values persist across page reloads.
2. Values persist when navigating between different pages of the documentation.



