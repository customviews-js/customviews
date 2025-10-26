# Copilot / AI contributor notes — CustomViews

This file gives focused, actionable knowledge to help an AI agent be productive in this repository.

Keep responses short and use these concrete references when changing behavior.

1) Big-picture architecture (what to change and where)
- Core runtime: `src/core/core.ts` — manages state, applies visibility, renders assets and tabs.
- Widget/UI: `src/core/widget.ts` — floating widget, modal UI, shares state with core via public core API.
- Library glue: `src/lib/custom-views.ts` and `src/index.ts` — public API and init helpers.
- Auto-init entry: `src/entry/browser-entry.ts` — reads script tag attributes, fetches `customviews.config.json`, initializes core and widget, and emits `customviews:ready`.
- Asset management and rendering: `src/core/assets-manager.ts` and `src/core/render.ts` (use these to load/insert assets into DOM).
- Types: `src/types/types.ts` — canonical shapes (Config, State, CustomViewAsset, TabGroupConfig).

2) Important flows & invariants to preserve
- Initialization: browser-entry runs on DOMContentLoaded and guards with `window.__customViewsInitInProgress` and `window.__customViewsInitialized` to avoid races. Respect these flags.
- Base URL precedence: script `data-base-url` overrides config file `baseURL`. Use `utils/url-utils.ts` helpers (`prependBaseUrl`) when manipulating paths.
- Asset `src` values that are relative must be prepended with the effective `baseURL` (AssetsManager already does this).
- Visibility selection priority: URL state > persisted localStorage > config.defaultState. Keep this ordering when changing core behavior.

3) Key public APIs, globals and events (use these for integration)
- Globals when loaded in browser: `window.CustomViews`, `window.CustomViewsWidget`, `window.customViewsInstance` (contains { core, widget? }). See `src/index.ts`.
- Important CustomEvents:
  - `customviews:ready` — dispatched by auto-init with detail { core, widget } (see `browser-entry.ts`).
  - `customviews:tab-change` — dispatched when a tab group selection changes (see `core/core.ts`).
- URL helpers: `URLStateManager.generateShareableURL` and `URLStateManager.parseURL` are used by widget and core. Prefer them when producing or parsing shared URLs.

4) HTML attributes and compatibility
- Visibility attributes supported (both old & new): `data-cv-toggle` and `data-customviews-toggle`.
- Asset insertion attributes: `data-cv-id` and `data-customviews-id` (core will render assets into elements with these ids when their toggle is active).
- Script tag attributes for auto-init: `data-base-url` and `data-config-path` (default `/customviews.config.json`). Example:

```html
<script src="/path/to/custom-views.min.js" data-base-url="/customviews" data-config-path="/my-config.json"></script>
```

5) Config file shape (discoverable fields)
- `customviews.config.json` (see `docs/_site/customviews.config.json`) contains:
  - `config` (object) — { allToggles: string[], defaultState: { toggles: string[] }, tabGroups?: TabGroupConfig[] }
  - `assetsJsonPath` (string) — relative or absolute path to assets JSON
  - `baseUrl` (string) — site base used when not overridden by script
  - `widget` (object) — { enabled?: boolean, position?, theme?, showReset?, showWelcome?, ... }

6) Developer workflows (commands to run)
- Build library (produce types + bundles): `npm run build` (runs `rimraf dist && tsc && rollup -c`).
- Dev watch bundle: `npm run dev` (rollup in watch mode).
- Run unit tests: `npm test` (Projects use Vitest).
- Docs (MarkBind-based): See `docs/README.md` — run `markbind serve` inside `docs/` to preview the site.

7) Code patterns & conventions to follow
- Minimal runtime dependencies: prefer native DOM APIs and small util functions. Avoid adding heavy deps for small tasks.
- Side-effects: initialization should remain idempotent and guarded. If adding new global state, use the existing `window.__customViews*` pattern.
- Styling: styles are injected at runtime via functions like `injectCoreStyles` and `injectWidgetStyles` — if adding new CSS, provide an injector.
- Backwards compatibility: preserve support for `data-customviews-*` legacy attribute names when updating attribute logic.

8) Edge cases and gotchas (what agents often break)
- Config fetch failures: browser-entry falls back to a minimal default config; do not treat missing config as fatal for client-side usage.
- Concurrent script tags: browser-entry attempts to find most specific script tag by matching `custom-views(.min)?(.js)`; preserve that heuristic if adjusting auto-init logic.
- URL encoding: state in URL is handled by URLStateManager — use it rather than manual string concatenation to avoid bugs in shareable links.

9) Small concrete examples to reuse
- Programmatic init (server/SPA):

```ts
import { CustomViews } from './lib/custom-views';
const core = await CustomViews.init({ config: myConfig, assetsJsonPath: '/assets.json', baseURL: '/customviews' });
```

- Programmatic widget creation:

```ts
import { CustomViewsWidget } from './core/widget';
const widget = new CustomViewsWidget({ core, position: 'middle-left', showWelcome: true });
widget.render();
```

10) Where to look for tests & how to extend them
- Unit tests live with Vitest (see `package.json` -> `vitest`). Add fast, focused tests for core state transitions and URL parsing. Prefer small pure functions (URLStateManager, VisibilityManager) for deterministic tests.

If anything here is unclear or you want the file to emphasize different areas (docs, testing, or architecture), tell me what to expand and I will iterate.
