<frontmatter>
  title: Installation (MarkBind Setup)
  layout: userGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

# Setting up CustomViews in a MarkBind Site

CustomViews integrates seamlessly with [MarkBind](https://markbind.org) via a simple plugin setup.  
This allows you to declaratively toggle content visibility, manage tab groups, and personalize documentation — directly within your static site.

---

## 1. Create the Plugin File

In your MarkBind project root, create a new folder named `/_markbind/plugins/` if it doesn’t already exist.  
Then, add a file named **`customviews.js`** inside it with the following content:

```js
/**
 * CustomViews Plugin for MarkBind
 * Injects the CustomViews auto-init script into every page.
 * Configuration is loaded from /customviews.config.json
 * Add data-base-url="/website-baseurl"
 */
function getScripts() {
  return [
    '<script src="https://unpkg.com/@customviews-js/customviews"></script>'
  ];
};

module.exports = { getScripts };
```

<box type="info">


Note: Depending on your MarkBind JS environment, if you are operating in an ESM environment (e.g. there is a parent ESM `package.json` file), the plugin needs to be written in ESM format. If that is the case, try this the ESM format instead:

```js
function getScripts() {
return [
'<script src="../../../dist/custom-views.min.js"></script>'
];
}

export { getScripts };
```

This is a current limitation of MarkBind which only operates in CJS formats, which may cause compatibility issues when operating in cross CJS and ESM environments. 

</box>


This plugin automatically injects the CustomViews runtime into every generated page during the build process.


## 2. Register the Plugin in site.json

In your project’s root `site.json`, register the plugin by adding `"customviews"` to the plugins list.

```json
{
  "plugins": [
    "customviews"
  ]
}
```

> Make sure the file name (customviews.js) exactly matches the plugin name (customviews) declared in site.json.

## 3. Create customviews.config.json

At your project root, create a `customviews.config.json` file to define your toggles, tab groups, and widget options.

```json
{
  "config": {
    "allToggles": ["mac", "linux", "windows"],
    "defaultState": {
      "toggles": ["mac"],
      "tabs": {
        "fruit": "apple"
      }
    },
    "tabGroups": [
      {
        "id": "fruit",
        "label": "Fruit Selection",
        "tabs": [
          { "id": "apple", "label": "Apple" },
          { "id": "orange", "label": "Orange" },
          { "id": "pear", "label": "Pear" }
        ]
      }
    ]
  },
  "baseUrl": "website-baseUrl",
  "widget": {
    "showWelcome": true
  },
}
```

This file tells CustomViews which toggles and tab groups are available, and configures how the floating widget behaves.

## 4. Verify Installation

After saving, run your MarkBind site locally:

```
markbind serve
```

If everything is configured correctly, you should see the CustomViews widget floating on your site.
Try toggling between views or switching tabs to confirm your setup is working.

## Example Usage in MarkBind Pages

Now you can declaratively use CustomViews attributes directly in your .md or .mbd files.

```html
<!-- Toggle-based content -->
<div data-cv-toggle="mac">
  <p>Shown only for macOS users 🍎</p>
</div>

<div data-cv-toggle="windows">
  <p>Shown only for Windows users 🪟</p>
</div>

<!-- Tab group example -->
<cv-tabgroup group-id="fruit" nav="auto">
  <cv-tab tab-id="apple" header="Apple">Apple info here...</cv-tab>
  <cv-tab tab-id="orange" header="Orange">Orange info here...</cv-tab>
  <cv-tab tab-id="pear" header="Pear">Pear info here...</cv-tab>
</cv-tabgroup>
```

CustomViews will automatically handle visibility, persistence, and synchronization across all tabs and toggles.
