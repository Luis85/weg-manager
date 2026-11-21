# Obsidian Plugin Shell — Baseline Blueprint

> **Historical record (archived 2026-11-21).** This plan describes the plugin shell as first built, with a greeting demo, one view and one panel. It no longer matches the code.
> The current truth is in [architecture](../../engineering/architecture.md), [adding a feature](../../engineering/adding-a-feature.md) and the [ADRs](../../adr/).

**Goal:** Produce a new Obsidian plugin repository — TypeScript, Vue 3 + Nuxt UI, Effect, Vitest, Stryker, oxlint, fallow, Azure Pipelines — whose quality gate is green and whose one small walking-skeleton feature proves every layer end to end, so a developer can start feature work on day one.

**Architecture:** Layered, ports-and-adapters, dependencies point inward only. `domain` (pure, Effect Schema) ← `application` (Effect services, tagged errors, ports, use cases) ← `infrastructure/obsidian` (the only code that imports `obsidian`; provides Layers) and `presentation` (Vue + Nuxt UI; calls application use cases through one runtime composable and never imports `effect` itself). `src/main.ts` is composition only. One `ManagedRuntime` per plugin load, one Vue app per open view, everything released on `onunload`.

**Tech Stack (latest stable on 2026-11-19 — re-resolved at execution, see Task 1):** `obsidian@1.14.4` (API types) · `typescript@7.0.2` · `vue@3.5.45` · `@nuxt/ui@4.13.0` · `tailwindcss@4.3.5` · `vite@8.3.8` · `@vitejs/plugin-vue@6.0.11` · `effect@4.1.4` · `@tanstack/vue-form` (latest) · `@effect/vitest@4.1.4` · `vitest@5.1.1` · `@vitest/coverage-v8@5.1.1` · `@vue/test-utils@2.6.0` · `happy-dom@21.0.4` · `@stryker-mutator/{core,vitest-runner,typescript-checker}@10.1.1` · `oxlint@1.94.0` · `fallow@3.44.0` · `vue-tsc@3.3.14` · `prettier@3.10.1` · `fast-check@4.10.3` · `postcss` + `postcss-selector-parser` (latest) · `@iconify-json/lucide` (latest) · `@types/node@26.6.6` · Node 24 LTS / npm 11. Hosting and CI: Azure Repos + Azure Pipelines.

## Inputs (ask the developer once, before Task 0; use the default when unanswered)

| Placeholder | Meaning | Default |
| --- | --- | --- |
| `<plugin-id>` | kebab-case manifest id; must not contain `obsidian` | `plugin-shell` |
| `<Plugin Name>` | manifest display name | `Plugin Shell` |
| `<PluginClass>` | PascalCase class in `main.ts` | `ShellPlugin` |
| `<css-prefix>` | 2–4 lowercase letters; Tailwind/Nuxt UI class and variable prefix | initials of `<plugin-id>` (`ps`) |
| `<author>` | manifest author | git `user.name` |
| `OBSIDIAN_PLUGIN_DIR` | dev install target, kept in gitignored `.env.local` | unset → `dev` only builds |
| Agent pool | Azure Pipelines pool | `vmImage: ubuntu-latest` |
| Azure Artifacts feed | Universal Package feed for releases | none → pipeline artifact only |

## Agent operating rules

