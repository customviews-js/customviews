<frontmatter>
  title: CustomViews - Placeholders
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

## Simple Placeholders (Variable Interpolation)

`<cv-define-placeholder>`, `[[ variable_name ]]`

Placeholders allow you to create dynamic "Mad Libs" style documentation. Authors can define variables that readers can customize via the Settings Widget. The values entered by the reader are persisted and automatically update text, code blocks, and other content across the site.


## Usage

### 1. Define the Placeholder

Use the `<cv-define-placeholder>` component to register a variable. This component is **headless** (invisible in the content flow) but triggers an input field to appear in the Settings Widget under the "Variables" section.

```html
<cv-define-placeholder 
    name="username" 
    settings-label="Your Username" 
    settings-hint="Enter username" 
    default-value="default username"
></cv-define-placeholder>
```

<cv-define-placeholder 
    name="username" 
    settings-label="Your Username" 
    settings-hint="Enter username" 
    default-value="default username"
></cv-define-placeholder>

### 2. Use the Variable

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

## Escaping Syntax

You can "escape" the placeholder syntax if you want to display the literal brackets instead of a variable.

- **In Markdown Text**: Use two backslashes `\\[[ variable ]]`.
- **In Code Blocks**: Use one backslash `\[[ variable ]]`.

## Component Attributes

> [!NOTE]
> The variable input fields in the Settings Widget will **only** appear on pages where the `<cv-define-placeholder>` component is present.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | **Yes** | The unique identifier for the variable. Must act as the key for interpolation (e.g., `api_key`). |
| `settings-label` | string | No | The human-readable label shown in the Settings Widget. Defaults to the `name` if omitted. |
| `default-value` | string | No | The initial value to display if the user hasn't entered anything yet. |
| `settings-hint` | string | No | The ghost text shown inside the input box in the Settings Widget to guide the user. |

## Persistence

Values entered by the user are saved in the browser's `localStorage` (key: `cv-user-variables`). This means:
1. Values persist across page reloads.
2. Values persist when navigating between different pages of the documentation.


## Future Implementations?

Future directions for this component:

* Being able to define it through central json
* Support dynamic rendering:
    * Note that current implementation The DomScanner.scanAndHydrate is called during initialization without considering that dynamic content may be added later (e.g., via client-side rendering, lazy loading, or navigation). If placeholders are present in dynamically loaded content, they won't be processed. Consider providing a way to re-scan or automatically detect newly added content.
* Better UI?
* More intuitive author syntax?