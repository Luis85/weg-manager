# Testing

Tests come first. Each behaviour step writes the failing test, sees it fail, then implements. A "discriminating check" counts only once it has been seen to fail on a planted defect.

## Projects

| Project | Files | Environment | Use for |
| --- | --- | --- | --- |
| `unit` | `tests/unit/**/*.test.ts` | node | domain, application, scripts, harness layers, logging |
| `dom` | `tests/dom/**/*.test.ts` | happy-dom + Vue/Nuxt UI plugins | lifecycle, settings tab, views, components |

- Run one file: `npx vitest run tests/dom/presentation/shell-panel.test.ts`
- Run one project: `npx vitest run --project unit`
- Run tests by name: `npx vitest run -t "read-only"`

Coverage (`npm run test:coverage`) applies to `src/**` and enforces lines 90, statements 90, functions 90 and branches 85.

## Support code

- `tests/support/obsidian/` is an in-memory double of the `obsidian` API. `getLanguage()` returns German (`DEFAULT_TEST_LANGUAGE`), the product's primary language, so the exact German texts of the dom tests stay meaningful; a suite that calls `setLanguage("en")` sets it back to `DEFAULT_TEST_LANGUAGE` in `afterEach` (see `tests/dom/language.test.ts`). `vault`, `metadataCache` and `workspace` are `Events`: `trigger(name, ...args)` fires an event and `listenerCount(name?)` counts live listeners. `workspace.layoutReady = false` with `markLayoutReady()` simulates startup. `TFile` and `TFolder` are classes, so `instanceof` works. A suite opts in with `vi.mock("obsidian", () => import("@test/obsidian"))`. Without that, importing `obsidian` throws `OBSIDIAN_REQUIRES_TEST_DOUBLE`.
- `tests/support/layers.ts` holds in-memory Layers:
  - the store, with `holdSaves`/`releaseSaves`/`heldSaves` and `setFailSave`. By default an interrupted held save never writes. `uncancellableSaves: true` models the real adapter over `plugin.saveData`: once started, the save writes even if the caller is interrupted. Use it to test interruption;
  - a controllable vault, with `hold`/`release`/`set`;
  - recording notifier (with `hold`/`release`/`held`), logger and clipboard;
  - sequential incident ids `T-1`, `T-2`, …
  - `recordingEventBus()`: the real `EventBusLive` that records every published event, with `failNextPublish`.
- `tests/support/runtime.ts` provides `testRuntime(options)`: a full `AppRuntime` plus handles to every Layer. Use `rejectUpdates` to simulate a service that rejects a value the form accepted, and `language: "en"` for the English catalog (German by default). Hand-built Layers in unit tests add `testMessages` (German) from `tests/support/layers.ts`.

## Mutation testing

- `npm run test:mutation` runs incrementally; `npm run test:mutation:full` re-runs every mutant.
- Stryker mutates `src/domain` and `src/application` and runs only their unit tests, with the TypeScript checker on.
- Thresholds: break 75, low 80, high 90. Never lower them.
- A `// Stryker disable` comment needs its reason on the same line.
- Reports land in `reports/mutation/`. The nightly GitHub workflow runs the full suite.

## Browser harness

`npm run dev:ui` serves `harness/`: two surfaces on one runtime (one of them 320 px wide), a theme switch, and visible notices. `?scenario=` selects the state:

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
- **Isolation.** Each spec file gets a fresh Obsidian with a copy of `tests/e2e/vaults/basic`, and `dist/` is installed as the plugin.
- **Language.** Without a stored choice Obsidian takes its language from Chromium's locale, which is `en-US` in CI and containers. `wdio.conf.mts` passes `--lang=de`, so Obsidian and the plugin start German and the specs assert German texts. `language.e2e.ts` switches to English the way Obsidian's own setting does: `localStorage` key `language`, then a plugin reload.
- **Writing specs.** `browser.executeObsidian(({ app, obsidian }, ...args) => …)` runs code inside Obsidian. The function is serialised, so pass values as arguments; closures do not work. Shared helpers live in `tests/e2e/support.ts`: console spy, open view, `data.json`, plugin reload, settings tab content, light/dark switch.
- **Gate.** `test:e2e` is not part of `verify`, because it needs a display and a download. CI runs it as a separate `e2e` job.

| Spec | Covers |
| --- | --- |
| `lifecycle.e2e.ts` | opening the view, reveal instead of duplicate, two tabs with one closed, the ribbon entry exactly once in `app.workspace.leftRibbon.items` after each load and after a ribbon re-render, three disable/enable cycles leaving no view behind, clean console |
| `settings-and-theme.e2e.ts` | the native settings tab holding only the log level (no text field), the view's greeting form saving to `data.json`, empty greeting never written, light/dark switch with Obsidian's colours reaching the surface, newer `data.json` shown read-only and never overwritten |
| `events.e2e.ts` | one listener per host event on Obsidian's internal `Events._` map, all removed on each disable; creating, changing, opening, renaming and deleting a note with a clean console |
| `popout.e2e.ts` | the view moved to a pop-out: surface, portal and About dialog in the pop-out's document, theme switch there, clean close |
| `external-settings.e2e.ts` | `data.json` changed outside Obsidian (as by Sync): the open view follows, a newer-version file switches to read-only and is never rewritten |
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
