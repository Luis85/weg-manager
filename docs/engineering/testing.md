# Testing

Tests come first. Each behaviour step writes the failing test, sees it fail, then implements. A "discriminating check" counts only once it has been seen to fail on a planted defect.

## Projects

| Project | Files | Environment | Use for |
| --- | --- | --- | --- |
| `unit` | `tests/unit/**/*.test.ts` | node | domain, application, scripts, harness layers, logging |
| `dom` | `tests/dom/**/*.test.ts` | happy-dom + Vue/Nuxt UI plugins | lifecycle, settings tab, views, components |

Tests mirror the module folders: `tests/<project>/<layer>/<module>/`, e.g. `tests/unit/application/shell/` for `src/application/shell/`. Tests of the composition (plugin load through `main.ts`, `bootstrap.ts`, the files at a layer root) stay above them, e.g. `tests/dom/lifecycle.test.ts`.

- Run one file: `npx vitest run tests/dom/presentation/shell/shell-panel.test.ts`
- Run one project: `npx vitest run --project unit`
- Run tests by name: `npx vitest run -t "read-only"`

Coverage (`npm run test:coverage`) applies to `src/**` and enforces lines 90, statements 90, functions 90 and branches 85.

## Support code

- `tests/support/obsidian/` is an in-memory double of the `obsidian` API. `getLanguage()` returns German (`DEFAULT_TEST_LANGUAGE`), the product's primary language, so the exact German texts of the dom tests stay meaningful; a suite that calls `setLanguage("en")` sets it back to `DEFAULT_TEST_LANGUAGE` in `afterEach` (see `tests/dom/language.test.ts`). `vault`, `metadataCache` and `workspace` are `Events`: `trigger(name, ...args)` fires an event and `listenerCount(name?)` counts live listeners. `workspace.layoutReady = false` with `markLayoutReady()` simulates startup (see the metadata cache below for the cache's side). `TFile` and `TFolder` are classes, so `instanceof` works. A suite opts in with `vi.mock("obsidian", () => import("@test/obsidian"))`. Without that, importing `obsidian` throws `OBSIDIAN_REQUIRES_TEST_DOUBLE`.
  - Views have `getState`/`setState`, `navigation` (false by default, as `ShellView` sets it) and `app`. `leaf.setViewState` behaves as in Obsidian 1.15.1: a new view type opens the view, then the view gets the state; an open view of the same type is kept and only gets the new state. `workspace.layoutSaves` counts `requestSaveLayout` calls.
  - `app.loadLocalStorage`/`saveLocalStorage` store JSON like Obsidian (a falsy value clears the key; a broken entry reads as `null`); `app.localStorage.setRaw` plants a raw entry.
