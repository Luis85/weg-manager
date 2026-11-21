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

## Manual checks in Obsidian

No test can cover these. Report each as `not-run` until a person has done it.

1. Run `npm run dev` with `OBSIDIAN_PLUGIN_DIR` set in `.env.local`, and enable the plugin in a test vault.
2. Run "Ansicht öffnen", then switch between light and dark with the view open.
3. Move the view to a pop-out window and open the About dialog there.
4. Open two tabs of the view and close one.
5. Change the settings, including an empty greeting.
6. Disable and re-enable the plugin three times.
7. Check that the developer console shows no errors or warnings from the plugin.
