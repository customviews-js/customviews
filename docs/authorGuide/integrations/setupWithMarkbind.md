<frontmatter>
  title: Installation (MarkBind Setup)
  layout: authorGuide.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

# Setting up CustomViews in a MarkBind Site

CustomViews integrates seamlessly with [MarkBind](https://markbind.org) via a simple plugin setup.  
This allows you to declaratively toggle content visibility, manage tab groups, and personalize documentation — directly within your static site.

---

## Create the Plugin File

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
    "toggles": [
      {"toggleId": "mac","label": "MacOS", "description": "Show content for macOS users", "default": "peek"},
      {"toggleId": "linux","label": "Linux", "description": "Show content for Linux users"},
      {"toggleId": "windows","label": "Windows", "default": "show"}
    ],
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
    ],
    "placeholders": [
       { "name": "username", "settingsLabel": "Your Username", "settingsHint": "Enter username", "defaultValue": "Guest" },
    ]
  },
  "baseUrl": "/customviews",
  "storageKey": "cv-docs-beta",
  "settings": {
    "panel": {
      "title": "Custom Views Settings Dialog",
      "description": "Toggle different content sections to customize your view."
    },
    "callout": {
      "show": true,
      "enablePulse": true,
      "message": "Open the CustomViews settings to customize your view.",
      "backgroundColor": "#198755",
      "textColor": "#ffffff"
    },
    "icon": {
      "position": "middle-left",
      "color": "#ffffff",
      "backgroundColor": "#198755",
      "opacity": 0.9,
      "scale": 1.1
    }
  }
}
```


After saving, run your MarkBind site locally:

```
markbind serve
```

If everything is configured correctly, you should see the CustomViews widget floating on your site. Try toggling between views or switching tabs to confirm your setup is working. CustomViews will automatically handle visibility, persistence, and synchronization across all tabs and toggles.
