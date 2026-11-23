# Task 11 · Browser harness

Phase A. Needs: Task 10.

**Goal.** A browser page that runs the real presentation and application code over harness adapters, for UI work without Obsidian. It must look like Obsidian, or it hides what real Obsidian shows (L26).

## Files

Create: `tests/harness/index.html`, `tests/harness/main.ts`, `tests/harness/layers.ts`, `tests/harness/fake-host.css`, `configs/vite.harness.config.ts`, `tests/unit/harness-layers.test.ts`. Modify: `package.json` (scripts `dev:ui`, `build:ui`), `configs/fallow.config.mjs` (`entry: ["tests/harness/main.ts"]`, then `npm run fallow:config`), `configs/tsconfig.app.json` (its `../tests/**` already includes `tests/harness/`).

## Steps

- [ ] **1. Scenarios** (`tests/harness/layers.ts`): `SCENARIOS` as a `const` tuple and `parseScenario(value)` (anything unknown is the default). Each scenario is a set of adapters for `appServicesLayer`, written in `tests/harness/layers.ts` (the harness imports `src/`, never `tests/`): an in-memory settings store, a notifier that hands each `UserMessage` to the page, a clipboard over `navigator.clipboard`, `HostInfo` with `pluginVersion: "harness"`, `apiVersion: "none"`, `platform: "browser"`, the plugin's `incidentsLayer` and `consoleSinkLayer`, from Task 13 `memoryNoteStore()` with `sequentialIdGenerator()` and the store's `opener`, and a `hostEvents` adapter (`Layer.effectDiscard` over `EventBus`) that publishes `LayoutReady` (and from Task 16 `VaultReady`) at once: the browser has no metadata cache to wait for. `harnessLayer(scenario, options)` returns the services. Task 18 adds the tracer's scenarios: `loaded` (default), `empty`, `invalid`, `readonly`, `failure`.
- [ ] **2. The page** (`tests/harness/main.ts`, `tests/harness/index.html`): one `ManagedRuntime` over `harnessLayer`, two surfaces on it side by side, the second 320 px wide (so its frame shows the navigation as a row), each with its own `memoryNavigation`; a theme switch that toggles `theme-light`/`theme-dark` on `body`; notices shown in a list on the page (`notify` builds them with `createElement` and `textContent`); `?scenario=` and `?lang=` read from the URL (`languageFromCode`). Below 720 px the two surfaces stack. The harness imports no `obsidian` (oxlint, Task 02) and may import `effect` (it builds Layers).
- [ ] **3. The fake host** (`tests/harness/fake-host.css`, not scoped: `vite.harness.config.ts` passes `skipScope: (file) => file.endsWith("fake-host.css")`): the Obsidian theme variables `tokens.css` reads, for `body.theme-light` and `body.theme-dark`, and Obsidian's base rules that reach plugin markup (button chrome, text inputs, heading sizes and margins, list indents). **Every value comes from the running app, not from memory** (L26), and the app is first reachable in Task 12. So write the file now with **placeholder** values: the variable names and selectors in full, each value a plain guess, and as the file's first line the comment `/* PLACEHOLDER VALUES: replaced with values read from Obsidian in Task 12 step 6. */`. Task 12 step 6 replaces every value and the comment. Until then the harness is fit for layout work only: colours, contrast and Obsidian's base rules there say nothing about Obsidian.
- [ ] **4. Config** (`configs/vite.harness.config.ts`): `mergeConfig(sharedConfig({ mode, skipScope }), { root: "tests/harness", base: "./", build: { outDir: "../../reports/harness", emptyOutDir: true, target: "es2022", chunkSizeWarningLimit: 2000 } })`; the dev server scopes the plugin CSS with the same transform as the build. Scripts `dev:ui`: `vite --config configs/vite.harness.config.ts`; `build:ui`: `vite build --config configs/vite.harness.config.ts`.
- [ ] **5. Test** (`tests/unit/harness-layers.test.ts`): each scenario gives the state it names; an unknown `?scenario=` gives the default; importing `tests/harness/layers.ts` never touches `obsidian` (the guard of Task 02 would throw).

## Checks

- `npm run build:ui` exits 0.
- `npm run dev:ui`, opened in a browser: both surfaces render, the theme switch flips both, the narrow one shows the navigation as a row. (Visual; report `not-run` when no browser is available.)
- `tests/harness/fake-host.css` starts with the placeholder comment (Task 12 checks that it is gone).
- A type error planted in `tests/harness/main.ts` fails `npm run typecheck` (the fifth location of Task 02's type check plants).

## Done when

`npm run verify` exits 0 and `npm run build:ui` exits 0. Commit `feat: browser harness`.

The harness is not compared with Obsidian by any test; only the e2e appearance spec (Task 18) measures Obsidian itself.
