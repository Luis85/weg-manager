# Obsidian Plugin Shell – Handoff

- Date: 2026-11-21
- Branch: `feature/plugin-shell` (pushed to `origin`; not merged into `main`)
- Plan: [obsidian-plugin-shell-blueprint.md](obsidian-plugin-shell-blueprint.md), edited during the run: TanStack Form, error handling, Twelve-Factor, ESLint and the line limits were added.
- Executor: inline execution (superpowers `executing-plans`), TDD for every behaviour step.
- Run 1 stopped by request **before Task 8**. Tasks 0–7 are done and committed, one commit per task.
- **Run 2 (2026-11-21, branch `claude/upbeat-lovelace-v4rir1`, draft PR #4 into `feature/plugin-shell`) finished Tasks 8–12.** See section 7. Sections 1–6 describe the state after run 1.

## 1. Where things stand

| Task | Content | State | Commit |
| --- | --- | --- | --- |
| 0 | Skeleton: `manifest.json`, `versions.json`, `package.json`, `.npmrc`, `.nvmrc`, `.gitattributes`, `.editorconfig`, `.gitignore` additions | done | `1a350e6` |
| 1 | Dependency baseline, compatibility probes, [ADR 0001](../adr/0001-dependency-baseline.md) | done | `a7b9c46` |
| 2 | TypeScript, oxlint, ESLint, Prettier, fallow, Vitest; import boundaries; `max-lines` | done | `b035432` |
| 3 | Domain: `src/domain/settings.ts` (decode with fallback per field, `validatePatch`) | done | `92c542d` |
| 4 | Application: ports, tagged errors, `SettingsService`, Logger, `describeError`/`reportDefect`, diagnostics, use cases | done | `c64dde4` |
| 5 | Obsidian test double, Obsidian adapter layers, console sink, incident ids, `ManagedRuntime` | done | `d3fc568` |
| 6 | `main.ts`, `bootstrap.ts`, commands, ribbon, declarative settings tab, lifecycle | done | `f10f459` |
| 7 | Vite build (CJS lib), CSS scoping, `check:dist`, `dev` script, styles | done | `5e6ba63` |
| 8 | Vue + Nuxt UI surface, TanStack greeting form, `ErrorNotice.vue`, theme binding, real `ShellView` | **not started** | – |
| 9 | Browser harness with scenarios | not started | – |
| 10 | Mutation testing (Stryker) | not started | – |
| 11 | `verify` gate script, pre-push hook, Azure Pipelines, release scripts | not started | – |
| 12 | Developer docs, `CLAUDE.md`, ADR 0002/0003, final acceptance from a fresh clone | not started | – |

### Check results at handoff (run on 2026-11-21)

| Check | Result | Note |
| --- | --- | --- |
| `npm run typecheck` | passed | |
| `npm run lint` (oxlint, then ESLint) | passed | zero warnings |
| `npm run format:check` | passed | |
| `npm test` | passed | 128 tests (unit and dom projects) |
| `npm run build` | passed | `main.js` 123 KB, `styles.css` 61 KB |
| `npm run check:dist` | passed | all build invariants |
| `npm run test:coverage` | **failed** | functions 84.8 % (needs 90). Gaps: `shell-view.ts` placeholder (0 %, replaced in Task 8), the `bootstrap.ts` `openView`/failure paths, `run.ts` interrupt branch |
| `npm run analyze` (fallow) | **failed** | dead-code findings: test-double members not used yet, dev-only tooling dependencies (Stryker, `@iconify-json/lucide`, `@vue/test-utils`, `@eslint/js`), `@tanstack/vue-form` unused until Task 8, `obsidian` reported as a "dev dependency in production" |
| `npm run test:mutation` | not run | arrives in Task 10 |
| Obsidian app and Azure DevOps | not run | manual, see Task 12 Step 7 |

Coverage and `analyze` are not part of any task's completion test before Task 11. Both must be green before Task 11's `verify` can pass (see section 5).

## 2. How to resume

1. `git switch feature/plugin-shell && npm ci`
2. Read the blueprint from **Task 8** on, plus sections 3 and 4 here. The original ledger (`.superpowers/sdd/…/progress.md`) is git-ignored, so section 4 copies its rulings.
3. To continue with the superpowers executor, recreate the ledger. Its first line is `# SDD ledger — plan: <absolute path of the blueprint>`, followed by one `Task <N>: complete (…)` line each for Tasks 0–7 with the commits from the table above. The executor then resumes at Task 8.
4. Quick check that everything is still green: `npm run typecheck && npm run lint && npm test && npm run build && npm run check:dist`

## 3. Architecture as built

```
src/
├─ main.ts                      # 25 lines: onload → bootstrap(this, { signal }); onunload → abort + dispose
├─ bootstrap.ts                 # runtime, settings mirror, ribbon, commands, settings tab, view; undo on failure
├─ env.d.ts                     # *.vue / *.css modules, import.meta.env.MODE only
├─ domain/settings.ts           # Settings { schemaVersion, greeting, showRibbonIcon, logLevel }
├─ application/
│  ├─ errors.ts                 # StorageError, ReadOnlySettingsError, InvalidSettingsError, VaultReadError, ClipboardError; AppError
│  ├─ ports.ts                  # SettingsStore, Notifier(UserMessage), VaultReader, Logger, LogSink, Incidents, Clipboard, HostInfo
│  ├─ app-services.ts           # AppServices union, AppRuntime type
│  ├─ settings-service.ts       # SubscriptionRef-backed, serialised updates, read-only on newer/unreadable file
│  ├─ logger.ts                 # LoggerLive({ developmentMode }): level filter from settings, 50-entry ring buffer
│  ├─ user-messages.ts          # describeError (exhaustive), describeDefect, describeSettingsIssues – German, du-form
│  ├─ defects.ts                # reportDefect(cause): log + incident id + notice
│  ├─ diagnostics.ts            # buildDiagnostics with redaction
│  └─ use-cases.ts              # updateGreeting, setRibbonIconVisible, setLogLevel, showGreeting, countMarkdownFiles, copyDiagnostics
├─ infrastructure/
│  ├─ runtime.ts                # makeRuntime(layer)
│  ├─ logging/{console-sink,incidents}.ts
│  └─ obsidian/                 # the only place importing "obsidian"
│     ├─ app-layer.ts           # appLayer(plugin, options): all services
│     ├─ layers.ts              # obsidianLayer: store, notifier, vault, clipboard, host info
│     ├─ notices.ts             # showMessage(UserMessage) → Notice (DOM API, no innerHTML)
│     ├─ run.ts                 # runSafely: defects → reportDefect, interrupts silent, never rejects
│     ├─ commands.ts            # open-view, show-greeting, copy-diagnostics (no hotkeys)
│     ├─ ribbon.ts              # follows showRibbonIcon
│     ├─ settings-mirror.ts     # synchronous view of settings for Obsidian's settings API
│     ├─ settings-tab.ts        # declarative getSettingDefinitions (Obsidian 1.13+)
│     └─ shell-view.ts          # PLACEHOLDER ItemView – Task 8 replaces it
└─ styles/{app,tokens,bridge}.css
scripts/scope-css.mjs, check-dist.mjs, dev-install.mjs
tests/support/obsidian/*        # in-memory Obsidian double (+ declarative settings renderer)
tests/support/layers.ts         # in-memory store, recording notifier/logger/sink/clipboard, vaults, incidents
```

How the boundaries are enforced:

- External package bans: `no-restricted-imports` in `.oxlintrc.json`.
- Zones inside `src`: `boundaries` in `.fallowrc.json` (run by `fallow architecture`).
- `process.env` and any `import.meta.env` member except `MODE` are banned in `src/**` by ESLint `no-restricted-syntax`.
- File length: ESLint `max-lines` allows 400 lines of code per non-test `.ts`/`.vue`/`.mjs` file and 450 under `tests/**`. Blank lines and comments do not count.

## 4. Rulings (decisions taken on your behalf)

Each line gives the decision, the reason, and the cost if it is wrong.

**Setup**
1. Built in the root of the existing repo on `feature/plugin-shell` rather than in a new repo (your choice). Cost: the Obsidian vault at the repo root sees `node_modules/`, `dist/` and `coverage/`. Add them to *Settings → Files and links → Excluded files* locally.
2. The existing `LICENSE` (MIT), `README.md`, `AGENTS.md` and `.gitignore` were extended, never overwritten.
3. ADRs go to `docs/adr/NNNN-*.md`, not `docs/decisions/`, which holds the K-xx product decisions (see `docs/agents/domain.md`). Cost: these paths differ from the blueprint text.
4. Planned developer docs (Task 12) go to `docs/engineering/*.md`, with a row in `docs/README_DOCS.md`. Cost: these paths differ from the blueprint text.
5. Azure Pipelines is kept although `origin` is GitHub (Azure Pipelines can build GitHub repos). `docs/engineering/azure-devops-setup.md` should describe a GitHub-sourced pipeline plus a GitHub branch protection rule. Cost: if GitHub Actions is wanted, Task 11's YAML changes.
6. Prettier, the linters, fallow and vue-tsc cover plugin code only. They skip `docs/`, `.claude/`, `skills/`, `tests/skills/`, `*.md` and the Python scripts.

**Your requests added mid-run (the blueprint was edited)**
7. TanStack Form (`@tanstack/vue-form` 1.33.5) for every presentation form; its validators reuse the domain rules. The settings tab stays Obsidian-native.
8. ESLint runs beside oxlint. `max-lines` is 400 lines of code in source files and 450 in tests; this replaces the blueprint's 300-line limit.
9. Error handling and Twelve-Factor sections were added. They brought a `logLevel` setting, Logger/Incidents/Clipboard/HostInfo ports, `describeError`/`reportDefect`, the `copy-diagnostics` command, and a planned `ErrorNotice.vue`, `docs/engineering/error-handling.md` and ADR 0003.

**Dependencies (ADR 0001)**
10. TypeScript **6.0.3** instead of 7.0.2, because the `typescript-eslint` peer range is `<6.1.0`. Re-check when it widens.
11. ESLint **9.39.5** instead of 10.15.0, because `eslint-plugin-obsidianmd`'s dependencies accept only `^9`.

**Toolchain**
12. The fallow config is `.fallowrc.json`; fallow does not discover `fallow.json`.
13. `analyze` = `fallow && fallow architecture`.
14. `infrastructure` may import `presentation`, because `ShellView` mounts the surface. Only presentation→infrastructure is banned. Cost: if the stricter reading was meant, a mount port is needed.
15. The harness may import `effect` (it builds Layers) but not `obsidian`.
16. `eslint-plugin-obsidianmd` is applied to the whole project with its own scoping, so it also checks `manifest.json` and `LICENSE`.
17. `typecheck` runs vue-tsc twice: `tsconfig.app.json` covers src, tests and harness with `allowJs`; `tsconfig.node.json` covers the configs and `scripts/*.mjs` with `checkJs`. TS lib is ES2023, target stays ES2022.
18. oxlint allows `_tag` for `no-underscore-dangle` and `**/*.css` for `no-unassigned-import`.

**Domain and application**
19. A missing `schemaVersion` counts as the current version. A non-integer one adds an issue and decoding continues.
20. Issue texts are German sentences that name the German label (Begrüßung, Menüband-Symbol, Protokollstufe, Schemaversion), because users see them.
21. User copy follows handoff note HO-06: du-form, cause and then action, no reassurance texts. Cost: the blueprint asked for "say the notes are safe".
22. Level filtering and the ring buffer live in `application/logger.ts`; infrastructure only supplies the console `LogSink`.
23. `SettingsService` does not log, because the Logger depends on it for its level. Load problems surface as a notice and in status/diagnostics.
24. Additions beyond the brief: the `setLogLevel` use case, `describeSettingsIssues`, `SettingsStatus.readOnlyReason`, `RecordedLogEntry.at`, and `app-services.ts`.
25. The sample greeting stays English ("Hello from WEG Manager") while the UI texts are German. Cost: mixed languages until i18n is decided.

**Infrastructure and lifecycle**
26. Tests that need the Obsidian double run in the dom project (`tests/dom/infrastructure/*`).
27. `appLayer` is in `infrastructure/obsidian/app-layer.ts`; `runtime.ts` holds only `makeRuntime`.
28. The console sink writes `info` through `console.debug`, because the Obsidian guidelines allow only warn, error and debug.
29. Incident ids are 6 characters (0–9, A–Z) from Effect `Random`. They are not cryptographic.
30. The double has extra test helpers: `holdLoadData`, `failNextAddCommand`, `failNextNotice`, `registry.load()`, `settingsIn`, `simulate*`, `removeCommand`, `Vault.failReads`, a declarative settings renderer, and ribbon icons derived from attached elements.
31. The settings tab uses Obsidian's **declarative settings API** (`getSettingDefinitions`/`getControlValue`/`setControlValue` with `validate`), because `display()` is deprecated since 1.13. Cost: the tab tests run against the double's renderer, not Obsidian's real one.
32. A `SettingsMirror` feeds the ribbon and the tab, because Obsidian reads control values synchronously.
33. Unload while loading is pending is handled by an `AbortSignal`: `bootstrap` checks it after each await and returns an inert handle.
34. If a registration fails, bootstrap undoes the ribbon and commands and disposes the runtime. `registerView` and `addSettingTab` run last, because Obsidian has no way to unregister them individually.
35. "Settings subscription stopped" is only tested indirectly.

**Build**
36. `app.css` limits Nuxt UI's class scanning to an explicit list of component themes and `.vue` files (`@source not` plus `@source`). Without it, `styles.css` was 263 KB, over the 250 KB budget. Cost: **every new Nuxt UI component has to be added to that list**, or its classes are missing.
37. Tailwind's automatic content detection is off (`source(none)`); only `src/presentation` is scanned, so classes in the docs/prototype do not leak in.
38. Icons are bundled through Nuxt UI `icon.clientBundle` (svg mode); `SHELL_ICONS` in `vite.shared.ts` lists the extra icons. It is not yet verified in Obsidian that every default icon resolves offline.
39. The Vite 8 / rolldown option names are used: `rolldownOptions`, `codeSplitting: false`, `lib.cssFileName`.

## 5. Next steps (Task 8 onwards)

### Task 8 – design notes prepared before the stop

- **`src/presentation/runtime/use-runtime.ts`** (the only presentation file that imports `effect`):
  - `provideRuntime(app, runtime)` and `useRuntime()` through provide/inject.
  - `useEffectAction(fn)` uses `runtime.runFork`, then `runtime.runPromise(Fiber.await(fiber))`. On `Exit`: success sets `value`; a typed failure sets `error`, plus `message = describeError(e)` (constrain `E extends AppError`); a defect calls `reportDefect`; an interrupt is ignored. An `alive` flag set by `onScopeDispose` drops late results. A second `run` interrupts the first fiber.
  - `useSettings()`: initial value via `runtime.runSync(SettingsService.use(s => s.current))`, then fork `changes` and interrupt it on scope dispose.
  - Add a `reportVueError(runtime, err)` helper so `mount.ts` does not import `effect`.
- **`src/presentation/mount.ts`**:
  - `createApp(ShellApp)`, `app.use(ui)` (`@nuxt/ui/vue-plugin`), `idPrefix` from a counter, `errorHandler` → `reportVueError`.
  - Mount into a detached `div` from `root.ownerDocument`, then append it. Add a portal `div` inside `root`.
  - Export `releaseAll(releases)` (reverse order, run all, rethrow the first error) so it can be unit-tested directly.
  - Put `SCOPE_CLASS` in `src/presentation/scope.ts` and test that it equals `scripts/scope-css.mjs`'s `SCOPE_CLASS`.
- **`ShellApp.vue`**: `UApp` with `:portal="portalEl"` and `:toaster="null"`. Import components explicitly from `@nuxt/ui/components/*.vue`.
- **Split components to stay under 400 lines:** `ShellPanel.vue`, `GreetingForm.vue`, `ErrorNotice.vue`, `AboutDialog.vue`. All Tailwind classes need the `wm:` prefix.
- **`GreetingForm.vue`** with TanStack `useForm`:
  - Field validator `onChange` = `validatePatch(settings, { greeting }).issues[0]`.
  - `onSubmit` runs `updateGreeting` through `useEffectAction`. On `InvalidSettingsError`, call `form.setFieldMeta('greeting', m => ({ ...m, errorMap: { ...m.errorMap, onSubmit: issues } }))`.
  - On `ReadOnlySettingsError`, show a hint. The button is disabled when `!canSubmit || isSubmitting || readOnly`.
- **`ShellView`** gets `(leaf, runtime, surfaces: Set<() => void>)`: it mounts in `onOpen` and closes in `onClose`. In bootstrap, push an undo step "close every surface" right after `registerView`, so views close **before** `runtime.dispose()` (Review Focus 1/5).
- **Test support to add:**
  - `tests/support/runtime.ts`: a test `AppRuntime` from the support layers.
  - Hold/release options for `inMemoryStore.save` and the vault count (for the "disabled while submitting" and "unmount during pending" tests).
  - A rejecting `SettingsService` wrapper (service-side `InvalidSettingsError`).
- **Known risk from the blueprint:** Nuxt UI's runtime `colors`/`head` plugins may inject a `<style>` into `document.head`. The `document.head.childElementCount` test decides it; the fallback (no-op `resolveId` plugin plus sha256 pins) is described in the blueprint, Task 8 Step 3.
- **Nuxt UI components to keep in `app.css`'s `@source` list:** App, Alert, Avatar, Button, Card, FormField, Icon, Input, Link, LinkBase, Modal, Skeleton. Extend the list if Task 8 uses others.

### Before Task 11's `verify` can be green

- **Coverage:** Task 8 replaces the placeholder `ShellView`. Add tests for `openView` (the `open-view` command, which reveals the existing leaf) and for the interrupt branch of `runSafely`.
- **fallow dead-code:** add `ignoreDependencies` for CLI- or config-only tools: `@stryker-mutator/*`, `@iconify-json/lucide`, `@eslint/js` if fallow cannot see it, and `obsidian` (types only, external at runtime). Give the test double its own `entry`/`supportEntry` scope or `ignoreExports`, or remove members that stay unused after Task 8. `@tanstack/vue-form` is resolved once `GreetingForm.vue` uses it.

### Tasks 9–12

Follow the blueprint, applying rulings 3–5, and write ADR 0002 and ADR 0003 to `docs/adr/`.

## 6. Things only you can do

- Exclude `node_modules/`, `dist/`, `coverage/`, `reports/` and `.stryker-tmp/` in your Obsidian vault settings (the vault is the repo root).
- Create `.env.local` from `.env.local.example` (`OBSIDIAN_PLUGIN_DIR=<vault>/.obsidian/plugins/weg-manager`) to use `npm run dev`.
- Decide on ruling 5 (Azure Pipelines vs GitHub Actions) before Task 11.
- Decide whether `feature/plugin-shell` should go through a PR into `main` once Task 12 is done.

## 7. Run 2: Tasks 8–12

| Task | Commit | Notes |
| --- | --- | --- |
| 8 Vue + Nuxt UI surface | `04f9632` | `mountSurface`, `bindHostTheme`, `useEffectAction`/`useSettings`, `ShellPanel` + `GreetingForm` (TanStack) + `ErrorNotice` + `AboutDialog`, real `ShellView` |
| 9 Browser harness | `fb5e675` | `npm run dev:ui`; scenarios default, empty, error, slow, readonly |
| 10 Mutation testing | `fdf16e6` | score 70.9 % → 96.8 % after new tests; fallow dead-code cleaned |
| 11 Gate, hooks, CI | `9115e3f` | `verify`/`verify:full`, pre-push hook, **GitHub Actions** (CI, nightly mutation, release) |
| 12 Docs | `9471bfa` | `docs/engineering/*`, ADR 0002/0003, `AGENTS.md`, `CLAUDE.md`, README |

### Check results (2026-11-21)

| Check | Result |
| --- | --- |
| `npm run verify` | passed: format, lint, typecheck, coverage (lines 98.2, statements 97.1, functions 95.1, branches 94.3), analyze, build (`main.js` 534 KB, `styles.css` 62 KB), check:dist |
| `npm run test:mutation:full` | passed: 96.8 % (domain 95.0, application 97.9); 5 equivalent survivors |
| Discriminating checks | passed: the head test fails without the no-op plugin; the dispose-order test fails without the undo step; a surviving `decodeSettings` mutant appears without the `schemaVersion: 2` tests; the gate stops at `typecheck` on a planted type error |
| Fresh clone `npm ci && npm run verify:full` | passed: all 8 steps, mutation 96.8 % (337 s) |
| GitHub Actions `CI / verify` on PR #4 | passed |
| Obsidian app, GitHub branch protection | not run (manual, see `docs/engineering/testing.md` and `github-setup.md`) |

### Rulings from run 2

40. **GitHub Actions instead of Azure Pipelines** (owner's decision). It replaces ruling 5; the setup lives in `docs/engineering/github-setup.md`.
41. Nuxt UI's runtime `colors` plugin wrote `<style id="nuxt-ui-colors">` into `document.head`. `scripts/no-head-plugins.mjs` replaces it and the `head` plugin with no-ops, one module each, so Vue does not warn about a plugin installed twice. Both files are sha256-pinned. `bridge.css` adds `--ui-secondary` and `--ui-info`. Recorded in ADR 0001.
42. Each surface's portal (`.weg-manager-portal`) sits at `z-index: var(--layer-modal, 50)`. Without it, a later view painted over an earlier view's modal backdrop (seen in the harness).
43. `mountSurface(root, runtime, { content })` accepts other content, for tests and the harness. The Vue `idPrefix` is random per mount, which avoids a module-level counter (Twelve-Factor VI).
44. `ErrorNotice` shows an action button only when a handler exists. `copy-diagnostics` is built in; `retry` and `open-settings` come from the parent.
45. eslint-plugin-vue layout rules are off for `.vue` files, because Prettier owns template layout. The obsidianmd rules `prefer-active-doc` and `prefer-create-el` are off in `harness/**`, which is a plain browser page.
46. Fallow: `ignoreDependencies` covers `obsidian`, `@iconify-json/lucide` and `@eslint/js`; the `unused-class-members` rule is off for `tests/support/obsidian/**`, which mirrors the Obsidian API.
47. Stryker: the service-key strings are disabled with a reason (they only have to be unique). `test:mutation` is incremental; `test:mutation:full` adds `--force`.
48. Vitest writes JUnit when `CI` is set; it used to check `TF_BUILD`.
49. `.npmrc` sets `tag-version-prefix=""`, so `npm version` creates bare `x.y.z` tags.
50. The draft PR targets `feature/plugin-shell`, not `main`. Merging into `main` stays your decision (section 6).

### Still open

- The manual checks in Obsidian (`docs/engineering/testing.md`, "Manual checks"), especially pop-out windows and real theme switches.
- The GitHub repository settings and the branch-protection proof (`docs/engineering/github-setup.md`).
- Visual polish: the Nuxt UI card and modal spacing look generous in the harness, and the card header divider is not visible. Neither was investigated.
- The sample greeting is still English (ruling 25).

## 8. After run 2: Obsidian 1.15.1 and e2e tests

Decided by the owner on 2026-11-21, following [the testing research](../design/research/Testing%20research%20-%20Obsidian%20end-to-end%20tests.md):

- **`minAppVersion` is 1.15.1** (`manifest.json`, `versions.json`, the test double). The `obsidian` types stay at 1.14.4, because no 1.15.x types have been published. ADR 0001 records the exception.
- **E2e suite.** `npm run test:e2e` runs three specs in the real Obsidian 1.15.1 app, on installers 1.5.8 and 1.15.1, using `wdio-obsidian-service` 3.5.0 and WebdriverIO 10.2.0. Details are in `docs/engineering/testing.md`.
- **CI.** A new `e2e` job runs beside `verify` and is not required yet. It started as an `earliest/earliest` + `latest/latest` matrix; since 2026-11-21 it runs **`latest/latest` only** (owner's decision).
- **Results in this container.**
  - Each planted defect was caught by its spec: a console warning, a portal outside the pop-out, a dead theme binding.
  - After filtering Chromium's benign `ResizeObserver loop` notification, 8 of 8 consecutive runs passed, each taking about 15 seconds for both versions. The one failure before that fix was that notification.
- **Still to do.** After about two weeks without flakes, make the e2e checks required (`docs/engineering/github-setup.md`). Beta versions are not tested; they would need an Insiders account with two-factor authentication off.
