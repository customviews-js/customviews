# AGENTS.MD: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

## Project Overview & Purpose

* Primary Goal: `customviews-js/customviews` is a JavaScript library designed to allow developers and designers to define reusable content views. These views can be toggled, personalized, or adapted dynamically for different users and contexts (e.g., showing/hiding sections, persisting user preferences).
* Business Domain: Web Development, UI Libraries, Dynamic Content Management.
* Key Feature: Framework-agnostic but internally powered by Svelte 5 for reactivity, offering custom elements and persisted state management.

## Core Technologies & Stack

* Languages: TypeScript (Strict Mode), HTML, CSS/SCSS.
* Frameworks & Runtimes:
    * Logic/Reactivity: Svelte 5 (Runes mode used in `.svelte.ts` files).
    * Runtime: Browser (Client-side).
    * Testing: Vitest with jsdom.
* Build Tools: Rollup (for bundling), Vite (for testing).
* Package Manager: npm.
* Documentation: MarkBind (deployed to GitHub Pages).

## Architectural Patterns

* Overall Architecture:
    *   Core Library: A singleton/class-based controller (`CustomViewsController`) that manages state, assets, and configuration.
    *   No Public API Facade: The library is designed for auto-initialization via script tag. `src/browser.ts` is the main entry point.
    *   Custom Elements: Uses Web Components (via Svelte) for easy integration into any HTML page (e.g., `<cv-tabgroup>`).
* Directory Structure Philosophy:
    *   /src: Primary source code.
        *   /src/core: Business logic, state management (`.svelte.ts` files), and assets.
        *   `/src/components`: Svelte components and custom elements.
        *   `/src/types`: TypeScript type definitions.
        *   `/src/utils`: Helper functions.
    *   `/dist`: Compiled output (ESM, CJS, Browser bundles).
    *   `/docs`: MarkBind documentation source.
    *   `/tests`: Unit and functional tests.

## Coding Conventions & Style Guide

* Formatting:
    * Indentation: 2 spaces (standard).
    * Semicolons: Always used.
    * Quotes: Double quotes preferred in JSON/HTML, mixed in TS (follow existing file consistency).
* Naming Conventions:
    * Classes: PascalCase (e.g., `CustomViewsController`, `AssetsManager`).
    * Files: kebab-case (e.g., `controller.svelte.ts`, `assets.ts`).
    * Variables/Functions: camelCase (e.g., `init`, `rootEl`).
    * Private/Internal Properties: Often prefixed with `_` or handled via Svelte runes/privacy mechanisms.
* Svelte Specifics:
    * Uses Svelte 5 Runes syntax (e.g., `$state`, `$derived`, `.svelte.ts` modules) for reactivity outside of components.
* Error Handling:
    * Graceful fallbacks (e.g., empty config/assets if loading fails).
* Version Control:
    * Adhering to Semantic Versioning (SemVer) is critical.

## Key Files & Entrypoints

* Main Entrypoint(s):
    *   `src/browser.ts`: Main entry point for browser auto-initialization.
    *   `src/index.ts`: (Empty) No public API exports.
* Configuration:
    *   `package.json`: Project metadata and scripts.
    *   `tsconfig.json`: TypeScript configuration.
    *   `rollup.config.js`: Build configuration.
    *   `svelte.config.js`: Svelte preprocessor config.

## Development & Testing Workflow

* Local Development Environment:
    *   Setup: `npm install`.
    *   Run Dev Server: `npm run dev` (runs Rollup in watch mode).
    *   Docs Dev: `cd docs && markbind serve` (requires MarkBind CLI).
* Testing:
    *   Run tests: `npm run test` (executes Vitest).
    *   Tests are located in `/tests` directory.
* Build Process:
    *   `npm run build`: Cleans `dist`, builds types, and bundles JS.
    *   Output formats: Browser bundles only (UMD).

## Specific Instructions for AI Collaboration

* Svelte 5 Runes: When refactoring or adding state logic, use Svelte 5 Runes syntax (`$state`, `$effect`, etc.) instead of legacy Svelte stores where appropriate, especially in `.svelte.ts` files.
* Compatibility: Ensure changes remain framework-agnostic for the end-user. The public API should not leak Svelte specifics unless intended.
* Docs: If adding features, check if `docs` needs updates.
* Types: Always update `src/types` or local interfaces when changing data structures. strict mode is enabled in `tsconfig.json`.
