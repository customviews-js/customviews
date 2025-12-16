# Release Workflow

## Prerequisites
*   **Login to NPM**: Ensure you are authenticated.
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