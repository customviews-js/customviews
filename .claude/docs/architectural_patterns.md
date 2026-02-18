# Architectural Patterns & Conventions

## 1. Auto-Init Script Tag Pattern

The library has no public API. It auto-initializes when loaded via `<script>` tag.
Idempotency is enforced via `window.__customViewsInitialized` and `window.__customViewsInitInProgress`
flags (`browser.ts:21-28`).

**Convention:** All new initialization logic must respect these guards.

## 2. Singleton Store Pattern

State is managed through class-based singletons using Svelte 5 Runes. Each store is a class
with `$state`/`$derived` fields, instantiated once at module scope:

- `active-state-store.svelte.ts:150` — `export const activeStateStore = new ActiveStateStore()`
- `derived-store.svelte.ts:50` — `export const derivedStore = new DerivedStateStore()`
- `element-store.svelte.ts` — `export const elementStore = new ElementStore()`
- `ui-store.svelte.ts` — `export const uiStore = new UIStore()`

Feature stores follow the same pattern (e.g., `toast-store.svelte.ts`, `share-store.svelte.ts`).

**Convention:** Never pass store references as props. Components import singletons directly.
The only exception is `RuntimeCallbacks` (see pattern #3).

## 3. Callback Interface Decoupling

The UI layer is decoupled from `AppRuntime` through a `RuntimeCallbacks` interface
(`ui-manager.ts:12-19`). `initUIManager()` wraps `AppRuntime` methods into this interface
(`ui-manager.ts:117-124`), and `UIRoot.svelte` receives only callbacks + options as props.

**Convention:** UI components must never import `AppRuntime` directly. Persistence operations
flow through callbacks; reactive state flows through store singletons.

## 4. Self-Registering Custom Elements

Custom elements register themselves into `elementStore` during their Svelte mount lifecycle.
This enables the derived store to filter config entries to only those present in the DOM:

- `Toggle.svelte:38` — `elementStore.registerToggle(id)` inside `$effect`
- `TabGroup.svelte` — `elementStore.registerTabGroup(groupId)` inside `$effect`
- `Placeholder.svelte` — `elementStore.registerPlaceholder(name)` inside `$effect`

**Convention:** New custom elements that need settings-panel visibility must register with
`elementStore`. The `isLocal` flag in config controls whether registration is required for
menu visibility (`derived-store.svelte.ts:15-27`).

## 5. Two-Pass Svelte Compilation

Rollup uses two separate `svelte()` plugin instances (`rollup.config.js`):

1. **Custom Element pass** (`customElement: true`) — compiles `<cv-*>` components into
   standard Web Components with Shadow DOM.
2. **Regular pass** (`customElement: false`) — compiles settings widget components as
   normal Svelte components mounted imperatively via `mount()`.

**Convention:** Components intended as custom elements must include
`<svelte:options customElement={{ tag: 'cv-*', ... }} />`. All others are regular components.

## 6. State Resolution Priority

Initial state resolves in strict priority order (`runtime.svelte.ts:85-99`):

1. **URL state** (`?view=<base64>`) — highest priority (sharing use case)
2. **Persisted state** (localStorage) — returning user
3. **Config defaults** — computed from toggle/tabGroup definitions

**Convention:** New state sources must integrate into this chain. URL always wins.

## 7. Strategy Pattern for URL Actions

`UrlActionHandler` (`url-action-handler.ts:124-159`) uses a Strategy pattern with a
`UrlRule` interface (`url-action-handler.ts:17-23`). Three rule implementations handle
different URL triggers:

- `OpenModalRule` — `?cv-open` / `#cv-open`
- `BasicShareRule` — `?cv-share` / `#cv-share`
- `SpecificShareModeRule` — `?cv-share-show`, `?cv-share-hide`, `?cv-share-highlight`

**Convention:** New URL-triggered features should implement `UrlRule` and register in
`UrlActionHandler.rules` array. Priority is determined by array order (first match wins).

## 8. Reactive Effect Root

Global side effects (URL sync, persistence, placeholder updates) run inside a single
`$effect.root()` scope created in `AppRuntime.init()` (`runtime.svelte.ts:125-145`).
This keeps reactive subscriptions alive independent of component lifecycle.

**Convention:** Global effects that must outlive any component should be added to this
root scope. Component-local effects use normal `$effect()` inside `.svelte` files.

## 9. PersistenceManager Abstraction

All localStorage access is wrapped behind `PersistenceManager` (`state/persistence.ts`),
which supports an optional key prefix (`storageKey` from config) for multi-instance isolation.

**Convention:** Never access `localStorage` directly. Use `PersistenceManager` methods.

## 10. DOM Scanning + MutationObserver

`PlaceholderBinder` scans the DOM for `[[ name : fallback ]]` patterns and replaces them
with `<cv-placeholder>` custom elements (`placeholder-binder.ts`). A `MutationObserver`
in `AppRuntime` (`runtime.svelte.ts:161-201`) watches for dynamically added nodes and
re-scans them.

**Convention:** The observer skips `CV-PLACEHOLDER` and `CV-PLACEHOLDER-INPUT` tags to
avoid infinite loops (`runtime.svelte.ts:180`).

## 11. Feature Module Organization

Each feature under `src/lib/features/` is self-contained with its own:
- Components (`.svelte`)
- Services (`.svelte.ts`) — reactive logic
- Stores (`.svelte.ts`) — state singletons
- Types (`types.ts`)
- Logic (`*-logic.ts`) — pure functions

**Convention:** New features should follow this structure. Pure logic goes in `*-logic.ts`
files (testable without Svelte). Reactive orchestration goes in `*-service.svelte.ts` files.

## 12. Config-Driven UI

The settings modal dynamically renders UI based on `ConfigFile` contents. Toggles, tab groups,
and placeholders only appear if defined in config AND (if `isLocal`) detected in the DOM.
The `derivedStore` computes filtered lists (`menuToggles`, `menuTabGroups`,
`hasVisiblePlaceholders`) that drive the settings panel.

**Convention:** New configurable features need: a config type in `types/config.ts`,
processing in `ActiveStateStore.init()`, and a derived filter in `DerivedStateStore`.
