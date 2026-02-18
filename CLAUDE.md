# CLAUDE.md — CustomViews

## Project Overview

`@customviews-js/customviews` is a framework-agnostic JavaScript library that lets page authors
define toggleable sections, synced tab groups, and interpolated placeholders via custom HTML elements.
It auto-initializes from a `<script>` tag, reads a JSON config, and renders a settings widget —
no programmatic API is exposed (`src/index.ts` is empty).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict) |
| Reactivity | Svelte 5 Runes (`.svelte.ts` files use `$state`/`$derived`/`$effect`) |
| Components | Svelte 5 SFCs — compiled as **Web Components** *or* regular components |
| Bundler | Rollup (UMD output) — two `svelte()` plugin passes (see `rollup.config.js`) |
| Tests | Vitest + jsdom |
| Lint/Format | ESLint 9 flat config + Prettier |
| Docs site | MarkBind (in `docs/`) |
| Package mgr | npm |

## Directory Map

```
src/
  browser.ts             # Entry point — auto-init from <script> tag
  lib/
    runtime.svelte.ts    # AppRuntime — lifecycle orchestrator
    registry.ts          # Registers all custom elements
    app/                 # UI layer: UIRoot.svelte, ui-manager.ts, icons/
    features/            # Self-contained feature modules:
      focus/             #   Focus/show mode
      highlight/         #   Element highlight overlay
      notifications/     #   Toast system
      placeholder/       #   [[ var : fallback ]] interpolation
      render/            #   Asset rendering (AssetsManager)
      settings/          #   Settings icon, modal, intro callout
      share/             #   Share/selection overlay
      tabs/              #   <cv-tabgroup>, <cv-tab>, etc.
      toggles/           #   <cv-toggle> custom element
      url/               #   URL action routing (Strategy pattern)
    stores/              # Global reactive singletons (4 stores)
    types/               # TypeScript type definitions
    utils/               # Helpers (DOM, clipboard, URL, init, scroll, PersistenceManager (localStorage wrapper))
tests/                   # Mirrors src/ structure
docs/                    # MarkBind documentation site
dist/                    # Built UMD bundles + generated .d.ts
```

## Path Aliases (tsconfig.json)

- `$lib` → `src/lib`
- `$features` → `src/lib/features`
- `$ui` → `src/lib/components/ui`

## Essential Commands

```sh
npm install              # Setup
npm run build            # Clean + emit .d.ts + Rollup bundle
npm run dev              # Rollup watch mode
npm run test             # vitest run --reporter verbose
npm run lint             # eslint .
npm run lint:fix         # eslint . --fix
npm run format:check     # prettier --check .
```

## Initialization Chain

`browser.ts:16` → `initializeFromScript()` → fetches config → `new AppRuntime()` →
`runtime.init()` (sets up `$effect.root` for URL/persistence sync + MutationObserver) →
`initUIManager()` mounts `UIRoot.svelte` into `document.body`.

## Key Singletons (src/lib/stores/)

| Store | File | Purpose |
|-------|------|---------|
| `activeStateStore` | `active-state-store.svelte.ts` | Config + mutable user state (toggles, tabs) |
| `elementStore` | `element-store.svelte.ts` | Tracks which custom elements are in the DOM |
| `uiStore` | `ui-store.svelte.ts` | UI panel options (title, theme, showReset) |
| `derivedStore` | `derived-store.svelte.ts` | Cross-store derived values (menuToggles, etc.) |

Feature-specific: `placeholderRegistryStore`, `placeholderValueStore`, `shareStore`, `focusStore`, `toast`

## Testing Notes

- Vitest runs with jsdom — Svelte compiler transforms do NOT apply to `.svelte.ts` in tests.
- Tests manually polyfill Runes: `globalThis.$state = (v) => v`, etc.
- Use `vi.mock()` for module-level mocking of store singletons.

## Svelte 5 Runes

- Use `$state`, `$derived`, `$derived.by`, `$effect` — never legacy Svelte stores.
- `.svelte.ts` extension is required for files using Runes outside components.
- `$effect.root()` creates standalone reactive scopes (see `runtime.svelte.ts:125`).

## Custom Elements

All prefixed `cv-`: `<cv-toggle>`, `<cv-tabgroup>`, `<cv-tab>`, `<cv-tab-header>`,
`<cv-tab-body>`, `<cv-placeholder>`, `<cv-placeholder-input>`.
Components self-register into stores on mount (e.g., `Toggle.svelte:38` calls `elementStore.registerToggle()`).

## Additional Documentation

Check these files when working on related topics:

| Topic | File |
|-------|------|
| Architectural patterns & conventions | `.claude/docs/architectural_patterns.md` |
| Existing AI collaboration guide | `AGENTS.md` |
| MarkBind docs site | `docs/` |
