{% set title = "Making Releases" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# Release Workflow

## Prerequisites
* Ensure you have NPM access to the organization and package on NPM to make releases for CustomViews. [NPM Link](https://www.npmjs.com/package/@customviews-js/customviews).
* **Login to NPM**: Ensure you are authenticated.

```sh
npm login
# OR ensure you have an access token configured in .npmrc
```

## 1. Beta Release (Experimental)
Use for testing new features.

```sh
# 1. Bump version (e.g., 1.4.0 -> 1.4.1-beta.0)
npm run bump:beta

# 2. Release to NPM (@beta tag)
npm run release:beta
```
* Note that running `npm run bump:beta` will update the release version to the next beta version, incrementing the beta version number if the last release was a beta release.
* `npm version prerelease --preid=beta` creates a release commit and tag, but does not automatically publish to NPM.
* `npm run release:beta` will publish the release to NPM with the `@beta` tag.

### Using the beta release

To use the beta release from CDNs, the script tag should be updated to use the beta version.

For example,

unpkg:

```html
<script src="https://unpkg.com/@customviews-js/customviews@beta"></script>
```

jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@customviews-js/customviews@beta"></script>
```

## 2. Production Release (Stable)
Use when beta is stable and ready for everyone.

```sh
# 1. Bump version (e.g., 1.4.1-beta.x -> 1.4.1)
npm run bump:patch
# OR: npm run bump:minor / npm run bump:major

# 2. Release to NPM (@latest tag)
npm run release:prod
```

> **Note:** The `release:*` commands automatically run `npm run build` before publishing.


### Using the production release

To use the production release from CDNs, the script tag should be updated to use the production version.

For example,

unpkg:

```html
<script src="https://unpkg.com/@customviews-js/customviews@latest"></script>
```

jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@customviews-js/customviews@latest"></script>
```
  