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

- `tests/support/obsidian/` is an in-memory double of the `obsidian` API. A suite opts in with `vi.mock("obsidian", () => import("@test/obsidian"))`. Without that, importing `obsidian` throws `OBSIDIAN_REQUIRES_TEST_DOUBLE`.
- `tests/support/layers.ts` holds in-memory Layers:
  - the store, with `holdSaves`/`releaseSaves` and `setFailSave`;
  - a controllable vault, with `hold`/`release`/`set`;
  - recording notifier, logger and clipboard;
  - sequential incident ids `T-1`, `T-2`, …
- `tests/support/runtime.ts` provides `testRuntime(options)`: a full `AppRuntime` plus handles to every Layer. Use `rejectUpdates` to simulate a service that rejects a value the form accepted.

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

- **Versions.** `OBSIDIAN_VERSIONS` picks app/installer pairs; the default is `earliest/earliest latest/latest`:
  - `earliest` is `minAppVersion` (1.15.1) on the oldest installer it accepts (1.5.8, Electron 28);
  - `latest` is the newest of both.
  - For a quicker local run: `OBSIDIAN_VERSIONS=latest/latest npm run test:e2e` (in PowerShell, `$env:OBSIDIAN_VERSIONS="latest/latest"` first).
- **First run.** The first run downloads Obsidian into `.obsidian-cache/` (git-ignored, about 1.3 GB unpacked). Never commit or share it: Obsidian's terms forbid redistribution.
- **Display.** On Linux without a display, run `xvfb-run -a npm run test:e2e`. Windows and macOS need nothing extra.
- **Isolation.** Each spec file gets a fresh Obsidian with a copy of `tests/e2e/vaults/basic`, and `dist/` is installed as the plugin.
- **Writing specs.** `browser.executeObsidian(({ app, obsidian }, ...args) => …)` runs code inside Obsidian. The function is serialised, so pass values as arguments; closures do not work. Shared helpers live in `tests/e2e/support.ts`: console spy, open view, `data.json`, plugin reload, light/dark switch.
- **Gate.** `test:e2e` is not part of `verify`, because it needs a display and a download. CI runs it as a separate `e2e` job.

| Spec | Covers |
| --- | --- |
| `lifecycle.e2e.ts` | opening the view, reveal instead of duplicate, two tabs with one closed, three disable/enable cycles leaving no view, ribbon icon or command behind, clean console |
| `settings-and-theme.e2e.ts` | the native settings tab saving to `data.json`, empty greeting never written, light/dark switch with Obsidian's colours reaching the surface, newer `data.json` shown read-only and never overwritten |
| `popout.e2e.ts` | the view moved to a pop-out: surface, portal and About dialog in the pop-out's document, theme switch there, clean close |

The console spy flags plugin, Vue and Nuxt UI warnings or errors, and any uncaught error. It ignores only Chromium's `ResizeObserver loop` notification. It is installed after the first load, so the three disable/enable cycles provide the load coverage.

## Manual checks in Obsidian

The e2e suite automates the old checks 2–7. What still needs a person:

1. Run `npm run dev` with `OBSIDIAN_PLUGIN_DIR` set in `.env.local` and look at the view in your own vault, with your theme and community plugins.
2. Use the view with keyboard only and with a screen reader.
3. Mobile, once `isDesktopOnly` is lifted. `wdio-obsidian-service` can then also emulate mobile.