- Work locally only. Do **not** create remotes, push, create pipelines, or change Azure DevOps settings; those are developer steps listed in Task 11/12.
- Tests first: every behaviour step writes the failing test, sees it fail, then implements.
- Never claim a step passed without running its command and reading the exit code. Never mask one (`|| true`, backgrounding, piping without checking the source's exit code).
- A step that says "discriminating check" must be seen to **fail** on the planted defect before it counts.
- Stop and ask when: a Task 1 probe fails and no fallback in this plan covers it; an invariant in Global Constraints cannot be met; a threshold would have to be lowered.
- The final report uses `passed` / `failed` / `not-run` per check. Anything needing a real Obsidian app or Azure DevOps is `not-run`.

## Global Constraints

- Every dependency pinned exactly (no `^`/`~`); `package-lock.json` committed; `.npmrc` has `save-exact=true` and `engine-strict=true`.
- "Latest" = newest stable dist-tag that passes the Task 1 probe. An older major is allowed only with an entry in `docs/decisions/0001-dependency-baseline.md` naming the blocker.
- TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noEmit`, `skipLibCheck`; `moduleResolution: "Bundler"`; target `ES2022`.
- Import boundaries, enforced by a tool in the gate (oxlint `no-restricted-imports` and/or fallow `boundaries`), never by convention:
  - `obsidian` only in `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/obsidian/**`.
  - `effect` only in `src/domain/**`, `src/application/**`, `src/infrastructure/**`, `src/bootstrap.ts`, `src/presentation/runtime/**`.
  - `src/domain/**` imports only `effect`; `src/application/**` imports only `effect` and `domain`; `src/presentation/**` never imports `infrastructure`.
  - `vue` / `@nuxt/ui` only in `src/presentation/**` and `harness/**`.
- `src/main.ts` ≤ 40 lines, composition only. Cyclomatic complexity ≤ 10 (fallow).
- File length, enforced by ESLint `max-lines` (`skipBlankLines`, `skipComments`): ≤ 400 lines of code in every non-test `.ts`, `.vue` and `.mjs` file; ≤ 450 in every file under `tests/**`.
- Linting is two tools, both in the gate: oxlint (fast, broad) and ESLint (flat config: `typescript-eslint`, `eslint-plugin-vue`, `eslint-plugin-obsidianmd`, `max-lines`; `eslint-plugin-oxlint` switches off every rule oxlint already covers, so no rule runs twice). `npm run lint` runs both with zero warnings allowed.
- Build output is exactly `dist/main.js` (CJS, default export = plugin class, single chunk), `dist/styles.css`, `dist/manifest.json`. `obsidian`, `electron`, `@codemirror/*`, `@lezer/*` and Node builtins are external; everything else is bundled.
- No runtime network access: icons bundled locally, no remote fonts, no CDN.
- CSS ownership: every selector in `dist/styles.css` is scoped under `.<plugin-id>-root`; no `@layer` blocks survive (Obsidian's unlayered rules would otherwise win); no Tailwind preflight; `@keyframes` and `@property` names carry the `<css-prefix>`; mounting a view adds nothing to `document.head`.
- Obsidian plugin guidelines: no `innerHTML`/`outerHTML` assignment, no default hotkeys, no `console.log` in shipped code, every listener registered through `this.register*`, settings UI uses the native `Setting` API, leaves are not detached in `onunload`, command ids do not repeat the plugin id.
- Obsidian DOM extensions (`createEl`, `empty`, …) are used only in `src/infrastructure/obsidian/**`; presentation code must run in a plain browser (harness).
- Coverage thresholds over `src/**` (excluding `src/main.ts`, `src/styles/**`): lines 90, statements 90, functions 90, branches 85. Mutation score on `domain` + `application`: `break` 75, `low` 80, `high` 90.
- `npm run verify` is the single gate. All tooling is Node scripts or npm scripts that run unchanged on Windows and Linux (no bash-only syntax in `package.json`).
- `manifest.json`: `isDesktopOnly: true` until mobile is verified (ADR 0001); `minAppVersion` = resolved `obsidian` package version.
- One commit per task, Conventional Commits (`chore:`, `feat:`, `test:`, `build:`, `ci:`, `docs:`).

## Error Handling (user-friendly by construction)

- **Two kinds of failure.** *Expected failures* are tagged errors in the Effect error channel (`StorageError`, `ReadOnlySettingsError`, `InvalidSettingsError`, `VaultReadError`, and every later one); the union of all of them is `AppError`. *Defects* are bugs (thrown exceptions, `Effect.die`, Vue render errors); they are never shown raw.
- **One message catalog.** `src/application/user-messages.ts` exports `type UserMessage = { severity: "info" | "warning" | "error"; title: string; detail: string; action?: "retry" | "open-settings" | "copy-diagnostics" }`, `describeError(error: AppError): UserMessage` (exhaustive over `_tag`; a new tag without a message is a type error) and `describeDefect(incidentId: string): UserMessage`. Texts are German (product language), plain and calm: what happened, that the user's notes are safe, what to do next. Never a stack trace, file system path, raw `error.message` or note content.
- **Defects are reported once.** `reportDefect(cause: unknown): Effect<UserMessage, never, Logger | Notifier | Incidents>` creates a short incident id, logs `error` with the cause, notifies `describeDefect(id)` and returns it. Every boundary routes defects there: bootstrap, command callbacks, `useEffectAction`, the Vue `app.config.errorHandler` of every mounted surface, and `onunload` disposal.
- **Diagnostics instead of console digging.** A `copy-diagnostics` command and the `copy-diagnostics` message action put a redacted report on the clipboard: plugin version, Obsidian `apiVersion`, platform, settings status (writable, issues), log level, and the last 50 log entries from an in-memory ring buffer. Redaction: context values under keys `content`, `body`, `text`, `path`, `name` and any string longer than 200 characters are replaced by `[redacted]`.

## Twelve-Factor, adapted to an Obsidian plugin

| Factor | Rule in this repo |
| --- | --- |
| I Codebase | One repo, one plugin; `dist/` is built, never committed. |
| II Dependencies | Every dependency pinned and declared; nothing assumed from the host except the externals in Global Constraints. |
| III Config | Runtime config lives only in `data.json` through `SettingsService` (validated, versioned). Build/dev config only in `.env.local` and Vite modes. `src/**` never reads `process.env` or `import.meta.env` except `import.meta.env.MODE` in `bootstrap.ts`; no secrets in the repo or the bundle (lint-enforced). |
| IV Backing services | Vault, notifications, clipboard, logging and incident ids are ports with swappable Layers (Obsidian, harness, tests). |
| V Build, release, run | `npm run build` → immutable `dist/`; release = artifact named by the tag (= `manifest.version`); run = Obsidian loads it. No build-time behaviour switches beyond `MODE`. |
| VI Processes | No module-level mutable state in `src/**`; all state is owned by the runtime of one plugin load or persisted in the vault / `data.json` (proved by the reload test, Review Focus 1). |
| VII Port binding / VIII Concurrency | Not applicable to a plugin; recorded so nobody adds a local server or worker without an ADR. |
| IX Disposability | `onload` registers and returns fast; vault-wide work waits for `workspace.onLayoutReady`; `onunload` releases everything in reverse order, even after a failure. |
| X Dev/prod parity | The same application Layers run in Obsidian, the harness and the tests; only adapters differ. |
| XI Logs | `Logger` port with structured entries `{ level, event, context?, incidentId? }` and stable dotted event names (`settings.load.failed`). The only `console` use in shipped code is the Logger's console sink in `src/infrastructure/logging/**`. Level comes from the `logLevel` setting (default `warn`; `debug` in development mode). |
| XII Admin processes | One-off maintenance runs as commands through the same runtime (`copy-diagnostics` is the first), never as ad-hoc scripts against a vault. |

## Review Focus

1. **Disable → enable → disable in one session, and unload while load is still pending:** no leaked runtime, Vue app, subscription or observer; the second load behaves like the first. → Task 6.
2. **`data.json` missing, unreadable/corrupt, partially invalid, or written by a newer plugin version:** the plugin always loads; invalid fields fall back per field; an unreadable file or a newer `schemaVersion` loads defaults **read-only** and is never overwritten. → Tasks 3, 4, 6.
3. **Host theme switch while a view is open:** Nuxt UI surfaces follow light/dark without reopening. → Task 8.
4. **View in a pop-out window:** the Vue app, its portals (modal, popover, tooltip) and its theme binding live in the leaf's `ownerDocument`, not the main window's. → Task 8.
5. **Two views open, one closed:** the other keeps working; closing releases only its own app. → Task 8.

---

## File Structure

```
.
├─ manifest.json, versions.json, package.json, package-lock.json, .npmrc, .nvmrc
├─ tsconfig.json (+ tsconfig.app.json, tsconfig.node.json)
├─ vite.shared.ts                # sharedConfig(): vue + Nuxt UI plugin + CSS scoping; used by build, harness, vitest
├─ vite.config.ts                # plugin build (lib, cjs)
├─ vite.harness.config.ts
├─ vitest.config.ts              # projects: unit (node), dom (happy-dom)
├─ vitest.stryker.config.ts      # unit project only, for Stryker
├─ stryker.config.mjs
├─ .oxlintrc.json, .prettierrc.json, fallow.json
├─ azure-pipelines.yml           # CI
├─ pipelines/nightly-mutation.yml, pipelines/release.yml
├─ .azuredevops/pull_request_template.md
├─ .githooks/pre-push
├─ scripts/
│  ├─ verify.mjs                 # ordered gate runner
│  ├─ scope-css.mjs              # PostCSS plugin: CSS ownership
│  ├─ check-dist.mjs             # build-output invariants
│  ├─ dev-install.mjs            # watch build → OBSIDIAN_PLUGIN_DIR
│  ├─ version-bump.mjs           # package.json → manifest.json + versions.json
│  ├─ package-release.mjs        # stage release folder, check tag = version
│  └─ install-hooks.mjs          # prepare: core.hooksPath
├─ src/
│  ├─ main.ts                    # <PluginClass>: onload/onunload → bootstrap
│  ├─ bootstrap.ts               # wires runtime, views, commands, settings tab; returns dispose
│  ├─ domain/settings.ts
│  ├─ application/
│  │  ├─ ports.ts                # SettingsStore, Notifier, VaultReader
│  │  ├─ errors.ts
│  │  ├─ settings-service.ts
│  │  └─ use-cases.ts            # the only application API presentation calls
│  ├─ infrastructure/
│  │  ├─ runtime.ts              # makeRuntime(layer) → ManagedRuntime
│  │  └─ obsidian/{layers,shell-view,settings-tab,commands}.ts
│  ├─ presentation/
│  │  ├─ mount.ts                # mountSurface(root, runtime) → close()
│  │  ├─ theme.ts                # bindHostTheme(root) → release()
│  │  ├─ runtime/use-runtime.ts  # useEffectAction, useSettings
│  │  └─ components/{ShellApp,ShellPanel}.vue
│  └─ styles/{app.css,tokens.css,bridge.css}
├─ harness/{index.html,main.ts,fake-host.css,layers.ts}
├─ tests/
│  ├─ support/obsidian/          # in-memory Obsidian test double
│  ├─ unit/…                     # node: domain, application, infrastructure layers, scripts
│  └─ dom/…                      # happy-dom: lifecycle, views, settings tab, components
├─ docs/{architecture,adding-a-feature,testing,releasing,azure-devops-setup}.md
├─ docs/decisions/{0001-dependency-baseline,0002-architecture}.md
└─ README.md, AGENTS.md, CLAUDE.md, LICENSE
```

---

### Task 0: Repository skeleton and identity

**Files:** Create `manifest.json`, `versions.json`, `package.json` (no deps yet), `.npmrc`, `.nvmrc` (`24`), `.gitignore`, `.gitattributes`, `.editorconfig`, `LICENSE` (ask; default proprietary notice, MIT if told), `README.md` (title + one line).

**Interfaces — Produces:** `manifest.json` with `id`, `name`, `version: "0.1.0"`, `minAppVersion` (Task 1), `author`, `description`, `isDesktopOnly: true`; `versions.json` `{ "0.1.0": "<minAppVersion>" }`; `package.json` with `"type": "module"`, `"private": true`, `engines.node: ">=24"`.

- [ ] **Step 1:** `git init -b main`; write the files. `.gitignore`: `node_modules/ dist/ release/ coverage/ reports/ .stryker-tmp/ .env.local`. `.gitattributes`: `* text=auto eol=lf`.
- [ ] **Step 2:** Verify: `node --input-type=module -e "import{readFileSync as r}from'node:fs';const m=JSON.parse(r('manifest.json','utf8'));if(!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(m.id)||m.id.includes('obsidian'))process.exit(1)"` exits 0.
- [ ] **Step 3:** Commit `chore: repository skeleton`.

### Task 1: Dependency baseline with compatibility probe

**Files:** Modify `package.json`, `manifest.json`, `versions.json`; Create `package-lock.json`, `docs/decisions/0001-dependency-baseline.md`.

**Interfaces — Produces:** the pinned version set all later tasks use; ADR 0001 with every package, its version, each fallback and its blocker.

- [ ] **Step 1:** For every package in Tech Stack run `npm view <pkg> dist-tags.latest`; use those results, not the numbers printed above.
- [ ] **Step 2:** Install with `--save-exact`. Runtime deps: `vue`, `@nuxt/ui`, `tailwindcss`, `effect`, `@tanstack/vue-form`. Everything else is a dev dependency, including `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `vue-eslint-parser`, `eslint-plugin-obsidianmd`, `eslint-plugin-oxlint` and `globals`. `npm install` must finish without `--force` / `--legacy-peer-deps`; `npm ls --all` exits 0.
- [ ] **Step 3: Probes.** Peer ranges allowed all of these pairs on 2026-11-19, so each probe checks real behaviour, not metadata:
  - `vue-tsc` × `typescript` 7: a scratch `.vue` file with a type error in `<script setup lang="ts">` **and** one in the template makes `npx vue-tsc --noEmit` exit non-zero naming both; exits 0 once fixed. Fallback: newest TypeScript 6.x.
  - `@stryker-mutator/vitest-runner` × `vitest`: a scratch function with one test → `npx stryker run` reports at least one killed mutant. Then enable `typescript-checker`; if it errors under the resolved TypeScript, drop the checker only.
  - `@nuxt/ui` × `vite` × `tailwindcss`: a scratch Vite app using `@nuxt/ui/vite` with `router: false` builds and its CSS output contains a Nuxt UI button class.
  - `@effect/vitest` × `vitest`: an `it.effect` test runs and passes.
  - `@tanstack/vue-form` × `vue`: a scratch component with `useForm` and one validated field, mounted with `@vue/test-utils` under happy-dom, shows the field error after submit and calls `onSubmit` once the value is valid.
- [ ] **Step 4:** Delete all scratch files. Set `manifest.json.minAppVersion` and `versions.json` to the installed `obsidian` version. Write ADR 0001: versions table, fallbacks, `isDesktopOnly` rationale, Prettier chosen over `oxfmt` while `oxfmt` is 0.x, re-check cadence (monthly and on each Obsidian minor release, via `npm outdated`).
- [ ] **Step 5:** Commit `chore: pin dependency baseline`.

### Task 2: Toolchain config and boundary enforcement

**Files:** Create `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `.prettierrc.json`, `fallow.json`, `vitest.config.ts`, `tests/unit/smoke.test.ts` (deleted in Task 3). Modify `package.json` scripts.

**Interfaces — Produces:** npm scripts `typecheck`, `lint`, `format`, `format:check`, `test`, `test:coverage`, `analyze`.

- [ ] **Step 1: Type checking.** Invariant: `npm run typecheck` (vue-tsc) covers `src/`, `tests/`, `harness/`, `scripts/` and all root config files. Discriminating check: plant a type error in one file of each of those five locations in turn; each must fail `typecheck`.
- [ ] **Step 2: oxlint.** `correctness`, `suspicious`, `perf` as errors; plugins `typescript`, `vue`, `import`, `unicorn`, `vitest`; `no-console: error` (off for `scripts/` and `src/infrastructure/logging/**`); `--deny-warnings`.
- [ ] **Step 2b: ESLint.** `eslint.config.mjs` (flat): `@eslint/js` recommended, `typescript-eslint` recommended-type-checked for `src/**`, `eslint-plugin-vue` recommended for `*.vue` (parser `vue-eslint-parser` with the TS parser), `eslint-plugin-obsidianmd` recommended for `src/**`, `max-lines` per Global Constraints, `no-restricted-syntax` banning `process.env` and any `import.meta.env` member other than `MODE` in `src/**`, and `eslint-plugin-oxlint` last (reading `.oxlintrc.json`). `lint` = `oxlint` then `eslint --max-warnings 0`. Discriminating checks: a generated `src/domain/_long.ts` with 401 lines of code fails `lint` naming `max-lines` and passes at 400; a generated `tests/unit/_long.test.ts` fails at 451 and passes at 450; `src/application/_env.ts` reading `process.env.X` fails. Delete the planted files.
- [ ] **Step 3: fallow.** `analyze` runs bare `fallow` (dead-code + dupes + health) with `fallow.json`: entries `src/main.ts`, `harness/main.ts`, `scripts/*.mjs`, config files; complexity ≤ 10; duplication min 50 tokens; `boundaries` zones `domain`, `application`, `infrastructure`, `presentation` with the inward-only rules from Global Constraints. Confirm option names with `npx fallow config-schema`.
- [ ] **Step 4: Discriminating boundary checks.** Each of these planted files must make `lint` or `analyze` exit non-zero naming the file, and the gate is green again after deleting it: `src/domain/_p.ts` importing `obsidian`; `src/domain/_p.ts` importing `../application/ports`; `src/application/_p.ts` with `import type { App } from "obsidian"`; `src/presentation/_p.ts` importing `effect`; `src/presentation/_p.ts` importing `../infrastructure/runtime`.
- [ ] **Step 5: Vitest.** Projects `unit` (`tests/unit/**/*.test.ts`, env `node`) and `dom` (`tests/dom/**/*.test.ts`, env `happy-dom`, plugins from `vite.shared.ts` once Task 7 creates it). Alias `obsidian` → a virtual module that throws `OBSIDIAN_REQUIRES_TEST_DOUBLE`; alias `@test/obsidian` → `tests/support/obsidian/index.ts`. Set `process.env.TZ = "UTC"` synchronously at the top of the config. Coverage: v8, thresholds from Global Constraints, reporters `text`, `html`, `cobertura`; add the `junit` reporter (to `reports/junit.xml`) when `process.env.TF_BUILD` is set.
- [ ] **Step 6:** `smoke.test.ts` asserts `1 + 1 === 2`. `typecheck`, `lint`, `format:check`, `test` all exit 0. Commit `chore: toolchain and import boundaries`.

### Task 3: Domain — settings schema

**Files:** Create `src/domain/settings.ts`, `tests/unit/domain/settings.test.ts`. Delete `tests/unit/smoke.test.ts`.

**Interfaces — Produces:**
- `SETTINGS_VERSION = 1`
- `type LogLevel = "error" | "warn" | "info" | "debug"`; `LOG_LEVELS` in that order
- `type Settings = { readonly schemaVersion: 1; readonly greeting: string; readonly showRibbonIcon: boolean; readonly logLevel: LogLevel }`
- `DEFAULT_SETTINGS: Settings` = `{ schemaVersion: 1, greeting: "Hello from <Plugin Name>", showRibbonIcon: true, logLevel: "warn" }`
- `GREETING_MAX_LENGTH = 200`
- `decodeSettings(raw: unknown): { settings: Settings; issues: readonly string[]; writable: boolean }`
- `validatePatch(current: Settings, patch: Partial<Omit<Settings, "schemaVersion">>): { ok: true; settings: Settings } | { ok: false; issues: readonly string[] }`

Effect 4 note, valid for every later task: Schema is the `effect/schema` subpath; service definition, Layer and runtime APIs were renamed against Effect 3. Read the installed version's type declarations and docs; do not write Effect 3 code from memory. Import from subpaths so the bundle tree-shakes.

- [ ] **Step 1: Failing tests** for `decodeSettings`:
  - `undefined`, `null` → `DEFAULT_SETTINGS`, `writable: true`, no issues (first run).
  - `"x"`, `42`, `[]` → `DEFAULT_SETTINGS`, `writable: true`, one issue.
  - a valid object → that value, no issues.
  - `{ schemaVersion: 1, greeting: 7, showRibbonIcon: false }` → default greeting, `showRibbonIcon: false`, one issue naming `greeting`.
  - greeting empty after trim, or longer than 200 → default greeting, one issue; a valid greeting is stored trimmed.
  - unknown keys dropped.
  - `logLevel: "verbose"` → `"warn"`, one issue naming `logLevel`; the other fields kept.
  - `schemaVersion: 2` → `DEFAULT_SETTINGS`, `writable: false`, one issue naming the version.
  - property (fast-check, `fc.anything()`): never throws; `decodeSettings(result.settings)` returns the same settings with no issues.
- [ ] **Step 2: Failing tests** for `validatePatch`: empty patch returns `current`; invalid greeting → `ok: false` with an issue; result always has `schemaVersion: 1`.
- [ ] **Step 3:** Run `npx vitest run --project unit tests/unit/domain` → FAIL. Implement. Run → PASS.
- [ ] **Step 4:** Commit `feat(domain): settings schema with per-field fallback`.

### Task 4: Application — ports, errors, service, use cases

**Files:** Create `src/application/{ports,errors,settings-service,use-cases,user-messages,defects}.ts`, `tests/unit/application/{settings-service,use-cases,user-messages,defects}.test.ts`, `tests/support/layers.ts`.

**Interfaces:**
- Consumes: Task 3 exports.
- Produces:
  - Errors (tagged): `StorageError { cause: unknown }`, `ReadOnlySettingsError { reason: "newer-version" | "unreadable" }`, `InvalidSettingsError { issues: readonly string[] }`, `VaultReadError { cause: unknown }`, `ClipboardError { cause: unknown }`; `type UpdateSettingsError = StorageError | ReadOnlySettingsError | InvalidSettingsError`.
  - Ports: `SettingsStore { load: Effect<unknown, StorageError>; save(data: unknown): Effect<void, StorageError> }`, `Notifier { notify(message: string): Effect<void> }`, `VaultReader { markdownFileCount: Effect<number, VaultReadError> }`.
  - `SettingsService { current: Effect<Settings>; status: Effect<{ writable: boolean; issues: readonly string[] }>; update(patch): Effect<Settings, UpdateSettingsError>; changes: Stream<Settings> }` — `changes` emits the current value first, then every change.
  - `SettingsServiceLive: Layer<SettingsService, never, SettingsStore | Notifier>` — building it never fails.
  - `type AppError = StorageError | ReadOnlySettingsError | InvalidSettingsError | VaultReadError | ClipboardError`.
  - Ports (error handling): `Logger { log(entry: LogEntry): Effect<void>; recent: Effect<readonly LogEntry[]> }` with `LogEntry = { level: LogLevel; event: string; context?: Record<string, unknown>; incidentId?: string }`; `Incidents { nextId: Effect<string> }`; `Clipboard { write(text: string): Effect<void, ClipboardError> }`; `HostInfo { pluginVersion: string; apiVersion: string; platform: string }` (a plain value service). `Notifier.notify` takes a `UserMessage` instead of a string (Task 5 renders it).
  - `user-messages.ts` and `reportDefect` per Error Handling; `buildDiagnostics: Effect<string, never, Logger | SettingsService | HostInfo>` (redacted report); use case `copyDiagnostics: Effect<void, never, …>` notifies success, or `describeError(ClipboardError)` on failure.
  - `type AppServices = SettingsService | Notifier | VaultReader | Logger | Incidents | Clipboard | HostInfo`.
  - Use cases: `updateGreeting(greeting: string): Effect<Settings, UpdateSettingsError, SettingsService>`, `setRibbonIconVisible(visible: boolean): Effect<Settings, UpdateSettingsError, SettingsService>`, `showGreeting: Effect<void, never, SettingsService | Notifier>`, `countMarkdownFiles: Effect<number, VaultReadError, VaultReader>`.
  - `tests/support/layers.ts`: `inMemoryStore(options?: { initial?: unknown; failLoad?: boolean; failSave?: boolean })` → `{ layer, saved(): unknown[] }`; `recordingNotifier()` → `{ layer, messages(): string[] }`; `fixedVault(count: number | "fail")` → layer.

- [ ] **Step 1: Failing tests** (`@effect/vitest`, `it.effect`):
  - empty store → `current` = defaults, `status.writable`, nothing saved, nothing notified.
  - one invalid field → fallback used, exactly one notification, nothing saved until `update`.
  - `update({ greeting: "Yo" })` → returns new settings; store saved exactly once; `changes` emits the new value.
  - `update({ greeting: "" })` → `InvalidSettingsError`; store untouched; `current` unchanged.
  - `schemaVersion: 2` in store → `status.writable === false`; `update` fails `ReadOnlySettingsError { reason: "newer-version" }`; store never written.
  - `failLoad` → defaults, `writable: false`, one notification, `update` fails `ReadOnlySettingsError { reason: "unreadable" }`; store never written (Review Focus 2).
  - `failSave` → `update` fails `StorageError` and `current` is unchanged.
  - two concurrent `update` calls → both applied, saves happen in order, final `current` contains both patches.
  - use cases: `showGreeting` notifies the current greeting; `countMarkdownFiles` returns the count / fails `VaultReadError`.
  - `describeError`: one test per tag — non-empty German `title` and `detail`, the expected `action` (`VaultReadError` → `retry`, `ReadOnlySettingsError` → `copy-diagnostics`, `InvalidSettingsError` → none, detail lists the issues); no message contains `Error`, `stack`, `/`, `\\` or the raw cause's message (property test with `fc.string()` causes).
  - `reportDefect(new Error("secret /vault/a.md"))` → exactly one `error` log entry carrying the cause and the incident id, one notification whose detail contains the incident id and not the cause text; returns that message.
  - `Logger` respects `logLevel`: at `warn`, `info`/`debug` entries are dropped; a `changes` emission to `debug` takes effect without reload.
  - `buildDiagnostics`: contains plugin version, `apiVersion`, writable status and the last entries; redacts `content`/`path` values and strings > 200 chars; never more than 50 entries.
- [ ] **Step 2–4:** run → FAIL; implement; run → PASS. Commit `feat(application): settings service, ports and use cases`.

### Task 5: Obsidian test double and infrastructure layers

**Files:** Create `tests/support/obsidian/{index,component,plugin,app,workspace,vault,views,settings,dom}.ts`, `src/infrastructure/obsidian/layers.ts`, `src/infrastructure/runtime.ts`, `tests/unit/infrastructure/{layers,runtime}.test.ts`.

**Interfaces:**
- Consumes: Task 4 ports and `SettingsServiceLive`.
- Produces:
  - Test double for the `obsidian` exports this plan uses, opted into per suite with `vi.mock("obsidian", () => import("@test/obsidian"))`:
    - `Component` with real semantics: `load()`, `unload()` (calls `onunload`, then runs `register` callbacks and releases `registerEvent` refs in reverse order).
    - `Plugin extends Component`: `loadData`, `saveData`, `addCommand`, `addRibbonIcon` (returns an `HTMLElement`), `addSettingTab`, `registerView`, `app`, `manifest`; registrations made through these are cleared by `unload()` as Obsidian does; `createTestPlugin(PluginClass, options?: { data?: unknown; failLoadData?: boolean })` returns `{ plugin, registry }` where `registry` exposes `commands`, `views`, `settingTabs`, `ribbonIcons`, `notices`, and `runCommand(id)`.
    - `ItemView`, `WorkspaceLeaf` (`openIn(document?: Document)` to simulate a pop-out), `PluginSettingTab`, `Setting` (`setName`, `setDesc`, `addText`, `addToggle`, `setDisabled`), `Notice`.
    - `App.workspace`: `on`, `offref`, `getLeavesOfType`, `getLeaf`, `revealLeaf`; `App.vault.getMarkdownFiles()`.
    - `installDomExtensions(window)` adding `empty`, `createEl`, `createDiv`, `setText`, `addClass`, `removeClass`, `toggleClass` (only for `dom` tests).
  - `obsidianLayer(plugin: Plugin): Layer<SettingsStore | Notifier | VaultReader | Clipboard | HostInfo>` — `Notifier` renders a `UserMessage` as one `Notice` (title bold, detail below, built with DOM extensions, never `innerHTML`), errors stay up longer than info.
  - `src/infrastructure/logging/{ring-buffer-logger,console-sink}.ts`: `loggerLayer(level: () => LogLevel)` keeping the last 50 entries and writing to the console sink (the only allowed `console` use); `incidentsLayer` (short random ids, deterministic in tests).
  - `makeRuntime(layer: Layer<AppServices>): AppRuntime`; `type AppRuntime = ManagedRuntime<AppServices, never>`; `appLayer(plugin: Plugin): Layer<AppServices>` (= `SettingsServiceLive` over `obsidianLayer`).

- [ ] **Step 1: Failing tests:** `save` calls `plugin.saveData` with the value; a rejected `loadData` becomes `StorageError`; `notify` creates one `Notice` with the message; `VaultReader` returns the double's count and maps a throw to `VaultReadError`; `makeRuntime(appLayer(plugin))` runs `showGreeting`; after `runtime.dispose()` running an effect rejects.
- [ ] **Step 2–4:** fail → implement → pass. Commit `feat(infrastructure): obsidian layers and managed runtime`.

### Task 6: Plugin entry, lifecycle, commands, settings tab

**Files:** Create `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/obsidian/{commands,settings-tab}.ts`, `tests/dom/{lifecycle,settings-tab}.test.ts`.

**Interfaces:**
- Consumes: `appLayer`, `makeRuntime` (Task 5); use cases (Task 4). `ShellView` arrives in Task 8 — register a bare `ItemView` subclass under `SHELL_VIEW_TYPE` now.
- Produces: `bootstrap(plugin: Plugin): Promise<{ dispose(): Promise<void> }>`; `SHELL_VIEW_TYPE = "<plugin-id>-view"`; command ids `open-view`, `show-greeting`, `copy-diagnostics`. Every command callback runs through one `runCommand` helper that routes defects to `reportDefect`.

- [ ] **Step 1: Failing tests (`lifecycle.test.ts`):**
  - after `load()`: exactly 3 commands, 1 view type, 1 settings tab, 1 ribbon icon (default settings).
  - a command whose effect dies → one notice with an incident id, one `error` log entry, the plugin stays usable (the next command works).
  - `copy-diagnostics` writes the redacted report to the double's clipboard and notifies success; a failing clipboard shows the `ClipboardError` message.
  - `runCommand("show-greeting")` produces one notice with the greeting.
  - `setRibbonIconVisible(false)` removes the ribbon icon without reload; `true` adds exactly one back.
  - `unload()` → runtime disposed (running an effect rejects), settings subscription stopped (a later store change triggers nothing), ribbon element removed.
  - **Review Focus 1:** `load → unload → load → unload` on one instance: counts after the second load equal the first; nothing owned by the plugin survives the second unload.
  - **Review Focus 1:** `unload()` called while `load()` is still awaiting `loadData` → once the load settles, the runtime is disposed and nothing is registered.
  - **Review Focus 2:** `failLoadData` → plugin loads, commands exist, one notice explains settings are read-only.
  - a registration that throws during bootstrap (make the double's `addCommand` throw once) → everything created so far is disposed, one notice shows `describeDefect` (plugin name, incident id, no raw error), the error is rethrown.
- [ ] **Step 2: Failing tests (`settings-tab.test.ts`):** `display()` renders one `Setting` per field (greeting text, ribbon toggle, log level dropdown); editing the greeting calls `updateGreeting`; an `InvalidSettingsError` puts the issue in the setting description and saves nothing; read-only status disables both controls and shows the reason; `hide()` then `display()` does not duplicate rows.
- [ ] **Step 3:** Implement. `main.ts` only creates and disposes the bootstrap handle (`onunload` is synchronous: start disposal, attach a catch that reports through `Notice`). No default hotkeys.
- [ ] **Step 4:** Pass. Commit `feat: plugin lifecycle, commands and settings tab`.

### Task 7: Build pipeline, CSS ownership, dist invariants, dev install

**Files:** Create `vite.shared.ts`, `vite.config.ts`, `scripts/{scope-css,check-dist,dev-install}.mjs`, `src/styles/{app,tokens,bridge}.css`, `tests/unit/scripts/{scope-css,check-dist}.test.ts`. Scripts: `build`, `check:dist`, `dev`.

**Interfaces — Produces:**
- `sharedConfig(): UserConfig` — `@vitejs/plugin-vue`, `@nuxt/ui/vite` with `router: false`, `colorMode: false`, `autoImport: false`, `components: false`, `theme.prefix: "<css-prefix>"`, icons in `svg` mode from a reviewed local list of `lucide:*` names (every icon Nuxt UI's used components default to, plus the ones this shell uses); PostCSS plugin `scopeCss`; defines `process.env.NODE_ENV`, `import.meta.dev: false`, `__VUE_OPTIONS_API__: true` (third-party components may use it), `__VUE_PROD_DEVTOOLS__: false`.
- `scopeCss(options: { id: string; prefix: string; skip?: (file: string) => boolean }): postcss.Plugin`; `SCOPE_CLASS = "<plugin-id>-root"`.
- `checkDist(dir: string, rootManifest: object, options: { id: string; prefix: string }): string[]` (violations; empty = pass), also runnable as CLI.

- [ ] **Step 1: Failing tests for `scopeCss`** (input → output, compared after normalising whitespace):
  - `.a{}` → `.<id>-root .a{}`.
  - `:root{--x:1}` and `:host{--x:1}` → `.<id>-root{--x:1}`.
  - `.dark{--x:1}` and `.light{--x:1}` → `.<id>-root.dark{--x:1}` / `.light` (theme class sits on the root itself).
  - `html`, `body`, `*` at the start of a selector → scoped under the root, never emitted bare.
  - `@layer base{.a{}}` → `.<id>-root .a{}` with no `@layer` left; empty `@layer a, b;` statements removed.
  - `@keyframes spin` → `@keyframes <prefix>-spin`, and `animation: spin 1s` / `animation-name: spin` rewritten to match; an already prefixed name is left alone.
  - `@property --tw-x` → `@property --<prefix>-tw-x`, with every declaration and `var()` use renamed consistently.
  - a selector already starting with `.<id>-root` is not prefixed twice.
  - selectors inside `@media` / `@supports` / `@container` are scoped; keyframe steps (`from`, `50%`) are not.
  - files matched by `skip` (the harness's fake host CSS) are untouched.
- [ ] **Step 2: Failing tests for `checkDist`** on temp-dir fixtures: passes a valid fixture; reports each of — a missing file; an extra file; `manifest.json` differing from root; `main.js` not assigning a default CJS export; a remaining `require("vue")` or `require("effect")`; a string literal fetch/XHR target starting with `http`; an unscoped selector; a surviving `@layer`; an unprefixed `@keyframes` / `@property`; `main.js` > 1.5 MB or `styles.css` > 250 KB (budgets live in one exported constant).
- [ ] **Step 3:** Implement both. `app.css` imports Tailwind's theme and utilities **without preflight**, Nuxt UI's CSS, `tokens.css` (plugin tokens mapped from Obsidian variables: `--background-primary`, `--background-secondary`, `--background-modifier-border`, `--text-normal`, `--text-muted`, `--text-on-accent`, `--interactive-accent`, `--text-error`, `--text-success`, `--text-warning`, `--font-interface`, `--font-monospace`, `--radius-s`) and `bridge.css` (Nuxt UI `--ui-*` roles set from those tokens, plus a minimal owned reset: `box-sizing`, zero default borders, `button`/`input` font inheritance, focus-visible outline, a `forced-colors` block).
- [ ] **Step 4:** `vite.config.ts`: lib build of `src/main.ts`, format `cjs`, file name `main.js`, CSS emitted as `styles.css` (`cssCodeSplit: false`), externals per Global Constraints, default export, no code splitting, target `es2022`, minified, inline sourcemap only with `--mode development`; copies `manifest.json` to `dist/`. Wire `vite.shared.ts` into the `dom` Vitest project.
- [ ] **Step 5:** `npm run build` then `npm run check:dist` exit 0.
- [ ] **Step 6:** `dev-install.mjs`: watch build in development mode; after each successful build copy `dist/*` to `OBSIDIAN_PLUGIN_DIR` and create `.hotreload` there; if the variable is unset, build only and print how to set it. Commit `build: plugin bundle, CSS ownership and dist invariants`.

### Task 8: Vue + Nuxt UI surface inside an Obsidian view

**Files:** Create `src/infrastructure/obsidian/shell-view.ts`, `src/presentation/{mount,theme}.ts`, `src/presentation/runtime/use-runtime.ts`, `src/presentation/components/{ShellApp,ShellPanel}.vue`; tests `tests/dom/{mount,theme,shell-panel,shell-view}.test.ts`.

**Interfaces:**
- Consumes: `AppRuntime` (Task 5), use cases (Task 4), `SCOPE_CLASS` (Task 7), `tests/support/layers.ts`.
- Produces:
  - `mountSurface(root: HTMLElement, runtime: AppRuntime): () => void` — one Vue app per call, using Nuxt UI's Vue plugin; mounts into a detached element created with `root.ownerDocument`, then attaches it; adds `SCOPE_CLASS` to `root`; sets a unique `app.config.idPrefix` per mount; sets `app.config.errorHandler` to `reportDefect` (a throwing component shows the defect message, the rest of the surface keeps working); returns an idempotent close that runs every release in reverse order even if one throws, then rethrows the first error.
  - `ShellApp.vue` — wraps content in `UApp` with `:portal` set to an element inside `root` and the global toaster disabled (notifications go through `Notifier`). Nuxt UI components are imported explicitly (`@nuxt/ui/components/Button.vue`), never auto-registered.
  - `bindHostTheme(root: HTMLElement): () => void` — mirrors `theme-dark` / `theme-light` on `root.ownerDocument.body` to `dark` / `light` on `root`, using the `MutationObserver` of `root.ownerDocument.defaultView`; release disconnects and restores the original classes.
  - `useEffectAction<Args extends unknown[], A, E>(fn: (...args: Args) => Effect<A, E, AppServices>): { run(...args: Args): Promise<void>; pending: Ref<boolean>; value: Ref<A | undefined>; error: Ref<E | undefined> }` — never rejects; a typed failure lands in `error` and its `describeError` result in `message: Ref<UserMessage | undefined>`; a defect goes through `reportDefect` exactly once and leaves `error` undefined; a result arriving after the component unmounted is dropped; a second `run` while pending interrupts the first.
  - `useSettings(): Readonly<Ref<Settings>>` — follows `SettingsService.changes`, stops with the component scope.
  - `ShellView extends ItemView` — type `SHELL_VIEW_TYPE`, display text `<Plugin Name>`, icon `layout-dashboard`; mounts into `contentEl` in `onOpen`, closes in `onClose`.
  - `ShellPanel.vue` — `UCard` showing the greeting (`useSettings`); markdown file count via `countMarkdownFiles` on mount (`USkeleton` while pending, on `VaultReadError` a `UAlert` rendering the `UserMessage` — title, detail, and its `retry` action as a button; a shared `ErrorNotice.vue` renders any `UserMessage` and its action so every later view shows errors the same way); a greeting form built with TanStack Form (`useForm` from `@tanstack/vue-form`, rendered with `UFormField` + `UInput` + `UButton`, never Nuxt UI's own `UForm` validation): the field validator calls the domain's `validatePatch` so client and service share one rule, submit runs `updateGreeting` through `useEffectAction`, an `InvalidSettingsError` from the service is mapped onto the field's errors, `ReadOnlySettingsError` shows a read-only hint, and the submit button is disabled while the form is invalid or submitting; a `UModal` "About" dialog.
  - Forms rule (all later features): every user-editable form in `presentation` uses TanStack Form; validation rules live in `domain` and are reused by the form's validators, never duplicated in components. The Obsidian settings tab keeps the native `Setting` API (guideline) and is not a TanStack form.

- [ ] **Step 1: Failing tests:**
  - `mount.test.ts`: a child component that throws during render → `reportDefect` called once, one notice with an incident id, the surface's other content still rendered;
  - `mount.test.ts`: renders the panel; `root` carries `SCOPE_CLASS`; closing twice is a no-op the second time; after close `root` has no children and no added classes; a throwing release still lets the others run and the error surfaces; `document.head.childElementCount` is the same before mount, after mount and after opening the modal (CSS ownership). **Review Focus 5:** two roots mounted on one runtime, close the first → the second still updates when `updateGreeting` runs.
  - **Review Focus 4:** mount into a root that belongs to `document.implementation.createHTMLDocument()`; open the modal → its content is a descendant of that root and the main `document.body` gained no children.
  - `theme.test.ts` (**Review Focus 3**): toggling `theme-dark` on the owner body flips `dark`/`light` on `root` with no remount; after release, further toggles change nothing and the original classes are restored.
  - `shell-panel.test.ts`: skeleton then count; `fixedVault("fail")` shows the alert and retry succeeds after the layer recovers; empty greeting shows the issue and saves nothing (the form validator blocks submit, `updateGreeting` is never called); an over-long greeting shows the same issue text the domain produces; a service-side `InvalidSettingsError` (layer rejects a value the form accepted) appears under the field; the submit button is disabled while submitting; valid submit updates the visible greeting; read-only store shows the hint and disables the button; unmount during a pending count causes no state write or warning.
  - `shell-view.test.ts`: `onOpen` mounts once; `onClose` closes; `open-view` reveals the existing leaf instead of creating a second; plugin `unload()` with an open view releases its app before the runtime is disposed.
- [ ] **Step 2–3:** fail → implement. If the head-injection assertion fails, the known cause is Nuxt UI's runtime `colors` and `head` plugins writing a `<style>` to the document head: replace both with a no-op through a `resolveId` build plugin in `vite.shared.ts`, compile the colour roles into `bridge.css`, and pin the sha256 of each replaced file so a Nuxt UI upgrade fails the build loudly instead of silently changing behaviour. Record it in ADR 0001.
- [ ] **Step 4:** All tests pass; `npm run build` and `npm run check:dist` exit 0 against real Nuxt UI output. Commit `feat(presentation): Nuxt UI surface in an Obsidian view`.

### Task 9: Browser harness for UI work

**Files:** Create `harness/{index.html,main.ts,layers.ts,fake-host.css}`, `vite.harness.config.ts`, `tests/unit/harness-layers.test.ts`. Script `dev:ui`.

**Interfaces — Produces:** `harnessLayer(scenario: "default" | "empty" | "error" | "slow" | "readonly"): Layer<AppServices>`; scenario selected by `?scenario=`; unknown values fall back to `default`.

- [ ] **Step 1: Failing test:** `countMarkdownFiles` gives 42 / 0 / `VaultReadError` / 42 after 1500 ms (test clock) per scenario; `readonly` makes `updateGreeting` fail `ReadOnlySettingsError`; importing `harness/layers.ts` never touches `obsidian` (the throwing alias proves it).
- [ ] **Step 2–3:** Implement. `fake-host.css` defines the Obsidian variables used by `tokens.css` for `body.theme-light` and `body.theme-dark`; the page has a theme toggle and mounts two surfaces side by side, the second at 320 px width.
- [ ] **Step 4:** `npx vite build --config vite.harness.config.ts` exits 0. Commit `feat: browser harness with scenarios`.

### Task 10: Mutation testing

**Files:** Create `stryker.config.mjs`, `vitest.stryker.config.ts`. Scripts `test:mutation` (incremental) and `test:mutation:full` (incremental mode off; confirm the flag with `npx stryker run --help`).

- [ ] **Step 1:** Config: `testRunner: "vitest"` using `vitest.stryker.config.ts` (node environment, `tests/unit/{domain,application}/**` only, no coverage); `checkers: ["typescript"]` unless ADR 0001 dropped it; `mutate: ["src/domain/**/*.ts", "src/application/**/*.ts"]`; `thresholds: { high: 90, low: 80, break: 75 }`; incremental file `reports/stryker-incremental.json`; reporters `clear-text`, `progress`, `html`, `json` into `reports/mutation/`.
- [ ] **Step 2: Discriminating check:** remove the `schemaVersion: 2` assertions from Task 3; `npm run test:mutation:full` must list a surviving mutant in `decodeSettings`. Restore the assertions.
- [ ] **Step 3:** `npm run test:mutation:full` exits 0. Below `break`: add tests. Never lower thresholds; a `// Stryker disable` needs a reason on the same line. Commit `test: mutation testing with stryker`.

### Task 11: Quality gate, hooks, Azure Pipelines, release

**Files:** Create `scripts/{verify,version-bump,package-release,install-hooks}.mjs`, `tests/unit/scripts/{version-bump,package-release,verify}.test.ts`, `.githooks/pre-push`, `azure-pipelines.yml`, `pipelines/{nightly-mutation,release}.yml`, `.azuredevops/pull_request_template.md`, `docs/azure-devops-setup.md`. Scripts: `verify`, `verify:full`, `version`, `release:package`, `prepare`.

**Interfaces — Produces:**
- `bumpVersion(pkgVersion: string, manifest: Manifest, versions: Record<string, string>): { manifest: Manifest; versions: Record<string, string> }`
- `packageRelease(options: { distDir: string; outDir: string; tag?: string }): { folder: string; version: string }`
- `runSteps(steps: { name: string; command: string; args: string[] }[], spawn?): Promise<{ name: string; code: number; ms: number }[]>`

- [ ] **Step 1: Failing tests:**
  - `bumpVersion`: sets `manifest.version`; adds `versions[new] = manifest.minAppVersion`; keeps existing entries; rejects non-semver and versions not greater than the current one.
  - `packageRelease`: creates `<outDir>/<plugin-id>/` with exactly `main.js`, `manifest.json`, `styles.css`; throws when `tag` ≠ manifest version, when a `v` prefix is present, or when a file is missing.
  - `runSteps` (fake spawn): runs in order, stops at the first non-zero code and returns it, later steps not started.
- [ ] **Step 2:** Implement. `verify.mjs` order: `format:check → lint (oxlint, then ESLint) → typecheck → test:coverage → analyze → build → check:dist`; `stdio: "inherit"`; prints a summary table with timings; process exit code = the failing step's code. `verify:full` appends `test:mutation`. `install-hooks.mjs` sets `core.hooksPath=.githooks` and does nothing outside a git work tree or when `TF_BUILD`/`CI` is set. `.githooks/pre-push` runs `npm run verify`.
- [ ] **Step 3: Pipelines** (logic stays in the npm scripts; YAML only orchestrates, one job each):
  - `azure-pipelines.yml` — `trigger` on `main`; pool from Inputs; `NodeTool@0` reading `.nvmrc`; `Cache@2` for the npm cache keyed on `package-lock.json`; `npm ci`; `npm run verify`; then with `condition: succeededOrFailed()`: `PublishTestResults@2` (`reports/junit.xml`) and `PublishCodeCoverageResults@2` (cobertura); on success publish `dist/` as pipeline artifact `plugin`.
  - `pipelines/nightly-mutation.yml` — `trigger: none`, `schedules` cron nightly on `main` with `always: false`; `npm ci`; `npm run test:mutation:full`; publish `reports/mutation` as an artifact even on failure.
  - `pipelines/release.yml` — `trigger` on tags `*.*.*` only (bare semver, no `v`); `npm ci`; `npm run verify`; `npm run release:package -- --tag $(Build.SourceBranchName)`; publish `release/<plugin-id>` as pipeline artifact `<plugin-id>-$(Build.SourceBranchName)`; if the feed input was given, also `UniversalPackages@0` publish with the same version.
- [ ] **Step 4:** `docs/azure-devops-setup.md` — developer steps the agent must not perform: create the Azure Repos repository and push; create the three pipelines from the YAML files; add a **Build Validation** branch policy on `main` pointing at the CI pipeline (Azure Repos ignores a YAML `pr:` trigger, so without this policy PRs are not gated); require squash merge and at least one reviewer; then prove the policy with a real PR containing a planted type error and confirm completion is blocked. Note that listing in Obsidian's public community directory requires GitHub releases and is out of scope; distribution is the release artifact copied to `<vault>/.obsidian/plugins/<plugin-id>/`.
- [ ] **Step 5: Discriminating check:** plant a type error in `src/domain/settings.ts`; run `npm run verify` and read the exit code — non-zero, summary names `typecheck`, later steps not run. Revert; `npm run verify` exits 0.
- [ ] **Step 6:** Commit `ci: quality gate, hooks and Azure Pipelines`.

### Task 12: Developer documentation and acceptance

**Files:** Create/complete `README.md`, `AGENTS.md`, `CLAUDE.md` (single line `@AGENTS.md`), `docs/{architecture,adding-a-feature,testing,releasing,error-handling}.md`, `docs/decisions/0002-architecture.md`, `docs/decisions/0003-error-handling-and-twelve-factor.md`.

- [ ] **Step 0:** `docs/error-handling.md` — the two failure kinds, how to add an error (tag → `AppError` → `describeError` text → test), message writing rules with good/bad examples, the defect path and incident ids, logging levels and event naming, diagnostics and redaction. ADR 0003 — the error taxonomy and the Twelve-Factor table above, including why VII/VIII do not apply.

- [ ] **Step 1:** `README.md` — what it is, prerequisites, `npm ci`, `.env.local` + `npm run dev`, `npm run dev:ui` with the scenario list, script table, folder map, links to docs.
- [ ] **Step 2:** `AGENTS.md` — layer rules and import boundaries; tests first; the gate and the exit-code rule; Obsidian guideline rules; Effect 4 note; CSS ownership rules (no preflight, no global selectors, explicit Nuxt UI imports, new icons go into the local icon list); the forms rule (TanStack Form for every presentation form, validators reuse domain rules); the error handling rules (every expected failure is a tagged `AppError` with a `describeError` text, defects go through `reportDefect`, no `console` outside the logging sink, no note content in logs); the file length limits; where the test double and support layers live; how to run one test or one project; commit conventions.
- [ ] **Step 3:** `docs/adding-a-feature.md` — the walking skeleton as the worked example: schema in `domain` → port + service + use case in `application` → adapter Layer in `infrastructure/obsidian` → component calling the use case through `useEffectAction` → registration in `bootstrap.ts` → tests per layer → harness scenario. Ends with the five Review Focus items as a checklist for any new view.
- [ ] **Step 4:** `docs/architecture.md` — Mermaid dependency diagram of the layers and a lifecycle sequence (`onload` → runtime → registrations → view mount; `onunload` → views closed → subscriptions → runtime disposed). `docs/testing.md` — test projects, the double, mutation testing, and the manual checklist from Step 7. `docs/releasing.md` — `npm version <x.y.z>` (runs `version-bump`), tag without `v`, push tag, release pipeline, install from artifact. ADR 0002 — layering, presentation calling use cases instead of importing `effect`, no Pinia until cross-view client state appears, CSS ownership approach.
- [ ] **Step 5: Final acceptance (agent):** clone the working repository into a temp directory → `npm ci` → `npm run verify:full` exits 0. Then confirm: no `TODO`/`FIXME`, no skipped or focused tests, no lint/type suppression without a reason, no scratch files from Task 1.
- [ ] **Step 6:** `npm run format:check` exits 0. Commit `docs: developer and agent documentation`.
- [ ] **Step 7: Hand-over (developer, reported as `not-run`):** install `dist/` into a test vault and enable the plugin; run "Open view"; switch light/dark with the view open; move the view to a pop-out window and open the About dialog there; open two tabs and close one; edit settings including an invalid greeting; disable and re-enable three times; check the developer console is clean; then follow `docs/azure-devops-setup.md`.

---

## Definition of Done for one blueprint run

- `npm run verify:full` is green from a fresh clone.
- ADR 0001 lists every resolved version and every fallback with its blocker.
- All five Review Focus items have passing tests in the tasks named above.
- Final report: versions installed, fallbacks taken, gate step timings, coverage and mutation score, bundle sizes, and the `not-run` list (manual Obsidian checks, Azure DevOps setup and policy proof).