- **The double's vault** (`vault.ts`, `metadata-cache.ts`, `file-manager.ts`) behaves as Obsidian 1.15.1 does, and `tests/e2e/specs/note-store.e2e.ts` checks that against the real app:
  - `vault`: `getFileByPath`, `getFolderByPath`, `getAbstractFileByPath`, `getMarkdownFiles`, `read`, `cachedRead`, `create` (refuses a taken path and a missing folder), `createFolder` (creates parents, one `create` each), `process` (writes and fires `modify` only when the text changes). Each write waits a macrotask first, as disk I/O does, and refuses a path that `normalizePath` would change.
  - `metadataCache.getFileCache`: indexes a write a macrotask later and then fires `changed`, `resolve` and `resolved`; `null` before a new file is indexed, the old metadata before a changed one is. Broken YAML has no `frontmatter`. `await metadataCache.whenIndexed()` waits until every pending file is indexed.
  - **Startup**, as `tests/e2e/specs/vault-ready.e2e.ts` measured it. By default every file is indexed already, as after a warm restart or for a plugin enabled in a running app (`vault.setMarkdownFileCount` indexes its notes at once, without events). `metadataCache.startCold()` is a vault Obsidian has never indexed: every Markdown file loses its metadata and is indexed again in vault order, one per macrotask, each with `changed`, `resolve` and `resolved`, so `resolved` fires while others still wait, as in Obsidian. `metadataCache.resolveAll()` is what a warm restart fires after the layout is ready: `resolve` per file, then one `resolved`. There is no "resolved" flag, because Obsidian has none; completeness shows only through `getFileCache`. Combine them with `layoutReady = false` and `markLayoutReady()` (see `tests/dom/infrastructure/shell/vault-ready.test.ts`).
  - `fileManager.processFrontMatter` (parses the file's text, writes only on a change, removes the block when every key is gone), `renameFile` (keeps the `TFile`, fires `rename`), `trashFile` (`metadataCache` `deleted`, `vault` `delete`, then `metadataCache` `resolved`; resolves `true`).
  - `normalizePath`, `parseYaml`, `stringifyYaml`, `YAMLParseError`. The YAML copy handles flat maps of text, numbers, booleans, null and lists; it rejects what records never hold (nested maps, block scalars) instead of guessing.
  - `TFolder.children` and `vault.getRoot()`, kept up to date by every write.
  - Knobs: `vault.failReads`, `vault.failWrites`, `vault.holdWrites()`/`releaseWrites()`/`heldWrites()`, `vault.setMarkdownFileCount(n)`, `vault.seedFile(path, text)` for a file that appears from outside (Sync, another app; folders included, no checks, also a path in NFD).
  - `vault.caseInsensitive = true` models the disk of Windows and macOS: a write onto a path that differs from another entry only in case or Unicode form fails with EEXIST, and renaming a file to another case of its own name works. Lookups stay exact, as Obsidian's are, so a test on this disk proves the adapter finds clashes itself instead of relying on the file system. The contract runs on the double with and without it.
  - Not modelled: link updates on rename (and the `resolve` events they cause), folder renames, `vault.modify`, `vault.delete`.
- `tests/support/layers.ts` holds in-memory Layers:
  - the store, with `holdSaves`/`releaseSaves`/`heldSaves` and `setFailSave`. By default an interrupted held save never writes. `uncancellableSaves: true` models the real adapter over `plugin.saveData`: once started, the save writes even if the caller is interrupted. Use it to test interruption;
  - a controllable vault, with `hold`/`release`/`set`;
  - recording notifier (with `hold`/`release`/`held`), logger and clipboard;
  - sequential incident ids `T-1`, `T-2`, …
  - `recordingEventBus()`: the real `EventBusLive` that records every published event, with `failNextPublish`.
- `tests/support/surface.ts` mounts surfaces: `mountApp(root, runtime, options)` mounts the app's own `appSurface` on an in-memory navigation; `testSurface()` is a definition with test-only routes (two screens, an item with a parameter, a route without a screen) and `mountTest` mounts it. Navigation is proved on these, so the plugin ships no fake screens. `memoryNavigation` (from `presentation/shell/host`) records the routes it visited.
- `sequentialIdGenerator()` (`src/infrastructure/memory/notes/`) is the `IdGenerator` for tests and the harness: UUIDs counting up from `00000000-0000-4000-8000-000000000001`, one counter per call. `testRuntime` provides one.
- `memoryNoteStore()` (`src/infrastructure/memory/notes/`) is the one in-memory `NoteStore`, for tests and the harness. Its handles seed notes as an outside editor would (`seed(path, frontmatter | "none" | "broken", body)`), look behind the port (`body`, `isFolder`) and switch failures on (`setFailReads`, `setFailWrites`, `holdWrites`/`releaseWrites`/`heldWrites`). Reads see writes at once; Obsidian's cache lags.
- **NoteStore contract** (`tests/support/notes/contract.ts`): the same cases run against the in-memory adapter (`tests/unit/infrastructure/notes/memory-note-store.test.ts`) and against the Obsidian adapter on the double, once on a case-sensitive and once on a case-insensitive disk (`obsidian-note-store.test.ts`). `contract-clashes.ts` holds the clash cases (case, NFC/NFD, rename onto another note, rename to its own name in another case). A behaviour the port promises goes into the contract, not into one adapter's test.
- **Fidelity scenarios** (`tests/support/notes/scenarios.ts`): `vaultFacts` calls the vault, metadata cache and file manager directly; `storeScenario` drives the `NoteStore` through the probe API (`probe-api.ts`); `readinessScenario` (`tests/support/readiness-scenario.ts`) records `changed`, `resolve`, `resolved` and `deleted` around a create, an edit and a trash. Each records results and events. `tests/unit/support/obsidian-double.test.ts` runs them on the double, the e2e specs in Obsidian, and both compare with the same expectation (`fidelity.ts`). A difference is a bug in the double: fix the double, never the expectation alone. Keep each step to what Obsidian does the same way every run: whether a new file's index or an immediate write to it comes first varies, so steps settle in between. `executeObsidian` sorts the keys of what it passes and turns `undefined` into `null`, so the scenarios return plain JSON and show key order through file texts.
- `tests/support/runtime.ts` provides `testRuntime(options)`: a full `AppRuntime` plus handles to every Layer, including `notes` (the in-memory `NoteStore`). Use `rejectUpdates` to simulate a service that rejects a value the form accepted, and `language: "en"` for the English catalog (German by default). Hand-built Layers in unit tests add `testMessages` (German) from `tests/support/layers.ts`.

## Mutation testing

- `npm run test:mutation` runs incrementally; `npm run test:mutation:full` re-runs every mutant.
- Stryker mutates `src/domain` and `src/application` and runs only their unit tests, with the TypeScript checker on.
- Thresholds: break 75, low 80, high 90. Never lower them.
- A `// Stryker disable` comment needs its reason on the same line.
- Reports land in `reports/mutation/`. The nightly GitHub workflow runs the full suite.

## Browser harness

`npm run dev:ui` serves `harness/`: two surfaces on one runtime (one of them 320 px wide, so its frame shows the navigation as a row), each with its own in-memory route, a theme switch, and visible notices. `?scenario=` selects the state:

| Scenario | Shows |
| --- | --- |
| `default` | 42 files, writable settings |
| `empty` | 0 files |
| `error` | `VaultReadError` with retry |
| `slow` | the skeleton for 1.5 s |
| `readonly` | settings from a newer version: read-only hint, saving disabled |

## End-to-end tests in Obsidian

`npm run test:e2e` builds the plugin and runs `tests/e2e/specs/*.e2e.ts` with WebdriverIO and [`wdio-obsidian-service`](https://github.com/jesse-r-s-hines/wdio-obsidian-service) in a **real Obsidian app**. Background and alternatives: [Testing research](../design/research/Testing%20research%20-%20Obsidian%20end-to-end%20tests.md).

- **Versions.** The suite runs the latest Obsidian app on the latest installer (`latest/latest`); CI does the same.
  - `OBSIDIAN_VERSIONS` takes other app/installer pairs. For example, `earliest/earliest` is `minAppVersion` (1.15.1) on the oldest installer it accepts (1.5.8, Electron 28).
  - In PowerShell, set it with `$env:OBSIDIAN_VERSIONS="earliest/earliest"` first.
- **First run.** The first run downloads Obsidian into `.obsidian-cache/` (git-ignored, about 1.3 GB unpacked). Never commit or share it: Obsidian's terms forbid redistribution.
- **Display.** On Linux without a display, run `xvfb-run -a npm run test:e2e`. Windows and macOS need nothing extra.
- **Isolation.** Each spec file gets a fresh Obsidian with a copy of `tests/e2e/vaults/basic`, and `dist/` is installed as the plugin. `vault-ready.e2e.ts` switches to a fresh copy of the reference vault with `browser.reloadObsidian({ vault })`, which Obsidian has never indexed.
- **Reference vault.** `scripts/reference-vault.mjs` writes the desktop reference profile of F-21: two communities, 200 Punkte and 2,000 notes with frontmatter in total, plus 200 plain Markdown notes without it. `referenceVault({ seed, points, records, plain })` returns paths and texts; `writeReferenceVault(target, options)` replaces the folder with them. The same seed gives the same bytes: a seeded generator, no clock, no `Math.random` (`tests/unit/scripts/reference-vault.test.ts`). Records follow ADR 0007 (`schema: weg-manager.<type>/v1`, `id: <type>-<uuid>`, snake_case keys, `community_id` on everything but communities). Only `community` is specified so far, so the rest is the generic type `item` (`kind: point` or `note`); the generator follows the real types as they are built. The profile's 1,000 attachments are left out: the index reads frontmatter, never a binary. `npm run vault:reference` (part of `test:e2e`) writes it into the git-ignored `tests/e2e/vaults/reference/`; it is never committed.
- **Probe plugin.** `tests/e2e/probe-plugin/` is a second plugin for the suite only. `npm run build:probe` (part of `test:e2e`) bundles it with `configs/vite.probe.config.ts` from the real adapter source into `tests/e2e/probe-plugin/dist/` (git-ignored), and `wdio.conf.mts` installs it beside `dist/`. It exposes the Obsidian `NoteStore` as `plugins.noteStoreProbe.api`, so a spec calls the store without any hook in the plugin itself. `plugins.noteStoreProbe.startup` records from the probe's `onload` on how Obsidian got ready (layout, `create`, `changed`, `resolve`, `resolved`, with cache counts at the layout and the first `resolved`), and runs the plugin's real `hostEventsLayer` on a runtime of its own, with a count of cached notes at its `LayoutReady` and `VaultReady`.
- **Cache.** The download cache is `.obsidian-cache/` in the checkout. In a git worktree, a symlink to the main checkout's cache avoids a second download.
- **Language.** Without a stored choice Obsidian takes its language from Chromium's locale, which is `en-US` in CI and containers. `wdio.conf.mts` passes `--lang=de`, so Obsidian and the plugin start German and the specs assert German texts. `language.e2e.ts` switches to English the way Obsidian's own setting does: `localStorage` key `language`, then a plugin reload.
- **Writing specs.** `browser.executeObsidian(({ app, obsidian }, ...args) => …)` runs code inside Obsidian. The function is serialised, so pass values as arguments; closures do not work. Shared helpers live in `tests/e2e/support.ts`: console spy, open view, `data.json`, plugin reload, settings tab content, light/dark switch.
- **Gate.** `test:e2e` is not part of `verify`, because it needs a display and a download. CI runs it as a separate `e2e` job.

| Spec | Covers |
| --- | --- |
| `lifecycle.e2e.ts` | opening the view, reveal instead of duplicate, two tabs with one closed, the ribbon entry exactly once in `app.workspace.leftRibbon.items` after each load and after a ribbon re-render, three disable/enable cycles leaving no view behind, clean console |
| `settings-and-theme.e2e.ts` | the native settings tab holding only the log level (no text field), the view's greeting form saving to `data.json`, empty greeting never written, light/dark switch with Obsidian's colours reaching the surface, newer `data.json` shown read-only and never overwritten |
| `events.e2e.ts` | one listener per host event (`resolved` included) on Obsidian's internal `Events._` map, all removed on each disable; creating, changing, opening, renaming and deleting a note with a clean console |
| `vault-ready.e2e.ts` | on the reference vault, through the probe's host event adapter: a cold start, where the layout is ready with almost nothing cached and `resolved` fires early, gets `VaultReady` once and only when all 2,000 notes with frontmatter are cached; a warm restart and an adapter started in a running app (no `resolved` comes) get it at once, complete; `changed`, `resolve`, `resolved` around an edit as the double fires them; `NoteStore.list` timed after `VaultReady` (timings in `reports/e2e/vault-ready-timings.json`, not yet enforced). About 15 s. |
| `popout.e2e.ts` | the view moved to a pop-out: surface, portal and About dialog in the pop-out's document, theme switch there, clean close |
| `external-settings.e2e.ts` | `data.json` changed outside Obsidian (as by Sync): the open view follows, a newer-version file switches to read-only and is never rewritten |
| `note-store.e2e.ts` | the fidelity scenarios in real Obsidian: `normalizePath`, YAML, `create`/`createFolder`/`process`/`processFrontMatter`/`renameFile`/`trashFile` results, errors and events, the metadata cache's lag; then the real `NoteStore` adapter through the probe plugin: folders and a name clash on create, a clash by case only (which the Linux disk alone would allow), a rename to the note's own name in another case and onto another note's name in another case, records recognised by `schema` anywhere, unknown keys, key order and body kept on update (checked in the file text), a no-op update that writes nothing, a refused and a broken update, rename, trash; clean console |
| `navigation.e2e.ts` | the route in the leaf's view state; broken and unknown states falling back to the start route with a clean console; the route in the saved `workspace.json`; a note opened like a file-explorer click (`getLeaf(false).openFile`) while the plugin tab is active goes to another tab; two navigations undone and redone with the frame's back and forward controls (in a second view built by the plugin's view class with a test-only route); the view restored on its route after Obsidian restarts, with an empty history |
| `language.e2e.ts` | German from the start; an old `data.json` with the stored English default shows the German default and is not rewritten; after switching Obsidian to English: view, ribbon, command and settings names, notices in English; clean console |

The console spy flags plugin, Vue and Nuxt UI warnings or errors, and any uncaught error. It ignores only Chromium's `ResizeObserver loop` notification. It is installed after the first load, so the three disable/enable cycles provide the load coverage.

## Scanner-equivalent lint

`npm run lint:scanner` approximates the source scan of Obsidian's community directory. It runs `configs/eslint.scanner.config.mjs` over the repo: only `eslint-plugin-obsidianmd`'s `recommended` config, the rule changes and the fixed ignore list from the plugin's [scanner configuration](https://github.com/obsidianmd/eslint-plugin/blob/a998a5992b7bf9b6f3e0fe1e61a3ad180546f4a5/docs/configuration.md#community-plugin-scanner-configuration). Our own ignores (such as `.claude/**`) and Vue rules do not apply.

- **What it adds to the scanner's list.** Files git does not track are skipped, because the scanner sees a clone. Bundled JavaScript outside `src/` is skipped by the scanner's content rule. `.js` files are linted without type information, because no tsconfig here takes them in.
- **Not exact.** The scanner also turns most remaining errors into warnings and adds stricter layers for new submissions. Read the output as a preview, not a verdict.
- **Informational.** It is not part of `verify`. CI runs it as the `scanner-lint` job with `continue-on-error`, so findings show in the log but never block.
- **Known failure.** `.claude/skills/archify/explainer/reader.js` fails with `no-unsanitized/property` (it assigns `innerHTML`) and other errors. The owner decided to deal with it at submission time; options are in [Plugin research](../design/research/Plugin%20research%20-%20Obsidian%20best%20practices.md) item 1.

## Manual checks in Obsidian

The e2e suite automates the old checks 2–7. What still needs a person:

1. Run `npm run dev` with `OBSIDIAN_PLUGIN_DIR` set in `.env.local` and look at the view in your own vault, with your theme and community plugins.
2. Use the view with keyboard only and with a screen reader.
3. Mobile, once `isDesktopOnly` is lifted. `wdio-obsidian-service` can then also emulate mobile.
